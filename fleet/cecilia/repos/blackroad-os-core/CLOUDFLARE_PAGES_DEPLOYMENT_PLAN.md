# Cloudflare Pages Individual Deployment Plan

**Date:** December 13, 2025
**Goal:** Deploy each BlackRoad OS project to its own Cloudflare Page with unique content

---

## Priority Projects for Individual Deployment

### Tier 1: Core Public-Facing (Deploy First)

1. **blackroad-os-web** → `blackroad.io` (main site)
   - Status: ✅ Already deployed
   - Domains: blackroad.io, blackroad.me, etc.
   - Action: Keep as-is, this is the main landing page

2. **blackroad-os-docs** → `docs.blackroad.io`
   - Status: ✅ Already has Pages project
   - Repo: blackroad-os-docs (Public)
   - Content: Documentation hub
   - Action: Add custom domain docs.blackroad.io

3. **blackroad-os-brand** → `brand.blackroad.io`
   - Status: ✅ Already has Pages project
   - Repo: blackroad-os-brand (Private)
   - Content: Brand assets, design system
   - Action: Add custom domain brand.blackroad.io

4. **blackroad-os-prism-console** → `prism.blackroad.io`
   - Status: ✅ Already has Pages project (blackroad-os-prism)
   - Repo: blackroad-os-prism-console (Private)
   - Content: Prism console UI
   - Action: Add custom domain prism.blackroad.io

5. **lucidia-platform** → `lucidia.earth`
   - Status: ⚠️ Needs new Pages project
   - Repo: lucidia-platform (Public)
   - Content: Lucidia learning platform
   - Domains: lucidia.earth, app.lucidia.earth
   - Action: Create new Pages project, connect repo

### Tier 2: Developer & Research Tools

6. **lucidia-math** → `math.lucidia.earth`
   - Repo: lucidia-math (Public)
   - Content: Mathematical engines
   - Action: Create new Pages project

7. **lucidia-core** → `core.lucidia.earth`
   - Repo: lucidia-core (Public)
   - Content: AI reasoning engines
   - Action: Create new Pages project

8. **blackroad-tools** → `tools.blackroad.io`
   - Repo: blackroad-tools (Public)
   - Content: ERP, CRM, DevOps utilities
   - Action: Create new Pages project

9. **blackroad-os-archive** → `archive.blackroad.io`
   - Repo: blackroad-os-archive (Private)
   - Content: Deploy logs, beacon maps
   - Action: Create new Pages project (read-only archive viewer)

### Tier 3: Specialized Applications

10. **Agent Marketplace** → `agents.blackroad.io`
    - Source: New repo or subfolder in blackroad-os-core
    - Content: Agent template marketplace UI
    - Action: Create dedicated app + Pages project

11. **Chat Interface** → `chat.blackroad.io`
    - Source: New repo or subfolder in blackroad-os-core
    - Content: Chat interface for agents
    - Action: Create dedicated app + Pages project

12. **API Documentation** → `api.blackroad.io`
    - Source: OpenAPI specs from blackroad-os-api
    - Content: Interactive API docs (Swagger/Redoc)
    - Action: Create static docs site + Pages project

13. **Status Dashboard** → `status.blackroad.io`
    - Source: New lightweight status page
    - Content: System status, uptime monitoring
    - Action: Create simple status page + Pages project

### Tier 4: Domain-Specific Packs

14. **Finance Pack** → `finance.blackroad.io`
    - Source: blackroad-os-pack-finance
    - Content: Financial agent tools and UI
    - Action: Create Pages project if has web UI

15. **Creator Studio** → `creator.blackroad.io` / `studio.blackroad.io`
    - Source: blackroad-os-pack-creator-studio
    - Content: Creative tools and templates
    - Action: Create Pages project

16. **Research Lab** → `research.blackroad.io` / `lab.blackroad.io`
    - Source: blackroad-os-pack-research-lab
    - Content: Research tools and interfaces
    - Action: Create Pages project

17. **DevOps Pack** → `devops.blackroad.io`
    - Source: blackroad-os-pack-infra-devops
    - Content: Infrastructure management UI
    - Action: Create Pages project

---

## Deployment Strategy

### Step 1: Configure Existing Projects

For projects that already have Cloudflare Pages:

```bash
# 1. blackroad-os-docs
cd /path/to/blackroad-os-docs
wrangler pages project create blackroad-os-docs-production
# Add custom domain: docs.blackroad.io

# 2. blackroad-os-brand
cd /path/to/blackroad-os-brand
# Already exists, just add custom domain: brand.blackroad.io

# 3. blackroad-os-prism-console
# Already exists as blackroad-os-prism
# Add custom domain: prism.blackroad.io
```

### Step 2: Create New Pages Projects

For projects that need new Cloudflare Pages:

```bash
# Example: lucidia-platform
cd /path/to/lucidia-platform
wrangler pages project create lucidia-platform
wrangler pages deployment create --project-name=lucidia-platform --branch=main

# Add custom domains
wrangler pages deployment tail lucidia-platform
```

### Step 3: GitHub Actions Integration

Create `.github/workflows/deploy-cloudflare.yml` in each repo:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          npm install
          npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: 848cf0b18d51e0170e0d1537aec3505a
          projectName: YOUR_PROJECT_NAME
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Step 4: DNS Configuration

For each custom subdomain, add a CNAME record:

```bash
# Example DNS records needed
docs.blackroad.io       CNAME blackroad-os-docs.pages.dev
brand.blackroad.io      CNAME blackroad-os-brand.pages.dev
prism.blackroad.io      CNAME blackroad-os-prism.pages.dev
lucidia.earth           CNAME lucidia-platform.pages.dev
agents.blackroad.io     CNAME blackroad-agents.pages.dev
chat.blackroad.io       CNAME blackroad-chat.pages.dev
status.blackroad.io     CNAME blackroad-status.pages.dev
```

---

## Build Configurations Per Project

### Next.js Projects (blackroad-os-web, blackroad-os-prism-console)

```toml
# wrangler.toml
name = "project-name"
pages_build_output_dir = ".next"

[build]
command = "npm run build"

[[env.production]]
name = "production"
```

### Static Sites (blackroad-os-docs, blackroad-os-brand)

```toml
# wrangler.toml
name = "project-name"
pages_build_output_dir = "dist"

[build]
command = "npm run build"
# OR for simple HTML sites
command = "echo 'No build needed'"
```

### React/Vite Projects (lucidia-platform, agent apps)

```toml
# wrangler.toml
name = "project-name"
pages_build_output_dir = "dist"

[build]
command = "npm run build"
```

### Documentation Sites (API docs, OpenAPI)

```toml
# wrangler.toml
name = "api-docs"
pages_build_output_dir = "build"

[build]
command = "npx redoc-cli build openapi.yaml -o build/index.html"
```

---

## Quick Reference: Project → Domain Mapping

| Project | Cloudflare Pages Name | Primary Domain | Status |
|---------|----------------------|----------------|--------|
| blackroad-os-web | blackroad-os-web | blackroad.io | ✅ Live |
| blackroad-os-docs | blackroad-os-docs | docs.blackroad.io | ⚠️ Need domain |
| blackroad-os-brand | blackroad-os-brand | brand.blackroad.io | ⚠️ Need domain |
| blackroad-os-prism-console | blackroad-os-prism | prism.blackroad.io | ⚠️ Need domain |
| lucidia-platform | lucidia-platform | lucidia.earth | ❌ Need to create |
| lucidia-math | lucidia-math | math.lucidia.earth | ❌ Need to create |
| lucidia-core | lucidia-core | core.lucidia.earth | ❌ Need to create |
| blackroad-tools | blackroad-tools | tools.blackroad.io | ❌ Need to create |
| blackroad-os-archive | blackroad-archive | archive.blackroad.io | ❌ Need to create |
| Agent Marketplace | blackroad-agents | agents.blackroad.io | ❌ Need to build |
| Chat Interface | blackroad-chat | chat.blackroad.io | ❌ Need to build |
| API Docs | blackroad-api-docs | api.blackroad.io | ❌ Need to build |
| Status Dashboard | blackroad-status | status.blackroad.io | ✅ Exists (placeholder) |

---

## Cleanup: Remove Duplicate Subdomain Projects

These projects are currently redundant (all point to same content):

```bash
# Can be safely deleted or repurposed
- subdomains-blackroad-io
- subdomains-blackroad-me
- subdomains-blackroad-network
- blackroad-subdomains-*
# ... (20+ projects)
```

**Recommendation:** Delete these and use proper custom domains on the actual project Pages instead.

---

## Next Actions

### Immediate (Today)
1. ✅ Audit complete - understand current state
2. ⏳ Add custom domains to existing Pages projects
3. ⏳ Create lucidia-platform Pages project
4. ⏳ Configure DNS for priority subdomains

### Short-term (This Week)
5. Create agent marketplace app + deployment
6. Create chat interface + deployment
7. Set up GitHub Actions for auto-deployment
8. Delete redundant subdomain projects

### Medium-term (Next Week)
9. Build out pack-specific UIs
10. Create API documentation site
11. Deploy all Tier 2 & 3 projects
12. Complete domain routing configuration

---

## Testing Checklist

After each deployment:

- [ ] Build succeeds in Cloudflare Pages
- [ ] Custom domain resolves correctly
- [ ] HTTPS certificate is active
- [ ] Content is unique (not duplicated from blackroad-os-web)
- [ ] GitHub Actions auto-deploys on push
- [ ] Performance: <2s initial load
- [ ] Mobile responsive
- [ ] SEO meta tags present

---

## Automation Script

Create `scripts/deploy-all-pages.sh`:

```bash
#!/bin/bash

# Deploy all Cloudflare Pages projects
# Usage: ./scripts/deploy-all-pages.sh

PROJECTS=(
  "blackroad-os-docs:docs.blackroad.io"
  "blackroad-os-brand:brand.blackroad.io"
  "lucidia-platform:lucidia.earth"
  "blackroad-tools:tools.blackroad.io"
)

for project in "${PROJECTS[@]}"; do
  IFS=':' read -r name domain <<< "$project"
  echo "Deploying $name to $domain..."

  cd "../$name" || continue

  # Build
  npm install
  npm run build

  # Deploy
  wrangler pages deploy dist --project-name="$name"

  # Add custom domain
  # (requires manual step in dashboard or API call)

  echo "✅ $name deployed"
done
```

---

**Total Individual Pages Needed:** ~15-20 unique projects
**Estimated Deployment Time:** 4-6 hours with automation
**Maintenance:** GitHub Actions handles ongoing deployments
