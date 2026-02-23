# BlackRoad OS Infra Map - Complete Setup Guide

This is the **zero-braincell** guide to getting Infra Map running with real data.

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (local or Railway)
- API tokens for GitHub, Cloudflare, Railway

---

## Step 1: Create a PostgreSQL Database

### Option A: Railway (Recommended - 2 clicks)

1. Go to [railway.app/new](https://railway.app/new)
2. Click "Provision PostgreSQL"
3. Once created, click the database → "Variables" tab
4. Copy `DATABASE_URL` (looks like `postgresql://postgres:xxx@xxx.railway.app:5432/railway`)

### Option B: Local PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb blackroad_os

# Your DATABASE_URL will be:
# postgresql://localhost:5432/blackroad_os
```

---

## Step 2: Set Environment Variables

```bash
cd blackroad-os-core

# Copy example env file
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database (from Step 1)
DATABASE_URL="postgresql://postgres:xxx@xxx.railway.app:5432/railway"

# GitHub - get from https://github.com/settings/tokens
# Scopes needed: repo, read:org
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# Cloudflare - get from https://dash.cloudflare.com/profile/api-tokens
# Permissions: Zone:Read, DNS:Read
CLOUDFLARE_API_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
CLOUDFLARE_ACCOUNT_ID="your-account-id"  # From dashboard URL

# Railway - get from https://railway.app/account/tokens
RAILWAY_TOKEN="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## Step 3: Install Dependencies & Migrate Database

```bash
# In blackroad-os-core
cd /path/to/blackroad-os-core

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database (creates all tables)
pnpm db:push
```

**Expected output:**
```
Your database is now in sync with your Prisma schema.
```

---

## Step 4: Run Infra Sync

```bash
# In blackroad-os-core
pnpm infra:sync
```

**Expected output:**
```
╔════════════════════════════════════════╗
║     BlackRoad OS Infra Sync            ║
╚════════════════════════════════════════╝

--- Syncing GitHub ---
Authenticated as: your-username
Found 15 repositories
Syncing 8 BlackRoad-OS repos
  ✓ BlackRoad-OS/blackroad-os-web
  ✓ BlackRoad-OS/blackroad-os-core
  ...

--- Syncing Cloudflare ---
Cloudflare token verified
Found 2 zones
  Zone blackroad.io: 12 records
  ✓ Synced 12 DNS records

--- Syncing Railway ---
Authenticated as: your@email.com
Found 3 Railway projects
  ✓ blackroad-web/blackroad-os-web (healthy)
  ✓ blackroad-api/api (healthy)
  ...

════════════════════════════════════════
✓ Sync Complete!
  Repositories: 8
  Domains: 12
  Services: 5
════════════════════════════════════════
```

---

## Step 5: Start the Core API Server

```bash
# In blackroad-os-core
pnpm dev:api
```

**Expected output:**
```
🖤 BlackRoad OS Core API
   Server running on http://localhost:4000
   Endpoints:
     GET  /health         - Health check
     GET  /api/infra      - Full infra snapshot
     GET  /api/projects   - List projects
     ...
```

**Verify it works:**
```bash
curl http://localhost:4000/api/infra | jq
```

---

## Step 6: Start the Web App

**Open a new terminal:**

```bash
# In blackroad-os-web
cd /path/to/blackroad-os-web

# Install dependencies (if not done)
pnpm install

# Start dev server
pnpm dev
```

**Expected output:**
```
  ▲ Next.js 14.x
  - Local:        http://localhost:3000
```

---

## Step 7: See Real Data

1. Open [http://localhost:3000/infra](http://localhost:3000/infra)
2. You should see:
   - Your actual repositories from GitHub
   - Your DNS records from Cloudflare
   - Your services from Railway
   - Real health status for each service

---

## Quick Reference Commands

| Command | Directory | What it does |
|---------|-----------|--------------|
| `pnpm db:push` | blackroad-os-core | Create/update database tables |
| `pnpm db:studio` | blackroad-os-core | Open Prisma Studio (visual DB browser) |
| `pnpm infra:sync` | blackroad-os-core | Pull data from GitHub/Cloudflare/Railway |
| `pnpm dev:api` | blackroad-os-core | Start API server on :4000 |
| `pnpm dev` | blackroad-os-web | Start web app on :3000 |

---

## Troubleshooting

### "Failed to load infrastructure data" on /infra

The web app can't reach the API server.

1. Make sure `pnpm dev:api` is running in blackroad-os-core
2. Check it responds: `curl http://localhost:4000/health`

### "GITHUB_TOKEN environment variable is required"

Your `.env` file is missing or not being read.

1. Make sure `.env` exists in blackroad-os-core root
2. Check it has `GITHUB_TOKEN=ghp_...`

### "Cloudflare API error: 403 Forbidden"

Your Cloudflare token doesn't have the right permissions.

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a new token with: Zone:Read, DNS:Read

### "Railway API error: Unauthorized"

Your Railway token may have expired.

1. Go to [Railway Account Tokens](https://railway.app/account/tokens)
2. Generate a new token and update `.env`

### Empty data on /infra (shows "No projects yet")

The sync hasn't been run or didn't find any data.

1. Run `pnpm infra:sync` and check for errors
2. Verify your GitHub org is `BlackRoad-OS` or update the sync script filter

### Database connection errors

1. Check your `DATABASE_URL` is correct
2. For Railway: make sure the database is running
3. For local: make sure PostgreSQL is running (`brew services start postgresql@15`)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser: http://localhost:3000/infra                        │
│                                                              │
│  blackroad-os-web (Next.js)                                  │
│  └── app/infra/page.tsx                                      │
│       └── fetch('http://localhost:4000/api/infra')           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  http://localhost:4000                                       │
│                                                              │
│  blackroad-os-core (Hono API)                                │
│  └── src/api/server.ts                                       │
│       └── GET /api/infra                                     │
│            └── prisma.project.findFirst(...)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL                                                  │
│                                                              │
│  Tables: accounts, projects, services, domains,              │
│          repositories, environments, audit_logs              │
│                                                              │
│  (populated by: pnpm infra:sync)                             │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  pnpm infra:sync                                             │
│                                                              │
│  src/scripts/infra-sync.ts                                   │
│  └── src/integrations/                                       │
│       ├── github.ts    → api.github.com                      │
│       ├── cloudflare.ts → api.cloudflare.com                 │
│       └── railway.ts   → backboard.railway.app/graphql       │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

Once you see real data on `/infra`:

1. **Creator Portal** - `/creator` for landing pages and content
2. **Homework Portal** - `/homework` for student help
3. **Agent Swarm** - "Summarize my infra" button

---

**Questions?** Open an issue at [github.com/BlackRoad-OS/blackroad-os-docs](https://github.com/BlackRoad-OS/blackroad-os-docs/issues)
