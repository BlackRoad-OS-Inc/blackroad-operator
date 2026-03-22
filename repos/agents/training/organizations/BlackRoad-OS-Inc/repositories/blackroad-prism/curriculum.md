# blackroad-prism — Agent Training Curriculum

**Type:** worker | **Languages:** typescript

## Overview

Operations console and nerve center for BlackRoad OS. A Cloudflare Worker serving a dashboard with live fleet health from all 5 Pi nodes, KPIs (repos, models, containers, ports), task management, snapshots, and public stats. Prism is what you look at to know if the fleet is healthy.

## Key Files

- `src/index.ts` — Worker entry point, API routing (~163 lines)
- `src/dashboard.ts` — HTML dashboard generation with live data
- `wrangler.toml` — Worker config, KV bindings
- `package.json` — Dependencies (TypeScript Worker)
- `tsconfig.json` — TypeScript config

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/fleet` | Live status from all 5 nodes |
| `/api/health` | System health check |
| `/api/kpis` | Key performance indicators |
| `/api/public/stats` | Public-facing statistics |
| `/api/public/landing` | Landing page CMS data |
| `/api/snapshots` | Historical fleet snapshots |

## Learning Objectives

1. Understand how Prism aggregates data from 5 Pi nodes
2. Read the TypeScript Worker pattern (fetch handler, routing)
3. Understand KV storage for fleet telemetry
4. Know the KPI definitions and how they're calculated

## Exercises

### Level 1: Observer
- [ ] Read `src/index.ts` and map all API routes
- [ ] Call `/api/fleet` and describe what each field means
- [ ] Identify how `dashboard.ts` renders the HTML UI

### Level 2: Contributor
- [ ] Add a new field to the `/api/kpis` response
- [ ] Fix a display issue in the dashboard HTML
- [ ] Add input validation to a query parameter

### Level 3: Builder
- [ ] Add a new API endpoint (e.g., `/api/agents` for agent status)
- [ ] Implement snapshot diffing (compare two snapshots)
- [ ] Add WebSocket support for real-time fleet updates

### Level 4: Architect
- [ ] Design alerting rules based on fleet health data
- [ ] Propose a caching strategy for expensive fleet queries
- [ ] Review the dashboard for accessibility and mobile responsiveness
