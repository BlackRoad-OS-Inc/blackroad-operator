"""Lineage logging for the QLM laboratory."""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict

from .policies import PolicyGuard


@dataclass
class LineageEvent:
    """Structure recorded for each lineage event."""

    kind: str
    payload: Dict[str, Any]


class LineageLogger:
    """Append-only JSONL lineage logger."""

    def __init__(self, policy: PolicyGuard) -> None:
        self.policy = policy
        self.path: Path = policy.config.lineage_path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, event: LineageEvent) -> None:
        data = asdict(event)
        line = json.dumps(data)
        encoded = line.encode("utf-8")
        self.policy.ensure_file_write_allowed(self.path, len(encoded))
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")
        self.policy.enforce_total_size()

    def log_tool_use(self, tool: str, args: Dict[str, Any], result: Any) -> None:
        self.append(LineageEvent(kind="tool", payload={"tool": tool, "args": args, "result": result}))

    def log_message(self, message: Dict[str, Any]) -> None:
        self.append(LineageEvent(kind="message", payload=message))

    def log_artifact(self, path: Path | str, description: str) -> None:
        path_obj = Path(path)
        self.append(LineageEvent(kind="artifact", payload={"path": str(path_obj), "description": description}))
