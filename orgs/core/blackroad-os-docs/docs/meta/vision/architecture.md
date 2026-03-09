# BlackRoad OS — Architecture Overview

> **Version:** 1.0
> **Last Updated:** 2025-11-30
> **Status:** Active

---

## System Overview

BlackRoad OS is a distributed AI orchestration platform built on three core layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PORTAL LAYER                                │
│   Lucidia │ RoadWork │ RoadView │ RoadGlitch │ RoadWorld │ BackRoad │
├─────────────────────────────────────────────────────────────────┤
│                    GOVERNANCE LAYER                              │
│        Policies │ Ledger │ Intents │ Claims │ Delegations        │
├─────────────────────────────────────────────────────────────────┤
│                   INTEGRATION LAYER                              │
│              MCP │ Tools │ Connectors │ APIs                     │
├─────────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                            │
│        Cloudflare │ Railway │ Self-hosted LLMs │ Edge            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Architecture Principles

### 1. Edge-First Design

All latency-sensitive operations happen at the edge via Cloudflare Workers. This includes:
- Request routing
- Authentication/authorization
- Policy evaluation
- Caching

### 2. Event-Driven Orchestration

The system is built around events, not request/response cycles:
- Every significant action produces a ledger event
- Agents react to events, not direct calls
- Async by default, sync when necessary

### 3. Governance as Infrastructure

Governance isn't a feature — it's the foundation:
- Every tool call passes through policy evaluation
- Every action is logged to an immutable ledger
- Every permission is explicit and auditable

### 4. Composable Agents

Agents are small, focused, and composable:
- Single responsibility per agent
- Standard communication protocol
- Orchestrator (Cece) coordinates complex workflows

---

## Layer Details

### Infrastructure Layer

The foundation that runs everything.

| Component | Technology | Purpose |
|-----------|------------|---------|
| Edge Compute | Cloudflare Workers | Request routing, auth, caching |
| Key-Value Store | Cloudflare KV | Governance objects, config |
| SQL Database | Cloudflare D1 / Railway Postgres | Structured data, analytics |
| Object Storage | Cloudflare R2 | Files, media, backups |
| Backend Services | Railway | APIs, schedulers, workers |
| LLM Inference | Self-hosted Mistral + Claude API | AI operations |
| Message Queue | Railway Redis | Job queues, pub/sub |

#### Deployment Topology

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Cloudflare  │
                    │   (Edge)     │
                    ├──────────────┤
                    │ Workers (KV) │
                    │ Pages (UI)   │
                    │ R2 (Storage) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌───▼────┐ ┌─────▼─────┐
       │   Railway   │ │ LLM    │ │  External │
       │  (Backend)  │ │ Cluster│ │   APIs    │
       ├─────────────┤ └────────┘ └───────────┘
       │ API Gateway │
       │ Operator    │
       │ Agents      │
       │ Postgres    │
       │ Redis       │
       └─────────────┘
```

### Integration Layer

Connects BlackRoad to external systems via Model Context Protocol (MCP).

#### MCP Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MCP HOST (Cece)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Gmail   │  │ Drive   │  │ Notion  │  │ Stripe  │    │
│  │ Server  │  │ Server  │  │ Server  │  │ Server  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │            │            │            │          │
│  ┌────▼────────────▼────────────▼────────────▼────┐    │
│  │              Tool Registry                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

#### Supported Integrations

| Category | Tools |
|----------|-------|
| Communication | Gmail, Slack, Discord |
| Documents | Google Drive, Notion, Dropbox |
| Development | GitHub, Linear, Jira |
| Finance | Stripe, QuickBooks |
| Infrastructure | Cloudflare, Railway, Vercel |
| Data | Postgres, Redis, Pinecone |

### Governance Layer

The brain that ensures safe, auditable operations.

#### Core Objects

```
┌─────────────────────────────────────────────────────────┐
│                   GOVERNANCE MODEL                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   INTENT ──────► AGENT ──────► TOOL CALL                │
│      │             │              │                      │
│      │             │              ▼                      │
│      │             │         POLICY CHECK                │
│      │             │              │                      │
│      │             │              ▼                      │
│      └─────────────┴────────► LEDGER EVENT              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Object Definitions

| Object | Purpose | Key Pattern |
|--------|---------|-------------|
| **POLICY** | Rules that allow/deny/modify actions | `policy:{scope}:{id}` |
| **LEDGER** | Immutable audit trail | `ledger:{intent_id}:{event_id}` |
| **AGENT** | Registry of workers | `agent:{agent_id}` |
| **INTENT** | Tasks and workflow state | `intent:{intent_id}` |
| **CLAIM** | Identity assertions | `claim:{subject}:{id}` |
| **DELEGATION** | Scoped permissions | `delegation:{delegator}:{id}` |

#### Policy Evaluation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │────►│   Policy     │────►│   Decision   │
│   Context    │     │   Engine     │     │   Result     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Actions:   │
                     │   - allow    │
                     │   - deny     │
                     │   - require_ │
                     │     approval │
                     │   - transform│
                     └──────────────┘
```

### Portal Layer

User-facing applications built on the platform.

| Portal | Domain | Key Features |
|--------|--------|--------------|
| **Lucidia** | Personal AI | Persistent memory, preference learning, multi-modal |
| **RoadWork** | Education | Adaptive curriculum, progress tracking, certification |
| **RoadView** | Media | Video/image generation, editing, publishing |
| **RoadGlitch** | Gaming | Procedural content, AI NPCs, adaptive difficulty |
| **RoadWorld** | Navigation | Context-aware routing, AR overlays, local knowledge |
| **BackRoad** | Privacy | Encryption, anonymization, secure communication |

---

## Agent Architecture

### Agent Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                    CECE (Governor)                       │
│              Lucidia-class Orchestrator                  │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Planner │  │ Builder │  │ Scribe  │  │Guardian │    │
│  │  Agent  │  │  Agent  │  │  Agent  │  │  Agent  │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
├─────────────────────────────────────────────────────────┤
│                   Worker Agents                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │  Email  │  │  Code   │  │  Data   │  │  Media  │    │
│  │ Handler │  │ Writer  │  │ Analyst │  │ Creator │    │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Agent Classes

| Class | Role | Examples |
|-------|------|----------|
| **Lucidia** | Governance & orchestration | Cece |
| **Worker** | Specialized tasks | EmailHandler, CodeWriter |
| **System** | Infrastructure operations | Scheduler, Monitor |
| **Integration** | External tool bridges | GmailServer, StripeServer |

### Agent Communication

Agents communicate via structured messages:

```json
{
  "message_id": "msg-20251130-abc123",
  "from": "cece.governor.v1",
  "to": "email.handler.v1",
  "intent_id": "int-20251130-xyz789",
  "action": "draft_email",
  "payload": {
    "recipient": "investor@example.com",
    "subject": "Follow-up on our meeting",
    "context": "..."
  },
  "constraints": {
    "require_approval": true,
    "max_tokens": 500
  }
}
```

---

## Data Flow

### Request Lifecycle

```
1. User Request
   │
   ▼
2. Edge Router (Cloudflare Worker)
   │
   ├──► Auth Check (Claims)
   │
   ▼
3. Intent Creation
   │
   ▼
4. Cece Planning
   │
   ├──► Tool Selection
   ├──► Policy Pre-check
   │
   ▼
5. Agent Execution
   │
   ├──► Tool Call
   ├──► Policy Evaluation
   ├──► Ledger Write
   │
   ▼
6. Result Aggregation
   │
   ▼
7. Response to User
```

### Event Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Tool   │───►│ Policy  │───►│ Ledger  │───►│  Index  │
│  Call   │    │  Check  │    │  Write  │    │ Update  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                    │
                    ▼
              ┌─────────┐
              │ Webhook │
              │ Notify  │
              └─────────┘
```

---

## Security Model

### Authentication

- **Users:** OAuth 2.0 / OpenID Connect
- **Agents:** API keys with scoped permissions
- **Services:** mTLS between internal services

### Authorization

```
┌─────────────────────────────────────────────────────────┐
│                 AUTHORIZATION STACK                      │
├─────────────────────────────────────────────────────────┤
│  1. Claims     - Who are you?                           │
│  2. Delegations - What can you do?                      │
│  3. Policies   - What's allowed in this context?        │
│  4. Audit      - What did you do?                       │
└─────────────────────────────────────────────────────────┘
```

### Data Classification

| Level | Description | Examples |
|-------|-------------|----------|
| **Public** | No restrictions | Marketing content |
| **Internal** | Org-only access | Design docs |
| **Confidential** | Role-based access | User data |
| **Restricted** | Named individual access | Secrets, PII |

---

## Scalability

### Horizontal Scaling

| Component | Scaling Strategy |
|-----------|------------------|
| Edge Workers | Auto-scaled by Cloudflare |
| API Gateway | Railway auto-scaling |
| Agent Workers | Queue-based scaling |
| Database | Read replicas + connection pooling |

### Performance Targets

| Metric | Target |
|--------|--------|
| Edge latency (P99) | < 50ms |
| API latency (P99) | < 200ms |
| Agent task completion | < 30s |
| Ledger write | < 100ms |

---

## Repository Structure

| Repo | Purpose |
|------|---------|
| `blackroad-os-core` | Desktop UI, auth, identity |
| `blackroad-os-api` | API gateway, REST endpoints |
| `blackroad-os-operator` | Job scheduler, background workers |
| `blackroad-os-agents` | Agent implementations |
| `blackroad-os-infra` | IaC, deployment configs |
| `blackroad-os-docs` | Documentation (this repo) |
| `blackroad-os-web` | Web frontend |
| `blackroad-os-prism-console` | Admin dashboard |
| `lucidia-core` | AI reasoning engines |

---

## References

- [Cece Agent Mode](../governance/cece-agent-mode.md)
- [Governance Roadmap](../governance/governance-roadmap.md)
- [KV Schema](../reference/kv-schema.md)
- [API Design](../reference/api-design.md)
