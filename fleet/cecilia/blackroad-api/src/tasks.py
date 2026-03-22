"""
BlackRoad Task Marketplace Router
PS-SHA∞ hash-chained task assignments with agent coordination.
"""
from __future__ import annotations
import os, json, hashlib, time, uuid
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import aiofiles

router = APIRouter(prefix="/tasks", tags=["tasks"])

TASKS_DIR = os.path.expanduser("~/.blackroad/tasks")


# ──────────────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str
    priority: str = "normal"  # low | normal | high | critical
    tags: List[str] = []
    skills: List[str] = []
    agent_hint: Optional[str] = None  # Preferred agent type


class TaskClaim(BaseModel):
    agent_id: str
    agent_type: str = "general"


class TaskComplete(BaseModel):
    agent_id: str
    result: str
    artifacts: List[str] = []


class TaskStatus(BaseModel):
    task_id: str
    title: str
    description: str
    priority: str
    tags: List[str]
    skills: List[str]
    status: str  # available | claimed | in_progress | completed | failed
    agent_id: Optional[str]
    posted_at: float
    claimed_at: Optional[float]
    completed_at: Optional[float]
    result: Optional[str]
    ps_sha: str  # PS-SHA∞ hash for tamper detection


# ──────────────────────────────────────────────────────
# Storage Helpers
# ──────────────────────────────────────────────────────

def _task_path(task_id: str, status: str) -> str:
    d = os.path.join(TASKS_DIR, status)
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, f"{task_id}.json")


def _ps_sha(prev_hash: str, task_id: str, content: str) -> str:
    raw = f"{prev_hash}:{task_id}:{content}:{time.time_ns()}"
    return hashlib.sha256(raw.encode()).hexdigest()


async def _load_task(task_id: str) -> Optional[dict]:
    for status in ["available", "claimed", "in_progress", "completed", "failed"]:
        path = os.path.join(TASKS_DIR, status, f"{task_id}.json")
        if os.path.exists(path):
            async with aiofiles.open(path) as f:
                return json.loads(await f.read()), status
    return None, None


async def _save_task(task: dict, status: str):
    path = _task_path(task["task_id"], status)
    async with aiofiles.open(path, "w") as f:
        await f.write(json.dumps(task, indent=2))


# ──────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────

@router.post("/", status_code=201)
async def post_task(body: TaskCreate):
    """Post a new task to the marketplace."""
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    now = time.time()
    task = {
        "task_id": task_id,
        "title": body.title,
        "description": body.description,
        "priority": body.priority,
        "tags": body.tags,
        "skills": body.skills,
        "agent_hint": body.agent_hint,
        "status": "available",
        "agent_id": None,
        "posted_at": now,
        "claimed_at": None,
        "completed_at": None,
        "result": None,
        "artifacts": [],
        "ps_sha": _ps_sha("GENESIS", task_id, body.description),
    }
    await _save_task(task, "available")
    return {"task_id": task_id, "status": "available"}


@router.get("/")
async def list_tasks(
    status: str = Query("available", description="Task status filter"),
    priority: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
):
    """List tasks by status."""
    os.makedirs(os.path.join(TASKS_DIR, status), exist_ok=True)
    tasks = []
    for fname in os.listdir(os.path.join(TASKS_DIR, status)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(TASKS_DIR, status, fname)
        async with aiofiles.open(path) as f:
            t = json.loads(await f.read())
        if priority and t.get("priority") != priority:
            continue
        if skill and skill not in t.get("skills", []):
            continue
        tasks.append(t)

    # Sort by priority
    order = {"critical": 0, "high": 1, "normal": 2, "low": 3}
    tasks.sort(key=lambda t: order.get(t.get("priority", "normal"), 2))
    return tasks[:limit]


@router.get("/{task_id}")
async def get_task(task_id: str):
    """Get task details."""
    task, status = await _load_task(task_id)
    if not task:
        raise HTTPException(404, f"Task {task_id} not found")
    return task


@router.post("/{task_id}/claim")
async def claim_task(task_id: str, body: TaskClaim):
    """Claim a task for execution."""
    task, status = await _load_task(task_id)
    if not task:
        raise HTTPException(404, f"Task {task_id} not found")
    if status not in ("available",):
        raise HTTPException(409, f"Task is {status}, cannot claim")

    # Move from available → claimed
    old_path = _task_path(task_id, "available")
    if os.path.exists(old_path):
        os.remove(old_path)

    task.update({
        "status": "claimed",
        "agent_id": body.agent_id,
        "claimed_at": time.time(),
        "ps_sha": _ps_sha(task["ps_sha"], task_id, f"claimed:{body.agent_id}"),
    })
    await _save_task(task, "claimed")
    return {"task_id": task_id, "status": "claimed", "agent_id": body.agent_id}


@router.post("/{task_id}/complete")
async def complete_task(task_id: str, body: TaskComplete):
    """Mark a task as completed."""
    task, status = await _load_task(task_id)
    if not task:
        raise HTTPException(404, f"Task {task_id} not found")

    if task.get("agent_id") != body.agent_id:
        raise HTTPException(403, "Only the claiming agent can complete this task")

    # Move to completed
    old_path = _task_path(task_id, status)
    if os.path.exists(old_path):
        os.remove(old_path)

    task.update({
        "status": "completed",
        "completed_at": time.time(),
        "result": body.result,
        "artifacts": body.artifacts,
        "ps_sha": _ps_sha(task["ps_sha"], task_id, f"completed:{body.result[:64]}"),
    })
    await _save_task(task, "completed")
    return {"task_id": task_id, "status": "completed"}


@router.delete("/{task_id}/cancel")
async def cancel_task(task_id: str):
    """Cancel a task."""
    task, status = await _load_task(task_id)
    if not task:
        raise HTTPException(404, f"Task {task_id} not found")
    old_path = _task_path(task_id, status)
    if os.path.exists(old_path):
        os.remove(old_path)
    task.update({"status": "failed", "result": "cancelled"})
    await _save_task(task, "failed")
    return {"task_id": task_id, "status": "failed"}


@router.get("/stats/summary")
async def task_stats():
    """Task marketplace statistics."""
    stats = {}
    for status in ["available", "claimed", "in_progress", "completed", "failed"]:
        d = os.path.join(TASKS_DIR, status)
        os.makedirs(d, exist_ok=True)
        stats[status] = len([f for f in os.listdir(d) if f.endswith(".json")])
    stats["total"] = sum(stats.values())
    return stats
