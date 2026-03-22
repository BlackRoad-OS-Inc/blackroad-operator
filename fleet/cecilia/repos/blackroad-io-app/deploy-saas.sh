#!/bin/bash
# BlackRoad.io SaaS Platform Deployment Script

set -e  # Exit on error

echo "🚀 BlackRoad.io SaaS Platform Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root"
  exit 1
fi

# Check for required tools
if ! command -v wrangler &> /dev/null; then
  echo "❌ Error: wrangler not found. Install with: npm install -g wrangler"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "⚠️  Warning: pnpm not found. Using npm instead..."
  PNPM_CMD="npm"
else
  PNPM_CMD="pnpm"
fi

echo "📦 Step 1: Installing dependencies..."
$PNPM_CMD install

echo ""
echo "🏗️  Step 2: Building frontend..."
$PNPM_CMD build

echo ""
echo "📡 Step 3: Deploying API Worker..."
cd workers/api
wrangler deploy
API_URL=$(wrangler deployments list --name blackroad-api 2>/dev/null | grep "https://" | head -1 | awk '{print $1}' || echo "https://blackroad-api.blackroad.workers.dev")
cd ../..

echo ""
echo "☁️  Step 4: Deploying frontend to Cloudflare Pages..."
wrangler pages deploy out --project-name=blackroad-os-web --branch=main

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo ""
echo "🌐 Website: https://blackroad.io"
echo "📡 API: $API_URL"
echo ""
echo "⚠️  Next Steps:"
echo "1. Set Stripe secrets:"
echo "   cd workers/api"
echo "   wrangler secret put STRIPE_SECRET_KEY"
echo "   wrangler secret put STRIPE_WEBHOOK_SECRET"
echo "   wrangler secret put JWT_SECRET"
echo ""
echo "2. Create Stripe products at: https://dashboard.stripe.com/products"
echo ""
echo "3. Update Price ID in workers/api/src/index.ts (line 213)"
echo ""
echo "4. Set up Stripe webhook:"
echo "   URL: $API_URL/api/webhooks/stripe"
echo "   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted"
echo ""
echo "📚 Full guide: See DEPLOY.md"
