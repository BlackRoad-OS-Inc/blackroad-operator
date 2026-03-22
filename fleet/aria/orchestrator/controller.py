"""
BlackRoad Agent Orchestrator — Controller
Central FastAPI service. Accepts tasks, routes to nodes, tracks results.
"""
import asyncio
import uuid
import time
import logging
import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import CONTROLLER_HOST, CONTROLLER_PORT, TASKS_DB
from .spawn import SpawnScheduler
from .nats_protocol import NATSBus, TaskMessage, ResultMessage, HeartbeatMessage
from .router import TaskRouter

log = logging.getLogger("orchestrator.controller")

# --- State ---
scheduler = SpawnScheduler()
bus = NATSBus()
router = TaskRouter()

# Task result store (in-memory, backed by SQLite)
_results: dict[str, ResultMessage] = {}
_pending_tasks: dict[str, TaskMessage] = {}


def _init_tasks_db():
    conn = sqlite3.connect(TASKS_DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS orchestrator_tasks (
        task_id TEXT PRIMARY KEY,
        archetype TEXT NOT NULL,
        intent TEXT,
        prompt TEXT,
        priority INTEGER DEFAULT 5,
        target_node TEXT,
        status TEXT DEFAULT 'pending',
        agent_id TEXT,
        node TEXT,
        result TEXT,
        error TEXT,
        latency_ms INTEGER,
        created_at REAL,
        completed_at REAL
    )""")
    conn.commit()
    conn.close()


# --- FastAPI Lifecycle ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_tasks_db()
    await bus.connect()

    # Subscribe to results and heartbeats
    await bus.subscribe_results(_handle_result)
    await bus.subscribe_heartbeats(_handle_heartbeat)

    # Start health check loop
    asyncio.create_task(_health_check_loop())

    log.info("Controller started on %s:%d", CONTROLLER_HOST, CONTROLLER_PORT)
    yield
    await bus.disconnect()
    log.info("Controller stopped")


app = FastAPI(
    title="BlackRoad Agent Orchestrator",
    version="1.0.0",
    description="30,000 agent orchestration layer",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Handlers ---

async def _handle_result(result: ResultMessage):
    """Process task results from nodes."""
    _results[result.task_id] = result
    _pending_tasks.pop(result.task_id, None)

    # Persist to SQLite
    try:
        conn = sqlite3.connect(TASKS_DB)
        conn.execute(
            """UPDATE orchestrator_tasks
               SET status=?, agent_id=?, node=?, result=?, error=?, latency_ms=?, completed_at=?
               WHERE task_id=?""",
            (
                result.status, result.agent_id, result.node,
                result.result, result.error, result.latency_ms,
                time.time(), result.task_id,
            ),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        log.error("Failed to persist result: %s", e)

    log.info(
        "Result: task=%s agent=%s node=%s status=%s latency=%dms",
        result.task_id, result.agent_id, result.node,
        result.status, result.latency_ms,
    )


async def _handle_heartbeat(hb: HeartbeatMessage):
    """Process node heartbeats."""
    router.update_heartbeat(hb)


async def _health_check_loop():
    """Periodic health checks."""
    while True:
        router.check_health(timeout=30.0)
        await asyncio.sleep(10)


# --- Request/Response Models ---

class TaskRequest(BaseModel):
    prompt: str
    archetype: str = "worker"
    intent: str = "general"
    priority: int = 5
    target_node: str = ""

class TaskResponse(BaseModel):
    task_id: str
    status: str
    archetype: str
    target_node: str

class TaskResultResponse(BaseModel):
    task_id: str
    status: str
    agent_id: str | None = None
    node: str | None = None
    result: str | None = None
    error: str | None = None
    latency_ms: int | None = None


# --- API Routes ---

@app.post("/api/tasks", response_model=TaskResponse)
async def submit_task(req: TaskRequest):
    """Submit a task for agent execution."""
    task_id = f"task-{uuid.uuid4().hex[:12]}"

    # Determine target node if not specified
    target_node = req.target_node
    if not target_node:
        target_node = router.best_node(req.archetype) or ""

    task = TaskMessage(
        task_id=task_id,
        archetype=req.archetype,
        intent=req.intent,
        prompt=req.prompt,
        priority=req.priority,
        target_node=target_node,
    )

    # Persist task
    try:
        conn = sqlite3.connect(TASKS_DB)
        conn.execute(
            """INSERT INTO orchestrator_tasks
               (task_id, archetype, intent, prompt, priority, target_node, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)""",
            (task_id, req.archetype, req.intent, req.prompt, req.priority, target_node, time.time()),
        )
        conn.commit()
        conn.close()
    except Exception as e:
        log.error("Failed to persist task: %s", e)

    # Publish to NATS
    await bus.publish_task(task)
    _pending_tasks[task_id] = task

    log.info("Task %s submitted: archetype=%s node=%s", task_id, req.archetype, target_node)
    return TaskResponse(
        task_id=task_id,
        status="pending",
        archetype=req.archetype,
        target_node=target_node,
    )


@app.get("/api/tasks/{task_id}", response_model=TaskResultResponse)
async def get_task(task_id: str):
    """Get task status and result."""
    # Check in-memory first
    if task_id in _results:
        r = _results[task_id]
        return TaskResultResponse(
            task_id=r.task_id, status=r.status, agent_id=r.agent_id,
            node=r.node, result=r.result, error=r.error, latency_ms=r.latency_ms,
        )
    if task_id in _pending_tasks:
        t = _pending_tasks[task_id]
        return TaskResultResponse(task_id=t.task_id, status="pending")

    # Check SQLite
    conn = sqlite3.connect(TASKS_DB)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT * FROM orchestrator_tasks WHERE task_id=?", (task_id,)).fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResultResponse(
        task_id=row["task_id"], status=row["status"],
        agent_id=row["agent_id"], node=row["node"],
        result=row["result"], error=row["error"], latency_ms=row["latency_ms"],
    )


@app.get("/api/tasks")
async def list_tasks(status: str = "", limit: int = 50):
    """List recent tasks."""
    conn = sqlite3.connect(TASKS_DB)
    conn.row_factory = sqlite3.Row
    if status:
        rows = conn.execute(
            "SELECT * FROM orchestrator_tasks WHERE status=? ORDER BY created_at DESC LIMIT ?",
            (status, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM orchestrator_tasks ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.get("/api/pools")
async def get_pools():
    """Get agent pool statistics."""
    return scheduler.pool_stats()


@app.get("/api/pools/available")
async def get_available():
    """Get available agents by archetype."""
    return scheduler.available_by_archetype()


@app.get("/api/nodes")
async def get_nodes():
    """Get node health and state."""
    return router.node_states()


@app.get("/api/cluster")
async def get_cluster():
    """Get aggregate cluster stats."""
    stats = router.cluster_stats()
    pool_stats = scheduler.pool_stats()
    return {
        **stats,
        "total_agents_registered": pool_stats["total_agents"],
        "total_agents_active": pool_stats["total_active"],
    }


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "nodes": router.cluster_stats(),
        "pools": scheduler.pool_stats()["total_agents"],
    }
