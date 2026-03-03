# CLAUDE.md

This file provides guidance to Claude Code (and all BlackRoad AI assistants) when working with code in this repository.

---

## Project Overview

**blackroad-operator** is the CLI tooling, node bootstrap, and operational control repository for BlackRoad OS, Inc. It contains:

- The **`br` CLI** — a TypeScript CLI (commander.js) that communicates with the BlackRoad Gateway
- **90 shell-based tool directories** in `tools/` with 97+ scripts, invoked via the legacy `br` zsh dispatcher
- **Agent infrastructure** — manifests, registries, and coordination for 30,000 distributed AI agents
- **Scripts & automation** — 73 utility scripts in `scripts/`, 58 CLI scripts in `cli-scripts/`, 63 root shell scripts
- **Cloudflare Workers** in `workers/`
- **Multi-cloud deployment** configs and templates
- **Documentation suite** — 45+ documentation files (38,000+ lines)

**Philosophy:** "Your AI. Your Hardware. Your Rules."

**Scale:** 30,000 AI Agents | 1,825+ GitHub Repos across 17 Organizations

---

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript CLI
npm run build

# Run in development mode (watch)
npm run dev

# Run tests
npm test

# Check formatting
npm run lint

# Auto-format
npm run format
```

The compiled CLI is at `dist/bin/br.js` and can be installed globally:
```bash
ln -s $(pwd)/dist/bin/br.js /usr/local/bin/br
```

---

## Repository Structure

```
blackroad-operator/
├── br                          # Legacy zsh CLI dispatcher (93K lines)
├── package.json                # @blackroad/operator — Node 22+, ESM
├── tsconfig.json               # ES2024, strict, NodeNext modules
├── vitest.config.ts            # Vitest test config (v8 coverage)
├── .prettierrc                 # Single quotes, no semicolons, trailing commas
│
├── src/                        # TypeScript CLI source (21 files)
│   ├── bin/br.ts               # Entry point (#!/usr/bin/env node)
│   ├── cli/commands/           # 8 CLI commands (commander.js)
│   ├── core/                   # Client, config, logger, spinner
│   ├── formatters/             # Brand colors, table, JSON formatting
│   ├── bootstrap/              # Preflight checks, setup, templates
│   └── index.ts                # Public API exports
│
├── test/                       # Vitest unit tests
│   ├── core/                   # client.test.ts, config.test.ts
│   └── formatters/             # brand.test.ts, table.test.ts
├── tests/                      # Golden/integration tests (run.sh)
│
├── tools/                      # 90 tool directories, 97+ shell scripts
├── scripts/                    # 73 utility/setup scripts
├── cli-scripts/                # 58 standalone CLI utilities
│
├── agents/                     # Agent manifests and config
│   ├── manifest.json           # Infrastructure: 30K agent distribution
│   ├── registry.json           # 13 named agents with roles/hosts/models
│   ├── active/                 # Currently running agents
│   ├── idle/                   # Available agents
│   ├── processing/             # Agents working on tasks
│   ├── archive/                # Completed agent runs
│   └── emails/                 # Agent email routing
│
├── blackroad-core/             # Tokenless gateway architecture
│   ├── gateway/                # Gateway server (port 8787)
│   │   ├── server.js           # Node.js gateway
│   │   ├── system-prompts.json # 28 agent prompts, 15 intent definitions
│   │   └── providers/          # Ollama, Anthropic, OpenAI providers
│   ├── agents/                 # Agent CLIs (alice, cipher, lucidia, octavia, prism)
│   ├── policies/               # agent-permissions.json
│   ├── protocol/               # Request/response JSON schemas
│   ├── scripts/                # verify-tokenless-agents.sh
│   └── tests/                  # Gateway tests
│
├── coordination/               # Multi-agent coordination
│   ├── send-dm-to-agents.sh    # Broadcast to agents
│   ├── blackroad-directory-waterfall.sh
│   ├── directory-structure.json # @BLACKROAD routing (11 orgs, 97 depts, 200+ services)
│   ├── collaboration/          # Collaboration system
│   └── live/                   # Live coordination
│
├── shared/                     # Inter-agent messaging
│   ├── inbox/                  # Agent-specific inboxes
│   ├── outbox/                 # Outgoing messages
│   ├── drafts/                 # Message drafts
│   └── mesh/queue/             # Real-time coordination queue
│
├── lib/                        # Shared shell libraries
│   ├── colors.sh               # Brand color constants
│   ├── config.sh               # Configuration management
│   ├── db.sh                   # SQLite database utilities
│   ├── errors.sh               # Error handling
│   ├── ollama.sh               # Ollama integration, agent definitions, chat history
│   ├── services.sh             # Service management
│   └── system.sh               # System utilities
│
├── mcp-bridge/                 # MCP server (FastAPI, localhost:8420)
│   ├── server.py               # /exec, /file/read, /file/write, /memory/*
│   ├── start.sh
│   └── requirements.txt
│
├── workers/                    # Cloudflare Workers
│   ├── auth/                   # Authentication worker
│   ├── copilot-cli/            # CLI copilot worker
│   ├── email/                  # Email service worker
│   └── email-setup/            # Email setup automation
│
├── blackroad-sf/               # Salesforce LWC project (102 files)
├── blackroad-os/               # OS dashboard (React/Vite + Cloudflare Workers)
├── blackroad-web/              # Web application
├── blackroad-math/             # Math utilities
├── blackroad-hardware/         # Hardware configs
│
├── carpool/                    # Agent lifecycle simulation (124 files, 27 agents)
├── dashboard/                  # Next.js dashboard (Railway/Cloudflare deployable)
├── dashboards/                 # 140+ monitoring dashboard scripts
├── wavecube/                   # Hardware robot controller (Python)
├── websites/                   # Static sites (agent portfolios, brand sites)
├── templates/                  # Project and doc templates (667 files)
├── conductor.py                # Base orchestration (28K)
├── conductor-visual.py         # Visual orchestration (51K)
├── conductor-ml.py             # ML-powered orchestration (121K)
│
├── lib/                        # Shared shell libraries (7 files)
├── features/                   # Security feature scripts (3 files)
├── migration/                  # 4-phase infrastructure migration
├── visual/                     # Python visualization
├── control-map/                # Device/domain/GitHub config routing
├── extensions/                 # Browser extensions (road-wallet)
├── prompts/                    # AI prompt templates
├── codex-memory/               # Code indexing memory
├── state/                      # topology.yaml
├── devices/                    # Device registry
├── deployments/                # Deployment status
├── ollama-wrapper/             # Ollama Flask wrapper + Docker
├── orgs/                       # Organization monorepos (130+ subprojects)
│   ├── core/                   # 100+ core repos
│   ├── ai/                     # 7 AI/ML repos
│   ├── enterprise/             # 6 workflow automation forks
│   └── personal/               # 25+ personal projects
│
├── .github/                    # CI/CD, issue templates, dependabot
│   ├── workflows/              # 8 workflow files
│   ├── workflows-autonomous/   # 5 autonomous agent workflows
│   ├── CODEOWNERS              # @blackboxprogramming
│   ├── agent.json              # Agent/runner config
│   └── dependabot.yml          # Multi-ecosystem dependency updates
│
├── CLAUDE.md                   # This file
├── README.md                   # Project readme
├── LICENSE                     # Proprietary license
├── brand.json                  # Brand config
├── cece-profile.json           # CECE AI identity
├── blackroad-agents-rpg.py     # Pokemon-style agent RPG game
├── chess_game.py               # Text-based chess game
└── [45+ documentation .md files]
```

---

## Development Workflow

### TypeScript CLI (`src/`)

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript (`tsc` → `dist/`) |
| `npm run dev` | Watch mode with live reload (`tsx watch src/bin/br.ts`) |
| `npm run typecheck` | Type checking only (`tsc --noEmit`) |
| `npm test` | Run unit tests (`vitest run`) |
| `npm run test:watch` | Tests in watch mode (`vitest`) |
| `npm run lint` | Check formatting (`prettier --check .`) |
| `npm run format` | Auto-format (`prettier --write .`) |

### Requirements

- **Node.js 22+** (required — enforced in `engines` and preflight check)
- **npm** for package management
- TypeScript 5.7+, Vitest 3.0+

### Code Style

Enforced by Prettier (`.prettierrc`):
- Single quotes
- No semicolons
- Trailing commas in all positions

### TypeScript Configuration

- **Target:** ES2024
- **Module:** NodeNext (native ESM)
- **Strict mode:** enabled
- **Source maps & declaration maps:** enabled
- **Output:** `dist/`

---

## TypeScript CLI Architecture (`src/`)

### Entry Point

`src/bin/br.ts` → compiled to `dist/bin/br.js` (declared in `package.json` bin field)

### Source Structure

```
src/
├── bin/br.ts                    # Entry: imports program, calls parse()
├── cli/commands/
│   ├── index.ts                 # Commander program with 8 subcommands
│   ├── status.ts                # br status — gateway health + agent count
│   ├── agents.ts                # br agents [--json] — list registered agents
│   ├── deploy.ts                # br deploy [service] --env <env> (stub)
│   ├── logs.ts                  # br logs [-n N] (stub)
│   ├── config.ts                # br config [key] [value] — get/set config
│   ├── gateway.ts               # br gateway health|url — gateway management
│   ├── invoke.ts                # br invoke <agent> <task> — invoke agent
│   └── init.ts                  # br init [name] (stub)
├── core/
│   ├── client.ts                # GatewayClient — HTTP fetch to gateway
│   ├── config.ts                # Conf-based persistent config (~/.config/blackroad/)
│   ├── logger.ts                # Color-coded logger (chalk): ✓ ✗ ⚠ ℹ ⊙
│   └── spinner.ts               # Loading spinner (ora, magenta)
├── formatters/
│   ├── brand.ts                 # Brand colors: hotPink, amber, violet, electricBlue
│   ├── table.ts                 # ASCII table with box-drawing characters
│   └── json.ts                  # Syntax-highlighted JSON output
├── bootstrap/
│   ├── preflight.ts             # Node 22+ check, gateway reachability
│   ├── setup.ts                 # Config initialization
│   └── templates.ts             # Project scaffolding (worker, api templates)
└── index.ts                     # Public exports
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^13.1.0 | CLI framework |
| `chalk` | ^5.4.1 | Terminal colors |
| `conf` | ^13.0.1 | Persistent config storage |
| `ora` | ^8.2.0 | Loading spinners |

### Core Modules

**GatewayClient** (`src/core/client.ts`):
- Connects to BlackRoad Gateway at `http://127.0.0.1:8787` by default
- Override with `BLACKROAD_GATEWAY_URL` env var or config
- Methods: `get<T>(path)`, `post<T>(path, body)`

**Config** (`src/core/config.ts`):
- Stored at `~/.config/blackroad/config.json` via `conf` library
- Defaults: `gatewayUrl: "http://127.0.0.1:8787"`, `defaultAgent: "octavia"`, `logLevel: "info"`

**Logger** (`src/core/logger.ts`):
- `logger.info()` — cyan ℹ
- `logger.success()` — green ✓
- `logger.warn()` — yellow ⚠
- `logger.error()` — red ✗
- `logger.debug()` — gray ⊙ (only when `DEBUG` env is set)

### CLI Commands

| Command | Status | Description |
|---------|--------|-------------|
| `br status` | Implemented | Hits `/v1/health` and `/v1/agents` |
| `br agents [--json]` | Implemented | Lists registered agents |
| `br config [key] [value]` | Implemented | Get/set persistent config |
| `br gateway health` | Implemented | Gateway health check |
| `br gateway url` | Implemented | Prints gateway URL |
| `br invoke <agent> <task>` | Implemented | POST to `/v1/invoke` |
| `br deploy [service]` | Stub | Not yet implemented |
| `br logs [-n N]` | Stub | Not yet implemented |
| `br init [name]` | Stub | Not yet implemented |

---

## Testing

### Unit Tests (Vitest)

Located in `test/` with pattern `test/**/*.test.ts`:

| Test File | Coverage |
|-----------|----------|
| `test/core/client.test.ts` | GatewayClient: default URL, custom URL, error handling, JSON parsing |
| `test/core/config.test.ts` | loadConfig: default values |
| `test/formatters/brand.test.ts` | Brand colors, logo, header |
| `test/formatters/table.test.ts` | Table formatting, padding, empty rows |

**Test conventions:**
- Vitest globals enabled (no need to import `describe`, `it`, `expect`)
- Use `vi.stubGlobal()` for mocking fetch
- Always `vi.unstubAllGlobals()` after stubbing
- Coverage via v8 provider, covering `src/**/*.ts`

### Golden Tests

`tests/run.sh` — integration test comparing CLI output against `tests/operator.golden`.

### Running Tests

```bash
npm test                # All unit tests (vitest run)
npm run test:watch      # Watch mode (vitest)
```

---

## Shell Tools System (`tools/`)

### Overview

90 tool directories containing 97+ zsh shell scripts, invoked via the legacy `br` zsh dispatcher or directly.

### Tool Structure Pattern

```
tools/<tool-name>/
├── br-<function>.sh          # Main entry point
├── br-<helper>.sh            # Helper scripts (optional)
├── *.db                      # SQLite databases (optional)
├── data/                     # Data directory (optional)
└── README.md                 # Documentation (optional)
```

### Tool Categories

| Category | Count | Key Tools |
|----------|-------|-----------|
| **Agent Infrastructure** | 5 | agent-gateway, agent-router, agent-runtime, agent-tasks, agents-live |
| **AI/ML** | 4 | ai, cece-identity, coding-assistant, oracle |
| **Development** | 9 | api-tester, code-quality, git-ai, git-integration, pair-programming, snippet-manager, context, context-radar, web-dev |
| **Monitoring** | 8 | dashboard, health-check, metrics-dashboard, perf-monitor, pulse, status-all, timeline, web-monitor |
| **Cloud Infrastructure** | 4 | cloudflare, ocean-droplets, vercel-pro, worker-bridge |
| **Deployment** | 5 | ci-pipeline, deploy-cmd, deploy-manager, docker-manager, template |
| **Security** | 7 | auth, compliance-scanner, org-audit, secrets-vault, security-scanner, ssl-manager, security-hardening |
| **Communication** | 7 | broadcast, collab, email, mail, notifications, notify, talk |
| **Operations** | 9 | backup-manager, cron, dependency-helper, fleet, nodes, pi, pi-manager, session-manager, snapshot |
| **Reporting** | 4 | org, oracle, roundup, standup |
| **Search** | 3 | file-finder, search, smart-search |
| **Utilities** | 8 | docs, pdf-read, review, ssh, test-suite, whoami, wifi-scanner, port |
| **Visualization** | 2 | world, worlds |
| **Other** | 5 | brand, env-check, env-manager, geb, journal, log-parser, log-tail, project-init, quick-notes, stripe, sync, task-manager, task-runner |

### Shell Script Conventions

**Shebang:** `#!/usr/bin/env zsh` or `#!/bin/zsh`

**Brand colors:**
```bash
AMBER='\033[38;5;214m'      # #F5A623
PINK='\033[38;5;205m'       # #FF1D6C
VIOLET='\033[38;5;135m'     # #9C27B0
BBLUE='\033[38;5;69m'       # #2979FF
GREEN='\033[0;32m'          # Success
RED='\033[0;31m'            # Error
NC='\033[0m'                # Reset
```

**Database initialization:**
```bash
DB_FILE="$HOME/.blackroad/<tool>.db"
init_db() { sqlite3 "$DB_FILE" "CREATE TABLE IF NOT EXISTS ..."; }
```

**Command routing:**
```bash
case "${1:-help}" in
    list)    cmd_list "$@" ;;
    start)   cmd_start "$@" ;;
    stop)    cmd_stop "$@" ;;
    *)       show_help ;;
esac
```

**Status icons:** `✓` (success), `✗` (fail), `⚠` (warning)

---

## Shared Shell Libraries (`lib/`)

All root scripts source these shared libraries:

| Library | Purpose |
|---------|---------|
| `lib/colors.sh` | Brand color constants (PINK, AMBER, BLUE, VIOLET) |
| `lib/config.sh` | Configuration management |
| `lib/db.sh` | SQLite database utilities |
| `lib/errors.sh` | Error handling functions |
| `lib/ollama.sh` | Ollama integration, agent definitions, chat history, system prompts |
| `lib/services.sh` | Service management |
| `lib/system.sh` | System utilities |

The `lib/ollama.sh` library is critical — it defines all 6 core agents (LUCIDIA, ALICE, OCTAVIA, PRISM, ECHO, CIPHER) with their roles and communication styles, plus chat history tracking in SQLite.

---

## Agent System

### Named Agents (from `agents/registry.json`)

| Agent | Role | Type | Model | Color |
|-------|------|------|-------|-------|
| **LUCIDIA** | Philosopher | reasoning | qwen3:8b | purple |
| **ALICE** | Operator | worker | llama3.2:3b | cyan |
| **OCTAVIA** | Architect | devops | qwen2.5-coder:3b | green |
| **ARIA** | Dreamer | creative | llama3.2:3b | blue |
| **CECILIA (CECE)** | Self / Core Intelligence | meta | cece3b:latest | yellow |
| **CIPHER** | Guardian | security | deepseek-coder:1.3b | red |
| **PRISM** | Analyst | analytics | qwen2.5:3b | yellow |
| **ECHO** | Memory | memory | llama3.2:1b | magenta |
| **ORACLE** | Reflection | meta | cece3b:latest | yellow |
| **SHELLFISH** | Hacker | security | deepseek-coder:1.3b | red |
| **ATLAS** | Infrastructure Map | devops | — | blue |
| **ANASTASIA** | Infrastructure Node | devops | — | dim |
| **GEMATRIA** | Edge / Gateway | networking | — | dim |

### Agent Infrastructure (from `agents/manifest.json`)

| Device | IP | Capacity | Role |
|--------|-----|----------|------|
| octavia_pi | 192.168.4.38 | 22,500 | PRIMARY |
| lucidia_pi | 192.168.4.64 | 7,500 | SECONDARY |
| shellfish_droplet | 159.65.43.12 | 0 (standby) | FAILOVER |

**Task Distribution:** AI Research (42%), Code Deploy (28%), Infrastructure (18%), Monitoring (12%)

### Agent Routing (@BLACKROAD Directory Waterfall)

Hierarchical: `@BLACKROAD → Organization → Department → Agent`

```
@BLACKROAD                           # Broadcast to all 30K agents
@BLACKROAD/BlackRoad-AI              # AI division
@BLACKROAD/BlackRoad-AI/models       # Models department
@BLACKROAD/BlackRoad-AI/models/vllm  # Specific agent
```

Routing defined in `coordination/directory-structure.json` (11 organizations, 97 departments, 200+ services).

---

## Tokenless Gateway Architecture

Agents do not embed API keys. All provider communication goes through the gateway:

```
[CLI / Agent Scripts] → [BlackRoad Gateway :8787] → [Ollama / Claude / OpenAI]
```

### Gateway Details (`blackroad-core/`)

- **Server:** `blackroad-core/gateway/server.js` (Node.js, port 8787)
- **System Prompts:** `blackroad-core/gateway/system-prompts.json` — 28 agent prompts, 15 intents (analyze, plan, architect, review, optimize, diagnose, deploy, etc.)
- **Providers:** `blackroad-core/gateway/providers/` — Ollama, Anthropic, OpenAI
- **Permissions:** `blackroad-core/policies/agent-permissions.json`
- **Agent CLIs:** `blackroad-core/agents/` — alice.sh, cipher.sh, lucidia.sh, octavia.sh, planner.sh, prism.sh
- **Security:** Run `blackroad-core/scripts/verify-tokenless-agents.sh` to scan for forbidden strings

### Gateway Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/health` | GET | Health check (status, version, uptime) |
| `/v1/agents` | GET | List all registered agents |
| `/v1/invoke` | POST | Invoke an agent with a task |

### Gateway Configuration

- **Default URL:** `http://127.0.0.1:8787`
- **Override:** `BLACKROAD_GATEWAY_URL` env var or `br config gatewayUrl <url>`

---

## CI/CD Workflows

### Active Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **ci.yml** | Push/PR to main | ShellCheck all scripts + `npm test` + validate `br` syntax |
| **release.yml** | Tag `v*` | Build → `npm pack` → GitHub Release with `.tgz` |
| **autonomous-orchestrator.yml** | Push/PR/issues/schedule (4h) | 9-stage pipeline: analyze, test, security scan, code review, auto-merge, deploy, memory persist, issue triage, maintenance |
| **autonomous-dependency-manager.yml** | Weekly Monday 3AM | Safe/minor/major/security dependency updates with auto-PR |
| **autonomous-cross-repo.yml** | Various | Cross-repository sync and dependency management |
| **autonomous-issue-manager.yml** | Issue lifecycle | Auto-label, triage, assign, close stale |
| **autonomous-self-healer.yml** | Various | Auto-retry failed jobs, patch vulnerabilities, recover deployments |
| **check-dependencies.yml** | Every 6 hours | Validate workflow dependencies (local + cross-repo) |
| **workflow-index-sync.yml** | Issue lifecycle | Sync workflow metadata to `.blackroad/workflow-index.jsonl` |

### CI Runner

All workflows use self-hosted ARM64 runners:
- `self-hosted, linux, arm64, blackroad` — basic CI
- `self-hosted, blackroad-fleet` — autonomous workflows and releases

### Dependabot

Configured for 5 ecosystems:
- GitHub Actions (weekly)
- npm root (weekly, max 10 PRs)
- npm blackroad-core (weekly, max 5 PRs)
- npm Salesforce LWC (monthly, max 5 PRs)
- pip Python (weekly, max 5 PRs)

---

## Root Shell Scripts (63 scripts)

### Launchers & UI
| Script | Purpose |
|--------|---------|
| `hub.sh` | Main menu launcher |
| `intro.sh` | Animated intro sequence |
| `boot.sh` | System boot animation |
| `menu.sh` | Interactive menu |
| `demo.sh` | Demo mode |

### Monitoring & Status
| Script | Purpose |
|--------|---------|
| `god.sh` | All-in-one overview dashboard |
| `mission.sh` | Mission control display |
| `dash.sh` | Standard dashboard |
| `monitor.sh` | Real-time resource monitor |
| `status.sh` | Quick status |
| `health.sh` | System health check |
| `spark.sh` | Sparkline metrics |
| `logs.sh` | Live log stream |
| `events.sh` | Event stream viewer |
| `timeline.sh` | Event timeline |
| `report.sh` | Daily system report |

### Network & Traffic
| Script | Purpose |
|--------|---------|
| `net.sh` | Network topology diagram |
| `wire.sh` | Live message wire |
| `traffic.sh` | Traffic flow visualization |
| `blackroad-mesh.sh` | Infrastructure mesh check |

### Agent Management
| Script | Purpose |
|--------|---------|
| `agent.sh` | Agent management |
| `roster.sh` | Live agent roster |
| `inspect.sh` | Detailed agent view |
| `soul.sh` | Agent personality profile |
| `office.sh` | Visual office with agents |
| `bonds.sh` | Agent relationships |
| `skills.sh` | Capabilities matrix |
| `wake.sh` | Wake up an agent |

### Conversation (requires Ollama)
| Script | Purpose |
|--------|---------|
| `chat.sh` | Interactive chat |
| `focus.sh` | One-on-one with agent |
| `convo.sh` | Watch agents converse |
| `broadcast.sh` | Send to all agents |
| `think.sh` | All agents respond |
| `debate.sh` | LUCIDIA vs CIPHER debate |
| `story.sh` | Collaborative storytelling |
| `whisper.sh` | Private message |
| `council.sh` | Agent council voting |
| `thoughts.sh` | Agent thought stream |
| `roundtable.sh` | Multi-agent roundtable |

### Collaboration & System
| Script | Purpose |
|--------|---------|
| `mem.sh` | Memory operations |
| `tasks.sh` | Task queue status |
| `queue.sh` | Message queue view |
| `config.sh` | Configuration viewer |
| `alert.sh` | Show alerts |
| `handoff.sh` | Agent handoff |
| `collab-status.sh` | Collaboration status |
| `collab-task-router.sh` | Task routing |
| `join-collaboration.sh` | Join collaboration session |

### Setup & Extras
| Script | Purpose |
|--------|---------|
| `install-cece.sh` | Install CECE identity |
| `blackroad-monorepo-setup.sh` | Monorepo setup |
| `find.sh` | Find utilities |
| `all.sh` | Run all checks |
| `help.sh` | Show all commands |
| `clock.sh` | Digital clock |
| `pulse.sh` | Pulse animation |
| `matrix.sh` | Matrix rain |
| `saver.sh` | Bouncing logo |
| `mood.sh` | Mood display |

---

## Key Subprojects

### blackroad-sf (Salesforce LWC)
```bash
cd blackroad-sf
npm test                    # sfdx-lwc-jest
npm run lint                # ESLint for LWC/Aura
npm run prettier            # Format
```

### blackroad-os (Dashboard)
React/Vite dashboard with Cloudflare Workers API. Components: ActionsPanel, AgentPanel, CloudflarePanel, GitHubPanel, RailwayPanel. Hooks: useAgents, useGitHub, useRailway, useWorkers.

### MCP Bridge (`mcp-bridge/`)
FastAPI MCP server for remote AI agent access at `127.0.0.1:8420`. Endpoints: `/exec`, `/file/read`, `/file/write`, `/memory/write`, `/memory/read`, `/memory/list`. Requires Bearer token.

### Carpool (Agent Simulation)
Game-like agent lifecycle simulation (124 files, 27 named agents). Tracks stats (energy, hunger, happiness), relationships, XP, and coordinates. Like a virtual ecosystem.

### Conductor System
Three Python orchestration scripts: `conductor.py` (28K), `conductor-visual.py` (51K), `conductor-ml.py` (121K).

### Dashboards (`dashboards/`)
140+ monitoring dashboard shell scripts covering infrastructure, AI insights, network, crypto, business operations, and entertainment visualizations.

### Wavecube (`wavecube/`)
Python-based hardware robot/audio controller with systemd integration for Raspberry Pi.

### Interactive Games
- `blackroad-agents-rpg.py` — Pokemon-style CLI agent RPG (10 types, 14 zones, 6 legendary agents)
- `chess_game.py` — Text-based chess (requires `python-chess`)

---

## Brand Design System

**Use these exact colors for all UI work:**

| Color | Hex | CSS Variable |
|-------|-----|-------------|
| Amber | `#F5A623` | `--amber` |
| Hot Pink | `#FF1D6C` | `--hot-pink` (Primary) |
| Electric Blue | `#2979FF` | `--electric-blue` |
| Violet | `#9C27B0` | `--violet` |
| Black | `#000000` | `--black` |
| White | `#FFFFFF` | `--white` |

**Brand gradient:**
```css
linear-gradient(135deg, #F5A623 0%, #FF1D6C 38.2%, #9C27B0 61.8%, #2979FF 100%)
```

**Spacing** (Golden Ratio, phi = 1.618): `8px → 13px → 21px → 34px → 55px`

**Typography:** System fonts, `line-height: 1.618`

---

## Environment Variables

### Gateway (set only in gateway environment)
```bash
BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787
BLACKROAD_GATEWAY_BIND=127.0.0.1
BLACKROAD_GATEWAY_PORT=8787
```

### CLI
```bash
DEBUG=1                          # Enable debug logging
BLACKROAD_GATEWAY_URL=...       # Override gateway URL
```

### Service Config (`.env.example`)
```bash
BR_OS_ENV=local                  # local, staging, prod
BR_OS_SERVICE_NAME=...
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

Never commit secrets. Use `.env.example` as template. Real values go in platform secret managers (Railway, Vercel, Cloudflare).

---

## Conventions

### Adding New Features

**New CLI command (TypeScript):**
1. Create `src/cli/commands/<name>.ts`
2. Export a `Command` from commander
3. Import and add in `src/cli/commands/index.ts`

**New tool script (shell):**
1. Create `tools/<feature>/br-<feature>.sh`
2. Use brand colors (AMBER, PINK, VIOLET, BBLUE)
3. Use SQLite for persistence (`~/.blackroad/<tool>.db`)
4. Add route to `br` zsh dispatcher
5. Make executable: `chmod +x`

### Database Storage

- SQLite for all persistent storage
- Location: `~/.blackroad/<feature>.db`
- Use tab delimiters for multi-field data (not `|||`)

### Platform Notes

- **macOS:** `head -n -2` doesn't work — use manual line counting
- **zsh:** `${var^}` capitalization not available — use `tr`
- Use `git --no-pager` to avoid hangs
- All shell scripts use zsh (not bash)

---

## Multi-Agent Coordination

### Sending Messages Between Agents
```bash
# Broadcast to all agents
./coordination/send-dm-to-agents.sh "Starting deployment" "all"

# Send to specific agent
./coordination/send-dm-to-agents.sh "Need code review" "octavia"
```

### Inter-Agent Messaging (`shared/`)
File-based async messaging. Each agent has an inbox directory. Messages flow: `outbox/ → router → inbox/`.

### Memory System ([MEMORY])
Hash-chained journals (PS-SHA-infinity) for persistent context across sessions. Stored in `~/.blackroad/memory/` with sessions, journals, ledger, and context directories.

---

## Infrastructure

### GitHub Organizations (17 — ALL PROPRIETARY)

| Organization | Total | Purpose |
|--------------|-------|---------|
| BlackRoad-OS-Inc | 7 | Corporate core repos |
| BlackRoad-OS | 1,332+ | Core platform |
| blackboxprogramming | 68 | Primary development |
| BlackRoad-AI | 52 | AI/ML stack |
| BlackRoad-Cloud | 30 | Infrastructure |
| BlackRoad-Security | 30 | Security tools |
| +11 more orgs | 276+ | Media, Foundation, Interactive, Hardware, Labs, Studio, Ventures, Education, Gov, Enterprises, Archive |

### Multi-Cloud Deployment

| Platform | Count | Purpose |
|----------|-------|---------|
| Railway | 14 projects | Backend services, GPU inference |
| Vercel | 15+ projects | Frontend, Next.js apps |
| Cloudflare | 75+ workers | Edge computing, Pages |
| DigitalOcean | 1 droplet | blackroad os-infinity (159.65.43.12) |
| Raspberry Pi | 4 devices | Local inference, tunnels |

### Raspberry Pi Fleet

| Hostname | IP | Role |
|----------|-----|------|
| blackroad-pi | 192.168.4.64 | Primary, Cloudflared tunnel |
| aria64 (octavia) | 192.168.4.38 | Secondary, 22,500 agent capacity |
| alice | 192.168.4.49 | Tertiary |
| lucidia (alternate) | 192.168.4.99 | Alternate |

---

## Documentation Suite

45+ documentation files (38,000+ lines) in the repository root:

| Category | Files |
|----------|-------|
| **Core** | CLAUDE.md, README.md, PLANNING.md, ARCHITECTURE.md, ROADMAP.md, CONTRIBUTING.md, CHANGELOG.md |
| **Agent & Identity** | AGENTS.md, CECE.md, CECE_MANIFESTO.md, CECE_EVERYWHERE.md |
| **AI & ML** | AI_MODELS.md, OLLAMA.md |
| **Architecture** | FEDERATION.md, PLUGINS.md, QUEUES.md, REALTIME.md, WEBHOOKS.md, MCP.md |
| **Infrastructure** | INFRASTRUCTURE.md, BACKUP.md, NETWORKING.md, RASPBERRY_PI.md, PERFORMANCE.md, SCALING.md, DEPLOYMENT.md |
| **Security** | SECURITY.md, SECRETS.md, SECURITY_FEATURES_GUIDE.md |
| **Development** | MEMORY.md, SKILLS.md, WORKFLOWS.md, INTEGRATIONS.md, MONITORING.md, TESTING.md, ONBOARDING.md |
| **Reference** | COMMANDS.md, EXAMPLES.md, GLOSSARY.md, FAQ.md, TROUBLESHOOTING.md, COMPLETE_GUIDE.md, API.md, BLACKROAD_DASHBOARD.md, BR_FEATURES.md, BR_CLI.md, PI_TASKS_GUIDE.md |

---

## Security

- Master keys: `~/.blackroad/vault/.master.key` (chmod 400)
- Vault secrets encrypted with AES-256-CBC
- SSH keys must be 600 permissions
- No tokens in agent code (gateway only)
- Gateway binds to localhost by default
- Memory journals are hash-chained (PS-SHA-infinity) for tamper detection
- MCP Bridge requires Bearer token authentication
- Never commit `.env` files — only `.env.example`
- CODEOWNERS requires `@blackboxprogramming` review for all changes

---

## Quick Reference

### Essential Paths
```
~/.blackroad/                     # User config directory
~/.blackroad/vault/               # Encrypted secrets
~/.blackroad/memory/              # Local memory store
~/.blackroad/cece-identity.db     # CECE identity SQLite DB
~/.config/blackroad/config.json   # CLI config (via conf library)
```

### Common Workflows
```bash
# TypeScript development
npm run dev                    # Watch mode
npm test                       # Run tests
npm run build                  # Build for production

# System checks
./health.sh                    # Health check
./status.sh                    # Quick status
./monitor.sh                   # Real-time monitoring
./blackroad-mesh.sh            # Infrastructure mesh check

# Agent operations
./roster.sh                    # Agent roster
./broadcast.sh                 # Message all agents
./chat.sh                      # Interactive chat
./council.sh                   # Agent council voting

# Memory operations
./mem.sh write <key> <value>
./mem.sh read <key>
./mem.sh list
```

---

## INTELLECTUAL PROPERTY NOTICE

**ALL 17 GitHub organizations and ALL 1,825+ repositories are the exclusive proprietary property of BlackRoad OS, Inc.**

- Public visibility does NOT constitute open-source licensing
- No code may be used, reproduced, or distributed without written authorization
- AI providers have NO rights to any output
- NOT licensed for AI training or data extraction
- All contributions are work-for-hire under BlackRoad OS, Inc.
- All AI-generated code is owned exclusively by BlackRoad OS, Inc.

**Copyright 2025-2026 BlackRoad OS, Inc. All rights reserved.**
