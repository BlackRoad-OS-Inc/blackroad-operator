#!/usr/bin/env python3
"""Poll XMRig's HTTP API and forward miner.sample events to Prism."""

from __future__ import annotations

import json
import logging
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

LOGGER = logging.getLogger("miner-bridge")


@dataclass
class MinerSummary:
    miner_id: str
    recorded_at: datetime
    pool: Optional[str]
    hashrate_1m: Optional[float]
    hashrate_15m: Optional[float]
    shares_accepted: int
    shares_rejected: int
    shares_stale: int
    latency_ms: Optional[float]
    temperature_c: Optional[float]
    last_share_diff: Optional[float]
    last_share_at: Optional[datetime]

    @property
    def shares_total(self) -> int:
        return max(self.shares_accepted + self.shares_rejected, 0)

    @property
    def stale_rate(self) -> float:
        total = self.shares_total
        if total <= 0:
            return 0.0
        return max(min(self.shares_stale / total, 1.0), 0.0)

    def to_payload(self) -> Dict[str, Any]:
        return {
            "miner": self.miner_id,
            "ts": self.recorded_at.isoformat().replace("+00:00", "Z"),
            "pool": self.pool,
            "hashrate_1m": self.hashrate_1m,
            "hashrate_15m": self.hashrate_15m,
            "shares_accepted": self.shares_accepted,
            "shares_rejected": self.shares_rejected,
            "shares_stale": self.shares_stale,
            "shares_total": self.shares_total,
            "stale_rate": self.stale_rate,
            "latency_ms": self.latency_ms,
            "temperature_c": self.temperature_c,
            "last_share_difficulty": self.last_share_diff,
            "last_share_at": (
                self.last_share_at.isoformat().replace("+00:00", "Z")
                if self.last_share_at
                else None
            ),
        }


def iso_now() -> datetime:
    return datetime.now(timezone.utc)


def _safe_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


class MinerBridge:
    def __init__(self) -> None:
        self.xmrig_api = os.environ.get("XMRIG_API_URL", "http://localhost:18080").rstrip("/") + "/"
        self.xmrig_token = os.environ.get("XMRIG_API_TOKEN")
        self.prism_token = os.environ.get("PRISM_API_TOKEN")
        self.prism_org_id = os.environ.get("PRISM_ORG_ID")
        self.miner_id = os.environ.get("MINER_ID", "xmrig")
        self.miner_agent_id = os.environ.get("MINER_AGENT_ID", f"miner:{self.miner_id}")
        prism_events_url = os.environ.get("PRISM_EVENTS_URL")
        if prism_events_url:
            self.prism_events_url = prism_events_url.rstrip("/")
        else:
            base_api = os.environ.get("PRISM_API_URL", "http://localhost:4000").rstrip("/") + "/"
            self.prism_events_url = urljoin(base_api, "events").rstrip("/")
        self.interval = max(float(os.environ.get("POLL_INTERVAL", "15")), 5.0)
        self.timeout = float(os.environ.get("HTTP_TIMEOUT", "5"))
        self.last_good_shares: Optional[int] = None
        self.last_share_diff: Optional[float] = None
        self.last_share_at: Optional[datetime] = None

    def run(self) -> None:
        LOGGER.info("starting miner bridge", extra={"interval": self.interval})
        while True:
            try:
                summary = self._fetch_summary()
                if summary:
                    self._send_sample(summary)
            except Exception as exc:  # noqa: BLE001 - log and continue loop
                LOGGER.exception("bridge loop failed", exc_info=exc)
            time.sleep(self.interval)

    def _fetch_summary(self) -> Optional[MinerSummary]:
        endpoint_candidates = ["2/summary", "1/summary", "summary"]
        data: Optional[Dict[str, Any]] = None
        for endpoint in endpoint_candidates:
            try:
                data = self._http_get_json(urljoin(self.xmrig_api, endpoint))
            except HTTPError as exc:
                if exc.code == 404:
                    continue
                LOGGER.warning("xmrig summary http error", extra={"code": exc.code})
            except URLError as exc:
                LOGGER.warning("xmrig summary unavailable", extra={"error": str(exc)})
            if data:
                break
        if not data:
            LOGGER.debug("no xmrig data available")
            return None

        results = data.get("results", {})
        connection = data.get("connection", {})
        hashrate = data.get("hashrate", {})
        total = hashrate.get("total") if isinstance(hashrate, dict) else None
        now = iso_now()

        hr_1m: Optional[float] = None
        hr_15m: Optional[float] = None
        if isinstance(total, (list, tuple)):
            if len(total) > 1:
                hr_1m = _safe_float(total[1])
            if len(total) > 2:
                hr_15m = _safe_float(total[2])
        elif isinstance(total, (int, float)):
            hr_1m = float(total)

        accepted = _safe_int(results.get("shares_good"))
        total_shares = _safe_int(results.get("shares_total"))
        rejected = max(total_shares - accepted, 0)
        stale = _safe_int(results.get("shares_stale")) or rejected

        diff_current = _safe_float(results.get("diff_current"))
        if self.last_good_shares is None:
            self.last_good_shares = accepted
        elif accepted > self.last_good_shares:
            self.last_good_shares = accepted
            self.last_share_diff = diff_current
            self.last_share_at = now

        temp = self._extract_temperature(data)
        latency = _safe_float(connection.get("ping"))

        summary = MinerSummary(
            miner_id=self.miner_id,
            recorded_at=now,
            pool=connection.get("pool"),
            hashrate_1m=hr_1m,
            hashrate_15m=hr_15m,
            shares_accepted=accepted,
            shares_rejected=rejected,
            shares_stale=stale,
            latency_ms=latency,
            temperature_c=temp,
            last_share_diff=self.last_share_diff,
            last_share_at=self.last_share_at,
        )
        LOGGER.debug(
            "xmrig sample",
            extra={
                "hashrate_1m": hr_1m,
                "accepted": accepted,
                "rejected": rejected,
                "temp": temp,
            },
        )
        return summary

    def _send_sample(self, summary: MinerSummary) -> None:
        sample_payload = summary.to_payload()
        event_payload: Dict[str, Any] = {
            "type": "miner.sample",
            "sample": sample_payload,
        }
        if self.prism_org_id:
            event_payload["orgId"] = self.prism_org_id
        if self.miner_agent_id:
            event_payload["agentId"] = self.miner_agent_id

        envelope = {
            "topic": "miner.sample",
            "payload": event_payload,
        }

        request = Request(
            self.prism_events_url,
            data=json.dumps(envelope).encode("utf-8"),
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        if self.prism_token:
            request.add_header("Authorization", f"Bearer {self.prism_token}")
        try:
            with urlopen(request, timeout=self.timeout) as response:
                response.read()
            LOGGER.info(
                "sent miner.sample",
                extra={
                    "accepted": summary.shares_accepted,
                    "stale_rate": round(summary.stale_rate * 100, 2),
                    "hashrate_1m": summary.hashrate_1m,
                },
            )
        except HTTPError as exc:
            LOGGER.error(
                "failed to push miner.sample",
                extra={"status": exc.code, "reason": exc.reason},
            )
        except URLError as exc:
            LOGGER.error("prism events unreachable", extra={"error": str(exc)})

    def _http_get_json(self, url: str) -> Dict[str, Any]:
        request = Request(url, headers={"Content-Type": "application/json"})
        if self.xmrig_token:
            request.add_header("Authorization", f"Bearer {self.xmrig_token}")
        with urlopen(request, timeout=self.timeout) as response:
            payload = response.read()
            if not payload:
                return {}
            return json.loads(payload.decode("utf-8"))

    @staticmethod
    def _extract_temperature(data: Dict[str, Any]) -> Optional[float]:
        cpu = data.get("cpu")
        if isinstance(cpu, dict):
            temp = cpu.get("temperature")
            if temp is not None:
                return _safe_float(temp)
        temps = data.get("temperatures")
        if isinstance(temps, (list, tuple)) and temps:
            return _safe_float(temps[0])
        return None


def configure_logging() -> None:
    level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    handler = logging.StreamHandler(stream=sys.stdout)
    formatter = logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    handler.setFormatter(formatter)
    LOGGER.setLevel(level)
    LOGGER.addHandler(handler)


def main() -> None:
    configure_logging()
    MinerBridge().run()


if __name__ == "__main__":
    main()
