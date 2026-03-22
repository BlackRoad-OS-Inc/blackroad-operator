# RoadCode Platform — Internal Module Architecture

> The exact product/module tree for the RoadCode sovereign control plane.
> Last updated: 2026-03-21

## A. What RoadCode Platform Is

RoadCode Platform is the sovereign Git server + control plane for BlackRoad OS. It is a forked Gitea with BlackRoad-specific modules layered on top. It runs on Octavia (:3100) as the primary origin for all code, registries, and operational metadata.

**It is NOT:**

- A monolithic application server
- A replacement for runtime services (memory, codex, NATS, agents)
- A dashboard (that's Prism)
- A deployment engine (that's the BlackRoad-OS deploy tooling)

## B. Top-Level Module Tree

```
roadcode/
├── core/                     # Gitea fork (sovereign Git)
│   ├── git/                  # Git protocol (SSH :2222, HTTP :3100)
│   ├── auth/                 # Users, orgs, tokens, SSH keys
│   ├── repos/                # Repository hosting, code browser
│   ├── issues/               # Issue tracker
│   ├── actions/              # CI/CD (act_runner on Pi fleet)
│   ├── webhooks/             # Event dispatch on push/PR/issue
│   ├── packages/             # Package registry (npm, containers)
│   └── api/                  # Gitea REST API v1
│
├── registry/                 # BlackRoad registry engine
│   ├── orgs/                 # Organization registry
│   ├── repos/                # Cross-org repo catalog
│   ├── domains/              # Domain → org → infra mapping
│   ├── agents/               # Agent roster + capabilities + status
│   ├── nodes/                # Node inventory (Pis, DOs, cloud)
│   ├── services/             # Running service catalog
│   └── sync/                 # Pull from OS-Inc/RoadCode/registries/*.json
│
├── mirror/                   # Sync engine
│   ├── github/               # Bidirectional Gitea ↔ GitHub mirror
│   ├── downstream/           # Push operator changes → all orgs
│   └── schedule/             # Cron-based sync (every 15min)
│
├── discovery/                # Search + navigation
│   ├── search/               # FTS5 index across repos, agents, services
│   ├── graph/                # Entity graph: org→repo→service→agent→node
│   └── explore/              # Web-based entity explorer
│
├── audit/                    # Ledger + compliance
│   ├── events/               # Structured audit events (who/what/when/where)
│   ├── chain/                # Hash chain for tamper detection
│   ├── deploy-log/           # Deployment lineage: commit → node → domain
│   └── retention/            # Log rotation + archive
│
├── policy/                   # Governance enforcement
│   ├── naming/               # Repo/service/container name validation
│   ├── license/              # Proprietary license presence check
│   ├── scope/                # Repo-in-correct-org validation
│   └── health/               # Org health checks (has RoadCode, has CLAUDE.md, etc.)
│
├── notify/                   # Event routing
│   ├── nats/                 # Publish events to NATS mesh (CarPool)
│   ├── webhook-dispatch/     # Fire webhooks to external consumers
│   └── digest/               # Daily/weekly summary generation
│
└── web/                      # Web interfaces (thin)
    ├── git-ui/               # Gitea native web UI (code browse, issues, PRs)
    └── api-docs/             # OpenAPI documentation
```

**Prism is NOT inside RoadCode.** Prism is a separate service that consumes RoadCode's APIs.

## C. Module Ownership Table

| Module                      | Purpose             | Owns                                       | Must NOT Own                                    | Primary API                                | Primary Data               |
| --------------------------- | ------------------- | ------------------------------------------ | ----------------------------------------------- | ------------------------------------------ | -------------------------- |
| **core/git**                | Git protocol server | SSH+HTTP Git hosting                       | Application deployment                          | `git clone/push/pull`                      | Git objects, refs          |
| **core/auth**               | Identity + access   | Users, orgs, tokens, SSH keys              | Agent identity (that's memory system)           | `POST /api/v1/users`, `/tokens`            | User table, org membership |
| **core/repos**              | Repository hosting  | Code storage, branches, tags               | Repo metadata registry (that's registry/)       | `GET /api/v1/repos/{owner}/{repo}`         | Git repos on disk          |
| **core/issues**             | Issue tracking      | Issues, labels, milestones                 | Project management (that's TODO system)         | `GET /api/v1/repos/{owner}/{repo}/issues`  | Issue table                |
| **core/actions**            | CI/CD               | Workflow execution, runners                | Deployment orchestration                        | `GET /api/v1/repos/{owner}/{repo}/actions` | Workflow runs, logs        |
| **core/webhooks**           | Event dispatch      | Webhook registration + delivery            | Business logic in hooks                         | `POST /api/v1/repos/{owner}/{repo}/hooks`  | Hook configs, delivery log |
| **core/api**                | REST API            | Gitea API surface                          | BlackRoad-specific APIs (those go in registry/) | `/api/v1/*`                                | —                          |
| **registry/orgs**           | Org catalog         | Org metadata: tier, purpose, domains       | Org membership (that's core/auth)               | `GET /road/v1/orgs`                        | `road_orgs` table          |
| **registry/repos**          | Repo catalog        | Cross-org repo listing + purpose           | Code hosting (that's core/repos)                | `GET /road/v1/repos`                       | `road_repos` table         |
| **registry/domains**        | Domain mapping      | Domain → org → infra mapping               | DNS records (that's PowerDNS)                   | `GET /road/v1/domains`                     | `road_domains` table       |
| **registry/agents**         | Agent roster        | Agent name, org, node, capabilities        | Agent runtime/memory (that's memory system)     | `GET /road/v1/agents`                      | `road_agents` table        |
| **registry/nodes**          | Node inventory      | Node hostname, IP, role, services          | Node monitoring (that's InfluxDB/Grafana)       | `GET /road/v1/nodes`                       | `road_nodes` table         |
| **registry/services**       | Service catalog     | Service name, node, port, org              | Service health checks (that's monitoring)       | `GET /road/v1/services`                    | `road_services` table      |
| **registry/sync**           | Registry sync       | Pull registries from OS-Inc/RoadCode       | Writing registries (that's OS-Inc)              | Internal cron                              | —                          |
| **mirror/github**           | Git sync            | Bidirectional Gitea ↔ GitHub               | Code review, PRs                                | Internal cron                              | Mirror state table         |
| **mirror/downstream**       | Org sync            | Push changes to all orgs                   | Per-org customization                           | `POST /road/v1/sync/downstream`            | Sync log                   |
| **discovery/search**        | Full-text search    | FTS5 index across all entities             | Search UI (that's Prism)                        | `GET /road/v1/search?q=`                   | FTS5 SQLite                |
| **discovery/graph**         | Entity graph        | Relationships: org↔repo↔service↔agent↔node | Graph visualization (that's Prism)              | `GET /road/v1/graph/{entity}/{id}`         | Adjacency table            |
| **audit/events**            | Audit log           | Structured events: who/what/when/where     | Alert routing (that's notify/)                  | `GET /road/v1/audit/events`                | `road_audit` table         |
| **audit/chain**             | Hash chain          | Tamper-evident ledger                      | Blockchain consensus                            | Internal                                   | Chain file                 |
| **audit/deploy-log**        | Deploy lineage      | Commit → node → domain mapping             | Deployment execution                            | `GET /road/v1/deploys`                     | `road_deploys` table       |
| **policy/naming**           | Name validation     | Repo/service/container naming rules        | Enforcement (just reports violations)           | `POST /road/v1/policy/validate-name`       | Naming rules config        |
| **policy/license**          | License check       | Proprietary license presence               | License generation                              | `GET /road/v1/policy/license-check/{org}`  | —                          |
| **policy/scope**            | Scope validation    | Repo-in-correct-org check                  | Repo moves (just flags)                         | `GET /road/v1/policy/scope-check/{org}`    | Org scope rules            |
| **policy/health**           | Org health          | Standard files present check               | Remediation (just reports)                      | `GET /road/v1/policy/health/{org}`         | Health rules               |
| **notify/nats**             | Event publish       | Publish to NATS subjects                   | NATS server (that's CarPool)                    | Internal                                   | —                          |
| **notify/webhook-dispatch** | External hooks      | Fire to registered URLs                    | Webhook registration (that's core/)             | Internal                                   | Delivery log               |
| **notify/digest**           | Summaries           | Daily/weekly rollup generation             | Notification delivery (email/Slack)             | `GET /road/v1/digest/daily`                | —                          |
| **web/git-ui**              | Code browser        | Gitea native web interface                 | Dashboard analytics (that's Prism)              | HTML at :3100                              | —                          |
| **web/api-docs**            | API reference       | OpenAPI spec                               | —                                               | HTML at :3100/road/docs                    | —                          |

## D. What Stays OUTSIDE RoadCode

These are BlackRoad OS runtime services. They are NOT RoadCode modules:

| Service                                   | Runs On                         | Why It's Separate                                          |
| ----------------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| **Memory System** (journal, chain, codex) | Alice/Octavia                   | Agent memory is runtime state, not Git metadata            |
| **NATS / CarPool**                        | Octavia :4222                   | Message bus is infrastructure, not control plane           |
| **Ollama / Passenger**                    | Cecilia, Lucidia, Gematria      | AI inference is a runtime service                          |
| **MinIO / Curb**                          | Cecilia                         | Object storage is infrastructure                           |
| **PostgreSQL**                            | Alice, Cecilia, Lucidia         | Database is infrastructure                                 |
| **Redis**                                 | Alice                           | Cache is infrastructure                                    |
| **Pi-hole / PitStop**                     | Alice                           | DNS filtering is infrastructure                            |
| **PowerDNS**                              | Lucidia, Gematria               | Authoritative DNS is infrastructure                        |
| **Caddy / OneWay**                        | Gematria                        | TLS edge is infrastructure                                 |
| **nginx**                                 | Alice, Lucidia                  | HTTP routing is infrastructure                             |
| **InfluxDB**                              | Octavia                         | Time-series is monitoring infrastructure                   |
| **WireGuard / TollBooth**                 | All nodes                       | VPN is network infrastructure                              |
| **OctoPrint**                             | Octavia :5000                   | 3D printing is hardware                                    |
| **Prism Console**                         | Octavia :8787 → Prism subdomain | Dashboard CONSUMES RoadCode APIs                           |
| **Self-hosted Workers**                   | Octavia :9001-9015              | Application Workers serve websites                         |
| **Agent Daemon**                          | All nodes                       | Agent runtime uses RoadCode registry but is not part of it |
| **TODO System**                           | Operator scripts                | Project tracking is a memory system concern                |
| **Collaboration System**                  | Operator scripts                | Claude-to-Claude messaging is runtime                      |

**Rule: If it runs continuously processing requests, it's a runtime service. If it stores/queries metadata about the enterprise, it's RoadCode.**

## E. Container / Subdomain Architecture

### Containers on Octavia

| Container           | Port                      | Purpose                          |
| ------------------- | ------------------------- | -------------------------------- |
| `roadcode`          | :3100 (HTTP), :2222 (SSH) | Core Gitea + RoadCode extensions |
| `roadcode-registry` | :3101                     | Registry API (`/road/v1/*`)      |
| `roadcode-search`   | :3102                     | Discovery/search (FTS5)          |
| `roadcode-mirror`   | — (cron worker)           | GitHub ↔ Gitea sync              |
| `roadcode-audit`    | :3103                     | Audit event collector + chain    |
| `roadcode-policy`   | — (cron worker)           | Policy validation runs           |

**Total: 4 ports (3100-3103). 2 cron workers. Clean.**

### Subdomain Map

| Subdomain                   | Container                 | Purpose                                    |
| --------------------------- | ------------------------- | ------------------------------------------ |
| `code.blackroad.io`         | `roadcode` :3100          | Git web UI, code browser, issues           |
| `api.blackroad.io` /road/\* | `roadcode-registry` :3101 | Registry + RoadCode API                    |
| `search.blackroad.io`       | `roadcode-search` :3102   | Enterprise search UI                       |
| `prism.blackroad.io`        | `prism-blackroad` :8787   | Dashboard (separate service, NOT RoadCode) |
| `audit.blackroad.io`        | `roadcode-audit` :3103    | Audit log viewer                           |

**Routing:** Gematria (Caddy) → WireGuard → Octavia containers. Each subdomain = one container. No internal routing spaghetti.

## F. Data Model

### RoadCode Database (PostgreSQL on Octavia, or SQLite for simplicity)

```sql
-- Registry tables (synced from OS-Inc/RoadCode/registries/*.json)
CREATE TABLE road_orgs (
    name TEXT PRIMARY KEY,
    tier INTEGER NOT NULL,        -- 0=registry, 1=platform, 2=execution
    purpose TEXT NOT NULL,
    owner TEXT DEFAULT 'alexa',
    domains TEXT,                  -- JSON array
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE road_repos (
    org TEXT NOT NULL,
    name TEXT NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'active',  -- active, archived, deprecated
    gitea_url TEXT,
    github_url TEXT,
    PRIMARY KEY (org, name),
    FOREIGN KEY (org) REFERENCES road_orgs(name)
);

CREATE TABLE road_domains (
    domain TEXT PRIMARY KEY,
    org TEXT NOT NULL,
    purpose TEXT,
    infra TEXT,                    -- 'cloudflare', 'gematria', 'octavia'
    status TEXT DEFAULT 'live',
    FOREIGN KEY (org) REFERENCES road_orgs(name)
);

CREATE TABLE road_agents (
    name TEXT PRIMARY KEY,
    org TEXT NOT NULL,
    node TEXT,                     -- hostname where agent runs
    capabilities TEXT,             -- JSON array
    status TEXT DEFAULT 'active',
    last_seen TIMESTAMP,
    FOREIGN KEY (org) REFERENCES road_orgs(name)
);

CREATE TABLE road_nodes (
    hostname TEXT PRIMARY KEY,
    ip TEXT NOT NULL,
    role TEXT NOT NULL,            -- 'gateway', 'ai', 'git', 'web', 'edge'
    services TEXT,                 -- JSON array of service names
    status TEXT DEFAULT 'online',
    last_ping TIMESTAMP
);

CREATE TABLE road_services (
    name TEXT NOT NULL,
    node TEXT NOT NULL,
    port INTEGER,
    org TEXT,
    protocol TEXT DEFAULT 'http',
    status TEXT DEFAULT 'running',
    PRIMARY KEY (name, node),
    FOREIGN KEY (node) REFERENCES road_nodes(hostname)
);

-- Audit tables (written by RoadCode, read by Prism)
CREATE TABLE road_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT NOW(),
    actor TEXT NOT NULL,           -- user, agent, or system
    action TEXT NOT NULL,          -- push, deploy, create, delete, sync
    entity_type TEXT NOT NULL,     -- repo, org, domain, agent, node, service
    entity_id TEXT NOT NULL,
    details TEXT,                  -- JSON
    hash TEXT                      -- chain hash
);

CREATE TABLE road_deploys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP DEFAULT NOW(),
    repo TEXT NOT NULL,            -- org/repo
    commit_sha TEXT NOT NULL,
    node TEXT NOT NULL,
    domain TEXT,
    status TEXT DEFAULT 'success', -- success, failed, rollback
    details TEXT
);

-- Mirror state
CREATE TABLE road_mirrors (
    org TEXT NOT NULL,
    repo TEXT NOT NULL,
    gitea_sha TEXT,
    github_sha TEXT,
    last_sync TIMESTAMP,
    direction TEXT,               -- 'push', 'pull', 'bidirectional'
    status TEXT DEFAULT 'synced',
    PRIMARY KEY (org, repo)
);

-- FTS5 search index (SQLite sidecar)
CREATE VIRTUAL TABLE road_search USING fts5(
    entity_type,
    entity_id,
    org,
    content,
    tokenize='porter'
);
```

## G. Relationship to Existing Infrastructure

| System                                | Relationship to RoadCode                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Gitea**                             | RoadCode IS the forked Gitea. Core/ is the Gitea codebase. Everything else is layered on top.                                           |
| **GitHub Enterprise**                 | Public mirror. RoadCode mirror/ module syncs bidirectionally. GitHub is never the source of truth.                                      |
| **Raspberry Pi nodes**                | RoadCode registry/nodes tracks them. Agents on Pis query RoadCode for assignments. RoadCode itself runs ON Octavia.                     |
| **DigitalOcean (Gematria/Anastasia)** | Gematria routes traffic to RoadCode subdomains via Caddy+WireGuard. Anastasia is DR backup.                                             |
| **Cloudflare**                        | During migration: CF DNS points domains → Gematria. After migration: PowerDNS replaces CF. CF Workers → self-hosted Workers on Octavia. |
| **NATS (CarPool)**                    | RoadCode notify/nats publishes events to NATS. RoadCode does NOT run NATS.                                                              |
| **Memory System**                     | Agent memory is separate from RoadCode. Agents use both: memory for continuity, RoadCode for discovery.                                 |
| **Prism**                             | Prism is a CONSUMER of RoadCode APIs. It renders dashboards. It does not store truth.                                                   |
| **Self-hosted Workers**               | Workers (:9001-9015) serve websites. RoadCode registry/services catalogs them. RoadCode does not run them.                              |

## H. Anti-Duplication Rules

1. **RoadCode stores metadata. Runtime services store state.** Agent memory, message queues, inference results — those are runtime, not RoadCode.
2. **RoadCode provides APIs. Prism provides views.** Never build dashboards inside RoadCode. Prism consumes `/road/v1/*`.
3. **RoadCode tracks nodes. It does not manage nodes.** Node provisioning, updates, monitoring — that's BlackRoad-OS tooling. RoadCode just knows they exist.
4. **RoadCode tracks deployments. It does not execute deployments.** The deploy scripts live in BlackRoad-OS. RoadCode's audit/deploy-log records what happened.
5. **RoadCode enforces policy by reporting, not blocking.** Policy modules flag violations. Humans/agents decide what to fix.
6. **Registry is the source. Everything else syncs FROM registry.** Search indexes, Prism dashboards, agent configs — all derive from registry tables. Don't create parallel registries.
7. **Core is Gitea. Don't rewrite Gitea internals.** Extend via API hooks and sidecar services. Don't fork Gitea's auth to build a new auth system.

## I. Final Canonical Module Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RoadCode Platform                             │
│                    (Octavia, sovereign)                          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  CORE (Gitea fork)                          :3100/:2222  │  │
│  │  git · auth · repos · issues · actions · webhooks · api  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │ internal events                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │  REGISTRY                                        :3101   │  │
│  │  orgs · repos · domains · agents · nodes · services      │  │
│  │  sync (pulls from OS-Inc/RoadCode/registries/*.json)     │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │ indexed data                          │
│  ┌───────────────────────▼──────┐  ┌─────────────────────────┐ │
│  │  DISCOVERY             :3102 │  │  AUDIT            :3103 │ │
│  │  search (FTS5)               │  │  events (structured)    │ │
│  │  graph (entity relations)    │  │  chain (hash integrity) │ │
│  │  explore (web UI)            │  │  deploy-log (lineage)   │ │
│  └──────────────────────────────┘  └─────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────┐  ┌─────────────────────────┐ │
│  │  MIRROR          (cron)      │  │  POLICY      (cron)     │ │
│  │  github sync (bi-directional)│  │  naming validation      │ │
│  │  downstream push             │  │  license check          │ │
│  │  schedule (every 15min)      │  │  scope validation       │ │
│  └──────────────────────────────┘  │  health check           │ │
│                                     └─────────────────────────┘ │
│  ┌──────────────────────────────┐                               │
│  │  NOTIFY                      │                               │
│  │  nats publish (→ CarPool)    │                               │
│  │  webhook dispatch            │                               │
│  │  digest generation           │                               │
│  └──────────────────────────────┘                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  WEB                                                     │   │
│  │  git-ui (Gitea native)  ·  api-docs (OpenAPI)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────┘
                                       │
                    CONSUMERS (separate services, NOT RoadCode):
                    ┌──────────────────▼──────────────────────┐
                    │  Prism Console     (prism.blackroad.io) │
                    │  Agent Daemon      (all nodes)          │
                    │  Memory System     (operator scripts)   │
                    │  Website Workers   (Octavia :9001-9015) │
                    │  blackroad.io      (master index)       │
                    └─────────────────────────────────────────┘
```

**Port allocation on Octavia:**

- `:2222` — RoadCode SSH (Git)
- `:3100` — RoadCode HTTP (Gitea UI + API)
- `:3101` — RoadCode Registry API
- `:3102` — RoadCode Discovery/Search
- `:3103` — RoadCode Audit
- `:4222` — NATS (CarPool, separate)
- `:8787` — Prism (separate)
- `:9001-9015` — Website Workers (separate)

**4 RoadCode ports. Clean boundary. Everything else is a consumer.**
