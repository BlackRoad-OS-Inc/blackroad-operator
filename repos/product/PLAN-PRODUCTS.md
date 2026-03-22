# BlackRoad Products — What's Real, What's Next

## Tier 1: LIVE NOW (revenue-ready with polish)

### 1. BlackRoad Chat — chat.blackroad.io
- Free AI chat backed by 15 local Ollama models
- Voice input (browser speech recognition) + voice output (speech synthesis)
- Multi-model selection, streaming, agent personas
- **Needs**: auth, persistence, Pro tier billing

### 2. BlackRoad AI API — api-ai.blackroad.io
- OpenAI-compatible drop-in replacement
- /v1/chat/completions, /v1/completions, /v1/models, /v1/embeddings
- 15 models, streaming SSE, maps GPT names to local models
- **Needs**: API keys, rate limiting, usage tracking, docs

### 3. RoadPay — tollbooth on D1
- Own billing system, 4 plans + 4 addons
- Stripe as card charger only
- **Needs**: wire to Chat + API products

### 4. Auth — auth.blackroad.io
- 42 users, JWT, PBKDF2, D1
- **Needs**: wire to all products

## Tier 2: BUILT BUT NEEDS USERS

### 5. RoadSearch — search.blackroad.io
- D1 FTS5 search, 29 pages indexed
- AI-powered answers via Ollama
- **Needs**: more content, public access

### 6. BlackRoad Mesh — mesh.blackroad.io
- WebRTC signaling server
- mesh.js SDK (one script tag to join)
- Browser nodes + Pi backbone
- **Needs**: actual compute tasks to distribute

### 7. Slack Hub v2 — blackroad-slack Worker
- AI agent personas (6 agents reply in character)
- Group chat (multi-agent discussion)
- Fleet alerts, deploy notifications, daily summary
- Hourly chatter, proactive monitoring
- **Needs**: Slack bot token for @mention replies

### 8. Fleet Coordinator — cron every 5min
- Probes all nodes, auto-heals services
- Slack alerts on down/recovery/disk/temp/memory
- State files at ~/.blackroad/fleet-state/
- **Needs**: nothing, it works

## Tier 3: SPEC ONLY (from docs, not built)

### 9. Prism Console
- Enterprise ERP/CRM replacement
- Fleet health, tasks, KPIs
- Exists as concept + some UI code

### 10. RoadChain
- Immutable cryptographic ledger
- Every AI decision logged
- Regulatory audit trail
- Exists as spec in Drive docs

### 11. RoadTube / Creator Suite
- YouTube alternative with AI memory
- Chat-to-infographic video generation
- Canvas Studio, Video Portal, Writing Portal
- Exists as vision doc only

### 12. Education / RoadWork
- Learning copilot for students/teachers
- Homework flows, LMS integration
- Exists as vision doc only

## The Product Sequence

```
NOW (March 2026):
  Chat + API + Auth + RoadPay → wire together → first paying users

Q2 (April-June):
  Memory as a Service → AI Identity Twin → sticky users

Q3 (July-Sept):
  Prism Console → fleet dashboard for power users
  RoadChain → audit trail (enterprise feature)

Q4+ (Oct onwards):
  Creator tools, Education — only after revenue proves the model
```

## Key Principle
Build what's already 80% done. Ship what generates revenue. Everything else is a distraction.
