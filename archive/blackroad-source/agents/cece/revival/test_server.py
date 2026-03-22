from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["agent"] == "CECE"

def test_chat_missing():
    r = client.post("/chat", json={})
    assert r.status_code == 200
    assert r.json()["error"] == "message required"

def test_chat():
    r = client.post("/chat", json={"message": "hello"})
    assert r.status_code == 200
    data = r.json()
    assert "response" in data or "error" in data

def test_memory_search():
    r = client.get("/memory/search?q=test")
    assert r.status_code == 200

def test_index():
    r = client.get("/")
    assert r.status_code == 200
    assert "CECE" in r.text
