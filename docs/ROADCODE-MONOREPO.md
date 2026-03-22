# RoadCode Platform — Monorepo Structure
> The buildable filesystem layout for the RoadCode sovereign control plane.
> Last updated: 2026-03-21

## A. Final Top-Level Tree

```
roadcode-platform/
│
├── apps/                         # Deployable web applications
│   ├── git-ui/                   # Gitea web UI (forked, themed)
│   ├── prism/                    # Dashboard / control interface
│   └── explorer/                 # Entity browser (search + graph)
│
├── services/                     # Backend services (each = one container)
│   ├── registry/                 # Registry API (:3101)
│   ├── search/                   # FTS5 discovery (:3102)
│   ├── audit/                    # Audit event collector (:3103)
│   ├── mirror/                   # GitHub ↔ Gitea sync (cron worker)
│   └── policy/                   # Governance validation (cron worker)
│
├── packages/                     # Shared internal libraries
│   ├── types/                    # Shared TypeScript types
│   ├── sdk/                      # RoadCode client SDK
│   ├── db/                       # Database client + migrations
│   ├── config/                   # Shared config loader
│   └── logger/                   # Structured logging
│
├── infra/                        # Infrastructure definitions
│   ├── docker/                   # Dockerfiles + docker-compose
│   ├── systemd/                  # systemd unit files for Pi deployment
│   ├── caddy/                    # Caddyfile for edge routing
│   ├── nginx/                    # nginx configs (Alice/Lucidia)
│   └── scripts/                  # Deploy, backup, restore scripts
│
├── registries/                   # Canonical registry data (JSON)
│   ├── orgs.json                 # All 16 orgs
│   ├── repos.json                # All repos across all orgs
│   ├── domains.json              # All 19 domains
│   ├── agents.json               # All agents
│   ├── nodes.json                # All Pi/DO nodes
│   └── services.json             # All running services
│
├── docs/                         # Architecture + decisions
│   ├── architecture/             # Architecture docs
│   │   ├── org-constitution.md   # Org hierarchy + roles
│   │   ├── roadcode-standard.md  # 3-layer definition
│   │   └── module-map.md         # Module ownership
│   ├── adr/                      # Architecture Decision Records
│   │   ├── 001-gitea-fork.md
│   │   ├── 002-registry-json.md
│   │   ├── 003-sqlite-over-pg.md
│   │   └── template.md
│   └── api/                      # API documentation
│       └── openapi.yaml          # OpenAPI spec for /road/v1/*
│
├── scripts/                      # Dev + ops scripts
│   ├── setup.sh                  # First-time setup
│   ├── dev.sh                    # Start all services locally
│   ├── seed.sh                   # Seed registries from JSON
│   ├── sync-registries.sh        # Pull registries from GitHub
│   ├── validate.sh               # Run all policy checks
│   └── migrate.sh                # Database migrations
│
├── tests/                        # Integration + e2e tests
│   ├── registry/                 # Registry API tests
│   ├── search/                   # Search index tests
│   ├── audit/                    # Audit chain tests
│   ├── mirror/                   # Mirror sync tests
│   └── e2e/                      # End-to-end flows
│
├── .github/                      # GitHub workflows (mirror)
│   └── workflows/
│       ├── ci.yml                # Lint + test on PR
│       ├── deploy.yml            # Deploy to Octavia
│       └── sync-registries.yml   # Push registry changes
│
├── README.md                     # Project overview
├── package.json                  # Root package.json (workspace)
├── pnpm-workspace.yaml           # Workspace definition
├── turbo.json                    # Task runner config
├── docker-compose.yml            # Full stack compose
├── docker-compose.dev.yml        # Dev overrides
├── .env.example                  # Environment template
├── .gitignore
├── LICENSE                       # BlackRoad OS proprietary
└── CLAUDE.md                     # Agent instructions
```

## B. Module Descriptions

### apps/

Deployable web applications with their own build step. Each produces a static bundle or server process.

| App | Purpose | Tech | Port/Deploy |
|-----|---------|------|-------------|
| `git-ui/` | Gitea web UI, forked and themed with BlackRoad brand | Go (Gitea) + templates | :3100 (part of Gitea container) |
| `prism/` | Dashboard: org overview, agent status, deploy log, health | Node + vanilla JS | :8787 or static on Caddy |
| `explorer/` | Entity browser: search bar + graph visualization | Node + vanilla JS | :3102 (served by search service) |

**What belongs here:** UI code, templates, styles, client-side scripts, build configs.
**What must NOT be here:** Backend logic, database queries, API implementations, registry data.

### services/

Backend processes. Each one owns a port or runs as a cron worker. Each has its own Dockerfile.

| Service | Purpose | Runtime | Port | Container |
|---------|---------|---------|------|-----------|
| `registry/` | Registry CRUD API for orgs, repos, domains, agents, nodes, services | Node (Express) | :3101 | `roadcode-registry` |
| `search/` | FTS5 search index + graph queries + explorer UI | Node (Express) | :3102 | `roadcode-search` |
| `audit/` | Audit event collector, hash chain, deploy log | Node (Express) | :3103 | `roadcode-audit` |
| `mirror/` | Bidirectional Gitea ↔ GitHub sync | Node (script) | — (cron) | `roadcode-mirror` |
| `policy/` | Naming, license, scope, health validation | Node (script) | — (cron) | `roadcode-policy` |

**What belongs here:** API routes, business logic, database access, cron jobs.
**What must NOT be here:** UI code, shared types (use packages/), infrastructure configs, registry JSON data.

**Each service has this internal structure:**
```
services/{name}/
├── src/
│   ├── index.js              # Entry point
│   ├── routes.js             # API routes (if HTTP service)
│   ├── handlers/             # Request handlers
│   ├── db.js                 # Database access
│   └── utils.js              # Service-specific utilities
├── Dockerfile
├── package.json
├── README.md
└── .env.example
```

### packages/

Shared internal libraries consumed by services and apps. No standalone deploy.

| Package | Purpose | Consumed By |
|---------|---------|-------------|
| `types/` | Shared TypeScript/JSDoc type definitions for org, repo, domain, agent, node, service | All services + apps |
| `sdk/` | RoadCode client SDK — wraps `/road/v1/*` API calls | Apps, external consumers, agents |
| `db/` | Database client (SQLite via better-sqlite3), migrations, schema | Registry, search, audit services |
| `config/` | Shared config loader (reads env, validates, provides defaults) | All services |
| `logger/` | Structured JSON logging with request IDs | All services |

**What belongs here:** Reusable code imported by 2+ services/apps.
**What must NOT be here:** Business logic, API routes, UI components, one-off utilities. If only one service uses it, it stays in that service.

**Each package has this internal structure:**
```
packages/{name}/
├── src/
│   └── index.js              # Main export
├── package.json              # name: @roadcode/{name}
└── README.md
```

### infra/

Infrastructure definitions. No application logic. Describes HOW things deploy, not WHAT they do.

| Directory | Purpose |
|-----------|---------|
| `docker/` | Per-service Dockerfiles (if not co-located), base images |
| `systemd/` | `.service` files for Pi deployment without Docker |
| `caddy/` | Caddyfile for Gematria edge (subdomain → WireGuard → Octavia) |
| `nginx/` | nginx configs for Alice/Lucidia reverse proxy |
| `scripts/` | Deploy, backup, restore, rotate scripts |

**What belongs here:** Dockerfiles, compose overrides, reverse proxy configs, deploy scripts.
**What must NOT be here:** Application code, environment variables with real values, secrets.

### registries/

The canonical JSON registry files. These are the **source of truth** for the entire enterprise.

They live here in the monorepo AND are mirrored to `BlackRoad-OS-Inc/RoadCode/registries/` on GitHub.

The registry service (:3101) loads these on startup and syncs them into SQLite.

```jsonc
// registries/orgs.json
[
  {
    "name": "BlackRoad-OS-Inc",
    "tier": 0,
    "purpose": "Canonical registry of all organizations, repos, domains, agents, and corporate metadata",
    "owner": "alexa",
    "domains": ["blackroad.io", "blackroadinc.us"],
    "github": "https://github.com/BlackRoad-OS-Inc"
  }
  // ... 15 more orgs
]
```

```jsonc
// registries/domains.json
[
  {
    "domain": "blackroad.io",
    "org": "BlackRoad-OS-Inc",
    "purpose": "Master index — front door to everything",
    "infra": "cloudflare",
    "status": "live"
  }
  // ... 18 more domains
]
```

**What belongs here:** JSON registry data only.
**What must NOT be here:** Code, scripts, configs, documentation.

### docs/

Architecture documents, ADRs, and API specs.

**What belongs here:** Decisions, rationale, specs, diagrams.
**What must NOT be here:** READMEs for individual services (those go in the service dir), user guides, marketing.

### scripts/

Developer and operator scripts. Thin wrappers, not business logic.

**What belongs here:** Shell scripts for setup, dev workflow, seeding, validation.
**What must NOT be here:** Application logic, long-running services, complex Python/Node programs.

### tests/

Integration and e2e tests that span multiple services.

**What belongs here:** Tests that require multiple services running. Cross-service contract tests.
**What must NOT be here:** Unit tests (those go inside each service/package). Test utilities (those go in packages/).

## C. Dependency Direction Rules

```
                    ┌──────────┐
                    │ packages │  ← depends on NOTHING (leaf nodes)
                    └─────┬────┘
                          │
                    ┌─────▼────┐
                    │ services │  ← depends on packages ONLY
                    └─────┬────┘
                          │
                    ┌─────▼────┐
                    │   apps   │  ← depends on packages + consumes service APIs
                    └──────────┘

                    ┌──────────┐
                    │  infra   │  ← depends on NOTHING (describes deployment)
                    └──────────┘

                    ┌──────────┐
                    │registries│  ← depends on NOTHING (pure data)
                    └──────────┘
```

**Rules:**
1. `packages/` depend on nothing internal. They may depend on npm packages.
2. `services/` depend on `packages/` only. Services NEVER import from other services. They communicate via HTTP API.
3. `apps/` depend on `packages/` and consume `services/` via HTTP. Apps NEVER import service internals.
4. `infra/` depends on nothing. It describes how to deploy services/apps.
5. `registries/` is pure data. Everything reads it, nothing writes to it (except the human/agent maintaining it).
6. **No circular dependencies.** If service A needs data from service B, it calls B's API. It does not import B's code.
7. **No upward dependencies.** Packages never import from services. Services never import from apps.

## D. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Directories | `kebab-case` | `services/registry/`, `packages/types/` |
| JS files | `kebab-case.js` | `routes.js`, `audit-chain.js` |
| Package names | `@roadcode/{name}` | `@roadcode/types`, `@roadcode/sdk` |
| Service names | `roadcode-{name}` | `roadcode-registry`, `roadcode-search` |
| Container names | `roadcode-{name}` | `roadcode-registry`, `roadcode-audit` |
| Docker images | `roadcode/{name}` | `roadcode/registry:latest` |
| Systemd units | `roadcode-{name}.service` | `roadcode-registry.service` |
| Environment files | `.env.{stage}` | `.env.dev`, `.env.prod` |
| ADR files | `{NNN}-{slug}.md` | `001-gitea-fork.md` |
| API routes | `/road/v1/{resource}` | `/road/v1/orgs`, `/road/v1/agents` |
| NATS subjects | `road.{module}.{action}` | `road.audit.event`, `road.mirror.sync` |

## E. Anti-Pattern Warnings

| Anti-Pattern | Why It's Bad | What To Do Instead |
|---|---|---|
| **Putting UI logic in services/** | Mixes concerns, makes services hard to test | UI in apps/, services return JSON only |
| **Putting business logic in packages/** | Packages become god libraries | Business logic stays in the service that owns it |
| **Service-to-service imports** | Creates tight coupling, breaks container isolation | Services communicate via HTTP API only |
| **Registry JSON in multiple places** | Creates conflicting sources of truth | One copy in registries/, synced to GitHub and loaded by registry service |
| **Shared database between services** | Hides coupling, makes migrations painful | Each service owns its own tables. Share via API. |
| **Scripts that grow into services** | Unmonitored, no health checks, no restart | If it runs continuously, make it a service with a Dockerfile |
| **Apps that bypass services** | Breaks the data flow, creates shadow APIs | Apps call service APIs, never touch DB directly |
| **Tests that require manual setup** | Nobody runs them | scripts/setup.sh must make tests runnable in one command |
| **infra/ containing application code** | Deploy configs become untestable programs | infra/ is declarative configs only |
| **.gitkeep forests** | Makes the repo look full but it's empty | Don't create dirs until they have real files |

## F. Docker Compose (Production)

```yaml
# docker-compose.yml
version: "3.8"

services:
  gitea:
    image: gitea/gitea:latest
    container_name: roadcode-git
    restart: always
    environment:
      - GITEA__database__DB_TYPE=sqlite3
      - GITEA__server__DOMAIN=code.blackroad.io
      - GITEA__server__ROOT_URL=https://code.blackroad.io/
      - GITEA__server__HTTP_PORT=3100
      - GITEA__server__SSH_PORT=2222
      - GITEA__server__SSH_DOMAIN=code.blackroad.io
      - GITEA__service__DISABLE_REGISTRATION=true
      - GITEA__ui__DEFAULT_THEME=gitea-dark
      - GITEA__repository__DEFAULT_BRANCH=main
    volumes:
      - gitea-data:/data
    ports:
      - "3100:3100"
      - "2222:2222"
    networks:
      - roadcode

  registry:
    build: ./services/registry
    container_name: roadcode-registry
    restart: always
    environment:
      - PORT=3101
      - DB_PATH=/data/roadcode.db
      - REGISTRIES_PATH=/registries
    volumes:
      - registry-data:/data
      - ./registries:/registries:ro
    ports:
      - "3101:3101"
    depends_on:
      - gitea
    networks:
      - roadcode

  search:
    build: ./services/search
    container_name: roadcode-search
    restart: always
    environment:
      - PORT=3102
      - DB_PATH=/data/search.db
      - REGISTRY_URL=http://registry:3101
    volumes:
      - search-data:/data
    ports:
      - "3102:3102"
    depends_on:
      - registry
    networks:
      - roadcode

  audit:
    build: ./services/audit
    container_name: roadcode-audit
    restart: always
    environment:
      - PORT=3103
      - DB_PATH=/data/audit.db
      - CHAIN_PATH=/data/chain.log
    volumes:
      - audit-data:/data
    ports:
      - "3103:3103"
    networks:
      - roadcode

  mirror:
    build: ./services/mirror
    container_name: roadcode-mirror
    restart: always
    environment:
      - GITEA_URL=http://gitea:3100
      - GITEA_TOKEN=${GITEA_TOKEN}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - SYNC_INTERVAL=900
    depends_on:
      - gitea
    networks:
      - roadcode

  policy:
    build: ./services/policy
    container_name: roadcode-policy
    restart: always
    environment:
      - REGISTRY_URL=http://registry:3101
      - GITEA_URL=http://gitea:3100
      - CHECK_INTERVAL=3600
    depends_on:
      - registry
    networks:
      - roadcode

volumes:
  gitea-data:
  registry-data:
  search-data:
  audit-data:

networks:
  roadcode:
    driver: bridge
```

## G. Port Allocation (Final)

| Port | Service | Container | Subdomain |
|------|---------|-----------|-----------|
| :2222 | Git SSH | `roadcode-git` | code.blackroad.io |
| :3100 | Gitea HTTP / Git UI | `roadcode-git` | code.blackroad.io |
| :3101 | Registry API | `roadcode-registry` | api.blackroad.io/road/v1/* |
| :3102 | Search + Explorer | `roadcode-search` | search.blackroad.io |
| :3103 | Audit Viewer | `roadcode-audit` | audit.blackroad.io |
| — | Mirror (cron) | `roadcode-mirror` | — |
| — | Policy (cron) | `roadcode-policy` | — |

## H. Caddy Edge Config (Gematria)

```
code.blackroad.io {
    reverse_proxy 10.10.2.3:3100  # Octavia via WireGuard
}

api.blackroad.io {
    handle /road/v1/* {
        reverse_proxy 10.10.2.3:3101
    }
}

search.blackroad.io {
    reverse_proxy 10.10.2.3:3102
}

audit.blackroad.io {
    reverse_proxy 10.10.2.3:3103
}

prism.blackroad.io {
    reverse_proxy 10.10.2.3:8787  # Prism is separate
}
```

## I. Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'services/*'
  - 'apps/*'
```

```jsonc
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## J. Runtime Decision

**Node.js (v20 LTS) for all services.** Reasons:
- Already on Octavia (v20.19.2)
- All existing Workers are JS
- better-sqlite3 works great on ARM64 (Pi 5)
- Express is simple, no framework overhead
- Same language as apps/prism and packages/sdk

**No Go, Rust, Python, Bun, or Deno for RoadCode services.** Keep the stack uniform. Gitea itself is Go but we don't modify Gitea internals — we extend via API and sidecar services.

## K. What This Replaces

| Current State | Target State |
|---|---|
| 16 RoadCode repos with 298-file .gitkeep scaffolds | 16 thin document-only RoadCode repos (constitution + map) |
| Prism code scattered across prism-blackroad + blackroad-os-prism-enterprise | Single `apps/prism/` in the monorepo |
| roadcode-worker + roadcode-squad (CF Workers) | `services/registry/` + `services/search/` in monorepo |
| Gitea running standalone with no extensions | Gitea + 5 sidecar services in docker-compose |
| Registry data nowhere (or scattered in READMEs) | `registries/*.json` — canonical, versioned, synced |
| No search across enterprise | `services/search/` with FTS5 index |
| No audit trail | `services/audit/` with hash chain |
| Manual GitHub ↔ Gitea sync | `services/mirror/` running every 15min |
| No policy enforcement | `services/policy/` validating naming, license, scope |
