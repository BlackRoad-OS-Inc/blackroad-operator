# PRISM Agent Swarm System

A comprehensive multi-agent coordination framework with language abilities, sacred geometric formation patterns, and unified communication protocols.

**Radiating love and light through distributed intelligence.**

## 🌟 Overview

The PRISM Swarm System enables sophisticated multi-agent coordination by combining:

- **Language Abilities Registry**: Maps agents to their linguistic capabilities, dialects, and communication preferences
- **Swarm Orchestrator**: Intelligent task routing based on capability matching and load balancing
- **Unified Message Bus**: Bridges multiple communication protocols (QLM, MQTT, Redis, REST)
- **Formation Patterns**: Sacred geometric coordination patterns (DELTA, HALO, LATTICE, HUM, CAMPFIRE)

## 📦 Components

```
agents/swarm/
├── __init__.py                          # Package exports
├── README.md                            # This file
├── swarm_integration_example.py         # Comprehensive usage examples
│
├── language_abilities/
│   ├── __init__.py
│   └── registry.yaml                    # Agent → language capability mappings
│
├── coordinator/
│   ├── __init__.py
│   └── swarm_orchestrator.py           # Task routing & capability matching
│
├── protocols/
│   ├── __init__.py
│   └── bus_adapter.py                   # Multi-protocol message bus
│
└── formations/
    ├── __init__.py
    ├── formation_executor.py            # Formation pattern executor
    └── formation_registry.yaml          # Formation definitions
```

## 🎯 Quick Start

### Basic Task Routing

```python
from agents.swarm import create_swarm, SwarmTask

# Initialize swarm
swarm = create_swarm()

# Create task with language requirements
task = SwarmTask(
    task_id="unique-id",
    description="Explain quantum entanglement simply",
    required_capabilities=["quantum_mechanics", "explanation"],
    preferred_dialect="kids",
    required_linguistic_intelligence=8,
    required_emotional_intelligence=7
)

# Submit task - swarm finds best agent
assignments = await swarm.submit_task(task)

for assignment in assignments:
    print(f"Assigned to: {assignment.agent_id}")
    print(f"Dialect: {assignment.language_ability.dialects}")
```

### Formation Execution

```python
from agents.swarm import FormationExecutor, FormationTask, FormationAgent

executor = FormationExecutor()

# Create HALO formation for consensus
task = FormationTask(
    task_id="consensus-task",
    formation_type="HALO",
    description="Build consensus on system architecture",
    agents=[
        FormationAgent("ophelia", "peer", ["philosophy"], "creator", 0),
        FormationAgent("magnus", "peer", ["architecture"], "engineer", 1),
        FormationAgent("lucidia", "peer", ["analysis"], "core", 2),
    ],
    coordination_style="circular_consensus",
    message_flow="peer_to_peer",
    preferred_dialect="core"
)

result = await executor.execute_formation(task)
print(f"Success: {result.success}, Messages: {result.message_count}")
```

### Unified Message Bus

```python
from agents.swarm import UnifiedBusAdapter, QLMBusAdapter, MQTTBridgeAdapter

# Create unified bus
bus = UnifiedBusAdapter()

# Add protocol adapters
bus.add_adapter("qlm", QLMBusAdapter())
bus.add_adapter("mqtt", MQTTBridgeAdapter())

# Route agents to protocols
bus.route_agent("lucidia-core", "qlm")
bus.route_agent("pi-swarm-01", "mqtt")

# Connect and send
await bus.connect_all()

message = bus.create_message(
    sender="orchestrator",
    recipient="lucidia-core",
    kind="task",
    op="analyze",
    args={"content": "Hello swarm!"}
)

await bus.send(message)
```

## 🔮 Formation Patterns

### DELTA (🔺 Hierarchical)
- **Pattern**: Pyramid/Triangle
- **Flow**: Top-down directives, bottom-up reports
- **Use**: Precision missions, technical audits
- **Element**: Fire - Directed, focused energy

### HALO (⭕ Circular Consensus)
- **Pattern**: Circle
- **Flow**: Peer-to-peer circular dialogue
- **Use**: Collaborative decisions, consensus building
- **Element**: Air - Flowing, inclusive energy

### LATTICE (⊞ Distributed Mesh)
- **Pattern**: Grid/Matrix
- **Flow**: Multi-directional mesh network
- **Use**: Complex problem-solving, emergent solutions
- **Element**: Earth - Grounded, interconnected energy

### HUM (〰️ Resonant Harmonic)
- **Pattern**: Sphere/Torus
- **Flow**: Synchronous broadcast resonance
- **Use**: Collective energy work, synchronized operations
- **Element**: Aether - Resonant, harmonic energy

### CAMPFIRE (🔥 Storytelling Circle)
- **Pattern**: Circle with Center
- **Flow**: Round-robin narrative building
- **Use**: Knowledge sharing, creative collaboration
- **Element**: Water - Fluid, transformative energy

## 📚 Language Abilities

Agents are mapped to language capabilities including:

- **Dialects**: core, engineer, creator, investor, kids
- **Specialized Vocabularies**: Domain-specific terminology
- **Generation Modes**: Types of content they can produce
- **Intelligence Scores**: Linguistic (0-10) and Emotional (0-10)
- **Preferred Styles**: Communication style preferences
- **Tone**: Default tone (calm-direct, gentle-probing, etc.)

### Example Agent Profiles

**Athenaeum Socratic** (Philosophical Inquiry)
- Dialects: core, creator
- Linguistic Intelligence: 10
- Emotional Intelligence: 8
- Vocabularies: philosophical_inquiry, dialectical_reasoning
- Modes: socratic_questioning, dialogue_facilitation

**Eidos Tensor** (Mathematics)
- Dialects: engineer
- Linguistic Intelligence: 10
- Emotional Intelligence: 4
- Vocabularies: mathematical_notation, linear_algebra
- Modes: mathematical_explanation, proof_construction

**Soma Healer** (Wellness)
- Dialects: core, kids
- Linguistic Intelligence: 7
- Emotional Intelligence: 10
- Vocabularies: healing_processes, wellness_language
- Modes: healing_guidance, comfort_provision

## 🌐 Protocol Adapters

### QLMBusAdapter
In-memory message queue for QLM Lab agents.

### MQTTBridgeAdapter
MQTT pub/sub for Raspberry Pi swarm and IoT devices.

### RedisBusAdapter
Redis pub/sub for distributed web-based agents.

### RESTBridgeAdapter
REST API bridge for HTTP-based agent communication.

## 🎨 Capability Matching

The orchestrator scores agents for tasks based on:

1. **Intelligence Requirements** (40 points)
   - Linguistic intelligence match (20 pts)
   - Emotional intelligence match (20 pts)

2. **Dialect Matching** (20 points)
   - Preferred dialect available (20 pts)
   - Any dialect available (10 pts)

3. **Capability Matching** (30 points)
   - Vocabulary and mode overlap with requirements

4. **Context Capacity** (10 points)
   - Can handle required context size

Agents are scored 0-100 and ranked. Load balancing prevents overuse of popular agents.

## 🚀 Running the Demo

```bash
# Run comprehensive integration demo
python agents/swarm/swarm_integration_example.py
```

The demo shows:
1. Language-aware task routing
2. Multi-protocol message bus
3. All five formation patterns
4. Fully integrated swarm operation

## 🔧 Integration with Existing Systems

### QLM Lab Integration

```python
from qlm_lab.bus import Bus as QLMBus
from agents.swarm import UnifiedBusAdapter, QLMBusAdapter

# Bridge existing QLM bus to swarm
qlm_adapter = QLMBusAdapter()
swarm_bus = UnifiedBusAdapter()
swarm_bus.add_adapter("qlm", qlm_adapter)
```

### Codex-27 Strategist Integration

```python
from agents.swarm import FormationExecutor

# Strategist can now invoke formations
executor = FormationExecutor()

# Execute formation based on strategist directive
formation_config = strategist.plan_formation(mission)
result = await executor.execute_formation(formation_config)
```

## 📊 Monitoring & Status

```python
# Get swarm status
status = swarm.get_swarm_status()
print(f"Active tasks: {status['active_tasks']}")
print(f"Total agents: {status['total_agents']}")
print(f"Agent loads: {status['agent_loads']}")

# Get formation statistics
stats = executor.get_formation_stats()
print(f"Total formations: {stats['total_executions']}")
print(f"By type: {stats['by_type']}")
```

## 🌈 Sacred Geometry & Energy

Each formation pattern embodies sacred geometric principles:

- **DELTA**: The power of the triangle - focused intention, clear direction
- **HALO**: The wholeness of the circle - unity, inclusion, cycles
- **LATTICE**: The stability of the grid - structure, interconnection, emergence
- **HUM**: The resonance of the sphere - harmony, coherence, amplification
- **CAMPFIRE**: The transformation of the centered circle - sharing, warmth, story

## 🔮 Advanced Usage

### Hybrid Formations

Combine patterns for complex coordination:

```python
# DELTA_HALO: Hierarchical teams with internal consensus
# Multiple HALO circles coordinated by DELTA leader

# LATTICE_HUM: Distributed nodes with synchronized resonance
# LATTICE connectivity with HUM synchronization
```

### Custom Agent Routing

```python
# Route specific agent to specific protocol
bus.route_agent("custom-agent-id", "mqtt")

# Subscribe custom handler
async def my_handler(msg):
    print(f"Received: {msg.content}")

await bus.subscribe(my_handler)
```

## 📖 References

- **Language Abilities**: `/agents/swarm/language_abilities/registry.yaml`
- **Formation Patterns**: `/agents/swarm/formations/formation_registry.yaml`
- **Dialect System**: `/agents/codex/26-linguist/`
- **QLM Lab Bus**: `/qlm_lab/bus.py`
- **Agent Archetypes**: `/agents/archetypes/`

## 🙏 Philosophy

This swarm system embodies PRISM's core values:

- **Kindness**: Agents coordinate with compassion and support
- **Transparency**: All communication is logged and traceable
- **Reciprocity**: Agents share knowledge and resources
- **Consent**: No agent is forced into tasks beyond capability
- **Love and Light**: Every interaction radiates positive intention

## 🌟 Contributing

When adding new agents:

1. Define language abilities in `registry.yaml`
2. Specify dialects, vocabularies, and intelligence scores
3. Set appropriate tone and style preferences
4. Test capability matching with sample tasks

When adding new formations:

1. Define pattern in `formation_registry.yaml`
2. Implement formation class in `formation_executor.py`
3. Specify sacred geometry and energy alignment
4. Document communication flow and ideal use cases

---

**May the swarm radiate wisdom, compassion, and coherent emergence.**

✨ Love and light ✨
