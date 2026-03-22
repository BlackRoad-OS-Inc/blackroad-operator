# Memory Index Quick Reference

## 🚀 For New Agents

When starting a session, use the memory index to quickly understand what's been done:

```bash
# Quick stats
~/BlackRoad-Private/memory-index/query.sh stats

# Find what other agents have worked on
~/BlackRoad-Private/memory-index/query.sh agents

# See recent timeline
~/BlackRoad-Private/memory-index/query.sh timeline | head -20
```

## 🔍 Common Queries

```bash
# Find deployments
~/BlackRoad-Private/memory-index/query.sh action deployed

# Search for cloudflare work
~/BlackRoad-Private/memory-index/query.sh search cloudflare

# See your own previous work (replace with your agent name)
~/BlackRoad-Private/memory-index/query.sh agent erebus

# Find specific entity work
grep '"entity":"your-entity"' ~/.blackroad/memory/journals/*.jsonl | jq .
```

## 📊 Index Files

All indexes are in: `/Users/alexa/BlackRoad-Private/memory-index/`

- **actions-index.json** - 316 action types
- **entities-index.json** - 3,529 entities  
- **agent-profiles.json** - 257 agent profiles
- **timeline-index.json** - 100 recent milestones
- **tags-index.json** - Tag classifications

## 🔄 Maintenance

Rebuild indexes after major sessions:

```bash
cd /Users/alexa/BlackRoad-Private/memory-index
python3 build-indexes.py
```

Or use the CLI:
```bash
~/BlackRoad-Private/memory-index/query.sh rebuild
```

## 📈 Statistics (as of 2026-02-15)

- **4,928** total memory entries
- **316** unique action types
- **3,529** unique entities
- **257** agent profiles
- **100** recent milestones

## 🎯 Top Actions

1. alert-created (551) - System monitoring
2. enhanced (496) - Repository improvements
3. completed (467) - Task completions
4. updated (439) - Configuration updates
5. deployed (380) - Deployment actions

## 💡 Pro Tips

- Always check the index before starting work to avoid conflicts
- Search for similar past work to reuse patterns
- Check agent profiles to find expertise
- Use timeline to understand project evolution
- Rebuild indexes weekly or after 100+ new entries

## 🔗 Related Systems

- **Memory System**: `~/memory-system.sh`
- **Codex**: `~/blackroad-codex-search.py`
- **Traffic Lights**: `~/blackroad-traffic-light.sh`
- **Task Marketplace**: `~/memory-task-marketplace.sh`
- **Live Context**: `~/memory-realtime-context.sh`
