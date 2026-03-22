"""
Ollama Router — route @mention triggers to a local Ollama instance.

Supported trigger aliases (case-insensitive):
    @ollama, @copilot, @lucidia, @blackboxprogramming

All requests are forwarded to a locally-running Ollama server.
No external AI provider is involved.

Environment variables:
    OLLAMA_BASE_URL   Base URL of Ollama server (default: http://localhost:11434)
    OLLAMA_MODEL      Default model name       (default: llama3)
"""

import argparse
import json
import logging
import os
import re
import urllib.error
import urllib.request

logger = logging.getLogger("ollama_router")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OLLAMA_BASE_URL: str = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_DEFAULT_MODEL: str = os.environ.get("OLLAMA_MODEL", "llama3")

# All @mentions that route to Ollama — add more aliases here as needed
OLLAMA_TRIGGERS: frozenset = frozenset(
    {"@ollama", "@copilot", "@lucidia", "@blackboxprogramming"}
)

# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

_TRIGGER_PATTERN = re.compile(
    r"(" + "|".join(re.escape(t) for t in sorted(OLLAMA_TRIGGERS, key=len, reverse=True)) + r")",
    re.IGNORECASE,
)


def detect_trigger(text: str) -> str | None:
    """Return the first recognised @mention trigger found in *text*, or ``None``."""
    match = _TRIGGER_PATTERN.search(text)
    return match.group(0).lower() if match else None


def strip_triggers(text: str) -> str:
    """Remove all Ollama @mention triggers from *text* and return the cleaned prompt."""
    return _TRIGGER_PATTERN.sub("", text).strip()


def query_ollama(
    prompt: str,
    *,
    model: str | None = None,
    base_url: str | None = None,
    stream: bool = False,
    timeout: int = 120,
) -> dict:
    """Send *prompt* to a local Ollama server and return the parsed response dict.

    Args:
        prompt:   The text prompt to send.
        model:    Ollama model name (overrides ``OLLAMA_MODEL`` env var).
        base_url: Ollama server base URL (overrides ``OLLAMA_BASE_URL`` env var).
        stream:   Whether to request streaming output (default ``False``).
        timeout:  HTTP timeout in seconds.

    Returns:
        Parsed JSON response from Ollama.

    Raises:
        ConnectionError: If the Ollama server is unreachable.
    """
    url = f"{base_url or OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": model or OLLAMA_DEFAULT_MODEL,
        "prompt": prompt,
        "stream": stream,
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read())
    except urllib.error.URLError as exc:
        raise ConnectionError(
            f"Cannot reach Ollama at {url}. Is 'ollama serve' running?"
        ) from exc


def route(
    text: str,
    *,
    model: str | None = None,
    base_url: str | None = None,
) -> dict:
    """Route *text* to Ollama when an @mention trigger is present.

    Args:
        text:     The raw user input (may contain @mention triggers).
        model:    Ollama model override.
        base_url: Ollama server base URL override.

    Returns:
        A dict with keys:

        * ``routed``   — ``True`` if a trigger was detected and the request was sent.
        * ``trigger``  — The matched trigger string, or ``None``.
        * ``response`` — Ollama response dict, or ``None`` if not routed.
    """
    trigger = detect_trigger(text)
    if not trigger:
        return {"routed": False, "trigger": None, "response": None}

    prompt = strip_triggers(text)
    logger.info("Routing to Ollama (trigger=%s, model=%s)", trigger, model or OLLAMA_DEFAULT_MODEL)
    response = query_ollama(prompt, model=model, base_url=base_url)
    return {"routed": True, "trigger": trigger, "response": response}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Route @mention prompts to a local Ollama instance.\n"
            "Triggers: " + ", ".join(sorted(OLLAMA_TRIGGERS))
        )
    )
    parser.add_argument("prompt", help="Prompt text (may include @mention trigger)")
    parser.add_argument("--model", default=None, help="Ollama model (default: $OLLAMA_MODEL or llama3)")
    parser.add_argument("--base-url", default=None, help="Ollama server URL (default: $OLLAMA_BASE_URL)")
    return parser


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    parser = _build_parser()
    args = parser.parse_args()

    result = route(args.prompt, model=args.model, base_url=args.base_url)
    if not result["routed"]:
        print(
            "No Ollama trigger found in prompt.\n"
            f"Supported triggers: {', '.join(sorted(OLLAMA_TRIGGERS))}"
        )
        return

    response = result["response"]
    print(response.get("response", json.dumps(response, indent=2)))


if __name__ == "__main__":
    main()
