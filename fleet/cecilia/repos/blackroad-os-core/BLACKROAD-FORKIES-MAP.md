# BlackRoad Forkies Map
## Canonical Reference for Sovereign Computing Infrastructure

**Created**: 2025-12-13
**Purpose**: Map all legally forkable (MIT/Apache 2.0/BSD) alternatives to BlackRoad's architecture
**Philosophy**: Sovereign Computing - Hardware ownership, data locality, comprehensibility

---

## Table of Contents
1. [Network Infrastructure](#network-infrastructure)
2. [Identity & Authentication](#identity--authentication)
3. [AI/LLM Stack](#aillm-stack)
4. [Data Layer](#data-layer)
5. [CRM & PM](#crm--pm)
6. [Communications](#communications)
7. [Cloud Infrastructure](#cloud-infrastructure)
8. [Web & Frontend](#web--frontend)
9. [**Game Engines**](#game-engines) **← NEW**
10. [Hardware](#hardware)
11. [GitHub Organizations Map](#github-organizations-map)
12. [Domain Names](#domain-names)
13. [IP Address Planes](#ip-address-planes)
14. [External Integrations](#external-integrations)
15. [Implementation Status](#implementation-status)

---

## Network Infrastructure

### Mesh VPN (MUST-FORK Priority)

**Current**: Tailscale (proprietary)
**Forkable Alternatives**:

| Name | License | Language | Features | BlackRoad Status |
|------|---------|----------|----------|------------------|
| **Headscale** | MIT | Go | Drop-in Tailscale control server | **RECOMMENDED** |
| NetBird | BSD-3-Clause | Go | WireGuard-based, OIDC/SSO | Alternative |
| Nebula | Apache 2.0 | Go | Slack's mesh, zero-config | Alternative |
| Innernet | MIT | Rust | CLI-based, simple | Edge use |
| Netmaker | SSPL (AGPL fork available) | Go | Full-featured | Evaluate |

**BlackRoad Implementation**:
- Deploy Headscale on DigitalOcean droplet (159.65.43.12)
- Configure mesh network: `100.x.x.x` plane
- Integrate with Raspberry Pi cluster
- GitHub Org: `BlackRoad-Networking`

### Zero Trust Network

| Component | Forkie | License | Status |
|-----------|--------|---------|--------|
| Policy Engine | Open Policy Agent (OPA) | Apache 2.0 | Planned |
| Service Mesh | Istio | Apache 2.0 | Future |
| Identity Proxy | Authelia | Apache 2.0 | Planned |

---

## Identity & Authentication

**Current**: Custom JWT (FastAPI)
**Target Stack**:

| Name | License | Features | BlackRoad Use |
|------|---------|----------|---------------|
| **Keycloak** | Apache 2.0 | OAuth2, OIDC, SAML, MFA | **Primary SSO** |
| Authelia | Apache 2.0 | Lightweight policy auth | Edge devices |
| Ory Hydra | Apache 2.0 | OAuth2/OIDC server | Alternative |
| Authentik | MIT | Modern Python-based | Backup option |

**Self-Sovereign Identity (SSI)**:
- Verifiable Credentials (W3C standard)
- DID (Decentralized Identifiers)
- Integration with RoadChain

**GitHub Org**: `BlackRoad-Identity`

---

## AI/LLM Stack

### Inference Engines

| Name | License | Language | Features | BlackRoad Status |
|------|---------|----------|----------|------------------|
| **vLLM** | Apache 2.0 | Python | GPU inference, 10K+ agents | **PRIMARY** |
| Ollama | MIT | Go | Local models, easy setup | **DEVELOPMENT** |
| llama.cpp | MIT | C++ | Edge inference, quantization | **EDGE** |
| TGI (Text Gen Inference) | Apache 2.0 | Python/Rust | HuggingFace official | Alternative |

### Models (Forkable)

| Model Family | License | Size Range | Use Case |
|--------------|---------|------------|----------|
| **LLaMA-derived** | Research/Apache 2.0 | 7B-70B | General purpose |
| Mistral/Mixtral | Apache 2.0 | 7B-8x7B | High performance |
| Qwen | Apache 2.0 | 0.5B-72B | Multilingual |
| DeepSeek | MIT | 7B-67B | Coding |

### Orchestration

| Name | License | Features | Status |
|------|---------|----------|--------|
| **LangChain** | MIT | Agent orchestration | **IN USE** |
| LlamaIndex | MIT | RAG framework | Planned |
| AutoGen | Apache 2.0 | Multi-agent | Evaluate |

**Current Implementation**:
- Backend: FastAPI + custom agent spawner
- LLM Router: Supports vLLM, Ollama, llama.cpp
- 30,000 agent capacity
- Breath-synchronized spawning

**GitHub Orgs**:
- `BlackRoad-AI` (main)
- `BlackRoad-LLM` (models)
- `BlackRoad-Agents` (agent system)

---

## Data Layer

### Databases

| Type | Name | License | BlackRoad Use |
|------|------|---------|---------------|
| RDBMS | **PostgreSQL** | PostgreSQL License | **PRIMARY** |
| Analytics | ClickHouse | Apache 2.0 | Event stream |
| Document | MongoDB (fork: FerretDB) | SSPL → Apache 2.0 | Alternative |
| Time-series | TimescaleDB | Apache 2.0 | Metrics |

### Object Storage

| Name | License | S3 Compatible | Status |
|------|---------|---------------|--------|
| **MinIO** | AGPLv3 | Yes | **PRIMARY** |
| SeaweedFS | Apache 2.0 | Yes | Alternative |

### Vector Databases

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Qdrant** | Apache 2.0 | Rust, fast | **RECOMMENDED** |
| Weaviate | BSD-3-Clause | Go, GraphQL | Alternative |
| Milvus | Apache 2.0 | Large-scale | Enterprise |

### Caching

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Redis** | BSD-3-Clause | In-memory KV | **IN USE** |
| Valkey | BSD-3-Clause | Redis fork | Future |
| KeyDB | BSD-3-Clause | Multi-threaded Redis | Alternative |

**GitHub Org**: `BlackRoad-Data`

---

## CRM & PM

### Customer Relationship Management

| Name | License | Language | Features | Status |
|------|---------|----------|----------|--------|
| **SuiteCRM** | AGPLv3 | PHP | Full CRM suite | Evaluate |
| EspoCRM | GPLv3 | PHP | Modern, REST API | Alternative |
| Monica | AGPLv3 | PHP | Personal CRM | Personal use |

### Project Management

| Name | License | Language | Features | Status |
|------|---------|----------|----------|--------|
| **Plane** | AGPLv3 | Python/React | Jira alternative | **RECOMMENDED** |
| Taiga | MPL 2.0 | Python/Angular | Agile PM | Alternative |
| Leantime | GPLv2 | PHP | Lean/Agile | Lightweight |

### Issue Tracking

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Linear** (self-hosted?) | Proprietary | Modern UI | Wishlist |
| Plane Issues | AGPLv3 | Linear-like | **ALTERNATIVE** |

**Current**: Using Linear (proprietary) + blackroad.systems@gmail.com
**Target**: Self-hosted Plane deployment

**GitHub Org**: `BlackRoad-PM`

---

## Communications

### Email

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Stalwart Mail** | AGPLv3 | All-in-one (SMTP/IMAP/Sieve) | **RECOMMENDED** |
| Maddy | GPLv3 | Rust, simple | Alternative |
| Mail-in-a-Box | CC0 | Complete stack | Full solution |

### Team Chat

| Name | License | Language | Features | Status |
|------|---------|----------|----------|--------|
| **Mattermost** | MIT/AGPLv3 | Go | Slack alternative | **RECOMMENDED** |
| Rocket.Chat | MIT | Node.js | Full-featured | Alternative |
| Zulip | Apache 2.0 | Python | Threading model | Academic |

### Video Conferencing

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Jitsi** | Apache 2.0 | WebRTC, browser-based | **RECOMMENDED** |
| BigBlueButton | LGPLv3 | Education-focused | Alternative |

**Current**: Using Gmail (proprietary)
**Target**: Stalwart Mail + Mattermost

**GitHub Org**: `BlackRoad-Communications`

---

## Cloud Infrastructure

### Container Orchestration

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Kubernetes** | Apache 2.0 | Industry standard | Future |
| K3s | Apache 2.0 | Lightweight K8s | **RASPBERRY PI** |
| Docker Swarm | Apache 2.0 | Simple orchestration | Current |

### CI/CD

| Name | License | Features | Status |
|------|---------|----------|--------|
| **Woodpecker CI** | Apache 2.0 | Drone fork, YAML | **RECOMMENDED** |
| Gitea Actions | MIT | GitHub Actions clone | Alternative |
| Concourse CI | Apache 2.0 | Pipeline-focused | Enterprise |

### Infrastructure as Code

| Name | License | Language | Status |
|------|---------|----------|--------|
| **Pulumi** | Apache 2.0 | TypeScript/Python | **IN USE** |
| Terraform (OpenTofu) | MPL 2.0 → Apache 2.0 | HCL | Alternative |
| Ansible | GPLv3 | YAML | Config mgmt |

**Current Stack**:
- Railway (proprietary) - migrate off
- GitHub Pages - keep
- Cloudflare - evaluate alternatives

**GitHub Org**: `BlackRoad-Cloud`

---

## Web & Frontend

### Frameworks

| Name | License | Language | Features | Status |
|------|---------|----------|----------|--------|
| **SvelteKit** | MIT | Svelte/TS | Fast, modern | **RECOMMENDED** |
| Next.js | MIT | React/TS | Industry standard | Alternative |
| Fresh | MIT | Deno/Preact | Edge-first | Experimental |

### UI Components

| Name | License | Framework | Status |
|------|---------|-----------|--------|
| **shadcn/ui** | MIT | React | **IN USE** |
| DaisyUI | MIT | Tailwind | Alternative |
| Melt UI | MIT | Svelte | Svelte option |

### Backend

| Name | License | Language | Status |
|------|---------|----------|--------|
| **FastAPI** | MIT | Python | **PRIMARY** |
| Axum | MIT | Rust | Future |
| Rocket | MIT/Apache 2.0 | Rust | Alternative |

**Current Implementation**:
- Frontend: Vanilla HTML/CSS/JS (lightweight)
- Backend: FastAPI (Python)
- Deployment: GitHub Pages + Cloudflare

**GitHub Org**: `BlackRoad-Web`

---

## Game Engines

### Unity/Unreal Alternative (MUST-FORK Priority)

**Current**: Unity (proprietary, runtime fees), Unreal (5% revenue share)
**Forkable Alternatives**:

| Name | License | Language | Features | BlackRoad Status |
|------|---------|----------|----------|------------------|
| **Godot Engine** | MIT | C++/GDScript | Full editor, 2D/3D, exports everywhere | **PRIMARY FORK** ✅ |
| **Open 3D Engine (O3DE)** | Apache 2.0 | C++ | AAA graphics, large worlds, simulation | **SECONDARY FORK** ✅ |
| Stride | MIT | C# | Unity-like, editor included | Alternative |
| Wicked Engine | MIT | C++ | Modern renderer only | Component use |
| Fyrox | MIT | Rust | Engine + editor | Alternative |
| Bevy | MIT/Apache 2.0 | Rust | ECS framework | **VOXEL BASE** ✅ |

### BlackRoad Engine Architecture

**Unified Proprietary Engine (based on MIT/Apache forks):**

```
BlackRoad Engine (Proprietary)
├─ Godot Fork (MIT) → Base engine, editor, scripting
├─ O3DE Fork (Apache 2.0) → AAA rendering option
├─ Custom Voxel Engine (Proprietary) → Minecraft-like worlds
└─ Custom Simulation Framework (Proprietary) → City builder, life sims
```

**Capabilities:**
- ✅ **Realistic Open Worlds** (Zelda, Skyrim, Fortnite) → Godot + O3DE
- ✅ **Voxel Sandboxes** (Minecraft) → Custom Rust + Bevy engine
- ✅ **City Builders** (Cities: Skylines) → Custom simulation framework
- ✅ **Life Sims** (Stardew Valley) → Godot + custom systems
- ✅ **Massive Multiplayer** (MMO-scale) → All modes support networking

**Why NOT Minetest/Luanti:**
- ⚠️ LGPL 2.1+ requires sharing engine modifications
- ✅ Instead: Build custom voxel engine from scratch (100% proprietary)

**License Strategy:**
- Godot fork: Keep MIT notices, ship proprietary binary ✓
- O3DE fork: Keep Apache 2.0 notices, ship proprietary ✓
- Custom code: 100% BlackRoad proprietary ✓
- Combined product: BlackRoad Proprietary Software License ✓

**Cost Analysis:**
- **One-time:** $110K-300K (development) OR $0 (DIY)
- **Monthly:** $35-100 (infrastructure)
- **vs. Unity Pro:** $2,040/year per seat
- **vs. Unreal:** 5% gross revenue (millions)
- **BlackRoad Engine:** $0 revenue share, $0 license fees

**Implementation:**
- Fork Godot → `BlackRoad-Engine/blackroad-godot`
- Fork O3DE → `BlackRoad-Engine/blackroad-o3de`
- Build voxel → `BlackRoad-Engine/blackroad-voxel` (Rust)
- Build sim → `BlackRoad-Engine/blackroad-sim` (Python)

**Timeline:** 30 days to public beta (see BLACKROAD_ENGINE_30DAY_ROADMAP.md)

**GitHub Org**: `BlackRoad-Engine`
**Docs**: See BLACKROAD_ENGINE_FORK_MANIFEST.md, BLACKROAD_ENGINE_LICENSE_COMPLIANCE.md, BLACKROAD_ENGINE_QUICK_START.md

---

## Hardware

### Single-Board Computers

| Device | Cost | Use Case | Status |
|--------|------|----------|--------|
| **Raspberry Pi 5 8GB** | $80 × 3 = $240 | Headscale, K3s, general compute | **OWNED** |
| Raspberry Pi 400 | $70 | Desktop/dev machine | **OWNED** |
| Raspberry Pi Zero 2 W | $15 | Edge sensors | **OWNED** |
| Jetson Orin Nano | $499 | GPU inference (8GB) | **PLANNED** |

**Total Hardware Cost**: ~$925 one-time

### Network

| Component | Status |
|-----------|--------|
| LAN (192.168.4.x) | Active |
| Mesh (100.x.x.x via Tailscale) | Active → migrate to Headscale |
| Docker (172.x.x.x) | Active |
| Public IPv4 (159.65.43.12) | Active (DigitalOcean) |
| IPv6 | Planned |

**GitHub Org**: `BlackRoad-Hardware`

---

## GitHub Organizations Map

### Current Structure (15 Orgs)

| Organization | Purpose | Forkie Alignment |
|--------------|---------|------------------|
| **BlackRoad-OS** | Core OS, main repo | All categories |
| **BlackRoad-AI** | AI/LLM agents | vLLM, Ollama, LangChain |
| **BlackRoad-Cloud** | Cloud infra | K3s, Pulumi, Woodpecker |
| **BlackRoad-Data** | Data services | PostgreSQL, MinIO, Qdrant |
| **BlackRoad-Networking** | Network layer | Headscale, OPA |
| **BlackRoad-Identity** | Auth & SSO | Keycloak, Authelia |
| **BlackRoad-Web** | Frontend apps | SvelteKit, FastAPI |
| **BlackRoad-API** | API layer | FastAPI, gRPC |
| **BlackRoad-Communications** | Messaging | Mattermost, Stalwart |
| **BlackRoad-PM** | Project mgmt | Plane |
| **BlackRoad-Hardware** | Embedded systems | Raspberry Pi, Jetson |
| **BlackRoad-Blockchain** | RoadChain | Custom blockchain |
| **BlackRoad-LLM** | Model hosting | LLaMA, Mistral, Qwen |
| **BlackRoad-Agents** | Agent runtime | Custom spawner |
| **BlackRoad-Research** | Research & docs | Papers, experiments |

### Repository Count by Org

**BlackRoad-OS** (40+ repos):
- blackroad-os-core ✓
- blackroad-os-api ✓
- blackroad-os-web ✓
- blackroad-os-operator ✓
- blackroad-os-infra ✓
- blackroad-os-docs ✓
- blackroad-os-home ✓
- blackroad-os-brand ✓
- blackroad-os-archive ✓
- blackroad-os-research ✓
- blackroad-os-prism-console ✓
- blackroad-os-api-gateway ✓
- And 28+ more...

---

## Domain Names

### Primary Domains (19 total)

| Domain | Purpose | Deployment |
|--------|---------|------------|
| **blackroad.io** | Main app | GitHub Pages + Cloudflare |
| **blackroad.systems** | Backend API | Railway → self-host |
| **roadchain.io** | Blockchain explorer | GitHub Pages |
| **lucidia.earth** | Breath engine docs | GitHub Pages |
| **cececollective.com** | Agent collective | Future |
| **forkeverything.club** | Forkies directory | **NEW** |
| **codex-infinity.com** | Research archive | DigitalOcean |
| app.blackroad.io | Web app | Cloudflare Pages |
| status.blackroad.io | Status page | Cloudflare Pages |
| docs.blackroad.io | Documentation | Cloudflare Pages |
| cece.blackroad.io | Cece agent UI | Cloudflare Pages |
| gateway.blackroad.io | API gateway | Cloudflare Workers |
| core.blackroad.systems | Core API | Railway |
| operator.blackroad.systems | Operator service | Railway |

---

## IP Address Planes

### Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│ PUBLIC IPv4                                                 │
│ 159.65.43.12 (DigitalOcean - codex-infinity)              │
│ → Headscale control server                                 │
│ → Public gateway                                           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌────────▼────────┐
│ MESH (Tailscale)│  │ LAN          │  │ DOCKER          │
│ 100.x.x.x       │  │ 192.168.4.x  │  │ 172.x.x.x       │
│                 │  │              │  │                 │
│ Raspberry Pi 1  │  │ Router       │  │ Containers:     │
│ Raspberry Pi 2  │  │ 192.168.4.1  │  │ - FastAPI       │
│ Raspberry Pi 3  │  │              │  │ - PostgreSQL    │
│ Pi 400          │  │ Devices:     │  │ - Redis         │
│ iPhone Koder    │  │ .27, .49,    │  │ - MinIO         │
│ MacBook         │  │ .64, .68     │  │ - Headscale     │
└─────────────────┘  └──────────────┘  └─────────────────┘
```

### Device Inventory

| Device | LAN IP | Mesh IP | Purpose | Status |
|--------|--------|---------|---------|--------|
| Router | 192.168.4.1 | - | Gateway | Active |
| MacBook | 192.168.4.27 | 100.x.x.1 | Development | Active |
| Raspberry Pi 5 #1 | 192.168.4.49 | 100.x.x.2 | Headscale server | **alice/lucidia** |
| iPhone Koder | 192.168.4.68:8080 | 100.x.x.3 | Mobile dev | **br-8080-cadillac** |
| Raspberry Pi 5 #2 | TBD | 100.x.x.4 | K3s worker | Planned |
| Raspberry Pi 5 #3 | TBD | 100.x.x.5 | K3s worker | Planned |
| DigitalOcean Droplet | 159.65.43.12 | - | Public gateway | Active |

**Canonical Document**: `NETWORK_MAP.md` (to be created in `blackroad-os-operator`)

---

## External Integrations

### AI Provider APIs

| Provider | API | Status | Forkie Alternative |
|----------|-----|--------|-------------------|
| Anthropic | Claude API | **ACTIVE** | Self-hosted LLaMA |
| XAI | Grok API | Planned | Self-hosted Qwen |
| Google | Gemini API | Planned | Self-hosted Mistral |
| OpenAI | GPT API | **ACTIVE** | Self-hosted DeepSeek |
| HuggingFace | Inference API | **ACTIVE** | Self-hosted TGI |

**Philosophy**: Use proprietary APIs during development, maintain forkable alternatives for sovereignty.

### Service APIs

| Service | Purpose | Status | Forkie |
|---------|---------|--------|--------|
| Stripe | Payments | **ACTIVE** | BTCPay Server (MIT) |
| GitHub | Git hosting | **ACTIVE** | Gitea (MIT) |
| Discord | Community | Planned | Mattermost (MIT) |
| Linear | PM | **ACTIVE** | Plane (AGPLv3) |

---

## Implementation Status

### ✅ COMPLETED

**Backend**:
- [x] FastAPI backend with JWT auth
- [x] Agent spawner (30K capacity)
- [x] Communication bus
- [x] Pack system (5 packs)
- [x] LLM router (vLLM, Ollama, llama.cpp)
- [x] Breath synchronization (Lucidia)
- [x] PostgreSQL integration
- [x] Redis caching

**Frontend**:
- [x] Main app (index.html)
- [x] AI Chat (chat.html)
- [x] Agents Dashboard (agents-dynamic.html)
- [x] Blockchain (blockchain-dynamic.html)
- [x] Terminal (terminal.html)
- [x] Integrations (integrations-live.html)
- [x] Payment flow (pay.html)
- [x] Unified navigation (blackroad-nav.js)
- [x] Unified API client (blackroad-api.js)

**Deployment**:
- [x] GitHub Pages (blackroad.io)
- [x] Cloudflare DNS
- [x] Local development environment

### 🚧 IN PROGRESS

**Infrastructure**:
- [ ] Headscale deployment (Raspberry Pi)
- [ ] K3s cluster (3x Pi 5)
- [ ] MinIO object storage
- [ ] Qdrant vector DB

**Services**:
- [ ] Keycloak SSO
- [ ] Mattermost chat
- [ ] Plane project management

### 📋 PLANNED

**Phase 1: Network Sovereignty** (Q1 2025)
- [ ] Deploy Headscale on 159.65.43.12
- [ ] Migrate all devices from Tailscale to Headscale
- [ ] Document complete network topology
- [ ] Set up OPA for zero-trust policies

**Phase 2: Data Sovereignty** (Q2 2025)
- [ ] Deploy MinIO cluster (3x Pi 5)
- [ ] Set up PostgreSQL replication
- [ ] Implement Qdrant for vector search
- [ ] Backup system with encryption

**Phase 3: Identity Sovereignty** (Q2 2025)
- [ ] Deploy Keycloak
- [ ] Implement SSO across all apps
- [ ] Self-sovereign identity (SSI) integration
- [ ] Hardware wallet integration (Ledger)

**Phase 4: Communication Sovereignty** (Q3 2025)
- [ ] Deploy Stalwart Mail
- [ ] Migrate from Gmail to self-hosted
- [ ] Deploy Mattermost
- [ ] Integrate with agent system

**Phase 5: AI Sovereignty** (Q3-Q4 2025)
- [ ] Deploy Jetson Orin Nano for GPU inference
- [ ] Migrate from cloud APIs to local vLLM
- [ ] Fine-tune models for BlackRoad use cases
- [ ] Implement model versioning and A/B testing

**Phase 6: Full Sovereignty** (Q4 2025)
- [ ] Migrate off Railway → K3s
- [ ] Deploy Gitea (GitHub alternative)
- [ ] BTCPay Server for payments
- [ ] Complete fork independence

---

## Cost Analysis

### One-Time Hardware
- Raspberry Pi 5 (3x): $240
- Raspberry Pi 400: $70
- Jetson Orin Nano: $499
- Storage (SSDs): $100
- **Total**: ~$925

### Recurring Cloud (Current)
- Railway: ~$20/month
- DigitalOcean: $6/month
- Cloudflare: Free
- Domain names: ~$150/year
- **Total**: ~$462/year

### Recurring Cloud (Target - Self-Hosted)
- DigitalOcean (Headscale only): $6/month
- Domain names: ~$150/year
- Electricity (Pi cluster): ~$10/month
- **Total**: ~$270/year

**Savings**: $192/year + full sovereignty

---

## MUST-FORK Stack Summary

### Tier 1: Immediate (0-3 months)
1. **Headscale** (Mesh VPN) - Replace Tailscale
2. **Keycloak** (Identity) - Unified SSO
3. **MinIO** (Object Storage) - S3 alternative
4. **Woodpecker CI** (CI/CD) - GitHub Actions alternative

### Tier 2: Short-term (3-6 months)
5. **Mattermost** (Chat) - Slack alternative
6. **Plane** (PM) - Linear alternative
7. **Stalwart Mail** (Email) - Gmail replacement
8. **Gitea** (Git) - GitHub mirror

### Tier 3: Medium-term (6-12 months)
9. **K3s** (Orchestration) - Replace Railway
10. **Qdrant** (Vector DB) - AI embeddings
11. **BTCPay Server** (Payments) - Stripe alternative
12. **Jitsi** (Video) - Zoom alternative

---

## Next Steps

1. **Create Network Map** (`NETWORK_MAP.md` in `blackroad-os-operator`)
2. **Deploy Headscale** on Raspberry Pi (192.168.4.49)
3. **Document IP Allocation** for all planes (LAN, Mesh, Docker)
4. **Set Up K3s Cluster** on 3x Raspberry Pi 5
5. **Migrate Railway → Self-hosted** K3s deployment
6. **Deploy MinIO** for object storage
7. **Implement Keycloak** for SSO

---

## Philosophy

> **Sovereign Computing**: Infrastructure you can fork, hardware you can hold, data you can see.

Three pillars:
1. **Hardware Ownership**: Physical devices, not rented compute
2. **Data Locality**: Know where every byte lives
3. **Comprehensibility**: Understand the full stack

**BlackRoad's Mission**: Build a forkable operating system that any individual can clone, deploy, and run independently. No vendor lock-in. No kill switches. No rent-seeking.

---

*This document is the canonical reference for BlackRoad's Forkies strategy. Update it as implementations progress.*

**Maintained by**: Alexa Amundson
**Review Queue**: blackroad.systems@gmail.com
**Source of Truth**: GitHub (BlackRoad-OS/blackroad-os-core)
