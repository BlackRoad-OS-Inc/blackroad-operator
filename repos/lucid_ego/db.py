"""Core database helpers for the Lucid Ego memory store."""
from __future__ import annotations

import json
import sqlite3
import struct
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, MutableMapping, Optional, Sequence

SCHEMA_VERSION = 1

SCHEMA_STATEMENTS: Sequence[str] = (
    """
    CREATE TABLE IF NOT EXISTS agents (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      role          TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      agent_id      TEXT NOT NULL REFERENCES agents(id),
      label         TEXT,
      started_at    TEXT DEFAULT (datetime('now')),
      ended_at      TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS decisions (
      id            TEXT PRIMARY KEY,
      session_id    TEXT NOT NULL REFERENCES sessions(id),
      step_index    INTEGER NOT NULL,
      prompt        TEXT,
      output        TEXT,
      rationale     TEXT,
      score         REAL,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS artifacts (
      id            TEXT PRIMARY KEY,
      session_id    TEXT NOT NULL REFERENCES sessions(id),
      decision_id   TEXT REFERENCES decisions(id),
      kind          TEXT,
      uri           TEXT,
      sha256        TEXT,
      bytes         BLOB
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id    TEXT NOT NULL REFERENCES sessions(id),
      ts            TEXT DEFAULT (datetime('now')),
      level         TEXT,
      channel       TEXT,
      message       TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS embeddings (
      id            TEXT PRIMARY KEY,
      session_id    TEXT REFERENCES sessions(id),
      ref_kind      TEXT,
      ref_id        TEXT,
      model         TEXT NOT NULL,
      dim           INTEGER NOT NULL,
      vector        BLOB NOT NULL,
      metadata      TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS schema_version (
      version     INTEGER PRIMARY KEY,
      applied_at  TEXT DEFAULT (datetime('now'))
    );
    """,
)

PRAGMA_STATEMENTS: Sequence[str] = (
    "PRAGMA journal_mode=WAL;",
    "PRAGMA synchronous=NORMAL;",
)


@dataclass
class LucidEgoDB:
    """High-level interface for the Lucid Ego SQLite database."""

    path: Path

    def __init__(self, path: Path | str = Path("lucid_ego.db")) -> None:
        self.path = Path(path)

    # ------------------------------------------------------------------
    # Connection helpers
    # ------------------------------------------------------------------
    def connect(self) -> sqlite3.Connection:
        """Return a configured SQLite connection."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        con = sqlite3.connect(self.path)
        con.row_factory = sqlite3.Row
        for pragma in PRAGMA_STATEMENTS:
            con.execute(pragma)
        return con

    # ------------------------------------------------------------------
    # Schema management
    # ------------------------------------------------------------------
    def init(self) -> None:
        """Initialise the database schema if it does not already exist."""
        with self.connect() as con:
            for statement in SCHEMA_STATEMENTS:
                con.execute(statement)
            con.execute(
                "INSERT OR IGNORE INTO schema_version (version) VALUES (?)",
                (SCHEMA_VERSION,),
            )
            con.commit()

    # ------------------------------------------------------------------
    # Agent + session helpers
    # ------------------------------------------------------------------
    def ensure_agent(self, name: str, role: Optional[str] = None, *, agent_id: str | None = None) -> str:
        """Insert or update an agent record and return its id."""
        agent_id = agent_id or str(uuid.uuid4())
        with self.connect() as con:
            con.execute(
                """
                INSERT INTO agents (id, name, role)
                VALUES (?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  name=excluded.name,
                  role=excluded.role
                """,
                (agent_id, name, role),
            )
            con.commit()
        return agent_id

    def start_session(self, agent_id: str, label: Optional[str] = None, *, session_id: Optional[str] = None) -> str:
        """Create a new session entry and return its id."""
        session_id = session_id or str(uuid.uuid4())
        with self.connect() as con:
            con.execute(
                "INSERT INTO sessions (id, agent_id, label) VALUES (?, ?, ?)",
                (session_id, agent_id, label),
            )
            con.commit()
        return session_id

    def end_session(self, session_id: str) -> None:
        """Mark a session as finished."""
        with self.connect() as con:
            con.execute(
                "UPDATE sessions SET ended_at = datetime('now') WHERE id = ?",
                (session_id,),
            )
            con.commit()

    # ------------------------------------------------------------------
    # Logging and decisions
    # ------------------------------------------------------------------
    def log(self, session_id: str, level: str, channel: str, message: str) -> int:
        """Append a log entry and return the log identifier."""
        with self.connect() as con:
            cursor = con.execute(
                "INSERT INTO logs (session_id, level, channel, message) VALUES (?, ?, ?, ?)",
                (session_id, level, channel, message),
            )
            con.commit()
            return cursor.lastrowid

    def record_decision(
        self,
        session_id: str,
        step_index: int,
        prompt: Optional[str],
        output: Optional[str],
        rationale: Optional[str] = None,
        score: Optional[float] = None,
        *,
        decision_id: Optional[str] = None,
    ) -> str:
        """Store a decision entry and return its identifier."""
        decision_id = decision_id or str(uuid.uuid4())
        with self.connect() as con:
            con.execute(
                """
                INSERT INTO decisions (id, session_id, step_index, prompt, output, rationale, score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (decision_id, session_id, step_index, prompt, output, rationale, score),
            )
            con.commit()
        return decision_id

    def add_artifact(
        self,
        session_id: str,
        kind: str,
        uri: str,
        *,
        decision_id: Optional[str] = None,
        sha256: Optional[str] = None,
        inline_bytes: Optional[bytes] = None,
        artifact_id: Optional[str] = None,
    ) -> str:
        """Attach an artifact to a session or decision."""
        artifact_id = artifact_id or str(uuid.uuid4())
        with self.connect() as con:
            con.execute(
                """
                INSERT INTO artifacts (id, session_id, decision_id, kind, uri, sha256, bytes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (artifact_id, session_id, decision_id, kind, uri, sha256, inline_bytes),
            )
            con.commit()
        return artifact_id

    # ------------------------------------------------------------------
    # Embeddings
    # ------------------------------------------------------------------
    def add_embedding(
        self,
        session_id: Optional[str],
        ref_kind: str,
        ref_id: str,
        model: str,
        vector: Sequence[float],
        *,
        metadata: Optional[MutableMapping[str, Any]] = None,
        embedding_id: Optional[str] = None,
    ) -> str:
        """Store or replace an embedding."""
        embedding_id = embedding_id or str(uuid.uuid4())
        blob = pack_f32(vector)
        metadata_json = json.dumps(metadata or {})
        with self.connect() as con:
            con.execute(
                """
                INSERT OR REPLACE INTO embeddings
                  (id, session_id, ref_kind, ref_id, model, dim, vector, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (embedding_id, session_id, ref_kind, ref_id, model, len(vector), blob, metadata_json),
            )
            con.commit()
        return embedding_id

    # ------------------------------------------------------------------
    # Retrieval helpers
    # ------------------------------------------------------------------
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Return a dictionary with session details, decisions, and logs."""
        with self.connect() as con:
            session_row = con.execute(
                "SELECT * FROM sessions WHERE id = ?",
                (session_id,),
            ).fetchone()
            if session_row is None:
                raise KeyError(f"Unknown session: {session_id}")

            agent_row = con.execute(
                "SELECT * FROM agents WHERE id = ?",
                (session_row["agent_id"],),
            ).fetchone()

            decisions = con.execute(
                "SELECT * FROM decisions WHERE session_id = ? ORDER BY step_index",
                (session_id,),
            ).fetchall()
            logs = con.execute(
                "SELECT * FROM logs WHERE session_id = ? ORDER BY ts",
                (session_id,),
            ).fetchall()
            artifacts = con.execute(
                "SELECT * FROM artifacts WHERE session_id = ? ORDER BY id",
                (session_id,),
            ).fetchall()

        return {
            "session": dict(session_row),
            "agent": dict(agent_row) if agent_row else None,
            "decisions": [dict(row) for row in decisions],
            "logs": [dict(row) for row in logs],
            "artifacts": [dict(row) for row in artifacts],
        }

    def dump_session(self, session_id: str) -> str:
        """Return a JSON dump for a session (decisions, logs, artifacts)."""
        payload = self.get_session(session_id)
        return json.dumps(payload, indent=2, sort_keys=True)


# ----------------------------------------------------------------------
# Utility helpers
# ----------------------------------------------------------------------

def pack_f32(vector: Sequence[float]) -> bytes:
    """Pack a vector of floats as little-endian float32 bytes."""
    if not vector:
        raise ValueError("Vector must contain at least one value")
    return struct.pack(f"<{len(vector)}f", *vector)


def unpack_f32(blob: bytes) -> List[float]:
    """Unpack float32 bytes into a Python list."""
    if len(blob) % 4:
        raise ValueError("Embedding blob length must be divisible by 4")
    count = len(blob) // 4
    return list(struct.unpack(f"<{count}f", blob))


__all__ = ["LucidEgoDB", "pack_f32", "unpack_f32", "SCHEMA_VERSION"]
