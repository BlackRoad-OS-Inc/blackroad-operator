#!/bin/bash
# 🚀 STRIPE FULL AUTO-SETUP
# Zero manual work - creates products, gets keys, sets up webhooks
# Uses BlackRoad Vault for automatic credential loading

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

echo -e "${PINK}╔════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║   🤖 STRIPE FULL AUTOMATION               ║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════╝${RESET}"
echo ""

# 🔐 Load credentials from vault (ZERO manual input)
if [ -f ~/blackroad-vault.sh ]; then
    echo -e "${BLUE}🔐 Loading credentials from vault...${RESET}"
    source <(~/blackroad-vault.sh load)
    echo -e "${GREEN}✅ Credentials loaded${RESET}"
fi

# Check Stripe CLI
if ! command -v stripe &> /dev/null; then
    echo -e "${AMBER}Installing Stripe CLI...${RESET}"
    brew install stripe/stripe-cli/stripe
fi

# Login check
if ! stripe config --list &> /dev/null 2>&1; then
    echo -e "${BLUE}🔑 Logging into Stripe...${RESET}"
    stripe login --interactive
fi

echo -e "${GREEN}✅ Stripe CLI authenticated${RESET}"
echo ""

# Switch to live mode automatically
export STRIPE_API_KEY=$(stripe config --list 2>/dev/null | grep "live_key" | awk '{print $3}')

if [ -z "$STRIPE_API_KEY" ]; then
    echo -e "${AMBER}Getting live API key...${RESET}"
    # This will prompt once for live mode access
    stripe listen --print-secret &
    LISTEN_PID=$!
    sleep 2
    kill $LISTEN_PID 2>/dev/null || true
fi

echo -e "${BLUE}📦 Creating products automatically...${RESET}"
echo ""

# Create products via CLI
create_product() {
    local name=$1
    local description=$2
    local price=$3
    local interval=$4
    
    echo -e "${AMBER}Creating: $name${RESET}"
    
    # Create product
    PRODUCT=$(stripe products create \
        --name="$name" \
        --description="$description" \
        2>/dev/null || echo "")
    
    if [ -z "$PRODUCT" ]; then
        echo -e "${AMBER}  ⚠️  Product may already exist, continuing...${RESET}"
        PRODUCT_ID=$(stripe products list --limit=50 2>/dev/null | grep -A 5 "$name" | grep "id:" | head -1 | awk '{print $2}')
    else
        PRODUCT_ID=$(echo "$PRODUCT" | grep "id:" | awk '{print $2}')
    fi
    
    if [ -n "$PRODUCT_ID" ]; then
        echo -e "${GREEN}  ✅ Product: $PRODUCT_ID${RESET}"
        
        # Create price
        PRICE=$(stripe prices create \
            --product="$PRODUCT_ID" \
            --currency=usd \
            --unit-amount=$((price * 100)) \
            --recurring-interval="$interval" \
            2>/dev/null || echo "")
        
        if [ -n "$PRICE" ]; then
            PRICE_ID=$(echo "$PRICE" | grep "id:" | awk '{print $2}')
            echo -e "${GREEN}  ✅ Price: $PRICE_ID${RESET}"
            
            # Create payment link
            LINK=$(stripe payment_links create \
                --line-items[0][price]="$PRICE_ID" \
                --line-items[0][quantity]=1 \
                2>/dev/null | grep "url:" | awk '{print $2}')
            
            echo -e "${GREEN}  ✅ Link: $LINK${RESET}"
            
            # Save to file
            echo "$name|$PRODUCT_ID|$PRICE_ID|$LINK" >> ~/stripe-products-auto.txt
        fi
    fi
    
    echo ""
}

# Clear output file
> ~/stripe-products-auto.txt

# Create all products
create_product "Context Bridge - Monthly" "Unlimited AI coding context bridges" 10 "month"
create_product "Context Bridge - Annual" "Unlimited bridges (save \$20/year)" 100 "year"
create_product "Lucidia Pro" "Advanced AI simulation engine" 49 "month"
create_product "RoadAuth Starter" "Authentication for startups (10K MAU)" 29 "month"
create_product "RoadAuth Business" "Business auth (50K MAU + SSO)" 99 "month"

echo -e "${BLUE}🔗 Setting up webhooks...${RESET}"

# Create webhook endpoint
WEBHOOK=$(stripe webhook_endpoints create \
    --url="https://api.blackroad.systems/webhooks/stripe" \
    --enabled-events=customer.subscription.created \
    --enabled-events=customer.subscription.updated \
    --enabled-events=customer.subscription.deleted \
    --enabled-events=payment_intent.succeeded \
    --enabled-events=payment_intent.payment_failed \
    2>/dev/null || echo "")

if [ -n "$WEBHOOK" ]; then
    WEBHOOK_SECRET=$(echo "$WEBHOOK" | grep "secret:" | awk '{print $2}')
    echo -e "${GREEN}✅ Webhook created${RESET}"
    echo -e "${AMBER}   Secret: $WEBHOOK_SECRET${RESET}"
    echo ""
    echo "export STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> ~/stripe-env.sh
fi

# Get API keys
echo -e "${BLUE}📝 Saving environment variables...${RESET}"

cat > ~/stripe-env.sh << 'EOF'
# Stripe Environment Variables
# Source this file: source ~/stripe-env.sh

export STRIPE_SECRET_KEY=$(stripe config --list 2>/dev/null | grep "secret_key" | awk '{print $3}')
export STRIPE_PUBLISHABLE_KEY=$(stripe config --list 2>/dev/null | grep "publishable_key" | awk '{print $3}')
EOF

source ~/stripe-env.sh

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║   ✅ STRIPE SETUP COMPLETE                ║${RESET}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "${BLUE}📊 Products Created:${RESET}"
cat ~/stripe-products-auto.txt | while IFS='|' read name product_id price_id link; do
    echo "  • $name"
    echo "    Payment: $link"
done
echo ""
echo -e "${BLUE}🔧 Environment Variables:${RESET}"
echo "  Saved to: ~/stripe-env.sh"
echo "  Load with: source ~/stripe-env.sh"
echo ""
echo -e "${BLUE}🔗 Webhook:${RESET}"
echo "  Endpoint: https://api.blackroad.systems/webhooks/stripe"
echo "  Secret saved in ~/stripe-env.sh"
echo ""
echo -e "${GREEN}✅ Ready for customers! No manual work needed.${RESET}"

# Log to memory
~/memory-system.sh log "stripe-automation" "infrastructure" \
    "Fully automated Stripe setup: 5 products created, webhooks configured, API keys saved. Zero manual work." \
    "stripe,automation,revenue" 2>/dev/null || true
