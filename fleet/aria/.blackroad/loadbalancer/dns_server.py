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
