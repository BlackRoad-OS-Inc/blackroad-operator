"""Tests for BlackRoad Experiment Tracker."""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

os.environ["EXPERIMENT_DB"] = str(Path(tempfile.mkdtemp()) / "test_experiments.db")
sys.path.insert(0, str(Path(__file__).parent))
from main import Experiment, ExperimentTracker, init_db


class TestExperimentTracker(unittest.TestCase):
    def setUp(self):
        init_db()
        self.tracker = ExperimentTracker()

    def test_create_experiment(self):
        exp = self.tracker.create("Run 1", "resnet50", hyperparams={"lr": 0.001, "epochs": 10})
        self.assertIsNotNone(exp.id)
        self.assertEqual(exp.model, "resnet50")
        self.assertEqual(exp.status, "running")

    def test_log_metric(self):
        exp = self.tracker.create("Metric Test", "bert")
        self.tracker.log_metric(exp.id, "accuracy", 0.85, step=1)
        self.tracker.log_metric(exp.id, "accuracy", 0.90, step=2)
        loaded = self.tracker.get(exp.id)
        self.assertIn("accuracy", loaded.metrics)
        self.assertEqual(len(loaded.metrics["accuracy"]), 2)

    def test_finish_experiment(self):
        exp = self.tracker.create("Finish Test", "gpt2")
        self.tracker.finish(exp.id, status="completed")
        loaded = self.tracker.get(exp.id)
        self.assertEqual(loaded.status, "completed")

    def test_compare_experiments(self):
        e1 = self.tracker.create("Exp A", "model_v1", hyperparams={"lr": 0.001})
        e2 = self.tracker.create("Exp B", "model_v2", hyperparams={"lr": 0.01})
        self.tracker.log_metric(e1.id, "f1", 0.8)
        self.tracker.log_metric(e2.id, "f1", 0.9)
        cmp = self.tracker.compare([e1.id, e2.id])
        self.assertIn("metric_comparison", cmp)
        self.assertIn("f1", cmp["metric_comparison"])

    def test_best_run(self):
        e1 = self.tracker.create("Best A", "m1")
        e2 = self.tracker.create("Best B", "m2")
        self.tracker.log_metric(e1.id, "acc", 0.75)
        self.tracker.log_metric(e2.id, "acc", 0.92)
        self.tracker.finish(e1.id)
        self.tracker.finish(e2.id)
        best = self.tracker.best_run("acc", maximize=True)
        self.assertIsNotNone(best)
        self.assertEqual(best["id"], e2.id)

    def test_export_report(self):
        tmp = Path(tempfile.mkdtemp())
        exp = self.tracker.create("Report Test", "xgboost", hyperparams={"n_estimators": 100})
        self.tracker.log_metric(exp.id, "rmse", 0.15, step=1)
        self.tracker.log_metric(exp.id, "rmse", 0.12, step=2)
        out = self.tracker.export_report(exp.id, output_path=str(tmp / "report.md"))
        self.assertTrue(Path(out).exists())
        content = Path(out).read_text()
        self.assertIn("xgboost", content)
    def test_list_by_status(self):
        e1 = self.tracker.create("Running", "modelA")
        e2 = self.tracker.create("Completed", "modelB")
        self.tracker.finish(e2.id)
        completed = self.tracker.list(status="completed")
        ids = [e["id"] for e in completed]
        self.assertIn(e2.id, ids)


class TestExperimentTrackerE2E(unittest.TestCase):
    """End-to-end tests that invoke main.py as a subprocess, matching CLI docs."""

    _db_dir: Path

    @classmethod
    def setUpClass(cls) -> None:
        cls._db_dir = Path(tempfile.mkdtemp())
        cls._env = {**os.environ, "EXPERIMENT_DB": str(cls._db_dir / "e2e.db")}
        cls._cmd = [sys.executable, str(Path(__file__).parent / "main.py")]

    def _run(self, *args: str) -> dict:
        result = subprocess.run(
            self._cmd + list(args),
            capture_output=True, text=True, env=self._env,
        )
        self.assertEqual(result.returncode, 0, msg=result.stderr)
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as exc:
            self.fail(f"Command {args!r} returned non-JSON output: {result.stdout!r} ({exc})")

    def test_e2e_create_returns_id(self):
        data = self._run("create", "E2E Run", "resnet50",
                         "--hyperparams", '{"lr": 0.001, "epochs": 5}')
        self.assertIn("id", data)
        self.assertEqual(data["status"], "running")
        self.assertEqual(data["model"], "resnet50")

    def test_e2e_log_finish_best(self):
        e1 = self._run("create", "E2E A", "m1")
        e2 = self._run("create", "E2E B", "m2")
        for eid, acc in [(e1["id"], 0.75), (e2["id"], 0.92)]:
            result = subprocess.run(
                self._cmd + ["log", eid, "accuracy", str(acc), "--step", "1"],
                capture_output=True, text=True, env=self._env,
            )
            self.assertEqual(result.returncode, 0)
            result = subprocess.run(
                self._cmd + ["finish", eid],
                capture_output=True, text=True, env=self._env,
            )
            self.assertEqual(result.returncode, 0)
        best = self._run("best", "accuracy")
        self.assertEqual(best["id"], e2["id"])
        self.assertAlmostEqual(best["best_value"], 0.92)

    def test_e2e_compare(self):
        e1 = self._run("create", "Cmp A", "net1", "--hyperparams", '{"lr": 0.01}')
        e2 = self._run("create", "Cmp B", "net2", "--hyperparams", '{"lr": 0.001}')
        for eid, f1 in [(e1["id"], 0.80), (e2["id"], 0.88)]:
            r = subprocess.run(
                self._cmd + ["log", eid, "f1", str(f1)],
                capture_output=True, text=True, env=self._env,
            )
            self.assertEqual(r.returncode, 0, msg=r.stderr)
        cmp = self._run("compare", e1["id"], e2["id"])
        self.assertIn("f1", cmp["metric_comparison"])
        self.assertIn("lr", cmp["hyperparam_comparison"])

    def test_e2e_report_creates_file(self):
        exp = self._run("create", "Report E2E", "xgboost",
                        "--hyperparams", '{"n_estimators": 100}')
        eid = exp["id"]
        r = subprocess.run(self._cmd + ["log", eid, "rmse", "0.15", "--step", "1"],
                           capture_output=True, text=True, env=self._env)
        self.assertEqual(r.returncode, 0, msg=r.stderr)
        out_path = str(self._db_dir / "e2e_report.md")
        result = subprocess.run(
            self._cmd + ["report", eid, "--output", out_path],
            capture_output=True, text=True, env=self._env,
        )
        self.assertEqual(result.returncode, 0)
        content = Path(out_path).read_text()
        self.assertIn("xgboost", content)
        self.assertIn("rmse", content)


if __name__ == "__main__":
    unittest.main()
