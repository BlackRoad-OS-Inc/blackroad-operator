from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["service"] == "fleet-heartbeat"
    assert data["nodes"] == 5

def test_fleet_history():
    r = client.get("/fleet/history?limit=5")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_index():
    r = client.get("/")
    assert r.status_code == 200
    assert "Fleet Heartbeat" in r.text
