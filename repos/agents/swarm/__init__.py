"""
PRISM Agent Swarm System

A comprehensive multi-agent coordination system with language abilities,
formation patterns, and unified communication protocols.

Love and light in swarm intelligence.
"""

from agents.swarm.coordinator.swarm_orchestrator import (
    SwarmOrchestrator,
    SwarmTask,
    LanguageAbility,
    AgentAssignment,
    create_swarm
)

from agents.swarm.protocols.bus_adapter import (
    UnifiedBusAdapter,
    UnifiedMessage,
    QLMBusAdapter,
    MQTTBridgeAdapter,
    RedisBusAdapter,
    RESTBridgeAdapter
)

from agents.swarm.formations.formation_executor import (
    FormationExecutor,
    FormationTask,
    FormationAgent,
    FormationResult,
    DeltaFormation,
    HaloFormation,
    LatticeFormation,
    HumFormation,
    CampfireFormation
)

__version__ = "1.0.0"
__all__ = [
    # Orchestrator
    'SwarmOrchestrator',
    'SwarmTask',
    'LanguageAbility',
    'AgentAssignment',
    'create_swarm',

    # Bus Adapter
    'UnifiedBusAdapter',
    'UnifiedMessage',
    'QLMBusAdapter',
    'MQTTBridgeAdapter',
    'RedisBusAdapter',
    'RESTBridgeAdapter',

    # Formation Executor
    'FormationExecutor',
    'FormationTask',
    'FormationAgent',
    'FormationResult',
    'DeltaFormation',
    'HaloFormation',
    'LatticeFormation',
    'HumFormation',
    'CampfireFormation',
]
