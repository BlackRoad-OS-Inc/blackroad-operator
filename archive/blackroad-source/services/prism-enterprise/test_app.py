import sys
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app import app


def test_health():
    client = TestClient(app)
    resp = client.get('/health')
    assert resp.status_code == 200
    assert resp.json()['status'] == 'ok'


def test_chat_stub_mode():
    """Without LUCIDIA_BACKEND_URL the bridge echoes the prompt."""
    client = TestClient(app)
    resp = client.post('/chat', json={'prompt': 'hello'})
    assert resp.status_code == 200
    data = resp.json()
    assert 'text' in data
    assert 'hello' in data['text']
