# BlackRoad Architecture Decision Log

## How to Use

1. Copy  → 
2. Fill in all sections (Status: DRAFT)
3. Open PR, assign reviewers
4. After 7-day review period → ACCEPTED or REJECTED
5. Update this log

---

## Accepted Decisions

| RFC | Title | Date | Status |
|-----|-------|------|--------|
| RFC-0002 | Tokenless Gateway Architecture | 2026-01-15 | ACCEPTED |
| RFC-0003 | PS-SHA∞ Memory Hash Chain | 2026-01-20 | ACCEPTED |
| RFC-0004 | 17-Org Repository Structure | 2026-01-25 | ACCEPTED |
| RFC-0005 | Trinary Logic System (1/0/-1) | 2026-02-01 | ACCEPTED |
| RFC-0006 | Skills SDK @blackroad/skills-sdk | 2026-02-05 | ACCEPTED |
| RFC-0007 | CF Edge Middleware + Rate Limiting | 2026-02-10 | ACCEPTED |
| RFC-0008 | Task Marketplace (file-based) | 2026-02-10 | ACCEPTED |

## In Review

| RFC | Title | Author | Review Deadline |
|-----|-------|--------|-----------------|
| RFC-0009 | WASM Agent Runtime | @octavia | TBD |
| RFC-0010 | Federated Memory across Pi nodes | @echo | TBD |

## Rejected

| RFC | Title | Date | Reason |
|-----|-------|------|--------|
| RFC-X01 | Redis-based rate limiting | 2026-01-10 | Too much operational overhead; use KV instead |

---

## Key Principles

1. **Tokenless by default** — agents never hold provider keys
2. **PS-SHA∞** — all state mutations hash-chained, tamper-evident
3. **Trinary logic** — truth state is 1 (true) / 0 (unknown) / -1 (false)
4. **17-org boundary** — security, compliance, and cognitive boundaries
5. **Edge-first** — CF Workers over centralized servers where possible
6. **Pi-native** — every core service runs on Raspberry Pi hardware

---

*Last updated: 2026-02-10*
