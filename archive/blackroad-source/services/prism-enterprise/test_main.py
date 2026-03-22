"""Integration tests for the FastAPI service template."""

from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
import sys
from typing import Iterator

import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app import routes  # noqa: E402
from app.config import Settings, get_settings  # noqa: E402
from app.main import create_app  # noqa: E402


def build_settings(**overrides: object) -> Settings:
    """Return Settings seeded with deterministic defaults for tests."""

    base: dict[str, object] = {
        "app_name": "svc-template-fastapi-test",
        "build_sha": "test-sha",
        "readiness_dependencies": [],
        "metrics_auth_token": None,
    }
    base.update(overrides)
    return Settings(**base)


@contextmanager
def client_for_settings(**overrides: object) -> Iterator[TestClient]:
    """Context manager that yields a TestClient wired to deterministic settings."""

    settings = build_settings(**overrides)
    app = create_app(settings)
    app.dependency_overrides[get_settings] = lambda: settings
    try:
        with TestClient(app) as client:
            yield client
    finally:
        app.dependency_overrides.clear()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with client_for_settings() as test_client:
        yield test_client


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload == {"status": "ok", "build_sha": "test-sha"}


def test_liveness_endpoint(client: TestClient) -> None:
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"


def test_readiness_when_no_dependencies(client: TestClient) -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["dependencies"] == []


def test_readiness_returns_503_when_dependency_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    dependency_url = "https://dependency.internal/health"

    async def failing_check(url: str) -> tuple[str, bool, str | None]:
        return (url, False, "timeout")

    monkeypatch.setattr(routes, "check_dependency", failing_check)

    with client_for_settings(readiness_dependencies=[dependency_url]) as failing_client:
        response = failing_client.get("/ready")

    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["dependencies"][0]["url"] == dependency_url
    assert detail["dependencies"][0]["ok"] is False


def test_metrics_endpoint_without_token(client: TestClient) -> None:
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_request_duration_seconds" in response.text


def test_metrics_enforces_token_when_configured() -> None:
    with client_for_settings(metrics_auth_token="secret-token") as protected_client:
        unauthorized = protected_client.get("/metrics")
        assert unauthorized.status_code == 401

        authorized = protected_client.get("/metrics", headers={"Authorization": "Bearer secret-token"})
        assert authorized.status_code == 200
        assert "app_uptime_seconds" in authorized.text
