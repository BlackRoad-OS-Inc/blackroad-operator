"""
BlackRoad Ollama Router
Routes all @copilot, @lucidia, @blackboxprogramming, and @ollama requests
directly to a local Ollama instance — no external AI provider dependency.
"""

from __future__ import annotations

import re
from typing import Optional

import requests

# ---------------------------------------------------------------------------
# Alias registry — every alias maps to Ollama
# ---------------------------------------------------------------------------

ALIASES: set[str] = {"@copilot", "@lucidia", "@blackboxprogramming", "@ollama"}

OLLAMA_DEFAULT_HOST: str = "http://localhost:11434"
OLLAMA_DEFAULT_MODEL: str = "llama3"

_ALIAS_RE = re.compile(
    r"(?i)\B(" + "|".join(re.escape(a) for a in sorted(ALIASES, key=len, reverse=True)) + r")\b"
)


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

def parse_alias(message: str) -> Optional[str]:
    """
    Return the first @alias found in *message*, or None.
    All detected aliases resolve to the Ollama backend.
    """
    m = _ALIAS_RE.search(message)
    if m:
        return m.group(1).lower()
    return None


def strip_alias(message: str) -> str:
    """Remove all @alias tokens from a message and return the clean prompt."""
    return _ALIAS_RE.sub("", message).strip()


def send_to_ollama(
    prompt: str,
    *,
    model: str = OLLAMA_DEFAULT_MODEL,
    host: str = OLLAMA_DEFAULT_HOST,
    stream: bool = False,
    timeout: int = 120,
) -> dict:
    """
    POST *prompt* to the local Ollama /api/generate endpoint.

    Returns the parsed JSON response dict.
    Propagates ``requests.RequestException`` on network errors (connection
    refused, timeout, etc.) — these are not caught here so that callers can
    decide how to handle them.
    Raises ``OllamaError`` if Ollama returns a non-2xx status.
    """
    url = host.rstrip("/") + "/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": stream}
    resp = requests.post(url, json=payload, timeout=timeout)
    if not resp.ok:
        raise OllamaError(f"Ollama returned HTTP {resp.status_code}: {resp.text[:200]}")
    return resp.json()


def route_request(
    message: str,
    *,
    model: str = OLLAMA_DEFAULT_MODEL,
    host: str = OLLAMA_DEFAULT_HOST,
    stream: bool = False,
    timeout: int = 120,
) -> dict:
    """
    Detect any @alias in *message* and forward the cleaned prompt to Ollama.

    Returns a dict with keys:
      - ``alias``    : the @alias that was detected (or None)
      - ``prompt``   : the cleaned prompt sent to Ollama
      - ``routed_to``: always ``"ollama"`` when an alias is present
      - ``response`` : the raw Ollama response dict (only when alias detected)

    If no alias is detected the message is still forwarded to Ollama with
    ``alias=None`` so that the caller always receives a consistent result.
    """
    alias = parse_alias(message)
    prompt = strip_alias(message) if alias else message
    response = send_to_ollama(
        prompt, model=model, host=host, stream=stream, timeout=timeout
    )
    return {
        "alias": alias,
        "prompt": prompt,
        "routed_to": "ollama",
        "response": response,
    }


# ---------------------------------------------------------------------------
# Errors
# ---------------------------------------------------------------------------

class OllamaError(RuntimeError):
    """Raised when the Ollama service returns an error response."""
