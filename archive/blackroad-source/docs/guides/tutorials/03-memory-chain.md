# Module 3: The PS-SHA∞ Memory Chain

> "Memory shapes identity" — ECHO

## Learning Objectives

By the end of this module you will:
- Understand the PS-SHA∞ hash-chain memory architecture
- Know the three truth states (Łukasiewicz trinary logic)
- Be able to add, retrieve, and verify memory entries
- Understand contradiction detection and quarantine

## 3.1 What is PS-SHA∞?

PS-SHA∞ stands for **Persistent Session – SHA256 – Infinity**. It is an append-only,
hash-chained journal where every entry cryptographically references its predecessor.

```
GENESIS → entry_1 → entry_2 → entry_3 → …
```

Each entry's hash is computed as:

```
hash_n = SHA256(hash_{n-1} : content_n : timestamp_ns)
```

This makes tampering with any entry detectable — changing `content_n` would invalidate
`hash_n` and all entries after it.

## 3.2 Truth States

BlackRoad uses **Łukasiewicz three-valued logic** for all memory entries:

| State | Value | Meaning |
|-------|-------|---------|
| True | `1` | Verified fact — fully committed |
| Unknown | `0` | Observation — under evaluation |
| False | `-1` | Disproven — quarantined |

### Operations

| Operation | Symbol | Formula |
|-----------|--------|---------|
| Negation | ¬a | −a |
| Conjunction | a ∧ b | min(a, b) |
| Disjunction | a ∨ b | max(a, b) |
| Implication | a → b | min(1, 1 − a + b) |

## 3.3 Adding Memories via the SDK

```typescript
import { BlackRoadClient } from "@blackroad/sdk";

const client = new BlackRoadClient();

// Add a fact (truth_state = 1)
await client.memory.add({
  content: "The gateway runs on port 8787 by default",
  type: "fact",
  truthState: 1,
  agent: "OCTAVIA",
  tags: ["infrastructure", "gateway"],
});

// Add an observation (truth_state = 0 — uncertain)
await client.memory.add({
  content: "High memory usage detected on Pi node at 02:00 UTC",
  type: "observation",
  truthState: 0,
  agent: "PRISM",
  tags: ["monitoring", "pi"],
});

// List recent memories
const entries = await client.memory.list({ limit: 10, type: "fact" });
console.log(`Found ${entries.length} facts`);
```

## 3.4 Chain Verification

```typescript
// Remote verification (gateway checks all hashes)
const result = await client.memory.verify();
console.log(`Chain valid: ${result.chainValid}`);
console.log(`Entries: ${result.checked}/${result.total}`);

if (!result.chainValid) {
  console.error(`Tampered entry: ${result.firstInvalid}`);
}
```

## 3.5 Contradiction Detection

Two memory entries contradict if their equivalence truth value is −1:

```python
from blackroad_sdk.memory import verify_chain, MemoryEntry

# If agent ALICE says "API is online" (truth=1)
# and agent CIPHER says "API is offline" (truth=-1) on same claim:
a = 1   # True
b = -1  # False

# Łukasiewicz equivalence: (a→b) ∧ (b→a)
equiv = min(min(1, 1-a+b), min(1, 1-b+a))  # = -1
if equiv == -1:
    print("CONTRADICTION — quarantine both claims")
```

The gateway automatically detects this and flags both entries with `quarantined: true`.

## Exercise

1. Add 5 memory entries using the SDK: 2 facts, 2 observations, 1 inference.
2. List them filtered by `type=fact`.
3. Run chain verification — it should return `chainValid: true`.
4. Try to create two contradicting entries and observe the quarantine behavior.

## Summary

- PS-SHA∞ creates tamper-evident memory via hash chaining
- Three truth states (1/0/−1) enable epistemic reasoning under uncertainty
- Contradictions are detected algebraically and quarantined rather than deleted
- The chain can be verified locally or via the gateway

---
**Next: [Module 4 — Multi-Agent Coordination →](./04-multi-agent-coordination.md)**
