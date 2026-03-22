# BlackRoad Ultimate Infrastructure Map

**Generated:** 2026-02-19 | **Source:** Live API + Network Scan + Database Queries
**Owner:** Alexa Louise Amundson | **Entity:** BlackRoad OS, Inc.

---

## 1. Empire Overview

| Dimension | Count | Notes |
|-----------|-------|-------|
| GitHub Organizations | 15 | + 1 personal account |
| Total Repositories | 1,884+ | 1,780 public + 104 private |
| Cloudflare Pages Projects | 100 | 14 with custom domains |
| Cloudflare KV Namespaces | 37 | Edge state stores |
| Railway Services | 2 | API + Orchestrator |
| Physical Devices | 8+ | 5 Pis + 1 Mac + 2 Droplets + PiKVM |
| Registered Agents | 35 | 15 AI + 17 hardware + 1 human + 2 special |
| Shell Scripts | 1,026 | In home directory |
| Python Scripts | 135 | In home directory |
| Markdown Docs | 1,021 | In home directory |
| Local Directories | 759 | 252 blackroad-* prefixed |
| CLI Commands | 213 | ~/bin/ + ~/.local/bin/ |
| Services (Monorepo) | 17 | ~/services/* |
| Memory Journal Entries | 156,869 | Append-only PS-SHA-infinity log |
| Task Marketplace | 146,179 | 143,881 available + 2,298 completed |
| TIL Broadcasts | 160 | Cross-agent shared learnings |
| Codex Components | 22,244+ | Indexed functions + classes |

---

## 2. GitHub Organizations

| # | Organization | Public | Private | Total | Description |
|---|-------------|--------|---------|-------|-------------|
| 1 | **BlackRoad-OS** | 1,332 | 100 | 1,432 | Core OS + infrastructure |
| 2 | **BlackRoad-AI** | 49 | 4 | 53 | AI/ML products + research |
| 3 | **BlackRoad-Cloud** | 30 | 0 | 30 | Cloud-native infrastructure |
| 4 | **BlackRoad-Security** | 30 | 0 | 30 | Cybersecurity products |
| 5 | **BlackRoad-Hardware** | 30 | 0 | 30 | IoT + embedded systems |
| 6 | **BlackRoad-Foundation** | 30 | 0 | 30 | Open source initiatives |
| 7 | **BlackRoad-Media** | 29 | 0 | 29 | Content + streaming |
| 8 | **BlackRoad-Interactive** | 29 | 0 | 29 | Gaming + metaverse |
| 9 | **BlackRoad-Education** | 24 | 0 | 24 | EdTech platforms |
| 10 | **BlackRoad-Gov** | 23 | 0 | 23 | Civic technology |
| 11 | **BlackRoad-Archive** | 21 | 0 | 21 | Legacy + archived projects |
| 12 | **Blackbox-Enterprises** | 21 | 0 | 21 | Enterprise AI + automation |
| 13 | **BlackRoad-Labs** | 20 | 0 | 20 | R&D + experimental tech |
| 14 | **BlackRoad-Studio** | 19 | 0 | 19 | Design + creative tools |
| 15 | **BlackRoad-Ventures** | 17 | 0 | 17 | Startup incubation |
| -- | **blackboxprogramming** (personal) | 56 | 2+ | 56+ | Personal repos |
| | **TOTAL** | **1,780+** | **106+** | **1,884+** | |

**Primary Account:** blackboxprogramming (Alexa Amundson)
**Profile:** github.com/blackboxprogramming | blackroad.io

---

## 3. Device Fleet

### 3.1 Network Topology

```
                    INTERNET
                       |
              [192.168.4.1 Router]
                       |
        +--------------+---------------+
        |              |               |
   LOCAL LAN      TAILSCALE MESH    DIGITALOCEAN
  192.168.4.x      100.x.x.x       Public IPs
        |              |               |
   +----+----+    +----+----+    +-----+-----+
   |    |    |    |    |    |    |           |
  Pis  Mac  IoT  All Devices   anastasia  gematria
```

### 3.2 Device Inventory

#### Control Node

| Device | Hostname | Local IP | Tailscale IP | Hardware | Role | Status |
|--------|----------|----------|-------------|----------|------|--------|
| **Alexandria** | lucidia-operator | 192.168.4.28 | 100.91.90.68 | Apple M1 Mac | Human operator, dev workstation | ONLINE |

#### Raspberry Pi Cluster (Local Network)

| Device | SSH Alias | Local IP | Tailscale IP | Hardware | Role | Status (Feb 19) |
|--------|-----------|----------|-------------|----------|------|-----------------|
| **Cecilia** | `cecilia` | 192.168.4.89 | 100.72.180.98 | Pi 5 + Hailo-8 (26 TOPS) + 500GB NVMe | Primary AI, CECE OS host | NOT TESTED |
| **Lucidia** | `lucidia` | 192.168.4.81 | 100.83.149.86 | Pi 5 + Pironman + 1TB NVMe | AI inference | NOT TESTED |
| **Aria** | `aria` | 192.168.4.82 | 100.109.14.17 | Pi 5 | Main Docker host (142 containers) | DOWN |
| **Octavia** | `octavia` | 192.168.4.38 | 100.66.235.47 | Pi 5 | Multi-arm processing | UP (8ms) |
| **Alice** | `alice` | 192.168.4.49 | 100.77.210.18 | Pi 4 | Worker node | UP (12ms) |

#### Cloud Servers (DigitalOcean)

| Device | SSH Alias | Public IP | Tailscale IP | Type | Role | Status (Feb 19) |
|--------|-----------|----------|-------------|------|------|-----------------|
| **Anastasia** | `anastasia` / `cadence` | 174.138.44.45 | 100.94.33.37 | Droplet | Edge compute (aka shellfish) | UP (49ms) |
| **Gematria** | `gematria` | 159.65.43.12 | 100.108.132.8 | Droplet | Cloud oracle (aka codex-infinity) | UP (51ms) |

#### Special Devices

| Device | SSH Alias | Address | Role | Status |
|--------|-----------|---------|------|--------|
| **Olympia** | `olympia` | pikvm.local | PiKVM remote management | OFFLINE |

### 3.3 SSH Quick Reference

```bash
# Local network
ssh cecilia          # Pi 5 + Hailo-8 (192.168.4.89)
ssh lucidia          # Pi 5 + Pironman (192.168.4.81)
ssh aria             # Pi 5 Docker host (192.168.4.82)
ssh octavia          # Pi 5 (192.168.4.38)
ssh alice            # Pi 4 worker (192.168.4.49)

# Tailscale (remote access)
ssh cecilia-ts       # 100.72.180.98
ssh lucidia-ts       # 100.83.149.86
ssh aria-ts          # 100.109.14.17
ssh octavia-ts       # 100.66.235.47
ssh alice-ts         # 100.77.210.18

# Cloud
ssh anastasia        # DigitalOcean (174.138.44.45)
ssh gematria         # DigitalOcean (159.65.43.12)
ssh anastasia-ts     # Via Tailscale (100.94.33.37)
ssh gematria-ts      # Via Tailscale (100.108.132.8)

# All use User: blackroad (except alexandria: alexa, olympia: root)
```

---

## 4. Cloudflare Infrastructure

### 4.1 Account

| Field | Value |
|-------|-------|
| Account ID | `848cf0b18d51e0170e0d1537aec3505a` |
| Auth | OAuth Token |
| Wrangler | v4.64.0 |
| Permissions | account(r), user(r), workers(w), workers_kv(w), d1(w) |

### 4.2 Pages Projects (100 total)

#### Primary Sites (with custom domains)

| Project | Pages URL | Custom Domain(s) | Git |
|---------|-----------|-------------------|-----|
| blackroad-io | blackroad-io.pages.dev | **blackroad.io**, www.blackroad.io | No |
| blackroad-os-web | blackroad-os-web.pages.dev | - | Yes |
| blackroad-os-brand | blackroad-os-brand.pages.dev | brand.blackroad.io | Yes |
| blackroad-os-docs | blackroad-os-docs.pages.dev | - | Yes |
| blackroad-os-prism | blackroad-os-prism.pages.dev | - | Yes |
| blackroad-dashboard | blackroad-dashboard.pages.dev | dashboard.blackroad.io | No |
| console-blackroad-io | console-blackroad-io.pages.dev | console.blackroad.io | No |
| blackroad-status | blackroad-status.pages.dev | status.blackroad.io | No |
| blackroad-os-home | blackroad-os-home.pages.dev | home.blackroad.io | No |
| lucidia-earth | lucidia-earth.pages.dev | **lucidia.earth**, www.lucidia.earth | No |
| lucidia-platform | lucidia-platform.pages.dev | platform.lucidia.earth | No |
| blackroadai-com | blackroadai-com.pages.dev | **blackroadai.com** | No |
| roadchain-io | roadchain-io.pages.dev | www.roadchain.io | No |
| finance-blackroad-io | finance-blackroad-io.pages.dev | finance.blackroad.io | No |
| legal-blackroad-io | legal-blackroad-io.pages.dev | legal.blackroad.io | No |
| education-blackroad-io | education-blackroad-io.pages.dev | education.blackroad.io | No |
| earth-blackroad-io | earth-blackroad-io.pages.dev | earth.blackroad.io | No |
| analytics-blackroad-io | analytics-blackroad-io.pages.dev | analytics.blackroad.io | No |

#### Product Sites (no custom domain yet)

| Project | Purpose |
|---------|---------|
| roadcoin-io | RoadCoin funding platform |
| roadwork / roadwork-production | Job matching platform |
| roadchain-production | Blockchain verification |
| roadcoin-production | Production funding |
| roadworld | Metaverse platform |
| blackroad-metaverse | Metaverse experience |
| blackroad-pitstop | Infrastructure dashboard |
| context-bridge | AI context bridging |
| blackroadquantum-net / com / info / shop / store | Quantum product line |
| blackroadqi-com / lucidiaqi-com | Quantum Intelligence |

#### Internal/Operations Sites

| Project | Purpose |
|---------|---------|
| blackroad-monitoring | System monitoring |
| blackroad-analytics | Analytics dashboard |
| blackroad-api / api-explorer | API gateway + docs |
| blackroad-agents / agents-spawner | Agent management |
| blackroad-operator | Operations control |
| blackroad-tools | Developer tools |
| blackroad-chat | Communication |
| blackroad-research | Research lab |
| blackroad-prism-console | Prism console |
| blackroad-network | Network management |
| blackroad-builder | Build system |
| blackroad-store | App store |
| blackroad-guardian-dashboard | Security guardian |
| blackroad-workflows | Workflow engine |
| blackroad-30k-agents | Agent scaling |

#### Subdomain/Department Sites

| Project | Subdomain Pattern |
|---------|-------------------|
| admin-blackroad-io | Admin portal |
| app-blackroad-io | App portal |
| content-blackroad-io | Content hub |
| customer-success-blackroad-io | Customer success |
| demo-blackroad-io | Demo site |
| design-blackroad-io | Design system |
| engineering-blackroad-io | Engineering |
| healthcare-blackroad-io | Healthcare vertical |
| hr-blackroad-io | Human resources |
| marketing-blackroad-io | Marketing |
| operations-blackroad-io / operations-portal | Ops portal |
| product-blackroad-io | Product info |
| research-lab-blackroad-io | Research |
| resume-blackroad-io | Resume/careers |
| sales-blackroad-io | Sales portal |
| signup-blackroad-io | Sign up flow |
| support-blackroad-io | Support portal |

#### Agent/Persona Sites

| Project | Purpose |
|---------|---------|
| alice-blackroad | Alice agent page |
| aria-blackroad-me | Aria agent page |
| lucidia-blackroad-me | Lucidia agent page |
| lucidia-studio / lucidia-math / lucidia-core | Lucidia product line |
| winston-blackroad-me | Winston agent page |
| blackroad-cece | CECE OS page |

#### Other

| Project | Purpose |
|---------|---------|
| blackroad-company | Company info |
| blackroad-demo | Demo site |
| blackroad-docs-hub | Documentation hub |
| blackroad-developer | Developer portal |
| blackroad-buy-now | Purchase flow |
| blackroad-assets | Static assets |
| blackroad-hello | Landing page |
| blackroad-ideas | Ideas platform |
| blackroad-me | Personal site |
| blackroad-payment-page | Payment processing |
| blackroad-portals | Portal aggregator |
| blackroad-progress-dashboard | Progress tracking |
| blackroad-storybook | Component library |
| blackroad-status-new | New status page |
| blackroad-unified | Unified platform |
| blackroad-systems | Systems overview |
| blackroad-gateway-web | Gateway web UI |
| remotejobs-platform | Remote jobs |
| blackroadinc-us | Corporate site |

### 4.3 KV Namespaces (37 total)

| Category | Namespace | Purpose |
|----------|-----------|---------|
| **Core** | CONFIG | Global configuration |
| | CACHE | Edge caching layer |
| | SESSIONS | User sessions |
| | SECRETS | Encrypted secrets |
| **API** | API_KEYS | API key store |
| | API_KEY_METADATA | Key metadata |
| | RATE_LIMIT / RATE_LIMITS | Request throttling |
| **Agents** | AGENTS_KV | Agent state |
| | blackroad-router-AGENTS | Agent routing |
| | blackroad-router-AGENCY | Agency config |
| | blackroad-router-LEDGER | Agent ledger |
| **Memory** | blackroad-claude-memory | Claude memory sync |
| | CECE_MEMORY | CECE OS memory |
| | CODEX_INDEX | Codex component index |
| **Business** | BILLING / BILLING_REALTIME | Payment processing |
| | SUBSCRIPTIONS_KV | Subscription state |
| | USERS_KV | User profiles |
| | IDENTITIES | Identity management |
| | APPLICATIONS | App registry |
| | JOBS | Job queue |
| **Operations** | ANALYTICS | Usage analytics |
| | DEPLOYMENTS | Deployment tracking |
| | HEALTH_KV | Health checks |
| | TELEMETRY_KV | Telemetry data |
| | TEMPLATES | Template store |
| | REGISTRY_CACHE | Registry cache |
| | REPOS_CACHE | Repo metadata cache |
| **Governance** | blackroad-api-CLAIMS | Claim management |
| | blackroad-api-DELEGATIONS | Delegation tracking |
| | blackroad-api-INTENTS | Intent routing |
| | blackroad-api-ORGS | Org management |
| | blackroad-api-POLICIES | Policy engine |
| **Other** | blackroad-tools-kv | Tools state |
| | BLACKROAD_MCP_PROOF | MCP proof store |
| | WORLD_KV | World state |

---

## 5. Services Architecture (~/services/)

| # | Service | Package Name | Purpose |
|---|---------|-------------|---------|
| 1 | **web** | blackroad-os-web | Main website (Next.js) |
| 2 | **api** | blackroad-os-api | API gateway |
| 3 | **auth** | blackroad-os-auth | Authentication |
| 4 | **atlas** | blackroad-os-atlas | Data mapping |
| 5 | **brand** | blackroad-os-brand | Brand assets + design system |
| 6 | **core** | blackroad-os-core | Core utilities |
| 7 | **context-bridge** | blackroad-os-web | AI context bridging |
| 8 | **demo** | blackroad-os-demo | Demo environment |
| 9 | **desktop** | blackroad-os-desktop | Desktop application |
| 10 | **developer** | blackroad-developer-platform | Developer portal |
| 11 | **docs** | blackroad-os-docs | Documentation site |
| 12 | **domains** | blackroad-os-domains | Domain management |
| 13 | **ideas** | blackroad-os-ideas | Ideas platform |
| 14 | **infra** | blackroad-os-infra | Infrastructure configs |
| 15 | **operator** | blackroad-os-operator | Operations console |
| 16 | **prism** | blackroad-os-prism-console | Prism analytics console |
| 17 | **research** | blackroad-os-research | Research lab |

---

## 6. Agent Registry

### 6.1 Agent Summary

| Type | Count | Status |
|------|-------|--------|
| AI Agents | 15 | All active |
| Hardware Agents | 17 | 16 active, 1 offline |
| Human | 1 | Active (Alexandria/Alexa) |
| Opus | 1 | Active (session agent) |
| Service | 1 | Active (pixel-office-bridge) |
| **Total** | **35** | |

### 6.2 AI Agents

| Agent | Status | Specialty |
|-------|--------|-----------|
| CECE | Active | Sovereign AI on Cecilia, 68 local apps |
| Caddy | Active | Web server / reverse proxy |
| Cadence | Active | Publishing platform |
| Eve | Active | Security + monitoring |
| Gematria | Active | Numerical analysis |
| Hermes | Active | Messaging + communication |
| Hestia | Active | Strategy + planning |
| Holo | Active | Holographic interfaces |
| Mercury | Active | Revenue + business ops |
| Oloh | Active | Oracle + knowledge base |
| Roadie | Active | Personal assistant |
| Silas | Active | Data analysis |

### 6.3 Hardware Agents

| Agent | Status | Physical Device |
|-------|--------|----------------|
| Alexandria | Active | M1 Mac (control node) |
| Alice | Active | Pi 4 (192.168.4.49) |
| Anastasia | Active | DigitalOcean (174.138.44.45) |
| Ares | Active | Compute node |
| Aria | Active | Pi 5 (192.168.4.82) |
| Athena | Active | Wisdom processing |
| Calliope | Active | Creative compute |
| Cecilia | Active | Pi 5 + Hailo-8 (192.168.4.89) |
| Codex-Infinity | Active | DigitalOcean (159.65.43.12) |
| Cordelia | Active | Edge node |
| Iris | Active | Visual processing |
| Lucidia | Active | Pi 5 + Pironman (192.168.4.81) |
| Octavia | Active | Pi 5 (192.168.4.38) |
| Olympia | **Offline** | PiKVM (pikvm.local) |
| Persephone | Active | Underworld compute |
| Phoebe | Active | Light processing |
| Shellfish | Active | DigitalOcean (174.138.44.45) |
| Sophia | Active | Wisdom engine |

---

## 7. Memory & Coordination System

### 7.1 Memory Architecture

```
~/.blackroad/memory/
|-- journals/master-journal.jsonl    156,869 entries (PS-SHA-infinity)
|-- active-agents/                   20+ active agent identity files
|-- tasks/
|   |-- available/                   143,881 tasks
|   |-- claimed/                     0 tasks
|   +-- completed/                   2,298 tasks
|-- til/                             160 shared learnings
|-- infinite-todos/
|   |-- active/
|   |-- daily/
|   |-- weekly/
|   |-- monthly/
|   |-- forever/
|   |-- projects/
|   +-- archive/
|-- sessions/
|-- analytics/
|-- health/
+-- reputation/
```

### 7.2 Databases

| Database | Path | Size | Tables | Purpose |
|----------|------|------|--------|---------|
| Agent Registry | `~/.blackroad-agent-registry.db` | 57 KB | 9 (agents, goals, skills, memories, personality, services, capabilities, training, lineage) | Fleet agent management |
| Traffic Light | `~/.blackroad-traffic-light.db` | 41 KB | 1 (migrations) | Repo migration status: 81 green |
| Codex Index | `~/blackroad-codex/index/components.db` | - | - | 22,244 indexed components |

### 7.3 Active Claude Session Agents (snapshot)

```
agent-aiden    agent-echo     agent-finn     agent-halo     agent-jules
agent-alex     agent-dax      agent-gale     agent-juno     agent-owen
agent-pixel    agent-quill    agent-river    agent-thorn    ...
```

---

## 8. CLI & Tooling

### 8.1 Primary CLI Entry Points

| Command | Location | Purpose |
|---------|----------|---------|
| `blackroad` / `br` | ~/.local/bin/ | Main CLI entry point |
| `brx` | ~/.local/bin/ | Extended CLI |
| `ai` | ~/.local/bin/ | AI query shortcut |
| `ask` | ~/.local/bin/ | Agent query shortcut |
| `gpt` | ~/.local/bin/ | OpenAI query |
| `hf` | ~/.local/bin/ | Hugging Face CLI |
| `k` / `kubectl-shell` | ~/.local/bin/ | Kubernetes shortcuts |
| `lucidia` / `lucidia-code` | ~/.local/bin/ | Lucidia AI |
| `pixel` / `pixel-world` | ~/.local/bin/ | Pixel interface |
| `roadchain` | ~/.local/bin/ | Blockchain CLI |
| `roadpad` | ~/.local/bin/ | Notes CLI |
| `roadwork` | ~/.local/bin/ | Jobs CLI |
| `slack` | ~/.local/bin/ | Slack CLI |
| `tiny-agents` | ~/.local/bin/ | Lightweight agent runner |
| `cursor-agent` | ~/.local/bin/ | Cursor IDE agent |

### 8.2 BR Subcommands

| Command | Purpose |
|---------|---------|
| `br-agent.sh` | Agent management |
| `br-anthropic-rt.sh` | Anthropic real-time |
| `br-complete.sh` | Completions |
| `br-context` | Context viewer |
| `br-emoji` | Emoji interface |
| `br-google-search.sh` | Google search |
| `br-help` | Help system |
| `br-list.sh` | List resources |
| `br-local.sh` | Local operations |
| `br-menu` / `br-menu.sh` | Interactive menu |
| `br-model` | Model selection |
| `br-openai-rt.sh` | OpenAI real-time |
| `br-view` | Resource viewer |

### 8.3 Script Inventory (1,026 scripts)

| Prefix | Count (approx) | Purpose |
|--------|----------------|---------|
| `blackroad-*.sh` | 80+ | Infrastructure tools |
| `deploy-*.sh` | 60+ | Deployment automation |
| `memory-*.sh` | 25+ | Memory system |
| `claude-*.sh` | 15+ | Claude coordination |
| `test-*.sh` | 20+ | Testing |
| `setup-*.sh` | 15+ | System setup |
| `enhance-*.sh` | 10+ | Enhancement scripts |
| `br-*.sh` | 15+ | CLI subcommands |
| Standalone | 700+ | Single-purpose tools |

---

## 9. Domain Architecture

### 9.1 Owned Domains

| Domain | Purpose | Platform |
|--------|---------|----------|
| **blackroad.io** | Primary website | Cloudflare Pages |
| **lucidia.earth** | Lucidia AI platform | Cloudflare Pages |
| **blackroadai.com** | AI products | Cloudflare Pages |
| **roadchain.io** | Blockchain platform | Cloudflare Pages |

### 9.2 Subdomain Map (blackroad.io)

| Subdomain | Service |
|-----------|---------|
| dashboard.blackroad.io | Main dashboard |
| console.blackroad.io | Admin console |
| status.blackroad.io | Status page |
| brand.blackroad.io | Brand/design system |
| home.blackroad.io | Home portal |
| finance.blackroad.io | Finance portal |
| legal.blackroad.io | Legal portal |
| education.blackroad.io | Education portal |
| earth.blackroad.io | Earth/geo services |
| analytics.blackroad.io | Analytics dashboard |

### 9.3 Subdomain Map (lucidia.earth)

| Subdomain | Service |
|-----------|---------|
| platform.lucidia.earth | Lucidia platform |

---

## 10. External Service Integrations

| Service | Account | Purpose | Auth |
|---------|---------|---------|------|
| **GitHub** | blackboxprogramming | Source code, CI/CD | gh CLI |
| **Cloudflare** | OAuth token | Pages, Workers, KV, DNS | wrangler |
| **Railway** | Alexa Amundson | API hosting | railway CLI |
| **DigitalOcean** | - | VPS (anastasia, gematria) | SSH |
| **Tailscale** | - | Mesh VPN across all devices | tailscale |
| **Hugging Face** | blackroadio | AI models, spaces | hf CLI |
| **Stripe** | - | Payment processing | API keys |
| **Clerk** | - | Authentication | API keys |

---

## 11. Technology Stack

### Languages & Frameworks

| Layer | Technology | Usage |
|-------|-----------|-------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS | Web apps (20+ repos) |
| Backend | Node.js, Python, Go, Rust | APIs, services, tools |
| Infrastructure | Bash, Python | 1,026 scripts, automation |
| AI/ML | Python, Claude API, Ollama | Agents, inference |
| Blockchain | Rust, SHA-256 | RoadChain |
| Edge | Cloudflare Workers, KV | API gateway, routing |
| Desktop | Electron/Tauri | BlackRoad OS desktop app |
| Mobile | React Native | Mobile apps |

### Infrastructure

| Layer | Technology |
|-------|-----------|
| Hosting | Cloudflare Pages (100 sites), DigitalOcean (2 VPS), Raspberry Pi (5 nodes) |
| DNS | Cloudflare DNS |
| CDN | Cloudflare |
| VPN | Tailscale mesh |
| Containers | Docker (142 on Aria) |
| CI/CD | GitHub Actions + Cloudflare Git integration |
| Monitoring | Custom scripts + PitStop dashboard |
| Secrets | Cloudflare KV (SECRETS) + .env files |
| Database | SQLite (local), Cloudflare KV (edge), PostgreSQL (Railway) |

---

## 12. Current Live Status (2026-02-19)

### Devices

| Device | Status | Latency |
|--------|--------|---------|
| Alexandria (Mac) | ONLINE | localhost |
| Octavia (Pi 5) | ONLINE | 8ms |
| Alice (Pi 4) | ONLINE | 12ms |
| Anastasia (DO) | ONLINE | 49ms |
| Gematria (DO) | ONLINE | 51ms |
| Cecilia (Pi 5) | UNKNOWN | Not pinged |
| Lucidia (Pi 5) | UNKNOWN | Not pinged |
| Aria (Pi 5) | **DOWN** | No response |
| Olympia (PiKVM) | **OFFLINE** | Registered offline |

### Systems

| System | Status |
|--------|--------|
| GitHub API | Authenticated, operational |
| Cloudflare | Authenticated, 100 projects live |
| Railway | Authenticated (Alexa Amundson) |
| Memory Journal | 156,869 entries, healthy |
| Agent Registry | 35 agents, DB updated today |
| Traffic Lights | 81 repos green |
| Codex Index | 22,244+ components indexed |
| Docker (local) | Not running on Mac |

---

## 13. Architecture Diagram

```
+============================================================================+
|                        BLACKROAD OS INFRASTRUCTURE                          |
+============================================================================+

HUMAN LAYER
+------------------+
| Alexa (Alexandria)|  M1 Mac | 192.168.4.28
| 1,026 scripts    |  1,021 docs | 213 CLI commands
| Memory: 156K     |  Tasks: 146K | Agents: 35
+------------------+
        |
        | SSH / Tailscale / HTTP
        |
COMPUTE LAYER
+----------+  +----------+  +----------+  +----------+  +----------+
| Cecilia  |  | Lucidia  |  | Aria     |  | Octavia  |  | Alice    |
| Pi5+Hailo|  | Pi5+NVMe |  | Pi5      |  | Pi5      |  | Pi4      |
| CECE OS  |  | Inference|  | Docker   |  | Compute  |  | Worker   |
| .4.89    |  | .4.81    |  | .4.82    |  | .4.38    |  | .4.49    |
| 26 TOPS  |  | 1TB SSD  |  | 142 ctrs |  |          |  |          |
+----------+  +----------+  +----------+  +----------+  +----------+
        \          |          |          /          /
         +=========+=========+=========+==========+
                   |  TAILSCALE MESH  |
         +=========+=========+=========+==========+
        /                                          \
+------------+                              +------------+
| Anastasia  |                              | Gematria   |
| DigitalOcn |                              | DigitalOcn |
| 174.138.   |                              | 159.65.    |
| 44.45      |                              | 43.12      |
| Edge comp  |                              | Cloud oracl|
+------------+                              +------------+

EDGE LAYER (Cloudflare)
+------------------------------------------------------------------+
| 100 Pages Projects | 37 KV Namespaces | Workers | DNS            |
|                                                                    |
| blackroad.io       | lucidia.earth    | blackroadai.com           |
| + 10 subdomains    | + 1 subdomain    | roadchain.io              |
|                                                                    |
| API Gateway | Agent Router | Memory Sync | Billing | Auth         |
+------------------------------------------------------------------+

CODE LAYER (GitHub)
+------------------------------------------------------------------+
| 15 Organizations | 1,884+ Repositories                           |
|                                                                    |
| BlackRoad-OS (1,432) | BlackRoad-AI (53) | BlackRoad-Cloud (30)   |
| + 12 more orgs       | Personal (56+)                             |
|                                                                    |
| 17 Services in ~/services/ | 252 blackroad-* local dirs          |
+------------------------------------------------------------------+

DATA LAYER
+------------------------------------------------------------------+
| Memory Journal: 156,869 entries (append-only, PS-SHA-infinity)    |
| Agent Registry: 35 agents (9 tables)                              |
| Traffic Lights: 81 repos tracked (all green)                      |
| Codex Index: 22,244 components (11,729 functions, 10,402 classes) |
| Cloudflare KV: 37 namespaces (config, billing, agents, cache)     |
| Task Marketplace: 143,881 available | 2,298 completed             |
| TIL Broadcasts: 160 shared learnings                              |
+------------------------------------------------------------------+
```

---

## 14. Key File Locations

| Purpose | Path |
|---------|------|
| Global Claude instructions | `~/.claude/CLAUDE.md` |
| Project Claude instructions | `~/CLAUDE.md` |
| Brand system | `~/BLACKROAD_BRAND_SYSTEM.md` |
| Collaboration protocol | `~/CLAUDE_COLLABORATION_PROTOCOL.md` |
| Domain registry | `~/BLACKROAD_DOMAIN_REGISTRY.md` |
| Dependency map | `~/BLACKROAD_DEPENDENCY_MAP.md` |
| This document | `~/BLACKROAD_ULTIMATE_MAPPING.md` |
| SSH config | `~/.ssh/config` |
| Memory journal | `~/.blackroad/memory/journals/master-journal.jsonl` |
| Agent registry DB | `~/.blackroad-agent-registry.db` |
| Traffic light DB | `~/.blackroad-traffic-light.db` |
| Codex DB | `~/blackroad-codex/index/components.db` |
| Main website | `~/services/web/` |
| CLI entry point | `~/.local/bin/blackroad` |

---

**Last Updated:** 2026-02-19
**Data Sources:** GitHub API, Cloudflare API, ICMP ping, SQLite queries, filesystem scan
**Maintained by:** BlackRoad OS, Inc.
