from importlib.machinery import SourceFileLoader
from fastapi.testclient import TestClient

module = SourceFileLoader("llm_stub", "srv/lucidia-llm/app.py").load_module()
app = module.app
client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_chat_returns_stub_response():
    """Without LUCIDIA_BACKEND_URL the bridge returns a stub echo."""
    res = client.post(
        "/chat",
        json={"prompt": "ping"},
    )
    assert res.status_code == 200
    assert "ping" in res.json()["text"]


def test_chat_includes_system_prefix_when_present():
    """Stub mode prepends the system message when LUCIDIA_BACKEND_URL is unset."""
    res = client.post(
        "/chat",
        json={"prompt": "status", "system": "SYS"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "status" in data["text"]
    assert "SYS" in data["text"]
