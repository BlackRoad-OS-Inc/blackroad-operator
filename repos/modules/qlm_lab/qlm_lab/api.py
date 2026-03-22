"""FastAPI bridge exposing the QLM orchestrator via HTTP."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Callable, Dict, List, Mapping

import numpy as np
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from . import lineage
from .agents.orchestrator import Orchestrator
from .proto import Msg


class BridgeMessage(BaseModel):
    """Serializable representation of a bus message."""

    id: str
    sender: str
    recipient: str
    kind: str
    op: str
    args: Dict[str, Any]
    ts: float

    @staticmethod
    def _coerce(value: Any) -> Any:
        """Convert values into JSON-friendly primitives."""

        if isinstance(value, Path):
            return str(value)
        if isinstance(value, np.generic):
            return value.item()
        if isinstance(value, (list, tuple, set)):
            return [BridgeMessage._coerce(item) for item in value]
        if isinstance(value, Mapping):
            return {str(key): BridgeMessage._coerce(val) for key, val in value.items()}
        return value

    @classmethod
    def from_msg(cls, message: Msg) -> "BridgeMessage":
        return cls(
            id=message.id,
            sender=message.sender,
            recipient=message.recipient,
            kind=message.kind,
            op=message.op,
            args={str(key): cls._coerce(val) for key, val in message.args.items()},
            ts=float(message.ts),
        )


class ArtifactSummary(BaseModel):
    """Summary of artifacts produced by a bridge run."""

    count: int
    files: List[str]


class RunRequest(BaseModel):
    goal: str = Field(..., min_length=1, description="Planner goal to execute (e.g. 'bell-lab-demo').")
    message_budget: int = Field(
        128,
        ge=1,
        le=1024,
        description="Maximum number of bus messages permitted for a run.",
    )


class RunResponse(BaseModel):
    goal: str
    message_count: int
    messages: List[BridgeMessage]
    artifacts: ArtifactSummary


def _load_lineage(limit: int | None = None) -> List[Dict[str, Any]]:
    path = lineage.LINEAGE_PATH
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()
    if limit is not None:
        lines = lines[-limit:]
    events: List[Dict[str, Any]] = []
    for line in lines:
        try:
            data = json.loads(line)
        except json.JSONDecodeError:  # pragma: no cover - defensive guard for manual edits
            continue
        events.append(data)
    return events


def create_app(orchestrator_factory: Callable[[], Orchestrator] | None = None) -> FastAPI:
    """Instantiate the FastAPI bridge application."""

    orchestrator_factory = orchestrator_factory or Orchestrator
    app = FastAPI(title="QLM Bridge", version="0.1.0", description="Expose the QLM orchestrator over HTTP.")

    @app.get("/health")
    def health() -> Dict[str, str]:
        return {"status": "ok"}

    @app.post("/runs", response_model=RunResponse)
    def run_goal(request: RunRequest) -> RunResponse:
        orchestrator = orchestrator_factory()
        message_count = orchestrator.run_goal(request.goal)
        if message_count > request.message_budget:
            raise HTTPException(status_code=422, detail="message budget exceeded")
        messages = [BridgeMessage.from_msg(msg) for msg in orchestrator.bus.history()]
        artifacts = ArtifactSummary(**lineage.artifact_index())
        return RunResponse(
            goal=request.goal,
            message_count=message_count,
            messages=messages,
            artifacts=artifacts,
        )

    @app.get("/artifacts", response_model=ArtifactSummary)
    def get_artifacts() -> ArtifactSummary:
        return ArtifactSummary(**lineage.artifact_index())

    @app.get("/lineage")
    def get_lineage(limit: int = Query(50, ge=1, le=500)) -> List[Dict[str, Any]]:
        return _load_lineage(limit)

    return app


__all__ = ["create_app", "RunRequest", "RunResponse", "BridgeMessage", "ArtifactSummary"]
