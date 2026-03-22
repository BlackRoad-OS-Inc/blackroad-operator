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
