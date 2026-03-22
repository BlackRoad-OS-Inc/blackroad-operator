#!/bin/bash
# Setup BlackRoad Copilot Gateway for all websites

echo "🚀 Setting up BlackRoad Copilot Gateway for all websites"
echo ""

# Get all blackroad.io subdomains
SUBDOMAINS=$(cat ~/infra/blackroad_registry.json | jq -r '.domains["blackroad.io"] | keys[]')

echo "📋 Found $(echo "$SUBDOMAINS" | wc -l) subdomains:"
echo "$SUBDOMAINS" | nl
echo ""

# Create gateway integration for each service
mkdir -p ~/copilot-agent-gateway/integrations

cat > ~/copilot-agent-gateway/integrations/README.md << 'INTEG'
# Gateway Integrations for BlackRoad Websites

This directory contains integration configs for adding gateway access to each BlackRoad website.

## Quick Integration

Add to any Next.js site:

### 1. API Route: `/app/api/gateway/[...path]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3030'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}?${searchParams}`
  
  try {
    const response = await fetch(gatewayUrl)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unavailable' },
      { status: 503 }
    )
  }
}
```

### 2. Environment Variable

```bash
# .env.local
GATEWAY_URL=http://localhost:3030
# Or production: https://gateway.blackroad.io
```

### 3. Usage in Components

```typescript
// Fetch gateway stats
const response = await fetch('/api/gateway/stats')
const { stats } = await response.json()

// Check health
const health = await fetch('/api/gateway/health')
const { instances } = await health.json()

// List models
const models = await fetch('/api/gateway/models')
const { models: modelList } = await models.json()
```

## Deployment Options

### Option 1: Centralized Gateway (Railway)
- Deploy gateway once to Railway
- All sites connect to: `https://gateway.blackroad.io`
- Single source of truth
- Easy to monitor

### Option 2: Distributed Gateways (Pi Fleet)
- Each Pi runs gateway instance
- Sites connect to nearest Pi
- Low latency
- High availability

### Option 3: Hybrid
- Central gateway for web dashboard
- Local gateways for MCP/CLI
- Best of both worlds

## Sites Ready for Integration

INTEG

# List all services
echo "$SUBDOMAINS" | while read SUBDOMAIN; do
  SERVICE=$(cat ~/infra/blackroad_registry.json | jq -r ".domains[\"blackroad.io\"][\"$SUBDOMAIN\"].service_name")
  DESCRIPTION=$(cat ~/infra/blackroad_registry.json | jq -r ".domains[\"blackroad.io\"][\"$SUBDOMAIN\"].description")
  
  echo "### ${SUBDOMAIN}.blackroad.io" >> ~/copilot-agent-gateway/integrations/README.md
  echo "- **Service**: $SERVICE" >> ~/copilot-agent-gateway/integrations/README.md
  echo "- **Description**: $DESCRIPTION" >> ~/copilot-agent-gateway/integrations/README.md
  echo "- **Integration**: Add \`/app/api/gateway/[...path]/route.ts\`" >> ~/copilot-agent-gateway/integrations/README.md
  echo "" >> ~/copilot-agent-gateway/integrations/README.md
done

# Create template API route
cat > ~/copilot-agent-gateway/integrations/route.ts << 'ROUTE'
// BlackRoad Copilot Gateway Integration
// Add to: /app/api/gateway/[...path]/route.ts

import { NextRequest, NextResponse } from 'next/server'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3030'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}?${searchParams}`
  
  try {
    const response = await fetch(gatewayUrl, {
      headers: {
        'X-Gateway-Client': request.headers.get('host') || 'unknown',
        'X-Gateway-Timestamp': new Date().toISOString()
      }
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'X-Gateway-Response': 'true',
        'X-Gateway-Version': '2.0.0'
      }
    })
  } catch (error) {
    console.error('Gateway error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Gateway unavailable',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const body = await request.json()
  
  const gatewayUrl = `${GATEWAY_URL}/api/${path}`
  
  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Client': request.headers.get('host') || 'unknown'
      },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Gateway unavailable' },
      { status: 503 }
    )
  }
}
ROUTE

# Create deployment script for Railway
cat > ~/copilot-agent-gateway/integrations/deploy-railway.sh << 'DEPLOY'
#!/bin/bash
# Deploy centralized gateway to Railway

echo "🚂 Deploying BlackRoad Copilot Gateway to Railway..."

cd ~/copilot-agent-gateway

# Create railway.json if not exists
cat > railway.json << 'CONFIG'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node web-server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
CONFIG

echo "📦 Railway config created"
echo ""
echo "🚀 Deploy with:"
echo "  railway up"
echo ""
echo "🌐 After deployment, set GATEWAY_URL in all sites:"
echo "  GATEWAY_URL=https://copilot-gateway-production.up.railway.app"
DEPLOY
chmod +x ~/copilot-agent-gateway/integrations/deploy-railway.sh

echo ""
echo "✅ Gateway integration setup complete!"
echo ""
echo "📁 Files created:"
echo "  ~/copilot-agent-gateway/integrations/README.md"
echo "  ~/copilot-agent-gateway/integrations/route.ts"
echo "  ~/copilot-agent-gateway/integrations/deploy-railway.sh"
echo ""
echo "🎯 Next steps:"
echo ""
echo "1️⃣  Deploy centralized gateway to Railway:"
echo "    cd ~/copilot-agent-gateway"
echo "    railway up"
echo ""
echo "2️⃣  Add gateway API route to each site:"
echo "    cp ~/copilot-agent-gateway/integrations/route.ts services/web/app/api/gateway/[...path]/"
echo ""
echo "3️⃣  Set GATEWAY_URL in each site's .env:"
echo "    GATEWAY_URL=https://gateway.blackroad.io"
echo ""
echo "4️⃣  Test gateway integration:"
echo "    curl https://web.blackroad.io/api/gateway/stats"
echo ""
echo "🌐 All $(echo "$SUBDOMAINS" | wc -l) sites ready for gateway integration!"

