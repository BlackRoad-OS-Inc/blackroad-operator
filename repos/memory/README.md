# Memory Universe

> *"The road isn't made. It's remembered."*

## Core Documents
- [BlackRoad OS Memory](../\_raw/BlackRoad%20OS%20Memory.txt) — Memory system design
- Sovereign Ledger (in Drive) — Immutable truth chain
- Genesis Affirmation (in Drive) — Origin story
- Session Bootstrap (in Drive) — How sessions start

## The Memory Hierarchy (2048 System)

11 tiers of compression, like the 2048 game:

| Tier | Tokens | What it holds | Lifespan |
|------|--------|---------------|----------|
| 2 | 2 | Single tag/token | Forever |
| 4 | 4 | Key=Value | Forever |
| 8 | 8 | "X works / X doesn't" | Years |
| 16 | 16 | Key: takeaway | Years |
| 32 | 32 | One-sentence cause→effect | Months |
| 64 | 64 | Distilled heuristic | Months |
| 128 | 128 | Principle | Weeks |
| 256 | 256 | Rule with context | Weeks |
| 512 | 512 | Pattern from merged instances | Days |
| 1024 | 1024 | Detailed record minus logs | Days |
| 2048 | 2048 | Raw original entry | Hours |

### Movement Rules
- **Gravity = Time** — older entries compress downward
- **Merge = Semantic similarity** — same topic at same level → combine up
- **Promote = Access frequency** — hot entries decompress
- **Pin = Critical** — never compress below a threshold
- **Shatter = Expand on demand** — follow hash chain back to raw

## Current State (2026-03-16)
- 237 SQLite databases, 1.5GB total
- 1,312,226 rows
- 156,675 FTS5 memory entries
- 143,888 task marketplace entries (intentional — carrier identity)
- 95 codex solutions, 40 patterns, 30 best practices
- 417 journal entries, 241 TILs

## The Carrier Identity Leak
The unique constellation of 1.3M entries IS the fingerprint. If the data leaks, the pattern identifies the source. The memory IS the moat AND the tracking system.

## Related Universes
- [Identity](../identity/) — what the memory preserves
- [Philosophy](../philosophy/) — why memory matters
- [Infrastructure](../infrastructure/) — where memory lives
