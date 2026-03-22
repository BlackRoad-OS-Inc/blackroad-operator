from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["device"] == "Hailo-8"

def test_index():
    r = client.get("/")
    assert r.status_code == 200
    assert "Hailo" in r.text
