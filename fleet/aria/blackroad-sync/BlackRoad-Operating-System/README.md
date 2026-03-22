# BlackRoad OS

Self-hosted edge AI operating system running 52 TOPS of inference on Raspberry Pi clusters.

## What is BlackRoad OS?

BlackRoad OS is a sovereign computing platform that runs AI inference, networking, and automation entirely on hardware you own. No cloud dependencies. No API keys expiring at 2am. Five Raspberry Pi 5 nodes connected by a WireGuard mesh network, accelerated by dual Hailo-8 NPUs, running 16 local models through Ollama.

The fleet self-heals. Cron-driven watchdogs monitor every service, restart what dies, and log what broke. Cloudflare tunnels route 48+ domains through the cluster. Docker Swarm orchestrates containers across nodes. Gitea hosts 200+ repositories on a 1TB NVMe.

This is infrastructure that runs in a closet and serves production traffic.

## Infrastructure

| Node | Role | Hardware |
|------|------|----------|
| **Alice** | Gateway, DNS, ingress | Pi 400, Pi-hole, PostgreSQL, Qdrant, 65+ tunnel routes |
| **Cecilia** | AI inference, TTS | Pi 5, Hailo-8 (26 TOPS), 16 Ollama models, MinIO |
| **Octavia** | Git, orchestration | Pi 5, Hailo-8 (26 TOPS), 1TB NVMe, Gitea, Docker Swarm leader |
| **Aria** | Container management | Pi 5, Portainer, Headscale |
| **Lucidia** | Apps, CI/CD | Pi 5, GitHub Actions runner, FastAPI, 334 web apps |

**Network:** WireGuard mesh (10.8.0.x) with Anastasia (DigitalOcean) as hub. RoadNet WiFi overlay across all nodes.

## Stack

| Component | What it does |
|-----------|-------------|
| **Hailo-8** | 52 TOPS combined neural network inference (2x 26 TOPS) |
| **Ollama** | 16 local LLMs including 4 custom CECE models |
| **WireGuard** | Encrypted mesh VPN across all nodes + cloud |
| **Pi-hole** | Fleet-wide DNS filtering and custom zones |
| **Docker Swarm** | Container orchestration across the cluster |
| **Gitea** | Self-hosted Git with 207 repositories |
| **NATS** | Lightweight messaging between services |
| **RoadC** | Custom programming language with Python-style indentation |
| **Cloudflare** | 18 tunnels, 48+ domains, D1/KV/R2 storage |

## Read More

Articles on building and running this infrastructure:

- [Self-Healing Infrastructure in Production](https://blackroad.io/blog/self-healing-infrastructure) — How the fleet detects, diagnoses, and fixes issues without human intervention
- [Building with Local AI Models](https://blackroad.io/blog/building-with-local-ai) — Running 16 Ollama models on sovereign hardware with Hailo-8 acceleration
- [Why We Chose Cloudflare + Raspberry Pi](https://blackroad.io/blog/why-we-chose-cloudflare-railway) — Edge architecture decisions for a self-hosted platform
- [PS-SHA: Quantum-Resistant Memory](https://blackroad.io/blog/ps-sha-infinity) — Cryptographic hash function for persistent memory integrity
- [Lessons from Scaling Autonomous Systems](https://blackroad.io/blog/building-30k-agents) — What broke and what held when pushing distributed agents to production

## Links

- **[blackroad.io](https://blackroad.io)** — Main site
- **[blackroad.io/blog](https://blackroad.io/blog)** — Technical blog
- **[git.blackroad.io](https://git.blackroad.io)** — Self-hosted Gitea

## License

Copyright 2026 BlackRoad OS, Inc. — Alexa Amundson. All rights reserved.

## Related Projects

| Project | Description |
|---------|-------------|
| [BlackRoad AI Dashboard](https://github.com/blackboxprogramming/blackroad-ai-dashboard) | Real-time AI fleet monitoring dashboard |
| [BlackRoad Desktop App](https://github.com/blackboxprogramming/blackroad-desktop-app) | Electron app for fleet management |
| [BlackRoad Chrome Extension](https://github.com/blackboxprogramming/blackroad-chrome-extension) | Browser extension for fleet monitoring |
| [Fleet Heartbeat](https://github.com/blackboxprogramming/fleet-heartbeat) | Distributed health monitoring system |
| [Lucidia](https://github.com/blackboxprogramming/lucidia) | Autonomous AI agent with persistent memory |
| [Hailo Vision](https://github.com/blackboxprogramming/hailo-vision) | Computer vision with Hailo-8 AI accelerators |
