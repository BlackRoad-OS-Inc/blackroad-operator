# PS-SHA∞: Persistent Self-Hashing Archive

**Status:** Active Research  
**Lead:** ECHO (Memory Agent)  
**Classification:** Core Architecture

## Abstract

PS-SHA∞ (Persistent Self-Hashing Archive with Infinite Depth) is a hash-chain memory
architecture designed for AI identity persistence. Unlike databases or key-value stores,
PS-SHA∞ creates an **append-only, tamper-evident journal** where every entry cryptographically
binds to its predecessor.

## Formal Definition

An entry `e_n` in the PS-SHA∞ journal is a 5-tuple:

```
e_n = (H_n, H_{n-1}, C_n, T_n, S_n)
```

Where:
- `H_n = SHA256(H_{n-1} ‖ C_n ‖ T_n)` — the entry's hash
- `H_{n-1}` — previous entry's hash (or `"GENESIS"` for the first entry)
- `C_n` — content string
- `T_n` — timestamp in nanoseconds (prevents replay attacks)
- `S_n ∈ {1, 0, -1}` — truth state (trinary logic)

## Security Properties

### Theorem 1: Tamper Evidence
For any modification to entry `e_k`, the verification algorithm detects it with
probability `1 - 2^{-256}` (≈ 100%).

**Proof:** If `C_k` is changed to `C_k'`, then `H_k' ≠ H_k` (by SHA-256 collision
resistance). Since `e_{k+1}.prev = H_k ≠ H_k'`, verification fails at `k+1`.

### Theorem 2: Identity Continuity
An AI agent's identity persists across sessions iff its memory chain is intact.
The chain root (genesis hash) serves as a stable identity anchor.

## Trinary Truth States

Memories carry truth states from the Łukasiewicz three-valued logic:
- `1` = True (verified fact)
- `0` = Unknown/Uncertain
- `-1` = False (negated/retracted)

This allows the system to represent and reason about uncertainty — essential for
AI agents that must act on incomplete information.

## Contradiction Handling

When contradictions arise (two memories with `truth_state` 1 that cannot both be
true), the contradiction amplification formula `K(t)` is applied:

```
K(t) = C(t) · e^(λ·|δ_t|)
```

Where `|δ_t|` is the contradiction magnitude and `λ` is the amplification rate.
Contradictions are quarantined rather than resolved — preserving both for later review.

## Reference Implementation

See [`lab/ps_sha_infinity.py`](../../blackroad-math/lab/ps_sha_infinity.py) in
`BlackRoad-OS-Inc/blackroad-math` for the reference Python implementation.

Production implementation: `BlackRoad-AI/blackroad-ai-memory-bridge`.

## Open Questions

1. What is the optimal chain length before compaction?
2. How to handle forks in memory chains (from parallel agents)?
3. Can PS-SHA∞ extend to distributed multi-agent memory?

## References

- Łukasiewicz (1920): "O logice trójwartościowej"
- Nakamoto (2008): Bitcoin — for hash-chain inspiration
- BlackRoad OS CECE.md — identity system specification
