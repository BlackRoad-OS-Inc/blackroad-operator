#!/usr/bin/env python3
"""
BlackRoad Load Balancer - HAProxy-style Layer 7 load balancer
Features: Health checks, weighted routing, sticky sessions, rate limiting
"""

import asyncio
import json
import hashlib
import time
import logging
import socket
import ssl
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set
from pathlib import Path
from enum import Enum
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

LB_DIR = Path.home() / '.blackroad' / 'loadbalancer'
CONFIGS_DIR = LB_DIR / 'configs'

class BalanceMode(Enum):
    ROUND_ROBIN = "roundrobin"
    LEAST_CONN = "leastconn"
    SOURCE_IP = "source"  # Sticky by IP
    WEIGHTED = "weighted"
    RANDOM = "random"

@dataclass
class Backend:
    name: str
    host: str
    port: int
    weight: int = 1
    max_conn: int = 100
    healthy: bool = True
    active_conn: int = 0
    total_requests: int = 0
    total_errors: int = 0
    response_times: List[float] = field(default_factory=list)
    last_check: float = 0

    @property
    def avg_response_time(self) -> float:
        if not self.response_times:
            return 0
        return sum(self.response_times[-100:]) / len(self.response_times[-100:])

@dataclass
class Frontend:
    name: str
    bind_port: int
    default_backend: str
    mode: str = "http"  # http or tcp
    timeout_client: int = 30
    rate_limit: int = 0  # requests per second, 0 = unlimited

@dataclass
class BackendPool:
    name: str
    mode: BalanceMode = BalanceMode.ROUND_ROBIN
    backends: List[Backend] = field(default_factory=list)
    health_check_interval: int = 10
    health_check_path: str = "/health"
    current_index: int = 0

class LoadBalancer:
    def __init__(self, config_file: str = None):
        self.frontends: Dict[str, Frontend] = {}
        self.backend_pools: Dict[str, BackendPool] = {}
        self.sticky_sessions: Dict[str, str] = {}  # client_ip -> backend_name
        self.rate_limits: Dict[str, List[float]] = defaultdict(list)
        self.stats = {
            'total_requests': 0,
            'active_connections': 0,
            'total_errors': 0
        }

        if config_file:
            self.load_config(config_file)
        else:
            self._setup_defaults()

    def _setup_defaults(self):
        """Setup default BlackRoad services"""
        # Default backend pools
        self.backend_pools['api'] = BackendPool(
            name='api',
            mode=BalanceMode.ROUND_ROBIN,
            backends=[
                Backend('cecilia-api', 'cecilia', 8000, weight=3),
                Backend('lucidia-api', 'lucidia', 8000, weight=2),
                Backend('octavia-api', 'octavia', 8000, weight=1),
                Backend('aria-api', 'aria', 8000, weight=1),
            ]
        )

        self.backend_pools['ollama'] = BackendPool(
            name='ollama',
            mode=BalanceMode.LEAST_CONN,
            backends=[
                Backend('cecilia-ollama', 'cecilia', 11434, weight=3),
                Backend('lucidia-ollama', 'lucidia', 11434, weight=2),
            ],
            health_check_path='/api/tags'
        )

        self.backend_pools['mesh'] = BackendPool(
            name='mesh',
            mode=BalanceMode.WEIGHTED,
            backends=[
                Backend('cecilia-mesh', 'cecilia', 8765, weight=2),
                Backend('lucidia-mesh', 'lucidia', 8765, weight=2),
                Backend('octavia-mesh', 'octavia', 8765, weight=1),
            ]
        )

        # Default frontends
        self.frontends['http'] = Frontend('http', 8090, 'api')
        self.frontends['ollama'] = Frontend('ollama', 11435, 'ollama')

    def load_config(self, config_file: str):
        """Load configuration from JSON file"""
        with open(config_file) as f:
            config = json.load(f)

        for name, pool_config in config.get('backends', {}).items():
            backends = [Backend(**b) for b in pool_config.get('servers', [])]
            self.backend_pools[name] = BackendPool(
                name=name,
                mode=BalanceMode(pool_config.get('balance', 'roundrobin')),
                backends=backends,
                health_check_interval=pool_config.get('health_check', 10)
            )

        for name, fe_config in config.get('frontends', {}).items():
            self.frontends[name] = Frontend(
                name=name,
                bind_port=fe_config['bind'],
                default_backend=fe_config['backend'],
                rate_limit=fe_config.get('rate_limit', 0)
            )

    def select_backend(self, pool_name: str, client_ip: str = None) -> Optional[Backend]:
        """Select backend based on balancing algorithm"""
        pool = self.backend_pools.get(pool_name)
        if not pool:
            return None

        healthy = [b for b in pool.backends if b.healthy and b.active_conn < b.max_conn]
        if not healthy:
            return None

        if pool.mode == BalanceMode.ROUND_ROBIN:
            backend = healthy[pool.current_index % len(healthy)]
            pool.current_index += 1
            return backend

        elif pool.mode == BalanceMode.LEAST_CONN:
            return min(healthy, key=lambda b: b.active_conn)

        elif pool.mode == BalanceMode.SOURCE_IP and client_ip:
            # Sticky sessions based on IP hash
            if client_ip in self.sticky_sessions:
                sticky = self.sticky_sessions[client_ip]
                backend = next((b for b in healthy if b.name == sticky), None)
                if backend:
                    return backend

            # Hash-based selection for new clients
            idx = int(hashlib.md5(client_ip.encode()).hexdigest(), 16) % len(healthy)
            backend = healthy[idx]
            self.sticky_sessions[client_ip] = backend.name
            return backend

        elif pool.mode == BalanceMode.WEIGHTED:
            import random
            total_weight = sum(b.weight for b in healthy)
            r = random.randint(1, total_weight)
            for backend in healthy:
                r -= backend.weight
                if r <= 0:
                    return backend
            return healthy[0]

        else:  # RANDOM
            import random
            return random.choice(healthy)

    def check_rate_limit(self, frontend: Frontend, client_ip: str) -> bool:
        """Check if client is within rate limit"""
        if frontend.rate_limit == 0:
            return True

        now = time.time()
        # Clean old entries
        self.rate_limits[client_ip] = [t for t in self.rate_limits[client_ip] if now - t < 1.0]

        if len(self.rate_limits[client_ip]) >= frontend.rate_limit:
            return False

        self.rate_limits[client_ip].append(now)
        return True

    async def health_check(self, backend: Backend, path: str = "/health"):
        """Perform health check on backend"""
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(backend.host, backend.port),
                timeout=5.0
            )

            request = f"GET {path} HTTP/1.1\r\nHost: {backend.host}\r\nConnection: close\r\n\r\n"
            writer.write(request.encode())
            await writer.drain()

            response = await asyncio.wait_for(reader.read(1024), timeout=5.0)
            writer.close()
            await writer.wait_closed()

            if b"200" in response or b"OK" in response:
                backend.healthy = True
            else:
                backend.healthy = False

        except Exception as e:
            backend.healthy = False
            logger.warning(f"Health check failed for {backend.name}: {e}")

        backend.last_check = time.time()

    async def run_health_checks(self):
        """Continuously run health checks"""
        while True:
            for pool in self.backend_pools.values():
                for backend in pool.backends:
                    await self.health_check(backend, pool.health_check_path)
            await asyncio.sleep(10)

    async def proxy_connection(self, client_reader, client_writer, backend: Backend):
        """Proxy TCP connection to backend"""
        start_time = time.time()
        backend.active_conn += 1
        backend.total_requests += 1
        self.stats['active_connections'] += 1
        self.stats['total_requests'] += 1

        try:
            # Connect to backend
            backend_reader, backend_writer = await asyncio.wait_for(
                asyncio.open_connection(backend.host, backend.port),
                timeout=10.0
            )

            # Bidirectional proxy
            async def forward(reader, writer, direction):
                try:
                    while True:
                        data = await reader.read(8192)
                        if not data:
                            break
                        writer.write(data)
                        await writer.drain()
                except Exception:
                    pass
                finally:
                    try:
                        writer.close()
                    except:
                        pass

            await asyncio.gather(
                forward(client_reader, backend_writer, 'c2b'),
                forward(backend_reader, client_writer, 'b2c')
            )

            # Record response time
            response_time = time.time() - start_time
            backend.response_times.append(response_time)

        except Exception as e:
            backend.total_errors += 1
            self.stats['total_errors'] += 1
            logger.error(f"Proxy error to {backend.name}: {e}")
        finally:
            backend.active_conn -= 1
            self.stats['active_connections'] -= 1

    async def handle_client(self, reader, writer, frontend: Frontend):
        """Handle incoming client connection"""
        addr = writer.get_extra_info('peername')
        client_ip = addr[0] if addr else 'unknown'

        # Rate limiting
        if not self.check_rate_limit(frontend, client_ip):
            writer.write(b"HTTP/1.1 429 Too Many Requests\r\n\r\nRate limit exceeded")
            await writer.drain()
            writer.close()
            return

        # Select backend
        backend = self.select_backend(frontend.default_backend, client_ip)
        if not backend:
            writer.write(b"HTTP/1.1 503 Service Unavailable\r\n\r\nNo healthy backends")
            await writer.drain()
            writer.close()
            return

        logger.info(f"Routing {client_ip} -> {backend.name}")
        await self.proxy_connection(reader, writer, backend)

    async def start_frontend(self, frontend: Frontend):
        """Start a frontend listener"""
        async def client_handler(reader, writer):
            await self.handle_client(reader, writer, frontend)

        server = await asyncio.start_server(
            client_handler,
            '0.0.0.0',
            frontend.bind_port
        )

        logger.info(f"Frontend '{frontend.name}' listening on port {frontend.bind_port}")
        async with server:
            await server.serve_forever()

    def get_stats(self) -> dict:
        """Get load balancer statistics"""
        stats = dict(self.stats)
        stats['pools'] = {}

        for name, pool in self.backend_pools.items():
            stats['pools'][name] = {
                'mode': pool.mode.value,
                'backends': [{
                    'name': b.name,
                    'healthy': b.healthy,
                    'active_conn': b.active_conn,
                    'total_requests': b.total_requests,
                    'avg_response_time': round(b.avg_response_time * 1000, 2)  # ms
                } for b in pool.backends]
            }

        return stats

    async def stats_server(self):
        """HTTP endpoint for stats"""
        async def handle_stats(reader, writer):
            request = await reader.read(1024)

            stats = self.get_stats()
            body = json.dumps(stats, indent=2)

            response = f"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {len(body)}\r\n\r\n{body}"
            writer.write(response.encode())
            await writer.drain()
            writer.close()

        server = await asyncio.start_server(handle_stats, '0.0.0.0', 8091)
        logger.info("Stats server on port 8091")
        async with server:
            await server.serve_forever()

    async def run(self):
        """Run the load balancer"""
        tasks = [
            self.run_health_checks(),
            self.stats_server()
        ]

        for frontend in self.frontends.values():
            tasks.append(self.start_frontend(frontend))

        await asyncio.gather(*tasks)


if __name__ == '__main__':
    import sys

    config_file = sys.argv[1] if len(sys.argv) > 1 else None
    lb = LoadBalancer(config_file)

    print(f"Starting BlackRoad Load Balancer...")
    print(f"  Frontends: {list(lb.frontends.keys())}")
    print(f"  Backend pools: {list(lb.backend_pools.keys())}")

    asyncio.run(lb.run())
