# lucidia-core — Agent Training Curriculum

**Type:** library | **Languages:** python

## Overview

10 domain expert reasoning agents — physicist, mathematician, chemist, geologist, analyst, architect, engineer, painter, poet, speaker. Foundation system with vector store for knowledge retrieval. Each agent has domain-specific reasoning chains and can be composed for multi-domain analysis.

## Key Files

- `foundation_system.py` — Core reasoning framework
- `core/vectors.py` — Vector store for knowledge retrieval
- `intelligence/events.py` — Event system for agent communication
- Domain agents: `poet.py`, `chemist.py`, `engineer.py`, etc.

## Learning Objectives

1. Understand the purpose and architecture of lucidia-core
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `foundation_system.py` and understand the reasoning chain
- [ ] List all 10 domain agents and their specialties
- [ ] Trace how `core/vectors.py` retrieves knowledge

### Level 2: Contributor
- [ ] Add a reasoning step to an existing agent
- [ ] Improve vector search relevance
- [ ] Add a test for cross-domain reasoning

### Level 3: Builder
- [ ] Create a new domain agent (e.g., biologist, historian)
- [ ] Implement agent-to-agent reasoning (physicist + mathematician)
- [ ] Add citation tracking for agent claims

### Level 4: Architect
- [ ] Design a reasoning evaluation framework
- [ ] Propose a knowledge graph integration
- [ ] Review agent composability patterns
