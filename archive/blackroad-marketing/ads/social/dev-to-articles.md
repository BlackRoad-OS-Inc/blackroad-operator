# BlackRoad Dev.to / Hashnode Cross-Posts

**Principle:** Authority + Reciprocity (give technical depth, earn credibility)
**Rule:** These are developer audiences. Lead with code and architecture, not marketing.

---

## Article 1: Setup Guide

**Title:** How I Run 16 AI Models on a Raspberry Pi 5 + Hailo-8 (Complete Setup Guide)

**Tags:** #ai #raspberrypi #selfhosted #tutorial

**Body:**
```markdown
I run 16 language models on a Raspberry Pi 5 with a Hailo-8 AI accelerator. This isn't a benchmark post — this is the production setup I use daily for BlackRoad OS.

Total hardware cost: $180. Total cloud bill: $0/month.

Here's exactly how to set it up.

## Hardware

| Component | Price | Purpose |
|-----------|-------|---------|
| Raspberry Pi 5 (8GB) | $80 | Compute |
| Hailo-8 M.2 AI Kit | $99 | 26 TOPS neural inference |
| 128GB microSD (A2) | $15 | Storage |
| USB-C power supply (27W) | $12 | Power |
| **Total** | **$206** | |

Optional but recommended:
- NVMe SSD via Pi 5 HAT ($30-50) — faster model loading
- Ethernet cable — more reliable than WiFi for serving

## OS Setup

Flash Raspberry Pi OS (64-bit, Bookworm) with the Raspberry Pi Imager.

Enable SSH during flashing (set hostname, username, password).

Boot and SSH in:

```bash
ssh pi@<your-pi-ip>
```

Update everything:

```bash
sudo apt update && sudo apt upgrade -y
```

## Install Ollama

One command:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify:

```bash
ollama --version
```

## Load Models

Pull the models you want. Here's what I run:

```bash
ollama pull llama3
ollama pull mistral
ollama pull codellama
ollama pull phi3
ollama pull gemma:2b
ollama pull nomic-embed-text
```

List loaded models:

```bash
ollama list
```

You can load as many as your storage allows. Ollama swaps models in and out of memory efficiently — only one runs at a time in RAM, but switching is fast.

## Install Hailo-8 Drivers

Add the Hailo APT repository:

```bash
sudo apt install -y hailo-all
```

Verify the accelerator is detected:

```bash
hailortcli fw-control identify
```

You should see: `Board Name: Hailo-8` and `26 TOPS`.

## Test Inference

Run a quick test:

```bash
ollama run llama3 "What is edge AI inference?"
```

For the Hailo-8 specifically, you can run object detection and classification models natively:

```bash
hailortcli run <model.hef>
```

## Serving Over the Network

Ollama serves on port 11434 by default. To expose it to other nodes on your network:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Now any machine on your LAN can query:

```bash
curl http://<pi-ip>:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Explain edge computing in one sentence."
}'
```

## What I Actually Run

In production, I have 5 Pis orchestrated with Docker Swarm:

- Alice: gateway, DNS, databases
- Cecilia: AI inference (this setup + Hailo-8)
- Octavia: git server + second Hailo-8
- Aria: agent runtime + NATS messaging
- Lucidia: web apps + CI/CD

Two Hailo-8s = 52 TOPS combined. WireGuard mesh encrypts everything. Cloudflare Tunnels provide ingress without opening ports.

This serves 30 websites, 50 AI skills, and 207 git repositories. Monthly cost: electricity (~$5-8).

## The Economics

| | Cloud GPU (H100) | Raspberry Pi + Hailo-8 |
|---|---|---|
| Cost | $3.90/hr | $206 one-time |
| Annual cost | $33,696 | ~$70 electricity |
| Inference | 65 TOPS | 26 TOPS |
| Privacy | Vendor-dependent | Absolute |
| Vendor lock-in | Yes | No |

The cloud GPU is faster. But for inference workloads that run 24/7, the Pi pays for itself in 53 hours of avoided cloud compute.

## Questions?

I'm happy to answer anything about this setup. The full architecture is at blackroad.io.

The project is open and the infrastructure is real — this post was served through it.
```

---

## Article 2: Architecture Deep-Dive

**Title:** I Replaced My Cloud Infrastructure with 5 Raspberry Pis — Here's the Full Architecture

**Tags:** #architecture #selfhosted #devops #ai

**Body:**
```markdown
This is the complete production architecture for BlackRoad OS. Not a demo. Not a weekend project. The actual infrastructure serving 30 websites, 207 git repos, and 50 AI skills.

## Network Topology

```
Internet
  │
  ├── Cloudflare (DNS, CDN, Tunnels, Pages)
  │     ├── 95+ Pages sites
  │     ├── 40 KV namespaces
  │     ├── 8 D1 databases
  │     └── 10 R2 buckets
  │
  ├── Cloudflare Tunnel → Alice (.49)
  │     ├── Pi-hole (DNS filtering, 120+ blocked domains)
  │     ├── PostgreSQL
  │     ├── Qdrant (vector search)
  │     └── Gateway / reverse proxy
  │
  ├── Cloudflare Tunnel → Cecilia (.96)
  │     ├── Ollama (16 models)
  │     ├── Hailo-8 (26 TOPS)
  │     └── Embedding engine (nomic-embed-text)
  │
  ├── Cloudflare Tunnel → Octavia (.101)
  │     ├── Gitea (207 repos, primary git host)
  │     ├── Docker Swarm manager
  │     └── Hailo-8 (26 TOPS)
  │
  ├── Cloudflare Tunnel → Aria (.98)
  │     ├── Agent runtime
  │     └── NATS v2.12.3 (pub/sub mesh)
  │
  └── Cloudflare Tunnel → Lucidia (.38)
        ├── 334 web applications
        └── GitHub Actions runner
```

## Internal Mesh

All nodes connect over WireGuard:

```
Alice ←→ Cecilia ←→ Octavia ←→ Aria ←→ Lucidia
  ↕          ↕          ↕          ↕
WireGuard encrypted mesh (10.8.0.x)
```

NATS v2.12.3 provides pub/sub messaging between 4 nodes. Agents on any node can publish tasks and subscribe to results.

## Key Design Decisions

**Why Gitea instead of GitHub?**
Gitea is primary. GitHub is a mirror. We own the git server. If GitHub changes pricing, policies, or terms — our repos don't move. Gitea runs on Octavia and syncs downstream to 17 GitHub orgs every 30 minutes.

**Why Cloudflare Tunnels?**
Zero open ports on any Pi. All ingress goes through authenticated Cloudflare Tunnels. No port scanning surface. No firewall rules to maintain (except Lucidia, which runs UFW).

**Why Pi-hole?**
Network-level DNS filtering. 120+ tracking/advertising domains blocked for every device on the network. This isn't ad-blocking — it's a security boundary.

**Why Hailo-8 instead of cloud GPUs?**
52 TOPS for $198 total vs. $33,696/year for one cloud H100. The Hailo-8 handles classification, detection, and inference acceleration. Ollama handles language model serving. Together, they cover the full inference stack.

**Why NATS?**
Lightweight pub/sub messaging designed for distributed systems. Agents on different Pis communicate by publishing to topics and subscribing to results. No message broker to maintain. No Kafka cluster to babysit.

## Services Map

| Service | Node | Port | Purpose |
|---------|------|------|---------|
| Pi-hole | Alice | 53, 80 | DNS filtering |
| PostgreSQL | Alice | 5432 | Primary database |
| Qdrant | Alice | 6333 | Vector search / RAG |
| Ollama | Cecilia | 11434 | LLM inference (16 models) |
| Gitea | Octavia | 3100 | Git hosting (207 repos) |
| NATS | Aria | 4222 | Agent messaging |
| Web apps | Lucidia | various | 334 applications |

## Monitoring & Automation

Cron jobs on the Mac (Alexandria, .28):
- Every 5 min: health check + fleet collector
- Every 15 min: Cecilia model sync
- Every 30 min: website checks + git sync
- Daily 3am: backups + sovereign mesh check
- Every 6h: Google Drive sync (rclone)
- Every 12h: rsync to DigitalOcean droplet

## Replication

This entire architecture is reproducible. Total hardware cost: ~$400. Setup time: a few hours with the guide.

Full setup guide: [link to Article 1]

Questions welcome — happy to share configs, scripts, or troubleshooting for any of these services.
```

---

## Article 3: The Psychology Post (Cross-post from blog)

**Title:** 80% of Advertisements Are Misunderstood — I Studied Why, Then Built a Marketing System That Can't Be

**Tags:** #marketing #psychology #transparency #startup

*(Cross-post blog/02-advertisements-misunderstood.md with Dev.to formatting)*

---

## Publishing Schedule

| Week | Article | Platform |
|------|---------|----------|
| 1 | Setup Guide | Dev.to + Hashnode |
| 2 | Architecture Deep-Dive | Dev.to + Hashnode |
| 3 | Psychology of Advertising | Dev.to |
| 4+ | Cross-post new blog posts as they publish | Both |

## Dev.to-Specific Rules

- Use their canonical URL feature to point back to blackroad.io/blog (SEO benefit)
- Include a "series" tag to link articles together
- Respond to every comment within 24 hours
- Don't use cover images that look like marketing — use terminal screenshots or architecture diagrams
