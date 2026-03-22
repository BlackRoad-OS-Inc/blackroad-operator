#!/bin/bash

echo "🔑 STRIPE SETUP FOR BLACKROAD REVENUE PRODUCTS"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Get your Stripe API keys${NC}"
echo "1. Go to: https://dashboard.stripe.com/apikeys"
echo "2. Copy your Secret key (starts with sk_live_ or sk_test_)"
echo "3. Copy your Publishable key (starts with pk_live_ or pk_test_)"
echo ""
read -p "Paste your Stripe SECRET key: " STRIPE_SECRET
read -p "Paste your Stripe PUBLISHABLE key: " STRIPE_PUBLIC
echo ""

echo -e "${YELLOW}Step 2: Create subscription products${NC}"
echo "Go to https://dashboard.stripe.com/products and create:"
echo ""
echo "Product 1: RoadWork Pro"
echo "  - Price: \$29.99/month"
echo "  - Recurring: Yes"
echo ""
echo "Product 2: RoadWork Premium"
echo "  - Price: \$99.99/month"
echo "  - Recurring: Yes"
echo ""
read -p "Paste the Pro Price ID (price_...): " PRO_PRICE_ID
read -p "Paste the Premium Price ID (price_...): " PREMIUM_PRICE_ID
echo ""

# Save to .env files
echo -e "${YELLOW}Step 3: Saving environment variables...${NC}"

# RoadWork
cat > roadwork/frontend/.env.local <<EOF
# Stripe Keys
STRIPE_SECRET_KEY=$STRIPE_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLIC

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=$PRO_PRICE_ID
STRIPE_PREMIUM_PRICE_ID=$PREMIUM_PRICE_ID

# App URLs
NEXT_PUBLIC_APP_URL=https://roadwork.blackroad.io
NEXT_PUBLIC_API_URL=https://api-roadwork.blackroad.io
EOF

echo -e "${GREEN}✅ Saved to roadwork/frontend/.env.local${NC}"

# Backend
cat > roadwork/.env <<EOF
# Stripe
STRIPE_SECRET_KEY=$STRIPE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database (set these from Railway)
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
EOF

echo -e "${GREEN}✅ Saved to roadwork/.env${NC}"
echo ""

echo -e "${YELLOW}Step 4: Configure Cloudflare Pages environment variables${NC}"
echo ""
echo "Go to each Pages project and add these environment variables:"
echo ""
echo -e "${BLUE}For roadwork-production:${NC}"
echo "STRIPE_SECRET_KEY=$STRIPE_SECRET"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLIC"
echo "STRIPE_PRO_PRICE_ID=$PRO_PRICE_ID"
echo "STRIPE_PREMIUM_PRICE_ID=$PREMIUM_PRICE_ID"
echo "NEXT_PUBLIC_APP_URL=https://roadwork.blackroad.io"
echo ""

echo -e "${YELLOW}Step 5: Set up Stripe webhook${NC}"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Endpoint URL: https://api-roadwork.blackroad.io/webhooks/stripe"
echo "4. Events to send:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "5. Copy the 'Signing secret' (whsec_...)"
echo "6. Add it to Railway environment variables as STRIPE_WEBHOOK_SECRET"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ STRIPE SETUP COMPLETE!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Add environment variables to Cloudflare Pages"
echo "2. Redeploy RoadWork frontend"
echo "3. Configure webhook endpoint"
echo "4. Test payment flow with test card: 4242 4242 4242 4242"
echo ""
echo "Test URL: https://roadwork.blackroad.io/signup?plan=pro"
echo ""
echo "🎉 Ready to make money!"
