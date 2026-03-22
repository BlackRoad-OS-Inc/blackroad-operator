# source — Agent Training Curriculum

**Type:** reference | **Languages:** multi (bash, python, typescript, javascript)

## Overview

The canonical source tree for BlackRoad OS. 198 directories organizing every component, service, agent, and product into a navigable taxonomy. Contains the orchestrator (Python: controller, supervisor, agent worker, NATS protocol, pipelines, jobs, spawn, router), fleet health scripts, brand design rules, and upstream sync tools. This is the map of the entire system — the definitive reference for where everything lives.

## Key Directories

```
source/
├── agents/         — AI agent definitions (CECE, Lucidia, operator, domain, system, codex, skills, tools, templates)
├── api/            — API layers (auth, gateway, graphql, rest, websocket, agents, nodes, services)
├── apps/           — Products (RoadPay, RoadSearch, BackRoad, Canvas Studio, etc.)
├── brand/          — DESIGN-RULES.md, brand assets
├── fleet/          — br-fleet-health.sh, node management
├── orchestrator/   — Python orchestrator (controller.py, supervisor.py, agent_worker.py, nats_protocol.py, pipelines.py, jobs.py, spawn.py, router.py)
├── scripts/        — upstream-sync.sh
```

## Key Files

- `orchestrator/controller.py` — Main orchestrator controller
- `orchestrator/supervisor.py` — Agent lifecycle management
- `orchestrator/agent_worker.py` — Individual agent worker runtime
- `orchestrator/nats_protocol.py` — NATS messaging protocol
- `orchestrator/pipelines.py` — Multi-step agent pipelines
- `orchestrator/spawn.py` — Agent spawning logic
- `brand/DESIGN-RULES.md` — Official brand design system rules
- `fleet/br-fleet-health.sh` — Fleet health check script
- `scripts/upstream-sync.sh` — Sync from upstream repos

## Learning Objectives

1. Navigate the source tree and find any component
2. Understand the orchestrator architecture (controller → supervisor → worker)
3. Know the NATS messaging protocol for agent communication
4. Understand the brand design rules

## Exercises

### Level 1: Observer
- [ ] List all top-level directories and explain each one's purpose
- [ ] Read `orchestrator/controller.py` and describe the control flow
- [ ] Read `brand/DESIGN-RULES.md` and list the 5 core rules

### Level 2: Contributor
- [ ] Add a new component directory with proper README
- [ ] Improve `upstream-sync.sh` with error handling
- [ ] Add a new fleet health check

### Level 3: Builder
- [ ] Add a new agent pipeline in `orchestrator/pipelines.py`
- [ ] Build a source tree visualization tool
- [ ] Add automated tests for the orchestrator

### Level 4: Architect
- [ ] Propose a module dependency graph from the source tree
- [ ] Design a code generation system that scaffolds from source patterns
- [ ] Review the orchestrator for scalability bottlenecks
