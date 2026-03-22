"""Health check helpers for the Bootstrap Engine."""
from __future__ import annotations

import socket
import sqlite3
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import requests

from .config import BootstrapConfig
from .utils import parse_timestamp, resolve_existing_path


@dataclass(slots=True)
class HealthCheckResult:
    name: str
    ok: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)


def _connect_sqlite(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def check_prism_db(config: BootstrapConfig) -> HealthCheckResult:
    candidates = list(config.iter_prism_candidates())
    path = resolve_existing_path(candidates)
    if not path:
        return HealthCheckResult(
            name="prism_console",
            ok=False,
            message="Prism database not found. Set PRISM_DB_PATH or initialise the service.",
            details={"candidates": [str(p) for p in candidates]},
        )
    try:
        connection = _connect_sqlite(path)
    except sqlite3.Error as exc:
        return HealthCheckResult(
            name="prism_console",
            ok=False,
            message=f"Cannot open Prism DB: {exc}",
            details={"db_path": str(path)},
        )

    counts: Dict[str, Any] = {}
    tables = {
        "agents": "agent",
        "events": "agent_event",
        "miner_samples": "miner_sample",
        "metrics": "metric",
    }
    for key, table in tables.items():
        try:
            counts[key] = connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        except sqlite3.Error:
            counts[key] = None

    latest_sample: Dict[str, Any] | None = None
    try:
        row = connection.execute(
            """
            SELECT miner_id, recorded_at, hashrate_1m, hashrate_15m, temperature_c
            FROM miner_sample
            ORDER BY recorded_at DESC
            LIMIT 1
            """
        ).fetchone()
    except sqlite3.Error:
        row = None
    if row:
        ts = parse_timestamp(row["recorded_at"])
        latest_sample = {
            "miner_id": row["miner_id"],
            "recorded_at": ts.isoformat() if ts else row["recorded_at"],
            "hashrate_1m": row["hashrate_1m"],
            "hashrate_15m": row["hashrate_15m"],
            "temperature_c": row["temperature_c"],
            "age_seconds": (_age_seconds(ts) if ts else None),
        }

    connection.close()

    ok = counts.get("agents") not in (None, 0)
    message = "Prism DB reachable"
    if not ok:
        message = "Prism DB reachable but contains no agents"
    return HealthCheckResult(
        name="prism_console",
        ok=counts.get("agents") is not None,
        message=message,
        details={
            "db_path": str(path),
            "counts": counts,
            "latest_miner_sample": latest_sample,
        },
    )


def _age_seconds(ts: datetime | None) -> float | None:
    if not ts:
        return None
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - ts).total_seconds()


def check_pi_ops_db(config: BootstrapConfig) -> HealthCheckResult:
    candidates = list(config.iter_pi_ops_candidates())
    path = resolve_existing_path(candidates)
    if not path:
        return HealthCheckResult(
            name="pi_ops",
            ok=False,
            message="Pi-Ops DB not found. Set PI_OPS_DB_PATH or run pi_ops/app.py",
            details={"candidates": [str(p) for p in candidates]},
        )
    try:
        connection = _connect_sqlite(path)
    except sqlite3.Error as exc:
        return HealthCheckResult(
            name="pi_ops",
            ok=False,
            message=f"Cannot open Pi-Ops DB: {exc}",
            details={"db_path": str(path)},
        )

    try:
        total = connection.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
        last_row = connection.execute(
            "SELECT topic, payload, created_at FROM messages ORDER BY id DESC LIMIT 1"
        ).fetchone()
    except sqlite3.Error as exc:
        connection.close()
        return HealthCheckResult(
            name="pi_ops",
            ok=False,
            message=f"Pi-Ops DB schema missing: {exc}",
            details={"db_path": str(path)},
        )
    connection.close()

    last_seen = parse_timestamp(last_row["created_at"]) if last_row else None
    return HealthCheckResult(
        name="pi_ops",
        ok=True,
        message="Pi-Ops DB reachable",
        details={
            "db_path": str(path),
            "message_count": total,
            "last_message": {
                "topic": last_row["topic"] if last_row else None,
                "created_at": last_seen.isoformat() if last_seen else None,
                "age_seconds": _age_seconds(last_seen),
            },
        },
    )


def check_mqtt_endpoint(host: str, port: int, timeout: float) -> HealthCheckResult:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            pass
    except OSError as exc:
        return HealthCheckResult(
            name="pi_ops_mqtt",
            ok=False,
            message=f"MQTT unreachable: {exc}",
            details={"host": host, "port": port},
        )
    return HealthCheckResult(
        name="pi_ops_mqtt",
        ok=True,
        message="MQTT socket reachable",
        details={"host": host, "port": port},
    )


def check_pi_ops_system(config: BootstrapConfig) -> HealthCheckResult:
    db_status = check_pi_ops_db(config)
    mqtt_status = check_mqtt_endpoint(config.pi_ops_mqtt_host, config.pi_ops_mqtt_port, config.mqtt_timeout)
    ok = db_status.ok and mqtt_status.ok
    return HealthCheckResult(
        name="pi_ops",
        ok=ok,
        message="Pi-Ops dashboard" + (" healthy" if ok else " needs attention"),
        details={
            "db": db_status.details,
            "db_ok": db_status.ok,
            "mqtt_ok": mqtt_status.ok,
            "mqtt": mqtt_status.details,
        },
    )


def check_metaverse_frontend(config: BootstrapConfig) -> HealthCheckResult:
    url = config.metaverse_status_url
    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        payload = response.json() if response.headers.get("content-type", "").startswith("application/json") else {
            "status": response.text[:200]
        }
        ok = 200 <= response.status_code < 400
        message = "Metaverse endpoint reachable" if ok else f"HTTP {response.status_code}"
        return HealthCheckResult(
            name="metaverse",
            ok=ok,
            message=message,
            details={"url": url, "payload": payload},
        )
    except requests.RequestException as exc:
        return HealthCheckResult(
            name="metaverse",
            ok=False,
            message=f"Metaverse endpoint unreachable: {exc}",
            details={"url": url},
        )


def check_miner_bridge(config: BootstrapConfig, prism_status: HealthCheckResult | None = None) -> HealthCheckResult:
    script_path = config.repo_root / "miners/bridge/miner_bridge.py"
    script_exists = script_path.exists()
    latest_sample = None
    if prism_status and prism_status.details.get("latest_miner_sample"):
        latest_sample = prism_status.details["latest_miner_sample"]

    ok = script_exists and bool(latest_sample)
    message = "Miner bridge ready"
    if not script_exists:
        message = "miner_bridge.py missing"
    elif not latest_sample:
        message = "No miner samples recorded"

    return HealthCheckResult(
        name="miners",
        ok=ok,
        message=message,
        details={
            "bridge_path": str(script_path),
            "bridge_exists": script_exists,
            "latest_sample": latest_sample,
        },
    )
