"""
Ollama Router
=============
Detects AI-assistant mention triggers in a prompt string and routes every
request to a locally-running Ollama instance.  No external AI provider
(OpenAI, Anthropic, GitHub Copilot, …) is ever contacted.

Supported trigger mentions (case-insensitive):
    @ollama
    @copilot
    @lucidia
    @blackboxprogramming

Environment variables:
    OLLAMA_BASE_URL   – Base URL of the Ollama server (default: http://localhost:11434)
    OLLAMA_MODEL      – Default model to use            (default: llama3)
"""

import json
import os
import re
import urllib.error
import urllib.request
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_DEFAULT_MODEL: str = os.environ.get("OLLAMA_MODEL", "llama3")

# Mentions that trigger routing to Ollama (lowercase, without the @)
OLLAMA_TRIGGERS: frozenset = frozenset(
    {"ollama", "copilot", "lucidia", "blackboxprogramming"}
)

# Regex that matches any of the trigger mentions at word-boundary positions
_MENTION_RE = re.compile(
    r"@(" + "|".join(re.escape(t) for t in OLLAMA_TRIGGERS) + r")\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def contains_mention(text: str) -> bool:
    """Return True if *text* contains at least one Ollama trigger mention."""
    return bool(_MENTION_RE.search(text))


def strip_mentions(text: str) -> str:
    """Remove all Ollama trigger mentions from *text* and normalise whitespace."""
    cleaned = _MENTION_RE.sub("", text)
    return " ".join(cleaned.split())


def query_ollama(
    prompt: str,
    model: Optional[str] = None,
    base_url: Optional[str] = None,
    stream: bool = False,
) -> str:
    """Send *prompt* to a running Ollama instance and return the response text.

    Args:
        prompt:   The user prompt to send.
        model:    Ollama model name (defaults to OLLAMA_DEFAULT_MODEL).
        base_url: Ollama server base URL (defaults to OLLAMA_BASE_URL).
        stream:   If True, stream tokens and accumulate; otherwise request the
                  full response in one shot.

    Returns:
        The response string from Ollama.

    Raises:
        urllib.error.URLError: if the Ollama server is not reachable.
        RuntimeError: if Ollama returns an unexpected response format.
    """
    model = model or OLLAMA_DEFAULT_MODEL
    base_url = (base_url or OLLAMA_BASE_URL).rstrip("/")

    payload = json.dumps(
        {"model": model, "prompt": prompt, "stream": stream}
    ).encode()

    req = urllib.request.Request(
        url=f"{base_url}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode()

    if stream:
        # Streamed responses are newline-delimited JSON objects
        parts = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            parts.append(obj.get("response", ""))
            if obj.get("done"):
                break
        return "".join(parts)

    obj = json.loads(raw)
    if "response" not in obj:
        raise RuntimeError(f"Unexpected Ollama response: {raw!r}")
    return obj["response"]


def route(
    text: str,
    model: Optional[str] = None,
    base_url: Optional[str] = None,
) -> str:
    """High-level entry-point: strip mention(s) from *text*, then query Ollama.

    Args:
        text:     Raw user input (may or may not contain mention triggers).
        model:    Ollama model override.
        base_url: Ollama server base URL override.

    Returns:
        Ollama response string.

    Raises:
        ValueError: if *text* contains no recognised mention trigger.
    """
    if not contains_mention(text):
        raise ValueError(
            "No Ollama trigger mention found in the prompt. "
            "Prefix your message with @ollama, @copilot, @lucidia, or "
            "@blackboxprogramming to route to Ollama."
        )
    prompt = strip_mentions(text)
    return query_ollama(prompt, model=model, base_url=base_url)
