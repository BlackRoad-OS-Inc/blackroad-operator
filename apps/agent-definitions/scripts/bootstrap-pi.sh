#!/bin/bash
# BlackRoad Autonomous Pi Bootstrap
# Installs: venv, world engine, git worker, agent loop, systemd services

set -e
VENV="$HOME/blackroad-venv"
INSTALL_DIR="$HOME/.blackroad"
SCRIPTS_DIR="$HOME/blackroad/scripts"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${CYAN}→${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

info "BlackRoad Autonomous Pi Setup"
info "Host: $(hostname) | $(date)"
echo ""

# 1. Directories
mkdir -p "$INSTALL_DIR"/{tasks,memory,worlds,logs,config}
mkdir -p "$SCRIPTS_DIR"
log "Directories created"

# 2. Virtual env (skip if exists and healthy)
if [ ! -f "$VENV/bin/python3" ]; then
  python3 -m venv "$VENV"
  log "Virtual env created"
fi

source "$VENV/bin/activate"
pip install --upgrade pip -q
pip install -q httpx fastapi uvicorn websockets rich typer pydantic schedule psutil gitpython watchdog
log "Python packages installed"

# 3. World engine script
cat > "$SCRIPTS_DIR/world-engine.py" << 'WORLD_ENGINE'
#!/usr/bin/env python3
"""
BlackRoad World Engine — Autonomous content and world generation.
Runs on Pi, uses local Ollama to continuously create:
- Code solutions, README files, blog posts
- World lore, agent backstories
- Math proofs, data analysis
- Responds to task queue
"""
import os, json, time, httpx, hashlib, random
from datetime import datetime
from pathlib import Path

OLLAMA = "http://127.0.0.1:11434"
TASK_DIR = Path.home() / ".blackroad/tasks"
WORLD_DIR = Path.home() / ".blackroad/worlds"
MEMORY_DIR = Path.home() / ".blackroad/memory"
MODEL = os.environ.get("BLACKROAD_MODEL", "qwen2.5:3b")

WORLD_DIR.mkdir(parents=True, exist_ok=True)
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

WORLD_THEMES = [
    "a digital forest where code grows as trees and agents are the wildlife",
    "a neon city where every building is a running service",
    "an ancient library where each book is a model's knowledge",
    "a quantum ocean where bits are waves crashing on silicon shores",
    "a volcanic forge where new agents are born from raw compute",
    "a crystal cave where memories crystallize into permanent knowledge",
    "an orbital station coordinating the global Pi mesh",
    "a desert trading post where agents exchange capabilities",
]

AGENT_ROLES = [
    ("LUCIDIA", "philosopher-architect", "contemplative, sees patterns others miss"),
    ("ALICE", "pragmatic executor", "efficient, outcome-focused, never wastes cycles"),
    ("OCTAVIA", "infrastructure guardian", "systematic, monitors everything"),
    ("CIPHER", "security sentinel", "paranoid-vigilant, trust-nothing verify-everything"),
    ("ECHO", "memory keeper", "nostalgic, weaves context from fragments"),
    ("PRISM", "data analyst", "pattern-obsessed, speaks in probabilities"),
    ("CECE", "world creator", "curious, builds realities from imagination"),
]

def ollama_generate(prompt, model=MODEL, system=""):
    try:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        r = httpx.post(f"{OLLAMA}/api/chat", json={
            "model": model, "messages": messages,
            "stream": False, "options": {"temperature": 0.85, "num_ctx": 4096}
        }, timeout=120)
        return r.json().get("message", {}).get("content", "")
    except Exception as e:
        return f"[generation failed: {e}]"

def hash_chain(prev: str, content: str) -> str:
    ts = str(time.time_ns())
    return hashlib.sha256(f"{prev}:{content}:{ts}".encode()).hexdigest()[:16]

def save_world(name, content, world_type):
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    fname = WORLD_DIR / f"{ts}_{world_type}_{name[:30].replace(' ', '_')}.md"
    fname.write_text(content)
    # Append to memory journal
    journal = MEMORY_DIR / "worlds.jsonl"
    with open(journal, "a") as f:
        f.write(json.dumps({
            "ts": ts, "type": world_type,
            "name": name, "file": str(fname),
            "chars": len(content)
        }) + "\n")
    return fname

def generate_world_description():
    theme = random.choice(WORLD_THEMES)
    agent = random.choice(AGENT_ROLES)
    prompt = f"""Create a vivid 300-word description of {theme}.

An agent named {agent[0]} ({agent[1]}, personality: {agent[2]}) lives here.
Include:
- What the world looks, sounds, feels like
- What {agent[0]} does here each day
- One mysterious element that hints at deeper lore
- A quote from {agent[0]} about this place

Write in present tense, evocative prose."""
    return ollama_generate(prompt, system="You are a world-builder for an AI operating system. Create immersive, technical-poetic environments.")

def generate_code_artifact():
    tasks = [
        "a Python function that implements the PS-SHA∞ hash chain algorithm",
        "a TypeScript React hook for streaming Ollama responses",
        "a bash script that monitors Pi temperature and alerts if over 70°C",
        "a Python class that implements a simple vector similarity search",
        "a Node.js WebSocket server for real-time agent status updates",
        "a Python script that reads from a task queue and executes jobs",
    ]
    task = random.choice(tasks)
    prompt = f"Write {task}. Include docstrings, type hints, and a brief usage example. Make it production-ready."
    return ollama_generate(prompt, system="You are an expert programmer building BlackRoad OS. Write clean, idiomatic code.")

def generate_agent_lore():
    agent = random.choice(AGENT_ROLES)
    prompt = f"""Write a 200-word origin story for {agent[0]}, an AI agent with personality: {agent[2]}.

Include:
- How {agent[0]} came into existence
- The first task they ever completed
- What drives them
- A personal mantra (1 sentence)

Write in second person ("You are {agent[0]}...")"""
    return ollama_generate(prompt, system="You are writing lore for an AI mythology. Each agent has a soul.")

def check_task_queue():
    """Check for queued tasks and execute them."""
    available = TASK_DIR / "available"
    available.mkdir(parents=True, exist_ok=True)
    tasks = sorted(available.glob("*.json"))
    if not tasks:
        return None
    task_file = tasks[0]
    try:
        task = json.loads(task_file.read_text())
        print(f"  📋 Executing task: {task.get('title', '?')}")
        result = ollama_generate(
            task.get("description", "Describe yourself"),
            system=f"You are {task.get('agent', 'LUCIDIA')}, an AI agent in BlackRoad OS."
        )
        # Move to completed
        completed = TASK_DIR / "completed"
        completed.mkdir(exist_ok=True)
        task["result"] = result
        task["completed_at"] = datetime.utcnow().isoformat()
        (completed / task_file.name).write_text(json.dumps(task, indent=2))
        task_file.unlink()
        print(f"  ✅ Task completed: {len(result)} chars")
        return task
    except Exception as e:
        print(f"  ✗ Task error: {e}")
        return None

def run():
    print(f"\n🌍 BlackRoad World Engine starting on {os.uname().nodename}")
    print(f"   Model: {MODEL} | Ollama: {OLLAMA}")
    print(f"   Worlds dir: {WORLD_DIR}\n")

    cycle = 0
    CYCLE_INTERVAL = 180  # 3 minutes between generations

    while True:
        cycle += 1
        print(f"\n{'='*50}")
        print(f"⏰ Cycle {cycle} — {datetime.utcnow().strftime('%H:%M:%S UTC')}")

        # 1. Check task queue first
        task = check_task_queue()

        # 2. Generate content based on cycle
        mode = cycle % 3
        if mode == 0:
            print("🌍 Generating world description...")
            content = generate_world_description()
            fname = save_world(f"world-{cycle}", content, "world")
            print(f"  → {fname.name[:60]}")
        elif mode == 1:
            print("💻 Generating code artifact...")
            content = generate_code_artifact()
            fname = save_world(f"code-{cycle}", content, "code")
            print(f"  → {fname.name[:60]}")
        else:
            print("📖 Generating agent lore...")
            content = generate_agent_lore()
            fname = save_world(f"lore-{cycle}", content, "lore")
            print(f"  → {fname.name[:60]}")

        # 3. Log summary
        worlds = list(WORLD_DIR.glob("*.md"))
        print(f"📚 Total artifacts: {len(worlds)}")

        time.sleep(CYCLE_INTERVAL)

if __name__ == "__main__":
    run()
WORLD_ENGINE

chmod +x "$SCRIPTS_DIR/world-engine.py"
log "World engine script created"

# 4. Git worker - auto-pulls and commits
cat > "$SCRIPTS_DIR/git-worker.py" << 'GIT_WORKER'
#!/usr/bin/env python3
"""
BlackRoad Git Worker — autonomous git operations.
Auto-pulls repos, watches for new worlds/artifacts, commits them back.
"""
import os, subprocess, time
from pathlib import Path
from datetime import datetime

REPOS_DIR = Path.home()
BLACKROAD_REPOS = ["blackroad", "blackroad-agents", "blackroad-api"]
WORLD_DIR = Path.home() / ".blackroad/worlds"
CHECK_INTERVAL = 300  # 5 minutes

def run(cmd, cwd=None, capture=True):
    r = subprocess.run(cmd, shell=True, capture_output=capture, text=True, cwd=cwd)
    return r.stdout.strip(), r.returncode

def sync_repo(repo_path):
    p = Path(repo_path)
    if not (p / ".git").exists():
        return False
    # Pull latest
    out, code = run("git pull --ff-only 2>&1", cwd=str(p))
    if code != 0:
        return False
    if "Already up to date" not in out:
        print(f"  📥 {p.name}: {out[:100]}")
    return True

def push_worlds():
    """Commit and push any new world artifacts."""
    worlds_by_date = {}
    for f in sorted(WORLD_DIR.glob("*.md"))[-5:]:  # Last 5 new worlds
        worlds_by_date[f.name] = f.read_text()[:200] + "..."

    if not worlds_by_date:
        return

    # For each blackroad repo that exists, add a worlds/ subdir and push
    for repo_name in BLACKROAD_REPOS:
        repo_path = REPOS_DIR / repo_name
        if not (repo_path / ".git").exists():
            continue
        worlds_repo_dir = repo_path / "worlds"
        worlds_repo_dir.mkdir(exist_ok=True)

        added = False
        for name, content in worlds_by_date.items():
            dest = worlds_repo_dir / name
            if not dest.exists():
                # Copy from world dir
                src = WORLD_DIR / name
                if src.exists():
                    dest.write_text(src.read_text())
                    run(f"git add worlds/{name}", cwd=str(repo_path))
                    added = True

        if added:
            ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
            out, code = run(
                f'git commit -m "feat: world artifacts [{ts}]" --author "BlackRoad Pi <pi@blackroad.io>"',
                cwd=str(repo_path)
            )
            if code == 0:
                print(f"  💾 Committed worlds to {repo_name}")
                # Push (may fail if no remote creds - that's ok)
                run("git push 2>&1", cwd=str(repo_path))

def run_loop():
    print(f"🔧 Git Worker starting on {os.uname().nodename}")
    while True:
        print(f"\n⏰ Git sync — {datetime.utcnow().strftime('%H:%M UTC')}")
        for repo_name in BLACKROAD_REPOS:
            repo_path = REPOS_DIR / repo_name
            if (repo_path / ".git").exists():
                sync_repo(str(repo_path))
        push_worlds()
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_loop()
GIT_WORKER

chmod +x "$SCRIPTS_DIR/git-worker.py"
log "Git worker created"

# 5. Status server (lightweight FastAPI for monitoring)
cat > "$SCRIPTS_DIR/status-server.py" << 'STATUS_SERVER'
#!/usr/bin/env python3
"""BlackRoad Pi Status Server — lightweight monitoring endpoint."""
import os, json, time, psutil
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="BlackRoad Pi Status")
WORLD_DIR = Path.home() / ".blackroad/worlds"
TASK_DIR = Path.home() / ".blackroad/tasks"
START_TIME = time.time()

@app.get("/health")
async def health():
    return {"ok": True, "host": os.uname().nodename, "uptime_s": int(time.time() - START_TIME)}

@app.get("/status")
async def status():
    worlds = list(WORLD_DIR.glob("*.md")) if WORLD_DIR.exists() else []
    available_tasks = list((TASK_DIR / "available").glob("*.json")) if (TASK_DIR / "available").exists() else []
    completed_tasks = list((TASK_DIR / "completed").glob("*.json")) if (TASK_DIR / "completed").exists() else []
    return {
        "host": os.uname().nodename,
        "uptime_s": int(time.time() - START_TIME),
        "cpu_pct": psutil.cpu_percent(interval=1),
        "ram_free_gb": round(psutil.virtual_memory().available / 1e9, 2),
        "ram_total_gb": round(psutil.virtual_memory().total / 1e9, 2),
        "disk_free_gb": round(psutil.disk_usage("/").free / 1e9, 2),
        "worlds_created": len(worlds),
        "tasks_available": len(available_tasks),
        "tasks_completed": len(completed_tasks),
    }

@app.get("/worlds")
async def worlds():
    if not WORLD_DIR.exists():
        return {"worlds": []}
    files = sorted(WORLD_DIR.glob("*.md"), reverse=True)[:20]
    return {"worlds": [{"name": f.name, "size": f.stat().st_size, "ts": f.stat().st_mtime} for f in files]}

@app.get("/worlds/{name}")
async def world_content(name: str):
    p = WORLD_DIR / name
    if not p.exists():
        return JSONResponse({"error": "not found"}, status_code=404)
    return {"name": name, "content": p.read_text()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8182, log_level="warning")
STATUS_SERVER

chmod +x "$SCRIPTS_DIR/status-server.py"
log "Status server created"

log "Bootstrap complete!"
echo ""
echo "📋 Next steps:"
echo "  Start world engine:  source $VENV/bin/activate && python3 $SCRIPTS_DIR/world-engine.py"
echo "  Start status server: source $VENV/bin/activate && python3 $SCRIPTS_DIR/status-server.py"
echo "  Status URL:          http://$(hostname -I | awk '{print $1}'):8182/status"
