"""FastAPI surface for the Bootstrap Engine."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel

from agents.birth.birth_protocol import birth_agents, summarise_agent_registry
from bootstrap_engine import BootstrapConfig
from bootstrap_engine.health import (
    HealthCheckResult,
    check_metaverse_frontend,
    check_miner_bridge,
    check_pi_ops_system,
    check_prism_db,
)
from bootstrap_engine.status import gather_status, snapshot_to_dict

app = FastAPI(title="BlackRoad Bootstrap API", version="0.1.0")


def _config() -> BootstrapConfig:
    return BootstrapConfig.from_env()


class BirthRequest(BaseModel):
    ids: Optional[List[str]] = None
    limit: Optional[int] = None
    dry_run: bool = False


class BirthResponse(BaseModel):
    attempted: int
    created: int
    skipped: int
    path: str
    dry_run: bool


@app.get("/bootstrap/status")
def bootstrap_status() -> Dict[str, Any]:
    config = _config()
    snapshot = gather_status(config)
    return snapshot_to_dict(snapshot)


@app.get("/bootstrap/miners")
def bootstrap_miners() -> Dict[str, Any]:
    config = _config()
    prism = check_prism_db(config)
    return _health_to_dict(check_miner_bridge(config, prism_status=prism))


@app.get("/bootstrap/pi")
def bootstrap_pi() -> Dict[str, Any]:
    config = _config()
    return _health_to_dict(check_pi_ops_system(config))


@app.get("/bootstrap/metaverse")
def bootstrap_metaverse() -> Dict[str, Any]:
    config = _config()
    return _health_to_dict(check_metaverse_frontend(config))


@app.get("/bootstrap/agents")
def bootstrap_agents() -> Dict[str, Any]:
    config = _config()
    summary = summarise_agent_registry(config.census_path, config.identities_path)
    return summary


@app.post("/bootstrap/agents/birth", response_model=BirthResponse)
def bootstrap_birth(request: BirthRequest) -> BirthResponse:
    config = _config()
    result = birth_agents(
        census_path=config.census_path,
        identity_path=config.identities_path,
        ids=request.ids,
        limit=request.limit,
        dry_run=request.dry_run,
    )
    return BirthResponse(
        attempted=result.attempted,
        created=result.created,
        skipped=result.skipped,
        path=str(result.path),
        dry_run=result.dry_run,
    )


def _health_to_dict(result: HealthCheckResult) -> Dict[str, Any]:
    return {
        "name": result.name,
        "ok": result.ok,
        "message": result.message,
        "details": result.details,
    }
