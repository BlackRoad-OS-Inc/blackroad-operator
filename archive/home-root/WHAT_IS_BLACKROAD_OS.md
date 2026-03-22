# BlackRoad OS: A New Path

## Decades of Pain Points We're Fixing

BlackRoad OS exists because the entire technology stack — from infrastructure to AI to software delivery — is broken in ways that cost people time, money, autonomy, and dignity. We're not building another startup. We're building the replacement.

---

## The Problem

Every company, developer, and creator today faces the same trap:

**You don't own anything.** Your code runs on someone else's servers. Your data lives in someone else's database. Your AI runs through someone else's inference endpoint. Your DNS, your TLS, your auth, your billing — all rented. All revocable. All extracting margin from your work.

The modern tech stack is a dependency chain where every link is a toll booth owned by someone who can raise prices, change terms, deprecate your workflow, or shut you down entirely — at any time, for any reason, with no recourse.

**We've lived this.** We've watched:

- Cloud providers **triple prices** overnight with no alternative
- AI platforms **rate-limit** you right when you need them most
- Git hosting platforms **suspend accounts** based on automated flags
- DNS providers **hold domains hostage** during disputes
- Chat platforms **break integrations** every quarter with mandatory migrations
- Auth providers **inject tracking** into your user sessions
- CDN providers **cache-poison** your content during outages
- Certificate authorities **revoke TLS** for political reasons
- Package registries **unpublish** dependencies under your production code

Every one of these has happened. Every one of these is a single point of failure in someone else's hands.

---

## What BlackRoad OS Actually Is

BlackRoad OS is a **complete, sovereign technology stack** — infrastructure, AI, applications, and services — owned and operated on hardware we control.

### The Stack

| Layer | What We Built | What It Replaces |
|-------|--------------|-----------------|
| **Compute** | 5 Raspberry Pi edge nodes + 2 cloud servers | AWS/GCP/Azure |
| **AI** | 52 TOPS local inference (2x Hailo-8 + Ollama) | OpenAI / Anthropic API |
| **Git** | RoadCode (Gitea, 239+ repos, 8 orgs) | GitHub |
| **DNS** | PowerDNS on our hardware | Cloudflare DNS |
| **TLS** | Caddy + Let's Encrypt, auto-renewing | Cloudflare proxy |
| **Object Storage** | MinIO (S3-compatible) | AWS S3 / Cloudflare R2 |
| **Database** | PostgreSQL on 3 nodes | Cloud SQL / D1 |
| **Cache** | Redis on our hardware | Cloudflare KV / ElastiCache |
| **VPN** | WireGuard mesh (full connectivity) | Tailscale / corporate VPN |
| **Workers** | 15 self-hosted workers (workerd) | Cloudflare Workers |
| **PaaS** | Deploy API on Octavia | Railway / Heroku / Vercel |
| **Chat** | RoundTrip (sovereign, D1-backed) | Slack |
| **CI/CD** | Gitea Actions + act_runner | GitHub Actions |
| **Auth** | JWT + PBKDF2, self-hosted | Auth0 / Clerk |
| **Billing** | RoadPay (Stripe as card charger only) | Stripe Billing |
| **Search** | RoadSearch (FTS5 + AI answers) | Algolia / Elasticsearch |
| **Monitoring** | Fleet health + KPI collectors | Datadog / New Relic |

### The Mesh

Every BlackRoad node connects to every other node through an encrypted WireGuard mesh. The network has no center. If any node goes down, the others continue. If the internet goes down, the local mesh continues. This isn't theoretical — it's running right now across 7 physical locations.

### The AI

52 trillion operations per second of local AI inference. 16 models running on our own hardware. No API keys. No rate limits. No per-token billing. No data leaving our network. We use AI constantly — for code, for search, for agents, for reasoning — but we never send a single prompt to a server we don't control unless we choose to.

---

## The Organizations

BlackRoad OS operates through a hierarchy of specialized organizations, each responsible for a domain:

| Organization | Domain | Role |
|-------------|--------|------|
| **BlackRoad-OS-Inc** | Corporate | The root. Delaware C-Corp. All IP flows from here. |
| **BlackRoad-OS** | Platform | Core platform, all sites, integrations, and coordination |
| **BlackRoad-AI** | Artificial Intelligence | Models, inference, training, AI agents |
| **BlackRoad-Cloud** | Infrastructure | Kubernetes, Terraform, service mesh, container orchestration |
| **BlackRoad-Security** | Security | Audits, pen testing, encryption, identity, threat intel |
| **BlackRoad-Labs** | Research | Experiments, ML pipelines, feature stores, A/B testing |
| **BlackRoad-Studio** | Creative | Canvas, video, writing, templates |
| **BlackRoad-Interactive** | Gaming & 3D | Game engine, physics, shaders, animation |
| **BlackRoad-Media** | Content | Streaming, podcasts, newsletters, social |
| **BlackRoad-Education** | Learning | Courses, quizzes, code challenges, tutoring |
| **BlackRoad-Hardware** | IoT & Devices | Sensors, firmware, fleet tracking, automation |
| **BlackRoad-Gov** | Governance | Compliance, audit tools, policy, digital identity |
| **BlackRoad-Foundation** | Community | CRM, events, grants, HR, project management |
| **BlackRoad-Ventures** | Investment | Portfolio, deal flow, partnerships, LP portal |
| **BlackRoad-Archive** | Preservation | IPFS, backups, document archive, web archiver |
| **Blackbox-Enterprises** | Automation | Workflow engines, integration platforms, task orchestration |

Every organization contains a `source-code` repository (private, canonical source), a `RoadCode` workspace, an `operator` for automation, and a `source` tree for structure.

---

## The Road Fleet

We fork critical open-source infrastructure, maintain it ourselves, and integrate it into the BlackRoad mesh. Every fork gets a road name and runs on our hardware:

| Road Name | Upstream | Purpose |
|-----------|----------|---------|
| **RoadCode** | Gitea | Git hosting (239+ repos) |
| **TollBooth** | WireGuard | Encrypted mesh VPN |
| **PitStop** | Pi-hole | DNS filtering & ad blocking |
| **Passenger** | Ollama | Local AI inference (16 models) |
| **OneWay** | Caddy | TLS edge & reverse proxy |
| **RearView** | Qdrant | Vector database for RAG |
| **Curb** | MinIO | S3-compatible object storage |
| **RoundAbout** | Headscale | Mesh coordination |
| **CarPool** | NATS | Pub/sub messaging between agents |
| **OverPass** | n8n | Workflow automation |
| **BackRoad** | Portainer | Container management |
| **GuardRail** | (custom) | AI safety & content guardrails |

These forks are proprietary. We contribute upstream when appropriate, but the BlackRoad integrations, configurations, and customizations are ours.

---

## The Domains

20 custom domains across the BlackRoad ecosystem:

- **blackroad.io** — Main platform
- **blackroadai.com** — AI products
- **blackroad.network** — Mesh network
- **blackroad.systems** — Infrastructure
- **blackroad.company** / **blackroadinc.us** — Corporate
- **blackroad.me** — Personal agent
- **lucidia.earth** / **lucidia.studio** / **lucidiaqi.com** — AI reasoning
- **blackroadquantum.com/.net/.info/.shop/.store** — Quantum research
- **blackboxprogramming.io** — Development
- **roadchain.io** / **roadcoin.io** — Chain & token

---

## What We Believe

**Sovereignty is not paranoia.** It's engineering discipline. Every external dependency is a liability. Every API call is a trust decision. Every cloud service is a lease, not ownership. We choose to own our stack not because we distrust others, but because we respect our users enough to guarantee we'll never be forced to betray them by a vendor's business decision.

**AI should be local-first.** Your prompts are your thoughts. Your data is your business. Running AI on your own hardware isn't a luxury — it's a right. We run 52 TOPS of inference locally because that's the only way to guarantee privacy, availability, and cost predictability.

**Public code is not open source.** Our source code is publicly visible for transparency, security review, and education. But it is proprietary software owned by BlackRoad OS, Inc. We believe in showing our work without giving it away. You can read it, learn from it, verify our claims — but you cannot fork it, resell it, or build commercial products from it.

**Infrastructure is the product.** Most companies treat infrastructure as cost. We treat it as competitive advantage. Our stack is our product. The fact that we can run AI, serve websites, host git, manage DNS, handle billing, coordinate agents, and serve 20 domains from a fleet of Raspberry Pis isn't a demo — it's proof that the cloud tax is optional.

---

## The Numbers (Real, Verified)

- **35 AI agents** running across the fleet
- **275+ repositories** across 16 organizations
- **20 custom domains** serving production traffic
- **52 TOPS** of local AI inference
- **16 models** running on Ollama
- **7 physical nodes** in the mesh
- **151 DNS records** managed by PowerDNS
- **239 repos** on self-hosted Gitea
- **1 operator** — Alexa Louise Amundson, Founder & CEO

---

## License

All BlackRoad OS software is proprietary to BlackRoad OS, Inc., a Delaware C-Corporation founded November 17, 2025. Source code is publicly visible for transparency. Commercial use, forking, redistribution, and derivative works are prohibited without written authorization.

See [LICENSE](LICENSE) for the full terms.

---

**BlackRoad OS — Pave Tomorrow.**

*Copyright 2024-2026 BlackRoad OS, Inc. All Rights Reserved.*
