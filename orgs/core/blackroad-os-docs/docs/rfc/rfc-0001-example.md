# RFC-0001: Standard Event Naming Across Repos

Author: BlackRoad OS Core
Status: Draft
Created: 2025-01-05

## 1. Summary
Define a consistent event naming convention shared across operator, analytics, and orchestrator repos to simplify correlation and observability.

## 2. Motivation
Inconsistent event names make it difficult to trace flows between agents and services. Standardizing names reduces ambiguity and accelerates debugging.

## 3. Design Overview
- Prefix events with the producing subsystem (e.g., `operator.`, `agent.`, `infra.`).
- Use kebab-case verbs and nouns (e.g., `operator.task-dispatched`).
- Include version metadata in payloads for schema evolution.

## 4. Detailed Design
- Registry update: maintain an event glossary in `blackroad-os-operator/docs/events.md` (linked from this RFC).
- Validation: add linting rules in CI to flag unregistered event names.
- Backwards compatibility: support alias mapping for legacy events during the transition window.

## 5. Risks
- Missed legacy events could break dashboards; mitigate with shadow logging during rollout.

## 6. Alternatives
- Allow per-repo conventions (rejected due to fragmentation).
- Auto-generated names from schemas (postponed; adds complexity now).

## 7. Migration / Rollout
- Phase 1: adopt naming in new events; log both old and new names.
- Phase 2: migrate critical paths; update dashboards and alerts.
- Phase 3: remove aliases after two sprints of stability.

## 8. Security & Compliance Considerations
- Ensure event payloads continue to redact PII; naming change must not bypass filters.

## 9. Appendix
- Related idea: `idea-0002` for telemetry unification.
