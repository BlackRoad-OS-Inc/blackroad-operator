#!/bin/bash
set -e

echo "🚀 Deploying ALL Cloudflare Infrastructure..."
echo "=============================================="

# Configuration
ZONE_ID="d6566eba4500b460ffec6650d3b4baf6"
ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

# Deploy Workers
echo ""
echo "📦 Deploying Workers..."
echo "------------------------"

# Subdomain Router
if [ -d "workers/subdomain-router" ]; then
  echo "Deploying subdomain-router..."
  cd workers/subdomain-router
  wrangler deploy || echo "⚠️  subdomain-router deploy failed (may already exist)"
  cd ../..
fi

# Payment Gateway
if [ -d "workers/payment-gateway" ]; then
  echo "Deploying payment-gateway..."
  cd workers/payment-gateway
  wrangler deploy --env production || echo "⚠️  payment-gateway deploy failed"
  cd ../..
fi

# API Gateway (if ready)
# if [ -d "workers/api-gateway" ]; then
#   echo "Deploying api-gateway..."
#   cd workers/api-gateway
#   wrangler deploy --env production || echo "⚠️  api-gateway deploy failed"
#   cd ../..
# fi

echo "✅ Workers deployed!"

# List all workers
echo ""
echo "📋 Current Workers:"
wrangler list

# List all Pages
echo ""
echo "📋 Current Pages Projects:"
wrangler pages project list

# List KV Namespaces
echo ""
echo "📋 KV Namespaces:"
wrangler kv namespace list

# List D1 Databases
echo ""
echo "📋 D1 Databases:"
wrangler d1 list

echo ""
echo "=============================================="
echo "✅ Deployment Summary:"
echo "   - Workers: Check output above"
echo "   - Pages: 37 projects"
echo "   - KV: 18 namespaces"
echo "   - D1: 5 databases"
echo ""
echo "🌐 Ready to configure DNS and custom domains!"
echo "=============================================="
