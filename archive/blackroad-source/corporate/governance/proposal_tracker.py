#!/usr/bin/env python3
"""BlackRoad Governance — RFC proposal tracker and voting system."""
import sqlite3, json, datetime, os

DB_PATH = os.path.expanduser("~/.blackroad/governance.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.execute("""CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT DEFAULT 'draft',
        body TEXT,
        votes_yes INTEGER DEFAULT 0,
        votes_no INTEGER DEFAULT 0,
        created_at TEXT
    )""")
    con.commit()
    return con

def create_proposal(id: str, title: str, body: str, author: str = "blackroad"):
    con = init_db()
    con.execute("INSERT OR IGNORE INTO proposals VALUES (?,?,?,?,?,0,0,?)",
        (id, title, author, "draft", body, datetime.datetime.utcnow().isoformat()))
    con.commit()
    print(f"✓ Created proposal {id}: {title}")
    con.close()

def vote(proposal_id: str, yes: bool = True):
    con = init_db()
    field = "votes_yes" if yes else "votes_no"
    con.execute(f"UPDATE proposals SET {field} = {field} + 1 WHERE id = ?", (proposal_id,))
    con.commit()
    con.close()
    print(f"✓ Vote recorded for {proposal_id}")

def list_proposals():
    con = init_db()
    rows = con.execute("SELECT id, title, status, votes_yes, votes_no FROM proposals ORDER BY created_at DESC").fetchall()
    print(f"\\n📋 BlackRoad Governance Proposals\\n")
    for row in rows:
        bar = "█" * row[3] + "░" * row[4]
        print(f"  [{row[2].upper():<8}] {row[0]}: {row[1]}  YES:{row[3]} NO:{row[4]}")
    con.close()

if __name__ == "__main__":
    import sys
    cmd = sys.argv[1] if len(sys.argv) > 1 else "list"
    if cmd == "create":
        create_proposal(sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv)>4 else "")
    elif cmd == "vote":
        vote(sys.argv[2], sys.argv[3].lower() == "yes" if len(sys.argv)>3 else True)
    else:
        list_proposals()

