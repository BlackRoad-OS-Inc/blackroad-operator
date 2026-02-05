# BlackRoad OS Infrastructure

> Complete guide to the multi-cloud infrastructure powering BlackRoad OS

---

## Table of Contents

- [Overview](#overview)
- [Infrastructure Map](#infrastructure-map)
- [Cloudflare](#cloudflare)
- [Railway](#railway)
- [Vercel](#vercel)
- [DigitalOcean](#digitalocean)
- [Raspberry Pi Fleet](#raspberry-pi-fleet)
- [GitHub Infrastructure](#github-infrastructure)
- [Database Layer](#database-layer)
- [Networking](#networking)
- [Security](#security)
- [Disaster Recovery](#disaster-recovery)

---

## Overview

BlackRoad OS runs on a **multi-cloud architecture** designed for resilience, performance, and sovereignty. Each cloud provider serves a specific purpose, creating a cohesive platform.

### Design Principles

1. **No Single Point of Failure** - Critical services span multiple providers
2. **Edge-First** - Compute at the edge when possible
3. **Cost Optimization** - Right tool for the right job
4. **Sovereignty** - Data ownership and control
5. **Portability** - Avoid vendor lock-in

### Provider Overview

| Provider | Role | Services | Cost/Month |
|----------|------|----------|------------|
| **Cloudflare** | Edge, CDN, DNS | Workers, KV, D1, R2, Tunnel | ~$500 |
| **Railway** | GPU, APIs, Databases | 14 projects, GPU inference | ~$1,000 |
| **Vercel** | Web apps, Serverless | 15+ Next.js apps | ~$200 |
| **DigitalOcean** | Persistent compute | 1 droplet, Spaces | ~$100 |
| **GitHub** | Source, Actions, Pages | 1,200+ repos, 50+ workflows | ~$50 |

**Total Monthly:** ~$1,850

---

## Infrastructure Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BLACKROAD INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                           INTERNET                                          │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     CLOUDFLARE EDGE                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Workers   │  │     CDN     │  │   Tunnel    │                 │   │
│  │  │   (75+)     │  │             │  │             │                 │   │
│  │  └──────┬──────┘  └─────────────┘  └──────┬──────┘                 │   │
│  │         │                                  │                        │   │
│  │  ┌──────┴──────┐  ┌─────────────┐  ┌──────┴──────┐                 │   │
│  │  │     KV      │  │     D1      │  │     R2      │                 │   │
│  │  │  (8 stores) │  │  (1 DB)     │  │  (buckets)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│          ┌───────────────────┼───────────────────┐                         │
│          │                   │                   │                         │
│          ▼                   ▼                   ▼                         │
│  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                │
│  │   RAILWAY     │   │    VERCEL     │   │ DIGITALOCEAN  │                │
│  │               │   │               │   │               │                │
│  │ • GPU (H100)  │   │ • Next.js     │   │ • Droplet     │                │
│  │ • vLLM        │   │ • Dashboard   │   │ • Codex       │                │
│  │ • APIs        │   │ • Landing     │   │ • Persistent  │                │
│  │ • Workers     │   │ • Docs        │   │ • Backups     │                │
│  │               │   │               │   │               │                │
│  │ 14 projects   │   │ 15+ projects  │   │ 1 droplet     │                │
│  └───────────────┘   └───────────────┘   └───────────────┘                │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LOCAL / EDGE DEVICES                              │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ Raspberry   │  │ Raspberry   │  │ Raspberry   │                 │   │
│  │  │ Pi (lucidia)│  │ Pi (br-pi)  │  │ Pi (alt)    │                 │   │
│  │  │ .38         │  │ .64         │  │ .99         │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │                                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐                                  │   │
│  │  │ iPhone Koder│  │ Local Mac   │                                  │   │
│  │  │ .68:8080    │  │ Dev Machine │                                  │   │
│  │  └─────────────┘  └─────────────┘                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cloudflare

### Overview

Cloudflare serves as the **edge layer** for BlackRoad OS, handling DNS, CDN, serverless compute, and edge storage.

### Zones (16 domains)

| Domain | Purpose | SSL | Status |
|--------|---------|-----|--------|
| blackroad.io | Primary domain | Full | Active |
| blackroad.systems | Systems/API | Full | Active |
| blackroad.ai | AI services | Full | Active |
| lucidia.earth | Lucidia project | Full | Active |
| ... | ... | ... | ... |

### Workers (75+)

```
Workers Overview
================

Category          Count    Requests/day
--------          -----    ------------
API Gateway       12       500K
Authentication    8        200K
Edge Functions    25       150K
Webhooks          15       50K
Utilities         15       30K

Total: 75 workers | 930K requests/day
```

**Key Workers:**

| Worker | Route | Purpose |
|--------|-------|---------|
| `blackroad-api-gateway` | `api.blackroad.io/*` | Main API routing |
| `blackroad-auth` | `auth.blackroad.io/*` | Authentication |
| `blackroad-edge-agent` | `agent.blackroad.io/*` | Agent routing |
| `blackroad-memory-edge` | `memory.blackroad.io/*` | Memory cache |
| `blackroad-redirect` | `blackroad.io/*` | URL redirects |

### KV Namespaces (8)

| Namespace | Keys | Size | Purpose |
|-----------|------|------|---------|
| `CACHE` | 50K | 2GB | Response cache |
| `CONFIG` | 500 | 1MB | Configuration |
| `SESSIONS` | 10K | 500MB | User sessions |
| `RATE_LIMIT` | 100K | 100MB | Rate limiting |
| `FEATURES` | 100 | 10KB | Feature flags |
| `AGENTS` | 1K | 50MB | Agent state |
| `MEMORY_HOT` | 5K | 500MB | Hot memory cache |
| `METRICS` | 10K | 100MB | Edge metrics |

### D1 Database

```sql
-- blackroad-d1
-- Tables: 15
-- Size: 500MB

Tables:
├── users (10K rows)
├── sessions (50K rows)
├── api_keys (5K rows)
├── rate_limits (100K rows)
├── audit_log (1M rows)
├── edge_config (500 rows)
└── ...
```

### R2 Storage

| Bucket | Objects | Size | Purpose |
|--------|---------|------|---------|
| `blackroad-archive` | 5M | 234GB | Memory archive |
| `blackroad-assets` | 10K | 5GB | Static assets |
| `blackroad-backups` | 1K | 50GB | System backups |
| `blackroad-logs` | 100K | 20GB | Log archive |

### Tunnel Configuration

```yaml
# cloudflared config
tunnel: blackroad-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: api.blackroad.io
    service: http://localhost:8000

  - hostname: dashboard.blackroad.io
    service: http://localhost:3000

  - hostname: ws.blackroad.io
    service: ws://localhost:8080

  - service: http_status:404
```

---

## Railway

### Overview

Railway hosts **GPU inference**, APIs, and managed databases. It's the primary compute layer for AI workloads.

### Projects (14)

| Project | Services | GPU | Purpose |
|---------|----------|-----|---------|
| `blackroad-api` | 3 | No | Core API |
| `blackroad-gpu` | 2 | Yes | LLM inference |
| `blackroad-agents` | 4 | No | Agent services |
| `blackroad-memory` | 2 | No | Memory services |
| `blackroad-workers` | 3 | No | Background workers |
| ... | ... | ... | ... |

### GPU Configuration

```yaml
# railway.toml for GPU service
[deploy]
numReplicas = 2
healthcheckPath = "/health"
healthcheckTimeout = 300

[build]
dockerfilePath = "Dockerfile.gpu"

[service]
gpu = "H100"
memory = "80GB"
```

### vLLM Service

```python
# vLLM configuration
{
    "model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "tensor_parallel_size": 1,
    "gpu_memory_utilization": 0.9,
    "max_model_len": 128000,
    "quantization": "awq",
    "dtype": "auto"
}
```

### Database Services

| Database | Type | Size | Connections |
|----------|------|------|-------------|
| `blackroad-postgres` | PostgreSQL 16 | 100GB | 100 |
| `blackroad-redis` | Redis 7 | 10GB | 500 |

### Scaling Configuration

```yaml
# Autoscaling rules
scaling:
  min_replicas: 2
  max_replicas: 10
  target_cpu: 70
  target_memory: 80
  scale_up_cooldown: 60s
  scale_down_cooldown: 300s
```

---

## Vercel

### Overview

Vercel hosts all **frontend applications** and serverless functions for the web layer.

### Projects (15+)

| Project | Framework | Domain | Purpose |
|---------|-----------|--------|---------|
| `blackroad-web` | Next.js 14 | app.blackroad.io | Main dashboard |
| `blackroad-docs` | Nextra | docs.blackroad.io | Documentation |
| `blackroad-landing` | Next.js | blackroad.io | Landing page |
| `blackroad-console` | Next.js | console.blackroad.io | Admin console |
| `lucidia-web` | Next.js | lucidia.earth | Lucidia site |
| ... | ... | ... | ... |

### Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1", "sfo1", "cdg1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### Edge Functions

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

---

## DigitalOcean

### Overview

DigitalOcean provides **persistent compute** for workloads that need always-on servers.

### Droplet: codex-infinity

```
Name: codex-infinity
IP: 159.65.43.12
Region: NYC1
Size: s-4vcpu-8gb
OS: Ubuntu 22.04 LTS
Storage: 160GB SSD

Services:
├── Ollama (local inference)
├── Codex system
├── Persistent storage
├── Backup services
└── Development tools
```

### Server Configuration

```bash
# /etc/systemd/system/blackroad.service
[Unit]
Description=BlackRoad Services
After=network.target

[Service]
Type=simple
User=blackroad
WorkingDirectory=/opt/blackroad
ExecStart=/opt/blackroad/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Spaces (Object Storage)

| Space | Size | Purpose |
|-------|------|---------|
| `blackroad-backup` | 50GB | Server backups |
| `blackroad-data` | 100GB | Persistent data |

### Firewall Rules

```
Name: blackroad-firewall

Inbound Rules:
├── SSH (22) - Your IP only
├── HTTP (80) - All
├── HTTPS (443) - All
├── Ollama (11434) - Internal
└── API (8000) - Internal

Outbound Rules:
└── All traffic allowed
```

---

## Raspberry Pi Fleet

### Overview

The Raspberry Pi fleet provides **edge computing** capabilities, including LED displays, local inference, and IoT integration.

### Devices

| Name | IP | Model | Role | Status |
|------|-----|-------|------|--------|
| `lucidia` | 192.168.4.38 | Pi 4 8GB | Main edge | Online |
| `blackroad-pi` | 192.168.4.64 | Pi 4 4GB | Secondary | Online |
| `lucidia-alt` | 192.168.4.99 | Pi 4 8GB | Backup | Offline |

### lucidia (Primary)

```
Device: Raspberry Pi 4 Model B (8GB)
IP: 192.168.4.38
OS: Raspberry Pi OS 64-bit

Hardware:
├── 8GB RAM
├── 128GB SD Card
├── LED Matrix (32x64)
├── Temperature sensor
└── USB peripherals

Services:
├── Ollama (llama3.2:1b)
├── LED controller
├── Agent runtime
├── Sensor monitoring
└── Edge API
```

### LED Matrix Features

```python
# LED display modes
modes = {
    "status": "System status display",
    "agent": "Agent activity visualization",
    "metrics": "Real-time metrics",
    "clock": "Digital clock",
    "message": "Text messages",
    "matrix": "Matrix rain effect"
}

# Example: Display agent status
./led.sh mode agent
./led.sh message "ALICE: Online"
./led.sh color green
```

### Fleet Management

```bash
# Manage all Pis
./pi-fleet.sh status              # Status of all Pis
./pi-fleet.sh deploy              # Deploy to all
./pi-fleet.sh update              # Update all
./pi-fleet.sh restart <service>   # Restart service
./pi-fleet.sh ssh lucidia         # SSH to specific Pi
```

---

## GitHub Infrastructure

### Organizations (16)

| Organization | Repos | Purpose |
|--------------|-------|---------|
| BlackRoad-OS | 1,143 | Core platform |
| blackboxprogramming | 68 | Personal, SDKs |
| BlackRoad-AI | 52 | AI/ML stack |
| BlackRoad-Cloud | 20 | Infrastructure |
| BlackRoad-Security | 17 | Security tools |
| ... | ... | ... |

### Actions Workflows (50+)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy.sh
```

### GitHub Pages Sites (16+)

| Site | URL | Purpose |
|------|-----|---------|
| blackroad-os | blackroad-os.github.io | Org docs |
| docs | docs.blackroad.io | Documentation |
| status | status.blackroad.io | Status page |
| ... | ... | ... |

### Secrets Management

```
Repository Secrets:
├── CLOUDFLARE_API_TOKEN
├── RAILWAY_TOKEN
├── VERCEL_TOKEN
├── DIGITALOCEAN_TOKEN
├── PINECONE_API_KEY
├── OPENAI_API_KEY
└── ...

Organization Secrets:
├── NPM_TOKEN
├── DOCKER_HUB_TOKEN
└── ...
```

---

## Database Layer

### Primary Databases

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PostgreSQL (Railway)                Redis (Railway)            │
│  ├── blackroad_main                  ├── Cache                  │
│  ├── blackroad_agents                ├── Sessions               │
│  ├── blackroad_memory                ├── Rate limits            │
│  └── blackroad_analytics             └── Job queues             │
│                                                                 │
│  Pinecone (Cloud)                    D1 (Cloudflare)           │
│  ├── semantic-memory                 ├── Edge config            │
│  └── embeddings                      └── Edge cache             │
│                                                                 │
│  R2 (Cloudflare)                     SQLite (Local)            │
│  ├── Archive storage                 ├── CECE identity          │
│  └── Backups                         └── Local cache            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Connection Strings

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/blackroad

# Redis
REDIS_URL=redis://user:pass@host:6379

# Pinecone
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1

# SQLite
SQLITE_PATH=~/.blackroad/cece-identity.db
```

---

## Networking

### DNS Configuration

```
blackroad.io                   A     104.21.x.x (Cloudflare)
*.blackroad.io                 CNAME blackroad.io
api.blackroad.io               CNAME blackroad.io (proxied)
app.blackroad.io               CNAME cname.vercel-dns.com
docs.blackroad.io              CNAME cname.vercel-dns.com
```

### SSL/TLS

- **Edge:** Cloudflare Universal SSL (automatic)
- **Origin:** Full (strict) mode
- **Certificates:** Auto-renewed via Cloudflare

### Network Security

```
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK SECURITY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Internet → Cloudflare WAF → Origin Shield → Backend           │
│                                                                 │
│  Protection Layers:                                             │
│  1. DDoS mitigation (Cloudflare)                               │
│  2. WAF rules (OWASP, custom)                                  │
│  3. Rate limiting                                               │
│  4. Bot management                                              │
│  5. mTLS for internal                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security

### Security Layers

| Layer | Technology | Purpose |
|-------|------------|---------|
| Edge | Cloudflare WAF | DDoS, bot protection |
| Transport | TLS 1.3 | Encryption in transit |
| Application | JWT, API Keys | Authentication |
| Data | AES-256 | Encryption at rest |
| Infrastructure | VPC, Firewall | Network isolation |

### Secrets Management

```yaml
# Production secrets stored in:
# 1. Cloudflare Secrets (edge)
# 2. Railway Variables (compute)
# 3. Vercel Environment (web)
# 4. GitHub Secrets (CI/CD)
# 5. HashiCorp Vault (enterprise)

# Local development:
# ~/.blackroad/vault/ (encrypted)
```

### Access Control

```
Role-Based Access:
├── admin (full access)
├── developer (read/write code)
├── operator (deploy, monitor)
└── viewer (read-only)

Service Accounts:
├── ci-deploy (CI/CD)
├── monitoring (metrics)
└── backup (data access)
```

---

## Disaster Recovery

### Backup Strategy

| Data | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| PostgreSQL | Hourly | 30 days | R2, Spaces |
| Redis | Daily | 7 days | R2 |
| Memory | Daily | 90 days | R2 |
| Code | Continuous | Forever | GitHub |
| Config | On change | 30 days | R2 |

### Recovery Procedures

```bash
# Database recovery
./recovery.sh postgres restore --backup latest

# Full system recovery
./recovery.sh full --from-backup backup_2026_02_05

# Failover to backup region
./recovery.sh failover --region eu-west
```

### RTO/RPO Targets

| System | RTO | RPO |
|--------|-----|-----|
| API | 5 min | 0 |
| Dashboard | 15 min | 1 hour |
| Agents | 30 min | 5 min |
| Memory | 1 hour | 1 hour |

### Runbook

```markdown
# Disaster Recovery Runbook

## Total System Failure
1. Assess damage scope
2. Activate incident response team
3. Restore from latest backup
4. Verify data integrity
5. Gradual traffic restoration
6. Post-incident review

## Partial Outage
1. Identify affected components
2. Failover to healthy replicas
3. Investigate root cause
4. Apply fix
5. Restore original configuration
```

---

## Infrastructure Commands

```bash
# Status
./blackroad-mesh.sh              # Full mesh status
./status.sh                      # System status
./health.sh                      # Health check

# Deployment
./deploy.sh cloudflare           # Deploy to Cloudflare
./deploy.sh railway              # Deploy to Railway
./deploy.sh vercel               # Deploy to Vercel
./deploy.sh all                  # Deploy everywhere

# Scaling
./scale.sh api 3                 # Scale API to 3 replicas
./scale.sh workers 5             # Scale workers

# Maintenance
./maintenance.sh enable          # Enable maintenance mode
./maintenance.sh disable         # Disable maintenance mode

# Backup
./backup.sh create               # Create backup
./backup.sh restore <id>         # Restore backup
```

---

*Last updated: 2026-02-05*
