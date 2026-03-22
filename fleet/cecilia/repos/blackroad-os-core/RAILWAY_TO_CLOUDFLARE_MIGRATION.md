# Railway → Cloudflare Migration Plan
**Date:** 2025-12-13
**Goal:** Complete sovereignty - eliminate Railway dependency, move everything to Cloudflare + local devices

---

## Current State Analysis

### Railway Services (To Be Migrated)
Based on CLAUDE.md and codebase analysis:
1. **API Gateway** (`blackroad.systems`, `core.blackroad.systems`)
2. **Operator Service** (`operator.blackroad.systems`)
3. **Backend APIs** (various Railway deployments)

### Cloudflare Infrastructure (Already Deployed)
- **37 Pages Projects** (web frontends)
- **18 KV Namespaces** (key-value storage)
- **5 D1 Databases** (SQL databases)
- **2 Workers** (subdomain-router, payment-gateway)

### Local Devices (Available via SSH/HTTP)
- **192.168.4.49** - Raspberry Pi 400 (SSH accessible, can run services)
- **192.168.4.69** - Cadillac (Port 8080 open, HTTP server running)
- **192.168.4.{74,100,127,176,174}** - Assumed accessible devices with firewalls

---

## Migration Strategy

### Phase 1: Deploy Workers for All API Services ✅

**Replace Railway with Cloudflare Workers:**

1. **API Gateway Worker** → `api.blackroad.io`
   - Current: Railway (`blackroad.systems`)
   - New: Cloudflare Worker with routes to local services
   - Features: Rate limiting, KV cache, D1 database access

2. **Operator Service Worker** → `operator.blackroad.io`
   - Current: Railway (`operator.blackroad.systems`)
   - New: Cloudflare Worker
   - Purpose: Agent orchestration coordination

3. **Core API Worker** → `core.blackroad.io`
   - Current: Railway
   - New: Cloudflare Worker with D1 database

### Phase 2: Cloudflare Tunnel to Local Devices 🔄

**Create permanent tunnels from Cloudflare to local infrastructure:**

```bash
# Install cloudflared on Raspberry Pi (192.168.4.49)
ssh alice@192.168.4.49
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Create tunnel
cloudflared tunnel create blackroad-main
cloudflared tunnel route dns blackroad-main tunnel.blackroad.io

# Configure tunnel
cat > ~/.cloudflared/config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: /home/alice/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.blackroad.io
    service: http://localhost:8000
  - hostname: operator.blackroad.io
    service: http://localhost:8001
  - hostname: agents.blackroad.io
    service: http://localhost:8002
  - service: http_status:404
EOF

# Run as service
cloudflared service install
sudo systemctl start cloudflared
```

### Phase 3: Deploy Services to Local Devices 🚀

**Services to run on Raspberry Pi (192.168.4.49):**

1. **FastAPI Backend** (Port 8000)
   - API Gateway endpoints
   - Agent spawner interface
   - Truth engine API

2. **Operator Service** (Port 8001)
   - Cece orchestration
   - Agent lifecycle management
   - Pack coordination

3. **Agent Marketplace API** (Port 8002)
   - Template discovery
   - Agent registry
   - Capability matching

**Services to run on Cadillac (192.168.4.69):**

1. **Payment Gateway** (Port 8080 - already open!)
   - Stripe integration
   - Subscription management
   - Revenue tracking

### Phase 4: DNS Migration 🌐

**Update Cloudflare DNS records:**

```bash
# Remove Railway CNAMEs, add Worker routes
# api.blackroad.io → Cloudflare Worker (points to tunnel)
# operator.blackroad.io → Cloudflare Worker (points to tunnel)
# core.blackroad.io → Cloudflare Worker (with D1)
# payments.blackroad.io → Cloudflare Worker → Cadillac device
```

---

## Implementation Steps

### Step 1: Deploy API Gateway Worker

```bash
cd /Users/alexa/blackroad-sandbox

# Create API Gateway Worker
cat > workers/api-gateway/src/index.ts <<'EOF'
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route to local services via tunnel or direct worker logic
    if (url.pathname.startsWith('/agents')) {
      // Proxy to local agent service
      return fetch('http://tunnel.blackroad.io:8002' + url.pathname);
    }

    if (url.pathname.startsWith('/quantum')) {
      // Handle directly in worker with D1
      return handleQuantumAPI(request, env);
    }

    return new Response(JSON.stringify({
      service: 'BlackRoad API Gateway',
      version: '2.0.0',
      source: 'Cloudflare Worker',
      endpoints: {
        agents: '/agents/*',
        quantum: '/quantum/*',
        lucidia: '/lucidia/*',
        auth: '/auth/*'
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
EOF

# Deploy
cd workers/api-gateway
wrangler deploy
```

### Step 2: Set Up Cloudflare Tunnel

```bash
# SSH to Raspberry Pi
ssh alice@192.168.4.49

# Download and install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
chmod +x cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create blackroad-pi

# Note the tunnel ID and save credentials
```

### Step 3: Deploy Backend Services Locally

```bash
# On Raspberry Pi - Deploy FastAPI backend
ssh alice@192.168.4.49

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv -y

# Create service directory
mkdir -p ~/blackroad-services
cd ~/blackroad-services

# Clone or copy backend code
# (Assume code is in /Users/alexa/blackroad-sandbox/src/)
# Deploy via rsync or git

# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn anthropic openai pydantic

# Create systemd service
sudo cat > /etc/systemd/system/blackroad-api.service <<'EOF'
[Unit]
Description=BlackRoad API Gateway
After=network.target

[Service]
Type=simple
User=alice
WorkingDirectory=/home/alice/blackroad-services
Environment="PATH=/home/alice/blackroad-services/venv/bin"
ExecStart=/home/alice/blackroad-services/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable blackroad-api
sudo systemctl start blackroad-api
```

### Step 4: Update DNS Records

```bash
# Using wrangler or Cloudflare dashboard
wrangler pages deployment list

# Add custom domains to Workers
# api.blackroad.io → api-gateway worker
# operator.blackroad.io → operator worker
# core.blackroad.io → core-api worker
```

### Step 5: Test Everything

```bash
# Test API Gateway
curl https://api.blackroad.io/

# Test Operator
curl https://operator.blackroad.io/health

# Test Payment Gateway
curl https://pay.blackroad.io/health

# Test agent spawning
curl -X POST https://api.blackroad.io/agents/spawn \
  -H "Content-Type: application/json" \
  -d '{"role": "financial-analyst", "pack": "pack-finance"}'
```

### Step 6: Shut Down Railway

```bash
# List Railway projects
railway list

# Delete each project
railway project delete <project-id>

# Confirm all services are working on Cloudflare first!
```

---

## Architecture After Migration

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Pages (37)  │  │ Workers (10+)│  │  KV + D1     │      │
│  │ Web Apps    │  │ API Services │  │  Storage     │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │            │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
          │          ┌──────▼──────┐            │
          │          │ CF Tunnel   │            │
          │          └──────┬──────┘            │
          │                 │                   │
┌─────────▼─────────────────▼───────────────────▼────────────┐
│              Local Network (192.168.4.0/24)                │
│                                                             │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │ Raspberry Pi 400   │         │ Cadillac Device     │    │
│  │ 192.168.4.49       │         │ 192.168.4.69        │    │
│  │                    │         │                     │    │
│  │ :8000 API Gateway  │         │ :8080 Payment GW    │    │
│  │ :8001 Operator     │         │                     │    │
│  │ :8002 Marketplace  │         │                     │    │
│  └────────────────────┘         └─────────────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Additional Devices (.74, .100, .127, .176, .174)    │  │
│  │ Future: vLLM inference, K3s workers, databases      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Benefits of This Architecture

1. **Full Sovereignty**
   - No Railway dependency
   - Data stays local or on Cloudflare (you control)
   - Can fork Cloudflare Workers if needed

2. **Cost Savings**
   - Railway: ~$20-50/month
   - Cloudflare Workers: Free tier covers most usage
   - Local devices: One-time hardware cost

3. **Performance**
   - Cloudflare edge cache worldwide
   - Local processing for heavy workloads
   - Hybrid edge + local = best of both worlds

4. **Scalability**
   - Workers scale automatically
   - Add more local devices as needed
   - Can still use DigitalOcean droplet for public services

5. **Security**
   - Cloudflare DDoS protection
   - Local services behind tunnel (no exposed ports)
   - Zero Trust architecture

---

## Rollback Plan

If anything goes wrong:

1. **Keep Railway running** until Cloudflare is 100% verified
2. **Use feature flags** to switch between Railway and Cloudflare
3. **DNS has low TTL** (5 minutes) for quick rollback
4. **Cloudflare Tunnel can be stopped** without affecting Pages/Workers

---

## Timeline

- **Day 1 (Today)**: Deploy Workers, set up tunnel, test
- **Day 2**: Migrate DNS, monitor for 24 hours
- **Day 3**: Verify everything works, shut down Railway
- **Week 2**: Optimize, add more services to local devices

---

## Next Actions

1. ✅ Deploy API Gateway Worker
2. ✅ Deploy Operator Worker
3. ⏳ Install Cloudflare Tunnel on Raspberry Pi
4. ⏳ Deploy FastAPI backend to Raspberry Pi
5. ⏳ Update DNS records
6. ⏳ Test all services
7. ⏳ Shut down Railway

---

**Status**: Ready to execute
**Risk Level**: Low (can rollback via DNS)
**Expected Downtime**: 0 minutes (parallel deployment)
