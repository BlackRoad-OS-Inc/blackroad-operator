from fastapi.testclient import TestClient

from origin_qlm_bridge.app import create_app


def test_health_endpoint():
    client = TestClient(create_app())
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
