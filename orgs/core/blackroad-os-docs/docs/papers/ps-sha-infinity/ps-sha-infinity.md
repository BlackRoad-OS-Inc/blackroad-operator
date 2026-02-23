# PS-SHA∞ Overview

PS-SHA∞ defines a persistent, cryptographically anchored identity over time. It treats an agent's existence as a worldline of journaled states where every decision, observation, or action is hashed and chained, creating a tamper-evident record. The construct centers on resilient identity, lineage, and accountability rather than consensus or currency.

## Motivations

- **Agent identity persistence:** Agents must persist across sessions, deployments, and orchestrations with continuity of memory and accountability.
- **Tamper-evident logs:** Decisions and context should be verifiable with cryptographic integrity, enabling post-hoc auditing and replay.
- **Fine-grained audit trails in regulated contexts:** Financial and safety-critical domains require clear, inspectable history for control and regulatory overlays.

## Core Properties

- **Append-only:** Events are added in sequence without mutation, preserving historical fidelity.
- **Hash-chained:** Each entry links to its predecessor via `previousHash` and a computed `hash`, producing a verifiable chain.
- **Identity binding:** Entries bind to an `actorId` to maintain continuity of the agent or system worldline.
- **Reconstructable worldline:** The sequence can be replayed to rebuild state, diagnose decisions, or generate attestations.

## Relation to JournalEntry

PS-SHA∞ entries mirror the `JournalEntry` shape outlined in `blackroad-os-core`:

- `actorId`: identity of the agent or subsystem making the entry.
- `actionType`: category of the action or observation.
- `timestamp`: RFC 3339 timestamp capturing when the event was recorded.
- `payload`: structured data describing the event.
- `previousHash`: link to the prior entry, enabling chain verification.
- `hash`: digest covering the entry content and `previousHash` to anchor integrity.

## Intended Use

- **Finance agents:** Treasury, close, and compliance flows journal every control-relevant action for audit and reconciliation.
- **Contradiction resolution:** Conflicts and their resolutions are recorded, preserving both accepted and discarded branches for review.
- **External attestation:** Future RoadChain or similar integrations can expose verifiable worldlines for regulators, partners, or auditors.

## TODOs

- Expand with specific hashing strategies and signature schemes once RoadChain primitives are finalized.
- Formalize rotation and retention policies for long-lived agents and federated deployments.
