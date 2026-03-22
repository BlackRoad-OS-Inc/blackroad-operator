"""Aggregate snapshot builder for the Bootstrap Engine."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from .config import BootstrapConfig
from .health import (
    HealthCheckResult,
    check_miner_bridge,
    check_metaverse_frontend,
    check_pi_ops_system,
    check_prism_db,
)


@dataclass(slots=True)
class BootstrapSnapshot:
    prism: HealthCheckResult
    pi_ops: HealthCheckResult
    miners: HealthCheckResult
    metaverse: HealthCheckResult
    agents: Dict[str, Any]


def gather_status(config: BootstrapConfig) -> BootstrapSnapshot:
    from agents.birth.birth_protocol import summarise_agent_registry

    prism_status = check_prism_db(config)
    pi_ops_status = check_pi_ops_system(config)
    metaverse_status = check_metaverse_frontend(config)
    miner_status = check_miner_bridge(config, prism_status=prism_status)
    agents_status = summarise_agent_registry(config.census_path, config.identities_path)
    return BootstrapSnapshot(
        prism=prism_status,
        pi_ops=pi_ops_status,
        miners=miner_status,
        metaverse=metaverse_status,
        agents=agents_status,
    )


def snapshot_to_dict(snapshot: BootstrapSnapshot) -> Dict[str, Any]:
    return {
        "prism": _result_to_dict(snapshot.prism),
        "pi_ops": _result_to_dict(snapshot.pi_ops),
        "miners": _result_to_dict(snapshot.miners),
        "metaverse": _result_to_dict(snapshot.metaverse),
        "agents": snapshot.agents,
    }


def _result_to_dict(result: HealthCheckResult) -> Dict[str, Any]:
    return {
        "name": result.name,
        "ok": result.ok,
        "message": result.message,
        "details": result.details,
    }
