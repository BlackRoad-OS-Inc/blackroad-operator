"""Tests for the Ollama router module."""
import json
import sys
import unittest
from io import BytesIO
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, ".")
from ollama_router import (
    OLLAMA_TRIGGERS,
    contains_mention,
    query_ollama,
    route,
    strip_mentions,
)


# ---------------------------------------------------------------------------
# contains_mention
# ---------------------------------------------------------------------------

class TestContainsMention:
    def test_at_ollama(self):
        assert contains_mention("@ollama what is A/B testing?")

    def test_at_copilot(self):
        assert contains_mention("@copilot explain Welch's t-test")

    def test_at_lucidia(self):
        assert contains_mention("@lucidia help me with this experiment")

    def test_at_blackboxprogramming(self):
        assert contains_mention("@blackboxprogramming review my code")

    def test_case_insensitive_upper(self):
        assert contains_mention("@COPILOT do something")

    def test_case_insensitive_mixed(self):
        assert contains_mention("@Ollama answer me")

    def test_no_mention(self):
        assert not contains_mention("plain text with no mention")

    def test_partial_word_no_match(self):
        # @copiloted should NOT match because of \b word boundary
        assert not contains_mention("@copiloted is different")

    def test_unknown_mention_no_match(self):
        assert not contains_mention("@gpt4 do something")

    def test_multiple_mentions(self):
        assert contains_mention("@copilot and @lucidia both mentioned")


# ---------------------------------------------------------------------------
# strip_mentions
# ---------------------------------------------------------------------------

class TestStripMentions:
    def test_strips_single(self):
        assert strip_mentions("@ollama what is p-value?") == "what is p-value?"

    def test_strips_multiple(self):
        result = strip_mentions("@copilot and @lucidia answer this")
        assert "@copilot" not in result
        assert "@lucidia" not in result

    def test_normalises_whitespace(self):
        result = strip_mentions("  @ollama   hello world  ")
        assert result == "hello world"

    def test_no_mention_unchanged(self):
        assert strip_mentions("hello world") == "hello world"

    def test_only_mention_becomes_empty(self):
        assert strip_mentions("@ollama") == ""


# ---------------------------------------------------------------------------
# query_ollama (mocked HTTP)
# ---------------------------------------------------------------------------

def _make_response(content: str, status: int = 200) -> MagicMock:
    """Build a mock urllib response object."""
    body = json.dumps({"model": "llama3", "response": content, "done": True}).encode()
    mock_resp = MagicMock()
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)
    mock_resp.read.return_value = body
    mock_resp.status = status
    return mock_resp


class TestQueryOllama:
    def test_returns_response_text(self):
        with patch("urllib.request.urlopen", return_value=_make_response("42")) as mock_open:
            result = query_ollama("what is the answer?", base_url="http://localhost:11434")
        assert result == "42"
        mock_open.assert_called_once()

    def test_correct_endpoint(self):
        with patch("urllib.request.urlopen", return_value=_make_response("ok")) as mock_open:
            query_ollama("hi", base_url="http://localhost:11434")
        req = mock_open.call_args[0][0]
        assert req.full_url == "http://localhost:11434/api/generate"

    def test_model_in_payload(self):
        with patch("urllib.request.urlopen", return_value=_make_response("ok")) as mock_open:
            query_ollama("hi", model="mistral", base_url="http://localhost:11434")
        req = mock_open.call_args[0][0]
        payload = json.loads(req.data.decode())
        assert payload["model"] == "mistral"

    def test_stream_false_in_payload(self):
        with patch("urllib.request.urlopen", return_value=_make_response("ok")) as mock_open:
            query_ollama("hi", base_url="http://localhost:11434", stream=False)
        req = mock_open.call_args[0][0]
        payload = json.loads(req.data.decode())
        assert payload["stream"] is False

    def test_stream_true_accumulates_tokens(self):
        lines = [
            json.dumps({"response": "Hello", "done": False}),
            json.dumps({"response": " world", "done": True}),
        ]
        body = "\n".join(lines).encode()
        mock_resp = MagicMock()
        mock_resp.__enter__ = lambda s: s
        mock_resp.__exit__ = MagicMock(return_value=False)
        mock_resp.read.return_value = body

        with patch("urllib.request.urlopen", return_value=mock_resp):
            result = query_ollama("hi", base_url="http://localhost:11434", stream=True)
        assert result == "Hello world"

    def test_missing_response_key_raises(self):
        bad_body = json.dumps({"error": "model not found"}).encode()
        mock_resp = MagicMock()
        mock_resp.__enter__ = lambda s: s
        mock_resp.__exit__ = MagicMock(return_value=False)
        mock_resp.read.return_value = bad_body

        with patch("urllib.request.urlopen", return_value=mock_resp):
            with pytest.raises(RuntimeError, match="Unexpected Ollama response"):
                query_ollama("hi", base_url="http://localhost:11434")


# ---------------------------------------------------------------------------
# route (integration of contains_mention + strip_mentions + query_ollama)
# ---------------------------------------------------------------------------

class TestRoute:
    def test_routes_ollama_mention(self):
        with patch("ollama_router.query_ollama", return_value="routed!") as mock_q:
            result = route("@ollama what is a p-value?")
        assert result == "routed!"
        mock_q.assert_called_once_with("what is a p-value?", model=None, base_url=None)

    def test_routes_copilot_mention(self):
        with patch("ollama_router.query_ollama", return_value="ok") as mock_q:
            route("@copilot explain this")
        prompt = mock_q.call_args[0][0]
        assert prompt == "explain this"

    def test_routes_lucidia_mention(self):
        with patch("ollama_router.query_ollama", return_value="ok") as mock_q:
            route("@lucidia explain this")
        prompt = mock_q.call_args[0][0]
        assert prompt == "explain this"

    def test_routes_blackboxprogramming_mention(self):
        with patch("ollama_router.query_ollama", return_value="ok") as mock_q:
            route("@blackboxprogramming review my code")
        prompt = mock_q.call_args[0][0]
        assert prompt == "review my code"

    def test_no_mention_raises_valueerror(self):
        with pytest.raises(ValueError, match="No Ollama trigger mention"):
            route("plain text without a mention")

    def test_model_and_base_url_forwarded(self):
        with patch("ollama_router.query_ollama", return_value="ok") as mock_q:
            route("@ollama hello", model="mistral", base_url="http://myserver:11434")
        mock_q.assert_called_once_with("hello", model="mistral", base_url="http://myserver:11434")

    def test_all_triggers_covered(self):
        """Every entry in OLLAMA_TRIGGERS must successfully route."""
        for trigger in OLLAMA_TRIGGERS:
            with patch("ollama_router.query_ollama", return_value="ok"):
                result = route(f"@{trigger} test prompt")
            assert result == "ok", f"Trigger @{trigger} failed to route"
