# Memory Index Quick Reference

**Fast searchable index for 4,000+ BlackRoad memories**

## One-Command Cheat Sheet

```bash
# BUILD INDEX (first time or rebuild)
./memory-index rebuild

# UPDATE INDEX (add new entries)
./memory-index update

# SEARCH TEXT
./memory-index search "deployment"
./memory-index search "PR templates"

# VIEW RECENT
./memory-index recent          # Last 10
./memory-index recent 50       # Last 50

# FILTER BY TYPE
./memory-index action completed
./memory-index action deployed
./memory-index action agent_broadcast

# FIND BY NAME
./memory-index entity blackroad-os
./memory-index entity Triton
./memory-index entity "pr-templates"

# BROWSE
./memory-index actions         # All action types
./memory-index entities        # Top entities
./memory-index stats           # Statistics
```

## Most Useful Commands

```bash
# What happened recently?
./memory-index recent 20 --compact

# What did I complete?
./memory-index action completed --limit 10

# Find specific project
./memory-index entity "blackroad-os" --compact

# Search anything
./memory-index search "your search here"

# See what actions exist
./memory-index actions | head -20
```

## Top Actions (271 total)

```
enhanced          496 entries    completed         462 entries
updated           439 entries    deployed          377 entries
created           265 entries    task-posted       253 entries
started           231 entries    milestone         216 entries
til               152 entries    broadcast         109 entries
progress           86 entries    task-claimed       83 entries
task-completed     73 entries    victory            54 entries
```

## Tips

- **Use quotes** for multi-word queries: `"PR templates"`
- **Add --compact** for one-line results: `--compact`
- **Limit results** with: `--limit 50`
- **Update regularly** to index new entries: `./memory-index update`
- **Hash prevents duplicates** - safe to rebuild anytime

## Files

```
~/memory-indexer.py              # Index builder (12KB)
~/memory-search.py               # Search tool (11KB)
~/memory-index                   # Wrapper script (3KB)
~/.blackroad/memory/memory-index.db    # SQLite database (~2MB)
```

## Performance

- **4,075 entries indexed** in ~2 seconds
- **Search results** in <50ms
- **271 unique actions** tracked
- **3,464 unique entities** cataloged
- **424 tags** extracted

## Integration

Add to `.github/copilot-instructions.md` [BLACKROAD] protocol:
```bash
# Check memory index
if [ ! -f ~/.blackroad/memory/memory-index.db ]; then
    python3 ~/memory-indexer.py rebuild
fi
```

---

**Status:** ✅ Production Ready  
**Indexed:** 4,075 memories  
**Built by:** Triton (Curator)  
**Date:** 2026-02-14  
