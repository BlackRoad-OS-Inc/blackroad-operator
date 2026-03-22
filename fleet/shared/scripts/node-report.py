#!/usr/bin/env python3
"""BlackRoad Node Report — generates JSON system info for fleet-pull."""
import json, subprocess, os, datetime

def cmd(c):
    try:
        return subprocess.check_output(c, shell=True, stderr=subprocess.DEVNULL).decode().strip()
    except:
        return ""

def read_file(f):
    try:
        with open(f) as fh:
            return fh.read().strip()
    except:
        return ""

# Temperature
temp_raw = read_file("/sys/class/thermal/thermal_zone0/temp")
temp = float(temp_raw) / 1000 if temp_raw else 0

# Memory
mem_line = cmd("free -m | awk '/Mem:/{print $2,$3,$7}'")
mem_parts = mem_line.split() if mem_line else ["0", "0", "0"]

# Load
load_raw = read_file("/proc/loadavg")
load_parts = load_raw.split()[:3] if load_raw else ["0", "0", "0"]

# Uptime
uptime_raw = read_file("/proc/uptime").split()[0] if read_file("/proc/uptime") else "0"

# Disk
disk = cmd("df -h / | awk 'NR==2{print $3\"/\"$2\" (\"$5\")\"}'")

# Ollama models
ollama = []
try:
    import urllib.request
    r = urllib.request.urlopen("http://localhost:11434/api/tags", timeout=2)
    d = json.loads(r.read())
    ollama = [m["name"] for m in d.get("models", [])]
except:
    pass

# Pi-specific
throttle = cmd("vcgencmd get_throttled 2>/dev/null")
throttle = throttle.split("=")[-1] if throttle else "N/A"
voltage = cmd("vcgencmd measure_volts core 2>/dev/null")
voltage = voltage.split("=")[-1] if voltage else "N/A"

# Services
svc_output = cmd("systemctl list-units --type=service --state=running --no-pager --no-legend")
svc_count = len([l for l in svc_output.split("\n") if l.strip()]) if svc_output else 0

info = {
    "hostname": os.uname().nodename,
    "ts": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
    "uptime_seconds": int(float(uptime_raw)),
    "kernel": os.uname().release,
    "temp_c": round(temp, 1),
    "memory_mb": {
        "total": int(mem_parts[0]) if len(mem_parts) > 0 else 0,
        "used": int(mem_parts[1]) if len(mem_parts) > 1 else 0,
        "free": int(mem_parts[2]) if len(mem_parts) > 2 else 0,
    },
    "disk": disk,
    "load": [float(x) for x in load_parts],
    "ollama_models": ollama,
    "throttle": throttle,
    "voltage": voltage,
    "services_running": svc_count,
}
print(json.dumps(info, indent=2))
