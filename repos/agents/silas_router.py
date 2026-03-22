"""Local-first router for Silas structured reasoning queries."""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Iterable, Optional

import requests
from requests import Response

LOGGER = logging.getLogger(__name__)

DEFAULT_SAFE_MODE = "1"
VLLM_BASE = "http://localhost:8000/v1"
OLLAMA_BASE = "http://localhost:11434/v1"
OLLAMA_CHAT_PATH = "/api/chat"
XAI_BASE = "https://api.x.ai/v1"
DEFAULT_TIMEOUT = float(os.getenv("SILAS_HTTP_TIMEOUT", "3"))
DEFAULT_MODEL = os.getenv("SILAS_MODEL", "gpt-4o-mini")
OLLAMA_DEFAULT_MODEL = os.getenv("SILAS_OLLAMA_MODEL", "llama3")


class SilasRouterError(RuntimeError):
    """Raised when the Silas router cannot fulfil a request."""


def _safe_mode_enabled() -> bool:
    return os.getenv("SAFE_MODE", DEFAULT_SAFE_MODE) != "0"


def _candidate_urls() -> Iterable[str]:
    env_base = os.getenv("BASE_URL")
    if env_base:
        yield env_base.rstrip("/")
    # Prefer local Ollama over any other backend
    yield OLLAMA_BASE
    yield VLLM_BASE
    if os.getenv("XAI_API_KEY"):
        yield XAI_BASE


def _classify_base(base_url: str) -> str:
    if "11434" in base_url:
        return "ollama"
    if base_url.startswith(XAI_BASE):
        return "xai"
    return "openai"


def _normalise_base(base_url: str, provider: str) -> str:
    base = base_url.rstrip("/")
    if provider == "ollama":
        if base.endswith("/v1"):
            base = base[:-3]
    return base


def _chat_endpoint(base_url: str, provider: str) -> str:
    if provider == "ollama":
        base = _normalise_base(base_url, provider)
        return f"{base}{OLLAMA_CHAT_PATH}"
    base = _normalise_base(base_url, provider)
    return f"{base}/chat/completions"


def _headers_for(provider: str) -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if provider == "xai":
        api_key = os.getenv("XAI_API_KEY")
        if not api_key:
            raise SilasRouterError("XAI_API_KEY is required for xAI requests")
        headers["Authorization"] = f"Bearer {api_key}"
    else:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
    return headers


def _prepare_payload(
    provider: str, query: str, schema: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    if provider == "ollama":
        payload: Dict[str, Any] = {
            "model": OLLAMA_DEFAULT_MODEL,
            "messages": [{"role": "user", "content": query}],
            "stream": False,
        }
        if schema:
            payload["format"] = schema
        else:
            payload["format"] = "json"
        return payload

    payload = {
        "model": DEFAULT_MODEL,
        "messages": [{"role": "user", "content": query}],
        "temperature": 0,
    }
    if schema:
        payload["extra_body"] = {"structured_outputs": {"json": schema}}
    return payload


def _send_request(url: str, headers: Dict[str, str], payload: Dict[str, Any]) -> Response:
    LOGGER.debug("Silas router POST %s", url)
    response = requests.post(url, headers=headers, json=payload, timeout=DEFAULT_TIMEOUT)
    response.raise_for_status()
    return response


def _try_parse_json(value: Any) -> Optional[Dict[str, Any]]:
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            pass
    if isinstance(value, list):
        text = "".join(part.get("text", "") for part in value if isinstance(part, dict))
        return _try_parse_json(text)
    return None


def _parse_openai_like_response(data: Dict[str, Any]) -> Dict[str, Any]:
    choices = data.get("choices") or []
    for choice in choices:
        message = choice.get("message") or {}
        for key in ("parsed", "content"):
            parsed = _try_parse_json(message.get(key))
            if parsed is not None:
                return parsed
        tool_calls = message.get("tool_calls") or []
        for tool_call in tool_calls:
            arguments = tool_call.get("function", {}).get("arguments")
            parsed = _try_parse_json(arguments)
            if parsed is not None:
                return parsed
    raise SilasRouterError("Unable to parse structured response from provider")


def _parse_ollama_response(data: Dict[str, Any]) -> Dict[str, Any]:
    message = data.get("message", {})
    parsed = _try_parse_json(message.get("content"))
    if parsed is not None:
        return parsed
    # Some Ollama builds stream tokens inside "response"
    parsed = _try_parse_json(data.get("response"))
    if parsed is not None:
        return parsed
    raise SilasRouterError("Unable to parse structured response from Ollama")


def silas(query: str, schema: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Execute a Silas reasoning request using the best available local backend."""
    if _safe_mode_enabled():
        raise SilasRouterError(
            "SAFE_MODE is enabled; disable by setting SAFE_MODE=0 to run Silas queries."
        )

    errors: Dict[str, str] = {}
    for base in _candidate_urls():
        provider = _classify_base(base)
        url = _chat_endpoint(base, provider)
        headers = _headers_for(provider)
        payload = _prepare_payload(provider, query, schema)
        try:
            response = _send_request(url, headers, payload)
            data = response.json()
            if provider == "ollama":
                return _parse_ollama_response(data)
            return _parse_openai_like_response(data)
        except Exception as exc:  # pragma: no cover - logged but aggregated
            LOGGER.debug("Silas backend %s failed: %s", base, exc)
            errors[base] = str(exc)
            continue

    raise SilasRouterError(
        "All Silas backends failed: "
        + "; ".join(f"{base} -> {msg}" for base, msg in errors.items())
    )


__all__ = ["silas", "SilasRouterError"]
