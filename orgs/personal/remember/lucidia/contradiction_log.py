"""Contradiction log for Lucidia.

This module provides a basic interface to record instances where the system's response
contradicts prior outputs or expected truths. Each log entry includes a timestamp,
the user prompt, and the assistant's reply.
The intent is to build a transparent record for later analysis.
"""

from __future__ import annotations
import json
import time
from dataclasses import dataclass, asdict
from typing import List


@dataclass
class ContradictionEntry:
    timestamp: float
    prompt: str
    reply: str


class ContradictionLog:
    def __init__(self, path: str = "contradiction_log.jsonl") -> None:
        self.path = path

    def append(self, prompt: str, reply: str) -> None:
        entry = ContradictionEntry(time.time(), prompt, reply)
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(entry)) + "\n")

    def read_all(self) -> List[ContradictionEntry]:
        entries: List[ContradictionEntry] = []
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                for line in f:
                    data = json.loads(line.strip())
                    entries.append(ContradictionEntry(**data))
        except FileNotFoundError:
            pass
        return entries


if __name__ == "__main__":
    # Example usage:
    log = ContradictionLog()
    log.append("Example prompt", "Example contradictory reply")
    for e in log.read_all():
        print(e)
