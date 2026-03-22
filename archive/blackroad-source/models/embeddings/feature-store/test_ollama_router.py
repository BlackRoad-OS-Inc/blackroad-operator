"""Tests for Ollama Router."""
import json
import sys
import unittest.mock as mock

import pytest

from ollama_router import (
    OLLAMA_TRIGGERS,
    detect_trigger,
    query_ollama,
    route,
    strip_triggers,
)

# ---------------------------------------------------------------------------
# detect_trigger
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "text,expected",
    [
        ("@ollama what is the weather?", "@ollama"),
        ("Hey @copilot, explain this code", "@copilot"),
        ("@lucidia summarize my data", "@lucidia"),
        ("@blackboxprogramming write a test", "@blackboxprogramming"),
        ("UPPER @OLLAMA case", "@ollama"),
        ("no trigger here", None),
        ("email@example.com", None),
    ],
)
def test_detect_trigger(text, expected):
    assert detect_trigger(text) == expected


def test_detect_trigger_returns_first_match():
    # When multiple triggers are present the first one found is returned
    result = detect_trigger("@ollama and @copilot")
    assert result in OLLAMA_TRIGGERS


# ---------------------------------------------------------------------------
# strip_triggers
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "text,expected",
    [
        ("@ollama what is 2+2?", "what is 2+2?"),
        ("@copilot explain recursion", "explain recursion"),
        ("@lucidia @ollama clean both", "clean both"),
        ("no trigger here", "no trigger here"),
    ],
)
def test_strip_triggers(text, expected):
    assert strip_triggers(text) == expected


# ---------------------------------------------------------------------------
# query_ollama
# ---------------------------------------------------------------------------

_FAKE_RESPONSE = {"model": "llama3", "response": "Hello!", "done": True}


def _make_mock_urlopen(response_body: dict):
    """Return a context-manager mock that yields a fake HTTP response."""
    mock_resp = mock.MagicMock()
    mock_resp.read.return_value = json.dumps(response_body).encode()
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = mock.MagicMock(return_value=False)
    return mock_resp


def test_query_ollama_sends_correct_payload():
    mock_resp = _make_mock_urlopen(_FAKE_RESPONSE)
    with mock.patch("urllib.request.urlopen", return_value=mock_resp) as mock_open:
        result = query_ollama("hello", model="llama3", base_url="http://localhost:11434")

    assert result == _FAKE_RESPONSE
    call_args = mock_open.call_args
    req = call_args[0][0]
    assert req.full_url == "http://localhost:11434/api/generate"
    payload = json.loads(req.data)
    assert payload["model"] == "llama3"
    assert payload["prompt"] == "hello"
    assert payload["stream"] is False


def test_query_ollama_connection_error():
    import urllib.error

    with mock.patch("urllib.request.urlopen", side_effect=urllib.error.URLError("refused")):
        with pytest.raises(ConnectionError, match="Cannot reach Ollama"):
            query_ollama("ping", base_url="http://localhost:11434")


# ---------------------------------------------------------------------------
# route
# ---------------------------------------------------------------------------


def test_route_with_trigger():
    mock_resp = _make_mock_urlopen(_FAKE_RESPONSE)
    with mock.patch("urllib.request.urlopen", return_value=mock_resp):
        result = route("@ollama what is 2+2?", base_url="http://localhost:11434")

    assert result["routed"] is True
    assert result["trigger"] == "@ollama"
    assert result["response"] == _FAKE_RESPONSE


@pytest.mark.parametrize("trigger", sorted(OLLAMA_TRIGGERS))
def test_route_all_triggers(trigger):
    mock_resp = _make_mock_urlopen(_FAKE_RESPONSE)
    with mock.patch("urllib.request.urlopen", return_value=mock_resp):
        result = route(f"{trigger} explain feature stores", base_url="http://localhost:11434")

    assert result["routed"] is True
    assert result["trigger"] == trigger.lower()


def test_route_no_trigger():
    result = route("no mention here")
    assert result["routed"] is False
    assert result["trigger"] is None
    assert result["response"] is None


def test_route_strips_trigger_before_sending():
    mock_resp = _make_mock_urlopen(_FAKE_RESPONSE)
    with mock.patch("urllib.request.urlopen", return_value=mock_resp) as mock_open:
        route("@copilot explain recursion", base_url="http://localhost:11434")

    req = mock_open.call_args[0][0]
    payload = json.loads(req.data)
    assert "@copilot" not in payload["prompt"]
    assert "recursion" in payload["prompt"]
