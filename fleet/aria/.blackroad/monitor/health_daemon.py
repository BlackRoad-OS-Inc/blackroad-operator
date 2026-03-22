#!/usr/bin/env python3
"""
BlackRoad Health Monitor Daemon
Continuous health monitoring and alerting
"""

import os
import json
import time
import socket
import subprocess
from datetime import datetime
from typing import Dict, List

MONITOR_DIR = os.path.expanduser("~/.blackroad/monitor")
HEALTH_LOG = os.path.join(MONITOR_DIR, "health.jsonl")
ALERTS_LOG = os.path.join(MONITOR_DIR, "alerts.jsonl")
HOSTNAME = socket.gethostname()

# Thresholds
THRESHOLDS = {
    "cpu_load": 2.0,      # Load average
    "memory_pct": 90,     # Memory usage %
    "disk_pct": 90,       # Disk usage %
    "temp_c": 80,         # Temperature C
}

class HealthMonitor:
    def __init__(self):
        self.hostname = HOSTNAME
        self.last_alert = {}  # metric -> timestamp (cooldown)

    def get_cpu_load(self) -> float:
        """Get CPU load average"""
        try:
            with open("/proc/loadavg", "r") as f:
                return float(f.read().split()[0])
        except:
            return 0.0

    def get_memory(self) -> Dict:
        """Get memory stats"""
        try:
            result = subprocess.check_output("free -m", shell=True).decode()
            lines = result.strip().split("\n")
            mem_line = lines[1].split()
            total = int(mem_line[1])
            used = int(mem_line[2])
            free = int(mem_line[3])
            pct = (used / total) * 100 if total > 0 else 0
            return {"total_mb": total, "used_mb": used, "free_mb": free, "percent": round(pct, 1)}
        except:
            return {"total_mb": 0, "used_mb": 0, "free_mb": 0, "percent": 0}

    def get_disk(self) -> Dict:
        """Get disk stats"""
        try:
            result = subprocess.check_output("df -h /", shell=True).decode()
            lines = result.strip().split("\n")
            disk_line = lines[1].split()
            total = disk_line[1]
            used = disk_line[2]
            free = disk_line[3]
            pct = int(disk_line[4].replace("%", ""))
            return {"total": total, "used": used, "free": free, "percent": pct}
        except:
            return {"total": "0", "used": "0", "free": "0", "percent": 0}

    def get_temperature(self) -> float:
        """Get CPU temperature"""
        try:
            with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
                return int(f.read().strip()) / 1000
        except:
            return 0.0

    def get_services(self) -> Dict[str, str]:
        """Check service status"""
        services = {
            "fastapi": 8000,
            "webhooks": 9000,
            "node": 3000,
            "ollama": 11434,
            "mesh": 8765
        }
        status = {}
        for name, port in services.items():
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(("127.0.0.1", port))
                status[name] = "running" if result == 0 else "stopped"
                sock.close()
            except:
                status[name] = "unknown"
        return status

    def collect_health(self) -> Dict:
        """Collect all health metrics"""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "hostname": self.hostname,
            "cpu_load": self.get_cpu_load(),
            "memory": self.get_memory(),
            "disk": self.get_disk(),
            "temperature": self.get_temperature(),
            "services": self.get_services()
        }

    def check_alerts(self, health: Dict) -> List[Dict]:
        """Check for alert conditions"""
        alerts = []
        now = time.time()

        # CPU load
        if health["cpu_load"] > THRESHOLDS["cpu_load"]:
            if self.should_alert("cpu_load", now):
                alerts.append({
                    "metric": "cpu_load",
                    "value": health["cpu_load"],
                    "threshold": THRESHOLDS["cpu_load"],
                    "severity": "warning"
                })

        # Memory
        if health["memory"]["percent"] > THRESHOLDS["memory_pct"]:
            if self.should_alert("memory", now):
                alerts.append({
                    "metric": "memory",
                    "value": health["memory"]["percent"],
                    "threshold": THRESHOLDS["memory_pct"],
                    "severity": "warning"
                })

        # Disk
        if health["disk"]["percent"] > THRESHOLDS["disk_pct"]:
            if self.should_alert("disk", now):
                alerts.append({
                    "metric": "disk",
                    "value": health["disk"]["percent"],
                    "threshold": THRESHOLDS["disk_pct"],
                    "severity": "critical"
                })

        # Temperature
        if health["temperature"] > THRESHOLDS["temp_c"]:
            if self.should_alert("temperature", now):
                alerts.append({
                    "metric": "temperature",
                    "value": health["temperature"],
                    "threshold": THRESHOLDS["temp_c"],
                    "severity": "critical"
                })

        # Service down
        for svc, status in health["services"].items():
            if status == "stopped":
                if self.should_alert(f"svc_{svc}", now):
                    alerts.append({
                        "metric": f"service_{svc}",
                        "value": "stopped",
                        "threshold": "running",
                        "severity": "warning"
                    })

        return alerts

    def should_alert(self, metric: str, now: float, cooldown: int = 300) -> bool:
        """Check if we should alert (with cooldown)"""
        last = self.last_alert.get(metric, 0)
        if now - last > cooldown:
            self.last_alert[metric] = now
            return True
        return False

    def log_health(self, health: Dict):
        """Log health data"""
        with open(HEALTH_LOG, "a") as f:
            f.write(json.dumps(health) + "\n")

    def log_alerts(self, alerts: List[Dict]):
        """Log alerts"""
        for alert in alerts:
            entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "hostname": self.hostname,
                **alert
            }
            with open(ALERTS_LOG, "a") as f:
                f.write(json.dumps(entry) + "\n")
            print(f"[ALERT] {alert['severity'].upper()}: {alert['metric']} = {alert['value']}")

    def daemon_loop(self, interval: int = 30):
        """Run as daemon"""
        print(f"[*] Health Monitor starting on {self.hostname}...")
        print(f"[*] Checking every {interval}s")

        while True:
            try:
                health = self.collect_health()
                self.log_health(health)

                alerts = self.check_alerts(health)
                if alerts:
                    self.log_alerts(alerts)

                # Quick status
                mem = health["memory"]["percent"]
                load = health["cpu_load"]
                svcs = sum(1 for s in health["services"].values() if s == "running")
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Load:{load:.1f} Mem:{mem:.0f}% Services:{svcs}/5")

            except Exception as e:
                print(f"[!] Error: {e}")

            time.sleep(interval)

# CLI
if __name__ == "__main__":
    import sys
    monitor = HealthMonitor()

    if len(sys.argv) < 2 or sys.argv[1] == "daemon":
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        monitor.daemon_loop(interval)

    elif sys.argv[1] == "check":
        health = monitor.collect_health()
        print(json.dumps(health, indent=2))

    elif sys.argv[1] == "alerts":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        try:
            with open(ALERTS_LOG, "r") as f:
                lines = f.readlines()[-n:]
                for line in lines:
                    a = json.loads(line)
                    print(f"[{a['severity']}] {a['metric']}: {a['value']} @ {a['timestamp']}")
        except FileNotFoundError:
            print("No alerts")

    else:
        print("health_daemon.py [daemon|check|alerts] [args]")
