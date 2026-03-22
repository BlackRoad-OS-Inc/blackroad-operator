# PS-SHA∞ Definition

**Version:** 0.1 — 2025-02-08

PS-SHA∞ (Persistent Spiral Secure Hashing to Infinity) defines how BlackRoad agents retain identity across infinite states. It is an identity-first primitive, separating who acted from what was claimed, and providing an unbroken cryptographic thread along the Road.

## Why Identity Must Be Invariant
- **Auditability:** Regulated environments require that the same actor key be traceable across migrations, restarts, and federated meshes.
- **Causal replay:** Deterministic replays of actions depend on stable identity bindings, not mutable truth values.
- **Ethical safeguards:** Invariance prevents adversarial "identity shedding" when agents encounter contradictions or sanctions.

## Identity vs. Truth Separation
- **Identity channel:** Anchored by the agent's persistent key and PS-SHA∞ chain, recording *who* produced a statement.
- **Truth channel:** Evaluated by the Interference Engine and Lucidia mesh; statements can be revised or collapsed without rewriting identity history.
- **Result:** Truth can evolve while identity remains immutable, enabling provenance-rich disagreement tracking.

## Infinite Cascade Hashing
- **Hash ladder:** Each journaled event is hashed with its predecessor, forming an infinite cascade where partial prefixes still verify lineage.
- **Rotating salt schedule:** Rotation per epoch or risk level limits preimage leakage while maintaining continuity via anchor hashes.
- **Fractal checkpoints:** Periodic Merkleized checkpoints allow sharding while preserving end-to-end attestations.

## Agent-Level Anchoring
- **Worldline roots:** Each agent maintains a root seed and derivation path; forks create child anchors without losing ancestry.
- **Capability binding:** Hash inputs include factor-tree coordinates and SIG `(r, θ, τ)` to pin actions to cognitive position.
- **Delegation:** Sub-agents sign with delegated keys, but their hashes include the parent anchor to preserve lineage.

## Interfaces to the Road
- Anchors feed RoadChain ledger entries, providing deterministic ordering of truth-steps.
- Lucidia reads PS-SHA∞ anchors to route cognition toward trusted histories and to quarantine contradiction basins.
- Core and Operator systems consume anchors to generate attestations for regulators, partners, and investors.
