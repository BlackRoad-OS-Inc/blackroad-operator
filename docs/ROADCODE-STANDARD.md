# RoadCode Standard

> The canonical definition of RoadCode across all three layers.
> Last updated: 2026-03-21

## A. Definition

**RoadCode is the sovereign control plane, Git platform, and organizational contract surface for BlackRoad OS.**

It exists simultaneously at three layers:

| Layer                      | What it is                                                                    | Where it lives                        |
| -------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| **RoadCode Repo**          | The constitution, map, and contract for a single org                          | `{org}/RoadCode` on GitHub (16 repos) |
| **RoadCode Platform**      | The forked Gitea instance — sovereign Git hosting, mirroring, webhooks, CI/CD | Octavia :3100 (self-hosted)           |
| **RoadCode Control Plane** | The registry that answers "what exists, where, who owns it, what serves it"   | Built on top of the Platform layer    |

## B. The Three-Layer Distinction

### Layer 1: RoadCode Repo (the org constitution)

Each of the 16 organizations has exactly one repo named `RoadCode`. This is:

- The **entry point** — first thing you read when you enter an org
- The **map** — lists every repo, domain, agent, and service in that org
- The **contract** — defines scope boundaries (what belongs here, what doesn't)
- The **agent instructions** — CLAUDE.md tells agents how to operate in this org

**This is a document repo. No application code. No deployment scripts. No build artifacts.**

### Layer 2: RoadCode Platform (the sovereign Gitea fork)

RoadCode Platform is the forked Gitea running on Octavia. It is:

- The **sovereign Git server** — all repos mirrored from GitHub, but Gitea is primary
- The **webhook engine** — triggers deployments, agent dispatches, sync operations
- The **CI/CD runner** — Gitea Actions with act_runner on the Pi fleet
- The **mirror controller** — bidirectional sync: Gitea ↔ GitHub

**This is infrastructure. It replaces GitHub as the canonical source-of-truth for code.**

GitHub remains the public-facing mirror. RoadCode Platform is the sovereign origin.

### Layer 3: RoadCode Control Plane (the registry brain)

Built on top of the Platform, the Control Plane is the query surface that answers:

- "What orgs exist?" → org registry
- "What repos exist in org X?" → repo registry
- "What domain serves org X?" → domain registry
- "What agents operate in org X?" → agent registry
- "What node runs service Y?" → node registry
- "What changed in the last hour?" → audit ledger
- "Find anything matching Z" → search/discovery

**This is the nervous system. It makes the organism navigable.**

## C. RoadCode Role by Tier

### Tier 0 — BlackRoad-OS-Inc/RoadCode (Master Registry)

The master RoadCode. Contains the canonical registries for the entire enterprise:

```
BlackRoad-OS-Inc/RoadCode/
├── README.md                 # "What is BlackRoad OS" — the front door
├── ORG.md                    # OS-Inc constitution
├── CONSTITUTION.md           # Enterprise-wide org constitution (links to ORG-CONSTITUTION.md)
├── registries/
│   ├── orgs.json             # All 16 orgs: name, tier, purpose, domains, owner
│   ├── domains.json          # All 19 domains: domain, org, purpose, infra
│   ├── agents.json           # All agents: name, org, node, capabilities, status
│   ├── nodes.json            # All nodes: hostname, IP, role, services, status
│   ├── repos.json            # All repos across all orgs: name, org, purpose, status
│   └── services.json         # All running services: name, node, port, org, status
├── policies/
│   ├── naming.md             # Repo/service/container naming conventions
│   ├── licensing.md          # Proprietary license policy
│   ├── security.md           # Security baseline requirements
│   └── deprecation.md        # How things get archived
├── LICENSE                   # BlackRoad OS proprietary
├── CLAUDE.md                 # Master agent instructions
└── .github/
    └── workflows/
        └── validate-registries.yml
```

**Rule: If it's metadata about the enterprise, it lives here. Nowhere else.**

### Tier 1 — BlackRoad-OS/RoadCode (Platform Index)

The platform RoadCode. Contains the map of shared tooling, not the tools themselves:

```
BlackRoad-OS/RoadCode/
├── README.md                 # Platform overview + how to use shared tools
├── ORG.md                    # OS org constitution
├── REPOS.md                  # All repos in BlackRoad-OS with purposes
├── DOMAINS.md                # Domains served by this org (blackroad.systems)
├── AGENTS.md                 # Platform agents
├── SERVICES.md               # Platform services (memory, codex, sync, deploy)
├── PLATFORM.md               # Architecture: how the platform layer works
├── LICENSE
├── CLAUDE.md
└── .github/
    └── workflows/
        └── roadcode-validate.yml
```

**Rule: This maps the platform. The actual tools live in their own repos within BlackRoad-OS.**

### Tier 2 — Domain Org RoadCode (Org Contract)

Every domain org's RoadCode follows a minimal standard:

```
{org}/RoadCode/
├── README.md                 # Org overview: what this org does, how to navigate
├── ORG.md                    # Constitution: purpose, scope, boundaries, what does NOT belong
├── REPOS.md                  # Every repo in this org with one-line descriptions
├── DOMAINS.md                # Domains owned by this org
├── AGENTS.md                 # Agents operating within this org's scope
├── SERVICES.md               # Running services owned by this org
├── LICENSE                   # BlackRoad OS proprietary
├── CLAUDE.md                 # Agent instructions specific to this org
└── .github/
    └── workflows/
        └── roadcode-validate.yml
```

**Rule: Tier 2 RoadCode repos are THIN. Constitution + map + contract. Nothing else.**

## D. Platform vs Repo: What Goes Where

| Function                       | RoadCode Repo | RoadCode Platform |        Regular Repos        |
| ------------------------------ | :-----------: | :---------------: | :-------------------------: |
| Org purpose & scope definition |      YES      |         —         |              —              |
| Repo registry / listing        |      YES      |         —         |              —              |
| Domain ownership declaration   |      YES      |         —         |              —              |
| Agent roster                   |      YES      |         —         |              —              |
| Service inventory              |      YES      |         —         |              —              |
| Agent instructions (CLAUDE.md) |      YES      |         —         |       YES (per-repo)        |
| Application code               |       —       |         —         |             YES             |
| Deployment scripts             |       —       |         —         | YES (in BlackRoad-OS repos) |
| Git hosting                    |       —       |        YES        |              —              |
| Webhook dispatch               |       —       |        YES        |              —              |
| CI/CD pipeline execution       |       —       |        YES        |              —              |
| Mirror sync (Gitea ↔ GitHub)   |       —       |        YES        |              —              |
| Search/discovery index         |       —       |        YES        |              —              |
| Audit ledger                   |       —       |        YES        |              —              |
| Auth / identity                |       —       |        YES        |              —              |
| Node management                |       —       |        YES        |              —              |
| Build artifacts                |       —       |         —         |      — (never in Git)       |
| Secrets / credentials          |       —       |         —         |      — (never in Git)       |

## E. RoadCode Platform Module Map

The RoadCode Platform (forked Gitea) extends Gitea with these BlackRoad-specific modules:

```
RoadCode Platform (Octavia :3100)
│
├── core/                     # Gitea core (forked, sovereign)
│   ├── git/                  # Git server, SSH, HTTP
│   ├── auth/                 # User/org/token management
│   ├── webhooks/             # Event dispatch
│   ├── actions/              # CI/CD (act_runner on Pi fleet)
│   └── api/                  # REST + GraphQL
│
├── registries/               # BlackRoad extensions
│   ├── org-registry/         # Syncs from OS-Inc/RoadCode/registries/orgs.json
│   ├── repo-registry/        # Auto-generated from all orgs
│   ├── domain-registry/      # Syncs from OS-Inc/RoadCode/registries/domains.json
│   ├── agent-registry/       # Syncs from OS-Inc/RoadCode/registries/agents.json
│   ├── node-registry/        # Syncs from OS-Inc/RoadCode/registries/nodes.json
│   └── service-registry/     # Syncs from OS-Inc/RoadCode/registries/services.json
│
├── sync/                     # Mirror + sync workers
│   ├── github-mirror/        # Bidirectional Gitea ↔ GitHub sync
│   ├── downstream-push/      # Push operator changes to all orgs
│   └── registry-sync/        # Pull registry JSONs from OS-Inc/RoadCode
│
├── discovery/                # Search + navigation
│   ├── search/               # FTS5 across all repos, agents, services
│   ├── graph/                # Knowledge graph: org→repo→service→agent→node
│   └── explorer/             # Web UI for browsing the enterprise
│
├── ledger/                   # Audit + history
│   ├── audit-log/            # Every action: who, what, when, where
│   ├── deploy-log/           # Deployment lineage: which commit → which node
│   └── chain/                # Hash chain for tamper detection (existing memory system)
│
├── policy/                   # Governance
│   ├── naming-enforcer/      # Validates repo/service names against conventions
│   ├── license-checker/      # Ensures all repos have proprietary license
│   └── scope-validator/      # Ensures repos are in the right org
│
└── ui/                       # RoadCode web interface
    ├── dashboard/            # Enterprise overview (like blackroad.io but internal)
    ├── org-view/             # Per-org dashboard
    ├── repo-browser/         # Code browser (Gitea native)
    └── agent-console/        # Agent status and dispatch
```

## F. Integration Architecture

```
                    ┌──────────────────────────────────────┐
                    │         GitHub Enterprise             │
                    │    (public mirror, 16 orgs, ~400 repos)│
                    └──────────────────┬───────────────────┘
                                       │ bidirectional mirror
                    ┌──────────────────▼───────────────────┐
                    │      RoadCode Platform (Gitea)        │
                    │       Octavia :3100 (PRIMARY)         │
                    │  ┌─────────┬──────────┬────────────┐ │
                    │  │Registry │ Sync     │ Discovery  │ │
                    │  │Engine   │ Workers  │ Index      │ │
                    │  └────┬────┴────┬─────┴─────┬──────┘ │
                    └───────┼─────────┼───────────┼────────┘
                            │         │           │
              ┌─────────────┼─────────┼───────────┼──────────────┐
              │             │         │           │              │
     ┌────────▼──┐  ┌───────▼───┐  ┌──▼─────┐  ┌─▼────────┐  ┌─▼──────┐
     │  Alice    │  │ Cecilia   │  │Lucidia │  │ Gematria │  │Anastasia│
     │ gateway   │  │ AI/storage│  │ web    │  │ edge     │  │ backup  │
     │ Pi-hole   │  │ Ollama    │  │ nginx  │  │ Caddy    │  │ DR      │
     │ PostgreSQL│  │ MinIO     │  │ PowerDNS│ │ Ollama   │  │         │
     └───────────┘  └───────────┘  └────────┘  └──────────┘  └─────────┘
              │         │           │           │              │
              └─────────┴───────────┴───────────┴──────────────┘
                            WireGuard Mesh (all nodes)
```

**Data flow:**

1. Code is pushed to **RoadCode Platform** (Gitea on Octavia) — this is the origin
2. RoadCode mirrors to **GitHub Enterprise** — this is the public face
3. Webhooks fire to **deploy workers** on Pi fleet nodes
4. Registry JSONs in OS-Inc/RoadCode are the canonical metadata
5. RoadCode Platform syncs registries into its internal index
6. Discovery/search queries hit the Platform, not individual repos
7. Audit ledger records every action with hash chain integrity

**Cloudflare integration (during sovereignty migration):**

- CF Workers serve website frontends (19 domains)
- CF DNS points domains to Gematria (edge) or direct to Pi fleet
- As sovereignty completes: CF Workers → Octavia self-hosted Workers (:9001-9015)
- As sovereignty completes: CF DNS → PowerDNS (Lucidia + Gematria)

## G. Naming Conventions

### Repos

| Pattern               | Scope                        | Example                                   |
| --------------------- | ---------------------------- | ----------------------------------------- |
| `RoadCode`            | Org entrypoint (one per org) | `BlackRoad-AI/RoadCode`                   |
| `road-{function}`     | Shared platform tool         | `road-deploy`, `road-sync`, `road-search` |
| `Road{Name}`          | Forked sovereignty dep       | `RoadCode`, `TollBooth`, `Passenger`      |
| `blackroad-{product}` | Product/service repo         | `blackroad-chat`, `blackroad-hq`          |
| `br-{tool}`           | Internal CLI/script          | `br-search`, `br-sync`                    |

### Services (systemd / container names)

| Pattern           | Example                                       |
| ----------------- | --------------------------------------------- |
| `roadcode`        | The Gitea/RoadCode Platform itself            |
| `road-{function}` | `road-mirror`, `road-registry`, `road-search` |
| `br-{service}`    | `br-memory`, `br-codex`, `br-agents`          |

### Subdomains

| Pattern                  | Purpose                  | Example                                |
| ------------------------ | ------------------------ | -------------------------------------- |
| `{product}.blackroad.io` | Product verticals        | `chat.blackroad.io`, `hq.blackroad.io` |
| `code.blackroad.io`      | RoadCode Platform web UI | —                                      |
| `api.blackroad.io`       | Platform API             | —                                      |
| `pay.blackroad.io`       | Stripe/payment           | —                                      |
| `auth.blackroad.io`      | Authentication           | —                                      |
| `search.blackroad.io`    | Discovery/search         | —                                      |

### Containers (Docker/Podman)

| Pattern             | Example                                  |
| ------------------- | ---------------------------------------- |
| `roadcode-{module}` | `roadcode-registry`, `roadcode-mirror`   |
| `br-{service}`      | `br-memory`, `br-codex`                  |
| `road-{dep}`        | `road-gitea`, `road-minio`, `road-caddy` |

## H. Anti-Duplication Rules

1. **Registries live in ONE place: `BlackRoad-OS-Inc/RoadCode/registries/`.** Domain orgs reference them, never duplicate them.
2. **Each org's RoadCode is THIN.** Constitution + map + contract. No code, no tools, no assets.
3. **Platform code lives in `BlackRoad-OS/`.** Not in any RoadCode repo. RoadCode repos are documents.
4. **One repo per concern.** If two repos do similar things, merge them or make one depend on the other.
5. **Domain orgs don't build infrastructure.** They use what BlackRoad-OS and BlackRoad-Cloud provide.
6. **Agent code lives in the domain org it serves.** The agent's registration lives in OS-Inc/RoadCode.
7. **No .gitkeep forests.** If a directory has no real files, delete it. Don't scaffold empty trees.
8. **RoadCode repos must not contain JSX templates, application code, or build configs.** Those moved to their proper domain repos.

## I. Current State vs Target State

### Current (what exists now)

- 16 RoadCode repos on GitHub, each with ~298 files (mostly `.gitkeep` scaffolds)
- Application code mixed into RoadCode repos (JSX templates, site files, API stubs)
- Gitea on Octavia exists but is partially operational
- GitHub is treated as primary, Gitea as secondary

### Target (what we're building)

- 16 RoadCode repos: THIN, document-only, following the standard contract
- Application code extracted to proper domain repos
- RoadCode Platform (Gitea) is PRIMARY, GitHub is public mirror
- Registries centralized in OS-Inc/RoadCode as JSON
- Control plane modules built on top of Gitea
- Discovery/search integrated into Platform

### Migration Path

1. **Clean existing RoadCode repos** — strip application code, remove .gitkeep forests
2. **Standardize to contract** — README, ORG.md, REPOS.md, DOMAINS.md, AGENTS.md, SERVICES.md, LICENSE, CLAUDE.md
3. **Create registries** — build orgs.json, domains.json, agents.json, nodes.json in OS-Inc/RoadCode
4. **Restore Gitea** — ensure Octavia :3100 is running and healthy
5. **Configure mirrors** — set up bidirectional Gitea ↔ GitHub sync
6. **Build control plane modules** — registry sync, discovery, audit hooks
7. **Flip primary** — Gitea becomes origin, GitHub becomes mirror

## J. Final Canonical Recommendation

**RoadCode is three things. Keep them cleanly separated:**

1. **RoadCode Repo** = the org's constitution. Thin. Documents only. One per org. Follows the standard contract. No exceptions.

2. **RoadCode Platform** = forked Gitea on Octavia. The sovereign Git server. Primary origin for all code. GitHub is the public mirror.

3. **RoadCode Control Plane** = built on the Platform. Registries, discovery, audit, policy enforcement. The nervous system that makes the enterprise navigable by humans, agents, and automation.

**The hierarchy is:**

```
Enterprise (BlackRoad)
  └── Control Plane (RoadCode Platform on Octavia)
       ├── Registry (OS-Inc/RoadCode — what exists)
       ├── Platform (OS repos — how to run things)
       └── Execution (Domain orgs — domain work)
            └── Each org's RoadCode repo = the entry point
```

**blackroad.io is the external expression of this control plane.** It shows the world what exists, organized by the same tier structure.

**code.blackroad.io is the internal expression.** It's the RoadCode Platform web UI where agents and humans navigate the sovereign infrastructure.

**The separation is absolute:**

- Registry data → OS-Inc/RoadCode/registries/\*.json
- Platform tools → BlackRoad-OS repos
- Domain work → domain org repos
- Org contracts → {org}/RoadCode (thin, document-only)
- Application code → NEVER in any RoadCode repo
