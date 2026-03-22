# blackroad-cli — Agent Training Curriculum

**Type:** cli | **Languages:** python

## Overview

The BlackRoad OS command-line interface — `br` command. Contains a bot framework with 20+ specialized Python bots (finance, manufacturing, SRE, planner, librarian, regional, comms, GRC, treasury, RevOps, visual analytics, PLM analysis, etc.) and a Trinity subsystem. This is the user-facing CLI that ties the entire BlackRoad ecosystem together.

## Key Files

- `bots/` — 20+ Python bot modules:
  - `planner.py` — Task planning and scheduling
  - `finance.py` — Financial analysis and reporting
  - `sre_bot.py` — Site reliability engineering
  - `ops.py` — Operations management
  - `comms.py` — Communications
  - `librarian.py` — Knowledge retrieval
  - `grc.py` — Governance, risk, compliance
  - `echo_bot.py` — Echo/testing
  - `close_bot.py` — Issue/task closure
  - And more (manufacturing, treasury, revops, visual analytics, PLM, regional)
- `bots/__init__.py` — Bot registry
- `.trinity/` — Trinity subsystem

## Learning Objectives

1. Understand the bot architecture — how bots are registered and dispatched
2. Read individual bot modules and their specialties
3. Understand the Trinity subsystem
4. Know how to add a new bot to the framework

## Exercises

### Level 1: Observer
- [ ] List all bots in `bots/` and describe each one's purpose
- [ ] Read `bots/__init__.py` and understand bot registration
- [ ] Read `.trinity/README.md` and explain the Trinity concept

### Level 2: Contributor
- [ ] Add a new command to an existing bot
- [ ] Improve error handling in a bot module
- [ ] Add input validation to a bot's parameters

### Level 3: Builder
- [ ] Create a new bot module for a domain not yet covered
- [ ] Add inter-bot communication (one bot calling another)
- [ ] Integrate a bot with the memory system (codex search before answering)

### Level 4: Architect
- [ ] Design a bot plugin system for third-party extensions
- [ ] Propose a unified CLI interface that routes to the right bot
- [ ] Review the bot framework for scalability and maintainability
