# blackroad-operator

> **The CLI that runs an AI empire from your terminal.**

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml)

BlackRoad Operator is the operational control center for [BlackRoad OS](https://blackroad.io) -- a sovereign, local-first AI infrastructure platform. It provides the `br` CLI dispatcher, node bootstrap tooling, agent orchestration, and the MCP bridge server for remote AI agent access.

**Your AI. Your Hardware. Your Rules.**

## Overview

| Metric | Value |
|--------|-------|
| CLI Commands | 37+ tools via `br <command>` |
| AI Agents | 30,000 across distributed fleet |
| GitHub Orgs | 17 organizations, 1,825+ repos |
| Platforms | Cloudflare, Railway, Vercel, DigitalOcean, Raspberry Pi |

## Quick Start

```bash
# Install dependencies
npm install

# Build the TypeScript CLI
npm run build

# Run via Node.js
node dist/bin/br.js help

# Or use the shell dispatcher directly
chmod +x br
./br help
```

### Global Installation

```bash
# Link for global usage
npm link
br help

# Or symlink manually
ln -s $(pwd)/br /usr/local/bin/br
```

## Project Structure

```
blackroad-operator/
├── src/                    # TypeScript source
│   ├── bin/br.ts           # CLI entry point
│   ├── cli/commands/       # Command implementations
│   │   ├── status.ts       # br status
│   │   ├── agents.ts       # br agents
│   │   ├── deploy.ts       # br deploy
│   │   ├── gateway.ts      # br gateway health|url
│   │   ├── invoke.ts       # br invoke <agent> <task>
│   │   ├── config.ts       # br config [key] [value]
│   │   ├── logs.ts         # br logs
│   │   └── init.ts         # br init [name]
│   ├── core/               # Core libraries
│   │   ├── client.ts       # Gateway HTTP client
│   │   ├── config.ts       # Configuration (Conf)
│   │   ├── logger.ts       # Chalk-based logger
│   │   └── spinner.ts      # Ora spinner
│   └── formatters/         # Output formatting
│       ├── brand.ts        # Brand colors & logo
│       ├── json.ts         # JSON syntax highlighting
│       └── table.ts        # Table formatting
├── test/                   # Vitest unit tests
├── br                      # Shell CLI dispatcher (37+ tools)
├── tools/                  # Tool scripts (br <tool>)
├── agents/                 # Agent manifests & configs
├── blackroad-core/         # Tokenless gateway architecture
├── coordination/           # Multi-agent coordination
├── mcp-bridge/             # MCP bridge server (localhost:8420)
├── scripts/                # Bootstrap & setup scripts
├── docs/                   # Canonical documentation
│   ├── CANONICAL.md        # Source of truth
│   ├── org-map.md          # Organization topology
│   ├── domains.md          # Domain inventory
│   ├── operator-contract.md # Operational guarantees
│   └── marketing/copy.md   # Brand voice & messaging
├── templates/              # Project templates
├── shared/                 # Inter-agent messaging
└── .github/workflows/      # CI/CD & automation
```

## CLI Commands

### TypeScript CLI (`br`)

| Command | Description |
|---------|-------------|
| `br status` | Show gateway health and agent count |
| `br agents` | List connected agents |
| `br invoke <agent> <task>` | Invoke an agent with a task |
| `br gateway health` | Check gateway health |
| `br gateway url` | Show gateway URL |
| `br config [key] [value]` | View or set configuration |
| `br deploy [service]` | Deploy a service |
| `br logs` | Tail service logs |
| `br init [name]` | Initialize a new project |

### Shell Tools (via `./br <tool>`)

| Category | Tools |
|----------|-------|
| **AI & Agents** | `radar`, `pair`, `cece`, `agent` |
| **Git** | `git` (smart commits, code review) |
| **Code** | `snippet`, `search`, `quality` |
| **DevOps** | `deploy`, `docker`, `ci` |
| **Cloud** | `cloudflare`, `ocean`, `vercel` |
| **IoT** | `pi` (Raspberry Pi management) |
| **Database** | `db` |
| **Monitoring** | `perf`, `metrics`, `logs` |
| **Security** | `security` |

### Interactive Scripts

| Script | Description |
|--------|-------------|
| `./hub.sh` | Main menu launcher |
| `./god.sh` | All-in-one dashboard |
| `./roster.sh` | Live agent roster |
| `./chat.sh` | Interactive AI chat (Ollama) |
| `./council.sh` | Agent council voting |
| `./office.sh` | Visual office with agents |
| `./health.sh` | System health check |

## Architecture

### Tokenless Gateway

Agents never embed API keys. All provider communication flows through the gateway:

```
[br CLI / Agents] --> [BlackRoad Gateway :8787] --> [Ollama / Claude / OpenAI]
```

### Agent System

Five specialized core agents:

| Agent | Role | Domain |
|-------|------|--------|
| **Octavia** | The Architect | Systems design, strategy |
| **Lucidia** | The Dreamer | Creative, vision, reasoning |
| **Alice** | The Operator | DevOps, automation |
| **Aria** | The Interface | Frontend, UX |
| **Shellfish** | The Hacker | Security, exploits |

### MCP Bridge

Local MCP server for remote AI agent access:

```bash
cd mcp-bridge && ./start.sh   # Starts on 127.0.0.1:8420
```

Endpoints: `/system`, `/exec`, `/file/read`, `/file/write`, `/memory/write`, `/memory/read`, `/memory/list`

### Memory System

Hash-chained persistence (PS-SHA-infinity) for tamper-evident AI memory:

```bash
~/memory-system.sh init              # Initialize
~/memory-system.sh new-session "work" # New session
~/memory-system.sh log "action" "entity" "details"
~/memory-system.sh synthesize        # Build context
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run typecheck

# Format code
npm run format

# Check formatting
npm run lint

# Build
npm run build

# Dev mode (watch)
npm run dev
```

### Tech Stack

- **Runtime:** Node.js >= 22
- **Language:** TypeScript (ES2024, NodeNext modules)
- **Testing:** Vitest
- **Formatting:** Prettier
- **Build:** tsc
- **CLI Framework:** Commander.js
- **Dependencies:** chalk, ora, conf

## Infrastructure

### GitHub Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **CI** | Push/PR to main | Lint, typecheck, test, build |
| **Release** | Tag `v*` | Build and publish GitHub release |
| **Autonomous Orchestrator** | Push/PR/Issues/Schedule | Full autonomous operation |
| **Autonomous Self-Healer** | Workflow failures | Auto-fix common issues |
| **Autonomous Issue Manager** | Issues/Schedule | Triage, label, stale cleanup |
| **Autonomous Dependency Manager** | Weekly schedule | Dependency updates |
| **Cross-Repo Coordinator** | Config changes | Sync across repos |
| **Workflow Index Sync** | Issue events | Track workflow metadata |
| **Check Dependencies** | Schedule | Verify dependency status |

### Hardware Fleet

| Device | IP | Role |
|--------|-----|------|
| blackroad-pi | 192.168.4.64 | Primary, Cloudflare tunnel |
| aria64 | 192.168.4.38 | Secondary, 22,500 agent capacity |
| alice | 192.168.4.49 | Tertiary |

### Cloud Platforms

- **Cloudflare:** 75+ workers, 10+ Pages projects, R2 storage (135GB LLMs)
- **Railway:** 14 projects including GPU inference (A100/H100)
- **Vercel:** 15+ Next.js deployments
- **DigitalOcean:** blackroad-infinity droplet (159.65.43.12)

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |
| [docs/CANONICAL.md](docs/CANONICAL.md) | Source of truth |
| [docs/org-map.md](docs/org-map.md) | Organization topology (17 orgs) |
| [docs/domains.md](docs/domains.md) | Domain inventory |
| [docs/operator-contract.md](docs/operator-contract.md) | Operational guarantees |
| [docs/marketing/copy.md](docs/marketing/copy.md) | Brand voice & messaging |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture |
| [AGENTS.md](AGENTS.md) | Agent system deep dive |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Multi-cloud deployment |
| [SECURITY.md](SECURITY.md) | Security policies |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [API.md](API.md) | API reference |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

## Operator Contract

The operator guarantees:

1. **Idempotent operations** -- Same result every time
2. **Reversible changes** -- Everything can be undone
3. **Auditable actions** -- Every action is logged
4. **No hidden state** -- All state in known locations
5. **No vendor lock-in** -- Works with any provider

See [docs/operator-contract.md](docs/operator-contract.md) for full details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Key principles:

- Documentation-first approach
- Idempotent and reversible scripts
- No secrets in code (gateway handles all credentials)
- PR template requires testing and documentation checklist

## License

Proprietary -- BlackRoad OS, Inc. All rights reserved.

Public visibility does **not** constitute open-source licensing. No code may be used, reproduced, or distributed without written authorization from BlackRoad OS, Inc.
