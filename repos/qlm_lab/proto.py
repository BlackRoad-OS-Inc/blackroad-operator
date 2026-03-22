"""Message protocol shared by all agents."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict
import time
import uuid


@dataclass
class Msg:
    """Structured message exchanged between agents."""

    id: str
    sender: str
    recipient: str
    kind: str
    op: str
    args: Dict[str, Any] = field(default_factory=dict)
    ts: float = field(default_factory=time.time)


def new(sender: str, recipient: str, kind: str, op: str, **args: Any) -> Msg:
    """Create a new :class:`Msg` instance with a generated identifier."""

    return Msg(id=str(uuid.uuid4()), sender=sender, recipient=recipient, kind=kind, op=op, args=args)
