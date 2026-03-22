#!/usr/bin/env python3
"""Fleet Heartbeat — Real-time monitoring of the BlackRoad mesh"""
import time, json, subprocess, sqlite3, os, asyncio
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

app = FastAPI(title="BlackRoad Fleet Heartbeat")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

DB_PATH = os.path.expanduser("~/.blackroad/fleet-heartbeat.db")
NODES = [
    ("alice",   "pi",        "192.168.4.49"),
    ("cecilia", "blackroad", "192.168.4.96"),
    ("octavia", "pi",        "192.168.4.100"),
    ("aria",    "blackroad", "192.168.4.98"),
    ("lucidia", "octavia",   "192.168.4.38"),
]

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.execute("""CREATE TABLE IF NOT EXISTS heartbeats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node TEXT, timestamp TEXT, online INTEGER,
        cpu_temp REAL, cpu_pct REAL, mem_pct REAL, disk_pct REAL,
        uptime TEXT, ollama_models INTEGER, docker_containers INTEGER,
        load_avg TEXT
    )""")
    db.commit()
    db.close()

init_db()

def ssh_cmd(user, ip, cmd, timeout=5):
    try:
        r = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=3", "-o", "StrictHostKeyChecking=no",
             "-o", "BatchMode=yes", f"{user}@{ip}", cmd],
            capture_output=True, text=True, timeout=timeout
        )
        return r.stdout.strip(), r.returncode == 0
    except:
        return "", False

def probe_node(name, user, ip):
    stats = {"node": name, "ip": ip, "online": False, "timestamp": datetime.now().isoformat()}

    # Quick connectivity check
    out, ok = ssh_cmd(user, ip, "echo ok")
    if not ok:
        return stats

    stats["online"] = True

    # Gather all stats in one SSH call
    script = """
echo "TEMP:$(cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0)"
echo "CPU:$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' 2>/dev/null || echo 0)"
echo "MEM:$(free | awk '/Mem:/{printf "%.1f", $3/$2*100}')"
echo "DISK:$(df / | awk 'NR==2{print $5}' | tr -d '%')"
echo "UP:$(uptime -p 2>/dev/null || uptime | sed 's/.*up /up /' | cut -d, -f1-2)"
echo "LOAD:$(cat /proc/loadavg | cut -d' ' -f1-3)"
echo "OLLAMA:$(curl -s http://localhost:11434/api/tags 2>/dev/null | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get("models",[])))' 2>/dev/null || echo 0)"
echo "DOCKER:$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')"
"""
    out, ok = ssh_cmd(user, ip, script, timeout=10)
    if not ok:
        return stats

    for line in out.split("\n"):
        if line.startswith("TEMP:"):
            try: stats["cpu_temp"] = round(int(line.split(":")[1]) / 1000, 1)
            except: pass
        elif line.startswith("CPU:"):
            try: stats["cpu_pct"] = float(line.split(":")[1])
            except: pass
        elif line.startswith("MEM:"):
            try: stats["mem_pct"] = float(line.split(":")[1])
            except: pass
        elif line.startswith("DISK:"):
            try: stats["disk_pct"] = float(line.split(":")[1])
            except: pass
        elif line.startswith("UP:"):
            stats["uptime"] = line.split(":", 1)[1].strip()
        elif line.startswith("LOAD:"):
            stats["load_avg"] = line.split(":", 1)[1].strip()
        elif line.startswith("OLLAMA:"):
            try: stats["ollama_models"] = int(line.split(":")[1])
            except: pass
        elif line.startswith("DOCKER:"):
            try: stats["docker_containers"] = int(line.split(":")[1])
            except: pass

    return stats

def store_heartbeat(stats):
    db = sqlite3.connect(DB_PATH)
    db.execute(
        "INSERT INTO heartbeats (node, timestamp, online, cpu_temp, cpu_pct, mem_pct, disk_pct, uptime, ollama_models, docker_containers, load_avg) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (stats.get("node"), stats.get("timestamp"), 1 if stats.get("online") else 0,
         stats.get("cpu_temp"), stats.get("cpu_pct"), stats.get("mem_pct"), stats.get("disk_pct"),
         stats.get("uptime"), stats.get("ollama_models"), stats.get("docker_containers"),
         stats.get("load_avg"))
    )
    db.commit()
    db.close()

@app.get("/health")
def health():
    return {"service": "fleet-heartbeat", "nodes": len(NODES)}

@app.get("/fleet")
async def fleet():
    t0 = time.time()
    # Run probes concurrently via thread pool
    loop = asyncio.get_event_loop()
    tasks = [loop.run_in_executor(None, probe_node, name, user, ip) for name, user, ip in NODES]
    results = await asyncio.gather(*tasks)

    for r in results:
        store_heartbeat(r)

    online = sum(1 for r in results if r["online"])
    return {
        "fleet": results,
        "summary": {"total": len(NODES), "online": online, "offline": len(NODES) - online},
        "ms": int((time.time() - t0) * 1000)
    }

@app.get("/fleet/history")
def fleet_history(node: str = None, limit: int = 50):
    db = sqlite3.connect(DB_PATH)
    if node:
        rows = db.execute(
            "SELECT * FROM heartbeats WHERE node=? ORDER BY id DESC LIMIT ?", (node, limit)
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT * FROM heartbeats ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    db.close()
    cols = ["id", "node", "timestamp", "online", "cpu_temp", "cpu_pct", "mem_pct", "disk_pct", "uptime", "ollama_models", "docker_containers", "load_avg"]
    return [dict(zip(cols, r)) for r in rows]

@app.get("/", response_class=HTMLResponse)
def index():
    return """<!DOCTYPE html><html><head><title>Fleet Heartbeat</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000;color:#fff;font-family:'Space Grotesk',sans-serif;padding:0}
.bar{height:3px;background:linear-gradient(90deg,#FF6B2B,#FF2255,#CC00AA,#8844FF,#4488FF,#00D4FF)}
header{padding:16px 24px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between}
header h1{font-size:18px}
.summary{font-family:'JetBrains Mono';font-size:12px;opacity:.5}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;padding:24px}
.node{border:1px solid #1a1a1a;border-radius:8px;padding:16px}
.node.online{border-color:#333}
.node.offline{border-color:#331111;opacity:.5}
.node-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.node-name{font-weight:700;font-size:16px}
.status{font-family:'JetBrains Mono';font-size:11px;padding:2px 8px;border-radius:4px}
.status.on{border:1px solid #00ff88;color:#00ff88}
.status.off{border:1px solid #ff4466;color:#ff4466}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat{font-family:'JetBrains Mono';font-size:12px}
.stat .label{opacity:.4;font-size:10px}
.stat .value{margin-top:2px}
.refresh{font-family:'JetBrains Mono';font-size:11px;opacity:.3;text-align:center;padding:16px}
.loading{text-align:center;padding:60px;opacity:.4;font-family:'JetBrains Mono'}
</style></head>
<body>
<div class="bar"></div>
<header>
    <h1>Fleet Heartbeat</h1>
    <div class="summary" id="summary">loading...</div>
</header>
<div id="content"><div class="loading">probing nodes...</div></div>
<div class="refresh" id="refresh"></div>
<script>
async function poll(){
    try{
        const r=await fetch('/fleet');const d=await r.json();
        document.getElementById('summary').textContent=
            d.summary.online+'/'+d.summary.total+' online · '+d.ms+'ms';
        let html='<div class="grid">';
        for(const n of d.fleet){
            html+=`<div class="node ${n.online?'online':'offline'}">
                <div class="node-header">
                    <span class="node-name">${n.node}</span>
                    <span class="status ${n.online?'on':'off'}">${n.online?'online':'offline'}</span>
                </div>
                <div class="stats">
                    <div class="stat"><div class="label">IP</div><div class="value">${n.ip}</div></div>
                    <div class="stat"><div class="label">Temp</div><div class="value">${n.cpu_temp?n.cpu_temp+'°C':'—'}</div></div>
                    <div class="stat"><div class="label">CPU</div><div class="value">${n.cpu_pct?n.cpu_pct+'%':'—'}</div></div>
                    <div class="stat"><div class="label">Memory</div><div class="value">${n.mem_pct?n.mem_pct+'%':'—'}</div></div>
                    <div class="stat"><div class="label">Disk</div><div class="value">${n.disk_pct?n.disk_pct+'%':'—'}</div></div>
                    <div class="stat"><div class="label">Load</div><div class="value">${n.load_avg||'—'}</div></div>
                    <div class="stat"><div class="label">Ollama</div><div class="value">${n.ollama_models!=null?n.ollama_models+' models':'—'}</div></div>
                    <div class="stat"><div class="label">Docker</div><div class="value">${n.docker_containers!=null?n.docker_containers+' containers':'—'}</div></div>
                    <div class="stat" style="grid-column:span 2"><div class="label">Uptime</div><div class="value">${n.uptime||'—'}</div></div>
                </div>
            </div>`;
        }
        html+='</div>';
        document.getElementById('content').innerHTML=html;
        document.getElementById('refresh').textContent='last updated: '+new Date().toLocaleTimeString()+' · auto-refresh 30s';
    }catch(e){
        document.getElementById('content').innerHTML='<div class="loading">error: '+e.message+'</div>';
    }
}
poll();
setInterval(poll,30000);
</script>
</body></html>"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8500)
