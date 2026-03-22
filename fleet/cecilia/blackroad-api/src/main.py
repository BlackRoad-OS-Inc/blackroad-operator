"""
BlackRoad API — Main FastAPI Application
Runs on port 8788 (gateway is 8787).
"""
from __future__ import annotations
import sqlite3
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .tasks import router as tasks_router
from .agents import router as agents_router
from .memory import router as memory_router

DB_PATH = os.getenv("BLACKROAD_DB", "./blackroad.db")


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        agent TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        payload TEXT DEFAULT '{}',
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at INTEGER,
        updated_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'idle',
        model TEXT DEFAULT 'llama3.2',
        last_seen INTEGER,
        task_count INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS memory_entries (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        hash TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        truth_state INTEGER DEFAULT 0,
        timestamp_ns INTEGER NOT NULL
    );
    """)
    db.commit()

    # Seed core agents
    for name, atype in [
        ("LUCIDIA", "logic"), ("ALICE", "gateway"), ("OCTAVIA", "compute"),
        ("PRISM", "vision"), ("ECHO", "memory"), ("CIPHER", "security")
    ]:
        db.execute(
            "INSERT OR IGNORE INTO agents (id, name, type) VALUES (?, ?, ?)",
            [name.lower(), name, atype]
        )
    db.commit()


app = FastAPI(
    title="BlackRoad API",
    description="REST API for BlackRoad OS — agents, tasks, and memory",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(CORSMiddleware,
    allow_origins=["https://blackroad.io", "http://localhost:3000"],
    allow_methods=["*"], allow_headers=["*"], allow_credentials=True)


@app.on_event("startup")
async def startup():
    # Make db available globally for routers
    import blackroad_api.database as _db
    _db.db = get_db()
    init_db()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "blackroad-api", "version": "0.1.0"}


app.include_router(tasks_router)
app.include_router(agents_router)
app.include_router(memory_router)
