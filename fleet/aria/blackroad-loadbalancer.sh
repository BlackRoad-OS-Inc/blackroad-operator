#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# blackroad-loadbalancer.sh - HAProxy-style Load Balancer + DNS Manager
# Port 8090: Load Balancer | Port 5353: DNS Server
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${AMBER}   BLACKROAD LOAD BALANCER + DNS MANAGER${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

LB_DIR="$HOME/.blackroad/loadbalancer"
mkdir -p "$LB_DIR"/{configs,ssl,logs}

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ LOAD BALANCER - HAProxy-style with health checks                           ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "\n${GREEN}[1/3] Creating Load Balancer...${NC}"

cat > "$LB_DIR/loadbalancer.py" << 'LOADBALANCER_EOF'
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
LOADBALANCER_EOF

chmod +x "$LB_DIR/loadbalancer.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ DNS SERVER - Local DNS for .blackroad domain                               ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[2/3] Creating DNS Server...${NC}"

cat > "$LB_DIR/dns_server.py" << 'DNS_EOF'
#!/usr/bin/env python3
"""
BlackRoad DNS Server - Local DNS resolution for .blackroad domain
Supports A, AAAA, CNAME, SRV, and TXT records
"""

import asyncio
import struct
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logging.basicConfig(level=logging.INFO, format='%(asctime)s - DNS - %(message)s')
logger = logging.getLogger(__name__)

LB_DIR = Path.home() / '.blackroad' / 'loadbalancer'

# DNS record types
DNS_TYPES = {
    'A': 1,
    'AAAA': 28,
    'CNAME': 5,
    'MX': 15,
    'TXT': 16,
    'SRV': 33,
    'PTR': 12
}

@dataclass
class DNSRecord:
    name: str
    type: str
    value: str
    ttl: int = 300
    priority: int = 0  # For MX/SRV

class DNSServer:
    def __init__(self):
        self.records: Dict[str, List[DNSRecord]] = {}
        self._setup_default_records()

    def _setup_default_records(self):
        """Setup default BlackRoad DNS records"""
        # Node A records - using Tailscale IPs for mesh
        nodes = {
            'cecilia.blackroad': ['100.72.180.98', '192.168.4.89'],
            'lucidia.blackroad': ['100.83.149.86', '192.168.4.81'],
            'octavia.blackroad': ['100.66.235.47', '192.168.4.38'],
            'aria.blackroad': ['100.109.14.17', '192.168.4.82'],
            'alice.blackroad': ['100.77.210.18', '192.168.4.49'],
            'shellfish.blackroad': ['100.94.33.37', '174.138.44.45'],
        }

        for name, ips in nodes.items():
            self.records[name] = [DNSRecord(name, 'A', ip) for ip in ips]

        # Service records
        services = {
            'api.blackroad': 'cecilia.blackroad',
            'mesh.blackroad': 'cecilia.blackroad',
            'ollama.blackroad': 'cecilia.blackroad',
            'cache.blackroad': 'cecilia.blackroad',
            'gateway.blackroad': 'cecilia.blackroad',
        }

        for name, target in services.items():
            self.records[name] = [DNSRecord(name, 'CNAME', target)]

        # SRV records for service discovery
        srv_records = [
            DNSRecord('_api._tcp.blackroad', 'SRV', 'cecilia.blackroad', priority=10),
            DNSRecord('_api._tcp.blackroad', 'SRV', 'lucidia.blackroad', priority=20),
            DNSRecord('_ollama._tcp.blackroad', 'SRV', 'cecilia.blackroad', priority=10),
            DNSRecord('_mesh._tcp.blackroad', 'SRV', 'cecilia.blackroad', priority=10),
        ]

        for rec in srv_records:
            if rec.name not in self.records:
                self.records[rec.name] = []
            self.records[rec.name].append(rec)

        # TXT records for metadata
        self.records['blackroad'] = [
            DNSRecord('blackroad', 'TXT', 'v=blackroad1 fleet=5 services=api,mesh,ollama,cache')
        ]

    def add_record(self, name: str, type: str, value: str, ttl: int = 300):
        """Add a DNS record"""
        if name not in self.records:
            self.records[name] = []
        self.records[name].append(DNSRecord(name, type, value, ttl))

    def remove_record(self, name: str, type: str = None):
        """Remove DNS record(s)"""
        if name in self.records:
            if type:
                self.records[name] = [r for r in self.records[name] if r.type != type]
            else:
                del self.records[name]

    def lookup(self, name: str, qtype: str = 'A') -> List[DNSRecord]:
        """Lookup DNS records"""
        # Try exact match
        if name in self.records:
            matching = [r for r in self.records[name] if r.type == qtype]
            if matching:
                return matching

            # Handle CNAME -> A lookup
            cnames = [r for r in self.records[name] if r.type == 'CNAME']
            if cnames and qtype == 'A':
                return self.lookup(cnames[0].value, 'A')

        # Try wildcard
        parts = name.split('.')
        for i in range(len(parts)):
            wildcard = '*.' + '.'.join(parts[i+1:])
            if wildcard in self.records:
                return [r for r in self.records[wildcard] if r.type == qtype]

        return []

    def parse_dns_query(self, data: bytes) -> Tuple[int, str, int]:
        """Parse DNS query packet"""
        # Header: ID (2) + Flags (2) + Questions (2) + Answers (2) + Auth (2) + Add (2)
        if len(data) < 12:
            return 0, "", 0

        query_id = struct.unpack('>H', data[0:2])[0]

        # Parse question
        offset = 12
        labels = []
        while offset < len(data):
            length = data[offset]
            if length == 0:
                offset += 1
                break
            labels.append(data[offset+1:offset+1+length].decode())
            offset += length + 1

        name = '.'.join(labels)
        qtype = struct.unpack('>H', data[offset:offset+2])[0]

        return query_id, name, qtype

    def build_dns_response(self, query_id: int, name: str, qtype: int, records: List[DNSRecord]) -> bytes:
        """Build DNS response packet"""
        # Header
        flags = 0x8180  # Response, Authoritative
        response = struct.pack('>HHHHHH',
            query_id,
            flags,
            1,  # Questions
            len(records),  # Answers
            0,  # Authority
            0   # Additional
        )

        # Question section (copy from query)
        for label in name.split('.'):
            response += bytes([len(label)]) + label.encode()
        response += b'\x00'
        response += struct.pack('>HH', qtype, 1)  # Type, Class

        # Answer section
        for record in records:
            # Name pointer to question
            response += struct.pack('>H', 0xc00c)

            rtype = DNS_TYPES.get(record.type, 1)
            response += struct.pack('>HHI', rtype, 1, record.ttl)

            if record.type == 'A':
                parts = [int(p) for p in record.value.split('.')]
                rdata = bytes(parts)
            elif record.type == 'CNAME' or record.type == 'PTR':
                rdata = b''
                for label in record.value.split('.'):
                    rdata += bytes([len(label)]) + label.encode()
                rdata += b'\x00'
            elif record.type == 'TXT':
                rdata = bytes([len(record.value)]) + record.value.encode()
            elif record.type == 'SRV':
                # Priority, Weight, Port, Target
                rdata = struct.pack('>HHH', record.priority, 1, 8000)
                for label in record.value.split('.'):
                    rdata += bytes([len(label)]) + label.encode()
                rdata += b'\x00'
            else:
                rdata = b''

            response += struct.pack('>H', len(rdata)) + rdata

        return response

    async def handle_query(self, data: bytes, addr, transport):
        """Handle incoming DNS query"""
        query_id, name, qtype = self.parse_dns_query(data)

        qtype_name = {v: k for k, v in DNS_TYPES.items()}.get(qtype, 'A')
        logger.info(f"Query: {name} ({qtype_name}) from {addr[0]}")

        records = self.lookup(name, qtype_name)

        if records:
            response = self.build_dns_response(query_id, name, qtype, records)
            transport.sendto(response, addr)
            logger.info(f"  -> {len(records)} records")
        else:
            # NXDOMAIN response
            flags = 0x8183  # Response, NXDOMAIN
            response = struct.pack('>HHHHHH', query_id, flags, 1, 0, 0, 0)
            # Copy question
            for label in name.split('.'):
                response += bytes([len(label)]) + label.encode()
            response += b'\x00'
            response += struct.pack('>HH', qtype, 1)
            transport.sendto(response, addr)
            logger.info(f"  -> NXDOMAIN")

class DNSProtocol(asyncio.DatagramProtocol):
    def __init__(self, server: DNSServer):
        self.server = server
        self.transport = None

    def connection_made(self, transport):
        self.transport = transport

    def datagram_received(self, data, addr):
        asyncio.create_task(self.server.handle_query(data, addr, self.transport))

async def run_dns_server(port: int = 5353):
    """Run the DNS server"""
    server = DNSServer()

    loop = asyncio.get_event_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: DNSProtocol(server),
        local_addr=('0.0.0.0', port)
    )

    logger.info(f"DNS Server listening on port {port}")
    logger.info(f"  Records: {len(server.records)} domains")

    try:
        await asyncio.sleep(float('inf'))
    finally:
        transport.close()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5353
    asyncio.run(run_dns_server(port))
DNS_EOF

chmod +x "$LB_DIR/dns_server.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ SERVICE REGISTRY - Dynamic service discovery                               ║
# ╚════════════════════════════════════════════════════════════════════════════╝
echo -e "${GREEN}[3/3] Creating Service Registry...${NC}"

cat > "$LB_DIR/service_registry.py" << 'REGISTRY_EOF'
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
REGISTRY_EOF

chmod +x "$LB_DIR/service_registry.py"

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║ CLI TOOLS                                                                   ║
# ╚════════════════════════════════════════════════════════════════════════════╝

# br-lb - Load Balancer CLI
cat > "$HOME/br-lb" << 'LB_CLI_EOF'
#!/bin/bash
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

LB_DIR="$HOME/.blackroad/loadbalancer"

cmd="${1:-help}"
shift 2>/dev/null

case "$cmd" in
    start)
        echo -e "${PINK}Starting Load Balancer...${NC}"
        nohup python3 "$LB_DIR/loadbalancer.py" > "$LB_DIR/logs/lb.log" 2>&1 &
        echo $! > "$LB_DIR/lb.pid"
        echo -e "${GREEN}Load Balancer started (PID: $(cat "$LB_DIR/lb.pid"))${NC}"
        echo "  Main: http://localhost:8090"
        echo "  Stats: http://localhost:8091"
        ;;
    stop)
        if [ -f "$LB_DIR/lb.pid" ]; then
            kill $(cat "$LB_DIR/lb.pid") 2>/dev/null
            rm "$LB_DIR/lb.pid"
            echo -e "${AMBER}Load Balancer stopped${NC}"
        else
            echo "Load Balancer not running"
        fi
        ;;
    status)
        if [ -f "$LB_DIR/lb.pid" ] && kill -0 $(cat "$LB_DIR/lb.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} Load Balancer running (PID: $(cat "$LB_DIR/lb.pid"))"
            curl -s http://localhost:8091 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "  (stats unavailable)"
        else
            echo -e "${AMBER}○${NC} Load Balancer not running"
        fi
        ;;
    stats)
        curl -s http://localhost:8091 | python3 -m json.tool
        ;;
    pools)
        curl -s http://localhost:8091 | python3 -c "
import sys, json
data = json.load(sys.stdin)
for name, pool in data.get('pools', {}).items():
    print(f\"\\n{name} ({pool['mode']}):\")
    for b in pool['backends']:
        status = '●' if b['healthy'] else '○'
        print(f\"  {status} {b['name']}: {b['active_conn']} conn, {b['total_requests']} req, {b['avg_response_time']}ms\")
"
        ;;
    help|*)
        echo -e "${PINK}br-lb - Load Balancer Control${NC}"
        echo ""
        echo "Commands:"
        echo "  start       Start load balancer"
        echo "  stop        Stop load balancer"
        echo "  status      Show status and stats"
        echo "  stats       Detailed JSON stats"
        echo "  pools       Show backend pools"
        ;;
esac
LB_CLI_EOF

# br-dns - DNS Server CLI
cat > "$HOME/br-dns" << 'DNS_CLI_EOF'
#!/bin/bash
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
NC='\033[0m'

LB_DIR="$HOME/.blackroad/loadbalancer"

cmd="${1:-help}"
shift 2>/dev/null

case "$cmd" in
    start)
        echo -e "${PINK}Starting DNS Server...${NC}"
        nohup python3 "$LB_DIR/dns_server.py" > "$LB_DIR/logs/dns.log" 2>&1 &
        echo $! > "$LB_DIR/dns.pid"
        echo -e "${GREEN}DNS Server started (PID: $(cat "$LB_DIR/dns.pid"))${NC}"
        echo "  Listening: udp://localhost:5353"
        ;;
    stop)
        if [ -f "$LB_DIR/dns.pid" ]; then
            kill $(cat "$LB_DIR/dns.pid") 2>/dev/null
            rm "$LB_DIR/dns.pid"
            echo -e "${AMBER}DNS Server stopped${NC}"
        fi
        ;;
    status)
        if [ -f "$LB_DIR/dns.pid" ] && kill -0 $(cat "$LB_DIR/dns.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} DNS Server running (PID: $(cat "$LB_DIR/dns.pid"))"
        else
            echo -e "${AMBER}○${NC} DNS Server not running"
        fi
        ;;
    lookup)
        name="$1"
        if [ -z "$name" ]; then
            echo "Usage: br-dns lookup <name>"
            exit 1
        fi
        dig @localhost -p 5353 "$name" +short 2>/dev/null || \
            echo "DNS server not responding"
        ;;
    help|*)
        echo -e "${PINK}br-dns - DNS Server Control${NC}"
        echo ""
        echo "Commands:"
        echo "  start           Start DNS server"
        echo "  stop            Stop DNS server"
        echo "  status          Show status"
        echo "  lookup <name>   Lookup domain"
        ;;
esac
DNS_CLI_EOF

# br-registry - Service Registry CLI
cat > "$HOME/br-registry" << 'REG_CLI_EOF'
#!/bin/bash
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
NC='\033[0m'

LB_DIR="$HOME/.blackroad/loadbalancer"
REGISTRY_URL="http://localhost:8500"

cmd="${1:-help}"
shift 2>/dev/null

case "$cmd" in
    start)
        echo -e "${PINK}Starting Service Registry...${NC}"
        nohup python3 "$LB_DIR/service_registry.py" > "$LB_DIR/logs/registry.log" 2>&1 &
        echo $! > "$LB_DIR/registry.pid"
        echo -e "${GREEN}Service Registry started (PID: $(cat "$LB_DIR/registry.pid"))${NC}"
        echo "  API: $REGISTRY_URL"
        ;;
    stop)
        if [ -f "$LB_DIR/registry.pid" ]; then
            kill $(cat "$LB_DIR/registry.pid") 2>/dev/null
            rm "$LB_DIR/registry.pid"
            echo -e "${AMBER}Service Registry stopped${NC}"
        fi
        ;;
    status)
        if [ -f "$LB_DIR/registry.pid" ] && kill -0 $(cat "$LB_DIR/registry.pid") 2>/dev/null; then
            echo -e "${GREEN}●${NC} Service Registry running"
            curl -s "$REGISTRY_URL/services" | python3 -m json.tool
        else
            echo -e "${AMBER}○${NC} Service Registry not running"
        fi
        ;;
    list)
        curl -s "$REGISTRY_URL/services" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for name, count in data.items():
    print(f'  {name}: {count} instances')
"
        ;;
    discover)
        service="$1"
        if [ -z "$service" ]; then
            echo "Usage: br-registry discover <service>"
            exit 1
        fi
        curl -s "$REGISTRY_URL/service/$service" | python3 -m json.tool
        ;;
    register)
        name="$1"; host="$2"; port="$3"
        if [ -z "$name" ] || [ -z "$host" ] || [ -z "$port" ]; then
            echo "Usage: br-registry register <name> <host> <port>"
            exit 1
        fi
        curl -s -X POST "$REGISTRY_URL/register" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$name\",\"host\":\"$host\",\"port\":$port}"
        ;;
    help|*)
        echo -e "${PINK}br-registry - Service Registry Control${NC}"
        echo ""
        echo "Commands:"
        echo "  start                      Start registry"
        echo "  stop                       Stop registry"
        echo "  status                     Show status"
        echo "  list                       List all services"
        echo "  discover <service>         Discover instances"
        echo "  register <name> <host> <port>  Register service"
        ;;
esac
REG_CLI_EOF

chmod +x "$HOME/br-lb" "$HOME/br-dns" "$HOME/br-registry"

echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Load Balancer + DNS + Registry installed!${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${AMBER}Components:${NC}"
echo "  Load Balancer (port 8090/8091)  - HAProxy-style L7 balancing"
echo "  DNS Server (port 5353)          - Local .blackroad domain"
echo "  Service Registry (port 8500)    - Dynamic discovery"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-lb start       # Start load balancer"
echo "  ~/br-dns start      # Start DNS server"
echo "  ~/br-registry start # Start service registry"
