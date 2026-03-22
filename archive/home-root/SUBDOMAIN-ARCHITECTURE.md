# BlackRoad Subdomain Architecture

> Complete subdomain map across all 19 domains and 15 organizations
> Generated 2026-03-21 by MERIDIAN

---

## blackroad.io — The Platform (Primary)

| Subdomain | Purpose | Org/Repo | Port/Target |
|-----------|---------|----------|-------------|
| `app.blackroad.io` | Main application / Browser OS | BlackRoad-OS/blackroad-os-web | Gematria |
| `api.blackroad.io` | Platform REST API | BlackRoad-OS/blackroad-os-api | Alice :8001 |
| `os.blackroad.io` | BlackRoad OS landing | BlackRoad-OS/blackroad-os-home | Gematria |
| `prism.blackroad.io` | Prism Console dashboard | BlackRoad-OS-Inc/blackroad-os-prism-enterprise | Octavia :8787 |
| `docs.blackroad.io` | Documentation hub | BlackRoad-OS/blackroad-os-web | Gematria |
| `chat.blackroad.io` | Sovereign chat (RoundTrip) | BlackRoad-OS-Inc/roundtrip | Alice :8094 |
| `search.blackroad.io` | RoadSearch engine | BlackRoad-OS-Inc/blackroad-index | Gematria |
| `auth.blackroad.io` | RoadAuth SSO | BlackRoad-OS/roadauth | Octavia :9001 |
| `pay.blackroad.io` | Stripe payments / RoadPay | BlackRoad-OS-Inc/Company | Gematria |
| `status.blackroad.io` | Fleet status dashboard | BlackRoad-OS/roadlog-monitoring | Alice :8184 |
| `mail.blackroad.io` | RoadMail campaigns | BlackRoad-OS-Inc/blackroad-os-core | Gematria |
| `hq.blackroad.io` | Pixel HQ metaverse | BlackRoad-OS-Inc/hq-blackroad | Gematria |
| `roundtrip.blackroad.io` | Agent hub (69+ agents) | BlackRoad-OS-Inc/roundtrip | Alice :8094 |
| `git.blackroad.io` | Gitea (primary git host) | Octavia Gitea | Octavia :3100 |
| `cdn.blackroad.io` | CDN / static assets | BlackRoad-Cloud/cloud-gateway | Cecilia (MinIO) |
| `images.blackroad.io` | Image CDN (R2/MinIO) | BlackRoad-Media/blackroad-image-optimizer | Cecilia |
| `code.blackroad.io` | BlackRoad Code (AI IDE) | BlackRoad-OS-Inc/blackroad-code | Gematria |
| `start.blackroad.io` | Certification & training | BlackRoad-OS-Inc/start | Gematria |
| `dash.blackroad.io` | Grafana monitoring | BlackRoad-OS/roadlog-monitoring | Alice :3000 |
| `queue.blackroad.io` | Task queue / marketplace | BlackRoad-OS-Inc/blackroad-os-core | Alice :8011 |

## blackroad.company — Corporate

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `ir.blackroad.company` | Investor relations | BlackRoad-Ventures/blackroad-lp-portal |
| `board.blackroad.company` | Board portal & minutes | BlackRoad-Foundation/governance |
| `hr.blackroad.company` | People & HR system | BlackRoad-Foundation/blackroad-hr-system |
| `legal.blackroad.company` | Legal & compliance | BlackRoad-Gov/compliance-framework |
| `careers.blackroad.company` | Job listings | BlackRoad-Foundation/community |
| `press.blackroad.company` | Press & media kit | BlackRoad-Media/brand-kit |
| `brand.blackroad.company` | Brand guidelines | BlackRoad-Media/brand-kit |

## blackroad.me — Identity

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `profile.blackroad.me` | User profiles | BlackRoad-OS/blackroad-os-web |
| `id.blackroad.me` | Digital identity / DID | BlackRoad-Gov/blackroad-digital-identity |
| `vault.blackroad.me` | Encrypted data vault | BlackRoad-Security/blackroad-encryption-suite |
| `keys.blackroad.me` | Key management | BlackRoad-Security/blackroad-cert-manager |
| `sso.blackroad.me` | Single sign-on | BlackRoad-OS/roadauth |

## blackroad.network — Infrastructure

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `mesh.blackroad.network` | WireGuard mesh dashboard | BlackRoad-Cloud/blackroad-service-mesh |
| `dns.blackroad.network` | PowerDNS admin | BlackRoad-Cloud/blackroad-terraform-modules |
| `vpn.blackroad.network` | VPN portal (TollBooth) | BlackRoad-OS/roadvpn |
| `nats.blackroad.network` | NATS messaging dashboard | BlackRoad-Cloud/cloud-gateway |
| `nodes.blackroad.network` | Node registry & status | BlackRoad-Hardware/blackroad-device-registry |
| `edge.blackroad.network` | Edge routing (Caddy) | BlackRoad-Cloud/blackroad-load-balancer |
| `tor.blackroad.network` | Tor hidden services portal | BlackRoad-Security/blackroad-encryption-suite |
| `ipfs.blackroad.network` | IPFS node dashboard | BlackRoad-Archive/blackroad-ipfs-tracker |
| `wire.blackroad.network` | WireGuard config portal | BlackRoad-Cloud/blackroad-service-mesh |

## blackroad.systems — Fleet & Monitoring

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `fleet.blackroad.systems` | Fleet management dashboard | BlackRoad-Hardware/blackroad-fleet-tracker |
| `grafana.blackroad.systems` | Grafana monitoring | BlackRoad-OS/roadlog-monitoring |
| `alerts.blackroad.systems` | Alert manager | BlackRoad-Cloud/blackroad-service-mesh |
| `logs.blackroad.systems` | Log aggregation | BlackRoad-Labs/blackroad-data-pipeline |
| `health.blackroad.systems` | Health checks dashboard | BlackRoad-Hardware/blackroad-sensor-dashboard |
| `power.blackroad.systems` | Power & energy monitor | BlackRoad-Hardware/blackroad-power-manager |
| `uptime.blackroad.systems` | Uptime monitoring | BlackRoad-Cloud/blackroad-load-balancer |

## blackroadai.com — Artificial Intelligence

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `models.blackroadai.com` | Model registry & hub | BlackRoad-AI/lucidia-ai-models-enhanced |
| `inference.blackroadai.com` | Inference API | BlackRoad-AI/blackroad-ai-api-gateway |
| `rag.blackroadai.com` | RAG pipeline dashboard | BlackRoad-AI/blackroad-ai-memory-bridge |
| `train.blackroadai.com` | Training dashboard | BlackRoad-Labs/blackroad-ml-pipeline |
| `agents.blackroadai.com` | Agent registry | BlackRoad-AI/lucidia-platform |
| `skills.blackroadai.com` | AI skills catalog (50) | BlackRoad-AI/blackroad-ai-cluster |
| `ollama.blackroadai.com` | Ollama fleet manager | BlackRoad-AI/blackroad-ai-ollama |
| `deepseek.blackroadai.com` | DeepSeek models | BlackRoad-AI/blackroad-ai-deepseek |
| `qwen.blackroadai.com` | Qwen models | BlackRoad-AI/blackroad-ai-qwen |
| `vllm.blackroadai.com` | vLLM inference | BlackRoad-AI/blackroad-vllm-mvp |

## blackroadinc.us — US Corporate

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `stripe.blackroadinc.us` | Stripe billing portal | BlackRoad-OS-Inc/Company |
| `taxes.blackroadinc.us` | Tax filings (Form 1120) | BlackRoad-Gov/audit-tools |
| `compliance.blackroadinc.us` | SOC 2 / compliance | BlackRoad-Security/blackroad-compliance-framework |
| `formation.blackroadinc.us` | Formation docs | BlackRoad-OS-Inc/Company |

## blackroadqi.com — Quantum Intelligence

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `math.blackroadqi.com` | Amundson Framework explorer | BlackRoad-OS-Inc/amundson-research |
| `prover.blackroadqi.com` | Theorem prover | BlackRoad-OS-Inc/amundson-research |
| `sim.blackroadqi.com` | Quantum simulator | BlackRoad-Labs/experiments |
| `trinary.blackroadqi.com` | Trinary logic engine | BlackRoad-Labs/experiments |

## blackroadquantum.com — Quantum Computing

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `lab.blackroadquantum.com` | Quantum lab environment | BlackRoad-Labs/experiments |
| `circuit.blackroadquantum.com` | Circuit designer | BlackRoad-Interactive/blackroad-level-editor |
| `docs.blackroadquantum.com` | Quantum documentation | BlackRoad-Labs/research |
| `api.blackroadquantum.com` | Quantum computing API | BlackRoad-Labs/blackroad-experiment-tracker |

## blackroadquantum.info — Research

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `papers.blackroadquantum.info` | Published papers | BlackRoad-Labs/research |
| `wiki.blackroadquantum.info` | Research wiki | BlackRoad-Education/tutorials |
| `data.blackroadquantum.info` | Research datasets | BlackRoad-Labs/blackroad-feature-store |

## blackroadquantum.net — Security & Mesh

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `blackbox.blackroadquantum.net` | BlackBox Protocol hub | BlackRoad-Security/blackroad-encryption-suite |
| `onion.blackroadquantum.net` | Tor service directory | BlackRoad-Security/blackroad-threat-intel |
| `mesh.blackroadquantum.net` | Mesh network SDK | BlackRoad-Cloud/blackroad-service-mesh |
| `audit.blackroadquantum.net` | Security audit portal | BlackRoad-Security/security-audits |
| `siem.blackroadquantum.net` | SIEM dashboard | BlackRoad-Security/blackroad-siem |

## blackroadquantum.shop — Hardware Commerce

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `store.blackroadquantum.shop` | Storefront | BlackRoad-OS-Inc/blackroadquantum.store |
| `kits.blackroadquantum.shop` | Pi fleet kits | BlackRoad-Hardware/hardware-specs |
| `parts.blackroadquantum.shop` | Components catalog | BlackRoad-Hardware/blackroad-device-registry |
| `cart.blackroadquantum.shop` | Shopping cart (Stripe) | Stripe integration |

## blackroadquantum.store — Digital Products

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `models.blackroadquantum.store` | AI model marketplace | BlackRoad-AI/lucidia-ai-models |
| `datasets.blackroadquantum.store` | Training data store | BlackRoad-Labs/blackroad-feature-store |
| `licenses.blackroadquantum.store` | Software licensing | BlackRoad-OS-Inc/Company |
| `support.blackroadquantum.store` | Premium support portal | BlackRoad-Foundation/blackroad-ticket-system |

## lucidia.earth — AI Agents

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `agents.lucidia.earth` | Agent directory (334 apps) | BlackRoad-AI/lucidia-platform |
| `workspace.lucidia.earth` | Lucidia workspace IDE | BlackRoad-AI/lucidia-platform |
| `terminal.lucidia.earth` | Web terminal | BlackRoad-AI/lucidia-platform |
| `3d.lucidia.earth` | 3D wilderness explorer | BlackRoad-AI/lucidia-3d-wilderness |
| `command.lucidia.earth` | Command center | BlackRoad-OS/lucidia-command-center |
| `models.lucidia.earth` | Model hub | BlackRoad-AI/lucidia-ai-models-enhanced |

## lucidia.studio — Creative Suite

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `video.lucidia.studio` | Video editor | BlackRoad-Studio/video-studio |
| `canvas.lucidia.studio` | Canvas/design editor | BlackRoad-Studio/canvas-studio |
| `writing.lucidia.studio` | Writing studio | BlackRoad-Studio/writing-studio |
| `templates.lucidia.studio` | Template gallery | BlackRoad-Studio/templates |
| `assets.lucidia.studio` | Asset library | BlackRoad-Media/content |

## lucidiaqi.com — Quantum AI

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `agents.lucidiaqi.com` | QI agent roster | BlackRoad-AI/lucidia-platform |
| `router.lucidiaqi.com` | Trinary routing dashboard | BlackRoad-Labs/experiments |
| `decision.lucidiaqi.com` | Decision engine | BlackRoad-Labs/experiments |

## roadchain.io — Blockchain

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `explorer.roadchain.io` | Block explorer | BlackRoad-Gov/roadcoin-token |
| `wallet.roadchain.io` | Web wallet | BlackRoad-Gov/roadcoin-token |
| `bridge.roadchain.io` | Stablecoin bridge | BlackRoad-Gov/roadcoin-token |
| `contracts.roadchain.io` | Smart contract IDE | BlackRoad-Gov/roadcoin-token |
| `did.roadchain.io` | Decentralized identity | BlackRoad-Gov/blackroad-digital-identity |
| `api.roadchain.io` | Blockchain API | BlackRoad-Gov/roadcoin-token |
| `testnet.roadchain.io` | Testnet | BlackRoad-Labs/experiments |

## roadcoin.io — Cryptocurrency

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `wallet.roadcoin.io` | RoadCoin wallet | BlackRoad-Gov/roadcoin-token |
| `exchange.roadcoin.io` | Token exchange | BlackRoad-Gov/roadcoin-token |
| `faucet.roadcoin.io` | Testnet faucet | BlackRoad-Labs/experiments |
| `stake.roadcoin.io` | Staking portal | BlackRoad-Gov/roadcoin-token |
| `docs.roadcoin.io` | Whitepaper & docs | BlackRoad-Gov/roadcoin-token |
| `market.roadcoin.io` | Marketplace | BlackRoad-Ventures/portfolio |

## blackboxprogramming.io — Developer Tools

| Subdomain | Purpose | Org/Repo |
|-----------|---------|----------|
| `code.blackboxprogramming.io` | AI code editor | BlackRoad-OS-Inc/blackroad-code |
| `roadcode.blackboxprogramming.io` | RoadCode platform | BlackRoad-OS-Inc/RoadCode |
| `api.blackboxprogramming.io` | Developer API | Blackbox-Enterprises/blackbox-n8n |
| `deploy.blackboxprogramming.io` | Deployment pipeline | BlackRoad-Cloud/cloud-gateway |
| `review.blackboxprogramming.io` | Code review AI | BlackRoad-OS-Inc/roadcode-squad |
| `registry.blackboxprogramming.io` | Package registry | BlackRoad-Archive/blackroad-artifact-registry |
| `ci.blackboxprogramming.io` | CI/CD dashboard | Blackbox-Enterprises/blackbox-temporal |
| `automation.blackboxprogramming.io` | n8n/Temporal automation | Blackbox-Enterprises/blackbox-n8n |

---

## Summary

| Domain | Subdomains | Category |
|--------|-----------|----------|
| blackroad.io | 20 | Platform |
| blackroad.company | 7 | Corporate |
| blackroad.me | 5 | Identity |
| blackroad.network | 9 | Infrastructure |
| blackroad.systems | 7 | Monitoring |
| blackroadai.com | 10 | AI |
| blackroadinc.us | 4 | US Corporate |
| blackroadqi.com | 4 | Quantum Intelligence |
| blackroadquantum.com | 4 | Quantum Computing |
| blackroadquantum.info | 3 | Research |
| blackroadquantum.net | 5 | Security |
| blackroadquantum.shop | 4 | Hardware Commerce |
| blackroadquantum.store | 4 | Digital Products |
| lucidia.earth | 6 | AI Agents |
| lucidia.studio | 5 | Creative Suite |
| lucidiaqi.com | 3 | Quantum AI |
| roadchain.io | 7 | Blockchain |
| roadcoin.io | 6 | Cryptocurrency |
| blackboxprogramming.io | 8 | Developer Tools |
| **TOTAL** | **126** | **19 domains** |

---

## DNS Implementation

All subdomains route through one of:
1. **Cloudflare Proxy** — CNAME to `*.pages.dev` or A to Gematria
2. **Gematria Caddy** — TLS termination → WireGuard → Pi fleet
3. **Direct A record** — To specific Pi (Alice, Octavia, etc.)

### Priority Order
1. `*.blackroad.io` (20 subdomains — flagship)
2. `*.blackroadai.com` (10 subdomains — AI showcase)
3. `*.blackroad.network` + `*.blackroad.systems` (16 subdomains — infrastructure)
4. `*.lucidia.earth` + `*.lucidia.studio` (11 subdomains — agents + creative)
5. `*.roadchain.io` + `*.roadcoin.io` (13 subdomains — blockchain)
6. Everything else

---

*BlackRoad OS, Inc. — Pave Tomorrow.*
*126 subdomains across 19 domains. Every repo has a home.*
