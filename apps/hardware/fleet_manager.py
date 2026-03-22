"""BlackRoad Hardware Fleet Manager — Raspberry Pi node orchestration."""
from __future__ import annotations
import re
import json
import hashlib
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from typing import Optional


def _utcnow_iso() -> str:
    """Return current UTC time as an ISO 8601 string ending in 'Z'."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@dataclass
class PiNode:
    node_id: str
    ip: str
    role: str  # primary | secondary | relay | failover | edge
    user: str = "pi"
    port: int = 22
    status_port: int = 8182
    agent_capacity: int = 0
    model: str = "unknown"
    
    def __post_init__(self):
        if not re.match(r'^\d{1,3}(\.\d{1,3}){3}$', self.ip):
            raise ValueError(f"Invalid IP address: {self.ip}")
        if any(int(o) > 255 for o in self.ip.split('.')):
            raise ValueError(f"Invalid IP address: {self.ip}")
        if self.role not in {"primary", "secondary", "relay", "failover", "edge"}:
            raise ValueError(f"Invalid role: {self.role}")

    def status_url(self) -> str:
        return f"http://{self.ip}:{self.status_port}/status"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class FleetRegistry:
    version: str = "1.0"
    nodes: list[PiNode] = field(default_factory=list)
    
    def add_node(self, node: PiNode) -> None:
        if self.get_node(node.node_id) is not None:
            raise ValueError(f"Node already registered: {node.node_id}")
        self.nodes.append(node)
    
    def get_node(self, node_id: str) -> Optional[PiNode]:
        return next((n for n in self.nodes if n.node_id == node_id), None)
    
    def remove_node(self, node_id: str) -> None:
        node = self.get_node(node_id)
        if node is None:
            raise KeyError(f"Node not found: {node_id}")
        self.nodes.remove(node)
    
    def total_capacity(self) -> int:
        return sum(n.agent_capacity for n in self.nodes)
    
    def primary_nodes(self) -> list[PiNode]:
        return [n for n in self.nodes if n.role == "primary"]
    
    def to_json(self) -> str:
        return json.dumps({
            "version": self.version,
            "nodes": [n.to_dict() for n in self.nodes],
            "total_capacity": self.total_capacity(),
            "generated_at": _utcnow_iso()
        }, indent=2)


@dataclass 
class SensorReading:
    device_id: str
    cpu_pct: float
    ram_free_gb: float
    disk_free_gb: float
    timestamp: str = field(default_factory=_utcnow_iso)
    temperature_c: Optional[float] = None
    worlds_generated: int = 0
    
    def __post_init__(self):
        if not 0 <= self.cpu_pct <= 100:
            raise ValueError(f"CPU percentage out of range: {self.cpu_pct}")
        if self.ram_free_gb < 0:
            raise ValueError(f"RAM free cannot be negative: {self.ram_free_gb}")

    def is_healthy(self) -> bool:
        return (
            self.cpu_pct < 95 and
            self.ram_free_gb > 0.1 and
            self.disk_free_gb > 0.5
        )


# Default fleet configuration
DEFAULT_FLEET = FleetRegistry(version="1.0")
DEFAULT_FLEET.add_node(PiNode(
    node_id="aria64", ip="192.168.4.38", role="primary",
    user="alexa", status_port=8182, agent_capacity=22500, model="qwen2.5:3b"
))
DEFAULT_FLEET.add_node(PiNode(
    node_id="alice", ip="192.168.4.49", role="secondary",
    user="blackroad", status_port=8183, agent_capacity=7500, model="relay→aria64"
))
