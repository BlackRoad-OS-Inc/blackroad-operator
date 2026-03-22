from fastapi.testclient import TestClient

from app.main import create_app
from app.config import get_settings


def test_health_endpoint_exposes_build_sha(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("BUILD_SHA", "test-sha")
    app = create_app()
    client = TestClient(app)

    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "build_sha" in payload


def test_metrics_endpoint_returns_prometheus_payload():
    get_settings.cache_clear()
    app = create_app()
    client = TestClient(app)

    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_request_duration_seconds" in response.text

def test_readiness_endpoint_ok_without_dependencies():
    get_settings.cache_clear()
    app = create_app()
    client = TestClient(app)

    response = client.get("/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ready"
