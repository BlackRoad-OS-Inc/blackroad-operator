#!/usr/bin/env python3
"""Deep service probe — runs on each Pi via SSH"""
import json, subprocess, os

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=10).decode().strip()
    except:
        return ""

# Ollama
ollama = {"count": 0, "size_gb": 0, "models": []}
try:
    import urllib.request
    r = urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3)
    data = json.loads(r.read())
    models = data.get("models", [])
    ollama["count"] = len(models)
    ollama["size_gb"] = round(sum(m.get("size", 0) for m in models) / 1e9, 1)
    ollama["models"] = [m.get("name", "") for m in models]
except:
    pass

# Docker
docker = {"running": 0, "images": 0, "containers_total": 0, "names": []}
docker["running"] = int(run("docker ps -q 2>/dev/null | wc -l").strip() or "0")
docker["images"] = int(run("docker images -q 2>/dev/null | wc -l").strip() or "0")
docker["containers_total"] = int(run("docker ps -aq 2>/dev/null | wc -l").strip() or "0")
names = run("docker ps --format '{{.Names}}' 2>/dev/null")
docker["names"] = names.split("\n") if names else []

# PostgreSQL
postgres = {"databases": 0}
pg_count = run("sudo -u postgres psql -tc 'SELECT count(*) FROM pg_database' 2>/dev/null").strip()
if pg_count and pg_count.isdigit():
    postgres["databases"] = int(pg_count)

# Nginx
nginx = {"sites": 0, "active": False}
nginx["sites"] = int(run("ls /etc/nginx/sites-enabled/ 2>/dev/null | wc -l").strip() or "0")
nginx["active"] = run("systemctl is-active nginx 2>/dev/null") == "active"

# Systemd
systemd = {"services": 0, "timers": 0, "failed": 0}
systemd["services"] = int(run("systemctl list-units --type=service --no-legend 2>/dev/null | wc -l").strip() or "0")
systemd["timers"] = int(run("systemctl list-timers --no-legend 2>/dev/null | wc -l").strip() or "0")
systemd["failed"] = int(run("systemctl --failed --no-legend 2>/dev/null | wc -l").strip() or "0")

# Processes & connections
processes = int(run("ps aux 2>/dev/null | wc -l").strip() or "0")
connections = int(run("ss -tunp 2>/dev/null | wc -l").strip() or "0")

# Swap
swap = {"used_mb": 0, "total_mb": 0}
swap_line = run("free -m | grep Swap")
if swap_line:
    parts = swap_line.split()
    if len(parts) >= 3:
        swap["total_mb"] = int(parts[1])
        swap["used_mb"] = int(parts[2])

# Cloudflared
cloudflared = run("systemctl is-active cloudflared 2>/dev/null") == "active"

# Tailscale peers
tailscale_peers = int(run("tailscale status 2>/dev/null | wc -l").strip() or "0")

# Hailo
hailo = os.path.exists("/dev/hailo0")

# Crons (all users)
cron_root = int(run("crontab -l 2>/dev/null | grep -cv '^#\\|^$'") or "0")
cron_users = 0
for u in run("ls /home/ 2>/dev/null").split():
    c = run(f"sudo crontab -u {u} -l 2>/dev/null | grep -cv '^#\\|^$'")
    cron_users += int(c) if c and c.isdigit() else 0

d = {
    "ollama": ollama,
    "docker": docker,
    "postgres": postgres,
    "nginx": nginx,
    "systemd": systemd,
    "processes": processes,
    "connections": connections,
    "swap": swap,
    "cloudflared": cloudflared,
    "tailscale_peers": tailscale_peers,
    "hailo": hailo,
    "crons": {"root": cron_root, "users": cron_users, "total": cron_root + cron_users},
}
print(json.dumps(d))
