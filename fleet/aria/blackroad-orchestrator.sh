#!/bin/bash
# BlackRoad Fleet Orchestrator - Master Control System
# Coordinates all services across the distributed network

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Fleet Orchestrator - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/orchestrator
mkdir -p ~/.blackroad/orchestrator/playbooks
mkdir -p ~/.blackroad/orchestrator/logs

# ============================================================
# [1/4] Orchestrator Core
# ============================================================
echo -e "${AMBER}[1/4]${NC} Creating Orchestrator Core..."

cat > ~/.blackroad/orchestrator/orchestrator.py << 'ORCH'
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
ORCH

chmod +x ~/.blackroad/orchestrator/orchestrator.py
echo -e "${GREEN}Orchestrator Core installed${NC}"

# ============================================================
# [2/4] Playbook System
# ============================================================
echo -e "${AMBER}[2/4]${NC} Creating Playbook System..."

cat > ~/.blackroad/orchestrator/playbooks/deploy-all.yaml << 'PLAYBOOK'
# BlackRoad Deployment Playbook
name: deploy-all
description: Deploy all services to fleet

targets:
  - cecilia
  - lucidia
  - octavia
  - aria
  - anastasia

services:
  - name: api
    port: 8000
    start: "cd ~/blackroad-api && nohup ~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &"
    check: "curl -s http://localhost:8000/"

  - name: mesh
    port: 8765
    start: "nohup python3 ~/.blackroad/mesh/mesh_hub.py > ~/.blackroad/mesh/hub.log 2>&1 &"
    check: "ss -tlnp | grep 8765"

  - name: eventbus
    port: 8766
    start: "nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &"
    check: "ss -tlnp | grep 8766"

  - name: health
    port: 0
    start: "nohup python3 ~/.blackroad/monitor/health_daemon.py > ~/.blackroad/monitor/health.log 2>&1 &"
    check: "pgrep -f health_daemon"

post_deploy:
  - "~/br-mesh-network discover"
  - "~/br-eventbus pub system 'Fleet deployment complete'"
PLAYBOOK

# Create playbook runner
cat > ~/.blackroad/orchestrator/run_playbook.py << 'RUNNER'
#!/usr/bin/env python3
"""Run BlackRoad deployment playbooks"""

import yaml
import subprocess
import sys
import os

def run_remote(host, cmd, timeout=30):
    try:
        result = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", host, cmd],
            capture_output=True, text=True, timeout=timeout
        )
        return result.returncode == 0, result.stdout.strip()
    except:
        return False, ""

def run_playbook(playbook_path):
    with open(playbook_path) as f:
        pb = yaml.safe_load(f)

    print(f"\n=== Running Playbook: {pb['name']} ===\n")

    for target in pb.get("targets", []):
        print(f"\n--- {target} ---")

        for svc in pb.get("services", []):
            print(f"  Starting {svc['name']}...", end=" ")
            ok, _ = run_remote(target, svc["start"])
            print("OK" if ok else "SKIP")

    print("\n--- Post Deploy ---")
    for cmd in pb.get("post_deploy", []):
        print(f"  Running: {cmd}")
        os.system(cmd)

    print("\n=== Playbook Complete ===")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: run_playbook.py <playbook.yaml>")
        sys.exit(1)
    run_playbook(sys.argv[1])
RUNNER

chmod +x ~/.blackroad/orchestrator/run_playbook.py
echo -e "${GREEN}Playbook System installed${NC}"

# ============================================================
# [3/4] Fleet CLI
# ============================================================
echo -e "${AMBER}[3/4]${NC} Creating Fleet CLI..."

cat > ~/br-fleet << 'FLEETCLI'
#!/bin/bash
# br-fleet - BlackRoad Fleet Orchestrator CLI

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

NODES=(cecilia lucidia octavia aria anastasia)

case "$1" in
    status|"")
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}                   BLACKROAD FLEET STATUS${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        for node in "${NODES[@]}"; do
            echo -n -e "${AMBER}$node${NC}: "
            if ssh -o ConnectTimeout=3 "$node" "echo ok" &>/dev/null; then
                echo -n -e "${GREEN}ONLINE${NC} "

                # Check services
                for port in 8000 8765 8766 11434; do
                    if ssh -o ConnectTimeout=2 "$node" "ss -tlnp | grep -q :$port" 2>/dev/null; then
                        case $port in
                            8000) echo -n -e "${BLUE}API${NC} " ;;
                            8765) echo -n -e "${VIOLET}MESH${NC} " ;;
                            8766) echo -n -e "${PINK}EVENT${NC} " ;;
                            11434) echo -n -e "${AMBER}OLLAMA${NC} " ;;
                        esac
                    fi
                done
                echo ""
            else
                echo -e "${RED}OFFLINE${NC}"
            fi
        done

        echo ""
        echo -e "${DIM}Ports: API=8000, Mesh=8765, EventBus=8766, Ollama=11434${NC}"
        ;;

    start)
        service="$2"
        echo -e "${PINK}Starting $service on fleet...${NC}"

        for node in "${NODES[@]}"; do
            echo -n "$node: "
            case "$service" in
                api)
                    ssh "$node" 'cd ~/blackroad-api && nohup ~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &' && \
                        echo -e "${GREEN}started${NC}" || echo "failed"
                    ;;
                mesh)
                    ssh "$node" 'nohup python3 ~/.blackroad/mesh/mesh_hub.py > ~/.blackroad/mesh/hub.log 2>&1 &' && \
                        echo -e "${GREEN}started${NC}" || echo "failed"
                    ;;
                eventbus)
                    ssh "$node" 'nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &' && \
                        echo -e "${GREEN}started${NC}" || echo "failed"
                    ;;
                health)
                    ssh "$node" 'nohup python3 ~/.blackroad/monitor/health_daemon.py > ~/.blackroad/monitor/health.log 2>&1 &' && \
                        echo -e "${GREEN}started${NC}" || echo "failed"
                    ;;
                all)
                    ssh "$node" 'cd ~/blackroad-api && nohup ~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > api.log 2>&1 &' &
                    ssh "$node" 'nohup python3 ~/.blackroad/mesh/mesh_hub.py > ~/.blackroad/mesh/hub.log 2>&1 &' &
                    ssh "$node" 'nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &' &
                    ssh "$node" 'nohup python3 ~/.blackroad/monitor/health_daemon.py > ~/.blackroad/monitor/health.log 2>&1 &' &
                    echo -e "${GREEN}starting all${NC}"
                    ;;
            esac
        done
        wait
        ;;

    stop)
        service="$2"
        port=""
        case "$service" in
            api) port=8000 ;;
            mesh) port=8765 ;;
            eventbus) port=8766 ;;
        esac

        if [ -n "$port" ]; then
            echo -e "${AMBER}Stopping $service (port $port) on fleet...${NC}"
            for node in "${NODES[@]}"; do
                echo -n "$node: "
                ssh "$node" "lsof -ti:$port | xargs kill -9 2>/dev/null" && \
                    echo -e "${GREEN}stopped${NC}" || echo "not running"
            done
        fi
        ;;

    exec)
        shift
        cmd="$*"
        echo -e "${PINK}Executing on fleet: $cmd${NC}"
        echo ""

        for node in "${NODES[@]}"; do
            echo -e "${AMBER}=== $node ===${NC}"
            ssh -o ConnectTimeout=5 "$node" "$cmd" 2>/dev/null || echo "(failed)"
            echo ""
        done
        ;;

    deploy)
        playbook="${2:-deploy-all}"
        echo -e "${PINK}Running playbook: $playbook${NC}"
        python3 ~/.blackroad/orchestrator/run_playbook.py ~/.blackroad/orchestrator/playbooks/${playbook}.yaml
        ;;

    sync)
        echo -e "${PINK}Syncing scripts to fleet...${NC}"
        for node in "${NODES[@]}"; do
            echo -n "$node: "
            rsync -az ~/pi-autonomy-package/ "$node":~/pi-autonomy-package/ 2>/dev/null && \
                echo -e "${GREEN}synced${NC}" || echo "failed"
        done
        ;;

    reboot)
        node="$2"
        if [ -n "$node" ]; then
            echo -e "${RED}Rebooting $node...${NC}"
            ssh "$node" "sudo reboot" &
        else
            echo "Usage: br-fleet reboot <node>"
        fi
        ;;

    ssh)
        node="$2"
        shift 2
        cmd="$*"
        if [ -n "$cmd" ]; then
            ssh "$node" "$cmd"
        else
            ssh "$node"
        fi
        ;;

    resources)
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}         FLEET RESOURCE USAGE${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        printf "%-12s %8s %8s %8s\n" "NODE" "CPU" "MEM" "DISK"
        echo "─────────────────────────────────────────"

        for node in "${NODES[@]}"; do
            cpu=$(ssh -o ConnectTimeout=3 "$node" "top -bn1 | grep 'Cpu' | awk '{print \$2}'" 2>/dev/null || echo "?")
            mem=$(ssh -o ConnectTimeout=3 "$node" "free | awk '/Mem:/{printf \"%.1f\", \$3/\$2*100}'" 2>/dev/null || echo "?")
            disk=$(ssh -o ConnectTimeout=3 "$node" "df / | awk 'NR==2{print \$5}'" 2>/dev/null || echo "?")

            printf "%-12s %7s%% %7s%% %8s\n" "$node" "$cpu" "$mem" "$disk"
        done
        ;;

    *)
        echo -e "${PINK}br-fleet${NC} - BlackRoad Fleet Orchestrator"
        echo ""
        echo "Commands:"
        echo "  status        - Show fleet status"
        echo "  start <svc>   - Start service on fleet (api/mesh/eventbus/health/all)"
        echo "  stop <svc>    - Stop service on fleet"
        echo "  exec <cmd>    - Execute command on all nodes"
        echo "  deploy [pb]   - Run deployment playbook"
        echo "  sync          - Sync scripts to fleet"
        echo "  resources     - Show resource usage"
        echo "  ssh <node>    - SSH to node"
        echo "  reboot <node> - Reboot a node"
        echo ""
        echo "Examples:"
        echo "  br-fleet start all"
        echo "  br-fleet exec 'df -h'"
        echo "  br-fleet deploy deploy-all"
        ;;
esac
FLEETCLI

chmod +x ~/br-fleet

# ============================================================
# [4/4] Local BR command
# ============================================================
echo -e "${AMBER}[4/4]${NC} Creating local br-fleet link..."

# Copy to bin if local
if [ -d ~/bin ]; then
    cp ~/br-fleet ~/bin/br-fleet 2>/dev/null
fi

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Fleet Orchestrator Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • Orchestrator Core (distributed coordination)"
echo "  • Playbook System (declarative deployments)"
echo "  • Fleet CLI (br-fleet command)"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-fleet status"
echo "  ~/br-fleet start all"
echo "  ~/br-fleet exec 'hostname'"
echo "  ~/br-fleet deploy"
