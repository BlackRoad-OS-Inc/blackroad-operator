#!/bin/bash
# BlackRoad Mesh Network - Real-time WebSocket + Task Queue + Monitoring
# The nervous system of the BlackRoad Internet

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Mesh Network - $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

mkdir -p ~/.blackroad/{mesh,tasks,monitor,discovery}

echo -e "${AMBER}[1/5]${NC} Creating WebSocket Mesh Hub..."

cat > ~/.blackroad/mesh/mesh_hub.py << 'EOFMESH'
#!/usr/bin/env python3
"""
BlackRoad WebSocket Mesh Hub
Real-time communication between all agents
"""

import asyncio
import json
import socket
import os
from datetime import datetime
from typing import Dict, Set
import sys

try:
    import websockets
except ImportError:
    print("Installing websockets...")
    os.system("pip3 install --user --break-system-packages websockets 2>/dev/null || pip3 install websockets")
    import websockets

MESH_PORT = 8765
PEERS: Dict[str, websockets.WebSocketServerProtocol] = {}
MESSAGE_LOG = os.path.expanduser("~/.blackroad/mesh/messages.jsonl")

class MeshHub:
    def __init__(self):
        self.hostname = socket.gethostname()
        self.peers: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.subscriptions: Dict[str, Set[str]] = {}  # channel -> set of peer_ids

    async def register(self, websocket, peer_id: str):
        """Register new peer"""
        self.peers[peer_id] = websocket
        await self.broadcast_system(f"{peer_id} joined the mesh")
        print(f"[+] {peer_id} connected ({len(self.peers)} peers)")

    async def unregister(self, peer_id: str):
        """Unregister peer"""
        if peer_id in self.peers:
            del self.peers[peer_id]
            # Remove from all subscriptions
            for channel in self.subscriptions.values():
                channel.discard(peer_id)
            await self.broadcast_system(f"{peer_id} left the mesh")
            print(f"[-] {peer_id} disconnected ({len(self.peers)} peers)")

    async def broadcast(self, message: dict, exclude: str = None):
        """Broadcast to all peers"""
        msg_json = json.dumps(message)
        for peer_id, ws in list(self.peers.items()):
            if peer_id != exclude:
                try:
                    await ws.send(msg_json)
                except:
                    await self.unregister(peer_id)

    async def broadcast_system(self, text: str):
        """Broadcast system message"""
        await self.broadcast({
            "type": "system",
            "from": self.hostname,
            "text": text,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def send_to_peer(self, peer_id: str, message: dict):
        """Send to specific peer"""
        if peer_id in self.peers:
            try:
                await self.peers[peer_id].send(json.dumps(message))
                return True
            except:
                await self.unregister(peer_id)
        return False

    async def publish(self, channel: str, message: dict):
        """Publish to channel subscribers"""
        subscribers = self.subscriptions.get(channel, set())
        for peer_id in list(subscribers):
            await self.send_to_peer(peer_id, {
                "type": "channel",
                "channel": channel,
                "message": message
            })

    def subscribe(self, peer_id: str, channel: str):
        """Subscribe peer to channel"""
        if channel not in self.subscriptions:
            self.subscriptions[channel] = set()
        self.subscriptions[channel].add(peer_id)

    def log_message(self, message: dict):
        """Log message to file"""
        with open(MESSAGE_LOG, "a") as f:
            f.write(json.dumps(message) + "\n")

    async def handler(self, websocket, path):
        """Handle WebSocket connection"""
        peer_id = None
        try:
            # Wait for registration
            reg_msg = await websocket.recv()
            reg = json.loads(reg_msg)
            peer_id = reg.get("peer_id", f"anon-{id(websocket)}")

            await self.register(websocket, peer_id)

            # Send welcome
            await websocket.send(json.dumps({
                "type": "welcome",
                "hub": self.hostname,
                "peers": list(self.peers.keys()),
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Message loop
            async for message in websocket:
                try:
                    msg = json.loads(message)
                    msg["from"] = peer_id
                    msg["timestamp"] = datetime.utcnow().isoformat()

                    self.log_message(msg)

                    msg_type = msg.get("type", "message")

                    if msg_type == "broadcast":
                        await self.broadcast(msg, exclude=peer_id)

                    elif msg_type == "direct":
                        target = msg.get("to")
                        if target:
                            await self.send_to_peer(target, msg)

                    elif msg_type == "subscribe":
                        channel = msg.get("channel")
                        if channel:
                            self.subscribe(peer_id, channel)

                    elif msg_type == "publish":
                        channel = msg.get("channel")
                        if channel:
                            await self.publish(channel, msg)

                    elif msg_type == "ping":
                        await websocket.send(json.dumps({
                            "type": "pong",
                            "from": self.hostname,
                            "timestamp": datetime.utcnow().isoformat()
                        }))

                except json.JSONDecodeError:
                    pass

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if peer_id:
                await self.unregister(peer_id)

async def main():
    hub = MeshHub()
    print(f"[*] BlackRoad Mesh Hub starting on port {MESH_PORT}...")
    async with websockets.serve(hub.handler, "0.0.0.0", MESH_PORT):
        print(f"[*] Mesh Hub ready on ws://0.0.0.0:{MESH_PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
EOFMESH
chmod +x ~/.blackroad/mesh/mesh_hub.py

echo -e "${GREEN}WebSocket Mesh Hub installed${NC}"

echo -e "${AMBER}[2/5]${NC} Creating Distributed Task Queue..."

cat > ~/.blackroad/tasks/task_queue.py << 'EOFTASK'
#!/usr/bin/env python3
"""
BlackRoad Distributed Task Queue
Async task execution across the mesh
"""

import os
import json
import time
import socket
import subprocess
import threading
from datetime import datetime
from typing import Dict, List, Optional, Callable
from queue import PriorityQueue
from dataclasses import dataclass, field

TASK_DIR = os.path.expanduser("~/.blackroad/tasks")
QUEUE_FILE = os.path.join(TASK_DIR, "queue.json")
RESULTS_FILE = os.path.join(TASK_DIR, "results.jsonl")
HOSTNAME = socket.gethostname()

@dataclass(order=True)
class Task:
    priority: int
    id: str = field(compare=False)
    command: str = field(compare=False)
    created: str = field(compare=False)
    status: str = field(compare=False, default="pending")
    result: Optional[str] = field(compare=False, default=None)
    assigned_to: Optional[str] = field(compare=False, default=None)

class TaskQueue:
    def __init__(self):
        self.queue = PriorityQueue()
        self.tasks: Dict[str, Task] = {}
        self.workers: Dict[str, bool] = {}  # worker_id -> busy
        self.load()

    def load(self):
        """Load queue from disk"""
        try:
            with open(QUEUE_FILE, "r") as f:
                data = json.load(f)
                for t in data.get("tasks", []):
                    task = Task(**t)
                    self.tasks[task.id] = task
                    if task.status == "pending":
                        self.queue.put(task)
        except FileNotFoundError:
            pass

    def save(self):
        """Save queue to disk"""
        data = {"tasks": [vars(t) for t in self.tasks.values()]}
        with open(QUEUE_FILE, "w") as f:
            json.dump(data, f, indent=2)

    def enqueue(self, command: str, priority: int = 5) -> str:
        """Add task to queue"""
        task_id = f"task-{int(time.time())}-{os.urandom(4).hex()}"
        task = Task(
            priority=priority,
            id=task_id,
            command=command,
            created=datetime.utcnow().isoformat()
        )
        self.tasks[task_id] = task
        self.queue.put(task)
        self.save()
        return task_id

    def dequeue(self, worker_id: str) -> Optional[Task]:
        """Get next task for worker"""
        try:
            task = self.queue.get_nowait()
            task.status = "running"
            task.assigned_to = worker_id
            self.workers[worker_id] = True
            self.save()
            return task
        except:
            return None

    def complete(self, task_id: str, result: str, success: bool = True):
        """Mark task complete"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = "completed" if success else "failed"
            task.result = result
            if task.assigned_to:
                self.workers[task.assigned_to] = False
            self.save()
            self.log_result(task)

    def log_result(self, task: Task):
        """Log task result"""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "task_id": task.id,
            "command": task.command,
            "status": task.status,
            "result": task.result[:500] if task.result else None,
            "worker": task.assigned_to
        }
        with open(RESULTS_FILE, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def execute_local(self, task: Task) -> tuple[bool, str]:
        """Execute task locally"""
        try:
            result = subprocess.check_output(
                task.command,
                shell=True,
                timeout=300,
                stderr=subprocess.STDOUT
            ).decode()
            return True, result
        except subprocess.TimeoutExpired:
            return False, "Timeout"
        except subprocess.CalledProcessError as e:
            return False, e.output.decode() if e.output else str(e)
        except Exception as e:
            return False, str(e)

    def worker_loop(self, worker_id: str = None):
        """Run as worker, processing tasks"""
        worker_id = worker_id or f"{HOSTNAME}-worker"
        print(f"[*] Worker {worker_id} starting...")

        while True:
            task = self.dequeue(worker_id)
            if task:
                print(f"[>] Executing: {task.command[:50]}...")
                success, result = self.execute_local(task)
                self.complete(task.id, result, success)
                status = "✓" if success else "✗"
                print(f"[{status}] Task {task.id} complete")
            else:
                time.sleep(1)

    def list_tasks(self, status: str = None) -> List[Dict]:
        """List tasks"""
        tasks = []
        for t in self.tasks.values():
            if status is None or t.status == status:
                tasks.append(vars(t))
        return sorted(tasks, key=lambda x: x["created"], reverse=True)

    def stats(self) -> Dict:
        """Get queue stats"""
        by_status = {}
        for t in self.tasks.values():
            by_status[t.status] = by_status.get(t.status, 0) + 1
        return {
            "total": len(self.tasks),
            "pending": self.queue.qsize(),
            "by_status": by_status,
            "workers": len([w for w, busy in self.workers.items() if busy])
        }

# CLI
if __name__ == "__main__":
    import sys
    queue = TaskQueue()

    if len(sys.argv) < 2:
        print("task_queue.py <command> [args]")
        print("Commands: add, list, worker, stats, results")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "add":
        command = " ".join(sys.argv[2:])
        priority = 5
        # Check for priority flag
        if "-p" in sys.argv:
            idx = sys.argv.index("-p")
            priority = int(sys.argv[idx + 1])
            command = " ".join([a for i, a in enumerate(sys.argv[2:]) if i != idx-2 and i != idx-1])

        task_id = queue.enqueue(command, priority)
        print(f"Queued: {task_id}")

    elif cmd == "list":
        status = sys.argv[2] if len(sys.argv) > 2 else None
        tasks = queue.list_tasks(status)
        for t in tasks[:10]:
            print(f"[{t['status']}] {t['id']}: {t['command'][:40]}")

    elif cmd == "worker":
        worker_id = sys.argv[2] if len(sys.argv) > 2 else None
        queue.worker_loop(worker_id)

    elif cmd == "stats":
        stats = queue.stats()
        print(json.dumps(stats, indent=2))

    elif cmd == "results":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        try:
            with open(RESULTS_FILE, "r") as f:
                lines = f.readlines()[-n:]
                for line in lines:
                    r = json.loads(line)
                    status = "✓" if r["status"] == "completed" else "✗"
                    print(f"{status} {r['task_id']}: {r['command'][:30]}")
        except FileNotFoundError:
            print("No results yet")
EOFTASK
chmod +x ~/.blackroad/tasks/task_queue.py

echo -e "${GREEN}Task Queue installed${NC}"

echo -e "${AMBER}[3/5]${NC} Creating Health Monitor Daemon..."

cat > ~/.blackroad/monitor/health_daemon.py << 'EOFHEALTH'
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
EOFHEALTH
chmod +x ~/.blackroad/monitor/health_daemon.py

echo -e "${GREEN}Health Monitor installed${NC}"

echo -e "${AMBER}[4/5]${NC} Creating Service Discovery..."

cat > ~/.blackroad/discovery/service_registry.py << 'EOFDISC'
#!/usr/bin/env python3
"""
BlackRoad Service Discovery
Auto-discover and register services across the mesh
"""

import os
import json
import socket
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

REGISTRY_FILE = os.path.expanduser("~/.blackroad/discovery/registry.json")
HOSTNAME = socket.gethostname()

# Known service ports
KNOWN_SERVICES = {
    "fastapi": {"port": 8000, "protocol": "http", "path": "/"},
    "webhooks": {"port": 9000, "protocol": "http", "path": "/"},
    "node": {"port": 3000, "protocol": "http", "path": "/"},
    "ollama": {"port": 11434, "protocol": "http", "path": "/api/tags"},
    "mesh": {"port": 8765, "protocol": "ws", "path": "/"},
    "ssh": {"port": 22, "protocol": "tcp", "path": None},
}

# Fleet IPs
FLEET = {
    "cecilia": "192.168.4.89",
    "lucidia": "192.168.4.81",
    "octavia": "192.168.4.38",
    "aria": "192.168.4.82",
    "alice": "192.168.4.49",
    "gematria": "174.138.44.45",
    "anastasia": "159.65.43.12",
}

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, Dict] = {}
        self.load()

    def load(self):
        """Load registry from disk"""
        try:
            with open(REGISTRY_FILE, "r") as f:
                self.services = json.load(f)
        except FileNotFoundError:
            self.services = {}

    def save(self):
        """Save registry to disk"""
        os.makedirs(os.path.dirname(REGISTRY_FILE), exist_ok=True)
        with open(REGISTRY_FILE, "w") as f:
            json.dump(self.services, f, indent=2)

    def register(self, name: str, host: str, port: int, protocol: str = "http", metadata: Dict = None):
        """Register a service"""
        service_id = f"{name}@{host}:{port}"
        self.services[service_id] = {
            "name": name,
            "host": host,
            "port": port,
            "protocol": protocol,
            "metadata": metadata or {},
            "registered": datetime.utcnow().isoformat(),
            "last_seen": datetime.utcnow().isoformat(),
            "healthy": True
        }
        self.save()
        return service_id

    def deregister(self, service_id: str):
        """Deregister a service"""
        if service_id in self.services:
            del self.services[service_id]
            self.save()

    def heartbeat(self, service_id: str):
        """Update service heartbeat"""
        if service_id in self.services:
            self.services[service_id]["last_seen"] = datetime.utcnow().isoformat()
            self.services[service_id]["healthy"] = True
            self.save()

    def check_port(self, host: str, port: int, timeout: float = 1.0) -> bool:
        """Check if port is open"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except:
            return False

    def discover_host(self, hostname: str, ip: str) -> List[Dict]:
        """Discover services on a host"""
        discovered = []
        for name, config in KNOWN_SERVICES.items():
            port = config["port"]
            if self.check_port(ip, port):
                service_id = self.register(
                    name=name,
                    host=hostname,
                    port=port,
                    protocol=config["protocol"],
                    metadata={"ip": ip, "path": config.get("path")}
                )
                discovered.append({"id": service_id, "name": name, "port": port})
        return discovered

    def discover_all(self) -> Dict[str, List]:
        """Discover services on all fleet hosts"""
        results = {}
        for hostname, ip in FLEET.items():
            print(f"Scanning {hostname} ({ip})...", end=" ", flush=True)
            services = self.discover_host(hostname, ip)
            results[hostname] = services
            print(f"{len(services)} services")
        return results

    def find(self, name: str = None, host: str = None, healthy_only: bool = True) -> List[Dict]:
        """Find services"""
        results = []
        now = datetime.utcnow()
        stale_threshold = timedelta(minutes=5)

        for sid, svc in self.services.items():
            # Check health (stale = unhealthy)
            last_seen = datetime.fromisoformat(svc["last_seen"])
            is_healthy = (now - last_seen) < stale_threshold

            if healthy_only and not is_healthy:
                continue

            if name and svc["name"] != name:
                continue

            if host and svc["host"] != host:
                continue

            results.append({**svc, "id": sid, "healthy": is_healthy})

        return results

    def get_endpoint(self, name: str) -> Optional[str]:
        """Get endpoint URL for service"""
        services = self.find(name=name, healthy_only=True)
        if services:
            svc = services[0]
            proto = svc["protocol"]
            host = svc["metadata"].get("ip", svc["host"])
            port = svc["port"]
            path = svc["metadata"].get("path", "")
            return f"{proto}://{host}:{port}{path}"
        return None

    def list_all(self) -> List[Dict]:
        """List all registered services"""
        return self.find(healthy_only=False)

# CLI
if __name__ == "__main__":
    import sys
    registry = ServiceRegistry()

    if len(sys.argv) < 2:
        print("service_registry.py <command> [args]")
        print("Commands: discover, list, find, endpoint")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "discover":
        if len(sys.argv) > 2:
            host = sys.argv[2]
            ip = FLEET.get(host, host)
            services = registry.discover_host(host, ip)
            for s in services:
                print(f"  ● {s['name']} (port {s['port']})")
        else:
            results = registry.discover_all()
            for host, services in results.items():
                if services:
                    print(f"\n{host}:")
                    for s in services:
                        print(f"  ● {s['name']} (port {s['port']})")

    elif cmd == "list":
        services = registry.list_all()
        for s in services:
            status = "●" if s["healthy"] else "○"
            print(f"{status} {s['name']}@{s['host']}:{s['port']}")

    elif cmd == "find":
        name = sys.argv[2] if len(sys.argv) > 2 else None
        services = registry.find(name=name)
        for s in services:
            print(f"● {s['id']}")

    elif cmd == "endpoint":
        name = sys.argv[2] if len(sys.argv) > 2 else None
        if name:
            url = registry.get_endpoint(name)
            print(url or "Not found")
        else:
            print("Usage: service_registry.py endpoint <service_name>")
EOFDISC
chmod +x ~/.blackroad/discovery/service_registry.py

echo -e "${GREEN}Service Discovery installed${NC}"

echo -e "${AMBER}[5/5]${NC} Creating mesh CLI..."

cat > ~/br-mesh-network << 'EOFCLI'
#!/bin/bash
# BlackRoad Mesh Network CLI
# WebSocket + Tasks + Health + Discovery

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
WHITE='\033[1;37m'
NC='\033[0m'

MESH_DIR="$HOME/.blackroad"

case "$1" in
    status|"")
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}  BlackRoad Mesh Network - $(hostname)${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        echo -e "${BLUE}Components:${NC}"
        [[ -f "$MESH_DIR/mesh/mesh_hub.py" ]] && echo -e "  ${GREEN}●${NC} WebSocket Hub" || echo -e "  ○ WebSocket Hub"
        [[ -f "$MESH_DIR/tasks/task_queue.py" ]] && echo -e "  ${GREEN}●${NC} Task Queue" || echo -e "  ○ Task Queue"
        [[ -f "$MESH_DIR/monitor/health_daemon.py" ]] && echo -e "  ${GREEN}●${NC} Health Monitor" || echo -e "  ○ Health Monitor"
        [[ -f "$MESH_DIR/discovery/service_registry.py" ]] && echo -e "  ${GREEN}●${NC} Service Discovery" || echo -e "  ○ Service Discovery"

        echo ""
        echo -e "${BLUE}Quick Health:${NC}"
        python3 "$MESH_DIR/monitor/health_daemon.py" check 2>/dev/null | jq -r '"  Load: \(.cpu_load) | Mem: \(.memory.percent)% | Temp: \(.temperature)C"' 2>/dev/null || echo "  (run health check)"

        echo ""
        echo -e "${BLUE}Tasks:${NC}"
        python3 "$MESH_DIR/tasks/task_queue.py" stats 2>/dev/null | jq -r '"  Total: \(.total) | Pending: \(.pending)"' 2>/dev/null || echo "  No tasks"
        ;;

    hub)
        shift
        if [[ "$1" == "start" ]]; then
            echo "Starting WebSocket Mesh Hub..."
            nohup python3 "$MESH_DIR/mesh/mesh_hub.py" > "$MESH_DIR/mesh/hub.log" 2>&1 &
            echo "Hub started on port 8765"
        else
            python3 "$MESH_DIR/mesh/mesh_hub.py" "$@"
        fi
        ;;

    task)
        shift
        python3 "$MESH_DIR/tasks/task_queue.py" "$@"
        ;;

    health)
        shift
        python3 "$MESH_DIR/monitor/health_daemon.py" "$@"
        ;;

    discover)
        shift
        python3 "$MESH_DIR/discovery/service_registry.py" discover "$@"
        ;;

    services)
        python3 "$MESH_DIR/discovery/service_registry.py" list
        ;;

    start-all)
        echo -e "${AMBER}Starting all mesh services...${NC}"

        # Health monitor
        echo -n "Health monitor: "
        nohup python3 "$MESH_DIR/monitor/health_daemon.py" daemon 60 > "$MESH_DIR/monitor/daemon.log" 2>&1 &
        echo -e "${GREEN}started${NC}"

        # WebSocket hub
        echo -n "WebSocket hub: "
        nohup python3 "$MESH_DIR/mesh/mesh_hub.py" > "$MESH_DIR/mesh/hub.log" 2>&1 &
        echo -e "${GREEN}started${NC}"

        # Task worker
        echo -n "Task worker: "
        nohup python3 "$MESH_DIR/tasks/task_queue.py" worker > "$MESH_DIR/tasks/worker.log" 2>&1 &
        echo -e "${GREEN}started${NC}"

        echo -e "\n${GREEN}All mesh services started${NC}"
        ;;

    *)
        echo -e "${PINK}br-mesh-network${NC} - BlackRoad Mesh CLI"
        echo ""
        echo "Commands:"
        echo "  status      - Show mesh status"
        echo "  hub start   - Start WebSocket hub"
        echo "  task add    - Add task to queue"
        echo "  health      - Check health"
        echo "  discover    - Discover services"
        echo "  services    - List registered services"
        echo "  start-all   - Start all mesh services"
        ;;
esac
EOFCLI
chmod +x ~/br-mesh-network

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Mesh Network Stack Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • WebSocket Mesh Hub (port 8765)"
echo "  • Distributed Task Queue"
echo "  • Health Monitor Daemon"
echo "  • Service Discovery"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-mesh-network start-all"
echo "  ~/br-mesh-network discover"
echo "  ~/br-mesh-network task add 'echo hello'"
