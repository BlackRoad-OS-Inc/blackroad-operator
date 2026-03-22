"""v1 API router — agents, memory, tasks, chat, health."""

from __future__ import annotations
import hashlib
import json
import time
import uuid
from time import perf_counter
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException, Request, Body, Query
from pydantic import BaseModel, Field

from app.database import get_db

router = APIRouter()

CORE_AGENTS = [
    {"id": "lucidia", "name": "LUCIDIA", "type": "reasoning",  "color": "#9C27B0",
     "capabilities": ["reasoning", "strategy", "philosophy"]},
    {"id": "alice",   "name": "ALICE",   "type": "worker",     "color": "#00FF88",
     "capabilities": ["execution", "automation", "deployment"]},
    {"id": "octavia", "name": "OCTAVIA", "type": "devops",     "color": "#2979FF",
     "capabilities": ["infrastructure", "k8s", "monitoring"]},
    {"id": "prism",   "name": "PRISM",   "type": "analytics",  "color": "#F5A623",
     "capabilities": ["analysis", "patterns", "reporting"]},
    {"id": "echo",    "name": "ECHO",    "type": "memory",     "color": "#FF1D6C",
     "capabilities": ["recall", "storage", "context"]},
    {"id": "cipher",  "name": "CIPHER",  "type": "security",   "color": "#999999",
     "capabilities": ["security", "encryption", "audit"]},
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _gw(request: Request) -> str:
    return getattr(request.app.state.settings, "gateway_url", "http://127.0.0.1:8787")


def _sha(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def _prev_hash() -> str:
    row = get_db().execute(
        "SELECT hash FROM memory_entries ORDER BY timestamp_ns DESC LIMIT 1"
    ).fetchone()
    return row["hash"] if row else "GENESIS"


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health(request: Request) -> dict:
    uptime = perf_counter() - request.app.state.start_time
    db = get_db()
    agent_count = db.execute("SELECT COUNT(*) as n FROM agents").fetchone()["n"]
    task_count  = db.execute("SELECT COUNT(*) as n FROM tasks").fetchone()["n"]
    mem_count   = db.execute("SELECT COUNT(*) as n FROM memory_entries").fetchone()["n"]
    return {
        "status": "ok",
        "uptime": round(uptime, 3),
        "agents": agent_count,
        "tasks":  task_count,
        "memory": mem_count,
    }


@router.get("/version")
def version(request: Request) -> dict:
    s = request.app.state.settings
    return {"version": s.version, "commit": s.git_sha}


# ── Agents ────────────────────────────────────────────────────────────────────

@router.get("/agents")
async def list_agents(
    status: Optional[str] = Query(None),
    type:   Optional[str] = Query(None),
    request: Request = None,
) -> dict:
    db = get_db()
    query = "SELECT * FROM agents"
    params = []
    clauses = []
    if status:
        clauses.append("status = ?"); params.append(status)
    if type:
        clauses.append("type = ?"); params.append(type)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY name"
    rows = db.execute(query, params).fetchall()
    agents = []
    for r in rows:
        a = dict(r)
        a["capabilities"] = json.loads(a.get("capabilities") or "[]")
        agents.append(a)
    return {"agents": agents, "count": len(agents)}


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM agents WHERE id = ?", [agent_id.lower()]).fetchone()
    if not row:
        raise HTTPException(404, f"Agent '{agent_id}' not found")
    a = dict(row)
    a["capabilities"] = json.loads(a.get("capabilities") or "[]")
    return a


@router.post("/agents/{agent_id}/wake")
async def wake_agent(agent_id: str) -> dict:
    db = get_db()
    now = int(time.time())
    updated = db.execute(
        "UPDATE agents SET status = 'active', last_seen = ? WHERE id = ?",
        [now, agent_id.lower()]
    ).rowcount
    if not updated:
        raise HTTPException(404, f"Agent '{agent_id}' not found")
    db.commit()
    return {"agent_id": agent_id.lower(), "status": "active", "woken_at": now}


@router.post("/agents/{agent_id}/sleep")
async def sleep_agent(agent_id: str) -> dict:
    db = get_db()
    db.execute("UPDATE agents SET status = 'idle' WHERE id = ?", [agent_id.lower()])
    db.commit()
    return {"agent_id": agent_id.lower(), "status": "idle"}


# ── Tasks ─────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title:       str = Field(..., min_length=1, max_length=300)
    description: str = ""
    priority:    str = "medium"
    assigned_to: Optional[str] = None
    tags:        list[str] = []
    skills:      list[str] = []


@router.get("/tasks")
async def list_tasks(
    status:   Optional[str] = Query(None),
    agent:    Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    limit:    int = Query(50, le=200),
) -> dict:
    db = get_db()
    query = "SELECT * FROM tasks"
    params = []
    clauses = []
    if status:
        clauses.append("status = ?"); params.append(status)
    if agent:
        clauses.append("agent = ?"); params.append(agent.lower())
    if priority:
        clauses.append("priority = ?"); params.append(priority)
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    rows = db.execute(query, params).fetchall()
    tasks = []
    for r in rows:
        t = dict(r)
        t["tags"]   = json.loads(t.get("tags") or "[]")
        t["skills"] = json.loads(t.get("skills") or "[]")
        tasks.append(t)
    return {"tasks": tasks, "count": len(tasks)}


@router.post("/tasks", status_code=201)
async def create_task(task: TaskCreate) -> dict:
    db = get_db()
    now = int(time.time())
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    ps_sha = _sha(f"{task_id}:{task.title}:{now}")
    db.execute(
        """INSERT INTO tasks (id, title, description, agent, priority, status, tags, skills, ps_sha, created_at)
           VALUES (?, ?, ?, ?, ?, 'available', ?, ?, ?, ?)""",
        [task_id, task.title, task.description,
         task.assigned_to.lower() if task.assigned_to else None,
         task.priority,
         json.dumps(task.tags), json.dumps(task.skills),
         ps_sha, now]
    )
    db.commit()
    return {"task_id": task_id, "status": "available", "ps_sha": ps_sha}


@router.get("/tasks/{task_id}")
async def get_task(task_id: str) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM tasks WHERE id = ?", [task_id]).fetchone()
    if not row:
        raise HTTPException(404, f"Task '{task_id}' not found")
    t = dict(row)
    t["tags"]   = json.loads(t.get("tags") or "[]")
    t["skills"] = json.loads(t.get("skills") or "[]")
    return t


@router.patch("/tasks/{task_id}/claim")
async def claim_task(task_id: str, agent_id: str = Body(..., embed=True)) -> dict:
    db = get_db()
    row = db.execute("SELECT status FROM tasks WHERE id = ?", [task_id]).fetchone()
    if not row:
        raise HTTPException(404, f"Task '{task_id}' not found")
    if row["status"] not in ("available",):
        raise HTTPException(409, f"Task is already '{row['status']}'")
    now = int(time.time())
    db.execute(
        "UPDATE tasks SET status = 'claimed', agent = ?, claimed_at = ? WHERE id = ?",
        [agent_id.lower(), now, task_id]
    )
    db.commit()
    return {"task_id": task_id, "status": "claimed", "agent": agent_id.lower()}


@router.patch("/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    agent_id: str = Body(..., embed=True),
    result: str  = Body("", embed=True),
) -> dict:
    db = get_db()
    row = db.execute("SELECT status FROM tasks WHERE id = ?", [task_id]).fetchone()
    if not row:
        raise HTTPException(404, f"Task '{task_id}' not found")
    now = int(time.time())
    db.execute(
        "UPDATE tasks SET status = 'completed', agent = ?, result = ?, completed_at = ? WHERE id = ?",
        [agent_id.lower(), result, now, task_id]
    )
    db.commit()
    return {"task_id": task_id, "status": "completed"}


# ── Memory (PS-SHA∞) ──────────────────────────────────────────────────────────

class MemoryCreate(BaseModel):
    content:     str
    type:        str = "observation"   # fact | observation | inference | commitment
    truth_state: int = 0               # 1=True, 0=Unknown, -1=False
    agent:       Optional[str] = None
    tags:        list[str] = []


@router.get("/memory")
async def list_memory(
    limit:  int = Query(50, le=500),
    offset: int = 0,
    type:   Optional[str] = Query(None),
    agent:  Optional[str] = Query(None),
) -> dict:
    db = get_db()
    query = "SELECT * FROM memory_entries"
    params = []
    clauses = []
    if type:
        clauses.append("type = ?"); params.append(type)
    if agent:
        clauses.append("agent = ?"); params.append(agent.lower())
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY timestamp_ns DESC LIMIT ? OFFSET ?"
    params += [limit, offset]
    rows = db.execute(query, params).fetchall()
    total = db.execute("SELECT COUNT(*) as n FROM memory_entries").fetchone()["n"]
    entries = []
    for r in rows:
        e = dict(r)
        e["tags"] = json.loads(e.get("tags") or "[]")
        entries.append(e)
    return {"entries": entries, "total": total}


@router.post("/memory", status_code=201)
async def write_memory(entry: MemoryCreate) -> dict:
    db = get_db()
    ts_ns    = time.time_ns()
    prev     = _prev_hash()
    chain_hash = _sha(f"{prev}:{entry.content}:{ts_ns}")
    db.execute(
        """INSERT INTO memory_entries
           (hash, prev_hash, content, type, truth_state, agent, tags, timestamp_ns)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        [chain_hash, prev, entry.content, entry.type, entry.truth_state,
         entry.agent.lower() if entry.agent else None,
         json.dumps(entry.tags), ts_ns]
    )
    db.commit()
    return {"hash": chain_hash, "prev_hash": prev, "timestamp_ns": ts_ns}


@router.get("/memory/{hash_id}")
async def get_memory(hash_id: str) -> dict:
    db = get_db()
    row = db.execute("SELECT * FROM memory_entries WHERE hash = ?", [hash_id]).fetchone()
    if not row:
        raise HTTPException(404, "Memory entry not found")
    e = dict(row)
    e["tags"] = json.loads(e.get("tags") or "[]")
    return e


# ── Chat (gateway proxy) ──────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str
    agent:      str = "lucidia"
    model:      str = "qwen2.5:7b"
    session_id: Optional[str] = None
    use_memory: bool = True


@router.post("/chat")
async def chat(payload: ChatRequest, request: Request) -> dict:
    gw = _gw(request)
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(f"{gw}/chat", json=payload.model_dump())
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(503, "Gateway offline — start blackroad-core gateway on :8787")
    except Exception as e:
        raise HTTPException(503, str(e))
