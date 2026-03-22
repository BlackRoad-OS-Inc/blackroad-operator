"""Tests for src/pipeline.py"""
from __future__ import annotations
import tempfile
from pathlib import Path

import pytest

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.pipeline import DataPipeline, Stage, StageResult, ValidationError, _build_demo_pipeline


# ── fixtures ──────────────────────────────────────────────────────────────────

def make_pipeline(tmp_path: Path, name: str = "test_pl") -> DataPipeline:
    return DataPipeline(name, db_path=tmp_path / "test.db")


def double_stage() -> Stage:
    return Stage("double", lambda x: [v * 2 for v in x])


def str_stage() -> Stage:
    return Stage("to_str", lambda x: [str(v) for v in x])


def validate_all_positive(data: list) -> None:
    if any(v <= 0 for v in data):
        raise ValidationError("All values must be positive")


# ── add_stage ─────────────────────────────────────────────────────────────────

class TestAddStage:
    def test_add_and_list(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        assert "double" in p.stage_names()

    def test_duplicate_name_raises(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        with pytest.raises(ValueError, match="already exists"):
            p.add_stage(double_stage())

    def test_chaining(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage()).add_stage(str_stage())
        assert p.stage_names() == ["double", "to_str"]

    def test_remove_stage(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        p.remove_stage("double")
        assert "double" not in p.stage_names()

    def test_enable_disable(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        p.disable_stage("double")
        assert not p._get_stage("double").enabled
        p.enable_stage("double")
        assert p._get_stage("double").enabled


# ── run ───────────────────────────────────────────────────────────────────────

class TestRun:
    def test_successful_run(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        report = p.run([1, 2, 3])
        assert report.success is True
        assert report.stages_succeeded == 1
        assert report.records_in == 3
        assert report.records_out == 3

    def test_chained_transforms(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage()).add_stage(str_stage())
        report = p.run([1, 2, 3])
        assert report.success is True
        assert report.stages_succeeded == 2

    def test_run_id_generated(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        report = p.run([1])
        assert report.run_id.startswith("run-")

    def test_failed_stage_stops_pipeline(self, tmp_path):
        p = make_pipeline(tmp_path, stop_on_error=True)
        p.add_stage(Stage("fail", lambda _: (_ for _ in ()).throw(RuntimeError("boom"))))
        p.add_stage(double_stage())
        report = p.run([1])
        assert report.success is False
        assert report.stages_failed == 1

    def test_duration_is_positive(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        report = p.run([1, 2, 3])
        assert report.total_duration_ms >= 0.0

    def test_disabled_stage_skipped(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        p.disable_stage("double")
        report = p.run([1, 2, 3])
        assert report.success is True
        stage_res = report.stage_results[0]
        assert "stage disabled" in stage_res.warnings

    def test_validation_error_causes_failure(self, tmp_path):
        p = make_pipeline(tmp_path, stop_on_error=True)
        p.add_stage(Stage("neg", lambda x: [-v for v in x],
                    validate_fn=validate_all_positive))
        report = p.run([1, 2, 3])
        assert report.success is False

    def test_report_persisted_to_sqlite(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(double_stage())
        p.run([1])
        rows = p._load_recent_runs(10)
        assert len(rows) >= 1
        assert rows[0]["pipeline_name"] == "test_pl"


# ── validate ──────────────────────────────────────────────────────────────────

class TestValidate:
    def test_no_errors_when_valid(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(Stage("double", lambda x: [abs(v) for v in x],
                    validate_fn=validate_all_positive))
        errors = p.validate([-1, -2])
        assert errors == []

    def test_collects_errors(self, tmp_path):
        p = make_pipeline(tmp_path)
        p.add_stage(Stage("neg", lambda x: [-v for v in x],
                    validate_fn=validate_all_positive))
        errors = p.validate([1, 2])
        assert len(errors) == 1
        assert "neg" in errors[0]


# ── demo pipeline ─────────────────────────────────────────────────────────────

class TestDemoPipeline:
    def test_demo_runs_successfully(self, tmp_path):
        p = _build_demo_pipeline()
        p.db_path = tmp_path / "demo.db"
        p._init_db()
        report = p.run(None)
        assert report.success is True
        assert report.stages_succeeded == 5


# ── stage ─────────────────────────────────────────────────────────────────────

class TestStage:
    def test_stage_run_returns_result(self):
        s = Stage("s", lambda x: x + [99])
        out, result = s.run([1, 2, 3])
        assert out == [1, 2, 3, 99]
        assert result.success is True
        assert result.records_in == 3
        assert result.records_out == 4

    def test_stage_captures_error(self):
        s = Stage("bad", lambda _: 1 / 0)
        with pytest.raises(ZeroDivisionError):
            s.run([1])


# ── CLI ───────────────────────────────────────────────────────────────────────

class TestPipelineCLI:
    def test_demo_command(self, tmp_path, monkeypatch, capsys):
        monkeypatch.setattr("src.pipeline.DB_PATH", tmp_path / "pl.db")
        from src.pipeline import main
        rc = main(["demo", "--runs", "1"])
        assert rc == 0
        captured = capsys.readouterr()
        assert "Pipeline" in captured.out
