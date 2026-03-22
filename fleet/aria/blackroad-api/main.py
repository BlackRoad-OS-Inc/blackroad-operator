from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socket
import os
import subprocess
from datetime import datetime
from typing import Optional

app = FastAPI(
    title=f"BlackRoad Agent API - {socket.gethostname()}",
    description="Local API for BlackRoad OS agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecRequest(BaseModel):
    cmd: str
    timeout: Optional[int] = 30

@app.get("/")
def root():
    return {
        "agent": socket.gethostname(),
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "api_version": "1.0.0"
    }

@app.get("/health")
def health():
    try:
        load = open("/proc/loadavg").read().split()[0]
        mem_info = subprocess.check_output("free -m | awk '/Mem:/ {print $4}'", shell=True).decode().strip()
        disk = subprocess.check_output("df -h / | awk 'NR==2 {print $4}'", shell=True).decode().strip()
        temp = "N/A"
        try:
            temp = str(int(open("/sys/class/thermal/thermal_zone0/temp").read()) // 1000) + "C"
        except:
            pass
        return {
            "agent": socket.gethostname(),
            "load": load,
            "memory_free_mb": int(mem_info) if mem_info.isdigit() else 0,
            "disk_free": disk,
            "temperature": temp,
            "status": "healthy"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/info")
def info():
    return {
        "hostname": socket.gethostname(),
        "python": subprocess.check_output("python3 --version", shell=True).decode().strip(),
        "platform": os.uname().sysname,
        "arch": os.uname().machine,
    }

@app.post("/exec")
def execute(req: ExecRequest):
    try:
        result = subprocess.check_output(req.cmd, shell=True, timeout=req.timeout, stderr=subprocess.STDOUT).decode()
        return {"success": True, "output": result}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "timeout"}
    except subprocess.CalledProcessError as e:
        return {"success": False, "error": e.output.decode() if e.output else str(e)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/services")
def services():
    svcs = ["nginx", "ollama", "tailscaled", "blackroad-api"]
    result = {}
    for svc in svcs:
        try:
            status = subprocess.call(f"systemctl is-active {svc}", shell=True, stdout=subprocess.DEVNULL)
            result[svc] = "running" if status == 0 else "stopped"
        except:
            result[svc] = "unknown"
    return result
