# RFC-0001: Technical Decision Template

**Status:** DRAFT | REVIEW | ACCEPTED | REJECTED | SUPERSEDED  
**Date:** YYYY-MM-DD  
**Author:** @username  
**Reviewers:** @alice @octavia  
**Impact:** LOW | MEDIUM | HIGH | CRITICAL

---

## Summary

One paragraph. What is this RFC proposing and why?

## Problem Statement

Describe the problem this RFC solves. Include:
- Current state
- Pain points
- Who is affected

## Proposed Solution

Detailed description of the solution. Include:

### Architecture Changes



### API Changes (if any)



### Database Migrations (if any)



## Alternatives Considered

| Option | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| Option A (proposed) | ... | ... | Chosen |
| Option B | ... | ... | ... |
| Option C | ... | ... | ... |

## Security Implications

- [ ] Authentication/authorization changes
- [ ] Data exposure risks
- [ ] Dependency vulnerabilities
- [ ] Secrets management

## Performance Impact

- Expected latency change: ±X ms
- Memory footprint: ±X MB
- Scaling behavior: describe

## Rollout Plan

1. **Phase 1** (Week 1): Deploy to staging, test with 5% traffic
2. **Phase 2** (Week 2): Canary to 20% production
3. **Phase 3** (Week 3): Full rollout
4. **Rollback trigger**: Error rate > 1% → auto-rollback

## Success Metrics

- [ ] Error rate < 0.1%
- [ ] P99 latency < 500ms
- [ ] All tests passing
- [ ] No regression in [specific feature]

## Open Questions

1. Question one?
2. Question two?

## Decision Log

| Date | Decision | By |
|------|----------|----|
| YYYY-MM-DD | RFC created | @author |
| YYYY-MM-DD | Status → REVIEW | @reviewer |
| YYYY-MM-DD | Status → ACCEPTED | @decider |

---

*Use this template for all architecture decisions. Store in .*
