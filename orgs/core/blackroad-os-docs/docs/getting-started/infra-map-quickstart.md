# Infra Map v1 Quickstart

The Infra Map is BlackRoad OS's central dashboard for viewing all your infrastructure in one place: services, domains, and repositories across GitHub, Cloudflare, and Railway.

## Overview

Infra Map v1 is **read-only**. It discovers and displays:

- **Projects** - Logical groupings of related services
- **Services** - Running deployments on Railway, Cloudflare Pages, etc.
- **Domains** - DNS records from Cloudflare
- **Repositories** - GitHub repos linked to services

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (for blackroad-os-core)
- API tokens for:
  - GitHub (Personal Access Token or GitHub App)
  - Cloudflare (API Token with Zone:Read, DNS:Read)
  - Railway (API Token)

## Environment Variables

### blackroad-os-core

Create a `.env` file in `blackroad-os-core/`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blackroad_os"

# GitHub Integration
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
GITHUB_API_URL=""  # Optional: For GitHub Enterprise

# Cloudflare Integration
CLOUDFLARE_API_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLOUDFLARE_ACCOUNT_ID="your-account-id"  # Required for Tunnels/Pages

# Railway Integration
RAILWAY_TOKEN="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### blackroad-os-web

Create a `.env.local` file in `blackroad-os-web/`:

```bash
# Site Configuration
SITE_URL="https://blackroad.io"

# API Backend (when not using static export)
BLACKROAD_API_URL="http://localhost:4000"

# Analytics (optional)
PLAUSIBLE_DOMAIN="analytics.blackroad.io"
```

## Getting API Tokens

### GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (for private repos)
   - `read:org` (to list org repos)
4. Copy the token to `GITHUB_TOKEN`

### Cloudflare API Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the "Read all resources" template, or create custom with:
   - Zone: Read
   - DNS: Read
   - (Optional) Account: Cloudflare Pages: Read
4. Copy the token to `CLOUDFLARE_API_TOKEN`
5. Copy your Account ID from the dashboard URL or overview page

### Railway API Token

1. Go to [Railway Dashboard → Account Settings](https://railway.app/account/tokens)
2. Click "Create Token"
3. Give it a name like "blackroad-infra-read"
4. Copy the token to `RAILWAY_TOKEN`

## Setup

### 1. Clone and Install

```bash
# Clone the repos
git clone https://github.com/BlackRoad-OS/blackroad-os-core.git
git clone https://github.com/BlackRoad-OS/blackroad-os-web.git

# Install dependencies
cd blackroad-os-core && pnpm install
cd ../blackroad-os-web && pnpm install
```

### 2. Database Setup

```bash
cd blackroad-os-core

# Generate Prisma client
pnpm prisma generate

# Run migrations (creates tables)
pnpm prisma migrate dev

# (Optional) Seed with sample data
pnpm prisma db seed
```

### 3. Start Development

```bash
# Terminal 1: Start core (API server)
cd blackroad-os-core
pnpm dev

# Terminal 2: Start web (Next.js)
cd blackroad-os-web
pnpm dev
```

### 4. Access Infra Map

Open [http://localhost:3000/infra](http://localhost:3000/infra)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    blackroad-os-web                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  /infra     │  │  /dashboard │  │  /settings          │  │
│  │  (UI)       │  │             │  │  /integrations      │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────┘  │
│         │                                                    │
│         │ fetch /api/infra                                   │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              API Routes (Next.js)                        ││
│  └──────────────────────┬──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   blackroad-os-core                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 src/integrations/                        ││
│  │  ┌──────────┐  ┌─────────────┐  ┌──────────────┐        ││
│  │  │ github   │  │ cloudflare  │  │ railway      │        ││
│  │  │ .ts      │  │ .ts         │  │ .ts          │        ││
│  │  └────┬─────┘  └──────┬──────┘  └──────┬───────┘        ││
│  │       │               │                │                 ││
│  │       └───────────────┼────────────────┘                 ││
│  │                       ▼                                  ││
│  │              ┌─────────────────┐                         ││
│  │              │   sync.ts       │                         ││
│  │              │ InfraSyncService│                         ││
│  │              └────────┬────────┘                         ││
│  └───────────────────────┼─────────────────────────────────┘│
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Prisma / PostgreSQL                       ││
│  │  Projects, Services, Domains, Repositories, Environments ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │         External APIs               │
        │  GitHub  │  Cloudflare  │  Railway  │
        └─────────────────────────────────────┘
```

## Database Schema

The Prisma schema includes these main models for Infra Map:

| Model | Purpose |
|-------|---------|
| `Project` | Container for related services (type: infra, creator, etc.) |
| `Service` | A deployed service (Railway, Cloudflare Pages, etc.) |
| `Domain` | DNS record from Cloudflare |
| `Repository` | GitHub repository |
| `Environment` | Deployment environment (dev, staging, production) |

See full schema: `blackroad-os-core/prisma/schema.prisma`

## API Reference

### GET /api/infra

Returns the complete infrastructure snapshot.

**Response:**

```json
{
  "projects": [
    {
      "id": "proj-1",
      "name": "BlackRoad OS",
      "slug": "blackroad-os",
      "type": "infra",
      "services": [...],
      "repos": [...]
    }
  ],
  "stats": {
    "totalServices": 4,
    "totalDomains": 6,
    "totalRepos": 5,
    "healthyServices": 4,
    "degradedServices": 0,
    "downServices": 0
  },
  "integrations": {
    "github": true,
    "cloudflare": true,
    "railway": true
  },
  "lastSynced": "2024-01-15T12:00:00.000Z"
}
```

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"

Ensure your `.env` file is in the correct location and contains `GITHUB_TOKEN`.

### "Cloudflare API error: 403"

Your API token may not have the required permissions. Create a new token with Zone:Read and DNS:Read.

### "Railway API error: Unauthorized"

Railway tokens expire. Generate a new one from the Railway dashboard.

### Services showing "unknown" status

The sync may not have run yet. Click "Sync Now" on the Infra Map page.

## Next Steps

- **M1 Complete**: Read-only Infra Map is ready
- **Future**: Write operations, auto-sync schedules, alerting

---

See also:
- [API Design Reference](/docs/reference/api-design)
- [KV Schema Reference](/docs/reference/kv-schema)
- [Architecture Overview](/docs/meta/vision/architecture)
