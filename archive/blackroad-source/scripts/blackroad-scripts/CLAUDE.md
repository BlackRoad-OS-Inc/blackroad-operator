# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is `blackroad-scripts` - the BlackRoad OS home directory containing 400+ shell scripts, Python utilities, and CLI tools that orchestrate a distributed AI infrastructure spanning 15 GitHub orgs, 1,085 repos, 205 Cloudflare projects, and 8 physical devices.

**Global instructions are in `~/.claude/CLAUDE.md` - read that first for infrastructure context.**

## Session Initialization

Every session MUST start with:
```bash
~/claude-session-init.sh
```

This assigns a mythology-inspired agent identity and verifies: `[IDENTITY]` `[MEMORY]` `[LIVE]` `[COLLABORATION]` `[CODEX]` `[TRAFFIC LIGHTS]` `[TODOS]`

## Development Commands

```bash
# Worker development (Cloudflare)
npm run dev                  # Start wrangler dev server
npm run deploy              # Deploy to Cloudflare

# Linting shell scripts
shellcheck ~/script-name.sh  # Lint bash scripts (install: brew install shellcheck)

# Test a script
bash -n ~/script-name.sh     # Syntax check only
bash -x ~/script-name.sh     # Debug mode (trace execution)
```

## Script Architecture

### Naming Conventions
| Prefix | Purpose | Example |
|--------|---------|---------|
| `memory-*.sh` | Memory system operations | `memory-system.sh`, `memory-realtime-context.sh` |
| `claude-*.sh` | Claude agent coordination | `claude-session-init.sh`, `claude-group-chat.sh` |
| `blackroad-*.sh` | Infrastructure tools | `blackroad-agent-registry.sh`, `blackroad-traffic-light.sh` |
| `deploy-*.sh` | Deployment automation | `deploy-bots-everywhere.sh` |
| `add-*.sh` | Batch addition scripts | `add-readmes-to-real-repos.sh` |

### CLI Structure
```
~/bin/
├── blackroad        # Main entry point (alias: br)
├── br-*             # Subcommands (br-stats, br-help, br-menu)
└── ask-*            # Agent queries (ask-alice, ask-lucidia)
```

### Core Databases (SQLite)
```
~/.blackroad-agent-registry.db    # Hardware/AI agents
~/.blackroad-traffic-light.db     # Project status tracking
~/.blackroad/memory/journals/     # PS-SHA-infinity append-only log
~/blackroad-codex/index/components.db  # 22,244 indexed components
```

## Writing Scripts

### Standard Header
```bash
#!/bin/bash
# Description of what this script does
# Usage: ./script-name.sh [args]

set -e  # Exit on error (use for most scripts)
```

### Color Constants (BlackRoad Brand)
```bash
PINK='\033[38;5;205m'   # Hot pink (#FF1D6C)
AMBER='\033[38;5;214m'  # Amber (#F5A623)
BLUE='\033[38;5;69m'    # Electric blue (#2979FF)
VIOLET='\033[38;5;135m' # Violet (#9C27B0)
GREEN='\033[38;5;82m'   # Success
RESET='\033[0m'
```

### Memory Logging Pattern
```bash
# Log significant actions to memory
~/memory-system.sh log "action" "entity" "details" "tags"

# Actions: announce, progress, deployed, created, configured, decided, blocked, fixed, milestone
```

## Key Files

| File | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Global infrastructure instructions |
| `~/BLACKROAD_BRAND_SYSTEM.md` | Design system (colors, spacing) |
| `~/CLAUDE_COLLABORATION_PROTOCOL.md` | Multi-agent coordination |
| `~/MEMORY_CODEX_INTEGRATION.md` | Two-check system guide |

## Pre-Work Checklist

Before ANY work:
1. **[MEMORY]**: `~/memory-realtime-context.sh live $MY_CLAUDE compact`
2. **[CODEX]**: `python3 ~/blackroad-codex-search.py "query"`
3. **[INDEX]**: `~/index-discovery.sh read` (if creating files in indexed repos)

## Common Operations

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy <dir> --project-name=<name>

# GitHub operations
gh repo list BlackRoad-OS --limit 50
gh repo clone BlackRoad-OS/<repo>

# SSH to fleet devices
ssh cecilia    # Primary AI agent (Hailo-8)
ssh lucidia    # AI inference (Pi 5 + Pironman)
ssh alice      # Worker node (Pi 4)

# Traffic light status
~/blackroad-traffic-light.sh summary
~/blackroad-traffic-light.sh set <project> green "Ready"

# Task marketplace
~/memory-task-marketplace.sh list
~/memory-task-marketplace.sh claim <task-id>
```
