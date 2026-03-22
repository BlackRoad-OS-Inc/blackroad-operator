"""BlackRoad API — SQLite database module.

Single-file SQLite backing store for agents, tasks, and memory.
The gateway (port 8787) owns AI inference; this DB owns state.
"""
from __future__ import annotations
import sqlite3
import os
import time

_conn: sqlite3.Connection | None = None
_db_path: str = "./blackroad.db"


def get_db() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(_db_path, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute("PRAGMA journal_mode=WAL")
        _conn.execute("PRAGMA foreign_keys=ON")
    return _conn


def init_db(path: str = "./blackroad.db") -> None:
    global _db_path, _conn
    _db_path = path
    _conn = None  # reset so get_db() opens fresh

    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS agents (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        type        TEXT NOT NULL,
        status      TEXT DEFAULT 'idle',
        model       TEXT DEFAULT 'llama3.2',
        color       TEXT DEFAULT '#999',
        capabilities TEXT DEFAULT '[]',
        last_seen   INTEGER,
        task_count  INTEGER DEFAULT 0,
        created_at  INTEGER
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id          TEXT PRIMARY KEY,
        title       TEXT NOT NULL,
        description TEXT DEFAULT '',
        agent       TEXT,
        priority    TEXT DEFAULT 'medium',
        status      TEXT DEFAULT 'available',
        tags        TEXT DEFAULT '[]',
        skills      TEXT DEFAULT '[]',
        result      TEXT,
        ps_sha      TEXT,
        created_at  INTEGER,
        claimed_at  INTEGER,
        completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS memory_entries (
        hash        TEXT PRIMARY KEY,
        prev_hash   TEXT NOT NULL,
        content     TEXT NOT NULL,
        type        TEXT DEFAULT 'observation',
        truth_state INTEGER DEFAULT 0,
        agent       TEXT,
        tags        TEXT DEFAULT '[]',
        timestamp_ns INTEGER NOT NULL
    );
    """)

    # Seed the 6 core agents
    now = int(time.time())
    core_agents = [
        ("lucidia", "LUCIDIA", "reasoning",  "#9C27B0", '["reasoning","strategy","philosophy"]'),
        ("alice",   "ALICE",   "worker",     "#00FF88", '["execution","automation","deployment"]'),
        ("octavia", "OCTAVIA", "devops",     "#2979FF", '["infrastructure","k8s","monitoring"]'),
        ("prism",   "PRISM",   "analytics",  "#F5A623", '["analysis","patterns","reporting"]'),
        ("echo",    "ECHO",    "memory",     "#FF1D6C", '["recall","storage","context"]'),
        ("cipher",  "CIPHER",  "security",   "#999999", '["security","encryption","audit"]'),
    ]
    for aid, name, atype, color, caps in core_agents:
        db.execute(
            """INSERT OR IGNORE INTO agents
               (id, name, type, color, capabilities, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'idle', ?)""",
            [aid, name, atype, color, caps, now],
        )
    db.commit()
