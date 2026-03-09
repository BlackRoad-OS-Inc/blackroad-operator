# BlackRoad OS — API Design Reference

> **Version:** 1.0
> **Last Updated:** 2025-11-30
> **Base URL:** `https://api.blackroad.io/v1`

---

## Overview

The BlackRoad OS API provides programmatic access to the governance layer, enabling agents and applications to:

- Create and manage intents (tasks/goals)
- Evaluate policies and check permissions
- Write audit events to the ledger
- Register and manage agents
- Handle claims and delegations

---

## Authentication

All API requests require authentication via Bearer token.

```bash
curl -X GET https://api.blackroad.io/v1/health \
  -H "Authorization: Bearer br_live_xxxxxxxxxxxx"
```

### Token Types

| Type | Prefix | Use Case |
|------|--------|----------|
| Agent Token | `br_agent_` | Agent-to-API communication |
| User Token | `br_user_` | User applications |
| System Token | `br_system_` | Internal services |
| Test Token | `br_test_` | Development/testing |

### Token Scopes

Tokens are scoped to specific permissions:

```json
{
  "token_id": "tok-20251130-abc123",
  "agent_id": "cece.governor.v1",
  "scopes": [
    "intent:read",
    "intent:write",
    "policy:evaluate",
    "ledger:write",
    "agent:read"
  ],
  "expires_at": "2026-11-30T00:00:00Z"
}
```

---

## Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | Yes (POST/PATCH) | `application/json` |
| `X-Request-ID` | No | Client-generated request ID for tracing |
| `X-Intent-ID` | No | Associate request with an intent |

---

## Response Format

All responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req-20251130-xyz789",
    "timestamp": "2025-11-30T14:32:01.123Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "POLICY_DENIED",
    "message": "Action requires human approval",
    "details": {
      "policy_id": "pol-20251130-a1b2c3",
      "rule_matched": "r1"
    }
  },
  "meta": {
    "request_id": "req-20251130-xyz789",
    "timestamp": "2025-11-30T14:32:01.123Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Token lacks required scope |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `POLICY_DENIED` | 403 | Policy blocked the action |
| `APPROVAL_REQUIRED` | 202 | Action pending human approval |
| `VALIDATION_ERROR` | 400 | Invalid request payload |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Endpoints

### Health & Status

#### GET /health

Check API health.

```bash
curl https://api.blackroad.io/v1/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2025-11-30T14:32:01.123Z"
  }
}
```

---

### Intents

#### POST /intent

Create a new intent.

```bash
curl -X POST https://api.blackroad.io/v1/intent \
  -H "Authorization: Bearer br_agent_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Find investor docs and summarize them",
    "priority": "high",
    "context": {
      "search_terms": ["investor", "deck"],
      "deadline": "2025-11-30T18:00:00Z"
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "intent_id": "int-20251130-x1y2z3",
    "actor": "agent:cece.governor.v1",
    "goal": "Find investor docs and summarize them",
    "priority": "high",
    "status": "proposed",
    "created_at": "2025-11-30T14:32:01.123Z"
  }
}
```

#### GET /intent/:id

Get intent details.

```bash
curl https://api.blackroad.io/v1/intent/int-20251130-x1y2z3 \
  -H "Authorization: Bearer br_agent_xxx"
```

Response:
```json
{
  "success": true,
  "data": {
    "intent_id": "int-20251130-x1y2z3",
    "actor": "user:alexa",
    "goal": "Find investor docs and summarize them",
    "priority": "high",
    "status": "executing",
    "plan": [
      {"step": 1, "action": "drive.search", "status": "completed"},
      {"step": 2, "action": "drive.get", "status": "in_progress"},
      {"step": 3, "action": "summarize", "status": "planned"}
    ],
    "assigned_agent": "cece.governor.v1",
    "created_at": "2025-11-30T14:32:01.123Z",
    "updated_at": "2025-11-30T14:35:22.456Z"
  }
}
```

#### PATCH /intent/:id

Update intent status or plan.

```bash
curl -X PATCH https://api.blackroad.io/v1/intent/int-20251130-x1y2z3 \
  -H "Authorization: Bearer br_agent_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "executing",
    "plan": [
      {"step": 1, "action": "drive.search", "status": "completed"},
      {"step": 2, "action": "drive.get", "status": "in_progress"}
    ]
  }'
```

#### GET /intent

List intents with filters.

```bash
curl "https://api.blackroad.io/v1/intent?status=executing&limit=10" \
  -H "Authorization: Bearer br_agent_xxx"
```

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `actor` | string | Filter by actor |
| `agent` | string | Filter by assigned agent |
| `limit` | number | Max results (default: 20) |
| `offset` | number | Pagination offset |

---

### Policy Evaluation

#### POST /policy/evaluate

Check if an action is allowed.

```bash
curl -X POST https://api.blackroad.io/v1/policy/evaluate \
  -H "Authorization: Bearer br_agent_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "gmail.send",
    "context": {
      "recipient": "investor@external.com",
      "subject": "Follow-up on our meeting",
      "has_attachments": true
    }
  }'
```

Response (Allowed):
```json
{
  "success": true,
  "data": {
    "result": "allowed",
    "policy_id": null,
    "rule_matched": null,
    "reason": "No policy restriction"
  }
}
```

Response (Requires Approval):
```json
{
  "success": true,
  "data": {
    "result": "requires_approval",
    "policy_id": "pol-20251130-a1b2c3",
    "rule_matched": "r1",
    "reason": "External email requires human approval",
    "approval_url": "https://app.blackroad.io/approve/apr-20251130-xyz"
  }
}
```

Response (Denied):
```json
{
  "success": false,
  "error": {
    "code": "POLICY_DENIED",
    "message": "Action is not permitted",
    "details": {
      "policy_id": "pol-20251130-b2c3d4",
      "rule_matched": "r2",
      "reason": "Attachments not allowed to external recipients"
    }
  }
}
```

---

### Ledger Events

#### POST /ledger/event

Write an audit event.

```bash
curl -X POST https://api.blackroad.io/v1/ledger/event \
  -H "Authorization: Bearer br_agent_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "intent_id": "int-20251130-x1y2z3",
    "tool": "drive",
    "action": "search",
    "inputs": {
      "query": "investor deck",
      "folder": "shared"
    },
    "outputs": {
      "file_count": 3,
      "file_ids": ["file-1", "file-2", "file-3"]
    },
    "policy_decision": {
      "result": "allowed"
    },
    "notes": "Searching for investor materials"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "event_id": "evt-20251130-000042",
    "intent_id": "int-20251130-x1y2z3",
    "timestamp": "2025-11-30T14:32:01.123Z",
    "inputs_hash": "sha256:abc123...",
    "outputs_hash": "sha256:def456..."
  }
}
```

#### GET /ledger/events

Query ledger events.

```bash
curl "https://api.blackroad.io/v1/ledger/events?intent_id=int-20251130-x1y2z3" \
  -H "Authorization: Bearer br_agent_xxx"
```

Query Parameters:
| Param | Type | Description |
|-------|------|-------------|
| `intent_id` | string | Filter by intent |
| `agent_id` | string | Filter by agent |
| `tool` | string | Filter by tool |
| `date` | string | Filter by date (YYYY-MM-DD) |
| `limit` | number | Max results (default: 50) |

---

### Delegation Check

#### GET /delegation/check

Verify if an agent can perform an action.

```bash
curl "https://api.blackroad.io/v1/delegation/check?agent=cece.governor.v1&action=gmail.send" \
  -H "Authorization: Bearer br_agent_xxx"
```

Response:
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "delegation_id": "del-20251130-d001",
    "delegator": "user:alexa",
    "requires_approval": true,
    "scope_matched": "gmail.*",
    "constraints": {
      "require_approval_for": ["gmail.send"]
    }
  }
}
```

---

### Agents

#### GET /agent/:id

Get agent details.

```bash
curl https://api.blackroad.io/v1/agent/cece.governor.v1 \
  -H "Authorization: Bearer br_agent_xxx"
```

Response:
```json
{
  "success": true,
  "data": {
    "agent_id": "cece.governor.v1",
    "name": "Cece",
    "class": "lucidia",
    "capabilities": ["intent.create", "policy.evaluate", "ledger.write"],
    "status": "active",
    "last_seen": "2025-11-30T14:32:01.123Z"
  }
}
```

#### POST /agent/register

Register a new agent.

```bash
curl -X POST https://api.blackroad.io/v1/agent/register \
  -H "Authorization: Bearer br_system_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "email.handler.v1",
    "name": "Email Handler",
    "class": "worker",
    "capabilities": ["gmail.read", "gmail.draft", "gmail.send"],
    "owner": "org:blackroad"
  }'
```

#### PATCH /agent/:id/heartbeat

Update agent last_seen timestamp.

```bash
curl -X PATCH https://api.blackroad.io/v1/agent/cece.governor.v1/heartbeat \
  -H "Authorization: Bearer br_agent_xxx"
```

---

### Approvals

#### GET /approval/:id

Get approval request details.

```bash
curl https://api.blackroad.io/v1/approval/apr-20251130-xyz \
  -H "Authorization: Bearer br_user_xxx"
```

Response:
```json
{
  "success": true,
  "data": {
    "approval_id": "apr-20251130-xyz",
    "intent_id": "int-20251130-x1y2z3",
    "agent_id": "cece.governor.v1",
    "action": "gmail.send",
    "context": {
      "recipient": "investor@external.com",
      "subject": "Follow-up",
      "preview": "Dear investor, thank you for..."
    },
    "status": "pending",
    "requested_at": "2025-11-30T14:32:01.123Z",
    "expires_at": "2025-11-30T18:32:01.123Z"
  }
}
```

#### POST /approval/:id/approve

Approve a pending action.

```bash
curl -X POST https://api.blackroad.io/v1/approval/apr-20251130-xyz/approve \
  -H "Authorization: Bearer br_user_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Approved - investor follow-up is expected"
  }'
```

#### POST /approval/:id/reject

Reject a pending action.

```bash
curl -X POST https://api.blackroad.io/v1/approval/apr-20251130-xyz/reject \
  -H "Authorization: Bearer br_user_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Not ready to send yet - need to review content"
  }'
```

---

## Webhooks

Configure webhooks to receive real-time notifications.

### Webhook Events

| Event | Description |
|-------|-------------|
| `intent.created` | New intent created |
| `intent.completed` | Intent finished |
| `intent.blocked` | Intent encountered blocker |
| `approval.requested` | Action needs approval |
| `approval.resolved` | Approval granted/rejected |
| `policy.violated` | Policy denied an action |

### Webhook Payload

```json
{
  "event": "approval.requested",
  "timestamp": "2025-11-30T14:32:01.123Z",
  "data": {
    "approval_id": "apr-20251130-xyz",
    "intent_id": "int-20251130-x1y2z3",
    "agent_id": "cece.governor.v1",
    "action": "gmail.send",
    "approval_url": "https://app.blackroad.io/approve/apr-20251130-xyz"
  }
}
```

### Webhook Security

Webhooks include a signature header for verification:

```
X-BlackRoad-Signature: sha256=abc123...
```

Verify with:
```typescript
const crypto = require('crypto');

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Rate Limits

| Tier | Requests/min | Burst |
|------|--------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 100 |
| Business | 3000 | 500 |
| Enterprise | Custom | Custom |

Rate limit headers:
```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 542
X-RateLimit-Reset: 1732972380
```

---

## SDKs

### TypeScript/JavaScript

```typescript
import { BlackRoadClient } from '@blackroad/sdk';

const client = new BlackRoadClient({
  token: 'br_agent_xxx',
  baseUrl: 'https://api.blackroad.io/v1'
});

// Create intent
const intent = await client.intents.create({
  goal: 'Find and summarize investor docs',
  priority: 'high'
});

// Evaluate policy
const decision = await client.policies.evaluate({
  action: 'gmail.send',
  context: { recipient: 'investor@example.com' }
});

// Write ledger event
await client.ledger.writeEvent({
  intentId: intent.intent_id,
  tool: 'drive',
  action: 'search',
  inputs: { query: 'investor' },
  outputs: { fileCount: 3 }
});
```

### Python

```python
from blackroad import BlackRoadClient

client = BlackRoadClient(
    token='br_agent_xxx',
    base_url='https://api.blackroad.io/v1'
)

# Create intent
intent = client.intents.create(
    goal='Find and summarize investor docs',
    priority='high'
)

# Evaluate policy
decision = client.policies.evaluate(
    action='gmail.send',
    context={'recipient': 'investor@example.com'}
)

# Write ledger event
client.ledger.write_event(
    intent_id=intent.intent_id,
    tool='drive',
    action='search',
    inputs={'query': 'investor'},
    outputs={'file_count': 3}
)
```

---

## OpenAPI Specification

Full OpenAPI 3.0 spec available at:
- JSON: `https://api.blackroad.io/v1/openapi.json`
- YAML: `https://api.blackroad.io/v1/openapi.yaml`

---

## References

- [KV Schema](./kv-schema.md)
- [Architecture Overview](../meta/vision/architecture.md)
- [Governance Roadmap](../governance/governance-roadmap.md)
