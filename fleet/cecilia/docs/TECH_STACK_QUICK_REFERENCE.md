# BlackRoad Technology Stack - Quick Reference

**Last Updated:** 2026-02-14
**Full Report:** `/Users/alexa/BLACKROAD_TECHNOLOGY_LANDSCAPE_REPORT.md`

---

## At a Glance

| Metric | Count |
|--------|-------|
| **Total Source Files** | 137,063 |
| **Node.js Projects** | 6,698 |
| **Python Projects** | 307 |
| **Cloudflare Workers** | 208 |
| **TypeScript Configs** | 872 |
| **GitHub Actions Workflows** | 4,394 |
| **Docker Projects** | 540 |

---

## Language Distribution

1. **JavaScript:** 80,114 files (58.4%)
2. **TypeScript:** 29,102 files (21.2%)
3. **Python:** 20,025 files (14.6%)
4. **React (TSX):** 2,778 files
5. **HTML:** 2,610 files
6. **Go:** 1,004 files
7. **Rust:** 187 files

---

## Primary Tech Stack

### Frontend
- **Framework:** React (functional components, 99.6%)
- **Meta-frameworks:** Next.js (118 projects)
- **Build Tools:** Vite (39), Webpack (5 - legacy)
- **Styling:** Tailwind CSS (13 projects)
- **State:** Zustand (2), React hooks/context

### Backend
- **Edge:** Hono (6 projects) - Cloudflare Workers
- **Traditional:** Express (5), Fastify (2)
- **Python:** FastAPI (9 projects)

### Database
- **Primary:** Cloudflare D1 (315 references) - edge SQL
- **Local:** SQLite (better-sqlite3)
- **Missing:** PostgreSQL, ORMs (Prisma/Drizzle)

### Testing
- **Modern:** Vitest (10), Playwright (2)
- **Legacy:** Jest (5), Mocha (1)
- **Python:** Pytest (32)

### Infrastructure
- **Platform:** Cloudflare Workers (208)
- **Containers:** Docker (540 projects)
- **Orchestration:** Kubernetes (129 manifests)
- **IaC:** Terraform (353 files)
- **CI/CD:** GitHub Actions (4,394 workflows)

---

## Critical Issues (RED FLAGS)

### 🔴 SECURITY RISK
- **Bower still present** in 14 projects (deprecated 2017)
- **ACTION:** Immediate removal required

### 🟡 TYPE SAFETY GAP
- **TypeScript strict mode:** Only 36% enabled (18 of 50 sampled)
- **ACTION:** Enable globally in all 872 tsconfig.json

### 🟡 BUILD OPTIMIZATION BLOCKED
- **CommonJS dominance:** 97% (only 3% ESM)
- **IMPACT:** No tree-shaking, slower bundles
- **ACTION:** Migrate to ESM (`"type": "module"`)

### 🟡 TOOLING FRAGMENTATION
- **Package managers:** npm (284), pnpm (44), yarn (11)
- **ACTION:** Standardize on pnpm

### 🟡 LEGACY TOOLS
- **Gulp:** 6 projects
- **Grunt:** 1 project
- **ACTION:** Migrate to npm scripts or Vite

---

## Technology Gaps

- ❌ **No PostgreSQL** - edge-only database strategy
- ❌ **No ORM** - missing Prisma/Drizzle type safety
- ❌ **No WebSockets** - missing real-time capabilities
- ❌ **No GraphQL** - REST-only architecture
- ❌ **No design system library** - no MUI/Chakra/etc
- ❌ **Underutilized Cloudflare:** Zero KV/R2/Durable Object usage detected

---

## Immediate Actions (Next 7 Days)

```bash
# 1. Enable TypeScript strict mode
find ~/blackroad-* -name "tsconfig.json" | \
  xargs sed -i '' 's/"strict": false/"strict": true/g'

# 2. Remove Bower (CRITICAL)
find ~/blackroad-* -name "bower.json" -delete
find ~/blackroad-* -name ".bowerrc" -delete

# 3. Audit for Bower dependencies
# Migrate to npm in affected 14 projects

# 4. Add Prettier to all projects
# Deploy standard .prettierrc config

# 5. Create pnpm migration plan
# Start with new projects, migrate existing incrementally
```

---

## Key Strengths

✅ **Cloudflare-first** - 208 Workers, 315 D1 usages
✅ **Modern frontend** - React, Next.js, Vite, Tailwind
✅ **Infrastructure as Code** - 353 Terraform files, 540 Docker
✅ **Heavy automation** - 4,394 GitHub Actions workflows
✅ **Python quality** - 67% type hints, pytest adoption
✅ **No Python 2** - fully migrated to Python 3

---

## Technology Recommendations

### Adopt Now
1. **Drizzle ORM** - type-safe SQL for D1
2. **pnpm** - monorepo-optimized package manager
3. **ESM modules** - enable tree-shaking
4. **Strict TypeScript** - full type safety
5. **Prettier** - consistent formatting

### Evaluate Soon
6. **Cloudflare KV** - edge caching layer
7. **Cloudflare R2** - object storage
8. **Durable Objects** - WebSocket infrastructure
9. **PostgreSQL** - central stateful data (Supabase/Neon)
10. **Design system** - Chakra UI or Radix UI

### Consider Later
11. **GraphQL** - if complex query needs emerge
12. **Bun runtime** - faster than Node.js
13. **OpenTelemetry** - observability
14. **Monorepo consolidation** - Turborepo expansion

---

## Version Targets

### TypeScript
- **Recommended:** ES2021 or ES2022
- **Current:** Mixed (ES2021 most common, but also ES5, ES6, ESNext)

### Node.js
- **Minimum:** Node 18+ (native Fetch API)
- **Recommended:** Node 20 LTS

### Python
- **Minimum:** Python 3.9+
- **Recommended:** Python 3.11+

---

## Quick Stats

```
Programming Languages:    7+ (JS, TS, Python, Go, Rust, Swift, etc.)
Build Tools:              Vite, Next.js, Webpack, Astro, Turbo
Package Managers:         npm, pnpm, yarn (NEED TO STANDARDIZE)
Deployment Platforms:     Cloudflare Workers, Docker, Kubernetes
CI/CD Workflows:          4,394 GitHub Actions
Test Frameworks:          Vitest, Jest, Pytest, Playwright
Infrastructure:           Terraform, Docker, Kubernetes, Cloudflare
```

---

## Full Report

For complete analysis including:
- Repository technology profiles
- Configuration consistency analysis
- Technology drift patterns
- 20 detailed recommendations
- Phase-by-phase implementation roadmap

See: `/Users/alexa/BLACKROAD_TECHNOLOGY_LANDSCAPE_REPORT.md`

---

**Generated by:** Erebus (erebus-weaver-1771093745-5f1687b4)
**Memory Journal:** PS-SHA-infinity (4,107+ entries)
**BlackRoad OS Components:** 8,789 indexed
