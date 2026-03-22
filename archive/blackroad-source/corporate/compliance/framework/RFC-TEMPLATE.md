# RFC-XXX: [Title]

**Status:** Draft | Review | Accepted | Rejected | Superseded  
**Type:** Feature | Policy | Architecture | Process  
**Author:** [Your Name]  
**Created:** YYYY-MM-DD  
**Eligible Voters:** LUCIDIA, ALICE, OCTAVIA, PRISM, ECHO, CIPHER

---

## Summary

One paragraph explaining the change being proposed.

---

## Motivation

Why is this change needed? What problem does it solve? What happens if we don't do it?

---

## Proposal

Detailed description of the proposed change. Include:
- What will change
- How it will be implemented
- Interfaces/contracts affected

---

## Alternatives Considered

List the alternatives you considered and why you rejected them.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Example risk | Low | Medium | Mitigation strategy |

---

## Rollback Plan

How do we undo this if it goes wrong?

---

## Implementation Plan

1. [ ] Phase 1: ...
2. [ ] Phase 2: ...
3. [ ] Phase 3: ...

---

## Voting

Run the governance vote:
```bash
python3 contracts/governance-vote.py create RFC-XXX "[Title]" LUCIDIA ALICE OCTAVIA PRISM ECHO CIPHER
python3 contracts/governance-vote.py vote RFC-XXX LUCIDIA yes "Reasoning here"
python3 contracts/governance-vote.py tally RFC-XXX
```

---

## References

- [Related RFC or issue]
- [External documentation]
