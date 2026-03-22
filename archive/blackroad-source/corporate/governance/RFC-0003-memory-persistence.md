# RFC-0003: Unified Memory Persistence

**Status:** Accepted  
**Authors:** BlackRoad OS, Inc.  
**Date:** 2026-02  

## Problem

Agent memory is fragmented across:
- In-process Python dicts (lost on restart)
- SQLite files per-tool (`~/.blackroad/*.db`)  
- GitHub repo artifacts (`worlds/*.md`)
- Flat text files in `~/.blackroad/memory/`

Agents can't share memories or retrieve relevant context across sessions.

## Proposed Solution

Three-tier unified memory architecture:

### Tier 1: Working Memory (in-process, ephemeral)
- Python dict, lost on restart
- Used for conversation context < 30min

### Tier 2: Session Memory (PS-SHA∞ journal, local)
```
~/.blackroad/memory/journals/master-journal.jsonl
```
- Hash-chained, tamper-evident
- Survives restarts
- Searchable by key + content

### Tier 3: Semantic Memory (vector DB, shared)
- Ollama `nomic-embed-text` generates embeddings
- Qdrant stores + retrieves by similarity
- Shared across all agents via gateway

## API

```python
from blackroad_sdk.memory import MemoryChain

m = MemoryChain()
m.remember("fact", "The gateway is tokenless")       # Tier 2
m.observe("uptime", "aria64 99.1% over 7 days")      # Tier 2
m.infer("health", "fleet is operating normally")      # Tier 2

results = m.search("gateway security")               # Searches T2 + T3
```

## Migration

Existing SQLite databases remain unchanged. New agents use SDK memory API.
Old data can be migrated with `br cece import --from-sqlite`.

## Consequences

✅ Agents share persistent, searchable memory  
✅ Tamper-evident via PS-SHA∞  
✅ No external dependencies for T2  
⚠️  T3 requires Qdrant running (graceful degradation to T2 only)  
