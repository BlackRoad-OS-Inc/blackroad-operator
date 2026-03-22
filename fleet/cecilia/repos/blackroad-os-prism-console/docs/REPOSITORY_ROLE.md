# Repository Role: blackroad-os-prism-console

## Overview

The **blackroad-os-prism-console** repository is the **single-pane-of-glass administrative console** for the entire BlackRoad OS ecosystem. It serves as the primary visual interface for monitoring, managing, and orchestrating agents, environments, deployments, and infrastructure across the BlackRoad OS platform.

## Position in BlackRoad OS Ecosystem

### Primary Organization: BlackRoad-OS

The Prism Console is a core infrastructure component within the **BlackRoad-OS** organization, alongside:

**Core Platform:**
- `blackroad-os-core` - Core platform logic and shared libraries
- `blackroad-os-operator` - Orchestration and automation agent
- `blackroad-os-api` - Main API backend
- `blackroad-os-api-gateway` - API gateway and routing

**Infrastructure:**
- `blackroad-os-agents` - Agent and pack registry
- `blackroad-os-infra` - Infrastructure blueprints and configurations
- **`blackroad-os-prism-console`** ← You are here

**Supporting Repositories:**
- `blackroad-os-web` - Public-facing website
- `blackroad-os-docs` - Documentation hub
- `blackroad-os-archive` - Logs and historical data
- `blackroad-os-research` - Research and experimental features

### Related Business Entities

While Prism Console is in BlackRoad-OS, it may interface with repos from:
- Blackbox-Enterprises
- BlackRoad-AI
- BlackRoad-Gov
- BlackRoad-Hardware
- BlackRoad-Interactive
- BlackRoad-Media
- BlackRoad-Studio
- BlackRoad-Ventures

## Responsibilities

### Core Functions

1. **Agent Monitoring & Management**
   - Display real-time agent health status
   - Show agent capabilities, pack assignments, and last run times
   - Provide agent inspection interface with memory stacks and logic traces
   - Enable hot redeploys and agent swap-outs

2. **Environment Monitoring**
   - Track deployed environments across Railway, Vercel, Cloudflare
   - Monitor readiness endpoints and TLS states
   - Display environment labels and connectivity status
   - Show real-time deployment events

3. **Job & Schedule Tracking**
   - Visualize scheduled jobs and cron tasks
   - Display job execution history
   - Monitor job success/failure rates

4. **Identity & Audit**
   - Track PS-SHA∞ identity headers
   - Display beacon heartbeats
   - Provide audit trails for agent executions
   - Enable audit sidecar view with rewindable history

5. **Lucidia Dashboard**
   - Master interface for Lucidia's runtime mind
   - SIG graph visualizations
   - Interference Engine displays
   - Agent Tree Hierarchy (GEN0/GEN1/etc.)

6. **Infrastructure Control**
   - Railway service management
   - Cloudflare configuration toggles
   - Feature flag controls
   - Environment variable management

## Technical Architecture

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest + React Testing Library
- **Deployment:** Railway, Docker
- **CI/CD:** GitHub Actions

### Key Modules

Per `docs/PRISM_CONSOLE_PROMPT.md`:

- `env-monitor.ts` - Environment tracking and monitoring
- `agent-inspector.tsx` - Agent memory, traces, and SIG traits
- `console-beacon.json` - Health and uptime pulse system
- `lucidia-dashboard.tsx` - Master runtime mind interface

### API Integration

The Prism Console integrates with:
- **BlackRoad OS API Gateway** - Core data and operations
- **Agent Registry** - Agent and pack metadata from `blackroad-os-agents`
- **Infrastructure APIs** - Railway, Cloudflare, etc.

## Domain Configuration

Active domains that may serve Prism Console:
- blackroad.io
- blackroad.systems
- blackroad.network
- blackroadai.com
- blackroadinc.us
- lucidia.earth
- lucidia.studio

Domain configurations are managed in `blackroad-os-infra/domains/domains.yml`.

## Pack System Integration

The Prism Console displays and manages agents from all packs:

- **pack.education** - Education-focused agents
- **pack.infra-devops** - Infrastructure and DevOps agents
- **pack.creator-studio** - Content creation agents
- **pack.finance** - Financial services agents
- **pack.legal** - Legal compliance agents
- **pack.research-lab** - Research and experimental agents

Pack metadata is sourced from `blackroad-os-agents/registry/packs.yml`.

## Agent Registry Integration

The console reads agent data from `blackroad-os-agents/registry/agents.json`:

```json
{
  "id": "agent-id",
  "display_name": "Agent Name",
  "pack_id": "pack.example",
  "role": "Agent role",
  "skills": ["skill1", "skill2"],
  "repos": ["repo1", "repo2"],
  "environments": ["production", "staging"],
  "permissions": {
    "github": "read|write",
    "railway": "read|write",
    "cloudflare": "read"
  },
  "status": "active|inactive|degraded"
}
```

## Deployment & Infrastructure

### Railway Configuration

Configured via `railway.toml` and `railway.json`:
- Service name: prism-console
- Default port: 3000
- Environment variables from `prisma-console.env.example`

### Docker

Dockerfile provides containerized deployment:
- Base: Node.js 20
- Next.js standalone output
- Production-optimized build

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
- Lint, test, and build on all pushes
- Automated deployment via `console-deploy.yaml`

## Data Flow

```
┌─────────────────────────────────────────┐
│   Prism Console (Frontend)              │
│   - Next.js App Router                  │
│   - React Components                    │
│   - Tailwind UI                         │
└──────────────┬──────────────────────────┘
               │
               ├─► Agent Registry API
               │   (blackroad-os-agents)
               │
               ├─► API Gateway
               │   (blackroad-os-api-gateway)
               │
               ├─► Infrastructure APIs
               │   (Railway, Cloudflare)
               │
               └─► Core Platform
                   (blackroad-os-core)
```

## Design Philosophy

From `docs/PRISM_CONSOLE_PROMPT.md`:

> "The visual cortex and master admin terminal of BlackRoad OS"

**Inspirations:**
- OpenAI's internal console
- NASA launch software
- Tron aesthetics
- VS Code interface patterns
- Stardew Valley UI clarity

**Principles:**
- Real-time control over a cognitive civilization
- Every component is observable and inspectable
- Graceful fallback views when data is delayed
- "Do anything from here" - comprehensive control surface

## Development Guidelines

### For Prism Console Changes

1. **Agent Features** - Tag with `type:agent`, `team:prism`
2. **Pack Features** - Tag with `type:pack`, `team:prism`
3. **Infrastructure** - Tag with `type:infra`, `team:prism`, `team:infra`
4. **UI/UX** - Tag with `team:prism`, `team:brand`

### Cross-Repository Coordination

When changes involve multiple repos:

1. **Agent Registry Updates** - Coordinate with `blackroad-os-agents`
2. **API Changes** - Coordinate with `blackroad-os-api` or `blackroad-os-api-gateway`
3. **Infrastructure** - Coordinate with `blackroad-os-infra`
4. **Documentation** - Update `blackroad-os-docs`

## Operational Boundaries

### What Prism Console Does

✅ Visualize and monitor all BlackRoad OS systems
✅ Provide real-time dashboards and interfaces
✅ Enable operator controls and toggles
✅ Display agent health, traces, and audit logs
✅ Manage environment configurations

### What Prism Console Does NOT Do

❌ Execute backend business logic (use `blackroad-os-core` or `blackroad-os-api`)
❌ Store persistent data (use appropriate backend services)
❌ Define agent schemas (use `blackroad-os-agents`)
❌ Manage infrastructure directly (use `blackroad-os-infra`)

## Future Roadmap

From `README.md`:

- [ ] Wire `lib/fetcher.ts` to the BlackRoad OS API Gateway
- [ ] Stream deployment events over `$CORE_HUB/ws`
- [ ] Replace placeholder cards with live environment KPIs
- [ ] Implement Window-in-Window mode for live agent debugging
- [ ] Add scrubbable timeline UI for inference events
- [ ] Create live update map of agent deployments per region

## Contact & Support

- **Primary Team:** `team:prism`
- **Supporting Teams:** `team:web`, `team:infra`, `team:operator`
- **Documentation:** `blackroad-os-docs`
- **Agent Registry:** `blackroad-os-agents`

## References

- [Prism Console Prompt](./PRISM_CONSOLE_PROMPT.md) - UX mission brief
- [Contributing Guide](../CONTRIBUTING.md) - Development guidelines
- [BlackRoad OS Docs](https://github.com/BlackRoad-OS/blackroad-os-docs)
- [Agent Registry](https://github.com/BlackRoad-OS/blackroad-os-agents)
- [Infrastructure](https://github.com/BlackRoad-OS/blackroad-os-infra)

---

**Remember:** The Prism Console is the bridge of the ship - the command surface where all BlackRoad OS operations converge into observable, controllable interfaces.
