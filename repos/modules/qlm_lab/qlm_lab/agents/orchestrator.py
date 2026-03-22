"""Orchestrator wiring planner, quantum, and critic agents."""
from __future__ import annotations

from typing import List

from ..bus import Bus
from ..proto import Msg, new
from .archivist import Archivist
from .critic import Critic
from .planner import Planner
from .qlm import QLM


class Orchestrator:
    """Event-loop driving the rule-based agents on an in-memory bus."""

    name = "orchestrator"

    def __init__(self, bus: Bus | None = None):
        self.bus = bus or Bus()
        self.agents: List = []
        self.wire(self.bus)

    def wire(self, bus: Bus | None = None) -> None:
        bus = bus or self.bus
        self.agents = [
            Planner(bus),
            QLM(bus),
            Critic(bus),
            Archivist(bus),
        ]
        for agent in self.agents:
            bus.subscribe(agent)

    def run_goal(self, goal: str) -> int:
        self.bus.publish(new(self.name, "planner", "task", "goal", goal=goal))
        return len(self.bus.history())

    def run(self, goal: str, message_budget: int = 64) -> List[Msg]:  # pragma: no cover - legacy shim
        _ = message_budget
        self.run_goal(goal)
        return [msg for msg in self.bus.history() if msg.kind == "result"]


__all__ = ["Orchestrator"]
