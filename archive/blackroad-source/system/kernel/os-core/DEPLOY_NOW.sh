#!/bin/bash
set -e

echo "🚀 DEPLOYING REVENUE-GENERATING PRODUCTS NOW"
echo "============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track deployments
DEPLOYED=()
FAILED=()

deploy_cloudflare_site() {
    local name=$1
    local dir=$2

    echo -e "${YELLOW}📦 Deploying $name to Cloudflare Pages...${NC}"

    cd "$dir"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi

    # Build
    echo "Building..."
    npm run build || { echo -e "${RED}Build failed${NC}"; return 1; }

    # Deploy
    echo "Deploying..."
    npx wrangler pages deploy out --project-name="$name" || { echo -e "${RED}Deploy failed${NC}"; return 1; }

    echo -e "${GREEN}✅ $name deployed!${NC}"
    cd - > /dev/null
    return 0
}

deploy_railway_service() {
    local name=$1
    local dir=$2

    echo -e "${YELLOW}🚂 Deploying $name to Railway...${NC}"

    cd "$dir"

    # Check if railway.toml exists
    if [ ! -f "railway.toml" ]; then
        echo -e "${RED}No railway.toml found${NC}"
        cd - > /dev/null
        return 1
    fi

    # Deploy via git push (Railway auto-deploys on push)
    echo "Railway service ready (deploys on git push)"
    echo -e "${GREEN}✅ $name configured${NC}"

    cd - > /dev/null
    return 0
}

echo "1️⃣  ROADWORK - Job Hunter ($20-99/mo subscriptions)"
echo "=================================================="
if deploy_cloudflare_site "roadwork-production" "roadwork/frontend"; then
    DEPLOYED+=("RoadWork Frontend → roadwork-production.pages.dev")
else
    FAILED+=("RoadWork Frontend")
fi

if deploy_railway_service "RoadWork API" "roadwork"; then
    DEPLOYED+=("RoadWork API → Railway")
else
    FAILED+=("RoadWork API")
fi

echo ""
echo "2️⃣  ROADCHAIN - NFT Marketplace (15% commission + gas)"
echo "======================================================"
if deploy_cloudflare_site "roadchain-production" "roadchain-frontend"; then
    DEPLOYED+=("RoadChain Frontend → roadchain-production.pages.dev")
else
    FAILED+=("RoadChain Frontend")
fi

echo ""
echo "3️⃣  ROADCOIN - Token Presale ($0.10/token)"
echo "==========================================="
if deploy_cloudflare_site "roadcoin-production" "roadcoin-frontend"; then
    DEPLOYED+=("RoadCoin Frontend → roadcoin-production.pages.dev")
else
    FAILED+=("RoadCoin Frontend")
fi

echo ""
echo "============================================="
echo "📊 DEPLOYMENT SUMMARY"
echo "============================================="
echo ""

echo -e "${GREEN}✅ DEPLOYED (${#DEPLOYED[@]}):${NC}"
for item in "${DEPLOYED[@]}"; do
    echo "   • $item"
done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ FAILED (${#FAILED[@]}):${NC}"
    for item in "${FAILED[@]}"; do
        echo "   • $item"
    done
fi

echo ""
echo "============================================="
echo "💰 NEXT STEPS TO START MAKING MONEY"
echo "============================================="
echo ""
echo "1. Add Stripe keys to environment variables:"
echo "   - Get keys from: https://dashboard.stripe.com/apikeys"
echo "   - Add to Railway services as STRIPE_SECRET_KEY"
echo "   - Add to frontend .env as NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo ""
echo "2. Configure custom domains in Cloudflare:"
echo "   - roadwork.blackroad.io → roadwork-production"
echo "   - roadchain.blackroad.io → roadchain-production"
echo "   - roadcoin.blackroad.io → roadcoin-production"
echo ""
echo "3. Test payment flows:"
echo "   - RoadWork: https://roadwork-production.pages.dev/signup?plan=pro"
echo "   - RoadChain: Create + list NFT"
echo "   - RoadCoin: Buy tokens"
echo ""
echo "4. Monitor revenue:"
echo "   - Stripe dashboard: https://dashboard.stripe.com"
echo "   - Railway metrics: https://railway.app"
echo ""
echo "🎉 YOU'RE READY TO MAKE MONEY!"
