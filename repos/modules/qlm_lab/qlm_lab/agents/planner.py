"""Simple planner that primes the QLM workflow."""
from __future__ import annotations

from typing import List

from ..proto import Msg, new
from .base import Agent


class Planner(Agent):
    """Dispatch goal-oriented quantum tasks to the QLM."""

    name = "planner"

    def can_handle(self, m: Msg) -> bool:
        return m.recipient == self.name and m.kind == "task"

    def handle(self, m: Msg) -> List[Msg]:
        goal = m.args.get("goal", "")
        plans = [
            new(
                self.name,
                "qlm",
                "task",
                "prove_chsh",
                goal=goal,
                plan="prove_chsh",
            ),
            new(
                self.name,
                "qlm",
                "task",
                "solve_quantum",
                goal=goal,
                plan="make_bell_hist",
            ),
        ]
        logs = [
            new(
                self.name,
                "archivist",
                "log",
                "plan_step",
                goal=goal,
                step="prove_chsh",
            ),
            new(
                self.name,
                "archivist",
                "log",
                "plan_step",
                goal=goal,
                step="make_bell_hist",
            ),
            new(
                self.name,
                "archivist",
                "log",
                "plan",
                goal=goal,
                steps=["prove_chsh", "make_bell_hist"],
            ),
        ]
        return plans + logs
