#!/usr/bin/env python3
"""
BlackRoad Foundation — Agent Communication Protocol
Python reference implementation of RFC-0002: Agent Message Format
"""
import hashlib
import json
import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Any, Literal, Optional

MessageType = Literal["request", "response", "event", "broadcast", "error"]


@dataclass
class AgentMessage:
    """RFC-0002 compliant agent message."""
    from_agent: str          # e.g. "agent/alice-001"
    to_agent: str            # e.g. "agent/octavia-001" or "broadcast"
    type: MessageType
    topic: str               # e.g. "tasks.assign", "memory.store"
    payload: dict = field(default_factory=dict)
    reply_to: Optional[str] = None
    ttl: int = 300           # seconds

    id: str = field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:12]}")
    version: str = "1.0"
    timestamp: str = field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    signature: Optional[str] = None

    def sign(self, secret: str = "GENESIS") -> "AgentMessage":
        """Compute message signature for integrity."""
        content = f"{self.id}:{self.from_agent}:{self.to_agent}:{json.dumps(self.payload, sort_keys=True)}"
        self.signature = hashlib.sha256(f"{secret}:{content}".encode()).hexdigest()
        return self

    def verify(self, secret: str = "GENESIS") -> bool:
        """Verify message signature."""
        content = f"{self.id}:{self.from_agent}:{self.to_agent}:{json.dumps(self.payload, sort_keys=True)}"
        expected = hashlib.sha256(f"{secret}:{content}".encode()).hexdigest()
        return self.signature == expected

    def to_json(self) -> str:
        d = asdict(self)
        d["from"] = d.pop("from_agent")
        d["to"] = d.pop("to_agent")
        return json.dumps(d, indent=2)

    @classmethod
    def from_json(cls, raw: str) -> "AgentMessage":
        d = json.loads(raw)
        d["from_agent"] = d.pop("from")
        d["to_agent"] = d.pop("to")
        return cls(**{k: v for k, v in d.items() if k in cls.__dataclass_fields__})


class MessageBus:
    """In-process agent message bus (reference implementation)."""

    def __init__(self):
        self._subscribers: dict[str, list] = {}
        self._log: list[AgentMessage] = []

    def subscribe(self, topic: str, handler) -> None:
        self._subscribers.setdefault(topic, []).append(handler)

    def publish(self, msg: AgentMessage) -> int:
        """Publish message to all subscribers. Returns delivery count."""
        self._log.append(msg)
        handlers = self._subscribers.get(msg.topic, [])
        if msg.to_agent == "broadcast":
            for topic_handlers in self._subscribers.values():
                for h in topic_handlers:
                    h(msg)
            return sum(len(v) for v in self._subscribers.values())
        for h in handlers:
            h(msg)
        return len(handlers)

    def history(self, topic: str = None, limit: int = 50) -> list[AgentMessage]:
        msgs = self._log if topic is None else [m for m in self._log if m.topic == topic]
        return msgs[-limit:]


if __name__ == "__main__":
    bus = MessageBus()
    received = []
    bus.subscribe("tasks.assign", lambda m: received.append(m))

    msg = AgentMessage(
        from_agent="agent/alice-001",
        to_agent="agent/octavia-001",
        type="request",
        topic="tasks.assign",
        payload={"task": "deploy blackroad-api", "env": "production"},
    ).sign()

    assert msg.verify(), "Signature mismatch!"
    bus.publish(msg)

    print("✅ RFC-0002 reference implementation OK")
    print(f"   Message ID: {msg.id}")
    print(f"   Signature: {msg.signature[:16]}...")
    print(f"   Delivered to {len(received)} handler(s)")
    print()
    print(msg.to_json()[:300])

