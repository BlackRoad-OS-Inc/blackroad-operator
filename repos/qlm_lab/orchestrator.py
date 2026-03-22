"""High level orchestrator wiring the agent network."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

from .bus import Bus
from .lineage import LineageLogger
from .policies import PolicyGuard
from .proto import new
from .agents.archivist import Archivist
from .agents.base import Agent
from .agents.coder import Coder
from .agents.critic import Critic
from .agents.orchestrator import OrchestratorAgent
from .agents.planner import Planner
from .agents.qlm import QLM
from .agents.researcher import Researcher


@dataclass
class DemoResult:
    reports: List[str]


class Orchestrator:
    """Convenience facade used by demos and notebooks."""

    def __init__(self, policy: PolicyGuard | None = None) -> None:
        self.policy = policy or PolicyGuard()
        self.lineage = LineageLogger(self.policy)
        self.bus = Bus()
        self.agents: List[Agent] = []
        self._register_agents()

    def _register_agents(self) -> None:
        agents: List[Agent] = [
            OrchestratorAgent("orchestrator", self.bus),
            Planner("planner", self.bus),
            Researcher("researcher", self.bus),
            QLM("qlm", self.bus, self.policy, self.lineage),
            Coder("coder", self.bus),
            Critic("critic", self.bus, self.lineage),
            Archivist("archivist", self.bus, self.lineage),
        ]
        self.agents = agents
        for agent in agents:
            self.bus.subscribe(agent.as_subscriber())

    def run_goal(self, goal: str) -> DemoResult:
        critic = next(agent for agent in self.agents if isinstance(agent, Critic))
        critic.reports = []
        self.bus.publish(new("user", "orchestrator", "task", "orchestrate", goal=goal))
        self.bus.run()
        return DemoResult(reports=critic.reports)
