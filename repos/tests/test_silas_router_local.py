import json
import sys
from pathlib import Path
from typing import Any, Dict

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest

from agents.silas_router import SilasRouterError, silas


class DummyResponse:
    def __init__(self, payload: Dict[str, Any]):
        self._payload = payload

    def raise_for_status(self) -> None:
        return None

    def json(self) -> Dict[str, Any]:
        return self._payload


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.delenv("BASE_URL", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    monkeypatch.setenv("SAFE_MODE", "0")
    yield


def test_safe_mode_blocks_requests(monkeypatch):
    monkeypatch.setenv("SAFE_MODE", "1")
    with pytest.raises(SilasRouterError):
        silas("hello world")


def test_vllm_payload_and_parsing(monkeypatch):
    monkeypatch.setenv("BASE_URL", "http://localhost:8000/v1")
    captured: Dict[str, Any] = {}

    def fake_post(url, headers=None, json=None, timeout=None):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        payload = {
            "assumptions": ["test"],
            "logic_steps": ["step"],
            "code": "print('ok')",
            "tests": "pytest",
            "balanced_ternary": "+-",
        }
        response_body = {
            "choices": [
                {
                    "message": {
                        "content": json_module.dumps(payload)
                    }
                }
            ]
        }
        return DummyResponse(response_body)

    json_module = json
    monkeypatch.setattr("agents.silas_router.requests.post", fake_post)
    result = silas("do something", schema={"type": "object"})

    assert captured["url"].endswith("/chat/completions")
    assert captured["json"]["extra_body"]["structured_outputs"]["json"] == {"type": "object"}
    assert "Authorization" not in captured["headers"]
    assert result["balanced_ternary"] == "+-"


def test_ollama_payload_and_parsing(monkeypatch):
    monkeypatch.setenv("BASE_URL", "http://localhost:11434/v1")
    captured: Dict[str, Any] = {}

    def fake_post(url, headers=None, json=None, timeout=None):
        captured["url"] = url
        captured["headers"] = headers
        captured["json"] = json
        response_body = {
            "message": {
                "content": json_module.dumps(
                    {
                        "assumptions": [],
                        "logic_steps": [],
                        "code": "",
                        "tests": "",
                        "balanced_ternary": "0",
                    }
                )
            }
        }
        return DummyResponse(response_body)

    json_module = json
    monkeypatch.setattr("agents.silas_router.requests.post", fake_post)

    result = silas("analyze", schema={"type": "object", "properties": {}})

    assert captured["url"].endswith("/api/chat")
    assert captured["json"]["format"] == {"type": "object", "properties": {}}
    assert result["balanced_ternary"] == "0"
