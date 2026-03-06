# BlackRoad Operator

> CLI tooling, node bootstrap, agent orchestration, and operational control for BlackRoad OS.

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml)

## Overview

BlackRoad Operator is the command center for the BlackRoad OS ecosystem. It provides:

- **`br` CLI** — A unified command dispatcher routing to 37+ tool scripts for git, deployment, agents, security, and more
- **TypeScript CLI** — A modern Node.js CLI (`@blackroad/operator`) built with Commander.js for gateway communication, agent invocation, and system status
- **MCP Bridge** — A local FastAPI server for remote AI agent access
- **Agent Orchestration** — Coordination of 6 core AI agents (Octavia, Lucidia, Alice, Aria, Echo, Cipher)
- **Autonomous Workflows** — Self-healing CI/CD, issue triage, dependency management, and security scanning
- **Interactive Tools** — 57 shell scripts for monitoring, dashboards, agent conversations, and system management

## Requirements

- **Node.js** >= 22
- **npm** >= 10
- **Bash/Zsh** for shell scripts

## Quick Start

```bash
# Install dependencies
npm install

# Build the TypeScript CLI
npm run build

# Run tests
npm test

# Type check
npm run typecheck
```

### Shell CLI (`br`)

```bash
# Make br executable
chmod +x br
./br help

# Or install globally
ln -s $(pwd)/br /usr/local/bin/br
br help
```

### TypeScript CLI

```bash
# Development mode
npm run dev

# After building
npx br status     # System status
npx br agents     # List agents
npx br invoke octavia "Review this code"
npx br config     # View configuration
npx br gateway health
```

## Project Structure

```
blackroad-operator/
├── br                      # Main CLI entry point (zsh dispatcher)
├── src/                    # TypeScript source
│   ├── bin/br.ts           # CLI entry point
│   ├── cli/commands/       # CLI commands (status, agents, deploy, etc.)
│   ├── core/               # Gateway client, config, logger, spinner
│   ├── bootstrap/          # Preflight checks, setup, templates
│   └── formatters/         # Brand colors, JSON, table formatting
├── test/                   # Unit tests (Vitest)
├── tools/                  # 37+ tool scripts (br <tool>)
├── agents/                 # Agent manifests and configs
├── coordination/           # Multi-agent coordination scripts
├── scripts/                # Bootstrap & setup scripts
├── cli-scripts/            # Standalone CLI utilities
├── mcp-bridge/             # MCP bridge server (localhost:8420)
├── blackroad-core/         # Tokenless gateway architecture
├── templates/              # Project & deployment templates
├── shared/                 # Inter-agent messaging (inbox/outbox)
├── .github/workflows/      # CI/CD and autonomous workflows
└── orgs/                   # Organization monorepos
```

## CLI Commands

### TypeScript CLI (`@blackroad/operator`)

| Command | Description |
|---------|-------------|
| `br status` | Show system status and gateway health |
| `br agents [--json]` | List registered agents |
| `br invoke <agent> <task>` | Invoke an agent with a task |
| `br config [key] [value]` | View or set configuration |
| `br gateway health` | Check gateway health |
| `br gateway url` | Show configured gateway URL |
| `br deploy [service]` | Trigger deployment |
| `br init [name]` | Initialize a new project |
| `br logs [-n lines]` | Tail gateway logs |

### Shell CLI (`br <tool>`)

| Category | Commands |
|----------|----------|
| **AI & Agents** | `br radar`, `br pair`, `br cece`, `br agent` |
| **Git** | `br git` (smart commits, branch suggestions, code review) |
| **Code** | `br snippet`, `br search`, `br quality` |
| **DevOps** | `br deploy`, `br docker`, `br ci` |
| **Cloud** | `br cloudflare`, `br ocean`, `br vercel` |
| **Database** | `br db` |
| **Security** | `br security` |
| **Testing** | `br test` |
| **Monitoring** | `br metrics`, `br perf`, `br logs` |

### Interactive Scripts (57 total)

| Category | Scripts |
|----------|---------|
| **Dashboards** | `god.sh`, `dash.sh`, `mission.sh`, `monitor.sh`, `status.sh` |
| **Agents** | `roster.sh`, `inspect.sh`, `soul.sh`, `office.sh`, `skills.sh` |
| **Conversation** | `chat.sh`, `focus.sh`, `convo.sh`, `debate.sh`, `council.sh` |
| **Network** | `net.sh`, `wire.sh`, `traffic.sh`, `blackroad-mesh.sh` |
| **System** | `mem.sh`, `tasks.sh`, `queue.sh`, `config.sh`, `health.sh` |

## Architecture

### Tokenless Gateway

Agents do not embed API keys. All provider communication goes through the gateway:

```
[Agent CLIs] ---> [BlackRoad Gateway :8787] ---> [Ollama/Claude/OpenAI]
```

### Core Agents

| Agent | Role | Specialty |
|-------|------|-----------|
| **Octavia** | The Architect | Systems design, strategy |
| **Lucidia** | The Dreamer | Creative vision, reasoning |
| **Alice** | The Operator | DevOps, routing, automation |
| **Aria** | The Interface | Frontend, UX |
| **Echo** | Memory | Storage, recall, context |
| **Cipher** | Security | Auth, encryption, access control |

### MCP Bridge

Local MCP server for remote AI agent access:

```bash
cd mcp-bridge && ./start.sh   # Starts on 127.0.0.1:8420
```

Endpoints: `/system`, `/exec`, `/file/read`, `/file/write`, `/memory/write`, `/memory/read`

## CI/CD & Automation

### Workflows

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| **CI** | Typecheck, tests, lint, shellcheck | Push/PR to main |
| **Autonomous Orchestrator** | Full CI/CD pipeline with auto-merge, deploy, security | Push, PR, schedule |
| **Autonomous Self-Healer** | Auto-fix lint, deps, security issues | On workflow failure |
| **Autonomous Issue Manager** | Smart triage, stale cleanup, failure tracking | Issues, schedule |
| **Check Dependencies** | Validate workflow dependency chains | Schedule (6h) |
| **Workflow Index Sync** | Track workflow metadata in JSONL index | Issue events |

### Running Locally

```bash
# Full test suite
npm test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# Format code
npm run format

# Lint check
npm run lint
```

## Configuration

Configuration is stored in `~/.config/blackroad/` via the `conf` package.

| Key | Default | Description |
|-----|---------|-------------|
| `gatewayUrl` | `http://127.0.0.1:8787` | Gateway endpoint |
| `defaultAgent` | `octavia` | Default agent for invocations |
| `logLevel` | `info` | Logging level |

Override gateway URL via environment:

```bash
export BLACKROAD_GATEWAY_URL=http://custom-gateway:8787
```

## Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagrams |
| [AGENTS.md](AGENTS.md) | Agent system deep dive |
| [API.md](API.md) | API reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Multi-cloud deployment guides |
| [SECURITY.md](SECURITY.md) | Security policies |
| [COMMANDS.md](COMMANDS.md) | Complete CLI reference |
| [ONBOARDING.md](ONBOARDING.md) | New developer quick start |
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |

---

**BlackRoad OS, Inc.** -- All rights reserved. Proprietary.
