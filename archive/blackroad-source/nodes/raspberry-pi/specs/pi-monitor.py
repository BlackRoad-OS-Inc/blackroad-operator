#!/usr/bin/env python3
"""
BlackRoad Hardware — Pi System Monitor
Publishes CPU, RAM, temperature, and disk metrics via MQTT.
Designed to run as a systemd service on each Raspberry Pi node.
"""
from __future__ import annotations
import time, json, os, subprocess, hashlib
from pathlib import Path
try:
    import paho.mqtt.client as mqtt
    HAS_MQTT = True
except ImportError:
    HAS_MQTT = False

HOSTNAME = os.uname().nodename
MQTT_HOST = os.getenv("MQTT_HOST", "192.168.4.64")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC_BASE = f"blackroad/nodes/{HOSTNAME}"
INTERVAL = int(os.getenv("MONITOR_INTERVAL", "10"))


def _read_file(path: str, default: str = "0") -> str:
    try:
        return Path(path).read_text().strip()
    except FileNotFoundError:
        return default


def cpu_percent() -> float:
    """Read CPU usage % from /proc/stat."""
    line1 = _read_file("/proc/stat").split("\n")[0].split()
    times1 = [int(x) for x in line1[1:]]
    time.sleep(0.1)
    line2 = _read_file("/proc/stat").split("\n")[0].split()
    times2 = [int(x) for x in line2[1:]]
    idle1, idle2 = times1[3], times2[3]
    total1, total2 = sum(times1), sum(times2)
    delta_total = total2 - total1
    delta_idle = idle2 - idle1
    return round((1 - delta_idle / delta_total) * 100, 1) if delta_total > 0 else 0.0


def ram_info() -> dict:
    """Read memory info from /proc/meminfo."""
    info = {}
    for line in _read_file("/proc/meminfo").split("\n"):
        parts = line.split()
        if len(parts) >= 2:
            info[parts[0].rstrip(":")] = int(parts[1])
    total_kb = info.get("MemTotal", 0)
    avail_kb = info.get("MemAvailable", 0)
    used_kb = total_kb - avail_kb
    return {
        "total_mb": round(total_kb / 1024, 1),
        "used_mb": round(used_kb / 1024, 1),
        "available_mb": round(avail_kb / 1024, 1),
        "percent": round(used_kb / total_kb * 100, 1) if total_kb > 0 else 0,
    }


def cpu_temp() -> float:
    """Read CPU temperature (Raspberry Pi specific)."""
    raw = _read_file("/sys/class/thermal/thermal_zone0/temp", "0")
    return round(int(raw) / 1000, 1)


def disk_info(path: str = "/") -> dict:
    stat = os.statvfs(path)
    total = stat.f_blocks * stat.f_frsize
    free = stat.f_bfree * stat.f_frsize
    used = total - free
    return {
        "total_gb": round(total / 1e9, 2),
        "used_gb": round(used / 1e9, 2),
        "free_gb": round(free / 1e9, 2),
        "percent": round(used / total * 100, 1) if total > 0 else 0,
    }


def collect_metrics() -> dict:
    return {
        "hostname": HOSTNAME,
        "timestamp": time.time(),
        "cpu_percent": cpu_percent(),
        "ram": ram_info(),
        "cpu_temp_c": cpu_temp(),
        "disk": disk_info(),
    }


def publish_metrics(client: "mqtt.Client", metrics: dict) -> None:
    for key, value in metrics.items():
        if isinstance(value, dict):
            for subkey, subval in value.items():
                client.publish(f"{MQTT_TOPIC_BASE}/{key}/{subkey}", json.dumps(subval))
        else:
            client.publish(f"{MQTT_TOPIC_BASE}/{key}", json.dumps(value))
    # Also publish full snapshot
    client.publish(f"{MQTT_TOPIC_BASE}/snapshot", json.dumps(metrics))
    print(f"[{HOSTNAME}] CPU={metrics['cpu_percent']}%  RAM={metrics['ram']['percent']}%  Temp={metrics['cpu_temp_c']}°C")


def run() -> None:
    if not HAS_MQTT:
        print("paho-mqtt not installed. pip install paho-mqtt")
        while True:
            m = collect_metrics()
            print(json.dumps(m, indent=2))
            time.sleep(INTERVAL)
        return

    client = mqtt.Client(client_id=f"blackroad-monitor-{HOSTNAME}")
    client.on_connect = lambda c, u, f, rc: print(f"MQTT connected rc={rc}")
    client.connect(MQTT_HOST, MQTT_PORT)
    client.loop_start()
    print(f"Pi Monitor starting — {HOSTNAME} → {MQTT_HOST}:{MQTT_PORT} every {INTERVAL}s")
    try:
        while True:
            metrics = collect_metrics()
            publish_metrics(client, metrics)
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        pass
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    run()
