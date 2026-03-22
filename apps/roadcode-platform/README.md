# RoadCode Platform

Sovereign Git + control plane for BlackRoad OS.

RoadCode is a forked Gitea with registry, search, audit, mirror, and policy modules. It is the nervous system that answers "what exists, where, who owns it, what serves it" across the entire BlackRoad enterprise.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services (requires Docker)
make up

# Start in dev mode (hot reload)
make dev

# Run tests
make test

# Seed registries
make seed
```

## Architecture

```
roadcode-platform/
├── apps/           # Deployable web UIs (prism, explorer)
├── services/       # Backend services (registry, search, audit, mirror, policy)
├── packages/       # Shared libraries (types, sdk, db, config, logger)
├── infra/          # Docker, systemd, Caddy, nginx configs
├── registries/     # Canonical JSON registry data (source of truth)
├── docs/           # Architecture docs + ADRs
├── scripts/        # Dev + ops scripts
└── tests/          # Integration + e2e tests
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Gitea (core) | :3100 / :2222 | Git hosting, code browser, issues, CI/CD |
| Registry | :3101 | Org/repo/domain/agent/node/service catalog |
| Search | :3102 | FTS5 full-text search + entity graph |
| Audit | :3103 | Audit events, hash chain, deploy log |
| Mirror | cron | Bidirectional Gitea ↔ GitHub sync |
| Policy | cron | Naming, license, scope, health validation |

## Dependency Rules

```
packages ← services ← apps
```

- Packages depend on nothing internal
- Services depend on packages only, communicate via HTTP
- Apps depend on packages and consume service APIs

## Subdomains

| Subdomain | Service |
|-----------|---------|
| code.blackroad.io | Gitea (:3100) |
| api.blackroad.io/road/v1/* | Registry (:3101) |
| search.blackroad.io | Search (:3102) |
| audit.blackroad.io | Audit (:3103) |
| prism.blackroad.io | Prism (separate) |

## License

BlackRoad OS — Proprietary. All rights reserved.
