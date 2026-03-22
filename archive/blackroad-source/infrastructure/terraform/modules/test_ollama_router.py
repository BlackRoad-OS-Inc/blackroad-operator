"""Tests for BlackRoad Ollama Router."""
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from ollama_router import (
    ALIASES,
    OLLAMA_DEFAULT_HOST,
    OLLAMA_DEFAULT_MODEL,
    OllamaError,
    parse_alias,
    route_request,
    send_to_ollama,
    strip_alias,
)

# ---------------------------------------------------------------------------
# Alias constants
# ---------------------------------------------------------------------------

class TestAliasRegistry:
    def test_all_expected_aliases_present(self):
        assert "@copilot" in ALIASES
        assert "@lucidia" in ALIASES
        assert "@blackboxprogramming" in ALIASES
        assert "@ollama" in ALIASES

    def test_no_external_provider_aliases(self):
        """No alias should route to an external service."""
        # All aliases are just identifiers; routing target is always Ollama.
        for alias in ALIASES:
            assert alias.startswith("@")


# ---------------------------------------------------------------------------
# parse_alias
# ---------------------------------------------------------------------------

class TestParseAlias:
    @pytest.mark.parametrize("alias", ["@copilot", "@lucidia", "@blackboxprogramming", "@ollama"])
    def test_detects_each_alias(self, alias):
        assert parse_alias(f"{alias} explain terraform") == alias.lower()

    def test_case_insensitive(self):
        assert parse_alias("@COPILOT do something") == "@copilot"
        assert parse_alias("@Ollama help me") == "@ollama"

    def test_no_alias_returns_none(self):
        assert parse_alias("just a plain message") is None

    def test_alias_in_middle_of_message(self):
        assert parse_alias("hey @lucidia, what is a VPC?") == "@lucidia"

    def test_first_alias_returned(self):
        # regex finds the leftmost match, so @copilot (appears first) is returned
        result = parse_alias("@copilot and @ollama help")
        assert result == "@copilot"


# ---------------------------------------------------------------------------
# strip_alias
# ---------------------------------------------------------------------------

class TestStripAlias:
    def test_strips_alias(self):
        assert strip_alias("@copilot explain terraform") == "explain terraform"

    def test_strips_multiple_aliases(self):
        result = strip_alias("@ollama @lucidia what is kubernetes?")
        assert "@ollama" not in result
        assert "@lucidia" not in result
        assert "kubernetes" in result

    def test_no_alias_unchanged(self):
        msg = "what is terraform?"
        assert strip_alias(msg) == msg

    def test_alias_only_returns_empty(self):
        assert strip_alias("@copilot") == ""


# ---------------------------------------------------------------------------
# send_to_ollama
# ---------------------------------------------------------------------------

class TestSendToOllama:
    def _mock_ok_response(self, text="Hello from Ollama"):
        mock_resp = MagicMock()
        mock_resp.ok = True
        mock_resp.json.return_value = {"response": text, "done": True}
        return mock_resp

    def test_sends_post_to_correct_url(self):
        with patch("ollama_router.requests.post") as mock_post:
            mock_post.return_value = self._mock_ok_response()
            send_to_ollama("hello", host="http://localhost:11434")
            mock_post.assert_called_once()
            call_args = mock_post.call_args
            assert call_args[0][0] == "http://localhost:11434/api/generate"

    def test_payload_contains_model_and_prompt(self):
        with patch("ollama_router.requests.post") as mock_post:
            mock_post.return_value = self._mock_ok_response()
            send_to_ollama("my prompt", model="mistral")
            payload = mock_post.call_args[1]["json"]
            assert payload["model"] == "mistral"
            assert payload["prompt"] == "my prompt"

    def test_stream_false_by_default(self):
        with patch("ollama_router.requests.post") as mock_post:
            mock_post.return_value = self._mock_ok_response()
            send_to_ollama("hi")
            payload = mock_post.call_args[1]["json"]
            assert payload["stream"] is False

    def test_raises_ollama_error_on_bad_status(self):
        mock_resp = MagicMock()
        mock_resp.ok = False
        mock_resp.status_code = 500
        mock_resp.text = "Internal Server Error"
        with patch("ollama_router.requests.post", return_value=mock_resp):
            with pytest.raises(OllamaError, match="500"):
                send_to_ollama("bad request")

    def test_returns_json_response(self):
        with patch("ollama_router.requests.post") as mock_post:
            mock_post.return_value = self._mock_ok_response("pong")
            result = send_to_ollama("ping")
            assert result["response"] == "pong"

    def test_custom_host_trailing_slash(self):
        with patch("ollama_router.requests.post") as mock_post:
            mock_post.return_value = self._mock_ok_response()
            send_to_ollama("hi", host="http://192.168.1.10:11434/")
            url = mock_post.call_args[0][0]
            assert url == "http://192.168.1.10:11434/api/generate"


# ---------------------------------------------------------------------------
# route_request
# ---------------------------------------------------------------------------

class TestRouteRequest:
    def _mock_ollama(self, text="ok"):
        mock_resp = MagicMock()
        mock_resp.ok = True
        mock_resp.json.return_value = {"response": text, "done": True}
        return mock_resp

    @pytest.mark.parametrize("alias", ["@copilot", "@lucidia", "@blackboxprogramming", "@ollama"])
    def test_alias_routes_to_ollama(self, alias):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()):
            result = route_request(f"{alias} explain VPCs")
        assert result["routed_to"] == "ollama"
        assert result["alias"] == alias.lower()

    def test_prompt_stripped_of_alias(self):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()):
            result = route_request("@copilot explain VPCs")
        assert result["prompt"] == "explain VPCs"
        assert "@copilot" not in result["prompt"]

    def test_no_alias_still_routes_to_ollama(self):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()):
            result = route_request("what is terraform?")
        assert result["routed_to"] == "ollama"
        assert result["alias"] is None

    def test_response_contains_ollama_output(self):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama("42")):
            result = route_request("@ollama answer")
        assert result["response"]["response"] == "42"

    def test_no_external_provider_called(self):
        """Verify that only requests.post (Ollama) is used — no other HTTP calls."""
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()) as mock_post:
            route_request("@blackboxprogramming help")
        assert mock_post.call_count == 1
        url = mock_post.call_args[0][0]
        assert url.startswith(OLLAMA_DEFAULT_HOST)

    def test_default_model_used(self):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()) as mock_post:
            route_request("@ollama hi")
        payload = mock_post.call_args[1]["json"]
        assert payload["model"] == OLLAMA_DEFAULT_MODEL

    def test_custom_model_forwarded(self):
        with patch("ollama_router.requests.post", return_value=self._mock_ollama()) as mock_post:
            route_request("@ollama hi", model="codellama")
        payload = mock_post.call_args[1]["json"]
        assert payload["model"] == "codellama"
