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
from .pipelines import PipelineExecutor, Pipeline, PipelineStep, BUILTIN_PIPELINES
from .jobs import JobScheduler, WorkerIntegration

log = logging.getLogger("orchestrator.controller")

# --- State ---
scheduler = SpawnScheduler()
bus = NATSBus()
router = TaskRouter()
pipeline_executor: PipelineExecutor | None = None
job_scheduler: JobScheduler | None = None
worker_integration: WorkerIntegration | None = None

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
    global pipeline_executor, job_scheduler, worker_integration

    _init_tasks_db()
    await bus.connect()

    # Subscribe to results and heartbeats
    await bus.subscribe_results(_handle_result)
    await bus.subscribe_heartbeats(_handle_heartbeat)

    # Start health check loop
    asyncio.create_task(_health_check_loop())

    # Initialize pipelines
    pipeline_executor = PipelineExecutor(bus)

    # Initialize job scheduler
    job_scheduler = JobScheduler(bus)
    await job_scheduler.start()

    # Initialize Worker integration
    worker_integration = WorkerIntegration()
    await worker_integration.init()

    log.info("Controller started on %s:%d (pipelines, jobs, integrations)", CONTROLLER_HOST, CONTROLLER_PORT)
    yield

    if job_scheduler:
        await job_scheduler.stop()
    if worker_integration:
        await worker_integration.close()
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
    """Process task results from nodes. Also forwards to pipeline executor."""
    # Forward to pipeline executor for chained steps
    if pipeline_executor:
        pipeline_executor.on_result(result)
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
        "version": "2.0.0",
        "nodes": router.cluster_stats(),
        "pools": scheduler.pool_stats()["total_agents"],
    }


# --- Pipeline API ---

class PipelineRequest(BaseModel):
    pipeline: str = ""              # Name of builtin pipeline
    input: str = ""                 # Initial input
    steps: list[dict] | None = None  # Custom steps [{archetype, prompt_template, intent}]

@app.post("/api/pipelines")
async def run_pipeline(req: PipelineRequest):
    """Execute a multi-step agent pipeline."""
    if not pipeline_executor:
        raise HTTPException(status_code=503, detail="Pipeline executor not ready")

    if req.pipeline:
        pipe = pipeline_executor.get_builtin(req.pipeline)
        if not pipe:
            raise HTTPException(status_code=404, detail=f"Pipeline '{req.pipeline}' not found. Available: {pipeline_executor.list_pipelines()}")
    elif req.steps:
        pipe = Pipeline(
            name="custom",
            steps=[PipelineStep(**s) for s in req.steps],
        )
    else:
        raise HTTPException(status_code=400, detail="Provide 'pipeline' name or 'steps' array")

    if not req.input:
        raise HTTPException(status_code=400, detail="'input' is required")

    # Run pipeline in background, return immediately
    task = asyncio.create_task(pipeline_executor.execute(pipe, req.input))

    return {
        "pipeline_id": pipe.pipeline_id,
        "name": pipe.name,
        "steps": len(pipe.steps),
        "status": "running",
    }


@app.get("/api/pipelines")
async def list_pipelines():
    """List available pipelines."""
    return {
        "builtin": [
            {"name": k, "steps": len(v.steps), "archetypes": [s.archetype for s in v.steps]}
            for k, v in BUILTIN_PIPELINES.items()
        ]
    }


# --- Jobs API ---

@app.get("/api/jobs")
async def list_jobs():
    """List recurring jobs and their status."""
    if not job_scheduler:
        return {"jobs": []}
    return {"jobs": job_scheduler.list_jobs()}


@app.post("/api/jobs/{name}/toggle")
async def toggle_job(name: str):
    """Enable or disable a recurring job."""
    if not job_scheduler:
        raise HTTPException(status_code=503, detail="Job scheduler not ready")
    if not job_scheduler.toggle_job(name):
        raise HTTPException(status_code=404, detail=f"Job '{name}' not found")
    return {"ok": True, "name": name}


# --- Worker Integration API ---

@app.get("/api/workers/health")
async def worker_health():
    """Check health of all Cloudflare Workers."""
    if not worker_integration:
        raise HTTPException(status_code=503, detail="Worker integration not ready")
    return await worker_integration.check_all_workers()


@app.get("/api/workers/search/stats")
async def search_stats():
    """Get search engine stats."""
    if not worker_integration:
        raise HTTPException(status_code=503, detail="Not ready")
    return await worker_integration.get_search_stats()


@app.get("/api/workers/fleet")
async def fleet_status():
    """Get fleet status from fleet API."""
    if not worker_integration:
        raise HTTPException(status_code=503, detail="Not ready")
    return await worker_integration.get_fleet_status()


@app.post("/api/tasks/batch")
async def submit_batch(tasks: list[TaskRequest]):
    """Submit multiple tasks at once."""
    results = []
    for req in tasks[:50]:  # Max 50 per batch
        task_id = f"task-{uuid.uuid4().hex[:12]}"
        target_node = req.target_node or router.best_node(req.archetype) or ""
        task = TaskMessage(
            task_id=task_id, archetype=req.archetype, intent=req.intent,
            prompt=req.prompt, priority=req.priority, target_node=target_node,
        )
        await bus.publish_task(task)
        _pending_tasks[task_id] = task
        results.append({"task_id": task_id, "archetype": req.archetype, "target_node": target_node})
    return {"submitted": len(results), "tasks": results}
