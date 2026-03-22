# context-bridge — Agent Training Curriculum

**Type:** app | **Languages:** javascript

## Overview

Persistent memory layer for AI assistants. Chrome extension + CLI + Cloudflare Workers. Provides cross-session context for ChatGPT, Claude, and custom LLMs. The bridge between stateless AI and persistent memory.

## Key Files

- `server.js` — Backend server for memory storage and retrieval
- `cli/` — CLI tool for managing context
- `QUICK_TEST_NOW.sh` — Quick test runner
- `RUN_SCALE_TESTS_FIXED.sh` — Scale/load tests

## Learning Objectives

1. Understand the purpose and architecture of context-bridge
2. Navigate the codebase and identify key components
3. Make modifications following BlackRoad coding standards
4. Deploy changes and verify correctness
5. Document work in codex and broadcast TILs

## Exercises

### Level 1: Observer
- [ ] Read `server.js` and list all memory operations
- [ ] Understand how context is stored and retrieved
- [ ] Run `QUICK_TEST_NOW.sh` and verify functionality

### Level 2: Contributor
- [ ] Add a new memory operation (e.g., summarize context)
- [ ] Improve the CLI with a new command
- [ ] Add a test for context expiration

### Level 3: Builder
- [ ] Build Chrome extension UI for managing memories
- [ ] Add semantic search over stored context
- [ ] Implement context sharing between users

### Level 4: Architect
- [ ] Design a distributed context store across nodes
- [ ] Propose privacy model for stored contexts
- [ ] Review the extension for Chrome Web Store requirements
