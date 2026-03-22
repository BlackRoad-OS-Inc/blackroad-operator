# Sovereign Infrastructure

**How one person built a distributed AI operating system on $500 of hardware**

**Author:** Alexa Louise Amundson
**Affiliation:** BlackRoad OS, Inc., Delaware C-Corp, founded 2025
**Date:** March 14, 2026
**Location:** Minnesota

---

## 1. Who We Are

One person. Alexa Louise Amundson. Started in sales, moved to finance, got every license, moved to real estate, got that license too. Watched how systems extract value from people. Decided to build one that gives it back.

No CS degree. No VC money. No team of 50. Just a Mac, five Raspberry Pis, a Cloudflare account, and the refusal to ask permission.

BlackRoad OS, Inc. was incorporated in Delaware in 2025. One founder. One shareholder. One director. Filed through Stripe Atlas. EIN on file. 83(b) election filed. The corporate formation documents sit in a Google Drive folder under `01 - Company & Legal`.

## 2. The Hardware

Total hardware cost: approximately $500.

| Node    | Device           | CPU      | RAM | Role                            | IP            |
| ------- | ---------------- | -------- | --- | ------------------------------- | ------------- |
| Alice   | Raspberry Pi 400 | Quad A72 | 4GB | Gateway, DNS, Qdrant            | 192.168.4.49  |
| Cecilia | Raspberry Pi 5   | Quad A76 | 8GB | AI inference, embeddings, MinIO | 192.168.4.96  |
| Octavia | Raspberry Pi 5   | Quad A76 | 8GB | Gitea, NATS, Docker Swarm       | 192.168.4.101 |
| Aria    | Raspberry Pi 5   | Quad A76 | 8GB | Portainer, Headscale            | 192.168.4.98  |
| Lucidia | Raspberry Pi 5   | Quad A76 | 8GB | Web apps, GitHub Actions        | 192.168.4.38  |

Two Hailo-8 AI accelerators. 26 TOPS each. 52 TOPS total. One on Cecilia, one on Octavia.

Two DigitalOcean droplets. Gematria in NYC3. Anastasia in NYC1. Both under $20/month.

An eero mesh router. Five ethernet cables. A TP-Link gigabit switch.

That's the entire data center. It sits on a desk in Minnesota.

## 3. What Actually Works (Verified March 14, 2026)

Everything below was tested live during a single session. Not "works in theory." Works right now.

### Fleet Communication

- **NATS v2.12.3** on Octavia (Docker Swarm). JetStream enabled.
- **4 out of 5 nodes connected** via `blackroad-nats-agent.py` systemd service.
- Heartbeats every 30 seconds. Ping/status commands return in under 4 seconds.
- Tested: sent `ping` from Mac → 4 Pis responded with CPU temp, RAM %, and Ollama model count.

```
Pong: octavia (39.7°C)
Pong: lucidia (56.2°C)
Pong: alice (34.6°C)
Pong: cecilia (57.3°C)
```

Aria failed to connect because pip is locked under the `blackroad` user (no sudo). Four out of five is operational.

### AI Inference

- **Ollama** on Cecilia: 15 models loaded. llama3.2:3b, qwen3:8b, deepseek-coder:1.3b, codellama:7b, cece:latest, nomic-embed-text, and 9 more.
- **Response test**: asked "What is 2+2?" via Cecilia's Ollama API. Got "Four." in under 2 seconds.
- **Embedding test**: nomic-embed-text produces 768-dimensional vectors. Verified at 1.74 seconds per embedding from Mac to Cecilia.

### Vector Search (RAG)

- **Qdrant** on Alice (port 6333). Collection `blackroad-code`.
- **27,973 vectors indexed** out of 32,297 code chunks (86.6%) at time of verification. Indexer running continuously in background.
- **Semantic search works**: query "authentication gateway" returns relevant files from blackroad-operating-system/agents/categories/engineering/ and blackroad-os-prism-enterprise/api/auth.py with scores above 0.6.

### Git Hosting

- **Gitea** on Octavia (port 3100, Docker). 207 repositories across 7 organizations.
- **GitHub is the mirror**. Gitea is primary. `downstream-sync.sh` pushes changes from the operator repo to 17 GitHub organizations. 47 repos synced in one run.

### Self-Hosted Services

- **PowerDNS** on Lucidia (Docker). Authoritative DNS with admin panel on port 9192.
- **MinIO** on Cecilia (port 9000). S3-compatible object storage. Health check passes.
- **Pi-hole** on Alice. DNS-level ad blocking for the entire LAN.
- **Portainer** on Aria. Container management UI.
- **Headscale** on Aria. Self-hosted Tailscale coordination.
- **WireGuard** mesh. Anastasia as hub. Alice, Cecilia, Octavia, Aria, Gematria as spokes. 10.8.0.x subnet.
- **Cloudflare Tunnels** on all 5 Pis. 65+ hostnames on Alice alone.
- **RoadNet** WiFi mesh. 5 access points. SSID: RoadNet. Password: BlackRoad2026. One AP per Pi.

### Monitoring

- **br doctor**: full system diagnostic. Checks SSH to all 5 nodes, Ollama, Qdrant, NATS, Gitea, Cloudflare tunnels, memory system, FTS5 index. Scored output. Takes about 30 seconds.
- **stats-blackroad** Cloudflare Worker + KV. Fleet stats collected every 5 minutes via cron.
- **Power monitoring**: `/opt/blackroad/power-monitor.sh` on all nodes. Cron every 5 minutes. Logs to `/var/log/blackroad-power.log`.
- **Autonomy scripts**: heartbeat every 1 minute, self-heal every 5 minutes on Cecilia and Octavia.

### AI Skills

- **75 skills** across 8 Python modules. All compile. All pass functional tests.
- Modules: agentic (1-8), generation (9-16), orchestration (17-24), knowledge (25-32), multimodal (33-40), frontier (41-50), agi (51-60), creative (61-75).
- Includes: Chain-of-Thought, ReAct, Tree-of-Thought, model routing, PII detection, prompt injection defense, semantic caching, federated inference, causal reasoning, world models, biological intelligence, empathic reasoning, storytelling, value alignment, and 60 more.

### Websites

- **30 static sites** in the operator repo under `websites/`.
- **20 root domains** on Cloudflare. 95+ Pages projects.
- All sites have: BR road logo (favicon, og:image, apple-touch-icon), ecosystem footer with 9 cross-links, "Pave Tomorrow." tagline.
- All cards clickable with real URLs. No dead links. No false claims.
- **research.blackroad.io** deployed with experiment results.

### Search

- **repo-search**: CLI tool searching 383 repos across 3 GitHub orgs. Categorized into 13 groups.
- **RAG search**: `rag search "query"` does semantic vector search across 27K+ code chunks.
- **FTS5 memory index**: 156,675 entries across 228 SQLite databases.

## 4. What Doesn't Work (Honest Assessment)

- **Aria NATS agent**: pip locked, `blackroad` user can't sudo. Needs fix.
- **Octavia IP unstable**: DHCP assigns .101, was .100, was .97. Needs static reservation on eero.
- **Alice kernel old**: 6.1.21 (Bullseye). Needs full OS migration to Bookworm.
- **Lucidia SD card degrading**: "mmc0: Card stuck being busy!" in dmesg. Will need replacement.
- **Leaked GitHub PAT**: gho_Gfu... on Lucidia. Files removed, token still needs revocation.
- **Gematria SSH down**: WireGuard alive but can't SSH. Needs investigation.
- **Anastasia disk 94% full**: 1 vCPU, 1GB RAM droplet. Nearly out of space.
- **50+ SSH keys** on Alice and Octavia. Never audited. Needs cleanup.
- **No SLA monitoring**: we claim nothing about uptime because we haven't measured it.
- **No automated backups**: rclone to Google Drive runs but isn't verified for recovery.

## 5. What It Cost

| Item                                  | Monthly Cost               |
| ------------------------------------- | -------------------------- |
| Cloudflare (free plan)                | $0                         |
| DigitalOcean (2 droplets)             | ~$18                       |
| Google Drive (backup)                 | $0 (included with account) |
| GitHub (free tier + enterprise trial) | $0                         |
| Electricity (5 Pis + router + switch) | ~$5                        |
| Internet (home broadband)             | Already paying for it      |
| **Total monthly**                     | **~$23**                   |

Initial hardware was approximately $500 (5 Pis, cases, power supplies, SD cards, NVMe, 2 Hailo-8s, switch, cables).

Total investment to date: approximately $800 including two years of droplet costs.

No VC. No seed round. No angel investors. No cloud compute bills. $800.

## 6. The Software Stack

| Layer          | Tool                                | Why                                      |
| -------------- | ----------------------------------- | ---------------------------------------- |
| OS             | Raspberry Pi OS (Bookworm/Bullseye) | Free. ARM native.                        |
| Container      | Docker 29.2.1                       | Free. Runs everything.                   |
| Orchestration  | Docker Swarm                        | Already in Docker. No K8s overhead.      |
| Git            | Gitea                               | Self-hosted. 207 repos. Zero cost.       |
| AI             | Ollama                              | Run any model locally. No API keys.      |
| Embeddings     | nomic-embed-text                    | 768 dimensions. Runs on a Pi.            |
| Vector DB      | Qdrant                              | Rust. Fast. Runs on a Pi.                |
| Message Bus    | NATS                                | Lightweight. JetStream. Runs everywhere. |
| DNS            | PowerDNS + Pi-hole                  | Authoritative + ad blocking.             |
| Object Storage | MinIO                               | S3-compatible. On Cecilia.               |
| CDN            | Cloudflare + nginx                  | Free tier handles everything.            |
| VPN            | WireGuard + Headscale               | Encrypted mesh. Self-hosted.             |
| Monitoring     | Custom shell scripts                | br doctor, stats API, power monitor.     |
| Memory         | SQLite + FTS5                       | 228 databases. 156K entries. Zero cost.  |

Every tool is free or open source. The entire stack runs without a credit card.

## 7. The Org Structure

```
BlackRoad-OS-Inc (source of truth, 22 repos)
    └── blackroad-operator (THE monorepo)
         ├── orgs/core/     → BlackRoad-OS (103 active repos)
         ├── orgs/ai/       → BlackRoad-AI (7 repos)
         ├── orgs/enterprise → Blackbox-Enterprises (6 repos)
         └── orgs/personal/ → blackboxprogramming (25 repos)

17 GitHub organizations total. 383 repos. 207 active.
downstream-sync.sh pushes from operator to all orgs.
```

## 8. The Math

Three textbooks were read in this session:

1. **Greenbaum & Nelson, "An Introduction to English Grammar"** — 7 sentence structures map to 7 function signatures. Grammar IS a programming language.
2. **Schleif, "Genetics and Molecular Biology" (Johns Hopkins)** — DNA IS source code. The cell IS a distributed system.
3. **Reddi, "Introduction to Machine Learning Systems" (Harvard, Jan 2026)** — ML systems engineering IS biology running backwards through silicon.

From these, the equation `1 + n = 1/n` was analyzed and found to contain:

- A conservation law: `gap(n) + gap(-n) = 2`
- A connection to growth: `(1 + 1/n)^n`
- A Ramanujan orbit: `-1/12 ↔ -12`
- The PEMDAS depth structure of mathematics

10 experiments were written and verified on multiple Pis. All code is in `experiments/`.

## 9. The Values

Built into the moral context module (`moral-context.py`) and the value alignment skill (#59):

- Every person is equal. We love all.
- Consent is continuous. Revocation is instant.
- Knowledge is sovereign, not forbidden. We know so we can decide.
- Technology is accessible to everyone. Make it easy.
- Your data stays on your devices. Nothing leaves without consent.
- Stand up for what is right. Ask why.
- Don't wait for permission. You already have it.

These aren't aspirational. They're in the code. Every RAG response includes the equality preamble. Every action can be checked against the values module. The cherubs aren't decorative.

## 10. What's Next

The 90-day plan (from the Master Execution Plan):

1. One working vertical end-to-end (Education / Lucidia Platform)
2. Auth flow (Clerk integration)
3. Live dashboard connected to real fleet APIs
4. mesh.js SDK (browser tabs as compute nodes)
5. More experiments. More papers. More truth.

The road isn't made. It's remembered.

---

_BlackRoad OS, Inc._
_Minnesota, USA_
_$800 total investment. 5 Pis. 75 AI skills. 27K vectors. 383 repos. 1 founder._
_Pave Tomorrow._
