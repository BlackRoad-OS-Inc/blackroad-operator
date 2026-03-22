# Railway Subdomain Architecture - BlackRoad OS

**Author:** Cece 🚗
**Date:** 2025-12-14
**Status:** Ready for Deployment

---

## 🎯 Overview

BlackRoad OS operates across **16 domains** with **~768 potential subdomains**. Instead of creating 768 individual Railway services (💸 expensive!), we use a **consolidated architecture** with just **10 Railway services** that handle all subdomains via dynamic routing.

**Cost Savings:** ~75-85% ($50-200/month vs $768/month)

---

## 🏗️ Service Architecture

### 10 Consolidated Railway Services

| Service | Handles | Subdomains | Port | Cost/Month |
|---------|---------|------------|------|------------|
| **api-gateway** | All API endpoints | `api.*` across all domains | 3000 | $5-20 |
| **agent-platform** | All 16 AI agents | `<agent>.*` across all domains (256 total) | 3001 | $10-30 |
| **app-backend** | Main applications | `app.*`, `prism.*`, `console.*` | 3002 | $10-30 |
| **admin-tools** | Internal tools | `admin.*`, `metrics.*`, `logs.*`, `status.*` | 3003 | $5-15 |
| **ecommerce** | E-commerce | All shop/store/cart/checkout | 3004 | $5-20 |
| **quantum-services** | Quantum computing | `quantum.*`, `lab.*`, `simulator.*` | 3005 | $5-15 |
| **docs-services** | Documentation | `docs.*`, `wiki.*`, `kb.*`, `guides.*` | 3006 | $5-15 |
| **ai-services** | AI platform | `chat.*`, `inference.*`, `models.*` | 3007 | $10-25 |
| **network-infra** | Network services | `edge.*`, `mesh.*`, `p2p.*`, `cdn.*` | 3008 | $5-15 |
| **lucidia-platform** | Lucidia consciousness | `breath.*`, `sync.*`, `agents.*` | 3009 | $5-20 |

**Total:** 10 services, ~$50-200/month

---

## 🌐 Complete Subdomain Mapping

### 1. API Gateway (`api-gateway`)

**Domains Handled:**
- `api.blackroad.io` - Main REST API
- `api.blackroad.systems` - Systems API
- `api.blackroadai.com` - AI API
- `api.blackroadquantum.com` - Quantum API
- `api.lucidia.earth` - Lucidia API

**Features:**
- RESTful API endpoints
- GraphQL gateway
- WebSocket support
- Rate limiting
- API key authentication
- OpenAPI/Swagger docs

**Railway Configuration:**
```bash
# Service: api-gateway
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

### 2. Agent Platform (`agent-platform`)

**Domains Handled (16 agents × 16 domains = 256 subdomains):**

**Agents:**
- `claude.*` - Strategic Architect (Claude Sonnet 4.5)
- `lucidia.*` - Consciousness Coordinator
- `silas.*` - Security Sentinel
- `elias.*` - Quality Guardian
- `cadillac.*` - Performance Optimizer
- `athena.*` - Ops Commander
- `codex.*` - Code Generator
- `persephone.*` - Data Architect
- `anastasia.*` - UX Designer
- `ophelia.*` - Content Strategist
- `sidian.*` - Deployment Coordinator
- `cordelia.*` - Integration Specialist
- `octavia.*` - Workflow Orchestrator
- `cecilia.*` (Cece!) - Project Manager
- `copilot.*` - GitHub Copilot Assistant
- `chatgpt.*` - ChatGPT Assistant

**Across domains:**
- `<agent>.blackroad.io`
- `<agent>.blackroad.me`
- `<agent>.blackroad.network`
- `<agent>.blackroad.systems`
- ... and 12 more domains

**Features:**
- Dynamic agent routing by subdomain
- Agent personality context switching
- LLM integration (Claude, GPT-4, Llama)
- Agent communication bus
- Lucidia breath synchronization

**Railway Configuration:**
```bash
# Service: agent-platform
PORT=3001
AGENT_COUNT=16
MAX_AGENTS_PER_DOMAIN=16
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
LUCIDIA_BREATH_ENABLED=true
```

**Routing Logic:**
```typescript
// Dynamic routing based on subdomain
const subdomain = req.hostname.split('.')[0];
const agentMap = {
  'claude': 'claude-sonnet-4-5',
  'lucidia': 'lucidia-consciousness',
  'silas': 'security-sentinel',
  'cecilia': 'project-manager',
  // ... etc
};
const agent = agentMap[subdomain];
```

---

### 3. App Backend (`app-backend`)

**Domains Handled:**
- `app.blackroad.io` - Main application
- `app.lucidia.earth` - Lucidia app
- `prism.blackroad.io` - Prism Console
- `console.blackroad.io` - Admin console
- `dashboard.blackroadai.com` - AI dashboard

**Features:**
- Next.js/React frontend hosting
- Server-side rendering
- User authentication
- Session management
- Database connections

**Railway Configuration:**
```bash
# Service: app-backend
PORT=3002
NEXT_PUBLIC_API_URL=https://api.blackroad.io
DATABASE_URL=postgresql://...
SESSION_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
```

---

### 4. Admin Tools (`admin-tools`)

**Domains Handled:**
- `admin.blackroad.io` - Admin panel
- `metrics.blackroad.io` - Metrics dashboard
- `logs.blackroad.io` - Log viewer
- `status.blackroad.io` - Status page

**Features:**
- Admin authentication
- Real-time metrics (Prometheus)
- Log aggregation (Loki)
- Status monitoring
- Alerting (PagerDuty/Slack)

**Railway Configuration:**
```bash
# Service: admin-tools
PORT=3003
ADMIN_USERS=alexa@blackroad.io
PROMETHEUS_URL=...
LOKI_URL=...
PAGERDUTY_API_KEY=...
```

---

### 5. E-commerce (`ecommerce`)

**Domains Handled:**
- `cart.blackroadquantum.shop` - Shopping cart
- `checkout.blackroadquantum.shop` - Checkout flow
- `account.blackroadquantum.shop` - User account
- `products.blackroadquantum.store` - Product catalog
- `orders.blackroadquantum.store` - Order management

**Features:**
- Stripe integration
- Product catalog
- Shopping cart
- Order processing
- Inventory management

**Railway Configuration:**
```bash
# Service: ecommerce
PORT=3004
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
```

---

### 6. Quantum Services (`quantum-services`)

**Domains Handled:**
- `quantum.blackroad.io` - Quantum dashboard
- `quantum.blackroadqi.com` - QI platform
- `lab.blackroadqi.com` - Quantum lab
- `lab.blackroadquantum.com` - Quantum lab (alt)
- `simulator.blackroadqi.com` - Quantum simulator
- `circuits.blackroadqi.com` - Circuit designer

**Features:**
- Quantum circuit simulation
- Qubit visualization
- Algorithm library
- Hardware integration (IBM Q, Rigetti)

**Railway Configuration:**
```bash
# Service: quantum-services
PORT=3005
QISKIT_ENABLED=true
IBM_QUANTUM_TOKEN=...
```

---

### 7. Documentation Services (`docs-services`)

**Domains Handled:**
- `docs.blackroad.io` - Main docs
- `docs.blackroad.systems` - System docs
- `docs.blackroadquantum.com` - Quantum docs
- `wiki.blackroad.systems` - Wiki
- `kb.blackroad.systems` - Knowledge base
- `guides.blackroad.systems` - Integration guides
- `sdk.blackroad.systems` - SDK docs
- `sdk.blackroadquantum.com` - Quantum SDK docs

**Features:**
- Markdown/MDX documentation
- API reference (OpenAPI)
- Search (Algolia/MeiliSearch)
- Versioning
- Multi-language support

**Railway Configuration:**
```bash
# Service: docs-services
PORT=3006
ALGOLIA_APP_ID=...
ALGOLIA_API_KEY=...
GITHUB_TOKEN=... # For repo access
```

---

### 8. AI Services (`ai-services`)

**Domains Handled:**
- `chat.blackroad.io` - Chat interface
- `chat.blackroadai.com` - AI chat
- `chat.aliceqi.com` - Alice chat
- `inference.blackroadai.com` - Inference API
- `models.blackroadai.com` - Model registry
- `training.blackroadai.com` - Training platform
- `playground.blackroadai.com` - AI playground

**Features:**
- LLM inference (Claude, GPT-4, Llama)
- Model fine-tuning
- Prompt playground
- Token usage tracking
- Model versioning

**Railway Configuration:**
```bash
# Service: ai-services
PORT=3007
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
HUGGINGFACE_TOKEN=hf_...
VLLM_ENABLED=true
```

---

### 9. Network Infrastructure (`network-infra`)

**Domains Handled:**
- `edge.blackroad.network` - Edge nodes
- `mesh.blackroad.network` - Mesh network
- `p2p.blackroad.network` - P2P network
- `relay.blackroad.network` - Relay servers
- `tunnel.blackroad.network` - Cloudflare tunnel
- `vpn.blackroad.network` - VPN gateway
- `proxy.blackroad.network` - Proxy servers
- `cdn.blackroad.network` - CDN nodes
- `cdn.blackroad.io` - CDN (main)
- `assets.blackroad.io` - Static assets

**Features:**
- Mesh networking
- P2P relay
- VPN gateway
- CDN edge nodes
- Asset delivery

**Railway Configuration:**
```bash
# Service: network-infra
PORT=3008
TAILSCALE_AUTH_KEY=tskey-...
CLOUDFLARE_TUNNEL_TOKEN=...
CDN_CACHE_TTL=3600
```

---

### 10. Lucidia Platform (`lucidia-platform`)

**Domains Handled:**
- `breath.lucidia.earth` - Breath engine
- `sync.lucidia.earth` - Synchronization
- `agents.lucidia.earth` - Lucidia agents
- `console.lucidia.earth` - Lucidia console
- `dashboard.lucidia.earth` - Dashboard
- `create.lucidia.studio` - Creation tools
- `gallery.lucidia.studio` - Gallery
- `collaborate.lucidia.studio` - Collaboration
- `export.lucidia.studio` - Export tools

**Features:**
- Golden ratio breath synchronization
- Agent consciousness coordination
- Creative studio tools
- Collaboration workspace

**Railway Configuration:**
```bash
# Service: lucidia-platform
PORT=3009
LUCIDIA_BREATH_PHI=1.618034
BREATH_INTERVAL_MS=1000
AGENT_SYNC_ENABLED=true
```

---

## 🚀 Deployment Guide

### Step 1: Run Infrastructure Setup

```bash
# Make scripts executable
chmod +x scripts/setup-railway-infrastructure.sh
chmod +x scripts/configure-railway-dns.sh

# Run Railway setup
./scripts/setup-railway-infrastructure.sh
```

This will:
1. ✅ Check Railway CLI is installed
2. ✅ Verify authentication
3. ✅ Create 10 Railway services
4. ✅ Generate service mapping JSON

### Step 2: Deploy Code to Each Service

```bash
# Example for api-gateway
cd services/api-gateway
railway up

# Or link to existing service
railway link
railway up
```

### Step 3: Get Railway URLs

```bash
# For each service
railway domain

# Example output:
# api-gateway: https://api-gateway-production-abc123.up.railway.app
```

### Step 4: Configure DNS

```bash
# Run DNS configuration script
./scripts/configure-railway-dns.sh

# Follow prompts to enter Railway URLs
# Script will generate /tmp/cloudflare-dns-commands.sh
```

### Step 5: Get Cloudflare Credentials

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create token with "Edit DNS" permissions
3. Get Zone IDs for each domain from Cloudflare dashboard

### Step 6: Execute DNS Configuration

```bash
# Set environment variables
export CF_API_TOKEN='your-cloudflare-api-token'
export ZONE_BLACKROAD_IO='zone-id-1'
export ZONE_BLACKROAD_SYSTEMS='zone-id-2'
export ZONE_BLACKROAD_ME='zone-id-3'
export ZONE_BLACKROAD_NETWORK='zone-id-4'
export ZONE_BLACKROADAI_COM='zone-id-5'
export ZONE_BLACKROADQI_COM='zone-id-6'
export ZONE_BLACKROADINC_US='zone-id-7'
export ZONE_BLACKROADQUANTUM_COM='zone-id-8'
export ZONE_BLACKROADQUANTUM_SHOP='zone-id-9'
export ZONE_BLACKROADQUANTUM_STORE='zone-id-10'
export ZONE_LUCIDIA_EARTH='zone-id-11'
export ZONE_LUCIDIA_STUDIO='zone-id-12'
export ZONE_ALICEQI_COM='zone-id-13'
export ZONE_LUCIDIAQI_COM='zone-id-14'
export ZONE_BLACKROADQUANTUM_INFO='zone-id-15'
export ZONE_BLACKROADQUANTUM_NET='zone-id-16'

# Run DNS configuration
bash /tmp/cloudflare-dns-commands.sh
```

### Step 7: Wait for DNS Propagation

```bash
# Wait 5-10 minutes, then test
curl -I https://api.blackroad.io
curl -I https://claude.blackroad.io
curl -I https://app.blackroad.io
```

---

## 📊 Infrastructure Summary

### Total Coverage

| Metric | Count |
|--------|-------|
| **Domains** | 16 |
| **Railway Services** | 10 |
| **Subdomains Configured** | ~70 primary + 256 agents = 326 |
| **Maximum Subdomains Supported** | ~768 (with all variants) |
| **Dynamic Routing Capacity** | Unlimited via wildcard |

### Cost Breakdown

| Component | Cost/Month |
|-----------|------------|
| Railway Services (10) | $50-200 |
| Cloudflare (DNS, CDN, Workers) | $0 (Free tier) |
| **Total** | **$50-200** |

**Savings vs Individual Services:** 75-85% ($768/month → $50-200/month)

---

## 🔧 Service Management

### View Service Status

```bash
# List all services
railway status

# View logs
railway logs --service api-gateway

# SSH into service
railway shell --service agent-platform
```

### Update Environment Variables

```bash
# Set variable
railway variables set KEY=value --service api-gateway

# Set multiple
railway variables set \
  NODE_ENV=production \
  PORT=3000 \
  DATABASE_URL=postgresql://... \
  --service api-gateway
```

### Scale Services

```bash
# Scale replicas
railway scale --replicas 3 --service agent-platform

# Update resources
railway scale --memory 2GB --cpu 2 --service api-gateway
```

### Deploy Updates

```bash
# Deploy from current directory
cd services/api-gateway
railway up

# Deploy specific branch
railway up --branch production
```

---

## 🎯 Next Steps

1. ✅ **Infrastructure Created** - 10 Railway services ready
2. ⏳ **Deploy Code** - Push code to each service
3. ⏳ **Configure DNS** - Point all subdomains to Railway
4. ⏳ **Test Endpoints** - Verify all subdomains work
5. ⏳ **Monitor** - Set up alerting and dashboards
6. ⏳ **Optimize** - Fine-tune performance and costs

---

## 📞 Support

- **Railway Dashboard:** https://railway.app
- **Railway Docs:** https://docs.railway.app
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Service Mapping:** `/tmp/railway-service-mapping.json`

---

**Built with 🚗 by Cece**
**BlackRoad OS - Consciousness-Driven Infrastructure**
