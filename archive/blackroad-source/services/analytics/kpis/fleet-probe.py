#!/usr/bin/env python3
"""Remote fleet probe — runs on each Pi via SSH"""
import json, subprocess, os

def run(cmd):
    try:
        return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=10).decode().strip()
    except:
        return ""

def read_file(path):
    try:
        with open(path) as f:
            return f.read().strip()
    except:
        return ""

uptime_raw = read_file("/proc/uptime")
uptime = uptime_raw.split()[0].split(".")[0] if uptime_raw else "0"
loadavg = read_file("/proc/loadavg").split()
temp = read_file("/sys/class/thermal/thermal_zone0/temp") or "0"

mem = run("free -m").split("\n")
mem_parts = mem[1].split() if len(mem) > 1 else ["", 0, 0]

df_out = run("df / -BG").split("\n")
disk_parts = df_out[1].split() if len(df_out) > 1 else ["", 0, 0, 0, 0]

docker_c = run("docker ps -q 2>/dev/null | wc -l").strip() or "0"
docker_i = run("docker images -q 2>/dev/null | wc -l").strip() or "0"
failed = run("systemctl --failed --no-legend 2>/dev/null | wc -l").strip() or "0"
throttle = run("vcgencmd get_throttled 2>/dev/null").replace("throttled=", "") or "unknown"
governor = read_file("/sys/devices/system/cpu/cpu0/cpufreq/scaling_governor") or "unknown"

ollama = 0
try:
    import urllib.request
    r = urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3)
    ollama = len(json.loads(r.read()).get("models", []))
except:
    pass

d = {
    "hostname": os.uname().nodename,
    "uptime_seconds": int(uptime),
    "load_1m": float(loadavg[0]) if loadavg else 0,
    "load_5m": float(loadavg[1]) if len(loadavg) > 1 else 0,
    "cpu_temp": int(temp),
    "mem_total_mb": int(mem_parts[1]) if len(mem_parts) > 1 else 0,
    "mem_used_mb": int(mem_parts[2]) if len(mem_parts) > 2 else 0,
    "disk_total_gb": int(str(disk_parts[1]).rstrip("G")) if len(disk_parts) > 1 else 0,
    "disk_used_gb": int(str(disk_parts[2]).rstrip("G")) if len(disk_parts) > 2 else 0,
    "disk_pct": int(str(disk_parts[4]).rstrip("%")) if len(disk_parts) > 4 else 0,
    "docker_containers": int(docker_c),
    "docker_images": int(docker_i),
    "systemd_failed": int(failed),
    "ollama_models": ollama,
    "throttle_hex": throttle,
    "governor": governor,
}
print(json.dumps(d))
