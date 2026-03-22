"""BlackRoad API — Agents Router"""
from __future__ import annotations
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .database import db

router = APIRouter(prefix="/agents", tags=["agents"])

AGENT_TYPES = {
    "lucidia": "logic", "alice": "gateway", "octavia": "compute",
    "prism": "vision", "echo": "memory", "cipher": "security",
}


@router.get("/")
async def list_agents(status: str | None = None):
    query = "SELECT * FROM agents" + (" WHERE status = ?" if status else "") + " ORDER BY name"
    rows = db.execute(query, [status] if status else []).fetchall()
    return {"agents": [dict(r) for r in rows], "count": len(rows)}


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    row = db.execute("SELECT * FROM agents WHERE id = ?", [agent_id.lower()]).fetchone()
    if not row:
        raise HTTPException(404, f"Agent '{agent_id}' not found")
    return dict(row)


@router.post("/{agent_id}/wake")
async def wake_agent(agent_id: str):
    row = db.execute("SELECT id FROM agents WHERE id = ?", [agent_id.lower()]).fetchone()
    if not row:
        raise HTTPException(404, f"Agent '{agent_id}' not found")
    db.execute("UPDATE agents SET status = 'active', last_seen = ? WHERE id = ?",
               [int(time.time()), agent_id.lower()])
    db.commit()
    return {"agent_id": agent_id.lower(), "status": "active", "woken_at": int(time.time())}


@router.post("/{agent_id}/sleep")
async def sleep_agent(agent_id: str):
    db.execute("UPDATE agents SET status = 'idle' WHERE id = ?", [agent_id.lower()])
    db.commit()
    return {"agent_id": agent_id.lower(), "status": "idle"}


class TaskAssignment(BaseModel):
    task: str
    priority: int = 5


@router.post("/{agent_id}/assign")
async def assign_task(agent_id: str, body: TaskAssignment):
    task_id = f"task_{int(time.time() * 1000)}"
    db.execute(
        "INSERT INTO tasks (id, title, agent, priority, status, created_at) VALUES (?,?,?,?,?,?)",
        [task_id, body.task, agent_id.lower(), body.priority, "pending", int(time.time())]
    )
    db.execute("UPDATE agents SET task_count = task_count + 1 WHERE id = ?", [agent_id.lower()])
    db.commit()
    return {"task_id": task_id, "agent": agent_id.lower(), "status": "pending"}
