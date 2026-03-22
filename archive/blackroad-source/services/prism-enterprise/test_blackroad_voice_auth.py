"""Tests for voice endpoints authorization."""

from __future__ import annotations

import importlib
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from flask.testing import FlaskClient


@pytest.fixture()
def voice_app_client(monkeypatch: pytest.MonkeyPatch) -> Iterator[FlaskClient]:
    """Load the Lucidia Flask app with a fixed auth token for testing."""

    monkeypatch.setenv("AUTH_BEARER", "unit-test-token")
    monkeypatch.setenv("LLM_BACKEND", "ollama")

    repo_root = Path(__file__).resolve().parents[1]
    monkeypatch.syspath_prepend(str(repo_root / "srv" / "blackroad"))

    module_name = "srv.blackroad.app"
    module = sys.modules.get(module_name)
    if module is not None:
        module = importlib.reload(module)
    else:
        module = importlib.import_module(module_name)

    module.app.config.update(TESTING=True)

    with module.app.test_client() as client:
        yield client


def test_tts_say_requires_bearer_token(voice_app_client: FlaskClient) -> None:
    """/tts/say should reject unauthenticated callers."""

    resp = voice_app_client.post("/tts/say", json={"text": "Hello"})

    assert resp.status_code == 401


def test_voice_reply_requires_bearer_token(voice_app_client: FlaskClient) -> None:
    """/voice/reply should reject unauthenticated callers before invoking LLMs."""

    resp = voice_app_client.post(
        "/voice/reply",
        json={"model": "llama3.1", "prompt": "Hi"},
    )

    assert resp.status_code == 401
