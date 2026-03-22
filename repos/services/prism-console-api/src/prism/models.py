from __future__ import annotations

from datetime import datetime
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class Agent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    domain: str
    status: str
    memory_used_mb: float
    last_seen_at: datetime
    version: str


class AgentEvent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    agent_id: str = Field(foreign_key="agent.id")
    kind: str
    at: datetime
    message: str


class Runbook(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    description: str
    tags: str
    inputs_schema: str
    linked_workflow: str


class Setting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Metric(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    metric_id: str
    title: str
    value: str
    caption: str
    icon: str
    status: str


class MinerSample(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    miner_id: str
    recorded_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    pool: Optional[str] = None
    profile: Optional[str] = None
    hashrate_1m: Optional[float] = None
    hashrate_15m: Optional[float] = None
    shares_accepted: int = 0
    shares_rejected: int = 0
    shares_stale: int = 0
    latency_ms: Optional[float] = None
    temperature_c: Optional[float] = None
    last_share_difficulty: Optional[float] = None
    last_share_at: Optional[datetime] = None


__all__ = [
    "Agent",
    "AgentEvent",
    "Runbook",
    "Setting",
    "Metric",
    "MinerSample",
]
