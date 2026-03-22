#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# blackroad-containers.sh - K8s-lite Container Orchestrator
# Manage containers across the BlackRoad fleet
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${AMBER}   BLACKROAD CONTAINER ORCHESTRATOR${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

CONTAINER_DIR="$HOME/.blackroad/containers"
mkdir -p "$CONTAINER_DIR"/{manifests,logs,state}

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ CONTAINER ORCHESTRATOR - K8s-lite for BlackRoad Fleet                     ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "\n${GREEN}[1/3] Creating Container Orchestrator...${NC}"

cat > "$CONTAINER_DIR/orchestrator.py" << 'ORCH_EOF'
#!/usr/bin/env python3
"""
BlackRoad Container Orchestrator - K8s-lite for distributed containers
Features: Deployment, scaling, rolling updates, health checks, scheduling
"""

import asyncio
import json
import os
import subprocess
import time
import logging
import hashlib
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from pathlib import Path
from enum import Enum
import yaml

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CONTAINER_DIR = Path.home() / '.blackroad' / 'containers'
MANIFESTS_DIR = CONTAINER_DIR / 'manifests'
STATE_FILE = CONTAINER_DIR / 'state' / 'cluster.json'

# Fleet nodes
NODES = ['cecilia', 'lucidia', 'octavia', 'aria']

class ContainerStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    STOPPED = "stopped"
    FAILED = "failed"
    UNKNOWN = "unknown"

class RestartPolicy(Enum):
    ALWAYS = "always"
    ON_FAILURE = "on-failure"
    NEVER = "never"

@dataclass
class Container:
    name: str
    image: str
    node: str
    status: ContainerStatus = ContainerStatus.PENDING
    container_id: Optional[str] = None
    ports: Dict[int, int] = field(default_factory=dict)  # container:host
    env: Dict[str, str] = field(default_factory=dict)
    volumes: List[str] = field(default_factory=list)
    restart_policy: RestartPolicy = RestartPolicy.ALWAYS
    cpu_limit: Optional[float] = None  # cores
    memory_limit: Optional[str] = None  # e.g., "512m"
    created_at: float = 0
    started_at: float = 0
    restart_count: int = 0
    labels: Dict[str, str] = field(default_factory=dict)

@dataclass
class Deployment:
    name: str
    replicas: int
    image: str
    ports: Dict[int, int] = field(default_factory=dict)
    env: Dict[str, str] = field(default_factory=dict)
    volumes: List[str] = field(default_factory=list)
    node_selector: Optional[str] = None  # specific node or None for any
    labels: Dict[str, str] = field(default_factory=dict)
    strategy: str = "rolling"  # rolling or recreate
    containers: List[str] = field(default_factory=list)  # container names

@dataclass
class Service:
    name: str
    selector: Dict[str, str]  # labels to match
    ports: Dict[int, int]  # service_port:target_port
    type: str = "ClusterIP"  # ClusterIP, NodePort, LoadBalancer

class ContainerOrchestrator:
    def __init__(self):
        self.containers: Dict[str, Container] = {}
        self.deployments: Dict[str, Deployment] = {}
        self.services: Dict[str, Service] = {}
        self.node_health: Dict[str, bool] = {n: True for n in NODES}
        self.load_state()

    def load_state(self):
        """Load cluster state from disk"""
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE) as f:
                    data = json.load(f)

                for name, c_data in data.get('containers', {}).items():
                    c_data['status'] = ContainerStatus(c_data['status'])
                    c_data['restart_policy'] = RestartPolicy(c_data['restart_policy'])
                    self.containers[name] = Container(**c_data)

                for name, d_data in data.get('deployments', {}).items():
                    self.deployments[name] = Deployment(**d_data)

            except Exception as e:
                logger.error(f"Failed to load state: {e}")

    def save_state(self):
        """Save cluster state to disk"""
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)

        data = {
            'containers': {},
            'deployments': {}
        }

        for name, container in self.containers.items():
            c_dict = asdict(container)
            c_dict['status'] = container.status.value
            c_dict['restart_policy'] = container.restart_policy.value
            data['containers'][name] = c_dict

        for name, deployment in self.deployments.items():
            data['deployments'][name] = asdict(deployment)

        with open(STATE_FILE, 'w') as f:
            json.dump(data, f, indent=2)

    async def run_on_node(self, node: str, command: str) -> tuple:
        """Execute command on a node via SSH"""
        try:
            proc = await asyncio.create_subprocess_exec(
                'ssh', '-o', 'ConnectTimeout=5', node, command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
            return proc.returncode == 0, stdout.decode().strip(), stderr.decode().strip()
        except Exception as e:
            return False, '', str(e)

    async def check_docker(self, node: str) -> bool:
        """Check if Docker is available on node"""
        success, _, _ = await self.run_on_node(node, 'docker info')
        return success

    async def select_node(self, selector: Optional[str] = None) -> Optional[str]:
        """Select best node for scheduling"""
        if selector:
            # Specific node requested
            if selector in NODES and self.node_health.get(selector, False):
                return selector
            return None

        # Find node with least containers
        node_counts = {n: 0 for n in NODES}
        for container in self.containers.values():
            if container.node in node_counts:
                node_counts[container.node] += 1

        # Return healthy node with least containers
        for node in sorted(node_counts.items(), key=lambda x: x[1]):
            if self.node_health.get(node[0], False):
                return node[0]

        return None

    async def pull_image(self, node: str, image: str) -> bool:
        """Pull Docker image on node"""
        logger.info(f"Pulling {image} on {node}")
        success, _, err = await self.run_on_node(node, f'docker pull {image}')
        if not success:
            logger.error(f"Failed to pull {image}: {err}")
        return success

    async def create_container(self, container: Container) -> bool:
        """Create and start a container"""
        # Build docker run command
        cmd_parts = ['docker', 'run', '-d', '--name', container.name]

        # Add restart policy
        cmd_parts.extend(['--restart', container.restart_policy.value])

        # Add ports
        for container_port, host_port in container.ports.items():
            cmd_parts.extend(['-p', f'{host_port}:{container_port}'])

        # Add environment variables
        for key, value in container.env.items():
            cmd_parts.extend(['-e', f'{key}={value}'])

        # Add volumes
        for volume in container.volumes:
            cmd_parts.extend(['-v', volume])

        # Add resource limits
        if container.cpu_limit:
            cmd_parts.extend(['--cpus', str(container.cpu_limit)])
        if container.memory_limit:
            cmd_parts.extend(['-m', container.memory_limit])

        # Add labels
        for key, value in container.labels.items():
            cmd_parts.extend(['--label', f'{key}={value}'])

        # Add image
        cmd_parts.append(container.image)

        cmd = ' '.join(cmd_parts)
        logger.info(f"Creating container {container.name} on {container.node}")

        success, container_id, err = await self.run_on_node(container.node, cmd)

        if success:
            container.container_id = container_id[:12]
            container.status = ContainerStatus.RUNNING
            container.started_at = time.time()
            self.save_state()
            logger.info(f"Container {container.name} started: {container.container_id}")
            return True
        else:
            container.status = ContainerStatus.FAILED
            logger.error(f"Failed to create container: {err}")
            return False

    async def stop_container(self, name: str) -> bool:
        """Stop a container"""
        if name not in self.containers:
            return False

        container = self.containers[name]
        success, _, err = await self.run_on_node(
            container.node,
            f'docker stop {container.name} && docker rm {container.name}'
        )

        if success:
            container.status = ContainerStatus.STOPPED
            self.save_state()
            return True
        return False

    async def delete_container(self, name: str) -> bool:
        """Delete a container"""
        if name not in self.containers:
            return False

        await self.stop_container(name)
        del self.containers[name]
        self.save_state()
        return True

    async def get_container_status(self, name: str) -> ContainerStatus:
        """Get container status from node"""
        if name not in self.containers:
            return ContainerStatus.UNKNOWN

        container = self.containers[name]
        success, output, _ = await self.run_on_node(
            container.node,
            f'docker inspect -f "{{{{.State.Status}}}}" {container.name}'
        )

        if success:
            status_map = {
                'running': ContainerStatus.RUNNING,
                'exited': ContainerStatus.STOPPED,
                'created': ContainerStatus.PENDING,
                'dead': ContainerStatus.FAILED
            }
            return status_map.get(output.lower(), ContainerStatus.UNKNOWN)

        return ContainerStatus.UNKNOWN

    async def apply_deployment(self, deployment: Deployment) -> bool:
        """Apply a deployment configuration"""
        logger.info(f"Applying deployment: {deployment.name} ({deployment.replicas} replicas)")

        self.deployments[deployment.name] = deployment

        # Create containers for replicas
        for i in range(deployment.replicas):
            container_name = f"{deployment.name}-{i}"

            # Skip if already exists and running
            if container_name in self.containers:
                status = await self.get_container_status(container_name)
                if status == ContainerStatus.RUNNING:
                    continue

            # Select node
            node = await self.select_node(deployment.node_selector)
            if not node:
                logger.error(f"No healthy nodes available for {container_name}")
                continue

            # Create container
            container = Container(
                name=container_name,
                image=deployment.image,
                node=node,
                ports=dict(deployment.ports),
                env=dict(deployment.env),
                volumes=list(deployment.volumes),
                labels={**deployment.labels, 'deployment': deployment.name},
                created_at=time.time()
            )

            self.containers[container_name] = container
            deployment.containers.append(container_name)

            # Pull and run
            await self.pull_image(node, deployment.image)
            await self.create_container(container)

        self.save_state()
        return True

    async def scale_deployment(self, name: str, replicas: int) -> bool:
        """Scale a deployment"""
        if name not in self.deployments:
            return False

        deployment = self.deployments[name]
        current = len(deployment.containers)

        if replicas > current:
            # Scale up
            for i in range(current, replicas):
                container_name = f"{name}-{i}"
                node = await self.select_node(deployment.node_selector)
                if not node:
                    continue

                container = Container(
                    name=container_name,
                    image=deployment.image,
                    node=node,
                    ports=dict(deployment.ports),
                    env=dict(deployment.env),
                    labels={**deployment.labels, 'deployment': name},
                    created_at=time.time()
                )

                self.containers[container_name] = container
                deployment.containers.append(container_name)

                await self.pull_image(node, deployment.image)
                await self.create_container(container)

        elif replicas < current:
            # Scale down
            for i in range(current - 1, replicas - 1, -1):
                container_name = f"{name}-{i}"
                if container_name in self.containers:
                    await self.delete_container(container_name)
                    if container_name in deployment.containers:
                        deployment.containers.remove(container_name)

        deployment.replicas = replicas
        self.save_state()
        return True

    async def rolling_update(self, name: str, new_image: str) -> bool:
        """Perform rolling update of deployment"""
        if name not in self.deployments:
            return False

        deployment = self.deployments[name]
        old_image = deployment.image
        deployment.image = new_image

        logger.info(f"Rolling update {name}: {old_image} -> {new_image}")

        # Update one at a time
        for container_name in list(deployment.containers):
            if container_name in self.containers:
                container = self.containers[container_name]
                node = container.node

                # Stop old container
                await self.stop_container(container_name)

                # Create new container with new image
                container.image = new_image
                await self.pull_image(node, new_image)
                await self.create_container(container)

                # Brief pause between updates
                await asyncio.sleep(2)

        self.save_state()
        return True

    async def check_node_health(self):
        """Check health of all nodes"""
        for node in NODES:
            try:
                success, _, _ = await self.run_on_node(node, 'docker info')
                self.node_health[node] = success
            except:
                self.node_health[node] = False

    async def reconciliation_loop(self):
        """Continuously reconcile desired vs actual state"""
        while True:
            await self.check_node_health()

            # Check each container
            for name, container in list(self.containers.items()):
                actual_status = await self.get_container_status(name)

                if actual_status != container.status:
                    logger.info(f"Container {name} status changed: {container.status} -> {actual_status}")
                    container.status = actual_status

                    # Auto-restart if policy allows
                    if actual_status == ContainerStatus.STOPPED:
                        if container.restart_policy == RestartPolicy.ALWAYS:
                            logger.info(f"Restarting container {name}")
                            container.restart_count += 1
                            await self.create_container(container)

            self.save_state()
            await asyncio.sleep(30)

    def get_status(self) -> dict:
        """Get cluster status"""
        return {
            'nodes': self.node_health,
            'containers': {
                name: {
                    'status': c.status.value,
                    'node': c.node,
                    'image': c.image,
                    'restarts': c.restart_count
                }
                for name, c in self.containers.items()
            },
            'deployments': {
                name: {
                    'replicas': d.replicas,
                    'containers': d.containers
                }
                for name, d in self.deployments.items()
            }
        }

    async def api_handler(self, reader, writer):
        """Handle HTTP API requests"""
        data = await reader.read(8192)
        request = data.decode()

        lines = request.split('\r\n')
        method, path, _ = lines[0].split(' ', 2)

        body = {}
        if '\r\n\r\n' in request:
            body_str = request.split('\r\n\r\n', 1)[1]
            if body_str:
                try:
                    body = json.loads(body_str)
                except:
                    pass

        response_body = ''
        status = '200 OK'

        if path == '/status' and method == 'GET':
            response_body = json.dumps(self.get_status(), indent=2)

        elif path == '/containers' and method == 'GET':
            containers = {n: asdict(c) for n, c in self.containers.items()}
            for c in containers.values():
                c['status'] = c['status'].value
                c['restart_policy'] = c['restart_policy'].value
            response_body = json.dumps(containers, indent=2)

        elif path == '/deployments' and method == 'GET':
            response_body = json.dumps({n: asdict(d) for n, d in self.deployments.items()}, indent=2)

        elif path == '/deploy' and method == 'POST':
            deployment = Deployment(
                name=body['name'],
                replicas=body.get('replicas', 1),
                image=body['image'],
                ports=body.get('ports', {}),
                env=body.get('env', {}),
                volumes=body.get('volumes', []),
                node_selector=body.get('node'),
                labels=body.get('labels', {})
            )
            asyncio.create_task(self.apply_deployment(deployment))
            response_body = json.dumps({'status': 'deploying', 'name': deployment.name})

        elif path.startswith('/scale/') and method == 'POST':
            name = path.split('/')[2]
            replicas = body.get('replicas', 1)
            asyncio.create_task(self.scale_deployment(name, replicas))
            response_body = json.dumps({'status': 'scaling', 'replicas': replicas})

        elif path.startswith('/delete/') and method == 'DELETE':
            name = path.split('/')[2]
            if name in self.containers:
                asyncio.create_task(self.delete_container(name))
                response_body = json.dumps({'status': 'deleting'})
            else:
                status = '404 Not Found'
                response_body = json.dumps({'error': 'Not found'})

        else:
            status = '404 Not Found'
            response_body = json.dumps({'error': 'Not found'})

        response = f"HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, port: int = 8100):
        """Run the orchestrator"""
        server = await asyncio.start_server(
            self.api_handler,
            '0.0.0.0',
            port
        )

        logger.info(f"Container Orchestrator listening on port {port}")

        async with server:
            await asyncio.gather(
                server.serve_forever(),
                self.reconciliation_loop()
            )

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8100

    orch = ContainerOrchestrator()
    asyncio.run(orch.run(port))
ORCH_EOF

chmod +x "$CONTAINER_DIR/orchestrator.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ MANIFEST PARSER - K8s-like YAML manifests                                  ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[2/3] Creating Manifest Parser...${NC}"

cat > "$CONTAINER_DIR/manifest_parser.py" << 'MANIFEST_EOF'
#!/usr/bin/env python3
"""
BlackRoad Manifest Parser - Parse K8s-like YAML manifests
"""

import yaml
import json
import sys
from pathlib import Path

def parse_manifest(content: str) -> dict:
    """Parse a YAML manifest"""
    docs = list(yaml.safe_load_all(content))
    return docs

def manifest_to_api(manifest: dict) -> dict:
    """Convert manifest to API request"""
    kind = manifest.get('kind', '').lower()
    spec = manifest.get('spec', {})
    metadata = manifest.get('metadata', {})

    if kind == 'deployment':
        return {
            'name': metadata.get('name'),
            'replicas': spec.get('replicas', 1),
            'image': spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('image'),
            'ports': {
                p['containerPort']: p.get('hostPort', p['containerPort'])
                for p in spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('ports', [])
            },
            'env': {
                e['name']: e['value']
                for e in spec.get('template', {}).get('spec', {}).get('containers', [{}])[0].get('env', [])
            },
            'labels': metadata.get('labels', {}),
            'node': spec.get('nodeSelector', {}).get('node')
        }

    elif kind == 'pod':
        container = spec.get('containers', [{}])[0]
        return {
            'name': metadata.get('name'),
            'image': container.get('image'),
            'ports': {
                p['containerPort']: p.get('hostPort', p['containerPort'])
                for p in container.get('ports', [])
            },
            'env': {e['name']: e['value'] for e in container.get('env', [])},
            'node': spec.get('nodeName')
        }

    return manifest

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: manifest_parser.py <manifest.yaml>")
        sys.exit(1)

    manifest_file = sys.argv[1]
    with open(manifest_file) as f:
        content = f.read()

    for doc in parse_manifest(content):
        api_request = manifest_to_api(doc)
        print(json.dumps(api_request, indent=2))
MANIFEST_EOF

chmod +x "$CONTAINER_DIR/manifest_parser.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ CLI TOOL                                                                    ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[3/3] Creating CLI...${NC}"

cat > "$HOME/br-containers" << 'CLI_EOF'
#!/bin/bash
# br-containers - Container orchestrator CLI (kubectl-like)
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
NC='\033[0m'

CONTAINER_DIR="$HOME/.blackroad/containers"
API_URL="http://localhost:8100"

cmd="${1:-help}"
shift 2>/dev/null

case "$cmd" in
    start)
        echo -e "${PINK}Starting Container Orchestrator...${NC}"
        nohup python3 "$CONTAINER_DIR/orchestrator.py" > "$CONTAINER_DIR/logs/orchestrator.log" 2>&1 &
        echo $! > "$CONTAINER_DIR/orchestrator.pid"
        echo -e "${GREEN}Orchestrator started (PID: $(cat "$CONTAINER_DIR/orchestrator.pid"))${NC}"
        echo "  API: $API_URL"
        ;;
    stop)
        if [ -f "$CONTAINER_DIR/orchestrator.pid" ]; then
            kill $(cat "$CONTAINER_DIR/orchestrator.pid") 2>/dev/null
            rm "$CONTAINER_DIR/orchestrator.pid"
            echo -e "${AMBER}Orchestrator stopped${NC}"
        fi
        ;;
    status)
        if [ -f "$CONTAINER_DIR/orchestrator.pid" ] && kill -0 $(cat "$CONTAINER_DIR/orchestrator.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} Orchestrator running"
            curl -s "$API_URL/status" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print()
print('Nodes:')
for node, healthy in data['nodes'].items():
    status = '●' if healthy else '○'
    color = '\\033[38;5;82m' if healthy else '\\033[38;5;196m'
    print(f'  {color}{status}\\033[0m {node}')
print()
print('Containers:')
for name, info in data['containers'].items():
    status_color = '\\033[38;5;82m' if info['status'] == 'running' else '\\033[38;5;214m'
    print(f'  {status_color}●\\033[0m {name} ({info[\"node\"]}) - {info[\"image\"]}')
"
        else
            echo -e "${RED}○${NC} Orchestrator not running"
        fi
        ;;
    get)
        resource="${1:-pods}"
        case "$resource" in
            pods|containers)
                curl -s "$API_URL/containers" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{\"NAME\":<30} {\"STATUS\":<12} {\"NODE\":<12} {\"IMAGE\":<30}')
for name, c in data.items():
    print(f'{name:<30} {c[\"status\"]:<12} {c[\"node\"]:<12} {c[\"image\"]:<30}')
"
                ;;
            deployments|deploy)
                curl -s "$API_URL/deployments" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{\"NAME\":<30} {\"REPLICAS\":<10} {\"IMAGE\":<40}')
for name, d in data.items():
    print(f'{name:<30} {d[\"replicas\"]:<10} {d[\"image\"]:<40}')
"
                ;;
            nodes)
                curl -s "$API_URL/status" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'{\"NAME\":<15} {\"STATUS\":<10}')
for node, healthy in data['nodes'].items():
    status = 'Ready' if healthy else 'NotReady'
    print(f'{node:<15} {status:<10}')
"
                ;;
        esac
        ;;
    apply)
        manifest="$1"
        if [ -z "$manifest" ]; then
            echo "Usage: br-containers apply <manifest.yaml>"
            exit 1
        fi

        if [ ! -f "$manifest" ]; then
            echo "File not found: $manifest"
            exit 1
        fi

        # Parse and apply manifest
        api_request=$(python3 "$CONTAINER_DIR/manifest_parser.py" "$manifest")
        curl -s -X POST "$API_URL/deploy" \
            -H "Content-Type: application/json" \
            -d "$api_request" | python3 -m json.tool
        ;;
    run)
        name="$1"; image="$2"
        if [ -z "$name" ] || [ -z "$image" ]; then
            echo "Usage: br-containers run <name> <image> [--port=8080:80] [--node=cecilia]"
            exit 1
        fi

        # Parse additional args
        ports="{}"
        node="null"
        env="{}"

        for arg in "${@:3}"; do
            case "$arg" in
                --port=*)
                    mapping="${arg#--port=}"
                    host="${mapping%:*}"
                    container="${mapping#*:}"
                    ports="{\"$container\": $host}"
                    ;;
                --node=*)
                    node="\"${arg#--node=}\""
                    ;;
                --env=*)
                    kv="${arg#--env=}"
                    key="${kv%=*}"
                    val="${kv#*=}"
                    env="{\"$key\": \"$val\"}"
                    ;;
            esac
        done

        curl -s -X POST "$API_URL/deploy" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$name\",\"image\":\"$image\",\"replicas\":1,\"ports\":$ports,\"node\":$node,\"env\":$env}" | python3 -m json.tool
        ;;
    scale)
        name="$1"; replicas="$2"
        if [ -z "$name" ] || [ -z "$replicas" ]; then
            echo "Usage: br-containers scale <deployment> <replicas>"
            exit 1
        fi
        curl -s -X POST "$API_URL/scale/$name" \
            -H "Content-Type: application/json" \
            -d "{\"replicas\":$replicas}" | python3 -m json.tool
        ;;
    delete)
        name="$1"
        if [ -z "$name" ]; then
            echo "Usage: br-containers delete <container>"
            exit 1
        fi
        curl -s -X DELETE "$API_URL/delete/$name" | python3 -m json.tool
        ;;
    logs)
        name="$1"
        if [ -z "$name" ]; then
            echo "Usage: br-containers logs <container>"
            exit 1
        fi
        # Get container node and fetch logs
        node=$(curl -s "$API_URL/containers" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if '$name' in data:
    print(data['$name']['node'])
")
        if [ -n "$node" ]; then
            ssh "$node" "docker logs $name --tail 100"
        else
            echo "Container not found: $name"
        fi
        ;;
    exec)
        name="$1"
        shift
        cmd="${*:-/bin/sh}"
        if [ -z "$name" ]; then
            echo "Usage: br-containers exec <container> [command]"
            exit 1
        fi
        node=$(curl -s "$API_URL/containers" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if '$name' in data:
    print(data['$name']['node'])
")
        if [ -n "$node" ]; then
            ssh -t "$node" "docker exec -it $name $cmd"
        fi
        ;;
    fleet-status)
        echo -e "${PINK}╭─ CONTAINER FLEET STATUS ──────────────────────────────────────────────────────╮${NC}"
        for host in cecilia lucidia octavia aria; do
            echo -e "${PINK}│${NC}  ${BLUE}$host:${NC}"
            ssh -o ConnectTimeout=3 "$host" 'docker ps --format "    {{.Names}}: {{.Image}} ({{.Status}})"' 2>/dev/null || echo "    (offline)"
        done
        echo -e "${PINK}╰────────────────────────────────────────────────────────────────────────────────╯${NC}"
        ;;
    help|*)
        echo -e "${PINK}br-containers - Container Orchestrator CLI${NC}"
        echo ""
        echo "Management:"
        echo "  start                     Start orchestrator"
        echo "  stop                      Stop orchestrator"
        echo "  status                    Show cluster status"
        echo ""
        echo "Resources:"
        echo "  get pods|deployments|nodes  List resources"
        echo "  apply <manifest.yaml>       Apply manifest"
        echo "  run <name> <image> [opts]   Run container"
        echo "  scale <deploy> <replicas>   Scale deployment"
        echo "  delete <container>          Delete container"
        echo ""
        echo "Operations:"
        echo "  logs <container>            View logs"
        echo "  exec <container> [cmd]      Execute command"
        echo "  fleet-status                Docker status on all nodes"
        ;;
esac
CLI_EOF

chmod +x "$HOME/br-containers"

# Create sample manifest
cat > "$CONTAINER_DIR/manifests/sample-deployment.yaml" << 'SAMPLE_EOF'
apiVersion: blackroad/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
spec:
  replicas: 2
  nodeSelector:
    node: cecilia
  template:
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
          hostPort: 8080
        env:
        - name: ENV
          value: production
SAMPLE_EOF

echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Container Orchestrator installed!${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${AMBER}Features:${NC}"
echo "  - K8s-like deployments and scaling"
echo "  - Rolling updates"
echo "  - Auto-restart and health checks"
echo "  - Fleet-wide container management"
echo "  - YAML manifest support"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-containers start"
echo "  ~/br-containers run nginx nginx:alpine --port=8080:80"
echo "  ~/br-containers get pods"
echo "  ~/br-containers scale nginx 3"
echo "  ~/br-containers fleet-status"
