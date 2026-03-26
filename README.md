# BlackRoad Operator

The local control plane for BlackRoad OS. This repo runs websites, workflows, Pi fleet operations, health checks, Cloudflare tasks, and Ollama-driven agent automation.

## Start Here

```bash
cd /Users/alexa/blackroad-operator

# Human-first CLI
./br health
./br pi status
./br ai chat

# Ollama-first control plane
./tools/ai/br-ai.sh ops "check the Pi fleet and list available models"
./tools/ai/br-ai.sh autonomous "regenerate public sites and report what changed"

# Shortcuts
./scripts/cli/lucidia-ops fleet
./scripts/cli/lucidia-ops run "check local health and workflow status"
./scripts/cli/ollama-os run "check Pi fleet health and list models"
```

## Main Surfaces

```text
blackroad-operator/
├── br                          # Main CLI entry point
├── tools/ai/br-ai.sh           # Ollama planner and autonomous operator
├── tools/pi-manager/br-pi.sh   # Pi fleet status, worlds, tasks, models
├── tools/deploy-manager/       # Deploy helpers and rollback tooling
├── tools/cloudflare/           # DNS, zones, pages operations
├── websites/                   # Public website sources
├── scripts/generate_public_sites.py
├── .github/ISSUE_TEMPLATE/     # Agent-ready intake forms
└── .github/workflows/          # Autonomous workflow stack
```

## Consumer-Friendly Operator Flow

Use these commands when you want Lucidia to operate the system instead of just chatting:

```bash
./tools/ai/br-ai.sh ops "check the fleet and summarize issues"
./tools/ai/br-ai.sh autonomous "run local health and list GitHub workflows"
./tools/ai/br-ai.sh autonomous "regenerate public sites and summarize the changes"
./tools/ai/br-ai.sh ops "show the latest failed workflow run details"
./tools/ai/br-ai.sh autonomous "run the Autonomous Websites workflow on main"
./tools/ai/br-ai.sh autonomous "purge Cloudflare cache for blackroad.io"
./tools/ai/br-ai.sh autonomous "rerun the previous successful GitHub deploy workflow"
```

The autonomous path is intentionally bounded. It currently routes through safe actions for:

- health checks
- Pi fleet status, models, worlds, logs, and task queueing
- bounded Pi-side generation for operator tasks
- deployment detection, history, GitHub deploy watching, and GitHub rollback/rerun
- Cloudflare zone, DNS, analytics inspection, and cache purge
- workflow listing, recent run inspection, single-run detail inspection, and dispatch for a small allowlisted workflow set
- website regeneration

Allowed workflow dispatches through Lucidia:

- `Connector: Email Digest`
- `Connector: Stripe`
- `Agent: Workflow Sync`
- `Agent: Repo Improver`
- `Check Dependencies`
- `Scrape & Index All Orgs`
- `Autonomous Websites`
- `Agent GitHub Assets`

## GitHub Intake

The issue templates are now agent-first and consumer-friendly:

- `Agent Task`
- `Bug Report`
- `Feature Request`
- `Operations Request`

Blank issues are disabled so work lands in structured forms with autonomy level, tool access, expected outcome, and rollback notes.

## Docs

- See [OLLAMA.md](/Users/alexa/blackroad-operator/OLLAMA.md) for local inference and operator usage.
- See [autonomous-websites.yml](/Users/alexa/blackroad-operator/.github/workflows/autonomous-websites.yml) for website regeneration/deploy automation.
- See [agent-github-assets.yml](/Users/alexa/blackroad-operator/.github/workflows/agent-github-assets.yml) for issue template validation.

© 2026 BlackRoad OS, Inc. Proprietary.
