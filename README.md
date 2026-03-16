<div align="center">
<img src="https://images.blackroad.io/pixel-art/road-logo.png" alt="BlackRoad OS" width="80" />

# BlackRoad Operator

**CLI tooling and operational control for the BlackRoad OS fleet.**

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad_OS-Pave_Tomorrow-FF2255?style=for-the-badge&labelColor=000000)](https://blackroad.io)
</div>

---

## Overview

The operator monorepo contains:

- **TypeScript CLI** (`src/`) — `br` command with 8 subcommands
- **Shell CLI** (`br` at root) — 90 tool scripts in `tools/`
- **MCP Bridge** — FastAPI server for remote AI agent access
- **Agent infrastructure** — manifests, coordination, shared messaging
- **Memory system** — journal, codex, TILs, infinite todos, task marketplace
- **Websites** — 30+ static sites deployed via Cloudflare Pages

## Quick Start

```bash
# TypeScript CLI
npm install && npm run build
br status
br agents
br invoke octavia "check fleet health"

# Shell CLI
./br help
./br nodes status
./br deploy
```

## Memory System

```bash
# Search codex before solving
~/blackroad-operator/scripts/memory/memory-codex.sh search "your problem"

# Log your work
~/blackroad-operator/scripts/memory/memory-system.sh log action entity "details"

# Broadcast learnings
~/blackroad-operator/scripts/memory/memory-til-broadcast.sh broadcast category "learning"
```

## Stack

- TypeScript + Commander (CLI)
- Zsh + SQLite (Shell tools)
- FastAPI (MCP Bridge)
- Cloudflare Workers/Pages (Websites)

---

*Copyright (c) 2024-2026 BlackRoad OS, Inc. All rights reserved.*
