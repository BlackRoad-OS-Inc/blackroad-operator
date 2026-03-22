# Tutorial 06 — Memory System Deep Dive

> **Prerequisites:** Tutorial 05 (Gateway Setup)  
> **Time:** ~30 minutes  
> **Goal:** Understand PS-SHA∞ memory, write to the chain, verify integrity

---

## What Is PS-SHA∞?

**PS-SHA∞** (Persistent Secure SHA-Infinity) is the memory architecture at the core of BlackRoad OS.

Key properties:
1. **Append-only** — entries are never edited in place, only appended
2. **Hash-chained** — each entry references the previous entry's hash
3. **Tamper-evident** — breaking any link in the chain is detectable
4. **Cryptographically quarantined** — "deleted" entries are replaced with `[ERASED:SHA256(original)]`

### Hash Formula

```
SHA256(prev_hash + ":" + content + ":" + timestamp_nanoseconds)
```

The genesis entry uses `"GENESIS"` as `prev_hash`.

---

## Setting Up

```bash
pip install blackroad-sdk

# Or directly
pip install httpx aiofiles
```

---

## Writing to Memory

```python
import asyncio
from blackroad_sdk import BlackRoadClient

async def main():
    async with BlackRoadClient() as client:
        # Write a simple fact
        entry = await client.memory_write("agent.lucidia.preference", {
            "model": "qwen2.5:7b",
            "temperature": 0.7,
            "last_updated": "2026-01-15"
        })
        print("Written:", entry)

asyncio.run(main())
```

---

## Reading from Memory

```python
async with BlackRoadClient() as client:
    # Read a specific key
    value = await client.memory_read("agent.lucidia.preference")
    print("Value:", value)

    # List all entries
    entries = await client.memory_list()
    for e in entries:
        print(f"{e['key']}: {e['hash'][:8]}... (truth={e['truth_state']})")
```

---

## Verifying the Chain

```python
import hashlib
import json

def verify_chain(entries: list[dict]) -> bool:
    """Verify the PS-SHA∞ hash chain integrity."""
    prev_hash = "GENESIS"
    for i, entry in enumerate(entries):
        content = json.dumps(entry["value"], sort_keys=True)
        expected = hashlib.sha256(
            f"{prev_hash}:{content}:{entry['timestamp_ns']}".encode()
        ).hexdigest()
        if expected != entry["hash"]:
            print(f"Chain broken at entry {i}: key={entry['key']}")
            print(f"  Expected: {expected}")
            print(f"  Got:      {entry['hash']}")
            return False
        prev_hash = entry["hash"]
    print(f"Chain verified: {len(entries)} entries intact")
    return True

# Use it
entries = await client.memory_list()
verify_chain(entries)
```

---

## Erasure (Cryptographic Quarantine)

In PS-SHA∞, you never truly delete — you **quarantine**:

```python
import hashlib

original_content = "sensitive information"
erased = f"[ERASED:{hashlib.sha256(original_content.encode()).hexdigest()}]"
# Result: [ERASED:abc123...] — proves deletion without revealing content
```

This lets you prove that content existed and was intentionally removed, without re-exposing it.

---

## Truth States

Every memory entry has a `truth_state` from Łukasiewicz trinary logic:

| Value | Meaning | When to use |
|-------|---------|-------------|
| `1` | True | Verified fact |
| `0` | Unknown | Uncertain, needs confirmation |
| `-1` | False | Verified false |

```python
# Write with explicit truth state
await client.memory_write("claim.api_is_rest", {"value": True}, truth_state=1)
await client.memory_write("claim.api_uses_graphql", {"value": False}, truth_state=-1)
await client.memory_write("claim.supports_grpc", {"value": "unknown"}, truth_state=0)
```

---

## Practical: Session Memory for an Agent

```python
import asyncio
import time
from blackroad_sdk import BlackRoadClient

async def agent_session():
    session_id = f"session.{int(time.time())}"
    async with BlackRoadClient() as client:
        # Record session start
        await client.memory_write(f"{session_id}.start", {
            "agent": "LUCIDIA", "task": "research"
        })

        # Do some work
        answer = await client.chat("Summarize PS-SHA infinity in 2 sentences.")
        
        # Record the result
        await client.memory_write(f"{session_id}.result", {
            "question": "Summarize PS-SHA∞",
            "answer": answer
        })

        # Verify everything is intact
        entries = await client.memory_list()
        session_entries = [e for e in entries if e["key"].startswith(session_id)]
        print(f"Session {session_id}: {len(session_entries)} entries recorded")

asyncio.run(agent_session())
```

---

## Next Steps

- **Tutorial 07:** Multi-agent coordination (routing tasks between agents)
- **Tutorial 08:** Deploying your own BlackRoad OS instance
