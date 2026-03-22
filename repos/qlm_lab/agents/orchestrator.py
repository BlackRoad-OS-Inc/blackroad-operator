"""Orchestrator agent gluing the system together."""
from __future__ import annotations

from ..proto import Msg, new
from .base import Agent


class OrchestratorAgent(Agent):
    def can_handle(self, message: Msg) -> bool:
        return message.kind == "task" and message.op == "orchestrate"

    def handle(self, message: Msg) -> list[Msg]:
        goal = message.args.get("goal")
        return [new(self.name, "planner", "task", "plan", goal=goal)]
