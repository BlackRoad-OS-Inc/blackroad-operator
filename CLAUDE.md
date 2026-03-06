# CLAUDE.md

This file provides guidance to Claude Code (and other AI assistants) when working with the **blackroad-operator** repository.

---

## Project Overview

**blackroad-operator** is the CLI tooling, node bootstrap, and operational control center for BlackRoad OS. It contains:

- The **`br` CLI** — a TypeScript CLI (Commander.js) that communicates with the BlackRoad Gateway
- **90 tool scripts** in `tools/` — shell-based extensions invoked via the legacy `br` zsh dispatcher
- **63 root shell scripts** — monitoring dashboards, agent interaction, and system utilities
- **MCP Bridge** — a FastAPI server for remote AI agent access
- **Agent system** — manifests, coordination, and multi-agent orchestration
- **Conductor** — Python-based ML pipeline orchestration
- **Infrastructure configs** — GitHub workflows, deployment scripts, and templates

**Owner:** BlackRoad OS, Inc. (proprietary, all rights reserved)

---

## Quick Start

```bash
# TypeScript CLI (preferred)
npm install
npm run build          # tsc → dist/
npm run dev            # tsx watch mode
node dist/bin/br.js status

# Legacy zsh CLI dispatcher
chmod +x br
./br help              # Shows all 90+ tool commands

# MCP Bridge
cd mcp-bridge && ./start.sh   # Starts on 127.0.0.1:8420

# Tests
npm test               # vitest
npm run typecheck      # tsc --noEmit
npm run lint           # prettier --check
```

---

## Repository Structure

```
blackroad-operator/
├── src/                        # TypeScript CLI source
│   ├── bin/br.ts               # Entry point (#!/usr/bin/env node)
│   ├── cli/commands/           # Commander.js subcommands
│   │   ├── index.ts            # Program definition + command registration
│   │   ├── status.ts           # br status — gateway health + agent count
│   │   ├── agents.ts           # br agents — list agents (table or JSON)
│   │   ├── deploy.ts           # br deploy — trigger deployment (stub)
│   │   ├── logs.ts             # br logs — tail gateway logs (stub)
│   │   ├── config.ts           # br config — get/set config via Conf
│   │   ├── gateway.ts          # br gateway health|url
│   │   ├── invoke.ts           # br invoke <agent> <task>
│   │   └── init.ts             # br init [name] — project scaffolding (stub)
│   ├── core/
│   │   ├── client.ts           # GatewayClient — HTTP client for gateway API
│   │   ├── config.ts           # loadConfig() — Conf-based config (~/.config/blackroad)
│   │   ├── logger.ts           # Colored logger (info/success/warn/error/debug)
│   │   └── spinner.ts          # ora spinner wrapper
│   ├── formatters/
│   │   ├── brand.ts            # Brand colors (hotPink, amber, violet, electricBlue)
│   │   ├── table.ts            # ASCII table formatter
│   │   └── json.ts             # Syntax-highlighted JSON formatter
│   ├── bootstrap/
│   │   ├── preflight.ts        # Node.js version check + gateway reachability
│   │   ├── setup.ts            # Save gateway URL config
│   │   └── templates.ts        # Project templates (worker, api)
│   └── index.ts                # Public API exports
├── test/                       # Vitest test files
│   ├── core/
│   │   ├── client.test.ts      # GatewayClient tests
│   │   └── config.test.ts      # Config tests
│   └── formatters/
│       ├── brand.test.ts       # Brand formatter tests
│       └── table.test.ts       # Table formatter tests
├── tests/                      # Legacy shell tests
│   ├── run.sh                  # Shell test runner
│   └── operator.golden         # Golden file for output comparison
├── br                          # Legacy zsh CLI dispatcher (93K lines)
├── tools/                      # 90 tool script directories
├── scripts/                    # Bootstrap, setup, and utility scripts
├── agents/                     # Agent manifests and state
├── coordination/               # Multi-agent coordination
├── mcp-bridge/                 # FastAPI MCP server
├── blackroad-core/             # Gateway architecture reference
├── blackroad-os/               # OS apps and workers reference
├── lib/                        # Shared shell libraries
├── orgs/                       # Organization monorepo references
├── templates/                  # Project and doc templates
├── websites/                   # Static website sources
├── workers/                    # Cloudflare Worker projects
├── shared/                     # Inter-agent messaging
├── dashboards/                 # Dashboard configs
├── carpool/                    # Carpool system
├── wavecube/                   # Wavecube project
├── .github/                    # CI/CD, issue templates, CODEOWNERS
├── package.json                # @blackroad/operator
├── tsconfig.json               # ES2024, NodeNext, strict
├── vitest.config.ts            # Vitest config (v8 coverage)
└── CLAUDE.md                   # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Language** | TypeScript (ES2024, NodeNext modules, strict mode) |
| **CLI framework** | Commander.js v13 |
| **Config storage** | Conf v13 (persists to `~/.config/blackroad/`) |
| **Output** | chalk v5 (colors), ora v8 (spinners) |
| **Build** | `tsc` (TypeScript compiler) |
| **Dev mode** | `tsx` (watch mode) |
| **Test** | Vitest v3 (v8 coverage provider) |
| **Lint/Format** | Prettier v3 |
| **Runtime** | Node.js >= 22 |
| **Legacy scripts** | zsh/bash shell scripts |
| **MCP Bridge** | Python FastAPI |
| **CI** | GitHub Actions (self-hosted ARM64 runners) |

---

## Development Workflow

### Build & Test

```bash
npm run build          # Compile TypeScript → dist/
npm run dev            # Watch mode with tsx
npm test               # Run vitest tests
npm run test:watch     # Vitest in watch mode
npm run typecheck      # Type-check without emitting
npm run lint           # Check formatting with Prettier
npm run format         # Auto-format with Prettier
```

### Adding a New CLI Command

1. Create `src/cli/commands/<name>.ts`:
   ```typescript
   // Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
   import { Command } from 'commander'
   import { logger } from '../../core/logger.js'

   export const myCommand = new Command('my-command')
     .description('What it does')
     .action(async () => {
       logger.info('Running...')
     })
   ```
2. Register in `src/cli/commands/index.ts`:
   ```typescript
   import { myCommand } from './my-command.js'
   program.addCommand(myCommand)
   ```
3. Add tests in `test/` mirroring the `src/` structure
4. Use `.js` extensions in imports (NodeNext module resolution)

### Adding a Legacy Tool Script

1. Create `tools/<feature>/br-<feature>.sh`
2. Add route to `br` dispatcher (case statement)
3. Make executable: `chmod +x tools/<feature>/br-<feature>.sh`
4. Follow conventions in the [Shell Script Conventions](#shell-script-conventions) section

---

## Architecture

### Gateway Client Pattern

All TypeScript CLI commands communicate with the BlackRoad Gateway via `GatewayClient`:

```
[br CLI] → [GatewayClient] → [Gateway :8787] → [Ollama/Claude/OpenAI]
```

- Default gateway URL: `http://127.0.0.1:8787`
- Override via: `BLACKROAD_GATEWAY_URL` env var or `br config gatewayUrl <url>`
- Agents do **not** embed API keys — the gateway handles all provider auth

### TypeScript CLI Commands

| Command | Status | Description |
|---------|--------|-------------|
| `br status` | Working | Gateway health + agent count |
| `br agents` | Working | List agents (table or `--json`) |
| `br invoke <agent> <task>` | Working | Send task to agent via gateway |
| `br config [key] [value]` | Working | Get/set persistent config |
| `br gateway health` | Working | Check gateway reachability |
| `br gateway url` | Working | Print gateway URL |
| `br deploy [service]` | Stub | Deployment (not yet implemented) |
| `br logs` | Stub | Log tailing (not yet implemented) |
| `br init [name]` | Stub | Project scaffolding (not yet implemented) |

### Legacy zsh Dispatcher

The `br` file at root is a ~93K-line zsh script that routes `br <tool>` to scripts in `tools/`. It covers 90 tool categories including:

**Agent & AI:** agent-gateway, agent-mesh, agent-router, agent-runtime, agent-tasks, agents-live, ai, coding-assistant, talk, cece-identity
**DevOps:** ci-pipeline, deploy-cmd, deploy-manager, docker-manager, cloudflare, vercel-pro, ocean-droplets
**Git:** git-ai, git-integration
**Monitoring:** health-check, metrics-dashboard, perf-monitor, status-all, web-monitor
**Security:** auth, secrets-vault, security-hardening, security-scanner, compliance-scanner, ssl-manager
**Infrastructure:** nodes, fleet, pi, pi-manager, port, ssh, wifi-scanner, worker-bridge
**Utilities:** api-tester, backup-manager, brand, broadcast, code-quality, context-radar, cron, db-client, dependency-helper, docs, email, env-check, env-manager, file-finder, journal, log-parser, log-tail, mail, notify, notifications, org, org-audit, pair-programming, pdf-read, project-init, quick-notes, review, search, session-manager, smart-search, snippet-manager, snapshot, standup, stripe, sync, task-manager, task-runner, template, test-suite, timeline, web-dev, whoami, world, worlds

---

## Key Files

| File | Purpose |
|------|---------|
| `src/bin/br.ts` | TypeScript CLI entry point |
| `src/core/client.ts` | `GatewayClient` — HTTP client for gateway |
| `src/core/config.ts` | `loadConfig()` — persistent config via Conf |
| `src/core/logger.ts` | Colored terminal logger |
| `src/formatters/brand.ts` | Brand colors (#FF1D6C, #F5A623, #9C27B0, #2979FF) |
| `br` | Legacy zsh dispatcher (routes to tools/) |
| `package.json` | `@blackroad/operator` v0.1.0 |
| `tsconfig.json` | ES2024, NodeNext, strict |
| `.prettierrc` | Prettier config |
| `brand.json` | Brand metadata (tagline, nav, footer) |
| `.env.example` | Environment variable template |

---

## Shell Script Conventions

Root-level `.sh` scripts follow this pattern:

```bash
#!/bin/zsh
# Colors
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

# Database (if needed)
DB_FILE="$HOME/.blackroad/<tool>.db"

# Command routing
case "$1" in
    cmd1) ... ;;
    *) show_help ;;
esac
```

**Key conventions:**
- SQLite for persistent storage (`~/.blackroad/<feature>.db`)
- Consistent color scheme: GREEN=success, RED=error, CYAN=info, YELLOW=warning
- Use `git --no-pager` to avoid hangs
- Use `tr` for capitalization (not `${var^}` — zsh incompatible)
- Use manual line counting instead of `head -n -2` on macOS

### Shared Libraries (`lib/`)

| File | Purpose |
|------|---------|
| `lib/colors.sh` | Shared color definitions |
| `lib/config.sh` | Configuration helpers |
| `lib/db.sh` | SQLite database helpers |
| `lib/errors.sh` | Error handling |
| `lib/ollama.sh` | Ollama integration helpers |
| `lib/services.sh` | Service management |
| `lib/system.sh` | System utilities |
| `lib/auth/` | Authentication helpers |

---

## Root Shell Scripts (63 scripts)

### Monitoring & Status
| Script | Purpose |
|--------|---------|
| `god.sh` | All-in-one overview dashboard |
| `mission.sh` | Mission control display |
| `dash.sh` | Standard dashboard |
| `monitor.sh` | Real-time resource monitor |
| `status.sh` | Quick status display |
| `health.sh` | System health check |
| `spark.sh` | Sparkline metrics |
| `logs.sh` | Live log stream |
| `events.sh` | Event stream viewer |
| `timeline.sh` | Event timeline |
| `report.sh` | Daily system report |
| `blackroad-mesh.sh` | Infrastructure mesh connectivity check |

### Agent & AI (Ollama-powered)
| Script | Purpose |
|--------|---------|
| `agent.sh` | Agent management |
| `roster.sh` | Live agent roster |
| `inspect.sh` | Detailed agent view |
| `soul.sh` | Agent personality profile |
| `office.sh` | Visual office with walking agents |
| `bonds.sh` | Agent relationships |
| `skills.sh` | Capabilities matrix |
| `wake.sh` | Wake up an agent (Ollama) |
| `chat.sh` | Interactive chat (Ollama) |
| `focus.sh` | One-on-one with agent (Ollama) |
| `convo.sh` | Watch agents converse (Ollama) |
| `broadcast.sh` | Send to all agents (Ollama) |
| `think.sh` | All agents respond (Ollama) |
| `debate.sh` | LUCIDIA vs CIPHER debate (Ollama) |
| `story.sh` | Collaborative storytelling (Ollama) |
| `whisper.sh` | Private message (Ollama) |
| `council.sh` | Agent council voting (Ollama) |
| `thoughts.sh` | Agent thought stream |
| `roundtable.sh` | Agent roundtable discussion |

### System & Utilities
| Script | Purpose |
|--------|---------|
| `hub.sh` | Main menu launcher |
| `intro.sh` | Animated intro sequence |
| `boot.sh` | System boot animation |
| `menu.sh` | Interactive menu |
| `demo.sh` | Demo mode |
| `mem.sh` | Memory operations |
| `tasks.sh` | Task queue status |
| `queue.sh` | Message queue view |
| `config.sh` | Configuration viewer |
| `alert.sh` | Show alerts |
| `all.sh` | Run all checks |
| `help.sh` | Show all commands |
| `find.sh` | Find utilities |
| `handoff.sh` | Session handoff |
| `install-cece.sh` | Install CECE identity |
| `blackroad-monorepo-setup.sh` | Monorepo setup |
| `carpool.sh` | Carpool system (308K line script) |

### Network
| Script | Purpose |
|--------|---------|
| `net.sh` | Network topology diagram |
| `wire.sh` | Live message wire |
| `traffic.sh` | Traffic flow visualization |

### Visual
| Script | Purpose |
|--------|---------|
| `clock.sh` | Digital clock |
| `pulse.sh` | Pulse animation |
| `matrix.sh` | Matrix rain |
| `saver.sh` | Bouncing logo |
| `mood.sh` | Mood display |

---

## Python Components

### Conductor (`conductor.py`, `conductor-ml.py`, `conductor-visual.py`)
ML pipeline orchestration scripts for managing agent workloads and model inference.

### MCP Bridge (`mcp-bridge/`)
Local MCP server for remote AI agent access:
- `server.py` — FastAPI server
- `start.sh` — Start script (runs on `127.0.0.1:8420`)
- `requirements.txt` — Python dependencies

### RPG Game (`blackroad-agents-rpg.py`)
Pokemon-style CLI game where you explore the BlackRoad world, encounter agents, battle and capture them.

### Chess Game (`chess_game.py`)
Simple text-based chess game using `python-chess`.

---

## Agent System

### Core Agents (6)
| Agent | Color | Role |
|-------|-------|------|
| **LUCIDIA** | Red | Coordinator — strategy, mentorship |
| **ALICE** | Blue | Router — traffic, navigation, task distribution |
| **OCTAVIA** | Green | Compute — inference, processing |
| **PRISM** | Yellow | Analyst — pattern recognition, data analysis |
| **ECHO** | Purple | Memory — storage, recall, context |
| **CIPHER** | Blue | Security — auth, encryption, access control |

### Agent Directories (`agents/`)
```
agents/
├── active/         # Currently running agents
├── idle/           # Available agents
├── processing/     # Agents working on tasks
├── archive/        # Completed agent runs
├── emails/         # Agent email configs
├── manifest.json   # Infrastructure config
└── registry.json   # Agent registry
```

### Coordination (`coordination/`)
```
coordination/
├── blackroad-directory-waterfall.sh   # Hierarchical agent routing
├── collaboration-update.sh            # Update collaboration system
├── send-dm-to-agents.sh              # Broadcast to agents
├── broadcast-message.json             # Message template
├── directory-structure.json           # Org directory
├── collaboration/                     # Collaboration state
├── codex/                             # Codex coordination
└── live/                              # Live context
```

---

## CI/CD

### GitHub Actions Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR to main | ShellCheck + CLI tests (self-hosted ARM64) |
| `release.yml` | tag `v*` | Build, pack, GitHub Release |
| `check-dependencies.yml` | Dependabot | Dependency validation |
| `workflow-index-sync.yml` | Manual | Sync workflow index |
| `autonomous-*.yml` (5) | Various | Self-healing, cross-repo, dependency management, issue management, orchestration |

### CI Requirements
- Runs on **self-hosted ARM64 runners** (`[self-hosted, linux, arm64, blackroad]`)
- ShellCheck validates all `.sh` files (warnings allowed)
- `npm test` via vitest
- Release builds use Node.js 22

### CODEOWNERS
All changes require review from `@blackboxprogramming`.

---

## Environment Variables

### Gateway (set only in gateway environment)
```bash
BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787   # Gateway endpoint
BLACKROAD_GATEWAY_BIND=127.0.0.1               # Gateway bind address
BLACKROAD_GATEWAY_PORT=8787                     # Gateway port
```

### Debug
```bash
DEBUG=1                    # Enable debug logging in logger.ts
```

### Service Config
```bash
BR_OS_ENV=local            # Environment: local, staging, prod
BR_OS_SERVICE_NAME=...     # Service identifier
PORT=8080                  # HTTP server port
NODE_ENV=development       # Node environment
LOG_LEVEL=info             # Log level: debug, info, warn, error
```

See `.env.example` for the complete template.

---

## Brand Design System

**Use these exact colors for all UI work:**

```css
--black: #000000;
--white: #FFFFFF;
--amber: #F5A623;
--hot-pink: #FF1D6C;        /* Primary accent */
--electric-blue: #2979FF;
--violet: #9C27B0;
```

These are encoded in `src/formatters/brand.ts` and `brand.json`.

### Golden Ratio Spacing (φ = 1.618)
```css
--space-xs: 8px;
--space-sm: 13px;
--space-md: 21px;
--space-lg: 34px;
--space-xl: 55px;
```

---

## Broader BlackRoad Ecosystem

This repo is one of 7 in the **BlackRoad-OS-Inc** corporate org:

| Repo | Purpose |
|------|---------|
| **blackroad-operator** | This repo — CLI, tools, operational control |
| `blackroad-core` | Core orchestration layer and runtime engine |
| `blackroad-agents` | Agent definitions, prompts, orchestration |
| `blackroad-web` | Frontend web platform |
| `blackroad-infra` | IaC, CI/CD, deployment configs |
| `blackroad-docs` | Architecture docs, governance, brand |
| `demo-repository` | GitHub demo |

### Local Org References (`orgs/`)

| Directory | Contents |
|-----------|----------|
| `orgs/core/` | Core platform repos |
| `orgs/ai/` | AI/ML repos (vLLM, Ollama, Qwen, DeepSeek) |
| `orgs/enterprise/` | Workflow automation forks (n8n, Airbyte, etc.) |
| `orgs/personal/` | Personal and experimental projects |

### Related Infrastructure
- **17 GitHub Organizations**, 1,825+ total repos
- **Railway** (14 projects), **Vercel** (15+ projects), **Cloudflare** (75+ workers)
- **Raspberry Pi fleet** (3 devices), **DigitalOcean** droplet
- **30,000 AI agents** distributed across Pi hardware

---

## Documentation Suite

This repo contains 45+ documentation files. Key ones:

| File | Description |
|------|-------------|
| `CLAUDE.md` | This file — AI assistant guidance |
| `README.md` | Quick start and overview |
| `ARCHITECTURE.md` | System architecture diagrams |
| `AGENTS.md` | Agent system deep dive |
| `API.md` | API reference |
| `DEPLOYMENT.md` | Multi-cloud deployment guides |
| `COMMANDS.md` | Complete CLI commands reference |
| `MEMORY.md` | Memory system (PS-SHA∞) |
| `SKILLS.md` | Skills SDK documentation |
| `OLLAMA.md` | Ollama integration guide |
| `TESTING.md` | Testing strategies |
| `SECURITY.md` | Security policies |
| `CONTRIBUTING.md` | Contribution guidelines |
| `ONBOARDING.md` | New developer quick start |
| `TROUBLESHOOTING.md` | Common issues and fixes |

---

## Conventions

1. **Copyright header** — Every `.ts` file starts with `// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.`
2. **Module system** — ESM (`"type": "module"`) with `.js` extensions in imports
3. **Strict TypeScript** — `strict: true` in tsconfig
4. **No provider keys in agents** — All AI provider auth goes through the gateway
5. **Prettier formatting** — No semicolons (default Prettier config via `.prettierrc`)
6. **License** — Proprietary (PROPRIETARY in package.json)
7. **Git** — Use `git --no-pager` in scripts to avoid hangs

---

## Security

- Never commit `.env` files, API keys, or secrets
- Master keys stored at `~/.blackroad/vault/.master.key` (chmod 400)
- Gateway binds to localhost by default
- MCP Bridge requires Bearer token auth
- All repos are proprietary to BlackRoad OS, Inc.
- CODEOWNERS requires `@blackboxprogramming` review

---

## Intellectual Property

All code in this repository and across all 17 BlackRoad GitHub organizations is the exclusive proprietary property of **BlackRoad OS, Inc.** Public visibility does not constitute open-source licensing. See `LICENSE` for full terms.

© 2026 BlackRoad OS, Inc. All rights reserved.
