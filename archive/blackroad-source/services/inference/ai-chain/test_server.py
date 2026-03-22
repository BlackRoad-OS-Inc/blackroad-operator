from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert "nodes" in r.json()

def test_chain_missing_prompt():
    r = client.post("/chain", json={})
    assert r.status_code == 200
    assert "error" in r.json()

def test_chain_with_prompt():
    r = client.post("/chain", json={"prompt": "test", "mode": "fast"})
    assert r.status_code == 200
    data = r.json()
    assert "prompt" in data or "error" in data
