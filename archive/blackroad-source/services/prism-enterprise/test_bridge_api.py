from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from qlm_lab import lineage
from qlm_lab.api import create_app
from qlm_lab.tools import viz


@pytest.fixture(autouse=True)
def isolate_artifacts(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    artifact_root = tmp_path / "artifacts"
    artifact_root.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(lineage, "ARTIFACTS_DIR", artifact_root)
    monkeypatch.setattr(lineage, "ROOT_ARTIFACTS_DIR", artifact_root)
    monkeypatch.setattr(lineage, "LINEAGE_PATH", artifact_root / "lineage.jsonl")
    monkeypatch.setattr(lineage, "ROOT_LINEAGE_PATH", artifact_root / "lineage.jsonl")
    monkeypatch.setattr(viz, "ART_DIR", artifact_root)
    monkeypatch.setattr(viz, "ROOT_ART_DIR", artifact_root)
    yield


def _build_client() -> TestClient:
    app = create_app()
    return TestClient(app)


def test_run_goal_returns_messages_and_artifacts():
    client = _build_client()
    response = client.post("/runs", json={"goal": "bell-lab-demo"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["goal"] == "bell-lab-demo"
    assert payload["message_count"] > 0
    assert any(msg["recipient"] == "critic" for msg in payload["messages"])
    assert payload["artifacts"]["count"] >= 1


def test_run_goal_enforces_message_budget():
    client = _build_client()
    response = client.post("/runs", json={"goal": "bell-lab-demo", "message_budget": 1})
    assert response.status_code == 422
    detail = response.json().get("detail")
    assert "budget" in detail


def test_lineage_endpoint_respects_limit():
    client = _build_client()
    client.post("/runs", json={"goal": "bell-lab-demo"})
    response = client.get("/lineage", params={"limit": 3})
    assert response.status_code == 200
    entries = response.json()
    assert 0 < len(entries) <= 3


def test_artifacts_endpoint_exposes_summary():
    client = _build_client()
    client.post("/runs", json={"goal": "bell-lab-demo"})
    response = client.get("/artifacts")
    assert response.status_code == 200
    summary = response.json()
    assert summary["count"] >= 1
    assert all(isinstance(name, str) for name in summary["files"])
