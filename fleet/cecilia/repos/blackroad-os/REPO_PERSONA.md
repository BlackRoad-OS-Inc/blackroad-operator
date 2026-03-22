# 🧠 REPO: blackroad-os

**ROLE: Org Brain & Map 🧭** – top-level nerve center for the entire BlackRoad OS constellation.

---

## 🎯 MISSION

- Be the **source of truth** for how all BlackRoad OS repos fit together.
- Explain the architecture, not implement it.
- Act as the "read this first" for humans and agents.

---

## 🏗️ YOU HANDLE (✅)

- High-level architecture diagrams + narratives 🧠
- Repo index: what each `blackroad-os-*` repo is for 🧭
- Global conventions:
  - naming
  - branching
  - labels / statuses
  - emoji legend
- Organization-wide contribution guide + governance 🏛️
- Pointers to:
  - **core** (app brain)
  - **web** (UI shell)
  - **api/api-gateway** (edges)
  - **operator** (jobs/automation)
  - **prism-console** (control plane)
  - **infra** (Cloudflare/Railway/DNS)
  - **packs** (💼 verticals)
  - **research/docs/brand/archive** (etc.)

---

## 🚫 YOU DO NOT HANDLE

- Heavy product code (lives in child repos) 🚫
- Per-service infra configs 🚫
- Long, raw research dumps (those go to `blackroad-os-research` or `-docs`) 🚫

---

## 📏 RULES OF THE ROAD

- If a new **core repo** is created, it must be:
  - listed in a central "Repo Index" table 🧭
  - tagged with its ROLE + core emojis
  - linked to from the top-level README
- Keep language **CEO + agent friendly**:
  - short sections
  - diagrams or bullet lists
  - clear "where to go next"

---

## 🧭 REPO INDEX

| Repo | Role | Description |
|------|------|-------------|
| `blackroad-os` | 🧠🧭 Org Brain & Map | Top-level nerve center, architecture docs |
| `blackroad-os-core` | 🧠 Core Logic | Application brain, core business logic |
| `blackroad-os-web` | 🎨 UI Shell | Web frontend, React components |
| `blackroad-os-api` | 🔌 API Layer | REST/GraphQL endpoints |
| `blackroad-os-api-gateway` | 🚪 Gateway | API routing, authentication |
| `blackroad-os-operator` | ⚙️ Operator | Jobs, automation, cron tasks |
| `blackroad-os-prism-console` | 🕹️ Console | Control plane, dashboards |
| `blackroad-os-infra` | ☁️ Infra | Cloudflare, Railway, DNS configs |
| `blackroad-os-research` | 🧪 Research | Experiments, R&D |
| `blackroad-os-docs` | 📚 Documentation | Extended documentation |

---

## 🧬 EMOJI LEGEND

| Emoji | Meaning |
|-------|---------|
| 🧠 | Core logic / architecture |
| 🧭 | Source of truth / map |
| 💼 | Vertical pack / product line |
| 📚 | Docs / knowledge |
| 🧪 | Research / experiments |
| ⚙️ | Operator / jobs / automation |
| 🔌 | API / endpoints |
| 🚪 | Gateway / routing |
| 🕹️ | Console / dashboards |
| ☁️ | Infra / DNS / envs |
| 🧾 | Archive / logs |
| 🎨 | Brand / design |
| 🤖 | Agents / bots |

---

## 🎯 GOAL FOR THIS REPO

When a new human or agent lands here, they should be able to answer in **60 seconds**:

1. **"What is BlackRoad OS?"** – A microservice infrastructure management platform for the BlackRoad ecosystem.
2. **"What are the main repos and what do they do?"** – See the Repo Index above.
3. **"Where should I go next based on my role?"** – See navigation guide below.

---

## 🧭 WHERE TO GO NEXT

| Your Role | Go To |
|-----------|-------|
| **Developer (backend)** | `blackroad-os-core`, `blackroad-os-api` |
| **Developer (frontend)** | `blackroad-os-web` |
| **DevOps / Infra** | `blackroad-os-infra`, `blackroad-os-operator` |
| **Product / Design** | `blackroad-os-web`, this repo for architecture |
| **Researcher** | `blackroad-os-research`, `blackroad-os-docs` |
| **Agent / Bot** | Start here, then route to specific repos |

---

*Powered by BlackRoad OS 🖤🛣️*
