#!/usr/bin/env python3
"""
BlackRoad Partnerships CRM
Track technology partnerships, integrations, and revenue sharing.
"""
import os, json, sqlite3
from datetime import datetime
from typing import Optional

DB_PATH = os.path.expanduser("~/.blackroad/partnerships.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS partners (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            contact_email TEXT,
            status TEXT DEFAULT 'prospect',
            tier TEXT DEFAULT 'standard',
            revenue_share_pct REAL DEFAULT 0,
            integration_url TEXT,
            notes TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS partner_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            partner_id TEXT REFERENCES partners(id),
            event_type TEXT,
            description TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    return conn

PARTNERS = [
    {"id": "cloudflare", "name": "Cloudflare", "category": "infrastructure",
     "status": "active", "tier": "enterprise", "integration_url": "https://cloudflare.com",
     "notes": "Workers, KV, R2, D1, AI — core edge infrastructure"},
    {"id": "railway", "name": "Railway", "category": "hosting",
     "status": "active", "tier": "standard", "integration_url": "https://railway.app",
     "notes": "Primary cloud hosting for microservices"},
    {"id": "huggingface", "name": "HuggingFace", "category": "ai",
     "status": "prospect", "tier": "standard", "integration_url": "https://huggingface.co",
     "notes": "Model hosting and inference API"},
    {"id": "vercel", "name": "Vercel", "category": "frontend",
     "status": "active", "tier": "standard", "integration_url": "https://vercel.com",
     "notes": "Next.js deployments for web properties"},
    {"id": "anthropic", "name": "Anthropic", "category": "ai",
     "status": "active", "tier": "enterprise", "integration_url": "https://anthropic.com",
     "notes": "Claude API via tokenless gateway"},
    {"id": "raspberry-pi", "name": "Raspberry Pi Foundation", "category": "hardware",
     "status": "active", "tier": "standard", "integration_url": "https://raspberrypi.org",
     "notes": "Edge AI hardware for local inference"},
]

def seed():
    db = get_db()
    for p in PARTNERS:
        db.execute("""
            INSERT OR IGNORE INTO partners 
            (id, name, category, status, tier, integration_url, notes)
            VALUES (:id, :name, :category, :status, :tier, :integration_url, :notes)
        """, p)
    db.commit()
    print(f"✓ Seeded {len(PARTNERS)} partners")

def list_partners(status: Optional[str] = None) -> list:
    db = get_db()
    if status:
        rows = db.execute("SELECT * FROM partners WHERE status=? ORDER BY tier, name", (status,)).fetchall()
    else:
        rows = db.execute("SELECT * FROM partners ORDER BY tier, name").fetchall()
    return [dict(r) for r in rows]

def add_event(partner_id: str, event_type: str, description: str):
    db = get_db()
    db.execute(
        "INSERT INTO partner_events (partner_id, event_type, description) VALUES (?, ?, ?)",
        (partner_id, event_type, description)
    )
    db.commit()
    print(f"✓ Event added: {partner_id} - {event_type}")

if __name__ == "__main__":
    seed()
    partners = list_partners()
    print(f"\n=== {len(partners)} Partners ===\n")
    for p in partners:
        status_icon = {"active": "✅", "prospect": "🔍", "inactive": "❌"}.get(p["status"], "?")
        print(f"{status_icon} [{p['tier']:10}] {p['name']:30} {p['category']:15} {p['notes'][:50]}")
