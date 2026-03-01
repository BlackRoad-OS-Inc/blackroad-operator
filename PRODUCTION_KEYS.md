# PRODUCTION KEYS & PRODUCTS MANIFEST

> **BlackRoad OS, Inc.** — Your AI. Your Hardware. Your Rules.
>
> Single source of truth for all production keys, products, and service configuration.
> Last updated: 2026-02-28

---

## Table of Contents

1. [Stripe Products & Prices](#stripe-products--prices)
2. [Payment Links](#payment-links)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Infrastructure Accounts](#infrastructure-accounts)
5. [Cloudflare Resources](#cloudflare-resources)
6. [Deployed Services](#deployed-services)
7. [Device Fleet](#device-fleet)
8. [GitHub Organizations](#github-organizations)
9. [Secrets Deployment Checklist](#secrets-deployment-checklist)

---

## Stripe Products & Prices

**Account:** BlackRoad (`acct_1S70Zn3e5FMFdlFw`)
**Dashboard:** https://dashboard.stripe.com/acct_1S70Zn3e5FMFdlFw/apikeys

### Products

| Product | Stripe Product ID | Status |
|---------|-------------------|--------|
| BlackRoad OS - Free | `prod_U44z9MYb3qlT4J` | ACTIVE |
| BlackRoad OS - Pro | `prod_U44zFTKhJ5pJNR` | ACTIVE |
| BlackRoad OS - Enterprise | `prod_U44zceSnDMaEmX` | ACTIVE |

### Prices

| Tier | Interval | Amount | Stripe Price ID | Env Var |
|------|----------|--------|-----------------|---------|
| Pro | Monthly | $29.00 | `price_1T5wq63e5FMFdlFwHhMAtyNi` | `STRIPE_PRICE_PRO_MONTHLY` |
| Pro | Yearly | $290.00 | `price_1T5wq73e5FMFdlFw5ELr89dX` | `STRIPE_PRICE_PRO_YEARLY` |
| Enterprise | Monthly | $199.00 | `price_1T5wq83e5FMFdlFwt53jdGqX` | `STRIPE_PRICE_ENT_MONTHLY` |
| Enterprise | Yearly | $1,990.00 | `price_1T5wq83e5FMFdlFw6Bsae4dK` | `STRIPE_PRICE_ENT_YEARLY` |

### Pricing Summary

```
FREE        $0/mo       3 Agents     100 tasks/mo     Community support
PRO         $29/mo      100 Agents   10K tasks/mo     Priority support, webhooks
            $290/yr     (save $58)   14-day trial     Advanced analytics
ENTERPRISE  $199/mo     Unlimited    Unlimited        24/7 support, SSO/SAML
            $1,990/yr   (save $398)  14-day trial     Audit logs, 99.9% SLA
CUSTOM      Contact     Unlimited    Unlimited        White-label, dedicated infra
```

---

## Payment Links

Ready-to-use checkout links:

| Tier | Interval | Payment Link | Link ID |
|------|----------|--------------|---------|
| Pro | Monthly | https://buy.stripe.com/5kQbIUd3y8xT8SD3s04Vy00 | `plink_1T5wqI3e5FMFdlFwMvpVtili` |
| Pro | Yearly | https://buy.stripe.com/7sY28k0gM9BX2uf7Ig4Vy01 | `plink_1T5wqJ3e5FMFdlFwmlVPNFmv` |
| Enterprise | Monthly | https://buy.stripe.com/bJe9AM7Je29v9WH2nW4Vy02 | `plink_1T5wqK3e5FMFdlFwzyH5bo9J` |
| Enterprise | Yearly | https://buy.stripe.com/fZu14ge7CcO9fh17Ig4Vy03 | `plink_1T5wqM3e5FMFdlFwJqI2KOoq` |

---

## Environment Variables Reference

### Payment Gateway (Wrangler / Railway / Vercel)

```bash
# Stripe API Keys (from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...          # Secret key - NEVER expose publicly
STRIPE_PUBLISHABLE_KEY=pk_live_...     # Public key - safe for frontend
STRIPE_WEBHOOK_SECRET=whsec_...        # Webhook endpoint signing secret

# Stripe Price IDs (PRODUCTION - created 2026-02-28)
STRIPE_PRICE_PRO_MONTHLY=price_1T5wq63e5FMFdlFwHhMAtyNi
STRIPE_PRICE_PRO_YEARLY=price_1T5wq73e5FMFdlFw5ELr89dX
STRIPE_PRICE_ENT_MONTHLY=price_1T5wq83e5FMFdlFwt53jdGqX
STRIPE_PRICE_ENT_YEARLY=price_1T5wq83e5FMFdlFw6Bsae4dK
```

### Cloudflare Workers

```bash
# Account
CLOUDFLARE_ACCOUNT_ID=848cf0b18d51e0170e0d1537aec3505a
CF_API_TOKEN=...                       # Scoped API token

# Wrangler Secrets (set via `wrangler secret put`)
# api-gateway:
#   ANTHROPIC_API_KEY, OPENAI_API_KEY, TUNNEL_URL
# payment-gateway:
#   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

### Authentication (Clerk)

```bash
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### AI Provider Keys

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

### Cloud Platform Tokens

```bash
# Railway
RAILWAY_TOKEN=...

# Vercel (Team: alexa-amundsons-projects)
VERCEL_TOKEN=...

# DigitalOcean
DIGITALOCEAN_ACCESS_TOKEN=...
DO_TOKEN=...

# GitHub
GH_TOKEN=ghp_...
GITHUB_TOKEN=...
```

### Google Services

```bash
GOOGLE_CLIENT_ID=...                   # OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=...               # OAuth 2.0 Client Secret
# Scopes needed: Drive (read/write), Photos (read)
```

### Communication

```bash
SENDGRID_API_KEY=SG....
SLACK_TOKEN=xoxb-...
```

### Database

```bash
DATABASE_URL=postgresql://...          # Primary Postgres
TURSO_DATABASE_URL=libsql://...        # Turso/LibSQL
TURSO_AUTH_TOKEN=...
REDIS_URL=redis://...
```

### Security

```bash
JWT_SECRET=...                         # openssl rand -base64 32
NEXTAUTH_SECRET=...                    # openssl rand -base64 32
NEXTAUTH_URL=https://os.blackroad.io
```

---

## Infrastructure Accounts

| Service | Account/Identifier | Role |
|---------|-------------------|------|
| **Stripe** | `acct_1S70Zn3e5FMFdlFw` | Payments & billing |
| **Cloudflare** | `848cf0b18d51e0170e0d1537aec3505a` | Edge, CDN, DNS, Workers, KV, D1, R2 |
| **GitHub** | `blackroad-os` (enterprise), `blackboxprogramming` (user) | Source, CI/CD |
| **DigitalOcean** | shellfish droplet `159.65.43.12` | Cloud bridge |
| **Vercel** | Team: `alexa-amundsons-projects` | Web app hosting |
| **Salesforce** | Profiles: `w0290jck2ebf0xos3p`, `alexa-amundson` | CRM (free dev edition) |
| **Notion** | Workspace: `76cded82e3874f9db0d44dff11b8f2fd` | Documentation |
| **Railway** | Multiple projects (14 configured) | GPU inference, services |
| **Instagram** | `@blackroad.io` | Social |

---

## Cloudflare Resources

### DNS Zones (19)

| # | Domain | Purpose |
|---|--------|---------|
| 1 | `blackroad.io` | Primary platform |
| 2 | `blackroadai.com` | AI brand |
| 3 | `blackroad.company` | Corporate |
| 4 | `blackroadinc.us` | US entity |
| 5 | `blackroad.me` | Personal brand |
| 6 | `blackroad.network` | Network services |
| 7 | `blackroad.systems` | Systems brand |
| 8 | `blackroadqi.com` | Quantum Intelligence |
| 9 | `blackroadquantum.com` | Quantum brand |
| 10 | `blackroadquantum.info` | Quantum info |
| 11 | `blackroadquantum.net` | Quantum network |
| 12 | `blackroadquantum.shop` | Quantum shop |
| 13 | `blackroadquantum.store` | Quantum store |
| 14 | `lucidiaqi.com` | Lucidia QI |
| 15 | `lucidia.studio` | Lucidia Studio |
| 16 | `roadchain.io` | RoadChain/blockchain |
| 17 | `roadcoin.io` | RoadCoin |
| 18 | `aliceqi.com` | Alice QI |
| 19 | `blackboxprogramming.io` | Blackbox brand |

### KV Namespaces (11)

| Binding | Namespace ID | Worker |
|---------|-------------|--------|
| CACHE | `c878fbcc1faf4eddbc98dcfd7485048d` | api-gateway |
| IDENTITIES | `10bf69b8bc664a5a832e348f1d0745cf` | api-gateway |
| API_KEYS | `57e48a017d4248a39df32661c3377908` | api-gateway |
| RATE_LIMIT | `245a00ee1ffe417fbcf519b2dbb141c6` | api-gateway |
| TOOLS_KV | `f7b2b20d1e1447b2917b781e6ab7e45c` | tools-api |
| TEMPLATES | `8df3dcbf63d94069975a6fa8ab17f313` | blackroad-io |
| CONTENT | `119ac3af15724b1b93731202f2968117` | blackroad-io |
| JOBS | `2557a2b503654590ab7b1da84c7e8b20` | remotejobs |
| APPLICATIONS | `90407b533ddc44508f1ce0841c77082d` | remotejobs |
| SUBSCRIPTIONS_KV | `0cf493d5d19141df8912e3dc2df10464` | payment-gateway |
| USERS_KV | `67a82ad7824d4b89809e7ae2221aba66` | payment-gateway |

### D1 Databases (6)

| Database | ID | Used By |
|----------|----|---------|
| blackroad-os-main | `e2c6dcd9-c21a-48ac-8807-7b3a6881c4f7` | api-gateway, blackroad-io |
| blackroad-continuity | `f0721506-cb52-41ee-b587-38f7b42b97d9` | command-center, agents-api, tools-api |
| apollo-agent-registry | `79f8b80d-3bb5-4dd4-beee-a77a1084b574` | prism-console |
| apollo-agent-registry | `0abd9447-9479-4138-ab04-cd0ae47b2e30` | blackroad-os |
| blackroad-saas | `c7bec6d8-42fa-49fb-9d8c-57d626dde6b9` | blackroad-os, blackroad-io-app |
| blackroad_revenue | `8744905a-cf6c-4e16-9661-4c67d340813f` | payment-gateway |

### R2 Storage

| Bucket | Size | Contents |
|--------|------|----------|
| blackroad-models | ~135 GB | Qwen 72B, Llama 70B, DeepSeek R1 (Q4_K_M) |

---

## Deployed Services

### Live (Cloudflare Pages)

| Subdomain | Deploy URL | Project |
|-----------|-----------|---------|
| `os.blackroad.io` | `a81f29a4.blackroad-os-web.pages.dev` | blackroad-os-web |
| `products.blackroad.io` | `79ea5ba2.blackroad-dashboard.pages.dev` | blackroad-dashboard |
| `roadtrip.blackroad.io` | `1486760f.blackroad-pitstop.pages.dev` | blackroad-pitstop |
| `pitstop.blackroad.io` | `30db9407.blackroad-portals.pages.dev` | blackroad-portals |

### Workers (Key Routes)

| Worker | Route |
|--------|-------|
| blackroad-api-gateway | `api.blackroad.io/*`, `core.blackroad.io/*`, `operator.blackroad.io/*` |
| blackroad-payment-gateway | `pay.blackroad.io/*`, `payments.blackroad.io/*` |
| blackroad-io | `blackroad.io/*` |

### Local Services

| Service | Port | Host |
|---------|------|------|
| Gateway | `:8080` | Local fleet |
| NATS | `:4222` | Message bus |
| Milvus | `:6333` | Vector DB |
| Ollama | `:11434` | Local LLM |
| MCP Bridge | `:8420` | 127.0.0.1 |
| Dashboard | `:3002` | localhost |

---

## Device Fleet

| Node | Role | Details |
|------|------|---------|
| alice | control-plane | Pi 400, VPN hub, Kubernetes |
| aria | operations | Pi 5, agent orchestration |
| octavia | inference | Pi 5 + Hailo-8 (26 TOPS), 3D printing |
| lucidia | recursive-core | Pi 5 + Hailo-8, Salesforce sync |
| codex | build | CI tasks |
| shellfish | cloud-bridge | DigitalOcean `159.65.43.12` |
| cecilia | development | Mac |
| arcadia | mobile | iPhone |
| anastasia | experimental | Sandbox |

**Agent Software (6):** LUCIDIA (red), ALICE (cyan), OCTAVIA (green), PRISM (yellow), ECHO (purple), CIPHER (blue)
**Capacity:** 30,000 agents (22,500 octavia + 7,500 lucidia)

---

## GitHub Organizations (16)

| # | Organization | Purpose |
|---|-------------|---------|
| 1 | BlackRoad-OS | Core OS, operator, infrastructure |
| 2 | BlackRoad-AI | AI models, routing, inference |
| 3 | BlackRoad-Labs | Research, experiments |
| 4 | BlackRoad-Cloud | Cloud services, deployment |
| 5 | BlackRoad-Hardware | IoT, ESP32, Pi projects |
| 6 | BlackRoad-Education | Learning, documentation |
| 7 | BlackRoad-Gov | Governance, voting |
| 8 | BlackRoad-Security | Security tools, auditing |
| 9 | BlackRoad-Foundation | CRM, business tools |
| 10 | BlackRoad-Media | Content, publishing |
| 11 | BlackRoad-Studio | Design, creative tools |
| 12 | BlackRoad-Interactive | Games, 3D, metaverse |
| 13 | BlackRoad-Ventures | Business, commerce |
| 14 | BlackRoad-Archive | Storage, backup |
| 15 | Blackbox-Enterprises | Enterprise solutions (n8n, Airbyte, Prefect) |
| 16 | blackboxprogramming | Personal account |

---

## Secrets Deployment Checklist

### Cloudflare Workers (via `wrangler secret put`)

```bash
# Payment Gateway Worker
wrangler secret put STRIPE_SECRET_KEY --name blackroad-payment-gateway
wrangler secret put STRIPE_WEBHOOK_SECRET --name blackroad-payment-gateway

# API Gateway Worker
wrangler secret put ANTHROPIC_API_KEY --name blackroad-api-gateway
wrangler secret put OPENAI_API_KEY --name blackroad-api-gateway
wrangler secret put TUNNEL_URL --name blackroad-api-gateway
```

### GitHub Repository Secrets

```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY=price_1T5wq63e5FMFdlFwHhMAtyNi
STRIPE_PRICE_PRO_YEARLY=price_1T5wq73e5FMFdlFw5ELr89dX
STRIPE_PRICE_ENT_MONTHLY=price_1T5wq83e5FMFdlFwt53jdGqX
STRIPE_PRICE_ENT_YEARLY=price_1T5wq83e5FMFdlFw6Bsae4dK
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=848cf0b18d51e0170e0d1537aec3505a
RAILWAY_TOKEN
VERCEL_TOKEN
DIGITALOCEAN_ACCESS_TOKEN
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
OPENAI_API_KEY
ANTHROPIC_API_KEY
```

### Railway Variables

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY=price_1T5wq63e5FMFdlFwHhMAtyNi
STRIPE_PRICE_PRO_YEARLY=price_1T5wq73e5FMFdlFw5ELr89dX
STRIPE_PRICE_ENT_MONTHLY=price_1T5wq83e5FMFdlFwt53jdGqX
STRIPE_PRICE_ENT_YEARLY=price_1T5wq83e5FMFdlFw6Bsae4dK
NODE_ENV=production
```

### Vercel Environment Variables

```
STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_API_URL=https://api.blackroad.io
NEXT_PUBLIC_ENV=production
```

---

*MOVE FASTER. THINK HARDER. ALWAYS BELIEVE.*
*Your AI. Your Hardware. Your Rules.*
