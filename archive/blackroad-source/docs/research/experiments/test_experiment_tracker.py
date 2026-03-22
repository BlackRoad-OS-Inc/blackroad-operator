"""Tests for src/experiment_tracker.py"""
from __future__ import annotations
import math
from pathlib import Path

import pytest

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.experiment_tracker import Experiment, ExperimentTracker, _make_run_id


# ── fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def tracker(tmp_path: Path) -> ExperimentTracker:
    return ExperimentTracker(db_path=tmp_path / "test_experiments.db")


@pytest.fixture
def completed_run(tracker: ExperimentTracker) -> str:
    run_id = tracker.start_run("sweep", {"lr": 1e-3, "batch": 32})
    for epoch in range(5):
        tracker.log_metric("loss",     2.0 - epoch * 0.3, step=epoch)
        tracker.log_metric("accuracy", 0.5 + epoch * 0.1, step=epoch)
    tracker.end_run("completed")
    return run_id


# ── run lifecycle ─────────────────────────────────────────────────────────────

class TestRunLifecycle:
    def test_start_run_returns_id(self, tracker):
        run_id = tracker.start_run("test_exp", {"lr": 0.01})
        assert isinstance(run_id, str)
        assert len(run_id) > 10

    def test_start_sets_active_run(self, tracker):
        run_id = tracker.start_run("exp")
        assert tracker._active_run_id == run_id

    def test_end_run_clears_active(self, tracker):
        tracker.start_run("exp")
        tracker.end_run("completed")
        assert tracker._active_run_id is None

    def test_end_run_sets_status(self, tracker, completed_run):
        exp = tracker.get_run(completed_run)
        assert exp.status == "completed"

    def test_end_run_records_duration(self, tracker, completed_run):
        exp = tracker.get_run(completed_run)
        assert exp.duration_s is not None
        assert exp.duration_s >= 0.0

    def test_params_persisted(self, tracker):
        run_id = tracker.start_run("p_test", {"alpha": 0.5, "beta": 10})
        tracker.end_run()
        exp = tracker.get_run(run_id)
        assert exp.params["alpha"] == pytest.approx(0.5)
        assert exp.params["beta"] == 10

    def test_tags_persisted(self, tracker):
        run_id = tracker.start_run("t_test", tags={"dataset": "mnist"})
        tracker.end_run()
        exp = tracker.get_run(run_id)
        assert exp.tags["dataset"] == "mnist"

    def test_no_active_run_raises(self, tracker):
        with pytest.raises(RuntimeError, match="No active run"):
            tracker.log_metric("loss", 1.0)


# ── log_metric ────────────────────────────────────────────────────────────────

class TestLogMetric:
    def test_metric_stored(self, tracker, completed_run):
        exp = tracker.get_run(completed_run)
        assert "loss" in exp.metrics
        assert len(exp.metrics["loss"]) == 5

    def test_final_metric(self, tracker, completed_run):
        exp = tracker.get_run(completed_run)
        final = exp.final_metric("loss")
        assert final is not None
        assert math.isfinite(final)

    def test_nonfinite_value_raises(self, tracker):
        tracker.start_run("bad")
        with pytest.raises(ValueError, match="finite"):
            tracker.log_metric("loss", float("nan"))
        tracker.end_run("failed")

    def test_step_stored(self, tracker):
        run_id = tracker.start_run("step_test")
        tracker.log_metric("acc", 0.9, step=7)
        tracker.end_run()
        exp = tracker.get_run(run_id)
        pt  = exp.metrics["acc"][0]
        assert pt.step == 7


# ── log_param ─────────────────────────────────────────────────────────────────

class TestLogParam:
    def test_param_added_post_start(self, tracker):
        run_id = tracker.start_run("param_test", {"lr": 0.01})
        tracker.log_param("scheduler", "cosine")
        tracker.end_run()
        exp = tracker.get_run(run_id)
        assert exp.params["scheduler"] == "cosine"

    def test_param_updated(self, tracker):
        run_id = tracker.start_run("upd", {"lr": 0.01})
        tracker.log_param("lr", 0.001)
        tracker.end_run()
        exp = tracker.get_run(run_id)
        assert exp.params["lr"] == pytest.approx(0.001)


# ── compare_runs ──────────────────────────────────────────────────────────────

class TestCompareRuns:
    def _make_two_runs(self, tracker):
        r1 = tracker.start_run("cmp", {"lr": 1e-3})
        tracker.log_metric("loss", 0.5)
        tracker.end_run()
        r2 = tracker.start_run("cmp", {"lr": 1e-4})
        tracker.log_metric("loss", 0.3)
        tracker.end_run()
        return r1, r2

    def test_compare_returns_rows(self, tracker):
        r1, r2 = self._make_two_runs(tracker)
        cmp = tracker.compare_runs([r1, r2])
        assert "rows" in cmp
        assert len(cmp["rows"]) == 2

    def test_differing_params_detected(self, tracker):
        r1, r2 = self._make_two_runs(tracker)
        cmp = tracker.compare_runs([r1, r2])
        assert "lr" in cmp["differing_params"]

    def test_missing_run_ignored(self, tracker, completed_run):
        cmp = tracker.compare_runs([completed_run, "nonexistent-run-id"])
        assert len(cmp["rows"]) == 1

    def test_empty_run_ids_returns_error(self, tracker):
        cmp = tracker.compare_runs([])
        assert "error" in cmp


# ── best_run ──────────────────────────────────────────────────────────────────

class TestBestRun:
    def test_best_min(self, tracker):
        for val in [1.0, 0.5, 0.8]:
            rid = tracker.start_run("metric_sweep", {})
            tracker.log_metric("loss", val)
            tracker.end_run("completed")
        best = tracker.best_run("loss", direction="min")
        assert best is not None
        assert best["best_value"] == pytest.approx(0.5)

    def test_best_max(self, tracker):
        for val in [0.7, 0.9, 0.85]:
            rid = tracker.start_run("acc_sweep", {})
            tracker.log_metric("accuracy", val)
            tracker.end_run("completed")
        best = tracker.best_run("accuracy", direction="max")
        assert best is not None
        assert best["best_value"] == pytest.approx(0.9)

    def test_no_runs_returns_none(self, tracker):
        assert tracker.best_run("nonexistent_metric") is None


# ── list_runs ─────────────────────────────────────────────────────────────────

class TestListRuns:
    def test_list_returns_completed(self, tracker, completed_run):
        runs = tracker.list_runs(status="completed")
        ids  = [r["run_id"] for r in runs]
        assert completed_run in ids

    def test_list_filter_by_name(self, tracker, completed_run):
        runs = tracker.list_runs(name="sweep")
        assert len(runs) >= 1

    def test_list_limit(self, tracker):
        for _ in range(5):
            tracker.start_run("bulk", {})
            tracker.end_run()
        runs = tracker.list_runs(limit=3)
        assert len(runs) <= 3


# ── delete_run ────────────────────────────────────────────────────────────────

class TestDeleteRun:
    def test_delete_removes_run(self, tracker, completed_run):
        assert tracker.delete_run(completed_run) is True
        assert tracker.get_run(completed_run) is None

    def test_delete_nonexistent_returns_false(self, tracker):
        assert tracker.delete_run("does-not-exist") is False


# ── Experiment model ──────────────────────────────────────────────────────────

class TestExperimentModel:
    def test_param_hash_stable(self):
        e1 = Experiment(id="a", name="x", params={"lr": 0.01, "batch": 32})
        e2 = Experiment(id="b", name="x", params={"batch": 32, "lr": 0.01})
        assert e1.param_hash() == e2.param_hash()

    def test_best_metric_min(self, tracker, completed_run):
        exp = tracker.get_run(completed_run)
        best = exp.best_metric("loss", direction="min")
        assert best is not None
        all_loss = [p.value for p in exp.metrics["loss"]]
        assert best == pytest.approx(min(all_loss))

    def test_summary_keys(self, tracker, completed_run):
        exp     = tracker.get_run(completed_run)
        summary = exp.summary()
        assert "id" in summary
        assert "final_metrics" in summary
        assert "loss" in summary["final_metrics"]


# ── CLI ───────────────────────────────────────────────────────────────────────

class TestTrackerCLI:
    def test_demo_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.experiment_tracker.DB_PATH", tmp_path / "et.db")
        from src.experiment_tracker import main
        rc = main(["demo"])
        assert rc == 0
        out = capsys.readouterr().out
        assert "sweep" in out.lower() or "best" in out.lower()

    def test_list_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.experiment_tracker.DB_PATH", tmp_path / "et2.db")
        from src.experiment_tracker import main
        main(["demo"])
        rc = main(["list", "--limit", "5"])
        assert rc == 0

    def test_best_command_no_runs(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.experiment_tracker.DB_PATH", tmp_path / "et3.db")
        from src.experiment_tracker import main
        rc = main(["best", "nonexistent_metric"])
        assert rc == 1
