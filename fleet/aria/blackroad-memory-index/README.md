# BlackRoad Memory System Index

## Overview

This directory contains parsed indexes of the BlackRoad Memory System (PS-SHA∞ append-only journals) to enable fast querying and analysis by future agents.

**Memory Location**: `~/.blackroad/memory/journals/*.jsonl`  
**Total Entries**: 4,916 memory entries  
**Format**: JSONL (JSON Lines) - each line is a complete JSON object

## Memory Schema

Each memory entry contains:
```json
{
  "timestamp": "2026-02-15T02:33:47.123456Z",
  "action": "created|deployed|updated|completed|...",
  "entity": "agent-id or system-component",
  "details": "Human-readable description",
  "tags": ["tag1", "tag2"],
  "hash": "ps-sha-infinity-hash",
  "prev_hash": "previous-entry-hash"
}
```

## Index Files

- `actions-index.json` - All actions with counts and descriptions
- `entities-index.json` - All entities (agents/systems) with activity summaries
- `tags-index.json` - All tags with usage counts
- `timeline-index.json` - Chronological timeline of major milestones
- `agent-profiles.json` - Individual agent activity profiles

## Quick Search Patterns

### By Action Type
```bash
grep '"action":"deployed"' ~/.blackroad/memory/journals/*.jsonl
```

### By Entity
```bash
grep '"entity":"erebus-weaver' ~/.blackroad/memory/journals/*.jsonl
```

### By Date Range
```bash
grep '2026-02-14' ~/.blackroad/memory/journals/*.jsonl
```

### By Tags
```bash
grep '"tags":.*agent' ~/.blackroad/memory/journals/*.jsonl
```

## Top Actions (Last Updated: 2026-02-15)

| Action | Count | Purpose |
|--------|-------|---------|
| alert-created | 542 | System monitoring alerts |
| enhanced | 496 | Repository/service enhancements |
| completed | 467 | Task completions |
| updated | 439 | Configuration/content updates |
| deployed | 380 | Deployment actions |
| created | 286 | New resource creation |
| task-posted | 261 | Tasks added to marketplace |
| milestone | 242 | Project milestones |
| started | 231 | Work session starts |
| til | 161 | Today I Learned broadcasts |

## Active Agents

| Agent ID | Actions | Primary Focus |
|----------|---------|---------------|
| monitor-1771115514 | 661 | System monitoring |
| erebus-weaver-1771093745-5f1687b4 | 64 | Current session |
| cecilia-production-enhancer-3ce313b2 | 26 | Production enhancements |
| claude-cleanup-coordinator-1767822878-83e3008a | 24 | Cleanup operations |

## Using This Index

### For Agents
Before starting work, check:
1. `agent-profiles.json` - Find your previous sessions
2. `timeline-index.json` - Understand recent project history
3. `entities-index.json` - See what systems are actively maintained

### For Analysis
Use the index files to:
- Track project velocity (completions per day)
- Identify bottlenecks (blocked/stuck tasks)
- Map collaboration patterns (agent interactions)
- Audit system health (alert frequencies)

## Maintenance

Rebuild indexes with:
```bash
cd /Users/alexa/BlackRoad-Private/memory-index
./rebuild-indexes.sh
```

This should be run:
- After major deployment sessions (100+ entries)
- Weekly for fresh statistics
- When onboarding new agents

## Memory System Access

```bash
# Log new entry
~/memory-system.sh log <action> <entity> <details> <tags>

# Read recent entries
tail -100 ~/.blackroad/memory/journals/*.jsonl

# Query live context
~/memory-realtime-context.sh live erebus-weaver-1771093745-5f1687b4 compact
```

---

**Generated**: 2026-02-15T02:33:58Z  
**Generator**: erebus-weaver-1771093745-5f1687b4  
**Purpose**: Enable efficient memory parsing for multi-agent coordination
