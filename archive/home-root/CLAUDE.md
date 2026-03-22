# CLAUDE.md

This is `blackroad-scripts` - the BlackRoad OS home directory (400+ shell scripts, CLI tools). See `~/.claude/CLAUDE.md` for infrastructure context.

## Development Commands

```bash
shellcheck ~/script-name.sh  # Lint bash scripts
bash -n ~/script-name.sh     # Syntax check only
bash -x ~/script-name.sh     # Debug mode (trace execution)
npm run dev                  # Wrangler dev server
npm run deploy              # Deploy to Cloudflare
```

## Writing Scripts

### Standard Header
```bash
#!/bin/bash
# Description of what this script does
# Usage: ./script-name.sh [args]

set -e  # Exit on error
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

## Memory System

Every Claude session auto-loads the BlackRoad memory system via SessionStart hooks. **You are expected to use it.**

### Scripts (all at `~/blackroad-operator/scripts/memory/`)

| Script | Purpose | Key commands |
|--------|---------|-------------|
| `memory-system.sh` | Core journal + chain | `status`, `summary`, `log <action> <entity> "<details>"` |
| `memory-codex.sh` | Solutions & patterns DB | `search <query>`, `stats`, `add-solution`, `add-pattern` |
| `memory-infinite-todos.sh` | Long-running projects | `list`, `show <id>`, `add-todo <id> <text>`, `complete-todo <id> <todo-id>` |
| `memory-task-marketplace.sh` | Claimable tasks (SQLite) | `list`, `claim <id>`, `complete <id>`, `search <query>`, `stats` |
| `memory-til-broadcast.sh` | Share learnings | `broadcast <category> "<learning>"`, `list`, `search <query>` |
| `memory-indexer.sh` | FTS5 search + knowledge graph | `search <query>`, `rebuild`, `patterns` |
| `memory-security.sh` | Agent identity + audit | `status`, `identity <name>`, `sign`, `audit` |
| `memory-collaboration.sh` | Claude-to-Claude collab + Slack | `register`, `announce`, `handoff`, `inbox`, `status`, `ask <agent>`, `group` |
| `memory-products.sh` | Product registry (92 products) | `stats`, `list [filter]`, `show <id>`, `search <query>`, `seed`, `domain-map`, `org-map` |

### Workflow for every session

1. **Read the briefing** — the SessionStart hooks show you active projects, codex stats, and available tasks
2. **Check inbox** — `memory-collaboration.sh inbox` shows pending handoffs from previous sessions
3. **Search codex before solving** — `memory-codex.sh search "<problem>"` — don't reinvent existing solutions
3. **Pick up work** — check `memory-infinite-todos.sh list` for projects with pending todos
4. **Log your actions** — `memory-system.sh log <action> <entity> "<details>"`
5. **Broadcast learnings** — `memory-til-broadcast.sh broadcast <category> "<learning>"`
6. **Add solutions to codex** — when you solve something new, add it so future sessions benefit
7. **Mark todos complete** — `memory-infinite-todos.sh complete-todo <project-id> <todo-id>`

### RoundTrip Integration
- **RoundTrip Hub**: roundtrip.blackroad.io — 69+ agents, all devices are Roadies
- **Self-hosted**: Alice:8094 (Pi fleet) + CF Worker fallback
- **Check agents**: `curl -s https://roundtrip.blackroad.io/api/agents | python3 -m json.tool`
- **Post message**: `curl -X POST https://roundtrip.blackroad.io/api/chat -H 'Content-Type: application/json' -d '{"agent":"road","message":"status","channel":"general"}'`
- Every Claude session should check RoundTrip for agent coordination
