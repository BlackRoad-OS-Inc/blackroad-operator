# Convergence Model

Ideas move toward shipped features through a repeatable pipeline:

```
Idea → Concept → Proposal → RFC → Orchestrator Implementation → Test → Release → Docs → Prism panel
```

## How Ideas Emerge
- Humans and agents can submit raw ideas using `/templates/idea-template.md`.
- Agents may suggest ideas autonomously; they must be logged and scored via the prioritization framework before promotion.

## Convergence Rules
- Contradictions or conflicts are escalated to orchestrator review; capture the decision and rationale in the registry entry.
- Significant changes to schemas, compliance surfaces, or orchestration logic should route through an RFC.
- Everything important is journaled and tied back to PS-SHA∞ practices from the research repo.

## Implementation Bridge
- Once approved, implementation targets are linked to `blackroad-os-operator` (and other repos) with pointers to registry IDs.
- Testing and release artifacts must reference the originating concept/proposal.
- Prism Console integration is a milestone for visibility after deployment.
