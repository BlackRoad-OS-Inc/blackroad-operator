#!/bin/bash
# Deploy Web Service to Railway

echo "🚀 Deploying BlackRoad Web Service to Railway..."

cd services/web

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm i -g @railway/cli"
    exit 1
fi

# Create new project or link existing
echo ""
echo "📦 Step 1: Link to Railway project"
echo "Choose an option:"
echo "  1. Create new project"
echo "  2. Link to existing project"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    railway init
else
    railway link
fi

# Set environment variables
echo ""
echo "🔑 Step 2: Set environment variables"
echo ""
echo "Enter your Stripe Publishable Key (starts with pk_test_ or pk_live_):"
read -p "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: " stripe_pub

echo "Enter your Stripe Price ID for Professional plan (starts with price_):"
read -p "NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL: " price_id

echo "Enter your API URL (from previous deployment):"
read -p "NEXT_PUBLIC_API_URL: " api_url

railway variables set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="$stripe_pub"
railway variables set NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL="$price_id"
railway variables set NEXT_PUBLIC_API_URL="$api_url"
railway variables set SERVICE_NAME="blackroad-os-web"
railway variables set SERVICE_ENV="production"

# Deploy
echo ""
echo "🚀 Step 3: Deploying to Railway..."
railway up

# Get the URL
echo ""
echo "✅ Deployment complete!"
echo ""
railway status
echo ""
echo "🎉 Your pricing page is live!"
echo "Visit: [YOUR-URL]/pricing"
