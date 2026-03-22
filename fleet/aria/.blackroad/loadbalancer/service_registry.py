#!/usr/bin/env python3
"""
BlackRoad Service Registry - Dynamic service discovery and registration
"""

import asyncio
import json
import time
import logging
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - Registry - %(message)s')
logger = logging.getLogger(__name__)

LB_DIR = Path.home() / '.blackroad' / 'loadbalancer'
REGISTRY_FILE = LB_DIR / 'registry.json'

@dataclass
class ServiceInstance:
    id: str
    name: str
    host: str
    port: int
    tags: List[str]
    metadata: Dict
    registered_at: float
    last_heartbeat: float
    healthy: bool = True

class ServiceRegistry:
    def __init__(self):
        self.services: Dict[str, Dict[str, ServiceInstance]] = {}
        self.heartbeat_ttl = 30  # seconds
        self.load()

    def load(self):
        """Load registry from disk"""
        if REGISTRY_FILE.exists():
            try:
                with open(REGISTRY_FILE) as f:
                    data = json.load(f)
                for name, instances in data.items():
                    self.services[name] = {}
                    for inst_id, inst_data in instances.items():
                        self.services[name][inst_id] = ServiceInstance(**inst_data)
            except Exception as e:
                logger.error(f"Failed to load registry: {e}")

    def save(self):
        """Save registry to disk"""
        data = {}
        for name, instances in self.services.items():
            data[name] = {inst_id: asdict(inst) for inst_id, inst in instances.items()}

        with open(REGISTRY_FILE, 'w') as f:
            json.dump(data, f, indent=2)

    def register(self, name: str, host: str, port: int,
                 tags: List[str] = None, metadata: Dict = None) -> str:
        """Register a service instance"""
        inst_id = f"{name}-{host}-{port}"
        now = time.time()

        if name not in self.services:
            self.services[name] = {}

        self.services[name][inst_id] = ServiceInstance(
            id=inst_id,
            name=name,
            host=host,
            port=port,
            tags=tags or [],
            metadata=metadata or {},
            registered_at=now,
            last_heartbeat=now
        )

        logger.info(f"Registered: {inst_id}")
        self.save()
        return inst_id

    def deregister(self, inst_id: str) -> bool:
        """Deregister a service instance"""
        for name, instances in self.services.items():
            if inst_id in instances:
                del instances[inst_id]
                logger.info(f"Deregistered: {inst_id}")
                self.save()
                return True
        return False

    def heartbeat(self, inst_id: str) -> bool:
        """Update heartbeat for service instance"""
        for name, instances in self.services.items():
            if inst_id in instances:
                instances[inst_id].last_heartbeat = time.time()
                instances[inst_id].healthy = True
                return True
        return False

    def discover(self, name: str, tag: str = None, healthy_only: bool = True) -> List[ServiceInstance]:
        """Discover service instances"""
        if name not in self.services:
            return []

        instances = list(self.services[name].values())

        if healthy_only:
            instances = [i for i in instances if i.healthy]

        if tag:
            instances = [i for i in instances if tag in i.tags]

        return instances

    def list_services(self) -> Dict[str, int]:
        """List all services with instance counts"""
        return {name: len(instances) for name, instances in self.services.items()}

    async def health_check_loop(self):
        """Continuously check service health"""
        while True:
            now = time.time()
            for name, instances in self.services.items():
                for inst_id, instance in list(instances.items()):
                    if now - instance.last_heartbeat > self.heartbeat_ttl:
                        instance.healthy = False
                        logger.warning(f"Unhealthy: {inst_id} (no heartbeat)")

            await asyncio.sleep(10)

    async def handle_request(self, reader, writer):
        """Handle HTTP API request"""
        data = await reader.read(4096)
        request = data.decode()

        lines = request.split('\r\n')
        method, path, _ = lines[0].split(' ', 2)

        # Parse body for POST/PUT
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

        if path == '/services' and method == 'GET':
            response_body = json.dumps(self.list_services())

        elif path.startswith('/service/') and method == 'GET':
            name = path.split('/')[2]
            instances = self.discover(name)
            response_body = json.dumps([asdict(i) for i in instances])

        elif path == '/register' and method == 'POST':
            inst_id = self.register(
                name=body['name'],
                host=body['host'],
                port=body['port'],
                tags=body.get('tags', []),
                metadata=body.get('metadata', {})
            )
            response_body = json.dumps({'id': inst_id})

        elif path.startswith('/deregister/') and method == 'DELETE':
            inst_id = path.split('/')[2]
            success = self.deregister(inst_id)
            response_body = json.dumps({'success': success})

        elif path.startswith('/heartbeat/') and method == 'PUT':
            inst_id = path.split('/')[2]
            success = self.heartbeat(inst_id)
            response_body = json.dumps({'success': success})

        else:
            status = '404 Not Found'
            response_body = json.dumps({'error': 'Not found'})

        response = f"HTTP/1.1 {status}\r\nContent-Type: application/json\r\nContent-Length: {len(response_body)}\r\n\r\n{response_body}"
        writer.write(response.encode())
        await writer.drain()
        writer.close()

    async def run(self, port: int = 8500):
        """Run the registry server"""
        server = await asyncio.start_server(
            self.handle_request,
            '0.0.0.0',
            port
        )

        logger.info(f"Service Registry listening on port {port}")

        async with server:
            await asyncio.gather(
                server.serve_forever(),
                self.health_check_loop()
            )

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8500

    registry = ServiceRegistry()
    asyncio.run(registry.run(port))
