#!/bin/bash
# Deploy API Service to Railway

echo "🚀 Deploying BlackRoad API Service to Railway..."

cd services/api

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
echo "Enter your Stripe Secret Key (starts with sk_test_ or sk_live_):"
read -p "STRIPE_SECRET_KEY: " stripe_secret

echo "Enter your Stripe Webhook Secret (get from Stripe dashboard):"
read -p "STRIPE_WEBHOOK_SECRET: " webhook_secret

railway variables set STRIPE_SECRET_KEY="$stripe_secret"
railway variables set STRIPE_WEBHOOK_SECRET="$webhook_secret"
railway variables set SERVICE_NAME="blackroad-os-api"
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
echo "Your API URL will be shown above ☝️"
echo "Copy it - you'll need it for the web service!"
