#!/usr/bin/env python3
"""
BlackRoad Fleet Orchestrator - Distributed Coordination Engine
Manages service lifecycle, deployments, and fleet-wide operations
"""

import asyncio
import json
import os
import subprocess
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class ServiceState(Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    STARTING = "starting"
    STOPPING = "stopping"
    FAILED = "failed"
    UNKNOWN = "unknown"

@dataclass
class ServiceInfo:
    name: str
    port: int
    state: ServiceState
    pid: Optional[int] = None
    uptime: Optional[str] = None
    last_check: Optional[str] = None

@dataclass
class NodeInfo:
    hostname: str
    ip: str
    role: str
    services: List[ServiceInfo]
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    disk_percent: float = 0.0
    online: bool = True

class FleetOrchestrator:
    def __init__(self):
        self.hostname = os.uname().nodename
        self.nodes = {
            "cecilia": {"ip": "192.168.4.89", "role": "primary", "ts": "100.72.180.98"},
            "lucidia": {"ip": "192.168.4.81", "role": "inference", "ts": "100.83.149.86"},
            "octavia": {"ip": "192.168.4.38", "role": "worker", "ts": "100.66.235.47"},
            "aria": {"ip": "192.168.4.82", "role": "harmony", "ts": "100.109.14.17"},
            "alice": {"ip": "192.168.4.49", "role": "worker", "ts": "100.77.210.18"},
            "anastasia": {"ip": "159.65.43.12", "role": "cloud", "ts": ""},
        }
        self.services = {
            "api": {"port": 8000, "cmd": "uvicorn", "check": "/"},
            "webhook": {"port": 9000, "cmd": "python3", "check": "/health"},
            "ollama": {"port": 11434, "cmd": "ollama", "check": "/api/tags"},
            "mesh": {"port": 8765, "cmd": "mesh_hub", "check": ""},
            "eventbus": {"port": 8766, "cmd": "event_bus", "check": ""},
            "node": {"port": 3000, "cmd": "node", "check": "/"},
        }
        self.state_file = os.path.expanduser("~/.blackroad/orchestrator/state.json")

    def run_remote(self, host: str, cmd: str, timeout: int = 10) -> tuple:
        """Execute command on remote host"""
        try:
            result = subprocess.run(
                ["ssh", "-o", "ConnectTimeout=5", host, cmd],
                capture_output=True, text=True, timeout=timeout
            )
            return result.returncode == 0, result.stdout.strip()
        except subprocess.TimeoutExpired:
            return False, "timeout"
        except Exception as e:
            return False, str(e)

    def check_service(self, host: str, service: str) -> ServiceInfo:
        """Check if service is running on host"""
        svc = self.services.get(service, {})
        port = svc.get("port", 0)

        # Check if port is listening
        ok, output = self.run_remote(host, f"ss -tlnp | grep :{port}")

        if ok and str(port) in output:
            # Get PID
            ok2, pid = self.run_remote(host, f"lsof -ti:{port} 2>/dev/null | head -1")
            return ServiceInfo(
                name=service,
                port=port,
                state=ServiceState.RUNNING,
                pid=int(pid) if pid.isdigit() else None,
                last_check=datetime.now().isoformat()
            )
        else:
            return ServiceInfo(
                name=service,
                port=port,
                state=ServiceState.STOPPED,
                last_check=datetime.now().isoformat()
            )

    def get_node_status(self, host: str) -> NodeInfo:
        """Get full status of a node"""
        node = self.nodes.get(host, {})

        # Check if online
        ok, _ = self.run_remote(host, "echo ok", timeout=5)

        services = []
        if ok:
            for svc in self.services:
                services.append(self.check_service(host, svc))

            # Get resource usage
            _, cpu = self.run_remote(host, "top -bn1 | grep 'Cpu' | awk '{print $2}'")
            _, mem = self.run_remote(host, "free | awk '/Mem:/{printf \"%.1f\", $3/$2*100}'")
            _, disk = self.run_remote(host, "df / | awk 'NR==2{print $5}' | tr -d '%'")

            return NodeInfo(
                hostname=host,
                ip=node.get("ip", ""),
                role=node.get("role", "worker"),
                services=services,
                cpu_percent=float(cpu) if cpu else 0,
                memory_percent=float(mem) if mem else 0,
                disk_percent=float(disk) if disk else 0,
                online=True
            )
        else:
            return NodeInfo(
                hostname=host,
                ip=node.get("ip", ""),
                role=node.get("role", "worker"),
                services=[],
                online=False
            )

    def start_service(self, host: str, service: str) -> bool:
        """Start a service on a host"""
        commands = {
            "api": "cd ~/blackroad-api && nohup ~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &",
            "mesh": "nohup python3 ~/.blackroad/mesh/mesh_hub.py > ~/.blackroad/mesh/hub.log 2>&1 &",
            "eventbus": "nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &",
            "webhook": "nohup python3 ~/.blackroad/webhook/server.py > ~/.blackroad/webhook/server.log 2>&1 &",
        }

        cmd = commands.get(service)
        if cmd:
            ok, _ = self.run_remote(host, cmd)
            return ok
        return False

    def stop_service(self, host: str, service: str) -> bool:
        """Stop a service on a host"""
        svc = self.services.get(service, {})
        port = svc.get("port", 0)

        ok, _ = self.run_remote(host, f"lsof -ti:{port} | xargs kill -9 2>/dev/null")
        return True

    def deploy_to_fleet(self, script_path: str) -> Dict[str, bool]:
        """Deploy and run a script on all nodes"""
        results = {}
        for host in self.nodes:
            ok, _ = self.run_remote(host, f"bash {script_path}", timeout=60)
            results[host] = ok
        return results

    def fleet_status(self) -> Dict[str, NodeInfo]:
        """Get status of entire fleet"""
        status = {}
        for host in self.nodes:
            status[host] = self.get_node_status(host)
        return status

    def save_state(self, state: dict):
        """Save orchestrator state"""
        with open(self.state_file, 'w') as f:
            json.dump(state, f, indent=2, default=str)

    def load_state(self) -> dict:
        """Load orchestrator state"""
        if os.path.exists(self.state_file):
            with open(self.state_file) as f:
                return json.load(f)
        return {}

# CLI wrapper
if __name__ == "__main__":
    import sys

    orch = FleetOrchestrator()

    if len(sys.argv) < 2:
        print("Usage: orchestrator.py <command> [args]")
        print("Commands: status, start, stop, deploy, nodes")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "status":
        status = orch.fleet_status()
        for host, info in status.items():
            state = "ONLINE" if info.online else "OFFLINE"
            print(f"{host}: {state}")
            if info.online:
                for svc in info.services:
                    print(f"  {svc.name}:{svc.port} = {svc.state.value}")

    elif cmd == "start":
        host = sys.argv[2] if len(sys.argv) > 2 else None
        service = sys.argv[3] if len(sys.argv) > 3 else None
        if host and service:
            ok = orch.start_service(host, service)
            print(f"Started {service} on {host}: {'OK' if ok else 'FAILED'}")

    elif cmd == "stop":
        host = sys.argv[2] if len(sys.argv) > 2 else None
        service = sys.argv[3] if len(sys.argv) > 3 else None
        if host and service:
            ok = orch.stop_service(host, service)
            print(f"Stopped {service} on {host}: {'OK' if ok else 'FAILED'}")

    elif cmd == "nodes":
        for host, info in orch.nodes.items():
            print(f"{host}: {info['ip']} ({info['role']})")
