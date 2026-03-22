# Prism Console (Gen-0)

[![CI](https://github.com/BlackRoad-OS/blackroad-os-prism-console/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS/blackroad-os-prism-console/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/BlackRoad-OS/blackroad-os-prism-console)](LICENSE)

> **The single-pane-of-glass administrative console for the entire BlackRoad OS ecosystem**

Prism Console is the visual cortex and master admin terminal of BlackRoad OS. It provides real-time dashboards, agent monitoring, environment orchestration, and infrastructure control - all from one unified interface.

## 🌐 BlackRoad OS Ecosystem

Part of the **BlackRoad-OS** organization:

- **Core:** [blackroad-os-core](https://github.com/BlackRoad-OS/blackroad-os-core) | [blackroad-os-api](https://github.com/BlackRoad-OS/blackroad-os-api) | [blackroad-os-operator](https://github.com/BlackRoad-OS/blackroad-os-operator)
- **Console:** **blackroad-os-prism-console** ← You are here
- **Registry:** [blackroad-os-agents](https://github.com/BlackRoad-OS/blackroad-os-agents) | [blackroad-os-infra](https://github.com/BlackRoad-OS/blackroad-os-infra)
- **Docs:** [blackroad-os-docs](https://github.com/BlackRoad-OS/blackroad-os-docs) | [blackroad-os-archive](https://github.com/BlackRoad-OS/blackroad-os-archive)

📖 **[Repository Role & Architecture](docs/REPOSITORY_ROLE.md)** | 🕹️ **[PRISM Mission](docs/PRISM_MISSION.md)** | 🎯 **[Console Prompt](docs/PRISM_CONSOLE_PROMPT.md)** | 🤝 **[Contributing Guide](CONTRIBUTING.md)**

## ✨ Features

- 🤖 **Agent Monitoring** - Real-time health, capabilities, and trace visualization
- 🌍 **Environment Dashboards** - Track deployments across Railway, Cloudflare, Vercel
- 📊 **Job Scheduling** - Visualize cron tasks and execution history
- 🔐 **Identity & Audit** - PS-SHA∞ headers, beacon heartbeats, audit trails
- 🎨 **Lucidia Dashboard** - SIG graphs, Interference Engine, Agent Tree Hierarchy
- ⚙️ **Infrastructure Control** - Feature flags, hot redeploys, environment toggles

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 9.12.0

### Installation
### Operator doctrine
- **Prism Console Master Prompt**: See `system/prompts/prism_master_prompt.md` for the V0.1.64 64-state visualization spec.
- **Prism Console Agent Prompt**: See `docs/PRISM_CONSOLE_PROMPT.md` for the live UX mission brief that defines the console's role, goals, and canonical surfaces.

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev  # http://localhost:3000
```

**Environment Setup:**

```bash
cp prisma-console.env.example .env.local
# Edit .env.local with your configuration
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup instructions.

## 📦 Commands

- `pnpm dev` – Start the Next.js dev server
- `pnpm lint` – Run ESLint with Next.js presets
- `pnpm test` – Run Vitest tests (jsdom)
- `pnpm build` – Create a production build (also writes `public/sig.beacon.json`)
- `pnpm start` – Start the production server on `$PORT`
- `pnpm format` – Format code with Prettier

## 🔌 API Surface

- `GET /api/health` → `{ status: "ok", uptime: number }`
- `GET /api/version` → `{ version: string, commit: string }`

## 🚢 Deployment

### Docker

Dockerized runtime matches the local workflow:

```bash
docker build -t blackroad/prism-console:0.0.1 .
docker run -e PORT=3000 -p 3000:3000 blackroad/prism-console:0.0.1
```

### Railway

Railway support is provided via `railway.toml`. The console deploys automatically via GitHub Actions.

**Environment Variables:** Configure via Railway dashboard or `.env` (see `prisma-console.env.example`).

## 🗺️ Roadmap

- [ ] Wire `lib/fetcher.ts` to the BlackRoad OS API Gateway
- [ ] Stream deployment events over `$CORE_HUB/ws`
- [ ] Replace placeholder cards with live environment KPIs
- [ ] Implement Window-in-Window mode for live agent debugging
- [ ] Add scrubbable timeline UI for inference events
- [ ] Create live update map of agent deployments per region

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. **Create an Issue** - Use one of our [issue templates](.github/ISSUE_TEMPLATE/)
2. **Fork & Branch** - Create a feature branch
3. **Develop & Test** - Follow our code style and test your changes
4. **Submit PR** - Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

### Issue Labels

- `team:*` - Team ownership (e.g., `team:prism`)
- `type:*` - Issue type (feature, bug, infra, agent, pack, doc)
- `prio:*` - Priority (P0, P1, P2)
- `status:*` - Status (ready, in-progress, review, done)

See [`.github/labels.yml`](.github/labels.yml) for the complete label set.

## 📚 Documentation

- **[Prism Mission](docs/PRISM_MISSION.md)** 🕹️ - The single-pane-of-glass mission brief
- **[Repository Role](docs/REPOSITORY_ROLE.md)** - This repo's place in the BlackRoad OS ecosystem
- **[Prism Console Prompt](docs/PRISM_CONSOLE_PROMPT.md)** - UX mission and design philosophy
- **[Contributing Guide](CONTRIBUTING.md)** - Development guidelines
- **[Infrastructure Notes](infra/README.md)** - Deployment and infrastructure details

## 🔗 Related Repositories

### Core Platform
- [blackroad-os-core](https://github.com/BlackRoad-OS/blackroad-os-core) - Core platform logic
- [blackroad-os-api](https://github.com/BlackRoad-OS/blackroad-os-api) - Main API backend
- [blackroad-os-api-gateway](https://github.com/BlackRoad-OS/blackroad-os-api-gateway) - API gateway
- [blackroad-os-operator](https://github.com/BlackRoad-OS/blackroad-os-operator) - Orchestration agent

### Registries & Infrastructure
- [blackroad-os-agents](https://github.com/BlackRoad-OS/blackroad-os-agents) - Agent and pack registry
- [blackroad-os-infra](https://github.com/BlackRoad-OS/blackroad-os-infra) - Infrastructure blueprints

### Pack Repositories
- [blackroad-os-pack-education](https://github.com/BlackRoad-OS/blackroad-os-pack-education)
- [blackroad-os-pack-infra-devops](https://github.com/BlackRoad-OS/blackroad-os-pack-infra-devops)
- [blackroad-os-pack-creator-studio](https://github.com/BlackRoad-OS/blackroad-os-pack-creator-studio)
- [blackroad-os-pack-finance](https://github.com/BlackRoad-OS/blackroad-os-pack-finance)
- [blackroad-os-pack-legal](https://github.com/BlackRoad-OS/blackroad-os-pack-legal)
- [blackroad-os-pack-research-lab](https://github.com/BlackRoad-OS/blackroad-os-pack-research-lab)

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🌟 Design Philosophy

> "The visual cortex and master admin terminal of BlackRoad OS - a 'do anything from here' window for real-time control over a cognitive civilization where every component is observable."

Inspired by: OpenAI's internal console, NASA launch software, Tron, VS Code, and Stardew Valley UI.

---

**Built with:** Next.js 14 • TypeScript • Tailwind CSS • Vitest  
**Deployed on:** Railway • Cloudflare  
**Part of:** [BlackRoad OS Ecosystem](https://github.com/BlackRoad-OS)
