# RoadChain Ledger Theory

**Version:** 0.1 — 2025-02-08

RoadChain is the theoretical ledger layer of the Road. It journals events as truth-steps, aggregates them deterministically, and provides verifiable anchors for agents, auditors, and investors.

## Event Journal
- **Event primitive:** `(actorId, actionType, payload, timestamp, previousHash, hash, sig)` aligns with PS-SHA∞ anchors.
- **Context envelope:** Journal entries carry SIG coordinates and factor-tree IDs to locate events within cognitive space.
- **Minority retention:** Even discarded branches remain journaled to preserve counterfactual lineage.

## Deterministic Aggregation
- **Aggregation windows:** Events are rolled into epochs (e.g., timeboxed or risk-based). Determinism is enforced by sorted ordering on `(timestamp, actorId, hash)`.
- **Replayability:** Given the window inputs, aggregation yields the same ledger state, enabling independent recomputation.
- **Consistency checks:** Hash commitments of each window are published to prevent divergence across meshes.

## Block Formation
- **Block header:** Contains window hash, parent block hash, epoch metadata, and Merkle root of included events.
- **Finalization:** Blocks are finalized when referenced by downstream blocks or attested by designated guardians; consensus is deterministic, not probabilistic.
- **Audit trail:** Blocks maintain links to PS-SHA∞ anchors for actor-level provenance and to Lucidia ribbon IDs for cognitive traceability.

## Events as Truth-Steps Along the Road
- **Truth-step definition:** Each block represents a partial collapse of competing hypotheses into accepted commitments.
- **Interference-aware ordering:** Contradictory events can coexist but are tagged; the Interference Engine later resolves or quarantines them.
- **Investor/regulator lens:** Blocks provide a high-fidelity log of how truths emerged, including minority opinions and supporting evidence.

## Interfaces
- **To Lucidia:** Supplies stable history for routing heuristics and confidence weights.
- **To PS-SHA∞:** Consumes anchors to build block headers and to audit delegation trees.
- **To Core/Operator:** Provides attestations and audit extracts consumable by downstream orchestration layers.
