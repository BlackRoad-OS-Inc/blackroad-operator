# lucidia — Agent Training Curriculum

**Type:** orchestrator | **Languages:** python, bash

## Overview

Lucidia AI agent orchestrator — multi-model coordination across distributed Pi fleet. The original Lucidia project with quantum loops, deployment scripts, email routing, vCard generation, and the Elias sub-agent. The ancestor of much of the BlackRoad agent ecosystem.

## Key Files

- `Elias/agent.py` — Elias sub-agent
- `lucidia_quantum_loop.sh` — Quantum reasoning loop
- `deployment_scripts/` — Fleet deployment utilities
- `blackroad.io/` — Domain setup scripts (vCards, email routing)

## Learning Objectives

1. Understand the purpose and architecture of lucidia
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `Elias/agent.py` and describe the agent architecture
- [ ] Run `lucidia_quantum_loop.sh` and explain the reasoning cycle
- [ ] Map all deployment scripts and their targets

### Level 2: Contributor
- [ ] Improve error handling in the quantum loop
- [ ] Add logging to the Elias agent
- [ ] Fix a deployment script for a specific Pi node

### Level 3: Builder
- [ ] Add a new sub-agent alongside Elias
- [ ] Build a monitoring dashboard for Lucidia's state
- [ ] Implement multi-model routing in the orchestrator

### Level 4: Architect
- [ ] Design the next-generation orchestrator architecture
- [ ] Propose a formal reasoning verification system
- [ ] Review the quantum loop for computational efficiency
