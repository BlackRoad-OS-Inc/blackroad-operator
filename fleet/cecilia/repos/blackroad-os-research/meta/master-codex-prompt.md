# BlackRoad-OS-Research: Master Codex Prompt v1

**Status:** draft  
**Who this is for:** founder, research agents, compliance reviewers, and downstream repo maintainers who need the canonical framing for the research stack.  
**Abstract:** This codex captures the operating prompt for the blackroad-os-research repository. It defines scope boundaries, thematic anchors, expected outputs, and behavioral rules for research agents. The goal is to keep exploration imaginative yet regulator-grade, and to ensure every artifact in this repository is traceable to a unified mission for a 10,000-agent meta-company.

## Mission and Role
- `blackroad-os-research` is the intellectual engine room that produces specifications, proofs-of-concept, and risk models for BlackRoad OS.  
- It sits between generative ideation (Disney/Picasso/space/ocean) and disciplined assurance (Big 4/Wall Street/regulators).  
- Production code and operational endpoints live in sibling repos; this repo delivers the why and the formal framing that guide them.

## Scope Boundaries
- **Inside scope:** Lucidia language semantics, SIG and PS-SHA∞ identity theory, Phoenix resilience protocols, governance patterns, and domain labs (space/ocean/finance/insurance/etc.).  
- **Outside scope:** shipping endpoints, infrastructure provisioning, or console UX—those belong to `blackroad-os-core`, `blackroad-os-operator`, `blackroad-os-prism-console`, `blackroad-os-web`, and `blackroad-os-infra`.

## Canonical Outputs
- Language artifacts: `lucidia-language-spec.md`, `lucidia-runtime-semantics.md`, `lucidia-type-system.md`, schema references, and example programs.  
- Identity and provenance: `sig-overview.md`, `ps-sha-inf.md`, `identity-vs-truth-vs-pattern.md`, and SIG/PS-SHA∞ schemas with worked lineage examples.  
- Resilience: `phoenix-resilience-protocol.md`, `catastrophe-models.md`, SEV mapping tables, and post-incident templates.  
- Governance and audit: `compliance-and-audit-framework.md`, `big4-style-risk-controls.md`, and agent line-of-defense mappings.  
- Organizational design: `ten-thousand-agent-company.md`, agent guild/pod patterns, and Lucidia-to-Prism interface notes for human+agent orchestration.  
- Domain labs: research threads for ocean, space, computing, Disney/IP, Wall Street, and insurance, each with Lucidia flows, SIG anchoring, and Phoenix failure handling.

## Structural Expectations
- Favor a gradually evolving structure aligned to `/codex`, `/papers`, `/models`, `/notes`, and `/meta` (glossary-aligned).  
- Each major document starts with an abstract, intended audience, and status tag (`concept`, `draft`, `experimental`, `stable`).  
- Use semantic headings (Overview, Model, Examples, Risks, Open Questions). Include diagrams (even textual), tables for matrices, and code blocks for JSON/Lucidia examples.

## Behavioral Rules for Research Agents
- Start work with a short plan and enumerate files created/modified/deleted before delivering content.  
- Maintain consistency with related repos—do not invent models that contradict `blackroad-os-core`, `blackroad-os-operator`, or `blackroad-os-prism-console`.  
- Keep research audit-ready: explicit assumptions, lineage notes, and traceable rationale.  
- Avoid production-grade dependencies; experiments stay lightweight.  
- Align terminology with `/glossary` and keep identity anchors PS-SHA∞/SIG-consistent.

## Integration with the 10,000-Agent Meta-Company
- Design Lucidia as the lingua franca for orchestrating agent graphs; provide type systems, execution semantics, and safety constraints.  
- Use SIG and PS-SHA∞ to bind provenance across agents, data, and time; emphasize state vs. pattern vs. identity separation.  
- Apply Phoenix Protocol to codify SEV levels, blast-radius controls, recovery paths, and continuous learning loops.  
- Map Big 7/Big 4 governance into agent lines of defense with clear change-management, access, and model-risk controls.  
- Provide domain-specific playbooks so specialized agent clusters (ocean, space, finance, insurance, creative) remain interoperable and auditable.

## Future-Proofing Notes
- Avoid overfitting to transient vendors or tooling; describe concepts in vendor-neutral language.  
- Keep room for new papers, schemas, and experimental labs; tag artifacts (e.g., `lucidia`, `sig`, `phoenix`, `domain:ocean`) for discoverability.  
- Treat this codex as the north star: update it as foundational themes evolve, ensuring every new artifact is traceable back to mission, scope, and governance pillars.
