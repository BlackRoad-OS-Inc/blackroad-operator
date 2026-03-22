#!/usr/bin/env python3
"""
BlackRoad Hardware — IoT Fleet Manager
Manage Raspberry Pi fleet: deploy, monitor, SSH, update.
"""
import os, sys, json, subprocess, sqlite3
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

DB = os.path.expanduser("~/.blackroad/fleet.db")
FLEET = [
    {"name": "blackroad-pi",  "ip": "192.168.4.64", "user": "pi",    "role": "gateway",   "agents": 7500},
    {"name": "aria64",        "ip": "192.168.4.38", "user": "pi",    "role": "primary",  "agents": 22500},
    {"name": "alice",         "ip": "192.168.4.49", "user": "alice", "role": "secondary","agents": 0},
    {"name": "lucidia-alt",   "ip": "192.168.4.99", "user": "lucidia","role": "backup", "agents": 0},
]

def init_db():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    c = sqlite3.connect(DB)
    c.execute("""CREATE TABLE IF NOT EXISTS nodes (
        name TEXT PRIMARY KEY, ip TEXT, user TEXT, role TEXT, agents INTEGER,
        last_seen TEXT, status TEXT DEFAULT 'unknown', os_version TEXT, uptime TEXT
    )""")
    c.execute("""CREATE TABLE IF NOT EXISTS deployments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node TEXT, service TEXT, version TEXT, deployed_at TEXT, status TEXT
    )""")
    for node in FLEET:
        c.execute("INSERT OR IGNORE INTO nodes (name,ip,user,role,agents) VALUES (?,?,?,?,?)",
                  (node["name"], node["ip"], node["user"], node["role"], node["agents"]))
    c.commit()
    return c

def ping(node: dict) -> bool:
    r = subprocess.run(["ping", "-c", "1", "-W", "2", node["ip"]], capture_output=True)
    return r.returncode == 0

def ssh_run(node: dict, cmd: str) -> str:
    try:
        r = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", "-o", "StrictHostKeyChecking=no",
             f"{node['user']}@{node['ip']}", cmd],
            capture_output=True, text=True, timeout=30
        )
        return r.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"

def check_node(node: dict) -> dict:
    alive = ping(node)
    if not alive:
        return {**node, "status": "offline", "uptime": "N/A", "os_version": "N/A"}
    uptime = ssh_run(node, "uptime -p")
    os_ver = ssh_run(node, "cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"'" )
    temp = ssh_run(node, "vcgencmd measure_temp 2>/dev/null || echo N/A")
    load = ssh_run(node, "cat /proc/loadavg | cut -d\ -f1,2,3")
    return {**node, "status": "online", "uptime": uptime, "os_version": os_ver, "temp": temp, "load": load}

def fleet_status():
    print("
🍓 BlackRoad Pi Fleet Status
" + "="*60)
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(check_node, FLEET))
    db = init_db()
    for r in results:
        icon = "🟢" if r["status"] == "online" else "🔴"
        print(f"{icon} {r['name']:15} {r['ip']:16} {r['role']:10} agents={r['agents']}")
        if r["status"] == "online":
            print(f"   uptime={r.get('uptime','?')}  load={r.get('load','?')}  temp={r.get('temp','?')} ")
        db.execute("UPDATE nodes SET status=?, last_seen=?, uptime=? WHERE name=?",
                   (r["status"], datetime.utcnow().isoformat(), r.get("uptime",""), r["name"]))
    db.commit()

def deploy_service(service: str, version: str):
    print(f"
�� Deploying {service}@{version} to fleet...")
    db = init_db()
    for node in FLEET:
        if not ping(node):
            print(f"  ⏭ {node['name']} offline, skipping")
            continue
        cmd = f"cd /opt/blackroad && git pull && systemctl restart {service} 2>/dev/null || true"
        out = ssh_run(node, cmd)
        status = "success" if "error" not in out.lower() else "failed"
        db.execute("INSERT INTO deployments (node,service,version,deployed_at,status) VALUES (?,?,?,?,?)",
                   (node["name"], service, version, datetime.utcnow().isoformat(), status))
        icon = "✓" if status == "success" else "✗"
        print(f"  {icon} {node['name']:15} — {status}")
    db.commit()

def update_all():
    print("
📦 Running apt update on fleet...")
    for node in FLEET:
        if not ping(node):
            continue
        out = ssh_run(node, "sudo apt-get update -qq && sudo apt-get upgrade -y -qq 2>&1 | tail -3")
        print(f"  {node['name']:15} → {out[:80]}")

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="BlackRoad Pi Fleet Manager")
    ap.add_argument("command", choices=["status", "deploy", "update", "ssh"])
    ap.add_argument("--service", default="blackroad-gateway")
    ap.add_argument("--version", default="latest")
    ap.add_argument("--node", default="blackroad-pi")
    ap.add_argument("--cmd", default="uptime")
    args = ap.parse_args()

    if args.command == "status":
        fleet_status()
    elif args.command == "deploy":
        deploy_service(args.service, args.version)
    elif args.command == "update":
        update_all()
    elif args.command == "ssh":
        node = next((n for n in FLEET if n["name"] == args.node), None)
        if node:
            print(ssh_run(node, args.cmd))
