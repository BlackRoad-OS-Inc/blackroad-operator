"""Minute interval provider canary."""

from __future__ import annotations

import json
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
import yaml

CONFIG_PATH = Path(os.getenv("PROVIDER_CONFIG_PATH", "/config/providers.yaml"))
HEALTH_SINK_URL = os.getenv("HEALTH_SINK_URL")
DEFAULT_MODEL = os.getenv("OPENAI_CANARY_MODEL", "gpt-4o-mini")

_ENV_PATTERN = re.compile(r"\$\{([^}]+)\}")


@dataclass
class Provider:
    name: str
    request: Dict[str, Any]
    expectations: Dict[str, Any]


class ConfigurationError(RuntimeError):
    """Raised when provider configuration is invalid."""


def _resolve_env(value: Any) -> Any:
    if isinstance(value, str):
        def repl(match: re.Match[str]) -> str:
            key = match.group(1)
            return os.getenv(key, "")

        return _ENV_PATTERN.sub(repl, value)
    if isinstance(value, dict):
        return {k: _resolve_env(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_resolve_env(item) for item in value]
    return value


def load_providers() -> List[Provider]:
    if not CONFIG_PATH.exists():
        raise ConfigurationError(f"Provider config not found at {CONFIG_PATH}")
    with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    providers: List[Provider] = []
    for raw in data.get("providers", []):
        name = raw.get("name")
        canary = raw.get("canary", {})
        expectations = raw.get("expectations", {})
        if not name:
            raise ConfigurationError("Provider entry missing name")
        if "url" not in canary:
            raise ConfigurationError(f"Provider '{name}' missing canary.url")
        request = {
            "url": canary.get("url"),
            "method": (canary.get("method") or "POST").upper(),
            "timeout": canary.get("timeout_seconds", 10),
            "headers": canary.get("headers", {}),
            "body": canary.get("body", {}),
        }
        providers.append(Provider(name=name, request=request, expectations=expectations))
    if not providers:
        raise ConfigurationError("No providers configured")
    return providers


def _tokens_from_response(payload: Dict[str, Any]) -> int:
    usage = payload.get("usage", {})
    total = usage.get("total_tokens")
    if isinstance(total, int):
        return total
    if isinstance(total, str) and total.isdigit():
        return int(total)
    return 0


def _call_provider(provider: Provider) -> Dict[str, Any]:
    req = _resolve_env(provider.request)
    url = req.get("url")
    if not url:
        raise ConfigurationError(f"Provider '{provider.name}' url resolved to empty string")
    method = req.get("method", "POST")
    timeout = req.get("timeout", 10)
    headers = req.get("headers", {})
    body = req.get("body", {})
    if not body.get("model"):
        body["model"] = DEFAULT_MODEL
    if "messages" not in body:
        body["messages"] = [{"role": "user", "content": "BlackRoad Prism canary"}]
    start = time.time()
    response = requests.request(method, url, headers=headers, json=body, timeout=timeout)
    elapsed_ms = int((time.time() - start) * 1000)
    ok = response.status_code == 200
    tokens = 0
    details: Dict[str, Any] = {}
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    tokens = _tokens_from_response(payload)
    expectations = provider.expectations
    max_latency = expectations.get("max_latency_ms")
    max_tokens = expectations.get("max_tokens")
    if max_latency is not None:
        ok = ok and elapsed_ms <= int(max_latency)
    if max_tokens is not None:
        ok = ok and tokens <= int(max_tokens)
    details.update(payload if isinstance(payload, dict) else {})
    return {
        "provider": provider.name,
        "status_code": response.status_code,
        "latency_ms": elapsed_ms,
        "ok": bool(ok),
        "tokens": tokens,
        "response": details,
    }


def _emit_sample(sample: Dict[str, Any]) -> None:
    if not HEALTH_SINK_URL:
        return
    try:
        requests.post(
            HEALTH_SINK_URL.rstrip("/") + "/samples",
            json={
                "provider": sample["provider"],
                "latency_ms": sample["latency_ms"],
                "code": sample["status_code"],
                "ok": sample["ok"],
                "tokens": sample["tokens"],
                "timestamp": time.time(),
            },
            timeout=5,
        )
    except requests.RequestException:
        pass


def main() -> int:
    providers = load_providers()
    results: List[Dict[str, Any]] = []
    for provider in providers:
        try:
            outcome = _call_provider(provider)
        except Exception as exc:  # pragma: no cover - surfaced in job logs
            outcome = {
                "provider": provider.name,
                "status_code": 0,
                "latency_ms": 0,
                "ok": False,
                "tokens": 0,
                "error": str(exc),
            }
        results.append(outcome)
        _emit_sample(outcome)
    ts = int(time.time())
    print(json.dumps({"ts": ts, "results": results}))
    return 0 if all(item.get("ok") for item in results) else 2


if __name__ == "__main__":
    try:
        exit_code = main()
    except ConfigurationError as exc:
        print(json.dumps({"ts": int(time.time()), "error": str(exc)}))
        exit_code = 2
    sys.exit(exit_code)
