# BlackRoad Reddit & Hacker News Posts

**Principle:** Authority + Social Validation + Central Route (these audiences think deeply and counterargue)
**Critical rule:** These audiences HATE marketing. Lead with technical substance. Never sound like an ad.

---

## Hacker News: Show HN Post

**Title:** Show HN: I run 16 AI models on 5 Raspberry Pis — 52 TOPS, $0/month cloud bill

**Body:**
```
I've been building self-hosted AI infrastructure on Raspberry Pis for the past year. Wanted to share what a production setup actually looks like.

The stack:
- 5x Raspberry Pi (4x Pi 5, 1x Pi 4)
- 2x Hailo-8 M.2 AI accelerators (26 TOPS each = 52 TOPS total)
- Ollama serving 16 models (Llama 3, Mistral, CodeLlama, Phi, Gemma, etc.)
- Qdrant for vector search / RAG
- NATS v2.12.3 for agent-to-agent pub/sub messaging
- Gitea hosting 207 repos (primary git — GitHub is a mirror)
- Docker Swarm for orchestration
- WireGuard mesh for encryption
- Cloudflare Tunnels for ingress (no open ports)
- Pi-hole for DNS filtering (120+ blocked domains)
- PostgreSQL for primary database

This serves 30 websites across 20 domains, runs a billing system (RoadPay), processes 50 AI skills, and hosts all our code.

Total hardware cost: ~$400
Monthly cloud bill: $0
Power consumption: ~46 watts

For context: one H100 on AWS is $3.90/hr = $33,696/year. Two Hailo-8s cost $198 total and run forever.

The project is called BlackRoad OS. Everything is at blackroad.io. Happy to answer questions about the architecture, the Hailo-8 performance, Ollama on Pi, or anything else.
```

---

## Hacker News: Blog Post Submission

**Title:** 94% of IT leaders fear vendor lock-in — the self-hosted market just hit $18.48B

**URL:** `https://blackroad.io/blog/vendor-lock-in`

*(No body text for URL submissions on HN)*

---

## Reddit: r/selfhosted

**Title:** I replaced my entire cloud infrastructure with 5 Raspberry Pis — here's the full architecture

**Body:**
```
Been running this setup for a year now. Figured I'd share since I see a lot of "is self-hosting AI actually viable?" questions here.

**Hardware:**
- Alice (Pi 5) — gateway, Pi-hole, PostgreSQL, Qdrant
- Cecilia (Pi 5 + Hailo-8) — 16 Ollama models, embedding engine
- Octavia (Pi 5 + Hailo-8) — Gitea (207 repos), Docker Swarm
- Aria (Pi 5) — agent runtime, NATS messaging
- Lucidia (Pi 4) — 334 web apps, CI/CD

**Networking:**
- WireGuard mesh between all nodes
- Cloudflare Tunnels for external access (zero open ports)
- Pi-hole DNS filtering fleet-wide

**AI Stack:**
- Ollama serves Llama 3, Mistral, CodeLlama, Phi-3, Gemma, and more
- 2x Hailo-8 = 52 TOPS of neural inference
- Qdrant + nomic-embed-text for RAG/semantic search
- NATS pub/sub for agent-to-agent communication

**What it runs:**
- 30 websites (20 domains)
- 50 AI skills across 6 modules
- Billing system (Stripe for cards, D1 for everything else)
- Auth system (JWT, 42 users)
- Full CI/CD pipeline
- 207 git repositories on Gitea

**Cost:**
- Hardware: ~$400 one-time
- Monthly: electricity only (~$5-8)
- Cloud bill: $0

Happy to answer questions. The project is BlackRoad OS — blackroad.io
```

---

## Reddit: r/homelab

**Title:** My homelab runs a company — 5 Pis, 52 TOPS AI, 30 websites, $0/month

**Body:**
```
I know "homelab to production" posts get mixed reactions, but this one's been running stable for a year so I figured I'd share.

[PHOTO OF PI CLUSTER]

**The nodes:**
| Node | Hardware | Role |
|------|----------|------|
| Alice | Pi 5 8GB | Gateway, Pi-hole, PostgreSQL, Qdrant |
| Cecilia | Pi 5 + Hailo-8 | 16 AI models (Ollama), embeddings |
| Octavia | Pi 5 + Hailo-8 | Gitea (207 repos), Docker Swarm |
| Aria | Pi 5 | Agent runtime, NATS pub/sub |
| Lucidia | Pi 4 | 334 web apps, GitHub Actions |

**Total power:** ~46W
**Total compute:** 52 TOPS neural inference

This serves real production traffic — 30 websites, a billing system, auth, AI inference, CI/CD, the works.

The Hailo-8 has been the game changer. $99 for 26 TOPS of inference, plugs into the Pi 5 via M.2. Two of them outperform the economics of any cloud GPU for inference workloads.

AMA about the setup, Hailo-8 performance, Ollama on Pi, or the network architecture.
```

---

## Reddit: r/LocalLLaMA

**Title:** Running 16 Ollama models on Raspberry Pi 5 + Hailo-8 — benchmarks and setup guide

**Body:**
```
Setup: Pi 5 (8GB) + Hailo-8 M.2 (26 TOPS), running Ollama.

**Models currently loaded:**
- Llama 3 8B
- Mistral 7B
- CodeLlama 7B
- Phi-3 Mini
- Gemma 2B
- Plus 11 more specialized models

**What works well:**
- Inference speed is surprisingly usable for 7-8B models
- Hailo-8 handles classification/detection tasks natively at full 26 TOPS
- Multiple models can be loaded (Ollama swaps efficiently)
- Embedding (nomic-embed-text) runs smoothly for RAG

**The real value:**
Running two of these nodes (52 TOPS combined) with NATS pub/sub means agents on different Pis can communicate and delegate tasks. One node runs the LLM, another handles embeddings, a third does classification.

It's not replacing an A100 for training. But for inference, RAG, and agent orchestration? It's production-viable and costs $200 in hardware total.

Full architecture at blackroad.io if you want the deep dive. Happy to share configs.
```

---

## Reddit: r/raspberry_pi

**Title:** 68 million Pis sold worldwide. Here's what 5 of them do when you treat them like a data center.

**Body:**
```
I've been running my entire company infrastructure on Raspberry Pis for a year. Not as a project. As production.

- 30 websites across 20 domains
- 207 git repositories on Gitea
- 16 AI models via Ollama
- 52 TOPS of neural inference (2x Hailo-8)
- Full billing system
- Vector database for semantic search
- Agent mesh network (NATS pub/sub)
- Automated CI/CD pipeline
- Pi-hole DNS filtering

All on 5 Pis drawing ~46 watts total.

The gap between "hobby project" and "production infrastructure" isn't hardware. It's architecture. Docker Swarm, WireGuard mesh, Cloudflare Tunnels, proper monitoring — and suddenly a $55 SBC is a datacenter node.

Happy to share the full setup. The project is called BlackRoad OS.
```

---

## Posting Rules

1. **Never sound like an ad.** These communities will downvote anything that smells like marketing. Lead with technical substance.
2. **Answer every comment.** Engagement in comments drives visibility on both HN and Reddit.
3. **Be honest about limitations.** "This isn't replacing an A100 for training" builds more credibility than overclaiming.
4. **Include the photo.** r/homelab and r/raspberry_pi are visual. Show the actual hardware.
5. **Time the posts.** HN: Tuesday-Thursday, 9-11am ET. Reddit: varies by sub, but weekday mornings.
6. **Don't cross-post simultaneously.** Stagger by 2-3 days so you can customize based on what resonated.
