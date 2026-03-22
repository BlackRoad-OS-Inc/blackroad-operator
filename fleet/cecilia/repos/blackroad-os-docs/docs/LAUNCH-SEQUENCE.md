# BlackRoad OS — Launch Sequence

> **Generated:** 2025-12-01
> **Status:** READY FOR APPROVAL
> **Governor:** cece.governor.v1

---

## 1. RECONSTRUCTED VISION (Baseline Spec)

### Product Blueprint

BlackRoad OS is a **distributed AI orchestration platform** with six portals:

| Portal | Domain | MVP Status |
|--------|--------|------------|
| **Lucidia** | Personal AI with persistent memory | Phase 0 |
| **RoadWork** | Education/homework help | Phase 1 |
| **RoadView** | Media creation (video/image gen) | Phase 2 |
| **RoadGlitch** | Gaming (procedural content) | Phase 2 |
| **RoadWorld** | Navigation + context | Phase 3 |
| **BackRoad** | Privacy infrastructure | Phase 3 |

### Technical Scope Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      PORTAL LAYER                                │
│   Lucidia │ RoadWork │ RoadView │ RoadGlitch │ RoadWorld         │
├─────────────────────────────────────────────────────────────────┤
│                    GOVERNANCE LAYER                              │
│        Policies │ Ledger │ Intents │ Claims │ Delegations        │
├─────────────────────────────────────────────────────────────────┤
│                   INTEGRATION LAYER                              │
│         MCP Servers │ Tools │ GitHub │ Cloudflare │ Railway      │
├─────────────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE LAYER                            │
│   Cloudflare Pages │ Railway (API) │ Postgres │ Self-hosted LLM  │
└─────────────────────────────────────────────────────────────────┘
```

### MVP Definition

#### Phase 0 (NOW — Week 1-2)
- [x] Infra Map working with real GitHub data
- [ ] All core services deployed and healthy
- [ ] DNS routing complete (blackroad.io → all subdomains)
- [ ] `/health` and `/version` on every service

#### Phase 1 (Week 3-4)
- [ ] Lucidia basic chat working
- [ ] Homework Portal basic functionality
- [ ] Creator Portal scaffold
- [ ] Agent registry + Cece orchestration

#### Phase 2 (Week 5-8)
- [ ] RoadView media generation
- [ ] RoadGlitch game content
- [ ] Full governance layer
- [ ] Policy evaluation in production

---

## 2. MASTER REPOSITORY MAP

### Active Repos (Keep & Deploy)

| Repo | Purpose | Deploy To | Status |
|------|---------|-----------|--------|
| `blackroad-os-web` | Main website + Infra Map | Cloudflare Pages | ✅ READY |
| `blackroad-os-core` | API + Database + Integrations | Railway | ✅ READY |
| `blackroad-os-api` | Public API Gateway | Railway | 🔧 NEEDS SETUP |
| `blackroad-os-api-gateway` | Edge routing | Cloudflare Workers | 🔧 NEEDS SETUP |
| `blackroad-os-operator` | Background jobs + scheduling | Railway | 🔧 NEEDS SETUP |
| `blackroad-os-prism-console` | Admin dashboard | Cloudflare Pages | 🔧 NEEDS SETUP |
| `blackroad-os-docs` | Documentation | Cloudflare Pages | ✅ READY |
| `blackroad-os-infra` | IaC, DNS configs, runbooks | N/A (reference) | ✅ READY |
| `blackroad-os-agents` | Agent implementations | Railway | 🔧 NEEDS SETUP |
| `blackroad-os-brand` | Brand assets | N/A (reference) | ✅ READY |
| `lucidia-core` | AI reasoning engines | Railway | 🔧 NEEDS SETUP |
| `lucidia-platform` | Lucidia web UI | Cloudflare Pages | 🔧 NEEDS SETUP |

### Archived Repos (Already Done)

| Repo | Reason |
|------|--------|
| `blackroad-os-research` | Merged into docs |
| `blackroad-os-ideas` | Merged into docs |
| `blackroad-os-helper` | Superseded by agents |
| `blackroad-os-home` | Merged into docs |
| `blackroad-os-demo` | Sample only |
| `blackroad-agents` | Superseded by blackroad-os-agents |
| `blackroad-agent-os` | Superseded by operator |

### Pack Repos (Future — Not Phase 0)

| Repo | Phase |
|------|-------|
| `blackroad-os-pack-creator-studio` | Phase 2 |
| `blackroad-os-pack-education` | Phase 1 |
| `blackroad-os-pack-finance` | Phase 2 |
| `blackroad-os-pack-infra-devops` | Phase 1 |
| `blackroad-os-pack-legal` | Phase 3 |
| `blackroad-os-pack-research-lab` | Phase 3 |

### Pi/Edge Repos (Later)

| Repo | Phase |
|------|-------|
| `blackroad-pi-ops` | Phase 2 |
| `blackroad-pi-holo` | Phase 3 |
| `blackroad-os-mesh` | Phase 2 |

---

## 3. LIVE PLATFORM DEPLOYMENT PLAN

### DNS Mapping Table

| Subdomain | Target | Type | Provider |
|-----------|--------|------|----------|
| `blackroad.io` | Cloudflare Pages (web) | CNAME | Cloudflare |
| `www.blackroad.io` | → blackroad.io | CNAME | Cloudflare |
| `api.blackroad.io` | Railway (blackroad-os-api) | CNAME | Railway |
| `app.blackroad.io` | Cloudflare Pages (prism) | CNAME | Cloudflare |
| `docs.blackroad.io` | Cloudflare Pages (docs) | CNAME | Cloudflare |
| `lucidia.blackroad.io` | Cloudflare Pages (lucidia-platform) | CNAME | Cloudflare |
| `status.blackroad.io` | Cloudflare Pages (beacon) | CNAME | Cloudflare |

### Service Registry

```json
{
  "services": [
    {
      "name": "blackroad-os-web",
      "type": "frontend",
      "provider": "cloudflare-pages",
      "domain": "blackroad.io",
      "health": "/health",
      "version": "/version",
      "repo": "BlackRoad-OS/blackroad-os-web"
    },
    {
      "name": "blackroad-os-core",
      "type": "api",
      "provider": "railway",
      "domain": "internal",
      "port": 4000,
      "health": "/health",
      "version": "/api/version",
      "repo": "BlackRoad-OS/blackroad-os-core"
    },
    {
      "name": "blackroad-os-api",
      "type": "gateway",
      "provider": "railway",
      "domain": "api.blackroad.io",
      "health": "/health",
      "version": "/version",
      "repo": "BlackRoad-OS/blackroad-os-api"
    },
    {
      "name": "blackroad-os-docs",
      "type": "frontend",
      "provider": "cloudflare-pages",
      "domain": "docs.blackroad.io",
      "health": "/health",
      "version": "/version",
      "repo": "BlackRoad-OS/blackroad-os-docs"
    },
    {
      "name": "blackroad-os-prism-console",
      "type": "frontend",
      "provider": "cloudflare-pages",
      "domain": "app.blackroad.io",
      "health": "/health",
      "version": "/version",
      "repo": "BlackRoad-OS/blackroad-os-prism-console"
    }
  ]
}
```

### Deployment Order

```
1. Database (Railway Postgres) ────────────────────── ✅ DONE
   │
2. blackroad-os-core (API server) ─────────────────── ✅ RUNNING LOCALLY
   │
3. blackroad-os-web (Main site + Infra Map) ───────── 🔧 DEPLOY TO CF PAGES
   │
4. blackroad-os-docs ──────────────────────────────── 🔧 DEPLOY TO CF PAGES
   │
5. blackroad-os-api (Public gateway) ──────────────── 🔧 DEPLOY TO RAILWAY
   │
6. blackroad-os-prism-console ─────────────────────── 🔧 DEPLOY TO CF PAGES
   │
7. blackroad-os-operator (Background jobs) ────────── 🔧 DEPLOY TO RAILWAY
   │
8. lucidia-core + lucidia-platform ────────────────── 🔧 PHASE 1
```

### Required Environment Variables

#### blackroad-os-core (Railway)
```bash
DATABASE_URL=postgresql://...
GITHUB_TOKEN=ghp_...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=848cf0b18d51e0170e0d1537aec3505a
RAILWAY_TOKEN=...
PORT=4000
```

#### blackroad-os-web (Cloudflare Pages)
```bash
NEXT_PUBLIC_API_URL=https://api.blackroad.io
SITE_URL=https://blackroad.io
```

#### blackroad-os-api (Railway)
```bash
DATABASE_URL=postgresql://...
CORE_API_URL=http://blackroad-os-core.railway.internal:4000
PORT=8080
```

---

## 4. MAKE IT LIVE CHECKLIST

### Phase 0: Core Infrastructure (THIS WEEK)

```
[ ] 1. Deploy blackroad-os-core to Railway
    - Link to existing Postgres database
    - Set environment variables
    - Verify /health returns {"status":"ok"}

[ ] 2. Deploy blackroad-os-web to Cloudflare Pages
    - Connect to GitHub repo
    - Set NEXT_PUBLIC_API_URL to Railway URL
    - Verify builds and deploys

[ ] 3. Configure DNS in Cloudflare
    - blackroad.io → CF Pages (web)
    - api.blackroad.io → Railway (core for now)
    - docs.blackroad.io → CF Pages (docs)

[ ] 4. Verify all services healthy
    - curl https://blackroad.io/health
    - curl https://api.blackroad.io/health
    - curl https://docs.blackroad.io/health

[ ] 5. Run infra:sync in production
    - All repos visible on /infra
    - GitHub integration green
    - Last synced timestamp updating
```

### Phase 0.5: Full API Layer (Next Week)

```
[ ] 6. Deploy blackroad-os-api to Railway
    - Public API gateway
    - Rate limiting
    - Auth middleware

[ ] 7. Deploy blackroad-os-prism-console to CF Pages
    - Admin dashboard at app.blackroad.io
    - Connect to API

[ ] 8. Deploy blackroad-os-operator to Railway
    - Background job runner
    - Scheduled sync
    - Health monitoring

[ ] 9. Set up Cloudflare tunnels for secure internal traffic
    - Core API not publicly exposed
    - Gateway handles all external requests
```

### Phase 1: Portals (Week 3-4)

```
[ ] 10. Deploy lucidia-core to Railway
    - AI reasoning engine
    - Connect to LLM providers

[ ] 11. Deploy lucidia-platform to CF Pages
    - Chat interface at lucidia.blackroad.io
    - Connected to lucidia-core

[ ] 12. Implement Homework Portal
    - Basic question/answer flow
    - Subject detection
    - Response storage

[ ] 13. Implement Creator Portal scaffold
    - Project management
    - Template selection
    - Draft storage
```

---

## 5. MISSING FILES TO GENERATE

### SERVICE_REGISTRY.json (for blackroad-os-infra)

```json
{
  "$schema": "./schemas/service-registry.schema.json",
  "version": "1.0.0",
  "updated": "2025-12-01",
  "services": [
    {
      "id": "web",
      "name": "blackroad-os-web",
      "repo": "BlackRoad-OS/blackroad-os-web",
      "provider": "cloudflare-pages",
      "domain": "blackroad.io",
      "endpoints": {
        "health": "/health",
        "version": "/version"
      }
    },
    {
      "id": "core",
      "name": "blackroad-os-core",
      "repo": "BlackRoad-OS/blackroad-os-core",
      "provider": "railway",
      "internal": true,
      "port": 4000,
      "endpoints": {
        "health": "/health",
        "infra": "/api/infra"
      }
    },
    {
      "id": "api",
      "name": "blackroad-os-api",
      "repo": "BlackRoad-OS/blackroad-os-api",
      "provider": "railway",
      "domain": "api.blackroad.io",
      "port": 8080,
      "endpoints": {
        "health": "/health",
        "version": "/version"
      }
    },
    {
      "id": "docs",
      "name": "blackroad-os-docs",
      "repo": "BlackRoad-OS/blackroad-os-docs",
      "provider": "cloudflare-pages",
      "domain": "docs.blackroad.io",
      "endpoints": {
        "health": "/health"
      }
    },
    {
      "id": "prism",
      "name": "blackroad-os-prism-console",
      "repo": "BlackRoad-OS/blackroad-os-prism-console",
      "provider": "cloudflare-pages",
      "domain": "app.blackroad.io",
      "endpoints": {
        "health": "/health"
      }
    }
  ]
}
```

### Operator Manifest (for blackroad-os-operator)

```yaml
# operator.manifest.yaml
name: blackroad-os-operator
version: 0.1.0

jobs:
  - name: infra-sync
    schedule: "0 * * * *"  # Every hour
    command: pnpm infra:sync
    timeout: 300s

  - name: health-check
    schedule: "*/5 * * * *"  # Every 5 minutes
    command: pnpm health:check
    timeout: 60s

workers:
  - name: agent-runner
    concurrency: 5
    queue: agent-tasks

  - name: notification-sender
    concurrency: 2
    queue: notifications

integrations:
  - github
  - cloudflare
  - railway
```

### Deploy Script (for CI/CD)

```bash
#!/bin/bash
# deploy.sh - BlackRoad OS deployment script

set -e

SERVICE=$1
ENV=${2:-production}

case $SERVICE in
  web)
    echo "Deploying blackroad-os-web to Cloudflare Pages..."
    cd /path/to/blackroad-os-web
    pnpm build
    wrangler pages deploy .out --project-name=blackroad-os-web
    ;;

  core)
    echo "Deploying blackroad-os-core to Railway..."
    cd /path/to/blackroad-os-core
    railway up
    ;;

  api)
    echo "Deploying blackroad-os-api to Railway..."
    cd /path/to/blackroad-os-api
    railway up
    ;;

  docs)
    echo "Deploying blackroad-os-docs to Cloudflare Pages..."
    cd /path/to/blackroad-os-docs
    pnpm build
    wrangler pages deploy out --project-name=blackroad-os-docs
    ;;

  all)
    $0 core $ENV
    $0 api $ENV
    $0 web $ENV
    $0 docs $ENV
    ;;

  *)
    echo "Usage: deploy.sh [web|core|api|docs|all] [production|staging]"
    exit 1
    ;;
esac

echo "✓ Deployment complete"
```

---

## 6. IMMEDIATE NEXT ACTIONS

### Right Now (Copy-Paste Ready)

**Step 1: Deploy Core to Railway**
```bash
cd /Users/alexa/blackroad-os-core
railway link  # Select: blackroad-os-core project
railway up
```

**Step 2: Deploy Web to Cloudflare Pages**
```bash
cd /Users/alexa/blackroad-os-web
pnpm build
wrangler pages project create blackroad-os-web --production-branch main
wrangler pages deploy .out --project-name=blackroad-os-web
```

**Step 3: Configure DNS**
```bash
# In Cloudflare dashboard, add CNAME:
# blackroad.io → blackroad-os-web.pages.dev
# api.blackroad.io → [railway-public-url]
```

**Step 4: Verify**
```bash
curl https://blackroad.io/health
curl https://blackroad.io/infra
curl https://api.blackroad.io/health
```

---

## Ready for confirmation. Say 'approve' to execute Phase 1.

---

*Generated by cece.governor.v1*
*BlackRoad OS Launch Sequence v1.0*
