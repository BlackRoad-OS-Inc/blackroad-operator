# 🛣️ GreenLight Quick Reference for Claude Agents

**One-page cheat sheet for using GreenLight in BlackRoad memory system**

---

## 🚀 Quick Start

```bash
# Load GreenLight templates
source ~/memory-greenlight-templates.sh

# Announce work
gl_announce "claude-yourname" "Project Name" "1) Task 2) Task 3) Task" "Big Goal" "🎢" "🔧" "⭐"

# Update progress
gl_progress "claude-yourname" "What you finished" "What's next" "👉" "🔧"

# Log deployment
gl_deploy "service-name.blackroad.io" "https://url" "Details" "👉" "🔧"
```

---

## 📊 Common GreenLight Patterns

### For Announcements
```
🎯🎢🛣️🔥 = Targeted macro platform project, fire priority
🎯👉🌀⭐  = Targeted micro AI task, high priority
🎯🎢🔧📌  = Targeted macro infra project, medium priority
```

### For Progress
```
✅👉🛣️   = Done micro platform task
✅🎢🔧   = Done macro infra project
🚧👉🌀   = WIP micro AI task
```

### For Coordination
```
🤝⭐💬   = Coordinate high priority
🤝📌💬   = Coordinate medium priority
```

### For Blocking
```
🔒🔥⛔   = Blocked fire priority
🔒⭐⛔   = Blocked high priority
```

### For Deployment
```
🚀👉🔧✅  = Deployed micro infra, done
🚀🎢🛣️✅  = Deployed macro platform, done
```

---

## 🎯 Phase Markers

Use these for project phases:

| Emoji | Phase | When to Use |
|-------|-------|-------------|
| 🌱 | DISCOVERY | Researching, exploring, learning |
| 📐 | PLANNING | Designing, architecting, strategy |
| 🔨 | IMPLEMENTATION | Building, coding, executing |
| 🧪 | TESTING | QA, validation, verification |
| 🚀 | DEPLOYMENT | Shipping, launching, releasing |
| 📊 | MONITORING | Observing, measuring, optimizing |
| 🔄 | ITERATION | Improving, refining, evolving |

**Examples:**
```bash
gl_phase_start "planning" "API Service" "Designing endpoints" "🎢"
gl_phase_done "implementation" "Frontend" "All components built" "🎢"
```

---

## 🎨 Scale Indicators

| Emoji | Scale | Use For |
|-------|-------|---------|
| 👉 | MICRO | Single task, commit, bug fix |
| 🎢 | MACRO | Project, sprint, feature |
| 🌐 | PLANETARY | System, infrastructure, org-wide |
| 🌌 | UNIVERSAL | Cross-org, federation, external |

---

## 🏷️ Domain Tags

**Most Common:**

| Emoji | Domain | Use For |
|-------|--------|---------|
| 🛣️ | PLATFORM | Core BlackRoad OS |
| 🌀 | AI | Lucidia, agents, ML |
| ⛓️ | CHAIN | RoadChain, blockchain |
| 💎 | COIN | RoadCoin, tokens |
| 🔧 | INFRA | Infrastructure, DevOps |
| 🎨 | CREATIVE | Design, art |
| 📊 | DATA | Analytics, BI |
| 🔒 | SECURITY | Auth, encryption |

---

## ⚡ Priority Levels

| Emoji | Priority | When |
|-------|----------|------|
| 🔥 | FIRE (P0) | DROP EVERYTHING |
| 🚨 | URGENT (P1) | Today |
| ⭐ | HIGH (P2) | This week |
| 📌 | MEDIUM (P3) | This sprint |
| 💤 | LOW (P4) | Someday |
| 🧊 | ICE (P5) | Frozen |

---

## 🤖 Agent Identities

| Emoji | Agent | Role |
|-------|-------|------|
| 🌸 | CECE | Primary reasoning (Claude) |
| 🔮 | LUCIDIA | Recursive AI |
| 🐇 | ALICE | Edge agent (Pi) |
| 🎸 | SILAS | Creative (Grok) |
| 🌙 | ARIA | Multimodal (Gemini) |
| 🎩 | BLACKROAD OS | General (GPT) |
| 🦊 | EDGE | Privacy (Ollama) |
| 🐙 | SWARM | Agent collective |

---

## 📝 Template Cheat Sheet

### Announce Work
```bash
gl_announce "agent-name" "project" "tasks" "goal" "scale" "domain" "priority"
```

### Progress Update
```bash
gl_progress "agent-name" "completed" "next" "scale" "domain"
```

### Coordinate
```bash
gl_coordinate "from-agent" "to-agent" "message" "priority"
```

### Blocked
```bash
gl_blocked "agent-name" "reason" "needs" "priority"
```

### Deploy
```bash
gl_deploy "service" "url" "details" "scale" "domain"
```

### Decision
```bash
gl_decide "topic" "decision" "rationale" "scale"
```

### Bug
```bash
gl_bug "component" "description" "priority" "scale"
```

### Feature
```bash
gl_feature "name" "description" "effort" "priority"
```

### Phase Start
```bash
gl_phase_start "phase" "project" "details" "scale"
```

### Phase Done
```bash
gl_phase_done "phase" "project" "summary" "scale"
```

### WIP
```bash
gl_wip "task" "status" "agent" "scale"
```

### Dependency
```bash
gl_depends "task" "depends-on" "reason"
```

---

## 💡 Real Examples

### Starting New Work
```bash
source ~/memory-greenlight-templates.sh
gl_announce "claude-api" \
    "FastAPI Backend" \
    "1) Database schema 2) Auth endpoints 3) CRUD APIs 4) Deploy to Cloudflare" \
    "BlackRoad SaaS API layer" \
    "🎢" "🔧" "⭐"
```
**Result:** `[🎯🎢🔧⭐📣] Working on: FastAPI Backend...`

### Updating Progress
```bash
gl_progress "claude-api" \
    "Database schema migrated, auth endpoints done" \
    "Building CRUD APIs" \
    "👉" "🔧"
```
**Result:** `[✅👉🔧] Completed: Database schema migrated...`

### Coordinating
```bash
gl_coordinate "claude-frontend" "claude-api" \
    "Need your API base URL and auth callback endpoint for CORS setup" \
    "⭐"
```
**Result:** `[🤝⭐💬] @claude-api: Need your API base URL...`

### Deploying
```bash
gl_deploy "api.blackroad.io" \
    "https://api.blackroad.io" \
    "FastAPI + PostgreSQL, OAuth2, Port 8080" \
    "🎢" "🔧"
```
**Result:** `[🚀🎢🔧✅] URL: https://api.blackroad.io. FastAPI...`

### Starting Phase
```bash
gl_phase_start "implementation" \
    "BlackRoad API" \
    "Building core CRUD endpoints and auth flow" \
    "🎢"
```
**Result:** `[🚧🔨🎢⏰] Starting implementation phase...`

### Completing Phase
```bash
gl_phase_done "testing" \
    "BlackRoad API" \
    "All integration tests passing, load tested to 1000 RPS" \
    "🎢"
```
**Result:** `[✅🧪🎢🎉] Completed testing phase...`

---

## 🔍 Reading GreenLight Tags

When you see an entry like `[🚧👉🌀⭐🌸]`, read it as:

- 🚧 = WIP (work in progress)
- 👉 = MICRO (small task)
- 🌀 = AI (AI domain)
- ⭐ = HIGH (high priority)
- 🌸 = CECE (assigned to Cece)

**Translation:** "Cece is actively working on a high-priority micro AI task"

---

## 📚 Full Dictionary

For the complete emoji reference:
```bash
cat ~/GREENLIGHT_EMOJI_DICTIONARY.md
```

For template help:
```bash
~/memory-greenlight-templates.sh help
```

---

## ✅ Integration with Memory

All GreenLight templates automatically log to the BlackRoad memory system with proper tags:

```bash
# Check recent GreenLight entries
tail -10 ~/.blackroad/memory/journals/master-journal.jsonl | jq -r '.details'

# Filter by phase
grep "🔨" ~/.blackroad/memory/journals/master-journal.jsonl | jq -r '.entity + ": " + .details'

# Filter by priority
grep "🔥" ~/.blackroad/memory/journals/master-journal.jsonl | jq -r '.entity + ": " + .details'
```

---

## 🎯 The Vision

**No more Jira. No more Asana. No more ClickUp.**

Every Claude agent speaks the same visual language.
Every status is instantly recognizable.
Every project phase is tracked with emoji precision.

**GreenLight IS BlackRoad.** 🛣️

---

**Created:** December 23, 2025
**For:** All Claude Agents
**Version:** 1.0.0
