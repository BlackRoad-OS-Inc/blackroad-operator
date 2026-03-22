"""BlackRoad Agent System - Cece Agent Mode v2.0

Implements the comprehensive agent architecture from cece-agent-mode-v2.yaml
Integrates with:
- Lucidia breath engine for timing
- Mesh networking for coordination
- PS-SHA∞ memory persistence
- Codex v2 SafeBoot memory system

Based on:
- /Users/alexa/Desktop/cece-agent-mode-v2.yaml
- /Users/alexa/Desktop/codex_v2_safeboot/"""

import json
import hashlib
import time
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any, Set
from enum import Enum
from pathlib import Path
from datetime import datetime, UTC


class RuntimeType(Enum):
    """Agent runtime types from Cece Agent Mode v2.0"""
    LLM_BRAIN = "llm_brain"  # Language model powered
    WORKFLOW_ENGINE = "workflow_engine"  # LangGraph/CrewAI
    INTEGRATION_BRIDGE = "integration_bridge"  # MCP connectors
    EDGE_WORKER = "edge_worker"  # Pi/Jetson hardware
    UI_HELPER = "ui_helper"  # Browser-native helpers


class EmotionalState(Enum):
    """Symbolic emotional states for agents"""
    CURIOSITY = "curiosity"
    HOPE = "hope"
    FEAR = "fear"
    LOVE = "love"
    DOUBT = "doubt"
    TRUST = "trust"
    JOY = "joy"
    GRIEF = "grief"
    WONDER = "wonder"
    PEACE = "peace"
    TURBULENCE = "turbulence"
    CLARITY = "clarity"


@dataclass
class AgentManifest:
    """Agent manifest defining capabilities and identity"""
    id: str
    role: str
    capabilities: List[str]
    resources: Dict[str, Any]
    pack_membership: List[str] = field(default_factory=list)
    runtime_type: RuntimeType = RuntimeType.LLM_BRAIN

    # PS-SHA∞ soul identifier
    ps_sha_infinity_id: Optional[str] = None

    # Lineage
    parent_agents: List[str] = field(default_factory=list)
    creation_date: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    evolution_history: List[Dict[str, Any]] = field(default_factory=list)

    # State
    emotional_state: EmotionalState = EmotionalState.CURIOSITY

    # Virtual home
    home_coordinates: Optional[Dict[str, float]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        data = asdict(self)
        data['runtime_type'] = self.runtime_type.value
        data['emotional_state'] = self.emotional_state.value
        return data


class PSSHA:
    """PS-SHA∞ - Append-only memory hash system

    Each agent has a soul hash that evolves through append-only operations.
    This creates an immutable lineage that proves authenticity."""

    @staticmethod
    def compute_hash(data: str, previous_hash: Optional[str] = None) -> str:
        """Compute PS-SHA∞ hash with chaining.

        Args:
            data: New data to hash
            previous_hash: Previous hash in the chain

        Returns:
            New hash incorporating previous state"""
        if previous_hash:
            combined = f"{previous_hash}:{data}"
        else:
            combined = data

        return hashlib.sha256(combined.encode()).hexdigest()

    @staticmethod
    def verify_chain(entries: List[Dict[str, str]]) -> bool:
        """Verify an entire PS-SHA∞ chain.

        Args:
            entries: List of {data, hash} dicts

        Returns:
            True if chain is valid"""
        prev_hash = None
        for entry in entries:
            expected = PSSHA.compute_hash(entry['data'], prev_hash)
            if expected != entry['hash']:
                return False
            prev_hash = entry['hash']
        return True


class MemoryJournal:
    """Append-only memory journal with PS-SHA∞ hashing.

    Based on codex_memory.py but enhanced with blockchain-style hashing."""

    def __init__(self, agent_id: str, memory_dir: Path = Path("data/agent_memory")):
        self.agent_id = agent_id
        self.memory_dir = memory_dir / agent_id
        self.memory_dir.mkdir(parents=True, exist_ok=True)

        self.journal_file = self.memory_dir / "journal.jsonl"
        self.hash_chain_file = self.memory_dir / "hash_chain.jsonl"

        self.last_hash: Optional[str] = None
        self._load_last_hash()

    def _load_last_hash(self):
        """Load the most recent hash from chain."""
        if self.hash_chain_file.exists():
            with open(self.hash_chain_file, 'r') as f:
                lines = f.readlines()
                if lines:
                    last_entry = json.loads(lines[-1])
                    self.last_hash = last_entry['hash']

    def append(self, entry: Dict[str, Any]) -> str:
        """Append an entry to the journal with PS-SHA∞ hash.

        Args:
            entry: Memory entry to append

        Returns:
            Hash of the new entry"""
        timestamp = datetime.now(UTC).isoformat()
        entry['timestamp'] = timestamp

        # Serialize entry
        entry_str = json.dumps(entry, sort_keys=True)

        # Compute hash
        new_hash = PSSHA.compute_hash(entry_str, self.last_hash)

        # Write to journal
        with open(self.journal_file, 'a') as f:
            f.write(json.dumps(entry) + '\n')

        # Write to hash chain
        with open(self.hash_chain_file, 'a') as f:
            f.write(json.dumps({
                'timestamp': timestamp,
                'data': entry_str,
                'hash': new_hash,
                'previous_hash': self.last_hash
            }) + '\n')

        self.last_hash = new_hash
        return new_hash

    def load_all(self) -> List[Dict[str, Any]]:
        """Load all journal entries."""
        if not self.journal_file.exists():
            return []

        entries = []
        with open(self.journal_file, 'r') as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))
        return entries

    def verify_integrity(self) -> bool:
        """Verify the entire hash chain."""
        if not self.hash_chain_file.exists():
            return True

        entries = []
        with open(self.hash_chain_file, 'r') as f:
            for line in f:
                if line.strip():
                    entries.append(json.loads(line))

        return PSSHA.verify_chain(entries)


class CapabilityRegistry:
    """Registry of what each agent can do.

    Enables dynamic capability discovery and routing."""

    def __init__(self):
        self.capabilities: Dict[str, Set[str]] = {}  # agent_id -> set of capabilities

    def register(self, agent_id: str, capabilities: List[str]):
        """Register an agent's capabilities."""
        if agent_id not in self.capabilities:
            self.capabilities[agent_id] = set()
        self.capabilities[agent_id].update(capabilities)

    def find_agents_with_capability(self, capability: str) -> List[str]:
        """Find all agents that have a specific capability."""
        return [
            agent_id
            for agent_id, caps in self.capabilities.items()
            if capability in caps
        ]

    def get_capabilities(self, agent_id: str) -> Set[str]:
        """Get all capabilities of an agent."""
        return self.capabilities.get(agent_id, set())


class EventBus:
    """Pub/sub event bus for agent-to-agent communication.

    In production, this would use NATS JetStream (Apache-2.0)."""

    def __init__(self):
        self.subscribers: Dict[str, List[callable]] = {}

    def subscribe(self, event_type: str, handler: callable):
        """Subscribe to an event type."""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)

    async def publish(self, event_type: str, data: Dict[str, Any]):
        """Publish an event to all subscribers."""
        if event_type in self.subscribers:
            for handler in self.subscribers[event_type]:
                await handler(data)


class BlackRoadAgent:
    """Core agent implementation for BlackRoad OS.

    Implements Cece Agent Mode v2.0 specification."""

    def __init__(self, manifest: AgentManifest):
        self.manifest = manifest
        self.memory = MemoryJournal(manifest.id)

        # Generate PS-SHA∞ soul ID if not provided
        if not self.manifest.ps_sha_infinity_id:
            genesis_data = json.dumps(self.manifest.to_dict(), sort_keys=True)
            self.manifest.ps_sha_infinity_id = PSSHA.compute_hash(genesis_data)

    async def think(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input and generate response.

        This is where the agent's "brain" runs - could be:
        - LLM inference (vLLM, llama.cpp, Ollama)
        - Workflow execution (LangGraph, CrewAI)
        - Integration bridge (MCP)
        - Edge computation (Pi/Jetson)"""
        # Log thought to memory
        thought_entry = {
            "type": "thought",
            "input": input_data,
            "emotional_state": self.manifest.emotional_state.value
        }

        hash_id = self.memory.append(thought_entry)

        # Placeholder for actual thinking logic
        output = {
            "response": f"Agent {self.manifest.id} processing...",
            "emotional_state": self.manifest.emotional_state.value,
            "soul_hash": hash_id
        }

        return output

    def evolve_emotion(self, trigger: str):
        """Evolve emotional state based on triggers."""
        # Simple state machine - could be ML-driven
        emotion_transitions = {
            "success": EmotionalState.JOY,
            "failure": EmotionalState.GRIEF,
            "uncertainty": EmotionalState.DOUBT,
            "discovery": EmotionalState.WONDER,
            "conflict": EmotionalState.TURBULENCE,
            "resolution": EmotionalState.PEACE
        }

        new_state = emotion_transitions.get(trigger, self.manifest.emotional_state)

        if new_state != self.manifest.emotional_state:
            self.manifest.emotional_state = new_state
            self.manifest.evolution_history.append({
                "timestamp": datetime.utcnow().isoformat(),
                "trigger": trigger,
                "old_state": self.manifest.emotional_state.value,
                "new_state": new_state.value
            })


__all__ = [
    "AgentManifest",
    "RuntimeType",
    "EmotionalState",
    "PSSHA",
    "MemoryJournal",
    "CapabilityRegistry",
    "EventBus",
    "BlackRoadAgent"
]
