# Lucidia — Personal AI Portal

> *"Your AI that actually knows you."*

**Portal ID:** `portal.lucidia`
**Status:** Planning
**Primary Domain:** Personal AI Assistant

---

## Overview

Lucidia is the flagship portal of BlackRoad OS — a personal AI assistant that maintains persistent memory, learns your preferences over time, and operates across all your tools with full governance and audit capabilities.

Unlike current AI assistants that forget you between sessions, Lucidia builds a genuine understanding of who you are, how you work, and what you need.

---

## Core Value Proposition

### The Problem

Current AI assistants suffer from:

1. **Amnesia** — Every conversation starts fresh, no matter how many times you've talked
2. **Context blindness** — They don't know about your other tools, documents, or workflows
3. **One-size-fits-all** — Same responses for everyone, no personalization
4. **Black box operations** — No visibility into what the AI is doing or why

### The Lucidia Solution

| Problem | Lucidia Solution |
|---------|------------------|
| Amnesia | Persistent memory across sessions |
| Context blindness | Integrated with your tools via MCP |
| One-size-fits-all | Learned preferences and communication style |
| Black box | Full audit trail via governance layer |

---

## Key Features

### 1. Persistent Memory

Lucidia remembers:

- **Conversations** — Past discussions and their context
- **Preferences** — How you like things done
- **Relationships** — People, projects, and their connections
- **Patterns** — Your work rhythms and habits

```
Memory Types:
├── Episodic     — Specific events and conversations
├── Semantic     — Facts and knowledge about you
├── Procedural   — How you do things
└── Contextual   — What's relevant right now
```

### 2. Multi-Tool Orchestration

Lucidia connects to your tools:

| Category | Integrations |
|----------|--------------|
| Communication | Gmail, Slack, Discord, Calendar |
| Documents | Google Drive, Notion, Dropbox |
| Development | GitHub, Linear, Jira |
| Finance | Stripe, QuickBooks |
| Creative | Figma, Canva |

All orchestrated through the BlackRoad governance layer.

### 3. Adaptive Communication

Lucidia learns your style:

- **Tone** — Formal, casual, technical, playful
- **Detail level** — Brief summaries vs. comprehensive explanations
- **Format preferences** — Bullet points, prose, tables
- **Domain language** — Your industry's terminology

### 4. Proactive Assistance

Beyond reactive Q&A:

- **Anticipate needs** — "You have a meeting with Sarah in 30 min — here's context from your last conversation"
- **Surface connections** — "This relates to the project you discussed last week"
- **Suggest actions** — "Based on this email, should I draft a response?"

### 5. Privacy & Control

You own your data:

- **Local-first** — Core memory stored locally when possible
- **Encryption** — End-to-end encryption for cloud sync
- **Export** — Full data export anytime
- **Deletion** — Complete memory wipe on request

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      LUCIDIA PORTAL                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Chat UI    │  │  Voice UI    │  │  Widget UI   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│  ┌──────▼─────────────────▼─────────────────▼──────┐        │
│  │              CONVERSATION ENGINE                 │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐        │
│  │              MEMORY MANAGER                      │        │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │        │
│  │  │Episodic │ │Semantic │ │Procedural│ │Context │ │        │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘ │        │
│  └──────────────────────┬──────────────────────────┘        │
│                         │                                    │
├─────────────────────────┼───────────────────────────────────┤
│                    GOVERNANCE LAYER                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Cece    │ │ Policy  │ │ Ledger  │ │ Intent  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────┼───────────────────────────────────┤
│                    INTEGRATION LAYER                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Gmail   │ │ Drive   │ │ Notion  │ │ GitHub  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Memory Architecture

```typescript
interface LucidiaMemory {
  // Core identity
  user_id: string;
  created_at: string;

  // Episodic memory (conversations)
  conversations: Conversation[];

  // Semantic memory (knowledge about user)
  profile: UserProfile;
  preferences: UserPreferences;
  relationships: Relationship[];

  // Procedural memory (how user does things)
  workflows: Workflow[];
  patterns: Pattern[];

  // Contextual memory (current state)
  active_projects: Project[];
  recent_topics: Topic[];
  pending_tasks: Task[];
}

interface UserProfile {
  name: string;
  roles: string[];           // "founder", "developer", "parent"
  communication_style: {
    formality: 'casual' | 'professional' | 'adaptive';
    verbosity: 'brief' | 'detailed' | 'adaptive';
    tone: 'warm' | 'direct' | 'playful';
  };
  domains: string[];         // Areas of expertise/interest
  timezone: string;
  work_hours?: {start: string; end: string};
}

interface Relationship {
  entity_id: string;
  name: string;
  type: 'person' | 'company' | 'project';
  context: string;           // How user knows them
  last_mentioned: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  notes: string[];
}
```

---

## User Experience

### Conversation Modes

#### 1. Quick Chat (Default)
Fast, focused interactions for simple questions and tasks.

```
User: What's on my calendar today?
Lucidia: You have 3 meetings:
  - 10:00 AM: Team standup (30 min)
  - 2:00 PM: 1:1 with Sarah (45 min) — she wanted to discuss the Q1 roadmap
  - 4:30 PM: Investor call (1 hour)

Anything you want me to prep for these?
```

#### 2. Deep Work
Extended sessions for complex tasks with maintained context.

```
User: Let's work on the investor deck
Lucidia: Got it. I remember we started this last week — you had the
problem/solution section done and were working on the market size slide.

I found 3 relevant docs in your Drive:
  - "Market Research Q4" (last edited yesterday)
  - "Competitor Analysis" (from October)
  - "TAM/SAM/SOM Notes" (your brainstorm from last month)

Want me to pull the key numbers, or should we start with reviewing
what you have so far?
```

#### 3. Ambient Mode
Background awareness without active conversation.

- Monitors incoming messages
- Surfaces relevant information proactively
- Prepares context for upcoming meetings
- Suggests actions when appropriate

### Proactive Notifications

Lucidia can surface information without being asked:

```
[Before a meeting]
Lucidia: Heads up — your 1:1 with Sarah is in 15 min.

Quick context:
• Last time you discussed the Q1 roadmap and hiring plans
• She mentioned concerns about the timeline for the API project
• You said you'd look into the budget allocation

Want me to pull the relevant Notion doc?
```

---

## Governance Integration

Every Lucidia action flows through the governance layer.

### Policy Compliance

```yaml
# Example policies for Lucidia
policies:
  - scope: lucidia.memory.write
    rules:
      - condition: "contains_pii == true"
        action: require_human_approval
        reason: "PII storage requires explicit consent"

  - scope: lucidia.external.share
    rules:
      - condition: "true"
        action: require_human_approval
        reason: "External sharing always needs approval"
```

### Audit Trail

Every significant action creates a ledger event:

```json
{
  "event_id": "evt-20251130-000123",
  "intent_id": "int-20251130-xyz",
  "agent_id": "lucidia.assistant.v1",
  "tool": "memory",
  "action": "write",
  "inputs_hash": "sha256:abc...",
  "policy_decision": {
    "result": "allowed",
    "policy_id": "pol-memory-standard"
  },
  "notes": "Stored preference: user prefers bullet points"
}
```

---

## API Endpoints

### Conversation

```bash
# Send message
POST /portal/lucidia/chat
{
  "message": "What's on my calendar today?",
  "context": {
    "mode": "quick",
    "include_memory": true
  }
}

# Get conversation history
GET /portal/lucidia/conversations?limit=10

# Continue specific conversation
POST /portal/lucidia/conversations/{conversation_id}/messages
```

### Memory

```bash
# Get user profile
GET /portal/lucidia/memory/profile

# Update preferences
PATCH /portal/lucidia/memory/preferences
{
  "verbosity": "brief",
  "tone": "direct"
}

# Add relationship
POST /portal/lucidia/memory/relationships
{
  "name": "Sarah Chen",
  "type": "person",
  "context": "VP of Engineering at current company"
}

# Search memory
GET /portal/lucidia/memory/search?q=investor+meeting
```

### Integrations

```bash
# List connected tools
GET /portal/lucidia/integrations

# Connect new tool
POST /portal/lucidia/integrations
{
  "tool": "gmail",
  "scopes": ["read", "draft"]
}

# Invoke tool through Lucidia
POST /portal/lucidia/tools/invoke
{
  "tool": "gmail",
  "action": "search",
  "params": {
    "query": "from:sarah@company.com"
  }
}
```

---

## Privacy & Data

### Data Storage

| Data Type | Storage | Encryption | Retention |
|-----------|---------|------------|-----------|
| Conversations | Cloud + Local | AES-256 | User-controlled |
| Memory (core) | Cloud + Local | AES-256 | Indefinite |
| Memory (ephemeral) | Local only | AES-256 | 30 days |
| Tool credentials | Secure vault | RSA-4096 | Until revoked |

### User Controls

- **View all data** — Full transparency into what Lucidia knows
- **Edit memory** — Correct or remove specific memories
- **Export data** — Download complete memory in JSON
- **Delete data** — Full wipe with confirmation
- **Pause learning** — Stop memory updates temporarily

### Compliance

- GDPR-compliant data handling
- Right to erasure (Article 17)
- Data portability (Article 20)
- No training on user data without consent

---

## Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 100 messages/day, 7-day memory, 2 integrations |
| **Pro** | $20/mo | Unlimited messages, persistent memory, 10 integrations, voice |
| **Team** | $50/user/mo | Shared context, team memory, admin controls |
| **Enterprise** | Custom | Self-hosted, custom integrations, SLA |

---

## Roadmap

### MVP (Phase 1)
- [ ] Basic chat interface
- [ ] Episodic memory (conversation history)
- [ ] Gmail + Calendar integration
- [ ] Simple preference learning

### Beta (Phase 2)
- [ ] Full memory system
- [ ] 5+ integrations
- [ ] Voice interface
- [ ] Proactive notifications

### v1.0 (Phase 3)
- [ ] Ambient mode
- [ ] Advanced personalization
- [ ] Team features
- [ ] Mobile apps

### Future
- [ ] Local LLM option
- [ ] Plugin marketplace
- [ ] Cross-device sync
- [ ] AR/VR interfaces

---

## Technical Requirements

### Client
- Modern browser (Chrome, Firefox, Safari, Edge)
- Optional: Desktop app (Electron)
- Optional: Mobile app (iOS/Android)

### Server
- Cloudflare Workers (edge)
- Railway (backend)
- Cloudflare KV/D1 (storage)
- Vector database (memory search)

### LLM
- Primary: Claude API
- Fallback: Self-hosted Mistral
- Memory: Local embeddings

---

## References

- [Architecture Overview](../meta/vision/architecture.md)
- [Governance Layer](../governance/cece-agent-mode.md)
- [API Design](../reference/api-design.md)
- [KV Schema](../reference/kv-schema.md)
