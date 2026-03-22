# BlackRoad Cloud

The unified web platform for BlackRoad OS — 21 page templates deployed across 99 Cloudflare Pages projects, 22 Railway services, 21 GitHub Pages, 3 Raspberry Pis, and 22 Gitea repos.

## Live Status (2026-03-09)

**99/99 Cloudflare Pages deployed** | **22/22 GitHub Pages live** | **22/22 Railway services live** | **3/3 Pis live** | **20/27 custom domains healthy** | **CI/CD: all green**

### Custom Domains — Working (200)

| Domain | Type |
|--------|------|
| blackroad.io | Primary |
| blackroadai.com | Brand |
| blackroadqi.com | Brand |
| blackroadquantum.info | Brand |
| blackroadquantum.net | Brand |
| blackroadquantum.shop | Brand |
| blackroadquantum.store | Brand |
| lucidia.earth | Lucidia |
| lucidiaqi.com | Lucidia |
| dashboard.blackroad.io | Subdomain |
| status.blackroad.io | Subdomain |
| console.blackroad.io | Subdomain |
| analytics.blackroad.io | Subdomain |
| api.blackroad.io | Worker |
| earth.blackroad.io | Subdomain |
| education.blackroad.io | Subdomain |
| finance.blackroad.io | Subdomain |
| legal.blackroad.io | Subdomain |
| app.blackroad.io | Subdomain |
| demo.blackroad.io | Subdomain |

### Custom Domains — Issues

| Domain | Status | Issue |
|--------|--------|-------|
| blackroadinc.us | 525 | SSL handshake failed |
| blackroadquantum.com | 525 | SSL handshake failed |
| roadcoin.io | 525 | SSL handshake failed |
| roadchain.io | 403 | Forbidden |
| stripe.blackroad.io | 404 | Worker route |
| creator-studio.blackroad.io | 530 | Origin DNS error |
| research-lab.blackroad.io | 530 | Origin DNS error |
| admin.blackroad.io | 000 | DNS/tunnel misconfigured |
| content.blackroad.io | 000 | DNS/tunnel misconfigured |
| customer-success.blackroad.io | 000 | DNS/tunnel misconfigured |
| design.blackroad.io | 000 | DNS/tunnel misconfigured |
| engineering.blackroad.io | 000 | DNS/tunnel misconfigured |
| healthcare.blackroad.io | 000 | DNS/tunnel misconfigured |
| hr.blackroad.io | 000 | DNS/tunnel misconfigured |
| marketing.blackroad.io | 000 | DNS/tunnel misconfigured |
| operations.blackroad.io | 000 | DNS/tunnel misconfigured |
| product.blackroad.io | 000 | DNS/tunnel misconfigured |
| resume.blackroad.io | 000 | DNS/tunnel misconfigured |
| sales.blackroad.io | 000 | DNS/tunnel misconfigured |
| signup.blackroad.io | 000 | DNS/tunnel misconfigured |
| support.blackroad.io | 000 | DNS/tunnel misconfigured |

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 + Vite 7.3 |
| Routing | react-router-dom 7.13 |
| Charts | Recharts 3.8 |
| Payments | Stripe (via `stripe.blackroad.io` Worker) |
| Auth | Clerk (planned) |
| Hosting | Cloudflare Pages (99) + Railway + 3 Pis + GitHub |
| Build | 1.0 MB total (`dist/`) |
| Source | 12,506 lines across 21 pages + 4 libraries |

## Routes (22)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | BlackRoadLanding | Landing page with pricing tiers |
| `/dashboard` | BlackRoadDashboard | Internal metrics and charts |
| `/os` | BlackRoadOS | Desktop OS with 9 apps |
| `/status` | BlackRoadStatus | System status monitor |
| `/chat` | BlackRoadChat | Chat interface |
| `/chat2` | BlackRoadChat2 | Chat v2 |
| `/terminal` | LucidiaTerminal | Lucidia terminal emulator |
| `/explorer` | BlackRoadExplorer | File/data explorer |
| `/chain` | RoadChainExplorer | RoadChain blockchain explorer |
| `/docs` | BlackRoadDocs | Documentation |
| `/about` | AboutPage | Company info |
| `/leadership` | LeadershipPage | Leadership team |
| `/auth` | BlackRoadAuth | Authentication |
| `/settings` | BlackRoadSettings | Settings panel |
| `/onboarding` | BlackRoadOnboarding | User onboarding flow |
| `/roadmap` | BlackRoadRoadmapPage | Product roadmap |
| `/brand` | BlackRoadBrandSystem | Brand system reference |
| `/brand-kit` | BrandTemplate | Brand template kit |
| `/animations` | BlackRoadAnimations | Animation showcase |
| `/command` | BlackRoadCommand | Command palette |
| `/pricing` | BlackRoadPricing | Stripe pricing + checkout |
| `/billing` | BlackRoadPricing | Billing management |

## Brand System

- **Background**: `#000000` (pure black)
- **Gradient stops**: `#FF6B2B` → `#FF2255` → `#CC00AA` → `#8844FF` → `#4488FF` → `#00D4FF`
- **Fonts**: Space Grotesk (headings), Inter (body), JetBrains Mono (code)

## Libraries

| File | Purpose | Lines |
|------|---------|-------|
| `src/lib/config.js` | Central config (Stripe keys, endpoints, price IDs) | — |
| `src/lib/hybrid-memory.js` | 12-layer hybrid memory engine (x2.18B multiplier) | 501 |
| `src/lib/pixel-memory.js` | Binary pixel memory (x4,096 multiplier) | — |
| `src/lib/trinary-memory.js` | Base-3 trinary memory (x531,441 multiplier) | — |

## Stripe Integration

- **Worker**: `stripe.blackroad.io` (Cloudflare Worker)
- **Endpoints**: `/checkout`, `/portal`, `/webhook`, `/prices`
- **Plans**: Operator ($0), Pro ($49/mo), Sovereign ($299/mo), Enterprise (custom)
- **Add-ons**: Lucidia Enhanced ($29), RoadAuth ($99), Context Bridge ($10), Knowledge Hub ($15)
- **Mode**: Live (not test)

## Deployment

All platforms deploy the same SPA build from `dist/`. SPA routing handled by `public/_redirects`.

### Platforms (all live, tested 2026-03-09)

| Platform | URL | Status |
|----------|-----|--------|
| **Cloudflare Pages** | 99 projects (74 pages.dev + 18 custom domains) | 200 |
| **Railway** | 22 services, all returning 200 (see below) | 200 |
| **GitHub Pages** | 21 repos, all Pages live at `blackboxprogramming.github.io/<name>` | 200 |
| **Gitea** | 22 repos under platform/ on Octavia | Internal |
| **Alice (Pi 400)** | http://192.168.4.49:8080 | 200 |
| **Cecilia (Pi 5)** | http://192.168.4.96:8080 | 200 |
| **Lucidia (Pi 5)** | http://192.168.4.38:8081 | 200 |

### CI/CD

Two GitHub Actions workflows auto-deploy on push to `main`:

**`.github/workflows/deploy.yml`** — Multi-platform deploy:
- Builds with Node 20
- Deploys to Cloudflare Pages
- Deploys to Railway
- Deploys to Pis via rsync (self-hosted runner)

**`.github/workflows/pages.yml`** — GitHub Pages:
- Builds with `GITHUB_PAGES=true` (relative asset paths)
- Copies `index.html` → `404.html` for SPA routing
- Deploys via `actions/deploy-pages@v4`

```bash
npm run build                    # Build to dist/
npx wrangler pages deploy dist --project-name <name> --commit-dirty=true
railway up --detach              # Deploy to Railway
```

### Railway Services (22/22 live)

| Service | URL |
|---------|-----|
| blackroad-cloud | https://blackroad-cloud-production.up.railway.app |
| blackroad-web | https://blackroad-web-production.up.railway.app |
| blackroad-os | https://blackroad-os-production.up.railway.app |
| blackroad-ai | https://blackroad-ai-production.up.railway.app |
| blackroad-core | https://blackroad-core-production.up.railway.app |
| blackroad-agents | https://blackroad-agents-production.up.railway.app |
| blackroad-api-production | https://blackroad-api-production-production.up.railway.app |
| blackroad-os-orchestrator | https://blackroad-os-orchestrator-production.up.railway.app |
| blackroad-os-inc | https://blackroad-os-inc-production.up.railway.app |
| blackroad-education | https://blackroad-education-production.up.railway.app |
| blackroad-interactive | https://blackroad-interactive-production.up.railway.app |
| blackroad-media | https://blackroad-media-production.up.railway.app |
| blackroad-foundation | https://blackroad-foundation-production.up.railway.app |
| blackroad-ventures | https://blackroad-ventures-production.up.railway.app |
| blackroad-studio | https://blackroad-studio-production.up.railway.app |
| blackroad-labs | https://blackroad-labs-production.up.railway.app |
| blackroad-archive | https://blackroad-archive-production.up.railway.app |
| blackroad-gov | https://blackroad-gov-production.up.railway.app |
| blackroad-hardware | https://blackroad-hardware-production.up.railway.app |
| blackroad-security | https://blackroad-security-production.up.railway.app |
| blackbox-enterprises | https://blackbox-enterprises-production.up.railway.app |
| blackboxprogramming | https://blackboxprogramming-production.up.railway.app |

### GitHub Pages (21/21 live)

| Repo | URL |
|------|-----|
| blackroad-cloud | https://blackboxprogramming.github.io/blackroad-cloud |
| blackroad-web | https://blackboxprogramming.github.io/blackroad-web |
| blackroad-os | https://blackboxprogramming.github.io/blackroad-os |
| blackroad-ai | https://blackboxprogramming.github.io/blackroad-ai |
| blackroad-core | https://blackboxprogramming.github.io/blackroad-core |
| blackroad-agents | https://blackboxprogramming.github.io/blackroad-agents |
| blackroad-api-production | https://blackboxprogramming.github.io/blackroad-api-production |
| blackroad-os-orchestrator | https://blackboxprogramming.github.io/blackroad-os-orchestrator |
| blackroad-os-inc | https://blackboxprogramming.github.io/blackroad-os-inc |
| blackroad-education | https://blackboxprogramming.github.io/blackroad-education |
| blackroad-interactive | https://blackboxprogramming.github.io/blackroad-interactive |
| blackroad-media | https://blackboxprogramming.github.io/blackroad-media |
| blackroad-foundation | https://blackboxprogramming.github.io/blackroad-foundation |
| blackroad-ventures | https://blackboxprogramming.github.io/blackroad-ventures |
| blackroad-studio | https://blackboxprogramming.github.io/blackroad-studio |
| blackroad-labs | https://blackboxprogramming.github.io/blackroad-labs |
| blackroad-archive | https://blackboxprogramming.github.io/blackroad-archive |
| blackroad-gov | https://blackboxprogramming.github.io/blackroad-gov |
| blackroad-hardware | https://blackboxprogramming.github.io/blackroad-hardware |
| blackroad-security | https://blackboxprogramming.github.io/blackroad-security |
| blackbox-enterprises | https://blackboxprogramming.github.io/blackbox-enterprises |

### GitHub Repos (128 total)

All Railway projects mirrored to `github.com/blackboxprogramming/<name>` and `git.blackroad.io/platform/<name>`. Each repo has GitHub Pages enabled via Actions workflow.

## Infrastructure

- **99 Cloudflare Pages projects** — all deployed
- **10 Cloudflare Workers** — api, stripe, verify, fleet, operator, core, dashboard-api, auth, quantum, road
- **22 Railway services** — all returning 200
- **128 GitHub repos** — blackboxprogramming org (21 with Pages live)
- **22 Gitea repos** — platform/ on Octavia
- **3 Pi web servers** — Alice (:8080), Cecilia (:8080), Lucidia (:8081)
- **2 DigitalOcean droplets** — gematria, anastasia
- **WireGuard mesh** — 10.8.0.x overlay network
- **2x Hailo-8 AI accelerators** — 52 TOPS total (Cecilia + Octavia)

### GitHub Actions Secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages deployment |
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages deployment |
| `RAILWAY_TOKEN` | Railway deployment |
