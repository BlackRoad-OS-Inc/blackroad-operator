# Tutorial 03: Memory & Persistence

**Level:** Intermediate  
**Time:** ~20 minutes  
**Prerequisites:** Tutorial 02 (Working with Agents)

## What You'll Learn

- How PS-SHA∞ hash-chain memory works
- How to store and recall memories
- How to verify memory integrity
- How memory powers CECE's identity

---

## 1. The PS-SHA∞ Algorithm

Every memory entry is cryptographically linked to the previous one:

```
hash(n) = SHA256( hash(n-1) : content : timestamp_ns )
```

This creates an **append-only, tamper-evident journal** — if anyone modifies a past
entry, the entire chain from that point forward becomes invalid.

The first entry uses `"GENESIS"` as its `prev_hash`.

---

## 2. Writing to Memory

```bash
# Store a fact
br cece experience add --title "Learned about agents" --impact 0.8

# Via API
curl -X POST http://127.0.0.1:8787/v1/memory/store \
  -d '{"content": "User prefers dark mode", "type": "fact", "truth_state": 1}'
```

Memory types:
- `fact` — verified true information
- `observation` — something noticed
- `inference` — a conclusion drawn
- `commitment` — a promise or goal

Truth states:
- `1` = True
- `0` = Uncertain
- `-1` = False (negated/retracted)

---

## 3. Recalling Memory

```bash
# Recall recent memories
br cece experience list

# Search by keyword
curl -X POST http://127.0.0.1:8787/v1/memory/recall \
  -d '{"query": "dark mode", "limit": 5}'
```

---

## 4. Verifying Memory Integrity

```python
from memory_bridge import MemoryBridge

m = MemoryBridge()
is_valid, corrupted = m.verify_chain()

if is_valid:
    print("✅ Memory chain is intact")
else:
    print(f"❌ Corrupted entries at: {corrupted}")
```

---

## 5. Exporting Memory for AI Context

```python
context = m.export_context(max_entries=20)
# Returns a markdown string summarizing recent memories
# Perfect to inject into AI prompts as context
print(context)
```

---

*© BlackRoad OS, Inc. | [blackroad.io](https://blackroad.io)*
