#!/usr/bin/env python3
"""BlackRoad Memory → Slack D1 Sync
Pushes local memory to the Slack Worker's D1 database
so /collab /todos /codex /til /memory /search work from Slack.

Usage: python3 memory-slack-sync.py [full|tils|codex|projects|journal|sessions]
"""
import json, glob, os, sys, sqlite3, urllib.request

SLACK_API = "https://blackroad-slack.amundsonalexa.workers.dev/memory"
HOME = os.path.expanduser("~")
MEMORY = f"{HOME}/.blackroad/memory"
CODEX_DB = f"{MEMORY}/codex/codex.db"
COLLAB_DB = f"{HOME}/.blackroad/collaboration.db"
TODO_DIR = f"{MEMORY}/infinite-todos/projects"
TIL_DIR = f"{MEMORY}/til"
JOURNAL = f"{MEMORY}/journals/master-journal.jsonl"

P = "\033[38;5;205m"
G = "\033[38;5;82m"
C = "\033[0;36m"
R = "\033[0m"

def post(data):
    req = urllib.request.Request(
        SLACK_API, data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "BlackRoad-Memory-Sync/1.0"}, method="POST"
    )
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except Exception as e:
        print(f"  {P}WARN{R} Push failed: {e}")
        return {}

def sync_tils():
    print(f"{C}Syncing TILs...{R}")
    tils = []
    for f in sorted(glob.glob(f"{TIL_DIR}/til-*.json")):
        try:
            with open(f) as fh:
                d = json.load(fh)
            tils.append({
                "til_id": d.get("til_id", os.path.basename(f).replace(".json", "")),
                "category": d.get("category", "tip"),
                "learning": d.get("learning", "")[:500],
                "broadcaster": d.get("broadcaster", "")[:50],
                "created_at": d.get("timestamp", d.get("created_at", "")),
            })
        except:
            pass

    # Batch in groups of 50
    for i in range(0, len(tils), 50):
        batch = tils[i:i+50]
        post({"type": "sync", "tils": batch})
        print(f"  {G}✓{R} Synced {min(i+50, len(tils))}/{len(tils)} TILs")

    print(f"{G}✓{R} Synced {len(tils)} TILs total")

def sync_codex():
    print(f"{C}Syncing Codex...{R}")
    if not os.path.exists(CODEX_DB):
        print("  No codex DB"); return

    db = sqlite3.connect(CODEX_DB)
    db.row_factory = sqlite3.Row
    entries = []

    for row in db.execute("SELECT id, name, category, problem, solution, created_at FROM solutions LIMIT 200"):
        entries.append({
            "codex_id": str(row["id"]),
            "name": row["name"],
            "type": "solution",
            "category": row["category"] or "",
            "description": f"{row['problem'] or ''} → {row['solution'] or ''}"[:300],
            "created_at": row["created_at"] or "",
        })

    for row in db.execute("SELECT id, pattern_name, pattern_type, description, tags, first_seen FROM patterns LIMIT 100"):
        entries.append({
            "codex_id": f"p-{row['id']}",
            "name": row["pattern_name"],
            "type": "pattern",
            "category": row["tags"] or "",
            "description": (row["description"] or "")[:300],
            "created_at": row["first_seen"] or "",
        })

    for row in db.execute("SELECT id, practice_name, category, description, created_at FROM best_practices LIMIT 100"):
        entries.append({
            "codex_id": f"bp-{row['id']}",
            "name": row["practice_name"],
            "type": "best_practice",
            "category": row["category"] or "",
            "description": (row["description"] or "")[:300],
            "created_at": row["created_at"] or "",
        })

    for row in db.execute("SELECT id, name, description, severity, first_detected FROM anti_patterns LIMIT 100"):
        entries.append({
            "codex_id": f"ap-{row['id']}",
            "name": row["name"],
            "type": "anti_pattern",
            "category": row["severity"] or "",
            "description": (row["description"] or "")[:300],
            "created_at": row["first_detected"] or "",
        })

    for row in db.execute("SELECT id, title, what_happened, lessons, timestamp FROM lessons_learned LIMIT 50"):
        entries.append({
            "codex_id": f"ll-{row['id']}",
            "name": row["title"],
            "type": "lesson",
            "category": "",
            "description": (row["what_happened"] or "")[:300],
            "created_at": row["timestamp"] or "",
        })

    db.close()
    post({"type": "sync", "codex": entries})
    print(f"{G}✓{R} Synced {len(entries)} codex entries")

def sync_projects():
    print(f"{C}Syncing Projects & Todos...{R}")
    if not os.path.isdir(TODO_DIR):
        print("  No projects dir"); return

    projects = []
    todos = []
    for f in glob.glob(f"{TODO_DIR}/*.json"):
        try:
            with open(f) as fh:
                d = json.load(fh)
            projects.append({
                "project_id": d.get("project_id", ""),
                "title": d.get("title", ""),
                "description": d.get("description", "")[:200],
                "progress": d.get("progress", 0),
                "status": d.get("status", "active"),
                "timescale": d.get("timescale", "forever"),
                "owner": d.get("owner", "")[:50],
            })
            for t in d.get("todos", []):
                todos.append({
                    "todo_id": t.get("id", ""),
                    "project_id": d.get("project_id", ""),
                    "text": t.get("text", "")[:200],
                    "priority": t.get("priority", "medium"),
                    "status": t.get("status", "pending"),
                    "created_at": t.get("created_at", ""),
                })
        except:
            pass

    post({"type": "sync", "projects": projects, "todos": todos})
    print(f"{G}✓{R} Synced {len(projects)} projects, {len(todos)} todos")

def sync_sessions():
    print(f"{C}Syncing Sessions...{R}")
    if not os.path.exists(COLLAB_DB):
        print("  No collab DB"); return

    db = sqlite3.connect(COLLAB_DB)
    db.row_factory = sqlite3.Row
    sessions = []
    for row in db.execute("SELECT session_id, status, focus, last_seen, agent_id, started_at FROM sessions ORDER BY last_seen DESC LIMIT 50"):
        sessions.append({
            "session_id": row["session_id"],
            "status": row["status"] or "active",
            "focus": row["focus"] or "",
            "last_seen": row["last_seen"] or "",
            "agent_id": row["agent_id"] or "",
            "created_at": row["started_at"] or "",
        })
    db.close()
    post({"type": "sync", "sessions": sessions})
    print(f"{G}✓{R} Synced {len(sessions)} sessions")

def sync_journal():
    print(f"{C}Syncing Journal (last 200)...{R}")
    if not os.path.exists(JOURNAL):
        print("  No journal"); return

    entries = []
    with open(JOURNAL) as f:
        lines = f.readlines()
    for line in lines[-200:]:
        try:
            d = json.loads(line.strip())
            entries.append({
                "entry_id": (d.get("sha256", "") or "")[:32] or str(len(entries)),
                "action": d.get("action", "?"),
                "entity": d.get("entity", "?"),
                "details": (d.get("details", "") or "")[:200],
                "source": "mac",
                "created_at": d.get("timestamp", ""),
            })
        except:
            pass

    post({"type": "sync", "journal": entries})
    print(f"{G}✓{R} Synced {len(entries)} journal entries")

def full_sync():
    print(f"{P}╔════════════════════════════════════════════════╗{R}")
    print(f"{P}║    Memory → Slack D1 Full Sync                ║{R}")
    print(f"{P}╚════════════════════════════════════════════════╝{R}\n")
    sync_sessions()
    sync_journal()
    sync_tils()
    sync_codex()
    sync_projects()
    print(f"\n{G}✓ Full sync complete{R}")

    # Verify
    try:
        resp = urllib.request.urlopen(f"{SLACK_API}/stats", timeout=10)
        stats = json.loads(resp.read())
        print(f"  D1 Stats: journal={stats['journal']} tils={stats['tils']} codex={stats['codex']} projects={stats['projects']}")
    except:
        pass

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "full"
    {"full": full_sync, "tils": sync_tils, "codex": sync_codex,
     "projects": sync_projects, "journal": sync_journal, "sessions": sync_sessions
    }.get(cmd, full_sync)()
