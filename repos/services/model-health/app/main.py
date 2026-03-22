from __future__ import annotations

import json
import os
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError

WINDOW_SECONDS = 5 * 60


def _determine_config_path() -> Path:
    env_path = os.getenv("PROVIDER_CONFIG_PATH")
    if env_path:
        path = Path(env_path)
        if path.exists():
            return path
    default = Path("/config/providers.yaml")
    if default.exists():
        return default
    fallback = Path(__file__).resolve().parents[3] / "configs" / "aiops" / "providers.yaml"
    return fallback


CONFIG_PATH = _determine_config_path()
INCIDENT_LOG_PATH = Path(os.getenv("INCIDENT_LOG_PATH", "/var/log/model-incidents.jsonl"))


class SamplePayload(BaseModel):
    provider: str
    latency_ms: int = Field(..., ge=0)
    code: int
    ok: bool
    tokens: Optional[int] = Field(default=None, ge=0)
    timestamp: Optional[float] = None


class CanaryConfig(BaseModel):
    url: Optional[str]
    method: str = "POST"
    timeout_seconds: int = 10
    headers: Dict[str, str] = Field(default_factory=dict)
    body: Dict[str, Any] = Field(default_factory=dict)


class ExpectationConfig(BaseModel):
    max_tokens: int = 32
    max_latency_ms: int = 1200


class SLOConfig(BaseModel):
    p95_ms: int = 1200
    error_rate: float = 0.02
    amber_error_rate: float = 0.05
    minimum_samples: int = 20
    half_open_ratio: float = 0.2

    def normalized_half_open_ratio(self) -> float:
        if self.half_open_ratio < 0:
            return 0.0
        if self.half_open_ratio > 1:
            return 1.0
        return self.half_open_ratio


class ProviderSpec(BaseModel):
    name: str
    description: Optional[str] = None
    canary: CanaryConfig
    expectations: ExpectationConfig = ExpectationConfig()
    slo: SLOConfig = SLOConfig()
    fallback: Optional[str] = None


@dataclass
class ProviderHealth:
    provider: str
    state: str
    p95_ms: float
    error_rate: float
    timeout_rate: float
    sample_count: int
    reason: str
    fallback: Optional[str]
    fallback_ratio: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "provider": self.provider,
            "state": self.state,
            "p95_ms": self.p95_ms,
            "error_rate": self.error_rate,
            "timeout_rate": self.timeout_rate,
            "samples": self.sample_count,
            "reason": self.reason,
            "fallback": self.fallback,
            "fallback_ratio": self.fallback_ratio,
        }


class _ConfigState:
    def __init__(self) -> None:
        self._providers: Dict[str, ProviderSpec] = {}
        self._lock = threading.Lock()
        self.reload()

    def reload(self) -> None:
        if not CONFIG_PATH.exists():
            raise FileNotFoundError(f"provider config not found at {CONFIG_PATH}")
        with open(CONFIG_PATH, "r", encoding="utf-8") as fh:
            data = yaml.safe_load(fh) or {}
        providers: Dict[str, ProviderSpec] = {}
        for raw in data.get("providers", []):
            try:
                spec = ProviderSpec(**raw)
            except ValidationError as exc:  # pragma: no cover - config errors should surface loudly
                raise ValueError(f"invalid provider config: {exc}") from exc
            providers[spec.name] = spec
        if not providers:
            raise ValueError("no providers configured")
        with self._lock:
            self._providers = providers

    def providers(self) -> Dict[str, ProviderSpec]:
        with self._lock:
            return dict(self._providers)

    def get(self, name: str) -> ProviderSpec:
        with self._lock:
            spec = self._providers.get(name)
        if not spec:
            raise KeyError(name)
        return spec


class _HealthState:
    def __init__(self) -> None:
        self._samples: Dict[str, List[Dict[str, Any]]] = {}
        self._health: Dict[str, ProviderHealth] = {}
        self._lock = threading.Lock()
        self._open_incidents: Dict[str, Dict[str, Any]] = {}

    def add_sample(self, spec: ProviderSpec, payload: SamplePayload) -> ProviderHealth:
        now = payload.timestamp or time.time()
        record = {
            "ts": now,
            "latency_ms": payload.latency_ms,
            "ok": bool(payload.ok),
            "code": payload.code,
            "tokens": payload.tokens,
        }
        with self._lock:
            bucket = self._samples.setdefault(spec.name, [])
            bucket.append(record)
            health = self._classify(spec, now)
            self._health[spec.name] = health
            self._manage_incidents(spec, health, now)
            return health

    def _purge(self, provider: str, now: float) -> List[Dict[str, Any]]:
        bucket = self._samples.get(provider, [])
        if not bucket:
            return []
        cutoff = now - WINDOW_SECONDS
        filtered = [row for row in bucket if row["ts"] >= cutoff]
        self._samples[provider] = filtered
        return filtered

    def _classify(self, spec: ProviderSpec, now: float) -> ProviderHealth:
        samples = self._purge(spec.name, now)
        sample_count = len(samples)
        if sample_count == 0:
            return ProviderHealth(
                provider=spec.name,
                state="amber",
                p95_ms=0.0,
                error_rate=0.0,
                timeout_rate=0.0,
                sample_count=0,
                reason="no_data",
                fallback=spec.fallback,
                fallback_ratio=spec.slo.normalized_half_open_ratio(),
            )
        latencies = sorted(row["latency_ms"] for row in samples)
        percentile_index = max(int(0.95 * len(latencies)) - 1, 0)
        p95 = float(latencies[percentile_index])
        errors = sum(1 for row in samples if not row["ok"])
        error_rate = errors / sample_count
        timeouts = sum(1 for row in samples if row["latency_ms"] >= spec.expectations.max_latency_ms)
        timeout_rate = timeouts / sample_count
        state = "green"
        reason = "healthy"
        if sample_count < spec.slo.minimum_samples:
            state = "amber"
            reason = "insufficient_data"
        elif error_rate > spec.slo.amber_error_rate or p95 > spec.slo.p95_ms * 1.5:
            state = "red"
            reason = "slo_exceeded"
        elif error_rate > spec.slo.error_rate or p95 > spec.slo.p95_ms:
            state = "amber"
            reason = "approaching_limit"
        fallback_ratio = 0.0
        if state == "red":
            fallback_ratio = 1.0
        elif state == "amber":
            fallback_ratio = spec.slo.normalized_half_open_ratio()
        return ProviderHealth(
            provider=spec.name,
            state=state,
            p95_ms=p95,
            error_rate=round(error_rate, 4),
            timeout_rate=round(timeout_rate, 4),
            sample_count=sample_count,
            reason=reason,
            fallback=spec.fallback,
            fallback_ratio=fallback_ratio,
        )

    def current(self, spec: ProviderSpec) -> ProviderHealth:
        now = time.time()
        with self._lock:
            health = self._classify(spec, now)
            self._health[spec.name] = health
            return health

    def snapshot(self) -> Dict[str, ProviderHealth]:
        with self._lock:
            return dict(self._health)

    def _manage_incidents(self, spec: ProviderSpec, health: ProviderHealth, now: float) -> None:
        previous = self._open_incidents.get(spec.name)
        if health.state == "red":
            if not previous:
                incident = {
                    "provider": spec.name,
                    "opened_at": now,
                    "fallback": spec.fallback,
                    "reason": health.reason,
                }
                self._open_incidents[spec.name] = incident
                _append_incident({
                    "provider": spec.name,
                    "event": "open",
                    "state": "red",
                    "opened_at": _iso(now),
                    "fallback": spec.fallback,
                    "reason": health.reason,
                })
        else:
            if previous:
                duration = max(now - previous["opened_at"], 0.0)
                _append_incident({
                    "provider": spec.name,
                    "event": "resolve",
                    "state": health.state,
                    "opened_at": _iso(previous["opened_at"]),
                    "resolved_at": _iso(now),
                    "duration_seconds": round(duration, 2),
                    "fallback": spec.fallback,
                    "reason": health.reason,
                })
                self._open_incidents.pop(spec.name, None)


def _iso(ts: float) -> str:
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def _append_incident(payload: Dict[str, Any]) -> None:
    try:
        INCIDENT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(INCIDENT_LOG_PATH, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(payload) + "\n")
    except OSError:
        # Logging should never break health evaluation.
        pass


_config = _ConfigState()
_health = _HealthState()
app = FastAPI(title="Model Health Service", version="1.0.0")


@app.post("/samples")
async def ingest_sample(payload: SamplePayload) -> JSONResponse:
    try:
        spec = _config.get(payload.provider)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="unknown_provider") from exc
    health = _health.add_sample(spec, payload)
    return JSONResponse({"provider": payload.provider, "health": health.to_dict()})


@app.get("/providers")
async def list_providers() -> Dict[str, Any]:
    providers = _config.providers()
    snapshot: Dict[str, Any] = {}
    for name, spec in providers.items():
        snapshot[name] = _health.current(spec).to_dict()
    return {"providers": snapshot}


@app.get("/providers/{provider}")
async def provider_health(provider: str) -> JSONResponse:
    try:
        spec = _config.get(provider)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="unknown_provider") from exc
    health = _health.current(spec)
    status_code = 200 if health.state != "red" else 503
    return JSONResponse(health.to_dict(), status_code=status_code)


@app.get("/healthz")
async def healthz() -> JSONResponse:
    providers = _config.providers()
    summary: Dict[str, Any] = {}
    overall_state = "green"
    for name, spec in providers.items():
        health = _health.current(spec)
        summary[name] = health.to_dict()
        if health.state == "red":
            overall_state = "red"
        elif health.state == "amber" and overall_state == "green":
            overall_state = "amber"
    status_code = 200 if overall_state != "red" else 503
    return JSONResponse({"state": overall_state, "providers": summary}, status_code=status_code)


@app.post("/config/reload")
async def reload_config() -> Dict[str, str]:
    _config.reload()
    return {"status": "ok"}


@app.get("/config")
async def config_snapshot() -> Dict[str, Any]:
    providers = _config.providers()
    return {
        "providers": {
            name: {
                "description": spec.description,
                "fallback": spec.fallback,
                "slo": spec.slo.model_dump(),
                "expectations": spec.expectations.model_dump(),
            }
            for name, spec in providers.items()
        }
    }
