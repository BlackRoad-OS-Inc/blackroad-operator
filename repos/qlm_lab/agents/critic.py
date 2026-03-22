"""Critic agent checking acceptance criteria."""
from __future__ import annotations

from pathlib import Path
from ..proto import Msg, new
from .base import Agent


class Critic(Agent):
    def __init__(self, name, bus, lineage) -> None:
        super().__init__(name, bus)
        self.lineage = lineage
        self.reports: list[str] = []

    def can_handle(self, message: Msg) -> bool:
        return message.kind == "result"

    def handle(self, message: Msg) -> list[Msg]:
        if message.op == "analysis":
            self.reports.append(message.args.get("text", ""))
            for artifact in message.args.get("artifacts", []):
                self.lineage.log_artifact(path=Path(artifact), description="agent_artifact")
            return [new(self.name, "archivist", "result", "report", reports=list(self.reports))]
        if message.op == "codegen":
            if message.args.get("returncode") != 0:
                return [new(self.name, message.sender, "critique", "tests_failed", stderr=message.args.get("stderr"))]
            self.reports.append("Codegen tests passed")
            return [new(self.name, "archivist", "result", "report", reports=list(self.reports))]
        return []
