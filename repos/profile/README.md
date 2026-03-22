# BlackRoad OS, Inc.

Delaware C Corporation. Self-hosted edge AI operating system.

## Platform

BlackRoad OS runs AI inference, fleet management, and developer tooling on hardware you own. Five Raspberry Pi 5 nodes, two Hailo-8 accelerators (52 TOPS), 75+ Cloudflare Workers, 20 custom domains.

90% reserved. Built to last.

## Stack

| Layer | What |
|-------|------|
| **Compute** | 5x Raspberry Pi 5, 2x Hailo-8 (52 TOPS), WireGuard mesh |
| **Edge** | 75+ Cloudflare Workers, 18 tunnels, D1/KV/R2 |
| **AI** | 16+ Ollama models, Qdrant embeddings, tokenless gateway |
| **Ops** | Self-healing autonomy, fleet monitoring, memory system |
| **Auth** | JWT auth service, Stripe billing, Clerk identity |

## Core Repositories

| Repository | Purpose |
|---|---|
| [blackroad](https://github.com/BlackRoad-OS-Inc/blackroad) | Monorepo -- CLI, agents, CarPool, tools |
| [blackroad-operator](https://github.com/BlackRoad-OS-Inc/blackroad-operator) | Fleet operations CLI (`br` command) |
| [blackroad-api](https://github.com/BlackRoad-OS-Inc/blackroad-api) | REST API -- OpenAPI spec, routes, middleware |
| [blackroad-sdk](https://github.com/BlackRoad-OS-Inc/blackroad-sdk) | TypeScript SDK (`@blackroad/sdk`) |
| [blackroad-cli](https://github.com/BlackRoad-OS-Inc/blackroad-cli) | Command-line interface (`@blackroad/cli`) |
| [blackroad-gateway](https://github.com/BlackRoad-OS-Inc/blackroad-gateway) | Tokenless AI provider gateway (Cloudflare Worker) |
| [blackroad-agents](https://github.com/BlackRoad-OS-Inc/blackroad-agents) | Agent definitions, prompts, orchestration |
| [blackroad-web](https://github.com/BlackRoad-OS-Inc/blackroad-web) | Web platform and dashboard |
| [blackroad-docs](https://github.com/BlackRoad-OS-Inc/blackroad-docs) | Architecture docs, governance, roadmap |
| [blackroad-infra](https://github.com/BlackRoad-OS-Inc/blackroad-infra) | Infrastructure-as-code, CI/CD, deployment |
| [blackroad-hardware](https://github.com/BlackRoad-OS-Inc/blackroad-hardware) | Fleet registry, network topology, device manifests |
| [blackroad-design](https://github.com/BlackRoad-OS-Inc/blackroad-design) | Brand system -- design tokens, typography, components |

## Quick Start

```bash
npm install -g @blackroad/cli
blackroad init my-project
blackroad deploy
```

---

[blackroad.io](https://blackroad.io) -- Pave Tomorrow.
