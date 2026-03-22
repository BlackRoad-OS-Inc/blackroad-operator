"""BlackRoad API — Memory Router (PS-SHA∞ hash-chained)"""
from __future__ import annotations
import hashlib, time, json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from .database import db

router = APIRouter(prefix="/memory", tags=["memory"])

def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def _prev_hash() -> str:
    row = db.execute("SELECT hash FROM memory_entries ORDER BY timestamp_ns DESC LIMIT 1").fetchone()
    return row["hash"] if row else "GENESIS"


class WriteBody(BaseModel):
    key: str
    value: object
    truth_state: Literal[-1, 0, 1] = 0


@router.get("/")
async def list_entries(limit: int = 50, offset: int = 0):
    rows = db.execute(
        "SELECT * FROM memory_entries ORDER BY timestamp_ns DESC LIMIT ? OFFSET ?",
        [limit, offset]
    ).fetchall()
    total = db.execute("SELECT COUNT(*) as n FROM memory_entries").fetchone()["n"]
    return {"entries": [dict(r) for r in rows], "total": total, "limit": limit, "offset": offset}


@router.post("/", status_code=201)
async def write_entry(body: WriteBody):
    ts_ns = time.time_ns()
    prev = _prev_hash()
    content = json.dumps(body.value)
    chain_hash = _sha256(f"{prev}:{body.key}:{content}:{ts_ns}")
    db.execute(
        "INSERT INTO memory_entries (key, value, hash, prev_hash, truth_state, timestamp_ns) VALUES (?,?,?,?,?,?)",
        [body.key, content, chain_hash, prev, body.truth_state, ts_ns]
    )
    db.commit()
    return {"key": body.key, "hash": chain_hash, "prev_hash": prev, "truth_state": body.truth_state, "timestamp_ns": ts_ns}


@router.get("/{key}")
async def read_entry(key: str):
    row = db.execute(
        "SELECT * FROM memory_entries WHERE key = ? ORDER BY timestamp_ns DESC LIMIT 1", [key]
    ).fetchone()
    if not row:
        raise HTTPException(404, f"Memory key '{key}' not found")
    return dict(row)


@router.delete("/{key}")
async def erase_entry(key: str):
    row = db.execute("SELECT * FROM memory_entries WHERE key = ? ORDER BY timestamp_ns DESC LIMIT 1", [key]).fetchone()
    if not row:
        raise HTTPException(404, f"Memory key '{key}' not found")
    ts_ns = time.time_ns()
    prev = _prev_hash()
    erased_of = _sha256(str(row["value"]))
    erased_value = f"[ERASED:{erased_of}]"
    chain_hash = _sha256(f"{prev}:{key}:{erased_value}:{ts_ns}")
    db.execute(
        "INSERT INTO memory_entries (key, value, hash, prev_hash, truth_state, timestamp_ns) VALUES (?,?,?,?,?,?)",
        [key, erased_value, chain_hash, prev, -1, ts_ns]
    )
    db.commit()
    return {"key": key, "erased": True, "erased_hash": erased_of}


@router.get("/chain/verify")
async def verify_chain():
    rows = db.execute("SELECT * FROM memory_entries ORDER BY timestamp_ns ASC").fetchall()
    prev = "GENESIS"
    for i, row in enumerate(rows):
        content = str(row["value"])
        expected = _sha256(f"{prev}:{row['key']}:{content}:{row['timestamp_ns']}")
        if row["hash"] != expected:
            return {"valid": False, "broken_at": i, "key": row["key"]}
        prev = row["hash"]
    return {"valid": True, "entries_verified": len(rows)}
