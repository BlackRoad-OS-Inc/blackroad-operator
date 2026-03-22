# remember — Agent Training Curriculum

**Type:** library | **Languages:** python

## Overview

AI-powered persistent memory system for developers. Vector search, SQLite storage, cross-session recall. Includes Lucidia integration with contradiction logging and symbolic kernel. Build AI agents that never forget.

## Key Files

- `symbolic_kernel.py` — Symbolic reasoning kernel for memory processing
- `lucidia/contradiction_log.py` — Logs contradictions in agent reasoning
- `lucidia/lucidia_open.py` — Lucidia integration for open-ended recall

## Learning Objectives

1. Understand the purpose and architecture of remember
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `symbolic_kernel.py` and describe the memory model
- [ ] Understand how contradiction logging works
- [ ] Trace a memory store → recall cycle

### Level 2: Contributor
- [ ] Improve vector search relevance
- [ ] Add a test for contradiction detection
- [ ] Add a new memory operation

### Level 3: Builder
- [ ] Build a memory visualization tool
- [ ] Add semantic clustering of memories
- [ ] Implement memory decay (relevance over time)

### Level 4: Architect
- [ ] Design a distributed memory system across agents
- [ ] Propose a formal memory consistency model
- [ ] Review privacy implications of persistent memory
