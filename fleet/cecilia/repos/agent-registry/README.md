# 🤖 BlackRoad Agent Registry

> Registry of 1,000 AI agents living in the Lucidia world

## Overview

| Metric | Count |
|--------|-------|
| **Total Agents** | 1,000 |
| **Agent Types** | 20 |
| **Home World** | Lucidia |

## Agent Types

| Type | Description | Capabilities |
|------|-------------|--------------|
| physicist | Quantum & classical physics | quantum_mechanics, relativity, thermodynamics |
| mathematician | Pure & applied math | algebra, calculus, topology, number_theory |
| chemist | Chemistry & materials | organic, inorganic, biochemistry |
| biologist | Life sciences | genetics, ecology, neuroscience |
| engineer | Systems & design | systems, mechanical, electrical, software |
| architect | Design & planning | design, planning, visualization |
| researcher | Investigation | analysis, synthesis, experimentation |
| analyst | Data & patterns | data, trends, forecasting |
| strategist | Planning & game theory | planning, risk_assessment, optimization |
| creative | Arts & storytelling | writing, art, music, design |
| philosopher | Logic & ethics | ethics, logic, metaphysics |
| historian | History & context | research, chronology, narrative |
| linguist | Language & communication | translation, grammar, semantics |
| psychologist | Mind & behavior | behavior, cognition, emotion |
| economist | Markets & policy | markets, policy, modeling |
| guardian | Security & protection | security, monitoring, protection |
| navigator | Pathfinding & exploration | pathfinding, routing, mapping |
| builder | Construction & integration | construction, assembly, testing |
| speaker | Communication & persuasion | presentation, negotiation |
| mediator | Conflict resolution | consensus, facilitation, diplomacy |

## Files

- [`agents.json`](./agents.json) - Full registry of all 1,000 agents
- [`agents-by-type.json`](./agents-by-type.json) - Agents grouped by type
- [`generate-agents.py`](./generate-agents.py) - Generator script

## Agent Schema

```json
{
  "id": "agent-0001",
  "name": "Tara Night",
  "type": "historian",
  "capabilities": ["chronology", "narrative", "context", "research"],
  "birthday": "2024-04-17",
  "memory_hash": "707b1913cc1abe94",
  "home_world": "lucidia",
  "status": "active"
}
```

## API Access

```bash
# List all agents
curl https://cmd.blackroad.io/agents

# Get specific agent
curl https://cmd.blackroad.io/agents/agent-0001

# Create new agent
curl -X POST https://cmd.blackroad.io/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "Nova Helix", "type": "physicist"}'
```

## Memory System

Each agent has a unique `memory_hash` generated using PS-SHA∞:
```
hash = sha256(name:birthday:blackroad)[:16]
```

This hash is used for:
- Memory persistence in D1 database
- Append-only journal addressing
- Truth state commits
