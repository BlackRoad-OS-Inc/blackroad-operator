from __future__ import annotations

from pathlib import Path

import pytest

from qlm_lab.agents.orchestrator import Orchestrator
from qlm_lab import lineage
from qlm_lab.tools import viz


@pytest.fixture(autouse=True)
def isolate_artifacts(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(lineage, "ARTIFACTS_DIR", tmp_path)
    monkeypatch.setattr(lineage, "LINEAGE_PATH", tmp_path / "lineage.jsonl")
    monkeypatch.setattr(viz, "ART_DIR", tmp_path)
    yield


def test_event_loop_generates_required_artifacts(tmp_path: Path):
    orchestrator = Orchestrator()
    orchestrator.run_goal("bell-lab-demo")
    summary = lineage.artifact_index()
    files = set(summary["files"])
    expected = {"bell_hist.png", "bell_hist_empirical.png", "lineage.jsonl"}
    assert expected.issubset(files)
    lineage_log = (tmp_path / "lineage.jsonl").read_text(encoding="utf-8").strip().splitlines()
    assert len(lineage_log) >= 10
