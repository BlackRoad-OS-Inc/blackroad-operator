from __future__ import annotations

from datetime import datetime, timezone

from fastapi.testclient import TestClient

from services.compliance_engine import create_app


def _build_payload(**overrides: object) -> dict:
    payload = {
        "client_id": "CL-123",
        "representative_id": "RR-9",
        "product_type": "derivative",
        "submitted_at": datetime(2025, 1, 15, tzinfo=timezone.utc).isoformat(),
        "risk_acknowledged": True,
        "forward_looking_acknowledged": True,
        "liability_acknowledged": True,
        "disclosures": ["Options Agreement", "SEC-175"],
    }
    payload.update(overrides)
    return payload


def test_compliance_endpoint_persists_and_returns_approval(tmp_path):
    app = create_app(db_path=tmp_path / "compliance.sqlite")
    client = TestClient(app)

    response = client.post("/v1/compliance/account-opening", json=_build_payload())
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "approved"
    assert body["violations"] == []

    history = client.get("/v1/compliance/events/CL-123")
    assert history.status_code == 200
    events = history.json()["events"]
    assert len(events) == 1
    assert events[0]["record_id"] == body["record_id"]


def test_compliance_endpoint_flags_missing_disclosures(tmp_path):
    app = create_app(db_path=tmp_path / "compliance.sqlite")
    client = TestClient(app)

    payload = _build_payload(liability_acknowledged=False, disclosures=["sec-175"])
    response = client.post("/v1/compliance/account-opening", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "rejected"
    assert any("liability" in message for message in body["violations"])
    assert any("options agreement" in message.lower() for message in body["violations"])

    history = client.get("/v1/compliance/events/CL-123")
    assert history.status_code == 200
    events = history.json()["events"]
    assert len(events) == 1
    assert events[0]["status"] == "rejected"
