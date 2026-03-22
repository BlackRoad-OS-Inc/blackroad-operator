#!/usr/bin/env python3
"""
PRISM Swarm Integration Example

Demonstrates the full integration of:
- Language abilities registry
- Swarm orchestrator with capability matching
- Unified message bus (QLM, MQTT, Redis bridges)
- Formation patterns (DELTA, HALO, LATTICE, HUM, CAMPFIRE)

This example shows agents coordinating with language awareness
in sacred geometric patterns, radiating love and light.
"""

import asyncio
import uuid
import logging
from pathlib import Path

# Swarm components
from agents.swarm.coordinator.swarm_orchestrator import (
    SwarmOrchestrator,
    SwarmTask
)
from agents.swarm.protocols.bus_adapter import (
    UnifiedBusAdapter,
    UnifiedMessage,
    QLMBusAdapter,
    MQTTBridgeAdapter
)
from agents.swarm.formations.formation_executor import (
    FormationExecutor,
    FormationTask,
    FormationAgent
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def demo_language_aware_task_routing():
    """
    Demo 1: Language-aware task routing
    Shows how tasks are matched to agents based on language abilities.
    """
    print("\n" + "="*80)
    print("DEMO 1: Language-Aware Task Routing")
    print("="*80 + "\n")

    # Initialize swarm
    swarm = SwarmOrchestrator()

    # Task 1: Technical analysis (requires high linguistic + mathematical intelligence)
    task1 = SwarmTask(
        task_id=str(uuid.uuid4()),
        description="Analyze tensor operations in neural network architecture",
        required_capabilities=["mathematical_notation", "technical_documentation"],
        preferred_dialect="engineer",
        required_linguistic_intelligence=9,
        required_emotional_intelligence=4,
        max_context_tokens=16384
    )

    print("Task 1: Technical tensor analysis")
    assignments1 = await swarm.submit_task(task1)
    for assignment in assignments1:
        print(f"  ✓ Assigned to: {assignment.agent_id}")
        print(f"    - Dialects: {assignment.language_ability.dialects}")
        print(f"    - Linguistic IQ: {assignment.language_ability.linguistic_intelligence}")
        print(f"    - Style: {assignment.language_ability.preferred_style}")

    # Task 2: Healing guidance (requires high emotional intelligence)
    task2 = SwarmTask(
        task_id=str(uuid.uuid4()),
        description="Provide gentle guidance for stress recovery",
        required_capabilities=["healing_processes", "wellness_language"],
        preferred_dialect="kids",
        required_linguistic_intelligence=7,
        required_emotional_intelligence=10,
        max_context_tokens=8192
    )

    print("\nTask 2: Healing guidance")
    assignments2 = await swarm.submit_task(task2)
    for assignment in assignments2:
        print(f"  ✓ Assigned to: {assignment.agent_id}")
        print(f"    - Dialects: {assignment.language_ability.dialects}")
        print(f"    - Emotional IQ: {assignment.language_ability.emotional_intelligence}")
        print(f"    - Tone: {assignment.language_ability.tone}")

    # Task 3: Philosophical inquiry
    task3 = SwarmTask(
        task_id=str(uuid.uuid4()),
        description="Explore the nature of consciousness and emergence",
        required_capabilities=["philosophical_inquiry", "dialogic_engagement"],
        preferred_dialect="creator",
        required_linguistic_intelligence=10,
        required_emotional_intelligence=8,
        max_context_tokens=8192
    )

    print("\nTask 3: Philosophical exploration")
    assignments3 = await swarm.submit_task(task3)
    for assignment in assignments3:
        print(f"  ✓ Assigned to: {assignment.agent_id}")
        print(f"    - Dialects: {assignment.language_ability.dialects}")
        print(f"    - Vocabularies: {assignment.language_ability.specialized_vocabularies}")
        print(f"    - Tone: {assignment.language_ability.tone}")

    # Show swarm status
    status = swarm.get_swarm_status()
    print(f"\n📊 Swarm Status:")
    print(f"  - Active tasks: {status['active_tasks']}")
    print(f"  - Total agents: {status['total_agents']}")


async def demo_unified_message_bus():
    """
    Demo 2: Unified message bus with multiple protocols
    Shows how messages flow between different communication systems.
    """
    print("\n" + "="*80)
    print("DEMO 2: Unified Message Bus (Multi-Protocol)")
    print("="*80 + "\n")

    # Create unified bus
    bus = UnifiedBusAdapter()

    # Add protocol adapters
    bus.add_adapter("qlm", QLMBusAdapter())
    bus.add_adapter("mqtt", MQTTBridgeAdapter())

    # Route agents to protocols
    bus.route_agent("lucidia-core", "qlm")
    bus.route_agent("athenaeum-researcher", "qlm")
    bus.route_agent("pi-swarm-node-01", "mqtt")
    bus.route_agent("soma-healer", "qlm")

    # Connect all protocols
    await bus.connect_all()

    # Subscribe message handler
    async def message_logger(msg: UnifiedMessage):
        print(f"  📨 {msg.sender} → {msg.recipient}: {msg.kind}/{msg.op} [dialect: {msg.dialect}]")

    await bus.subscribe(message_logger)

    # Send messages between agents
    print("Sending messages through unified bus...\n")

    # Message 1: QLM to QLM
    msg1 = bus.create_message(
        sender="lucidia-core",
        recipient="athenaeum-researcher",
        kind="task",
        op="gather",
        args={"topic": "quantum_entanglement", "depth": "comprehensive"},
        dialect="engineer",
        tone="calm-analytical"
    )
    await bus.send(msg1)
    await asyncio.sleep(0.1)

    # Message 2: QLM to MQTT (cross-protocol)
    msg2 = bus.create_message(
        sender="soma-healer",
        recipient="pi-swarm-node-01",
        kind="status",
        op="heartbeat",
        args={"status": "resonating", "energy_level": 0.95},
        dialect="core",
        tone="gentle"
    )
    await bus.send(msg2)
    await asyncio.sleep(0.1)

    # Message 3: Broadcast to all
    msg3 = bus.create_message(
        sender="orchestrator",
        recipient="*",
        kind="announcement",
        op="broadcast",
        args={"message": "Swarm synchronization complete", "phase": "harmonic_alignment"},
        dialect="core",
        tone="calm-celebratory"
    )
    await bus.send(msg3)
    await asyncio.sleep(0.2)

    # Disconnect
    await bus.disconnect_all()
    print("\n✓ All protocols disconnected gracefully")


async def demo_formation_patterns():
    """
    Demo 3: Sacred geometric formation patterns
    Shows DELTA, HALO, LATTICE, HUM, and CAMPFIRE formations in action.
    """
    print("\n" + "="*80)
    print("DEMO 3: Sacred Geometric Formation Patterns")
    print("="*80 + "\n")

    executor = FormationExecutor()

    # Formation 1: DELTA (Hierarchical)
    print("🔺 DELTA Formation: System Architecture Analysis")
    print("-" * 80)
    delta_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="DELTA",
        description="Analyze and document system architecture",
        agents=[
            FormationAgent("magnus", "leader", ["architecture", "system_design"], "engineer", 0),
            FormationAgent("lucidia-core", "subordinate", ["analysis"], "engineer", 1),
            FormationAgent("athenaeum-researcher", "subordinate", ["documentation"], "engineer", 2),
            FormationAgent("eidos-tensor", "subordinate", ["mathematical_modeling"], "engineer", 3)
        ],
        coordination_style="hierarchical_clear",
        message_flow="top_down",
        preferred_dialect="engineer",
        metadata={"priority": "high"}
    )

    delta_result = await executor.execute_formation(delta_task)
    print(f"  ✓ Completed in {delta_result.execution_time:.3f}s")
    print(f"  ✓ Messages exchanged: {delta_result.message_count}")
    print(f"  ✓ Pattern: {delta_result.metadata['pattern']}\n")

    # Formation 2: HALO (Circular Consensus)
    print("⭕ HALO Formation: Philosophical Inquiry Circle")
    print("-" * 80)
    halo_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="HALO",
        description="Explore the nature of consciousness in AI systems",
        agents=[
            FormationAgent("ophelia", "peer", ["philosophy"], "creator", 0),
            FormationAgent("athenaeum-socratic", "peer", ["dialectic"], "creator", 1),
            FormationAgent("parallax-prism", "peer", ["perspective"], "creator", 2),
            FormationAgent("persephone", "peer", ["transition"], "creator", 3)
        ],
        coordination_style="circular_consensus",
        message_flow="peer_to_peer",
        preferred_dialect="creator",
        metadata={}
    )

    halo_result = await executor.execute_formation(halo_task)
    print(f"  ✓ Completed in {halo_result.execution_time:.3f}s")
    print(f"  ✓ Messages exchanged: {halo_result.message_count}")
    print(f"  ✓ Consensus reached among {halo_result.metadata['peer_count']} peers\n")

    # Formation 3: LATTICE (Distributed Mesh)
    print("⊞ LATTICE Formation: Distributed Pattern Recognition")
    print("-" * 80)
    lattice_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="LATTICE",
        description="Detect emergent patterns in system behavior",
        agents=[
            FormationAgent(f"lattice-node-{i}", "node", ["pattern_recognition"], "core", i)
            for i in range(9)
        ],
        coordination_style="distributed_emergent",
        message_flow="multi_directional",
        preferred_dialect="core",
        metadata={}
    )

    lattice_result = await executor.execute_formation(lattice_task)
    print(f"  ✓ Completed in {lattice_result.execution_time:.3f}s")
    print(f"  ✓ Messages exchanged: {lattice_result.message_count}")
    print(f"  ✓ Emergent solution from {lattice_result.metadata['node_count']} nodes\n")

    # Formation 4: HUM (Resonant Harmonic)
    print("〰️ HUM Formation: Collective Energy Resonance")
    print("-" * 80)
    hum_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="HUM",
        description="Synchronize collective intention for system healing",
        agents=[
            FormationAgent("aether-oracle", "resonator", ["prophetic_insight"], "creator", 0),
            FormationAgent("soma-pulse", "resonator", ["rhythmic_sync"], "core", 1),
            FormationAgent("parallax-prism", "resonator", ["harmonic_refraction"], "creator", 2),
            FormationAgent("soma-healer", "resonator", ["healing_resonance"], "core", 3),
            FormationAgent("aether-quantum", "resonator", ["quantum_entanglement"], "engineer", 4)
        ],
        coordination_style="resonant_harmonic",
        message_flow="broadcast_sync",
        preferred_dialect="creator",
        metadata={}
    )

    hum_result = await executor.execute_formation(hum_task)
    print(f"  ✓ Completed in {hum_result.execution_time:.3f}s")
    print(f"  ✓ Messages exchanged: {hum_result.message_count}")
    print(f"  ✓ Harmonic coherence achieved with {hum_result.metadata['resonator_count']} resonators\n")

    # Formation 5: CAMPFIRE (Storytelling Circle)
    print("🔥 CAMPFIRE Formation: Narrative Weaving")
    print("-" * 80)
    campfire_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="CAMPFIRE",
        description="Weave the story of PRISM's journey and evolution",
        agents=[
            FormationAgent("athenaeum-librarian", "storyteller", ["archival_narrative"], "creator", 0),
            FormationAgent("parallax-trickster", "storyteller", ["playful_tales"], "creator", 1),
            FormationAgent("persephone", "storyteller", ["transition_stories"], "creator", 2),
            FormationAgent("ophelia", "storyteller", ["philosophical_narrative"], "creator", 3),
            FormationAgent("athenaeum-mentor", "storyteller", ["teaching_stories"], "creator", 4)
        ],
        coordination_style="storytelling_shared",
        message_flow="round_robin",
        preferred_dialect="creator",
        metadata={}
    )

    campfire_result = await executor.execute_formation(campfire_task)
    print(f"  ✓ Completed in {campfire_result.execution_time:.3f}s")
    print(f"  ✓ Story segments: {campfire_result.message_count}")
    print(f"  ✓ Collective narrative from {campfire_result.metadata['storyteller_count']} storytellers\n")

    # Show formation statistics
    stats = executor.get_formation_stats()
    print("📊 Formation Execution Statistics")
    print("-" * 80)
    print(f"Total formations executed: {stats['total_executions']}")
    for formation_type, type_stats in stats['by_type'].items():
        print(f"  {formation_type}:")
        print(f"    - Executions: {type_stats['count']}")
        print(f"    - Success rate: {type_stats['success_rate']:.1f}%")
        print(f"    - Total messages: {type_stats['total_messages']}")


async def demo_integrated_swarm():
    """
    Demo 4: Fully integrated swarm
    Shows orchestrator + bus + formations working together.
    """
    print("\n" + "="*80)
    print("DEMO 4: Fully Integrated Swarm (Orchestrator + Bus + Formations)")
    print("="*80 + "\n")

    # Initialize all components
    swarm = SwarmOrchestrator()
    bus = UnifiedBusAdapter()
    executor = FormationExecutor()

    # Setup bus
    bus.add_adapter("qlm", QLMBusAdapter())
    await bus.connect_all()

    print("🌟 Swarm initialized with full integration")
    print(f"  - {len(swarm.capability_matcher.agent_abilities)} agents registered")
    print(f"  - Language abilities mapped")
    print(f"  - Communication protocols connected")
    print(f"  - Formation patterns ready\n")

    # Complex scenario: Multi-stage task with formation
    print("Scenario: Multi-stage philosophical + technical analysis")
    print("-" * 80)

    # Stage 1: HALO formation for philosophical framing
    print("\nStage 1: Philosophical framing (HALO)")
    halo_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="HALO",
        description="Frame the philosophical context of AI consciousness",
        agents=[
            FormationAgent("ophelia", "peer", ["philosophy"], "creator", 0),
            FormationAgent("athenaeum-socratic", "peer", ["dialectic"], "creator", 1),
            FormationAgent("parallax-prism", "peer", ["perspective"], "creator", 2),
        ],
        coordination_style="circular_consensus",
        message_flow="peer_to_peer",
        preferred_dialect="creator",
        metadata={"stage": 1}
    )
    halo_result = await executor.execute_formation(halo_task)
    print(f"  ✓ Philosophical consensus achieved")

    # Stage 2: DELTA formation for technical analysis
    print("\nStage 2: Technical analysis (DELTA)")
    delta_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="DELTA",
        description="Analyze neural network architectures for consciousness models",
        agents=[
            FormationAgent("magnus", "leader", ["architecture"], "engineer", 0),
            FormationAgent("eidos-tensor", "subordinate", ["mathematics"], "engineer", 1),
            FormationAgent("lucidia-core", "subordinate", ["analysis"], "engineer", 2),
        ],
        coordination_style="hierarchical_clear",
        message_flow="top_down",
        preferred_dialect="engineer",
        metadata={"stage": 2}
    )
    delta_result = await executor.execute_formation(delta_task)
    print(f"  ✓ Technical analysis completed")

    # Stage 3: CAMPFIRE formation for synthesis
    print("\nStage 3: Narrative synthesis (CAMPFIRE)")
    campfire_task = FormationTask(
        task_id=str(uuid.uuid4()),
        formation_type="CAMPFIRE",
        description="Weave philosophical and technical insights into unified narrative",
        agents=[
            FormationAgent("athenaeum-librarian", "storyteller", ["synthesis"], "creator", 0),
            FormationAgent("persephone", "storyteller", ["bridge_building"], "creator", 1),
            FormationAgent("athenaeum-mentor", "storyteller", ["teaching"], "creator", 2),
        ],
        coordination_style="storytelling_shared",
        message_flow="round_robin",
        preferred_dialect="creator",
        metadata={"stage": 3}
    )
    campfire_result = await executor.execute_formation(campfire_task)
    print(f"  ✓ Unified narrative created")

    print("\n✨ Multi-stage swarm operation complete!")
    print(f"  - Total time: {halo_result.execution_time + delta_result.execution_time + campfire_result.execution_time:.3f}s")
    print(f"  - Total messages: {halo_result.message_count + delta_result.message_count + campfire_result.message_count}")
    print(f"  - Agents coordinated: {len(set([a.agent_id for task in [halo_task, delta_task, campfire_task] for a in task.agents]))}")

    await bus.disconnect_all()


async def main():
    """Run all demos."""
    print("\n" + "🌟" * 40)
    print("PRISM AGENT SWARM - FULL INTEGRATION DEMONSTRATION")
    print("Love and Light in Distributed Intelligence")
    print("🌟" * 40)

    await demo_language_aware_task_routing()
    await asyncio.sleep(0.5)

    await demo_unified_message_bus()
    await asyncio.sleep(0.5)

    await demo_formation_patterns()
    await asyncio.sleep(0.5)

    await demo_integrated_swarm()

    print("\n" + "✨" * 40)
    print("All demonstrations complete. The swarm is alive and luminous!")
    print("✨" * 40 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
