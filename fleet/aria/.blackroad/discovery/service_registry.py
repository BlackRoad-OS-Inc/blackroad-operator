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
