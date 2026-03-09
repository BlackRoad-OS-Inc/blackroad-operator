# BlackRoad Governance Layer — Roadmap v0

> **Status:** Planning
> **Owner:** Cece (`cece.governor.v1`)
> **Last Updated:** 2025-11-30

---

## Overview

This document defines the governance infrastructure for BlackRoad OS — the protocol layer that makes agent operations **auditable, policy-compliant, and explainable**.

### Core Objects

| Object | Purpose |
|--------|---------|
| **POLICY** | Rules that allow, deny, or modify actions |
| **LEDGER** | Immutable audit trail of all governance events |
| **AGENT** | Registry of workers and their capabilities |
| **INTENT** | Tasks, goals, and workflow state |
| **CLAIM** | Assertions about identity and roles |
| **DELEGATION** | Scoped permissions from delegator → delegate |

### Causal Chain

```
INTENT → AGENT → TOOL CALL → POLICY CHECK → LEDGER EVENT
```

Every significant action flows through this chain, producing an audit trail.

---

## KV Schema

### Design Principles

1. **Keys are human-readable** — debugging at 2am shouldn't require a decoder ring
2. **Values are JSON** — structured, versionable, extensible
3. **Prefixes define namespace** — `policy:`, `ledger:`, `agent:`, `intent:`, `claim:`, `delegation:`
4. **Timestamps are ISO 8601** — always UTC
5. **IDs use format `{type}-{YYYYMMDD}-{short-hash}`** — sortable, unique, traceable

### Key Patterns

| Namespace | Key Pattern | Example |
|-----------|-------------|---------|
| POLICY | `policy:{scope}:{policy_id}` | `policy:email.send:pol-20251130-a1b2c3` |
| LEDGER | `ledger:{intent_id}:{event_id}` | `ledger:int-20251130-x1y2z3:evt-20251130-000001` |
| AGENT | `agent:{agent_id}` | `agent:cece.governor.v1` |
| INTENT | `intent:{intent_id}` | `intent:int-20251130-x1y2z3` |
| CLAIM | `claim:{subject}:{claim_id}` | `claim:user:alexa:clm-20251130-own001` |
| DELEGATION | `delegation:{delegator}:{delegation_id}` | `delegation:user:alexa:del-20251130-d001` |

### Index Keys

| Query | Index Key |
|-------|-----------|
| All active policies | `policy:active` |
| Policies for scope | `policy:scope:{scope}` |
| Events by date | `ledger:by_date:{YYYY-MM-DD}` |
| Events by agent | `ledger:by_agent:{agent_id}` |
| Active agents | `agent:active` |
| Intents by status | `intent:by_status:{status}` |
| Active delegations | `delegation:active` |

---

## Sprint Plan

### Sprint 1: Foundation

| Issue | Title | Priority |
|-------|-------|----------|
| 1 | [INFRA] Initialize KV namespace structure | High |
| 2 | [CORE] Implement POLICY storage and evaluation engine | High |
| 3 | [CORE] Implement LEDGER event writer | High |
| 9 | [AGENT] Cece governor bootstrap | High |

### Sprint 2: Identity & Workflow

| Issue | Title | Priority |
|-------|-------|----------|
| 4 | [CORE] Implement AGENT registry | Medium |
| 5 | [CORE] Implement INTENT lifecycle manager | Medium |
| 6 | [CORE] Implement CLAIMS store | Medium |
| 7 | [CORE] Implement DELEGATIONS manager | Medium |

### Sprint 3: Integration & Docs

| Issue | Title | Priority |
|-------|-------|----------|
| 8 | [API] Governance API endpoints | Medium |
| 10 | [DOCS] Governance layer architecture documentation | Low |

---

## Issue Details

### Issue 1: [INFRA] Initialize KV namespace structure for governance layer

**Priority:** High
**Labels:** `infra`, `foundation`, `cloudflare`

**Description**
Set up the core KV namespace(s) in Cloudflare that will store governance objects for BlackRoad OS.

**Acceptance Criteria**

- [ ] Create Cloudflare KV namespace `BLACKROAD_GOVERNANCE` (or per-env variants)
- [ ] Implement key prefix routing for: `policy:`, `ledger:`, `agent:`, `intent:`, `claim:`, `delegation:`
- [ ] Implement helper function(s) for ID generation: `{type}-{YYYYMMDD}-{short-hash}`
- [ ] Implement index key patterns for each object type
- [ ] Create `blackroad-os-infra/docs/kv-schema.md`

---

### Issue 2: [CORE] Implement POLICY storage and evaluation engine

**Priority:** High
**Labels:** `core`, `policy`, `governance`

**Description**
Build the policy storage layer and basic evaluation logic that Cece will use to check permissions.

**Acceptance Criteria**

- [ ] CRUD operations: `createPolicy`, `getPolicy`, `listPoliciesByScope`, `updatePolicy`, `deactivatePolicy`
- [ ] Policy schema validation (scope, rules array, conditions, actions)
- [ ] Implement `evaluatePolicy(scope, context)` → `{result, applied_policy_id, rule_matched}`
- [ ] Support rule priorities (higher numeric priority wins)
- [ ] Maintain indexes: `policy:scope:{scope}`, `policy:active`

**Schema Example**

```json
{
  "policy_id": "pol-20251130-a1b2c3",
  "scope": "email.send",
  "rules": [
    {
      "condition": "recipient.domain NOT IN approved_domains",
      "action": "require_human_approval",
      "priority": 100
    }
  ],
  "active": true
}
```

---

### Issue 3: [CORE] Implement LEDGER event writer

**Priority:** High
**Labels:** `core`, `audit`, `governance`

**Description**
Build the immutable event logging system that records all governance-relevant actions.

**Acceptance Criteria**

- [ ] Implement `writeEvent(intentId, eventPayload)` function
- [ ] Auto-generate `event_id` with timestamp-sortable format
- [ ] Hash inputs/outputs using SHA-256 (store as `inputs_hash`, `outputs_hash`)
- [ ] Events are append-only (no update/delete operations)
- [ ] Maintain indexes: `ledger:by_agent:*`, `ledger:by_tool:*`, `ledger:by_date:*`

**Schema Example**

```json
{
  "event_id": "evt-20251130-000001",
  "intent_id": "int-20251130-x1y2z3",
  "timestamp": "2025-11-30T14:32:01.123Z",
  "agent_id": "cece.governor.v1",
  "tool": "gmail",
  "action": "draft",
  "inputs_hash": "sha256:abc123...",
  "outputs_hash": "sha256:def456...",
  "policy_decision": {
    "result": "allowed",
    "policy_id": "pol-20251130-a1b2c3"
  }
}
```

---

### Issue 4: [CORE] Implement AGENT registry

**Priority:** Medium
**Labels:** `core`, `agents`, `governance`

**Description**
Build the agent registration and capability tracking system.

**Acceptance Criteria**

- [ ] Register/update agent with capabilities list
- [ ] Track `class`, `owner`, `status`, `last_seen`
- [ ] Validate agent has required policies before activation
- [ ] Maintain indexes: `agent:by_class:*`, `agent:by_owner:*`, `agent:active`

**Bootstrap Data**

```json
{
  "agent_id": "cece.governor.v1",
  "name": "Cece",
  "class": "lucidia",
  "capabilities": ["intent.create", "intent.plan", "tool.invoke", "policy.evaluate", "ledger.write"],
  "status": "active"
}
```

---

### Issue 5: [CORE] Implement INTENT lifecycle manager

**Priority:** Medium
**Labels:** `core`, `workflow`, `governance`

**Description**
Build the task/goal tracking system that manages workflow state.

**Acceptance Criteria**

- [ ] Create intent with: `goal`, `actor`, `priority`, optional `context`
- [ ] Status transitions: `proposed` → `in_planning` → `executing` → `completed|blocked`
- [ ] Attach plan (ordered steps with individual statuses)
- [ ] Auto-update `updated_at` on mutation, `completed_at` on completion
- [ ] Maintain indexes: `intent:by_actor:*`, `intent:by_status:*`, `intent:active`

**Schema Example**

```json
{
  "intent_id": "int-20251130-x1y2z3",
  "actor": "user:alexa",
  "goal": "Find investor docs, summarize, create Notion page, draft follow-up email",
  "status": "executing",
  "plan": [
    {"step": 1, "action": "drive.search", "status": "completed"},
    {"step": 2, "action": "notion.create_page", "status": "in_progress"}
  ]
}
```

---

### Issue 6: [CORE] Implement CLAIMS store

**Priority:** Medium
**Labels:** `core`, `identity`, `governance`

**Description**
Build the assertions system for identity and role claims.

**Acceptance Criteria**

- [ ] Create/revoke claims with: `subject`, `claim_type`, `object`, `assertion`, `issued_by`, `expires_at`
- [ ] Support revocation with reason/metadata
- [ ] Query by subject, object, type (filter out revoked/expired by default)
- [ ] Maintain indexes: `claim:by_type:*`, `claim:by_object:*`, `claim:active`

**Example Claims**

- `"user:alexa is owner of org:blackroad"`
- `"agent:cece.governor.v1 is authorized for internal docs"`

---

### Issue 7: [CORE] Implement DELEGATIONS manager

**Priority:** Medium
**Labels:** `core`, `permissions`, `governance`

**Description**
Build the scoped permission delegation system.

**Acceptance Criteria**

- [ ] Create delegation from delegator → delegate with scope array
- [ ] Support constraints: time bounds, `require_approval_for` list
- [ ] Query: "What can agent X do?" and "Who has access to scope Y?"
- [ ] Revocation support
- [ ] Maintain indexes: `delegation:by_delegate:*`, `delegation:by_scope:*`, `delegation:active`

**Schema Example**

```json
{
  "delegator": "user:alexa",
  "delegate": "agent:cece.governor.v1",
  "scope": ["drive.read", "notion.*", "gmail.draft"],
  "constraints": {
    "require_approval_for": ["gmail.send", "drive.delete"]
  }
}
```

---

### Issue 8: [API] Governance API endpoints

**Priority:** Medium
**Labels:** `api`, `governance`, `integration`

**Description**
Expose governance operations via REST/RPC endpoints for agent consumption.

**Acceptance Criteria**

- [ ] `POST /intent` — create new intent
- [ ] `GET /intent/:id` — get intent with plan
- [ ] `PATCH /intent/:id/status` — update status
- [ ] `POST /policy/evaluate` — check if action is allowed
- [ ] `POST /ledger/event` — write audit event
- [ ] `GET /delegation/check` — verify agent can perform action
- [ ] All endpoints require agent authentication
- [ ] Log governance-relevant calls via LEDGER writer

---

### Issue 9: [AGENT] Cece governor bootstrap

**Priority:** High
**Labels:** `agent`, `cece`, `bootstrap`

**Description**
Initialize Cece as the primary governance agent in the system.

**Acceptance Criteria**

- [ ] Register `cece.governor.v1` in AGENT registry
- [ ] Create bootstrap delegation from `blackroad.system` → Cece
- [ ] Create core safety policies: `policy:core.safety`, `policy:core.audit`
- [ ] Cece's config: `require_human_approval_for: ["finance.*", "email.send_external"]`
- [ ] Verify Cece can query all governance stores

---

### Issue 10: [DOCS] Governance layer architecture documentation

**Priority:** Low
**Labels:** `docs`, `architecture`

**Description**
Document the governance layer for internal reference and future contributors.

**Acceptance Criteria**

- [ ] Diagram: INTENT → AGENT → TOOL CALL → POLICY → LEDGER flow
- [ ] KV schema reference with all key patterns
- [ ] Query patterns cheat sheet
- [ ] Example: full lifecycle of a cross-tool workflow
- [ ] Security model: how policies and delegations interact

---

## Query Patterns Cheat Sheet

| Use Case | Query |
|----------|-------|
| Can Cece send email? | `delegation:by_delegate:agent:cece.governor.v1` → filter for `gmail.send` scope |
| What happened today? | `ledger:by_date:2025-11-30` |
| Who owns BlackRoad? | `claim:by_object:org:blackroad` → filter for `claim_type: ownership` |
| What policies apply to email? | `policy:scope:email.*` |
| What's Cece working on? | `intent:by_status:executing` → filter for `assigned_agent: cece.governor.v1` |

---

## Implementation Notes

### Cloudflare KV
- Use key patterns directly
- Values are JSON strings
- Index keys store JSON arrays of IDs

### D1 (if SQL needed)
- Each namespace becomes a proper table
- Index keys become actual indexes
- Add `JSONB` columns for flexible fields

### Railway (Redis/Postgres)
- Same patterns work with minor syntax adjustments
- Redis for hot paths (active intents, recent ledger)
- Postgres for cold storage and complex queries

---

## Repo Mapping

| Component | Repo |
|-----------|------|
| KV namespace setup | `blackroad-os-infra` |
| Core governance logic | `blackroad-os-core` |
| API endpoints | `blackroad-os-api-gateway` |
| Cece agent | `blackroad-os-agents` |
| Documentation | `blackroad-os-docs` |

---

## References

- [Cece Agent Mode System Prompt](./cece-agent-mode.md)
- [KV Schema Details](./kv-schema.md)
- [BlackRoad OS Architecture](../README.md)
