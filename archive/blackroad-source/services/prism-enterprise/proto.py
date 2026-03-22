from dataclasses import dataclass, field
from typing import Any, Dict
import time, uuid


@dataclass
class Msg:
    id: str
    sender: str
    recipient: str
    kind: str      # "task" | "tool" | "result" | "critique" | "log"
    op: str        # semantic op ("plan", "solve", "run_tool", ...)
    args: Dict[str, Any] = field(default_factory=dict)
    ts: float = field(default_factory=time.time)


def new(sender: str, recipient: str, kind: str, op: str, **args) -> Msg:
    return Msg(id=str(uuid.uuid4()), sender=sender, recipient=recipient, kind=kind, op=op, args=args)
