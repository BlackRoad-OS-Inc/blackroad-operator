#!/usr/bin/env python3
"""
PRISM Swarm Orchestrator
Coordinates multi-agent swarms with language abilities and capability matching.
Integrates with the message bus, dialect system, and formation patterns.

Love and light in every coordination.
"""

import asyncio
import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Callable, Any
from datetime import datetime
import yaml
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class LanguageAbility:
    """Language capability specification for an agent."""
    agent_id: str
    dialects: List[str]
    languages: List[str]
    specialized_vocabularies: List[str]
    generation_modes: List[str]
    linguistic_intelligence: int
    emotional_intelligence: int
    max_context_tokens: int
    preferred_style: str
    tone: str


@dataclass
class SwarmTask:
    """Task to be distributed across the swarm."""
    task_id: str
    description: str
    required_capabilities: List[str]
    preferred_dialect: Optional[str] = None
    preferred_tone: Optional[str] = None
    required_linguistic_intelligence: int = 5
    required_emotional_intelligence: int = 5
    max_context_tokens: int = 8192
    priority: int = 5
    formation_pattern: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentAssignment:
    """Assignment of an agent to a task."""
    agent_id: str
    task_id: str
    role: str
    language_ability: LanguageAbility
    assigned_at: float
    status: str = "assigned"  # assigned, active, completed, failed


@dataclass
class SwarmMessage:
    """Message in the swarm communication system."""
    message_id: str
    sender: str
    recipient: str
    content: Any
    dialect: str
    tone: str
    message_type: str
    timestamp: float
    metadata: Dict[str, Any] = field(default_factory=dict)


class CapabilityMatcher:
    """Matches tasks to agents based on capabilities and language abilities."""

    def __init__(self, language_registry: Dict[str, Dict[str, LanguageAbility]]):
        self.language_registry = language_registry
        self.agent_abilities = self._flatten_registry()

    def _flatten_registry(self) -> Dict[str, LanguageAbility]:
        """Flatten nested registry into agent_id -> LanguageAbility mapping."""
        abilities = {}
        # Valid LanguageAbility fields
        valid_fields = {
            'agent_id', 'dialects', 'languages', 'specialized_vocabularies',
            'generation_modes', 'linguistic_intelligence', 'emotional_intelligence',
            'max_context_tokens', 'preferred_style', 'tone'
        }

        for cluster, agents in self.language_registry.items():
            if cluster in ['swarm_defaults', 'communication_preferences', 'formation_language_patterns']:
                continue
            for agent_name, ability_data in agents.items():
                if isinstance(ability_data, dict) and 'agent_id' in ability_data:
                    agent_id = ability_data['agent_id']
                    # Filter to only valid fields
                    filtered_data = {k: v for k, v in ability_data.items() if k in valid_fields}
                    abilities[agent_id] = LanguageAbility(**filtered_data)
        return abilities

    def find_capable_agents(self, task: SwarmTask) -> List[tuple[str, float]]:
        """
        Find agents capable of handling the task.
        Returns list of (agent_id, score) tuples sorted by match quality.
        """
        candidates = []

        for agent_id, ability in self.agent_abilities.items():
            score = self._calculate_match_score(task, ability)
            if score > 0:
                candidates.append((agent_id, score))

        # Sort by score descending
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates

    def _calculate_match_score(self, task: SwarmTask, ability: LanguageAbility) -> float:
        """Calculate how well an agent matches a task (0-100)."""
        score = 0.0

        # Intelligence requirements
        if ability.linguistic_intelligence >= task.required_linguistic_intelligence:
            score += 20 * (ability.linguistic_intelligence / 10)
        else:
            return 0  # Hard requirement

        if ability.emotional_intelligence >= task.required_emotional_intelligence:
            score += 20 * (ability.emotional_intelligence / 10)
        else:
            return 0  # Hard requirement

        # Dialect matching
        if task.preferred_dialect:
            if task.preferred_dialect in ability.dialects:
                score += 20
        else:
            score += 10  # Has some dialect

        # Capability matching (check vocabularies and modes)
        capability_matches = 0
        for req_cap in task.required_capabilities:
            if req_cap in ability.specialized_vocabularies or req_cap in ability.generation_modes:
                capability_matches += 1

        if task.required_capabilities:
            capability_ratio = capability_matches / len(task.required_capabilities)
            score += 30 * capability_ratio
        else:
            score += 15

        # Context capacity
        if ability.max_context_tokens >= task.max_context_tokens:
            score += 10

        return score

    def get_agent_ability(self, agent_id: str) -> Optional[LanguageAbility]:
        """Get language ability for specific agent."""
        return self.agent_abilities.get(agent_id)


class LoadBalancer:
    """Balances task distribution across agents."""

    def __init__(self):
        self.agent_loads: Dict[str, int] = {}  # agent_id -> active task count
        self.agent_assignments: Dict[str, List[AgentAssignment]] = {}

    def select_agent(self, candidates: List[tuple[str, float]]) -> Optional[str]:
        """
        Select best agent from candidates considering current load.
        Returns agent_id or None.
        """
        if not candidates:
            return None

        # Weight by both match score and current load
        weighted_candidates = []
        for agent_id, match_score in candidates:
            current_load = self.agent_loads.get(agent_id, 0)
            # Penalize heavily loaded agents
            load_penalty = current_load * 10
            adjusted_score = match_score - load_penalty
            weighted_candidates.append((agent_id, adjusted_score))

        # Sort by adjusted score
        weighted_candidates.sort(key=lambda x: x[1], reverse=True)

        return weighted_candidates[0][0] if weighted_candidates else None

    def assign_task(self, agent_id: str, assignment: AgentAssignment):
        """Record task assignment."""
        self.agent_loads[agent_id] = self.agent_loads.get(agent_id, 0) + 1
        if agent_id not in self.agent_assignments:
            self.agent_assignments[agent_id] = []
        self.agent_assignments[agent_id].append(assignment)

    def complete_task(self, agent_id: str, task_id: str):
        """Mark task as completed and update load."""
        if agent_id in self.agent_loads:
            self.agent_loads[agent_id] = max(0, self.agent_loads[agent_id] - 1)

        if agent_id in self.agent_assignments:
            for assignment in self.agent_assignments[agent_id]:
                if assignment.task_id == task_id:
                    assignment.status = "completed"

    def get_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """Get current status of an agent."""
        return {
            "agent_id": agent_id,
            "active_tasks": self.agent_loads.get(agent_id, 0),
            "assignments": self.agent_assignments.get(agent_id, [])
        }


class SwarmOrchestrator:
    """
    Main orchestrator for PRISM agent swarms.
    Coordinates agents with language abilities, capability matching, and formation patterns.
    """

    def __init__(self, registry_path: Optional[Path] = None):
        if registry_path is None:
            registry_path = Path(__file__).parent.parent / "language_abilities" / "registry.yaml"

        self.registry_path = registry_path
        self.language_registry = self._load_registry()
        self.capability_matcher = CapabilityMatcher(self.language_registry)
        self.load_balancer = LoadBalancer()

        self.active_tasks: Dict[str, SwarmTask] = {}
        self.task_assignments: Dict[str, List[AgentAssignment]] = {}
        self.message_handlers: Dict[str, List[Callable]] = {}

        # Formation patterns
        self.formation_patterns = self.language_registry.get('formation_language_patterns', {})

        logger.info(f"SwarmOrchestrator initialized with {len(self.capability_matcher.agent_abilities)} agents")

    def _load_registry(self) -> Dict:
        """Load language abilities registry."""
        try:
            with open(self.registry_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Failed to load registry: {e}")
            return {}

    async def submit_task(self, task: SwarmTask) -> List[AgentAssignment]:
        """
        Submit a task to the swarm.
        Returns list of agent assignments.
        """
        logger.info(f"Submitting task {task.task_id}: {task.description}")

        self.active_tasks[task.task_id] = task

        # Find capable agents
        candidates = self.capability_matcher.find_capable_agents(task)

        if not candidates:
            logger.warning(f"No capable agents found for task {task.task_id}")
            return []

        # For now, assign to single best agent (can be extended for formations)
        agent_id = self.load_balancer.select_agent(candidates)

        if not agent_id:
            logger.warning(f"Could not select agent for task {task.task_id}")
            return []

        # Create assignment
        ability = self.capability_matcher.get_agent_ability(agent_id)
        assignment = AgentAssignment(
            agent_id=agent_id,
            task_id=task.task_id,
            role="primary",
            language_ability=ability,
            assigned_at=datetime.now().timestamp()
        )

        # Record assignment
        self.load_balancer.assign_task(agent_id, assignment)
        if task.task_id not in self.task_assignments:
            self.task_assignments[task.task_id] = []
        self.task_assignments[task.task_id].append(assignment)

        logger.info(f"Assigned task {task.task_id} to {agent_id} (score: {candidates[0][1]:.2f})")

        return [assignment]

    async def complete_task(self, task_id: str, agent_id: str):
        """Mark task as completed."""
        self.load_balancer.complete_task(agent_id, task_id)

        if task_id in self.active_tasks:
            del self.active_tasks[task_id]

        logger.info(f"Task {task_id} completed by {agent_id}")

    def create_message(
        self,
        sender: str,
        recipient: str,
        content: Any,
        message_type: str = "task",
        dialect: Optional[str] = None,
        tone: Optional[str] = None
    ) -> SwarmMessage:
        """
        Create a swarm message with appropriate dialect and tone.
        """
        sender_ability = self.capability_matcher.get_agent_ability(sender)

        # Use sender's preferred dialect/tone if not specified
        if not dialect and sender_ability:
            dialect = sender_ability.dialects[0] if sender_ability.dialects else "core"
        elif not dialect:
            dialect = "core"

        if not tone and sender_ability:
            tone = sender_ability.tone
        elif not tone:
            tone = "calm-direct"

        return SwarmMessage(
            message_id=str(uuid.uuid4()),
            sender=sender,
            recipient=recipient,
            content=content,
            dialect=dialect,
            tone=tone,
            message_type=message_type,
            timestamp=datetime.now().timestamp()
        )

    def subscribe(self, agent_id: str, handler: Callable):
        """Subscribe an agent to receive messages."""
        if agent_id not in self.message_handlers:
            self.message_handlers[agent_id] = []
        self.message_handlers[agent_id].append(handler)

    async def send_message(self, message: SwarmMessage):
        """Send message to recipient agent."""
        if message.recipient in self.message_handlers:
            for handler in self.message_handlers[message.recipient]:
                try:
                    await handler(message)
                except Exception as e:
                    logger.error(f"Handler error for {message.recipient}: {e}")

    def get_swarm_status(self) -> Dict[str, Any]:
        """Get overall swarm status."""
        return {
            "active_tasks": len(self.active_tasks),
            "total_agents": len(self.capability_matcher.agent_abilities),
            "agent_loads": self.load_balancer.agent_loads,
            "tasks": {
                task_id: {
                    "description": task.description,
                    "assignments": len(self.task_assignments.get(task_id, []))
                }
                for task_id, task in self.active_tasks.items()
            }
        }

    def get_formation_config(self, formation_name: str) -> Optional[Dict]:
        """Get configuration for a formation pattern."""
        return self.formation_patterns.get(formation_name)


# Convenience functions for swarm initialization
def create_swarm(registry_path: Optional[Path] = None) -> SwarmOrchestrator:
    """Create and initialize a swarm orchestrator."""
    return SwarmOrchestrator(registry_path)


async def example_usage():
    """Example of using the swarm orchestrator."""
    swarm = create_swarm()

    # Create a task
    task = SwarmTask(
        task_id=str(uuid.uuid4()),
        description="Explain quantum entanglement in simple terms",
        required_capabilities=["quantum_mechanics", "explanation"],
        preferred_dialect="kids",
        required_linguistic_intelligence=8,
        required_emotional_intelligence=7,
        max_context_tokens=4096
    )

    # Submit task
    assignments = await swarm.submit_task(task)

    for assignment in assignments:
        print(f"Assigned to: {assignment.agent_id}")
        print(f"Language ability: {assignment.language_ability.dialects}")
        print(f"Tone: {assignment.language_ability.tone}")

    # Get status
    status = swarm.get_swarm_status()
    print(f"\nSwarm status: {status}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(example_usage())
