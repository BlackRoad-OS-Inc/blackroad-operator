"""Researcher agent fetching pedagogical notes."""
from __future__ import annotations

from pathlib import Path
from ..proto import Msg, new
from .base import Agent


class Researcher(Agent):
    notes_dir = Path("qlm_lab/pedagogy")

    def can_handle(self, message: Msg) -> bool:
        return message.kind == "task" and message.op == "gather"

    def handle(self, message: Msg) -> list[Msg]:
        topic = message.args.get("topic", "")
        path = self.notes_dir / f"{topic}.md"
        if path.exists():
            content = path.read_text(encoding="utf-8")
            return [new(self.name, "qlm", "result", "context", topic=topic, content=content)]
        return [new(self.name, message.sender, "critique", "missing_topic", topic=topic)]
