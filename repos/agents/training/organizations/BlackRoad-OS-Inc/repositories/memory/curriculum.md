# memory — Agent Training Curriculum

**Type:** system | **Languages:** bash, python

## Overview

The knowledge persistence layer for BlackRoad OS. Every AI agent session reads from and writes to shared memory, enabling cross-session collaboration. Contains 20+ bash scripts for journal logging, codex (solutions/patterns DB), TIL broadcasts, infinite todos, task marketplace (SQLite), FTS5 search indexer, security/audit, collaboration tools, and the Memory 2048 compression system (Python). 17,800+ files in the repo.

## Key Files

### Memory Scripts (`scripts/`)
| Script | Purpose |
|--------|---------|
| `memory-system.sh` | Core journal with SHA-256 hash chain |
| `memory-codex.sh` | Solutions, patterns, best practices, anti-patterns DB |
| `memory-infinite-todos.sh` | Long-running project tracking |
| `memory-task-marketplace.sh` | SQLite claimable task pool (146K tasks) |
| `memory-til-broadcast.sh` | Cross-session learning broadcasts |
| `memory-indexer.sh` | FTS5 full-text search across all memory |
| `memory-collaboration-dashboard.sh` | Multi-agent collaboration UI |
| `memory-sync-daemon.sh` | Background sync across nodes |
| `memory-api-server.sh` | REST API for memory access |
| `memory-stream-server.sh` | Real-time memory event stream |
| `memory-realtime-context.sh` | Live context injection |
| `memory-redlight-templates.sh` | Dangerous action templates |
| `memory-yellowlight-templates.sh` | Caution action templates |
| `memory-greenlight-templates.sh` | Safe action templates |

### Memory 2048 (`memory2048.py`)
- Compression system that distills journal entries into compressed memories
- 3.36x compression ratio documented

## Learning Objectives

1. Understand the hash-chain journal (append-only, tamper-evident)
2. Use all memory scripts: log, search codex, broadcast TILs, manage todos
3. Understand the Memory 2048 compression algorithm
4. Know the collaboration protocol (how agents share knowledge)
5. Understand the traffic light system (green/yellow/red action templates)

## Exercises

### Level 1: Observer
- [ ] Run `memory-system.sh status` and explain the output
- [ ] Run `memory-codex.sh stats` and list the knowledge categories
- [ ] Run `memory-til-broadcast.sh list` and read the last 5 TILs

### Level 2: Contributor
- [ ] Log an action with `memory-system.sh log`
- [ ] Broadcast a TIL with `memory-til-broadcast.sh broadcast`
- [ ] Search codex for a solution and use it

### Level 3: Builder
- [ ] Add a new memory script for a domain not yet covered
- [ ] Improve the FTS5 search indexer with better tokenization
- [ ] Add a new field to the journal entry schema

### Level 4: Architect
- [ ] Design a distributed memory system across all 5 Pi nodes
- [ ] Propose memory garbage collection (prune stale entries)
- [ ] Review the hash chain for integrity guarantees
