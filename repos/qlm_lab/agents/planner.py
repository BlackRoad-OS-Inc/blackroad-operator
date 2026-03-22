"""Planning agent responsible for decomposing goals."""
from __future__ import annotations

from ..proto import Msg, new
from .base import Agent


class Planner(Agent):
    """Simple rule-based planner."""

    def can_handle(self, message: Msg) -> bool:
        return message.kind == "task" and message.op == "plan"

    def handle(self, message: Msg) -> list[Msg]:
        goal = message.args.get("goal", "")
        if goal == "demo_bell":
            return [
                new(self.name, "researcher", "task", "gather", topic="bell_chsh"),
                new(self.name, "qlm", "task", "solve_quantum", scenario="bell"),
            ]
        if goal == "demo_grover":
            return [
                new(self.name, "researcher", "task", "gather", topic="grover"),
                new(self.name, "qlm", "task", "solve_quantum", scenario="grover"),
            ]
        if goal == "demo_phase":
            return [
                new(self.name, "researcher", "task", "gather", topic="phase"),
                new(self.name, "qlm", "task", "solve_quantum", scenario="phase"),
            ]
        if goal == "demo_codegen":
            return [new(self.name, "coder", "task", "implement", target="pauli_expectation")]
        return [new(self.name, message.sender, "critique", "unknown_goal", goal=goal)]
