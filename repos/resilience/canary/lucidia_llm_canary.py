"""Lucidia LLM canary probe.

This script pings the lightest-weight chat endpoint for each configured
provider to detect outages or latency regressions before user traffic is
impacted. It is tailored for the BlackRoad/Prism stack:

* Primary provider – the in-cluster Lucidia LLM service (`llm.prism.svc`).
* Fallback provider – the pre-approved secondary model (defaults to the
  Qwen2 bridge exposed via `ollama-bridge.prism.svc`).

The probe emits structured JSON so Loki/Cloud Logging can aggregate the
results. When invoked inside the Kubernetes CronJob it also forwards the
samples to the `llm-healthwatch` sidecar which maintains rolling SLOs for
`/healthz`.
"""
from __future__ import annotations

import json
import os
import sys
import time
from dataclasses import dataclass
from typing import Iterable, List, Mapping, MutableMapping

import requests

DEFAULT_EXPECTATIONS = {
    "max_p95_ms": int(os.getenv("PRISM_LLM_CANARY_MAX_P95_MS", "1200")),
    "max_tokens": int(os.getenv("PRISM_LLM_CANARY_MAX_TOKENS", "32")),
}

HEALTHWATCH_ENDPOINT = os.getenv(
    "PRISM_LLM_HEALTHWATCH_URL", "http://llm-healthwatch.prism.svc.cluster.local:8080"
)
HEALTHWATCH_SAMPLES_PATH = os.getenv("PRISM_LLM_HEALTHWATCH_SAMPLES_PATH", "/samples")


@dataclass(frozen=True)
class Provider:
    name: str
    url: str
    api_key: str | None = None
    model: str = "lucidia"

    @classmethod
    def from_env(cls, name: str, prefix: str) -> "Provider":
        base_url = os.getenv(f"{prefix}_URL")
        if not base_url:
            raise RuntimeError(f"Missing {prefix}_URL for provider '{name}'")
        api_key = os.getenv(f"{prefix}_KEY")
        model = os.getenv(f"{prefix}_MODEL", "lucidia")
        return cls(name=name, url=base_url.rstrip("/"), api_key=api_key, model=model)


def load_providers() -> List[Provider]:
    providers: List[Provider] = []
    mapping: MutableMapping[str, str] = {
        "lucidia-primary": "PRISM_LUCIDIA_PRIMARY",
        "lucidia-fallback": "PRISM_LUCIDIA_FALLBACK",
    }
    for name, prefix in mapping.items():
        try:
            providers.append(Provider.from_env(name, prefix))
        except RuntimeError as exc:
            raise RuntimeError(
                f"Provider configuration error for {name}: {exc}.\n"
                "Ensure the CronJob secret exposes env vars like PRISM_LUCIDIA_PRIMARY_URL."
            ) from exc
    extra_prefixes = os.getenv("PRISM_LLM_EXTRA_CANARY_PROVIDERS", "").split(",")
    for entry in filter(None, (val.strip() for val in extra_prefixes)):
        safe = entry.upper().replace("-", "_")
        providers.append(Provider.from_env(entry, safe))
    return providers


def build_request(provider: Provider) -> Mapping[str, object]:
    return {
        "model": provider.model,
        "messages": [
            {
                "role": "system",
                "content": "You are Lucidia. Reply with the exact word 'pong'.",
            },
            {"role": "user", "content": "Ping?"},
        ],
        "max_tokens": 8,
        "temperature": 0,
        "stream": False,
    }


def call_provider(provider: Provider) -> Mapping[str, object]:
    payload = build_request(provider)
    headers = {"Content-Type": "application/json"}
    if provider.api_key:
        headers["Authorization"] = f"Bearer {provider.api_key}"

    if provider.url.endswith("/v1/chat") or provider.url.endswith("/chat"):
        request_url = provider.url
    else:
        request_url = f"{provider.url}/v1/chat"
    started = time.perf_counter()
    timed_out = False
    try:
        response = requests.post(request_url, headers=headers, json=payload, timeout=10)
        latency_ms = int((time.perf_counter() - started) * 1000)
        ok = response.status_code == 200
        token_usage = 0
        if ok:
            data = response.json()
            usage = data.get("usage") or {}
            token_usage = int(usage.get("total_tokens", 0))
            text = "".join(chunk.get("text", "") for chunk in data.get("choices", []))
            if text.strip().lower() != "pong":
                ok = False
        else:
            data = None
    except (requests.Timeout, requests.ConnectionError):
        latency_ms = int((time.perf_counter() - started) * 1000)
        ok = False
        data = None
        response = None
        timed_out = True
        token_usage = 0

    record = {
        "provider": provider.name,
        "model": provider.model,
        "latency_ms": latency_ms,
        "status_code": getattr(response, "status_code", 0),
        "ok": ok and latency_ms < DEFAULT_EXPECTATIONS["max_p95_ms"] and token_usage <= DEFAULT_EXPECTATIONS["max_tokens"],
        "timed_out": timed_out,
        "token_usage": token_usage,
    }
    if data is not None:
        record["raw"] = data
    return record


def push_samples(samples: Iterable[Mapping[str, object]]) -> None:
    url = f"{HEALTHWATCH_ENDPOINT.rstrip('/')}{HEALTHWATCH_SAMPLES_PATH}"
    try:
        response = requests.post(url, json={"samples": list(samples)}, timeout=3)
        if response.status_code >= 300:
            print(
                json.dumps(
                    {
                        "ts": int(time.time()),
                        "component": "lucidia-canary",
                        "level": "warn",
                        "message": "failed to push samples to healthwatch",
                        "status": response.status_code,
                        "body": response.text,
                    }
                ),
                file=sys.stderr,
            )
    except requests.RequestException as exc:
        print(
            json.dumps(
                {
                    "ts": int(time.time()),
                    "component": "lucidia-canary",
                    "level": "warn",
                    "message": "exception while pushing samples",
                    "error": str(exc),
                }
            ),
            file=sys.stderr,
        )



def main() -> int:
    try:
        providers = load_providers()
    except RuntimeError as exc:
        print(json.dumps({"ts": int(time.time()), "component": "lucidia-canary", "error": str(exc)}))
        return 2

    samples = [call_provider(provider) for provider in providers]
    push_samples(samples)

    payload = {
        "ts": int(time.time()),
        "component": "lucidia-canary",
        "results": samples,
    }
    print(json.dumps(payload))
    overall_ok = all(sample.get("ok") for sample in samples)
    return 0 if overall_ok else 2


if __name__ == "__main__":
    sys.exit(main())
