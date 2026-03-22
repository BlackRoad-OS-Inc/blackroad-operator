from __future__ import annotations

from pathlib import Path

from qlm_lab.orchestrator import Orchestrator


def test_demo_bell_creates_artifacts(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv("QLAB_SEED", "1")
    orch = Orchestrator()
    result = orch.run_goal("demo_bell")
    assert any("Bell state" in report for report in result.reports)
    artifacts = list(Path("artifacts").glob("*.png"))
    assert artifacts, "Expected artifacts to be generated"
