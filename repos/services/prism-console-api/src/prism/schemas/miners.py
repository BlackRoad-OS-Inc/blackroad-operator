from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MinerSampleIn(BaseModel):
    miner_id: str
    timestamp: Optional[datetime] = None
    pool: Optional[str] = None
    profile: Optional[str] = None
    hashrate_1m: Optional[float] = None
    hashrate_15m: Optional[float] = None
    shares_accepted: int = 0
    shares_rejected: int = 0
    shares_stale: Optional[int] = None
    latency_ms: Optional[float] = None
    temperature_c: Optional[float] = None
    last_share_difficulty: Optional[float] = None
    last_share_at: Optional[datetime] = None


class MinerSampleView(BaseModel):
    miner_id: str
    recorded_at: datetime
    pool: Optional[str] = None
    profile: Optional[str] = None
    hashrate_1m: Optional[float] = None
    hashrate_15m: Optional[float] = None
    effective_hashrate: Optional[float] = None
    stale_rate: float
    shares_accepted: int
    shares_rejected: int
    shares_stale: int
    latency_ms: Optional[float] = None
    temperature_c: Optional[float] = None
    last_share_difficulty: Optional[float] = None
    last_share_at: Optional[datetime] = None


class MinerSamplesResponse(BaseModel):
    samples: list[MinerSampleView]
    generated_at: datetime


class MinerTile(BaseModel):
    id: str
    label: str
    value: str
    helper: Optional[str] = None
    intent: Optional[str] = None


class MinerTilesResponse(BaseModel):
    miner_id: str
    updated_at: datetime
    tiles: list[MinerTile]


__all__ = [
    "MinerSampleIn",
    "MinerSampleView",
    "MinerSamplesResponse",
    "MinerTile",
    "MinerTilesResponse",
]
