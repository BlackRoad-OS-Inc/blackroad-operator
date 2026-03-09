# Concept Card: SIG Factor Tree Identity Assignment

## 1. Objective
Enable consistent, cryptographically rooted identities for agents using SIG factor trees so actions are auditable across BlackRoad OS components.

## 2. Mechanism
- Generate agent identity seeds from SIG factor trees and store lineage metadata alongside operational credentials.
- Expose a verification endpoint for other agents and services to confirm provenance before trusting actions or data.

## 3. Dependencies
- `blackroad-os-operator` for identity issuance workflows.
- `blackroad-os-core` for shared cryptography helpers.
- Registry updates for agent identity schemas.

## 4. Risks / Unknowns
- How to rotate SIG-derived keys without breaking lineage guarantees.
- Interaction with compliance logging and PS-SHA∞ journaling.
- Potential performance impact during high-frequency verifications.

## 5. Next Steps
- [ ] Validate via research on SIG rotation patterns.
- [ ] Draft proposal detailing issuance and revocation flows.
- [ ] Review with orchestrator and compliance stakeholders.
