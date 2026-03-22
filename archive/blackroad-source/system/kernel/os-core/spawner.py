# BlackRoad Agent Spawner - Lifecycle Management
#
# Handles agent creation, spawning, supervision, and termination.
# Integrates with Lucidia breath cycles for harmonic agent lifecycle.
#
# Key Features:
# - Breath-synchronized spawning (agents born on expansion phases)
# - Pack-based agent templates
# - Parent-child lineage tracking
# - Graceful shutdown and memory persistence
# - Health monitoring and auto-restart

import asyncio
from typing import Dict, List, Optional, Set, Callable
from dataclasses import dataclass, field
from datetime import datetime, UTC
from pathlib import Path
import json

from blackroad_core.agents import (
    AgentManifest,
    BlackRoadAgent,
    RuntimeType,
    EmotionalState,
    EventBus,
    CapabilityRegistry,
    PSSHA
)
from blackroad_core.lucidia import LucidiaBreath
from blackroad_core.model_router import ModelRouter


class AgentStatus:
    # Agent lifecycle states.
    PENDING = "pending"
    SPAWNING = "spawning"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    TERMINATED = "terminated"


@dataclass
class SpawnRequest:
    # Request to spawn a new agent.
    role: str
    capabilities: List[str]
    runtime_type: RuntimeType
    pack: Optional[str] = None
    parent_id: Optional[str] = None
    resources: Dict[str, any] = field(default_factory=dict)
    auto_start: bool = True


@dataclass
class AgentRecord:
    """Record of a spawned agent."""
    agent: BlackRoadAgent
    status: str
    spawn_time: str
    breath_cycle_born: int
    parent_id: Optional[str] = None
    children: Set[str] = field(default_factory=set)
    restart_count: int = 0
    last_heartbeat: Optional[str] = None
    error_log: List[str] = field(default_factory=list)


class AgentSpawner:
    """Manages agent lifecycle with breath-synchronized spawning.

    Agents are preferentially spawned during expansion phases (𝔅>0)
    and consolidated during contraction phases (𝔅<0)."""

    def __init__(
        self,
        lucidia: LucidiaBreath,
        event_bus: EventBus,
        capability_registry: CapabilityRegistry,
        max_agents: int = 30000
    ):
        self.lucidia = lucidia
        self.event_bus = event_bus
        self.capability_registry = capability_registry
        self.max_agents = max_agents

        # Active agents
        self.agents: Dict[str, AgentRecord] = {}
        self.spawn_queue: List[SpawnRequest] = []

        # Spawning strategy
        self.spawn_on_expansion = True
        self.auto_restart_failed = True

        # Statistics
        self.total_spawned = 0
        self.total_terminated = 0

    async def spawn_agent(
        self,
        request: SpawnRequest,
        force_immediate: bool = False
    ) -> Optional[str]:
        """Spawn a new agent.

        Args:
            request: Spawn request configuration
            force_immediate: Skip breath cycle waiting

        Returns:
            Agent ID if spawned, None if queued"""
        # Check capacity
        if len(self.agents) >= self.max_agents:
            raise RuntimeError(f"Max agents reached: {self.max_agents}")

        # Check if we should wait for expansion phase
        if not force_immediate and self.spawn_on_expansion:
            recent_breath = self.lucidia.breath_log[-1] if self.lucidia.breath_log else None
            if recent_breath and recent_breath.breath_value < 0:
                # Queue for next expansion
                self.spawn_queue.append(request)
                await self.event_bus.publish("agent.spawn.queued", {
                    "role": request.role,
                    "reason": "waiting_for_expansion"
                })
                return None

        # Generate agent ID
        agent_id = self._generate_agent_id(request.role)

        # Create manifest
        manifest = AgentManifest(
            id=agent_id,
            role=request.role,
            capabilities=request.capabilities,
            resources=request.resources,
            runtime_type=request.runtime_type,
            pack_membership=[request.pack] if request.pack else []
        )

        # Set parent lineage
        if request.parent_id:
            manifest.parent_agents.append(request.parent_id)
            if request.parent_id in self.agents:
                self.agents[request.parent_id].children.add(agent_id)

        # Create agent
        agent = BlackRoadAgent(manifest)

        # Create record
        record = AgentRecord(
            agent=agent,
            status=AgentStatus.SPAWNING,
            spawn_time=datetime.now(UTC).isoformat(),
            breath_cycle_born=self.lucidia.state.breath_count,
            parent_id=request.parent_id
        )

        # Register
        self.agents[agent_id] = record
        self.capability_registry.register(agent_id, request.capabilities)

        # Emit event
        await self.event_bus.publish("agent.spawned", {
            "agent_id": agent_id,
            "role": request.role,
            "runtime_type": request.runtime_type.value,
            "parent_id": request.parent_id,
            "breath_cycle": self.lucidia.state.breath_count,
            "soul_hash": agent.manifest.ps_sha_infinity_id
        })

        # Start if requested
        if request.auto_start:
            await self.start_agent(agent_id)

        self.total_spawned += 1

        return agent_id

    async def start_agent(self, agent_id: str):
        """Start a spawned agent."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")

        record = self.agents[agent_id]
        record.status = AgentStatus.RUNNING
        record.last_heartbeat = datetime.now(UTC).isoformat()

        await self.event_bus.publish("agent.started", {
            "agent_id": agent_id,
            "role": record.agent.manifest.role
        })

    async def pause_agent(self, agent_id: str):
        """Pause a running agent."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")

        record = self.agents[agent_id]
        record.status = AgentStatus.PAUSED

        await self.event_bus.publish("agent.paused", {
            "agent_id": agent_id
        })

    async def terminate_agent(
        self,
        agent_id: str,
        reason: str = "user_requested",
        terminate_children: bool = False
    ):
        """Terminate an agent and optionally its children.

        Args:
            agent_id: Agent to terminate
            reason: Termination reason
            terminate_children: Also terminate child agents"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")

        record = self.agents[agent_id]

        # Terminate children first if requested
        if terminate_children:
            for child_id in list(record.children):
                await self.terminate_agent(child_id, reason="parent_terminated")

        # Persist final state
        final_state = {
            "terminated_at": datetime.now(UTC).isoformat(),
            "reason": reason,
            "final_emotional_state": record.agent.manifest.emotional_state.value,
            "total_thoughts": len(record.agent.memory.load_all()),
            "soul_hash": record.agent.manifest.ps_sha_infinity_id
        }

        record.agent.memory.append({
            "type": "termination",
            "data": final_state
        })

        # Update status
        record.status = AgentStatus.TERMINATED

        # Emit event
        await self.event_bus.publish("agent.terminated", {
            "agent_id": agent_id,
            "reason": reason,
            **final_state
        })

        # Remove from active registry
        del self.agents[agent_id]
        self.total_terminated += 1

    async def process_spawn_queue(self):
        """Process queued spawn requests during expansion phases."""
        if not self.spawn_queue:
            return

        # Check if we're in expansion
        recent_breath = self.lucidia.breath_log[-1] if self.lucidia.breath_log else None
        if not recent_breath or recent_breath.breath_value < 0:
            return

        # Spawn queued agents
        spawned_count = 0
        max_per_cycle = 10  # Rate limit

        while self.spawn_queue and spawned_count < max_per_cycle:
            request = self.spawn_queue.pop(0)
            agent_id = await self.spawn_agent(request, force_immediate=True)
            if agent_id:
                spawned_count += 1

    async def health_check(self):
        """Check health of all agents and restart failed ones."""
        current_time = datetime.utcnow().isoformat()

        for agent_id, record in list(self.agents.items()):
            # Skip if not running
            if record.status != AgentStatus.RUNNING:
                continue

            # Check for stale heartbeat (example check)
            # In production, this would involve actual health probes

            # Auto-restart if enabled and agent errored
            if record.status == AgentStatus.ERROR and self.auto_restart_failed:
                if record.restart_count < 3:  # Max 3 restarts
                    await self.restart_agent(agent_id)

    async def restart_agent(self, agent_id: str):
        """Restart a failed agent."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")

        record = self.agents[agent_id]
        record.restart_count += 1
        record.status = AgentStatus.RUNNING
        record.last_heartbeat = datetime.now(UTC).isoformat()

        await self.event_bus.publish("agent.restarted", {
            "agent_id": agent_id,
            "restart_count": record.restart_count
        })

    def get_statistics(self) -> Dict[str, any]:
        """Get spawner statistics."""
        status_counts = {}
        for record in self.agents.values():
            status_counts[record.status] = status_counts.get(record.status, 0) + 1

        return {
            "total_active": len(self.agents),
            "total_spawned": self.total_spawned,
            "total_terminated": self.total_terminated,
            "queued": len(self.spawn_queue),
            "by_status": status_counts,
            "capacity_used_pct": (len(self.agents) / self.max_agents) * 100
        }

    def _generate_agent_id(self, role: str) -> str:
        """Generate unique agent ID."""
        base = role.lower().replace(" ", "-")
        timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        return f"agent-{base}-{timestamp}-{self.total_spawned:04d}"


__all__ = [
    "AgentSpawner",
    "SpawnRequest",
    "AgentRecord",
    "AgentStatus"
]
