#!/usr/bin/env python3
"""
BlackRoad Ventures — Deal Pipeline CRM
SQLite-based deal tracking with stages, contacts, and tasks
"""

import sqlite3
import json
from datetime import datetime, date
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional

DB_PATH = Path.home() / ".blackroad" / "ventures-pipeline.db"

STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]

@dataclass
class Deal:
    id: Optional[int]
    name: str
    company: str
    stage: str
    value_usd: float
    probability: float
    owner: str
    notes: str
    created_at: str
    updated_at: str

@dataclass
class Contact:
    id: Optional[int]
    deal_id: int
    name: str
    email: str
    role: str
    last_contact: str

@dataclass
class Task:
    id: Optional[int]
    deal_id: int
    title: str
    due_date: str
    done: bool
    created_at: str


def get_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS deals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                company TEXT NOT NULL,
                stage TEXT NOT NULL DEFAULT 'lead',
                value_usd REAL DEFAULT 0,
                probability REAL DEFAULT 0.5,
                owner TEXT DEFAULT 'Alexa',
                notes TEXT DEFAULT '',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT,
                role TEXT DEFAULT 'stakeholder',
                last_contact TEXT DEFAULT (date('now'))
            );
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                due_date TEXT,
                done INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            );
        """)


def add_deal(name: str, company: str, value: float = 0, stage: str = "lead") -> int:
    init_db()
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO deals (name, company, stage, value_usd) VALUES (?, ?, ?, ?)",
            (name, company, stage, value)
        )
        return cur.lastrowid


def move_stage(deal_id: int, new_stage: str):
    assert new_stage in STAGES, f"Invalid stage: {new_stage}"
    with get_db() as conn:
        conn.execute(
            "UPDATE deals SET stage=?, updated_at=datetime('now') WHERE id=?",
            (new_stage, deal_id)
        )


def pipeline_summary() -> dict:
    init_db()
    with get_db() as conn:
        rows = conn.execute("""
            SELECT stage,
                   COUNT(*) as count,
                   SUM(value_usd) as total_value,
                   AVG(probability) as avg_prob
            FROM deals
            GROUP BY stage
            ORDER BY id
        """).fetchall()
        return {
            "stages": [dict(r) for r in rows],
            "total_pipeline": sum(r["total_value"] or 0 for r in rows),
            "weighted_pipeline": sum(
                (r["total_value"] or 0) * (r["avg_prob"] or 0) for r in rows
            ),
        }


def overdue_tasks() -> list:
    init_db()
    today = date.today().isoformat()
    with get_db() as conn:
        rows = conn.execute("""
            SELECT t.*, d.name as deal_name
            FROM tasks t JOIN deals d ON t.deal_id = d.id
            WHERE t.done = 0 AND t.due_date < ?
            ORDER BY t.due_date
        """, (today,)).fetchall()
        return [dict(r) for r in rows]


if __name__ == "__main__":
    init_db()

    # Demo: seed data
    d1 = add_deal("Series A Term Sheet", "TechCo AI", 500_000, "negotiation")
    d2 = add_deal("Strategic Partnership", "BuildCorp", 250_000, "proposal")
    d3 = add_deal("Licensing Deal", "GlobalSoft", 100_000, "lead")

    summary = pipeline_summary()
    print("=== BlackRoad Ventures Pipeline ===")
    for s in summary["stages"]:
        bar = "█" * int(s["count"])
        print(f"  {s['stage']:20s} {bar:10s} ${s['total_value']:>10,.0f}")
    print(f"\n  Total pipeline:   ${summary['total_pipeline']:>12,.0f}")
    print(f"  Weighted pipeline: ${summary['weighted_pipeline']:>11,.0f}")
