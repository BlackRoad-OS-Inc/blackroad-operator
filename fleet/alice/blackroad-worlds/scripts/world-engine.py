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
