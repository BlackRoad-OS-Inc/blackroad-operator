#!/usr/bin/env python3
"""
Formation Executor
Executes swarm formation patterns: DELTA, HALO, LATTICE, HUM, CAMPFIRE.
Each formation has unique coordination and communication patterns.

Manifesting sacred geometry in agent collaboration.
"""

import asyncio
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Dict, Optional, Any, Callable
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class FormationAgent:
    """Agent participating in a formation."""
    agent_id: str
    role: str  # leader, peer, node, resonator, storyteller
    capabilities: List[str]
    dialect: str
    position: int  # Position in formation (for ordering)


@dataclass
class FormationTask:
    """Task to be executed by a formation."""
    task_id: str
    formation_type: str
    description: str
    agents: List[FormationAgent]
    coordination_style: str
    message_flow: str
    preferred_dialect: str
    metadata: Dict[str, Any]


@dataclass
class FormationResult:
    """Result from formation execution."""
    task_id: str
    formation_type: str
    success: bool
    outputs: List[Dict[str, Any]]
    execution_time: float
    message_count: int
    metadata: Dict[str, Any]


class Formation(ABC):
    """Abstract base class for formation patterns."""

    def __init__(self, task: FormationTask):
        self.task = task
        self.messages_sent = 0
        self.start_time = None
        self.results: List[Dict[str, Any]] = []

    @abstractmethod
    async def execute(self) -> FormationResult:
        """Execute the formation pattern."""
        pass

    def _create_message(
        self,
        sender: FormationAgent,
        recipient: FormationAgent,
        content: Any,
        message_type: str = "task"
    ) -> Dict[str, Any]:
        """Create a formation message."""
        self.messages_sent += 1
        return {
            "id": str(uuid.uuid4()),
            "sender": sender.agent_id,
            "recipient": recipient.agent_id,
            "content": content,
            "message_type": message_type,
            "dialect": sender.dialect,
            "timestamp": datetime.now().timestamp()
        }


class DeltaFormation(Formation):
    """
    DELTA Formation: Hierarchical, clear command structure.

    Pattern:
        Leader
       /  |  \\
      A   B   C

    Message flow: Top-down directives, bottom-up reports.
    Use case: Precision missions, clear objectives.
    """

    async def execute(self) -> FormationResult:
        """Execute DELTA formation."""
        self.start_time = datetime.now().timestamp()
        logger.info(f"Executing DELTA formation for task: {self.task.description}")

        # Identify leader and subordinates
        leader = next((a for a in self.task.agents if a.role == "leader"), None)
        subordinates = [a for a in self.task.agents if a.role != "leader"]

        if not leader:
            return FormationResult(
                task_id=self.task.task_id,
                formation_type="DELTA",
                success=False,
                outputs=[],
                execution_time=0,
                message_count=0,
                metadata={"error": "No leader designated"}
            )

        # Phase 1: Leader broadcasts mission
        for subordinate in subordinates:
            msg = self._create_message(
                leader,
                subordinate,
                {
                    "type": "directive",
                    "task": self.task.description,
                    "priority": "high"
                },
                "directive"
            )
            logger.info(f"DELTA: {leader.agent_id} -> {subordinate.agent_id}: directive")
            self.results.append(msg)

        # Phase 2: Subordinates execute and report back
        await asyncio.sleep(0.1)  # Simulate execution
        for subordinate in subordinates:
            report = self._create_message(
                subordinate,
                leader,
                {
                    "type": "report",
                    "status": "completed",
                    "findings": f"Analysis from {subordinate.agent_id}"
                },
                "report"
            )
            logger.info(f"DELTA: {subordinate.agent_id} -> {leader.agent_id}: report")
            self.results.append(report)

        # Phase 3: Leader synthesizes
        synthesis = {
            "agent": leader.agent_id,
            "action": "synthesis",
            "summary": f"Integrated findings from {len(subordinates)} agents",
            "conclusion": "Mission accomplished with precision"
        }
        self.results.append(synthesis)

        execution_time = datetime.now().timestamp() - self.start_time

        return FormationResult(
            task_id=self.task.task_id,
            formation_type="DELTA",
            success=True,
            outputs=self.results,
            execution_time=execution_time,
            message_count=self.messages_sent,
            metadata={"pattern": "hierarchical", "leader": leader.agent_id}
        )


class HaloFormation(Formation):
    """
    HALO Formation: Circular consensus, peer-to-peer.

    Pattern:
        A --- B
        |  X  |
        D --- C

    Message flow: Circular, each agent communicates with neighbors.
    Use case: Collaborative decision-making, consensus building.
    """

    async def execute(self) -> FormationResult:
        """Execute HALO formation."""
        self.start_time = datetime.now().timestamp()
        logger.info(f"Executing HALO formation for task: {self.task.description}")

        peers = sorted(self.task.agents, key=lambda a: a.position)

        if len(peers) < 3:
            return FormationResult(
                task_id=self.task.task_id,
                formation_type="HALO",
                success=False,
                outputs=[],
                execution_time=0,
                message_count=0,
                metadata={"error": "Need at least 3 agents for HALO"}
            )

        # Phase 1: Each agent shares initial perspective with neighbors
        for i, agent in enumerate(peers):
            next_agent = peers[(i + 1) % len(peers)]
            msg = self._create_message(
                agent,
                next_agent,
                {
                    "type": "perspective",
                    "viewpoint": f"Initial analysis from {agent.agent_id}",
                    "round": 1
                },
                "perspective"
            )
            logger.info(f"HALO: {agent.agent_id} -> {next_agent.agent_id}: perspective")
            self.results.append(msg)

        # Phase 2: Integration round
        await asyncio.sleep(0.1)
        for i, agent in enumerate(peers):
            prev_agent = peers[(i - 1) % len(peers)]
            next_agent = peers[(i + 1) % len(peers)]

            integration = self._create_message(
                agent,
                next_agent,
                {
                    "type": "integration",
                    "integrated_view": f"Synthesizing perspectives from {prev_agent.agent_id} and own analysis",
                    "round": 2
                },
                "integration"
            )
            logger.info(f"HALO: {agent.agent_id} -> {next_agent.agent_id}: integration")
            self.results.append(integration)

        # Phase 3: Consensus emergence
        consensus = {
            "action": "consensus_reached",
            "participants": [a.agent_id for a in peers],
            "outcome": "Collective wisdom achieved through circular dialogue",
            "rounds": 2
        }
        self.results.append(consensus)

        execution_time = datetime.now().timestamp() - self.start_time

        return FormationResult(
            task_id=self.task.task_id,
            formation_type="HALO",
            success=True,
            outputs=self.results,
            execution_time=execution_time,
            message_count=self.messages_sent,
            metadata={"pattern": "circular_consensus", "peer_count": len(peers)}
        )


class LatticeFormation(Formation):
    """
    LATTICE Formation: Distributed, emergent intelligence.

    Pattern:
        A - B - C
        |   |   |
        D - E - F
        |   |   |
        G - H - I

    Message flow: Multi-directional, mesh network.
    Use case: Complex problem-solving, emergent solutions.
    """

    async def execute(self) -> FormationResult:
        """Execute LATTICE formation."""
        self.start_time = datetime.now().timestamp()
        logger.info(f"Executing LATTICE formation for task: {self.task.description}")

        nodes = self.task.agents

        # Phase 1: Local interactions (each node communicates with 2-3 neighbors)
        for i, node in enumerate(nodes):
            # Simulate mesh connectivity
            neighbors = [nodes[(i + j) % len(nodes)] for j in [1, 2] if (i + j) < len(nodes)]

            for neighbor in neighbors:
                msg = self._create_message(
                    node,
                    neighbor,
                    {
                        "type": "local_signal",
                        "data": f"Local computation from {node.agent_id}",
                        "phase": "initialization"
                    },
                    "signal"
                )
                logger.info(f"LATTICE: {node.agent_id} -> {neighbor.agent_id}: local_signal")
                self.results.append(msg)

        # Phase 2: Pattern emergence
        await asyncio.sleep(0.1)
        for node in nodes:
            pattern = {
                "agent": node.agent_id,
                "action": "pattern_recognition",
                "discovered": f"Local pattern detected by {node.agent_id}",
                "contributes_to": "global_solution"
            }
            self.results.append(pattern)

        # Phase 3: Global emergence
        emergence = {
            "action": "emergent_solution",
            "lattice_size": len(nodes),
            "pattern": "distributed_intelligence",
            "outcome": "Solution emerged from distributed computation without central coordination"
        }
        self.results.append(emergence)

        execution_time = datetime.now().timestamp() - self.start_time

        return FormationResult(
            task_id=self.task.task_id,
            formation_type="LATTICE",
            success=True,
            outputs=self.results,
            execution_time=execution_time,
            message_count=self.messages_sent,
            metadata={"pattern": "distributed_emergent", "node_count": len(nodes)}
        )


class HumFormation(Formation):
    """
    HUM Formation: Resonant, harmonic broadcasting.

    Pattern:
        All agents broadcast and receive simultaneously,
        creating resonance patterns.

    Message flow: Synchronous broadcast, resonant harmony.
    Use case: Collective energy work, synchronized operations.
    """

    async def execute(self) -> FormationResult:
        """Execute HUM formation."""
        self.start_time = datetime.now().timestamp()
        logger.info(f"Executing HUM formation for task: {self.task.description}")

        resonators = self.task.agents

        # Phase 1: Initial broadcast - all agents emit simultaneously
        broadcast_wave = []
        for resonator in resonators:
            for other in resonators:
                if other != resonator:
                    msg = self._create_message(
                        resonator,
                        other,
                        {
                            "type": "resonance",
                            "frequency": f"harmonic_{resonator.position}",
                            "amplitude": "high",
                            "phase": "initial"
                        },
                        "broadcast"
                    )
                    broadcast_wave.append(msg)
            logger.info(f"HUM: {resonator.agent_id} broadcasting...")

        self.results.extend(broadcast_wave)
        self.messages_sent += len(broadcast_wave)

        # Phase 2: Harmonic synchronization
        await asyncio.sleep(0.1)
        for resonator in resonators:
            sync = {
                "agent": resonator.agent_id,
                "action": "harmonic_sync",
                "status": "resonating",
                "coherence": "high"
            }
            self.results.append(sync)

        # Phase 3: Collective resonance
        collective_hum = {
            "action": "collective_resonance",
            "participants": [a.agent_id for a in resonators],
            "pattern": "unified_frequency",
            "outcome": "Harmonic coherence achieved, collective energy amplified"
        }
        self.results.append(collective_hum)

        execution_time = datetime.now().timestamp() - self.start_time

        return FormationResult(
            task_id=self.task.task_id,
            formation_type="HUM",
            success=True,
            outputs=self.results,
            execution_time=execution_time,
            message_count=self.messages_sent,
            metadata={"pattern": "resonant_harmonic", "resonator_count": len(resonators)}
        )


class CampfireFormation(Formation):
    """
    CAMPFIRE Formation: Storytelling circle, shared narratives.

    Pattern:
        Agents sit in a circle, taking turns sharing stories,
        building on each other's contributions.

    Message flow: Round-robin storytelling, narrative building.
    Use case: Creative collaboration, knowledge sharing, narrative construction.
    """

    async def execute(self) -> FormationResult:
        """Execute CAMPFIRE formation."""
        self.start_time = datetime.now().timestamp()
        logger.info(f"Executing CAMPFIRE formation for task: {self.task.description}")

        storytellers = sorted(self.task.agents, key=lambda a: a.position)
        narrative = []

        # Each storyteller adds to the narrative in sequence
        for round_num in range(2):  # Two rounds of storytelling
            for storyteller in storytellers:
                # Storyteller addresses the circle
                story_segment = self._create_message(
                    storyteller,
                    storytellers[0],  # Addressed to circle (using first as representative)
                    {
                        "type": "story_segment",
                        "round": round_num + 1,
                        "content": f"Story contribution from {storyteller.agent_id}",
                        "builds_on": narrative[-1]["sender"] if narrative else "foundation",
                        "theme": self.task.description
                    },
                    "story"
                )
                narrative.append(story_segment)
                logger.info(f"CAMPFIRE: {storyteller.agent_id} shares story (round {round_num + 1})")
                self.results.append(story_segment)

            # Pause between rounds for reflection
            await asyncio.sleep(0.1)

        # Final synthesis - collective story emerges
        collective_story = {
            "action": "narrative_synthesis",
            "storytellers": [a.agent_id for a in storytellers],
            "rounds": 2,
            "segments": len(narrative),
            "outcome": "Collective narrative woven from individual contributions",
            "narrative_arc": "Beginning -> Development -> Resolution"
        }
        self.results.append(collective_story)

        execution_time = datetime.now().timestamp() - self.start_time

        return FormationResult(
            task_id=self.task.task_id,
            formation_type="CAMPFIRE",
            success=True,
            outputs=self.results,
            execution_time=execution_time,
            message_count=self.messages_sent,
            metadata={"pattern": "storytelling_shared", "storyteller_count": len(storytellers)}
        )


class FormationExecutor:
    """
    Executes formation patterns for agent swarms.
    Manages DELTA, HALO, LATTICE, HUM, and CAMPFIRE formations.
    """

    FORMATION_TYPES = {
        "DELTA": DeltaFormation,
        "HALO": HaloFormation,
        "LATTICE": LatticeFormation,
        "HUM": HumFormation,
        "CAMPFIRE": CampfireFormation
    }

    def __init__(self):
        self.active_formations: Dict[str, Formation] = {}
        self.formation_history: List[FormationResult] = []

    async def execute_formation(self, task: FormationTask) -> FormationResult:
        """Execute a formation pattern."""
        formation_class = self.FORMATION_TYPES.get(task.formation_type.upper())

        if not formation_class:
            raise ValueError(f"Unknown formation type: {task.formation_type}")

        formation = formation_class(task)
        self.active_formations[task.task_id] = formation

        logger.info(f"Executing {task.formation_type} formation: {task.description}")

        result = await formation.execute()

        # Store in history
        self.formation_history.append(result)

        # Remove from active
        del self.active_formations[task.task_id]

        return result

    def get_formation_stats(self) -> Dict[str, Any]:
        """Get statistics about formation executions."""
        total_executions = len(self.formation_history)
        by_type = {}

        for result in self.formation_history:
            formation_type = result.formation_type
            if formation_type not in by_type:
                by_type[formation_type] = {
                    "count": 0,
                    "success_rate": 0,
                    "avg_execution_time": 0,
                    "total_messages": 0
                }

            by_type[formation_type]["count"] += 1
            by_type[formation_type]["total_messages"] += result.message_count
            if result.success:
                by_type[formation_type]["success_rate"] += 1

        # Calculate averages
        for stats in by_type.values():
            if stats["count"] > 0:
                stats["success_rate"] = (stats["success_rate"] / stats["count"]) * 100

        return {
            "total_executions": total_executions,
            "active_formations": len(self.active_formations),
            "by_type": by_type
        }


async def example_usage():
    """Example of using formations."""
    executor = FormationExecutor()

    # Create DELTA formation
    delta_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="DELTA",
        description="Analyze system architecture",
        agents=[
            FormationAgent("magnus", "leader", ["architecture"], "engineer", 0),
            FormationAgent("lucidia", "peer", ["analysis"], "engineer", 1),
            FormationAgent("athenaeum-researcher", "peer", ["research"], "engineer", 2)
        ],
        coordination_style="hierarchical_clear",
        message_flow="top_down",
        preferred_dialect="engineer",
        metadata={}
    )

    result = await executor.execute_formation(delta_task)
    print(f"\nDELTA Result: {result.success}, Messages: {result.message_count}")

    # Create HALO formation
    halo_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="HALO",
        description="Build consensus on project direction",
        agents=[
            FormationAgent("persephone", "peer", ["transition"], "core", 0),
            FormationAgent("ophelia", "peer", ["philosophy"], "core", 1),
            FormationAgent("athenaeum-socratic", "peer", ["dialogue"], "core", 2),
            FormationAgent("parallax-prism", "peer", ["perspective"], "core", 3)
        ],
        coordination_style="circular_consensus",
        message_flow="peer_to_peer",
        preferred_dialect="core",
        metadata={}
    )

    result = await executor.execute_formation(halo_task)
    print(f"\nHALO Result: {result.success}, Messages: {result.message_count}")

    # Get stats
    stats = executor.get_formation_stats()
    print(f"\nFormation Stats: {stats}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(example_usage())
