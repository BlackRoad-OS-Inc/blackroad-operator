# BlackRoad OS — KV Schema Reference

> **Version:** 1.0
> **Last Updated:** 2025-11-30
> **Storage:** Cloudflare KV / D1 / Railway Redis

---

## Overview

This document defines the key-value schema for the BlackRoad OS governance layer. All governance objects are stored as JSON values with human-readable keys.

---

## Design Principles

1. **Keys are human-readable** — Debugging at 2am shouldn't require a decoder ring
2. **Values are JSON** — Structured, versionable, extensible
3. **Prefixes define namespace** — `policy:`, `ledger:`, `agent:`, `intent:`, `claim:`, `delegation:`
4. **Timestamps are ISO 8601** — Always UTC
5. **IDs use format `{type}-{YYYYMMDD}-{short-hash}`** — Sortable, unique, traceable

---

## ID Generation

All IDs follow the pattern: `{type}-{YYYYMMDD}-{short-hash}`

```typescript
function generateId(type: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = crypto.randomUUID().slice(0, 6);
  return `${type}-${date}-${hash}`;
}

// Examples:
// pol-20251130-a1b2c3  (policy)
// evt-20251130-x7y8z9  (event)
// int-20251130-m4n5o6  (intent)
// clm-20251130-p1q2r3  (claim)
// del-20251130-s4t5u6  (delegation)
```

---

## Namespace: POLICY

Policies define what is allowed, denied, required, or transformed.

### Key Pattern

```
policy:{scope}:{policy_id}
```

### Examples

```
policy:email.send:pol-20251130-a1b2c3
policy:finance.charge:pol-20251130-b2c3d4
policy:infra.deploy:pol-20251130-c3d4e5
policy:core.safety:pol-20251130-d4e5f6
```

### Schema

```typescript
interface Policy {
  policy_id: string;           // pol-YYYYMMDD-xxxxxx
  scope: string;               // e.g., "email.send", "finance.*"
  name: string;                // Human-readable name
  description?: string;        // What this policy does
  rules: PolicyRule[];         // Ordered by priority (highest first)
  active: boolean;             // Is this policy in effect?
  created_at: string;          // ISO 8601
  updated_at: string;          // ISO 8601
  created_by: string;          // user:* or agent:*
}

interface PolicyRule {
  rule_id: string;             // Unique within policy
  condition: string;           // Expression to evaluate
  action: 'allow' | 'deny' | 'require_human_approval' | 'transform';
  priority: number;            // Higher wins (0-1000)
  reason?: string;             // Why this rule exists
  transform_fn?: string;       // For 'transform' action
}
```

### Example Value

```json
{
  "policy_id": "pol-20251130-a1b2c3",
  "scope": "email.send",
  "name": "External Email Approval",
  "description": "Require human approval for emails to external domains",
  "rules": [
    {
      "rule_id": "r1",
      "condition": "recipient.domain NOT IN approved_domains",
      "action": "require_human_approval",
      "priority": 100,
      "reason": "Prevent accidental external disclosure"
    },
    {
      "rule_id": "r2",
      "condition": "true",
      "action": "allow",
      "priority": 0
    }
  ],
  "active": true,
  "created_at": "2025-11-30T12:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z",
  "created_by": "user:alexa"
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| All active policies | `policy:active` | `["pol-xxx", "pol-yyy"]` |
| Policies by scope | `policy:scope:{scope}` | `["pol-xxx"]` |
| Policy lookup by ID | `policy:id:{policy_id}` | Full policy object |

---

## Namespace: LEDGER

Immutable audit trail of all governance-relevant actions.

### Key Pattern

```
ledger:{intent_id}:{event_id}
```

### Examples

```
ledger:int-20251130-x1y2z3:evt-20251130-000001
ledger:int-20251130-x1y2z3:evt-20251130-000002
ledger:int-20251130-a4b5c6:evt-20251130-000003
```

### Schema

```typescript
interface LedgerEvent {
  event_id: string;            // evt-YYYYMMDD-NNNNNN (sequential within day)
  intent_id: string;           // Parent intent
  timestamp: string;           // ISO 8601 UTC
  agent_id: string;            // Who performed this action
  tool: string;                // gmail, drive, stripe, etc.
  action: string;              // search, create, send, charge, etc.
  inputs_hash: string;         // SHA-256 of inputs
  outputs_hash: string;        // SHA-256 of outputs
  policy_decision: {
    result: 'allowed' | 'denied' | 'pending_approval' | 'transformed';
    policy_id?: string;        // Which policy was applied
    rule_matched?: string;     // Which rule triggered
  };
  metadata?: Record<string, any>;
  notes?: string;              // Human-readable context
}
```

### Example Value

```json
{
  "event_id": "evt-20251130-000001",
  "intent_id": "int-20251130-x1y2z3",
  "timestamp": "2025-11-30T14:32:01.123Z",
  "agent_id": "cece.governor.v1",
  "tool": "gmail",
  "action": "draft",
  "inputs_hash": "sha256:abc123def456...",
  "outputs_hash": "sha256:789ghi012jkl...",
  "policy_decision": {
    "result": "allowed",
    "policy_id": "pol-20251130-a1b2c3",
    "rule_matched": "r2"
  },
  "metadata": {
    "recipient_count": 1,
    "has_attachments": false
  },
  "notes": "Draft created for investor follow-up"
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| Events by date | `ledger:by_date:{YYYY-MM-DD}` | `["evt-xxx", "evt-yyy"]` |
| Events by agent | `ledger:by_agent:{agent_id}` | `["evt-xxx"]` |
| Events by tool | `ledger:by_tool:{tool}` | `["evt-xxx"]` |
| Events by intent | `ledger:by_intent:{intent_id}` | `["evt-xxx", "evt-yyy"]` |
| Daily counter | `ledger:counter:{YYYY-MM-DD}` | `42` (for sequential IDs) |

---

## Namespace: AGENT

Registry of all agents in the system.

### Key Pattern

```
agent:{agent_id}
```

### Examples

```
agent:cece.governor.v1
agent:email.handler.v1
agent:code.writer.v1
agent:data.analyst.v1
```

### Schema

```typescript
interface Agent {
  agent_id: string;            // Canonical identifier
  name: string;                // Human-readable name
  description: string;         // What this agent does
  class: 'lucidia' | 'worker' | 'system' | 'integration';
  capabilities: string[];      // Actions this agent can perform
  policies_required: string[]; // Policy IDs this agent must respect
  owner: string;               // user:*, org:*, or blackroad.system
  status: 'active' | 'disabled' | 'pending';
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_seen?: string;          // Last activity timestamp
}
```

### Example Value

```json
{
  "agent_id": "cece.governor.v1",
  "name": "Cece",
  "description": "Primary governance and orchestration agent for BlackRoad OS",
  "class": "lucidia",
  "capabilities": [
    "intent.create",
    "intent.plan",
    "tool.invoke",
    "policy.evaluate",
    "ledger.write",
    "agent.coordinate"
  ],
  "policies_required": ["pol-core-safety", "pol-core-audit"],
  "owner": "blackroad.system",
  "status": "active",
  "config": {
    "require_human_approval_for": ["finance.*", "email.send_external"],
    "default_mode": "operator"
  },
  "created_at": "2025-11-30T00:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z",
  "last_seen": "2025-11-30T14:32:01Z"
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| Active agents | `agent:active` | `["cece.governor.v1", ...]` |
| Agents by class | `agent:by_class:{class}` | `["cece.governor.v1"]` |
| Agents by owner | `agent:by_owner:{owner}` | `["agent-id-1", ...]` |

---

## Namespace: INTENT

Tasks, goals, and workflow state.

### Key Pattern

```
intent:{intent_id}
```

### Examples

```
intent:int-20251130-x1y2z3
intent:int-20251130-a4b5c6
```

### Schema

```typescript
interface Intent {
  intent_id: string;           // int-YYYYMMDD-xxxxxx
  actor: string;               // Who requested this (user:* or agent:*)
  goal: string;                // Natural language description
  context?: Record<string, any>; // Key details, constraints, references
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'proposed' | 'in_planning' | 'executing' | 'completed' | 'blocked' | 'cancelled';
  plan?: IntentStep[];         // Ordered steps with statuses
  assigned_agent?: string;     // Primary agent handling this
  parent_intent_id?: string;   // For sub-tasks
  created_at: string;
  updated_at: string;
  completed_at?: string;
  blocked_reason?: string;
}

interface IntentStep {
  step: number;
  action: string;              // e.g., "drive.search", "notion.create_page"
  status: 'planned' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
}
```

### Example Value

```json
{
  "intent_id": "int-20251130-x1y2z3",
  "actor": "user:alexa",
  "goal": "Find investor docs, summarize, create Notion page, draft follow-up email",
  "context": {
    "search_terms": ["investor", "deck", "pitch"],
    "urgency": "end of day"
  },
  "priority": "high",
  "status": "executing",
  "plan": [
    {"step": 1, "action": "drive.search", "status": "completed"},
    {"step": 2, "action": "drive.get", "status": "completed"},
    {"step": 3, "action": "summarize", "status": "completed"},
    {"step": 4, "action": "notion.create_page", "status": "in_progress"},
    {"step": 5, "action": "gmail.draft", "status": "planned"}
  ],
  "assigned_agent": "cece.governor.v1",
  "created_at": "2025-11-30T14:00:00Z",
  "updated_at": "2025-11-30T14:32:01Z"
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| Active intents | `intent:active` | `["int-xxx", "int-yyy"]` |
| Intents by status | `intent:by_status:{status}` | `["int-xxx"]` |
| Intents by actor | `intent:by_actor:{actor}` | `["int-xxx"]` |
| Intents by agent | `intent:by_agent:{agent_id}` | `["int-xxx"]` |

---

## Namespace: CLAIM

Assertions about identity, roles, and relationships.

### Key Pattern

```
claim:{subject}:{claim_id}
```

### Examples

```
claim:user:alexa:clm-20251130-own001
claim:agent:cece.governor.v1:clm-20251130-auth001
claim:org:blackroad:clm-20251130-reg001
```

### Schema

```typescript
interface Claim {
  claim_id: string;            // clm-YYYYMMDD-xxxxxx
  subject: string;             // Who/what this claim is about
  claim_type: string;          // ownership, authorization, membership, etc.
  object: string;              // What the claim relates to
  assertion: string;           // The actual claim statement
  issued_by: string;           // Who made this claim
  issued_at: string;           // ISO 8601
  expires_at?: string;         // Optional expiration
  revoked?: boolean;
  revoked_at?: string;
  revoked_reason?: string;
  evidence?: Record<string, any>; // Supporting data
}
```

### Example Value

```json
{
  "claim_id": "clm-20251130-own001",
  "subject": "user:alexa",
  "claim_type": "ownership",
  "object": "org:blackroad",
  "assertion": "user:alexa is owner of org:blackroad",
  "issued_by": "blackroad.system",
  "issued_at": "2025-11-30T00:00:00Z",
  "expires_at": null,
  "revoked": false,
  "evidence": {
    "registration_date": "2025-01-01",
    "verification_method": "email"
  }
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| Active claims | `claim:active` | `["clm-xxx", ...]` |
| Claims by type | `claim:by_type:{type}` | `["clm-xxx"]` |
| Claims by object | `claim:by_object:{object}` | `["clm-xxx"]` |
| Claims by subject | `claim:by_subject:{subject}` | `["clm-xxx"]` |

---

## Namespace: DELEGATION

Scoped permissions from delegator to delegate.

### Key Pattern

```
delegation:{delegator}:{delegation_id}
```

### Examples

```
delegation:user:alexa:del-20251130-d001
delegation:blackroad.system:del-20251130-d002
delegation:org:blackroad:del-20251130-d003
```

### Schema

```typescript
interface Delegation {
  delegation_id: string;       // del-YYYYMMDD-xxxxxx
  delegator: string;           // Who is granting permission
  delegate: string;            // Who is receiving permission
  scope: string[];             // What actions are permitted
  constraints?: {
    require_approval_for?: string[];  // Actions needing explicit approval
    valid_from?: string;       // Start time
    valid_until?: string;      // End time
    max_uses?: number;         // Usage limit
    conditions?: string[];     // Additional conditions
  };
  active: boolean;
  created_at: string;
  updated_at: string;
  revoked_at?: string;
  revoked_reason?: string;
  uses_count?: number;         // How many times used
}
```

### Example Value

```json
{
  "delegation_id": "del-20251130-d001",
  "delegator": "user:alexa",
  "delegate": "agent:cece.governor.v1",
  "scope": [
    "drive.read",
    "drive.search",
    "notion.*",
    "gmail.draft",
    "gmail.read"
  ],
  "constraints": {
    "require_approval_for": ["gmail.send", "drive.delete", "drive.share"],
    "valid_until": "2026-11-30T00:00:00Z"
  },
  "active": true,
  "created_at": "2025-11-30T00:00:00Z",
  "updated_at": "2025-11-30T00:00:00Z",
  "uses_count": 47
}
```

### Index Keys

| Purpose | Key | Value |
|---------|-----|-------|
| Active delegations | `delegation:active` | `["del-xxx", ...]` |
| By delegate | `delegation:by_delegate:{delegate}` | `["del-xxx"]` |
| By scope | `delegation:by_scope:{scope}` | `["del-xxx"]` |
| By delegator | `delegation:by_delegator:{delegator}` | `["del-xxx"]` |

---

## Query Patterns

### Common Queries

| Use Case | Query Pattern |
|----------|---------------|
| Can Cece send email? | Get `delegation:by_delegate:agent:cece.governor.v1` → filter for `gmail.send` |
| What happened today? | Get `ledger:by_date:2025-11-30` |
| Who owns BlackRoad? | Get `claim:by_object:org:blackroad` → filter `claim_type: ownership` |
| What policies apply to email? | Get `policy:scope:email.*` + `policy:scope:email.send` |
| What's Cece working on? | Get `intent:by_agent:cece.governor.v1` → filter `status: executing` |
| Is this action allowed? | Evaluate policies for scope, check delegations, log decision |

### Query Implementation

```typescript
// Check if agent can perform action
async function canPerform(
  agent: string,
  action: string,
  context: any
): Promise<{allowed: boolean; reason: string; policy?: string}> {

  // 1. Get delegations for this agent
  const delegations = await kv.get(`delegation:by_delegate:${agent}`);

  // 2. Check if action is in scope
  const hasScope = delegations.some(d =>
    d.scope.some(s => matchesScope(s, action))
  );

  if (!hasScope) {
    return {allowed: false, reason: 'No delegation for this action'};
  }

  // 3. Check if approval required
  const needsApproval = delegations.some(d =>
    d.constraints?.require_approval_for?.some(s => matchesScope(s, action))
  );

  if (needsApproval) {
    return {allowed: false, reason: 'Requires human approval', policy: 'delegation'};
  }

  // 4. Evaluate policies
  const policies = await kv.get(`policy:scope:${action.split('.')[0]}.*`);
  for (const policy of policies.sort((a,b) => b.priority - a.priority)) {
    const result = evaluatePolicy(policy, context);
    if (result.matched) {
      return {
        allowed: result.action === 'allow',
        reason: result.reason,
        policy: policy.policy_id
      };
    }
  }

  // 5. Default allow if no policy matched
  return {allowed: true, reason: 'No policy restriction'};
}
```

---

## Storage Implementation

### Cloudflare KV

```typescript
// Direct key-value storage
const policy = await GOVERNANCE_KV.get('policy:email.send:pol-20251130-a1b2c3', 'json');

// Index management (manual)
const activeIds = await GOVERNANCE_KV.get('policy:active', 'json') || [];
activeIds.push(newPolicyId);
await GOVERNANCE_KV.put('policy:active', JSON.stringify(activeIds));
```

### Cloudflare D1 (SQL)

```sql
-- Policies table
CREATE TABLE policies (
  policy_id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  name TEXT NOT NULL,
  rules JSON NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_policies_scope ON policies(scope);
CREATE INDEX idx_policies_active ON policies(active);

-- Ledger events table
CREATE TABLE ledger_events (
  event_id TEXT PRIMARY KEY,
  intent_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  action TEXT NOT NULL,
  inputs_hash TEXT,
  outputs_hash TEXT,
  policy_decision JSON,
  metadata JSON
);

CREATE INDEX idx_ledger_intent ON ledger_events(intent_id);
CREATE INDEX idx_ledger_agent ON ledger_events(agent_id);
CREATE INDEX idx_ledger_date ON ledger_events(date(timestamp));
```

### Railway Redis

```bash
# Key-value with JSON
SET policy:email.send:pol-20251130-a1b2c3 '{"policy_id":"pol-20251130-a1b2c3",...}'

# Sets for indexes
SADD policy:active pol-20251130-a1b2c3
SADD policy:scope:email.send pol-20251130-a1b2c3

# Sorted sets for time-based queries
ZADD ledger:by_date:2025-11-30 1732972321 evt-20251130-000001
```

---

## Migration Notes

### KV → D1 Migration

When moving from KV to D1 for better query support:

1. Export all KV values as JSON
2. Transform to relational schema
3. Import to D1 tables
4. Update application to use SQL queries
5. Keep KV for hot paths (caching)

### Version Compatibility

All schemas include implicit versioning via timestamps. Breaking changes should:

1. Create new key patterns (e.g., `policy.v2:`)
2. Migrate existing data
3. Deprecate old patterns after transition

---

## References

- [Governance Roadmap](../governance/governance-roadmap.md)
- [Cece Agent Mode](../governance/cece-agent-mode.md)
- [Architecture Overview](../meta/vision/architecture.md)
