"""Tests for src/ollama_client.py — all HTTP calls are mocked."""
from __future__ import annotations

import json
import sys
import os
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.ollama_client import (
    ChatMessage,
    ChatResponse,
    GenerateResponse,
    ModelInfo,
    OllamaClient,
    OllamaError,
    main,
)


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _mock_response(data: dict | list, status: int = 200):
    """Return a context-manager mock that urlopen() can return."""
    body = json.dumps(data).encode()
    resp = MagicMock()
    resp.read.return_value = body
    resp.status = status
    resp.__enter__ = lambda s: s
    resp.__exit__  = MagicMock(return_value=False)
    return resp


def _mock_stream_response(chunks: list[dict]):
    """Return a mock that iterates over newline-delimited JSON chunks."""
    lines = [json.dumps(c).encode() + b"\n" for c in chunks]
    resp = MagicMock()
    resp.__iter__ = lambda s: iter(lines)
    resp.__enter__ = lambda s: s
    resp.__exit__  = MagicMock(return_value=False)
    return resp


# ──────────────────────────────────────────────────────────────────────────────
# GenerateResponse
# ──────────────────────────────────────────────────────────────────────────────

class TestGenerateResponse:
    def test_from_dict_full(self):
        d = {
            "model": "llama3",
            "response": "Hello there",
            "done": True,
            "context": [1, 2, 3],
            "total_duration": 1_000_000_000,
            "load_duration": 500_000,
            "prompt_eval_count": 5,
            "eval_count": 3,
        }
        r = GenerateResponse.from_dict(d)
        assert r.model == "llama3"
        assert r.response == "Hello there"
        assert r.done is True
        assert r.context == [1, 2, 3]
        assert r.total_duration_ns == 1_000_000_000
        assert r.eval_count == 3
        assert r.raw == d

    def test_from_dict_minimal(self):
        r = GenerateResponse.from_dict({})
        assert r.model == ""
        assert r.response == ""
        assert r.done is False


# ──────────────────────────────────────────────────────────────────────────────
# ChatMessage
# ──────────────────────────────────────────────────────────────────────────────

class TestChatMessage:
    def test_user_factory(self):
        m = ChatMessage.user("hi")
        assert m.role == "user"
        assert m.content == "hi"

    def test_assistant_factory(self):
        m = ChatMessage.assistant("ok")
        assert m.role == "assistant"

    def test_system_factory(self):
        m = ChatMessage.system("be helpful")
        assert m.role == "system"

    def test_to_dict(self):
        m = ChatMessage.user("test")
        assert m.to_dict() == {"role": "user", "content": "test"}


# ──────────────────────────────────────────────────────────────────────────────
# ChatResponse
# ──────────────────────────────────────────────────────────────────────────────

class TestChatResponse:
    def test_from_dict(self):
        d = {
            "model": "llama3",
            "message": {"role": "assistant", "content": "Sure!"},
            "done": True,
            "total_duration": 2_000_000_000,
            "eval_count": 7,
        }
        r = ChatResponse.from_dict(d)
        assert r.model == "llama3"
        assert r.message.role == "assistant"
        assert r.message.content == "Sure!"
        assert r.done is True
        assert r.eval_count == 7

    def test_from_dict_minimal(self):
        r = ChatResponse.from_dict({})
        assert r.message.content == ""


# ──────────────────────────────────────────────────────────────────────────────
# ModelInfo
# ──────────────────────────────────────────────────────────────────────────────

class TestModelInfo:
    def test_from_dict(self):
        d = {
            "name": "llama3:latest",
            "modified_at": "2024-01-01T00:00:00Z",
            "size": 4_000_000_000,
            "digest": "abc123",
            "details": {"family": "llama"},
        }
        m = ModelInfo.from_dict(d)
        assert m.name == "llama3:latest"
        assert m.size_bytes == 4_000_000_000
        assert m.details == {"family": "llama"}

    def test_from_dict_minimal(self):
        m = ModelInfo.from_dict({})
        assert m.name == ""
        assert m.size_bytes == 0


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.is_available
# ──────────────────────────────────────────────────────────────────────────────

class TestIsAvailable:
    def test_returns_true_when_server_responds(self):
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_response({"status": "ok"})):
            assert client.is_available() is True

    def test_returns_false_on_connection_error(self):
        import urllib.error
        client = OllamaClient()
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("Connection refused")):
            assert client.is_available() is False

    def test_returns_false_on_http_error(self):
        import urllib.error
        client = OllamaClient()
        err = urllib.error.HTTPError(None, 500, "Server Error", {}, BytesIO(b"oops"))
        with patch("urllib.request.urlopen", side_effect=err):
            assert client.is_available() is False


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.list_models
# ──────────────────────────────────────────────────────────────────────────────

class TestListModels:
    def test_returns_model_list(self):
        payload = {"models": [
            {"name": "llama3:latest", "size": 4_000_000_000, "modified_at": "2024-01-01"},
            {"name": "mistral:latest", "size": 3_500_000_000, "modified_at": "2024-01-02"},
        ]}
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_response(payload)):
            models = client.list_models()
        assert len(models) == 2
        assert models[0].name == "llama3:latest"
        assert models[1].name == "mistral:latest"

    def test_returns_empty_list_when_no_models(self):
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_response({"models": []})):
            assert client.list_models() == []

    def test_raises_ollama_error_on_http_error(self):
        import urllib.error
        client = OllamaClient()
        err = urllib.error.HTTPError(None, 404, "Not Found", {}, BytesIO(b"not found"))
        with patch("urllib.request.urlopen", side_effect=err):
            with pytest.raises(OllamaError):
                client.list_models()


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.generate
# ──────────────────────────────────────────────────────────────────────────────

class TestGenerate:
    def _payload(self):
        return {
            "model": "llama3",
            "response": "42 is the answer.",
            "done": True,
            "eval_count": 5,
            "total_duration": 1_000_000_000,
        }

    def test_returns_generate_response(self):
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_response(self._payload())):
            resp = client.generate("llama3", "What is the answer?")
        assert isinstance(resp, GenerateResponse)
        assert resp.response == "42 is the answer."
        assert resp.done is True

    def test_passes_system_prompt(self):
        client = OllamaClient()
        captured = {}

        def fake_urlopen(req, timeout=None):
            body = json.loads(req.data.decode())
            captured.update(body)
            return _mock_response(self._payload())

        with patch("urllib.request.urlopen", side_effect=fake_urlopen):
            client.generate("llama3", "Hello", system="Be concise.")

        assert captured.get("system") == "Be concise."

    def test_passes_options(self):
        client = OllamaClient()
        captured = {}

        def fake_urlopen(req, timeout=None):
            body = json.loads(req.data.decode())
            captured.update(body)
            return _mock_response(self._payload())

        with patch("urllib.request.urlopen", side_effect=fake_urlopen):
            client.generate("llama3", "Hello", options={"temperature": 0.5})

        assert captured.get("options") == {"temperature": 0.5}

    def test_raises_ollama_error_on_failure(self):
        import urllib.error
        client = OllamaClient()
        err = urllib.error.URLError("connection refused")
        with patch("urllib.request.urlopen", side_effect=err):
            with pytest.raises(OllamaError):
                client.generate("llama3", "test")


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.generate_stream
# ──────────────────────────────────────────────────────────────────────────────

class TestGenerateStream:
    def test_yields_chunks(self):
        chunks = [
            {"model": "llama3", "response": "Hello", "done": False},
            {"model": "llama3", "response": " world", "done": True},
        ]
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_stream_response(chunks)):
            results = list(client.generate_stream("llama3", "Hi"))
        assert len(results) == 2
        assert results[0].response == "Hello"
        assert results[1].done is True

    def test_final_chunk_done(self):
        chunks = [{"model": "llama3", "response": "ok", "done": True}]
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_stream_response(chunks)):
            results = list(client.generate_stream("llama3", "test"))
        assert results[-1].done is True


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.chat
# ──────────────────────────────────────────────────────────────────────────────

class TestChat:
    def _payload(self):
        return {
            "model": "llama3",
            "message": {"role": "assistant", "content": "I'm Ollama."},
            "done": True,
        }

    def test_returns_chat_response(self):
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_response(self._payload())):
            resp = client.chat("llama3", [ChatMessage.user("Who are you?")])
        assert isinstance(resp, ChatResponse)
        assert resp.message.content == "I'm Ollama."

    def test_messages_serialised_correctly(self):
        client = OllamaClient()
        captured = {}

        def fake_urlopen(req, timeout=None):
            body = json.loads(req.data.decode())
            captured.update(body)
            return _mock_response(self._payload())

        messages = [ChatMessage.system("Be brief."), ChatMessage.user("Hi")]
        with patch("urllib.request.urlopen", side_effect=fake_urlopen):
            client.chat("llama3", messages)

        assert captured["messages"] == [
            {"role": "system", "content": "Be brief."},
            {"role": "user",   "content": "Hi"},
        ]

    def test_raises_ollama_error_on_failure(self):
        import urllib.error
        client = OllamaClient()
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("refused")):
            with pytest.raises(OllamaError):
                client.chat("llama3", [ChatMessage.user("test")])


# ──────────────────────────────────────────────────────────────────────────────
# OllamaClient.chat_stream
# ──────────────────────────────────────────────────────────────────────────────

class TestChatStream:
    def test_yields_chunks(self):
        chunks = [
            {"model": "llama3", "message": {"role": "assistant", "content": "Hi"}, "done": False},
            {"model": "llama3", "message": {"role": "assistant", "content": "!"}, "done": True},
        ]
        client = OllamaClient()
        with patch("urllib.request.urlopen", return_value=_mock_stream_response(chunks)):
            results = list(client.chat_stream("llama3", [ChatMessage.user("Hello")]))
        assert len(results) == 2
        assert results[0].message.content == "Hi"
        assert results[1].done is True


# ──────────────────────────────────────────────────────────────────────────────
# OllamaError
# ──────────────────────────────────────────────────────────────────────────────

class TestOllamaError:
    def test_is_exception(self):
        err = OllamaError("something went wrong")
        assert isinstance(err, Exception)
        assert "something went wrong" in str(err)


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

class TestCLI:
    def test_check_available(self, capsys):
        with patch("urllib.request.urlopen", return_value=_mock_response({})):
            rc = main(["check"])
        assert rc == 0
        assert "running" in capsys.readouterr().out.lower()

    def test_check_unavailable(self, capsys):
        import urllib.error
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("refused")):
            rc = main(["check"])
        assert rc == 1
        assert "not" in capsys.readouterr().out.lower()

    def test_list_with_models(self, capsys):
        payload = {"models": [
            {"name": "llama3:latest", "size": 4_000_000_000, "modified_at": "2024-01-01T00:00:00Z"},
        ]}
        with patch("urllib.request.urlopen", return_value=_mock_response(payload)):
            rc = main(["list"])
        assert rc == 0
        assert "llama3" in capsys.readouterr().out

    def test_list_no_models(self, capsys):
        with patch("urllib.request.urlopen", return_value=_mock_response({"models": []})):
            rc = main(["list"])
        assert rc == 0
        assert "No models" in capsys.readouterr().out

    def test_generate_command(self, capsys):
        payload = {
            "model": "llama3", "response": "Hello!", "done": True,
            "eval_count": 3, "total_duration": 500_000_000,
        }
        with patch("urllib.request.urlopen", return_value=_mock_response(payload)):
            rc = main(["generate", "--model", "llama3", "--prompt", "Hi"])
        assert rc == 0
        assert "Hello!" in capsys.readouterr().out

    def test_generate_error_returns_1(self, capsys):
        import urllib.error
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("refused")):
            rc = main(["generate", "--model", "llama3", "--prompt", "Hi"])
        assert rc == 1

    def test_chat_command(self, capsys):
        payload = {
            "model": "llama3",
            "message": {"role": "assistant", "content": "I help you."},
            "done": True,
        }
        with patch("urllib.request.urlopen", return_value=_mock_response(payload)):
            rc = main(["chat", "--model", "llama3", "--message", "What are you?"])
        assert rc == 0
        assert "I help you." in capsys.readouterr().out

    def test_chat_error_returns_1(self, capsys):
        import urllib.error
        with patch("urllib.request.urlopen",
                   side_effect=urllib.error.URLError("refused")):
            rc = main(["chat", "--model", "llama3", "--message", "Hi"])
        assert rc == 1

    def test_generate_stream_command(self, capsys):
        chunks = [
            {"model": "llama3", "response": "Hello", "done": False},
            {"model": "llama3", "response": "!", "done": True},
        ]
        with patch("urllib.request.urlopen", return_value=_mock_stream_response(chunks)):
            rc = main(["generate", "--model", "llama3", "--prompt", "Hi", "--stream"])
        assert rc == 0
        out = capsys.readouterr().out
        assert "Hello" in out

    def test_chat_stream_command(self, capsys):
        chunks = [
            {"model": "llama3", "message": {"role": "assistant", "content": "Hi"}, "done": False},
            {"model": "llama3", "message": {"role": "assistant", "content": "!"}, "done": True},
        ]
        with patch("urllib.request.urlopen", return_value=_mock_stream_response(chunks)):
            rc = main(["chat", "--model", "llama3", "--message", "Hello", "--stream"])
        assert rc == 0
        out = capsys.readouterr().out
        assert "Hi" in out
