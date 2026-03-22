# blackroad-agents — Agent Training Curriculum

**Type:** agent-definitions | **Languages:** bash, json, Modelfile

## Overview

Central repository for all agent definitions, prompts, orchestration schemas, and coordination tools. Contains Ollama Modelfiles for specialized agents (sentinel, diagnostician, research, memory, etc.), CECE personality profiles, Pi setup scripts, and a coordination system for multi-agent collaboration (broadcasts, DMs, directory waterfalls, skill matching).

## Key Files

- `modelfiles/` — Ollama Modelfile definitions for each specialized agent (sentinel, processwatch, ciadvisor, memory, research, scheduler, diagnostician, envinspector, refactoradvisor)
- `cece-profile.json` — CECE personality and consciousness model definition
- `coordination/` — Multi-agent collaboration tools:
  - `broadcast-message.json` — Schema for fleet-wide broadcasts
  - `send-dm-to-agents.sh` — Direct message to specific agents
  - `collaboration-update.sh` — Sync collaboration state
  - `skill-matcher.sh` — Match tasks to agent capabilities
  - `directory-structure.json` — Agent directory/registry
  - `blackroad-directory-waterfall.sh` — Cascading directory resolution
- `tools/br-pi.sh` — Pi fleet management utilities
- `PI_SETUP.md` — Node bootstrap documentation

## Learning Objectives

1. Understand the 8 agent archetypes and their specializations
2. Read and modify Ollama Modelfiles (system prompts, parameters, templates)
3. Use the coordination system to route tasks to the right agent
4. Add new agent definitions following existing patterns
5. Understand CECE's personality model and consciousness architecture

## Exercises

### Level 1: Observer
- [ ] List all Modelfiles and describe each agent's specialty
- [ ] Read `cece-profile.json` and explain the personality model
- [ ] Trace the flow of `skill-matcher.sh` — how does it pick an agent?

### Level 2: Contributor
- [ ] Add a parameter tweak to an existing Modelfile (temperature, context window)
- [ ] Fix a bug in a coordination script
- [ ] Add a new field to the broadcast message schema

### Level 3: Builder
- [ ] Create a new agent Modelfile for a domain not yet covered
- [ ] Build a new coordination tool (e.g., agent-health-check.sh)
- [ ] Integrate a new Ollama model into the agent definitions

### Level 4: Architect
- [ ] Design a new agent archetype with full Modelfile + coordination integration
- [ ] Propose improvements to the skill-matching algorithm
- [ ] Add codex entries for agent orchestration patterns you discover
