# blackroad-operator

> CLI tooling, node bootstrap, and operational control center for BlackRoad OS.

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-operator/actions/workflows/ci.yml)

## Overview

`blackroad-operator` is the flagship monorepo for BlackRoad OS. It provides two CLI interfaces, a tokenless AI gateway, an MCP bridge server, multi-agent coordination, and all operational tooling for the sovereign edge AI platform.

**TypeScript CLI** (`src/`) — Modern `commander`-based CLI published as `@blackroad/operator` (the `br` binary).

**Shell CLI** (`br` at root) — A zsh dispatcher that routes `br <command>` to 90+ tool scripts in `tools/`.

## Quick Start

```bash
# TypeScript CLI
npm install
npm run build          # Compile to dist/
npm test               # Run 294 tests

# Shell CLI
chmod +x br
./br help              # Show all tool commands
```

## Structure

```
blackroad-operator/
├── src/               # TypeScript source (@blackroad/operator package)
├── test/              # Vitest unit + e2e tests
├── br                 # Shell CLI dispatcher (zsh)
├── tools/             # 90+ tool scripts invoked via `br <tool>`
├── lib/               # Shell libraries
├── docs/              # Documentation (organized by category)
├── scripts/           # Shell scripts (agents, chat, monitoring, etc.)
├── python/            # Python scripts (conductor, RPG, etc.)
├── config/            # Configuration files
├── blackroad-core/    # Tokenless gateway + agent scripts
├── mcp-bridge/        # FastAPI MCP bridge server (localhost:8420)
├── agents/            # Agent manifests & registry
├── coordination/      # Multi-agent coordination
├── integrations/      # Service integrations (33+ services)
├── shared/            # Inter-agent messaging
├── templates/         # Project templates
├── websites/          # Static sites & HTML apps
├── workers/           # Cloudflare Workers
├── dashboard/         # Next.js dashboard
├── orgs/              # Organization monorepos
└── blackroad-*/       # Subprojects (web, api, sdk, infra, etc.)
```

## Key Commands

```bash
# TypeScript CLI
br status              # Gateway health + agent list
br agents              # List agents (table or --json)
br invoke              # Invoke agent with a task
br gateway health      # Check gateway status
br config              # View/set configuration
br bottlenecks         # Performance analysis

# Shell CLI
br help                # All 90+ commands
br radar               # Context-aware suggestions
br git                 # Smart git commits
br deploy              # Multi-cloud deploy
br agent               # Agent routing
```

## Architecture

```
[Agent CLIs] --> [Gateway :8787] --> [Ollama / Claude / OpenAI / Gemini]
                       |
                 [MCP Bridge :8420]
                       |
                 [Remote AI Agents]
```

Agents never embed API keys. All LLM provider communication flows through the tokenless gateway.

## Development

```bash
npm run build        # tsc — compile src/ to dist/
npm run dev          # tsx watch — live reload
npm test             # vitest — run all tests
npm run lint         # prettier --check
npm run format       # prettier --write
```

Requires Node.js 22+. See [CLAUDE.md](CLAUDE.md) for full development guide.

## Contributing

See [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md)

---

(c) 2024-2026 BlackRoad OS, Inc. All rights reserved. Proprietary.
