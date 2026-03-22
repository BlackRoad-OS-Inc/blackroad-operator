"""
BR Memory Router — PS-SHA∞ hash-chain memory endpoints.
"""

from __future__ import annotations

import hashlib
import os
import time
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()
GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")


# ── Models ────────────────────────────────────────────────────────────────────

class MemoryCreate(BaseModel):
    content: str
    type: str = "observation"  # fact | observation | inference | commitment
    truth_state: int = 0       # 1=True, 0=Unknown, -1=False
    agent: Optional[str] = None
    tags: list[str] = []


class MemoryEntry(BaseModel):
    hash: str
    prev_hash: str
    content: str
    type: str
    truth_state: int
    timestamp: str
    agent: Optional[str] = None
    tags: list[str] = []


class MemoryListResponse(BaseModel):
    entries: list[MemoryEntry]
    total: int
    chain_valid: bool
    gateway: str


class VerifyResponse(BaseModel):
    valid: bool
    total: int
    checked: int
    first_invalid: Optional[str] = None
    gateway: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _compute_hash(prev_hash: str, content: str) -> str:
    """PS-SHA∞: SHA256(prev_hash:content:timestamp_ns)"""
    payload = f"{prev_hash}:{content}:{time.time_ns()}"
    return hashlib.sha256(payload.encode()).hexdigest()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/memory", response_model=MemoryListResponse)
async def list_memory(
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    type: Optional[str] = Query(None),
    agent: Optional[str] = Query(None),
    truth_state: Optional[int] = Query(None),
):
    """List memory entries from the PS-SHA∞ chain."""
    params = {"limit": limit, "offset": offset}
    if type: params["type"] = type
    if agent: params["agent"] = agent
    if truth_state is not None: params["truth_state"] = truth_state

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{GATEWAY_URL}/memory", params=params)
            resp.raise_for_status()
            data = resp.json()
            return MemoryListResponse(
                entries=data.get("entries", []),
                total=data.get("total", 0),
                chain_valid=data.get("chain_valid", True),
                gateway="online",
            )
    except httpx.ConnectError:
        return MemoryListResponse(entries=[], total=0, chain_valid=True, gateway="offline")
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/memory", response_model=MemoryEntry, status_code=201)
async def create_memory(body: MemoryCreate):
    """
    Add a new entry to the PS-SHA∞ memory chain.

    - **content**: The memory content (fact, observation, inference, or commitment)
    - **type**: One of: fact, observation, inference, commitment
    - **truth_state**: 1=True, 0=Unknown, -1=False (Łukasiewicz trinary logic)
    - **agent**: Optional agent that created this memory
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(f"{GATEWAY_URL}/memory", json=body.dict())
            resp.raise_for_status()
            return MemoryEntry(**resp.json())
    except httpx.ConnectError:
        # Compute hash locally if gateway offline
        local_hash = _compute_hash("GENESIS", body.content)
        return MemoryEntry(
            hash=local_hash,
            prev_hash="GENESIS",
            content=body.content,
            type=body.type,
            truth_state=body.truth_state,
            timestamp=__import__("datetime").datetime.utcnow().isoformat() + "Z",
            agent=body.agent,
            tags=body.tags,
        )


@router.get("/memory/{hash}", response_model=MemoryEntry)
async def get_memory(hash: str):
    """Get a specific memory entry by hash."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{GATEWAY_URL}/memory/{hash}")
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Memory entry not found")
            resp.raise_for_status()
            return MemoryEntry(**resp.json())
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail={"error": "gateway_offline"})


@router.get("/memory/verify", response_model=VerifyResponse)
async def verify_chain():
    """
    Verify the integrity of the entire PS-SHA∞ memory chain.

    Walks all entries and validates each hash = SHA256(prev_hash:content:timestamp_ns).
    Returns chain_valid=False and first_invalid if tampering detected.
    """
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.get(f"{GATEWAY_URL}/memory/verify")
            resp.raise_for_status()
            data = resp.json()
            return VerifyResponse(
                valid=data.get("valid", True),
                total=data.get("total", 0),
                checked=data.get("checked", 0),
                first_invalid=data.get("first_invalid"),
                gateway="online",
            )
    except httpx.ConnectError:
        return VerifyResponse(valid=True, total=0, checked=0, gateway="offline")
