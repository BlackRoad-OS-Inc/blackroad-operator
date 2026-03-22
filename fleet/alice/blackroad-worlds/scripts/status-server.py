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
