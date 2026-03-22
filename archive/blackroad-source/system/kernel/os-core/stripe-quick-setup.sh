#!/bin/bash
# BlackRoad Stripe Quick Setup Script
# Run this after creating your Stripe account

set -e

echo "🚀 BlackRoad Stripe Quick Setup"
echo "================================"
echo ""

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this from the blackroad-sandbox root directory"
    exit 1
fi

echo "📋 Step 1: Stripe API Keys"
echo "-------------------------"
echo "Go to: https://dashboard.stripe.com/apikeys"
echo ""
read -p "Paste your Stripe SECRET KEY (sk_test_... or sk_live_...): " STRIPE_SECRET_KEY
echo ""
read -p "Paste your Webhook SIGNING SECRET (whsec_...): " STRIPE_WEBHOOK_SECRET
echo ""

# Set worker secrets
echo "🔐 Setting worker secrets..."
cd workers/payment-gateway
echo "$STRIPE_SECRET_KEY" | wrangler secret put STRIPE_SECRET_KEY
echo "$STRIPE_WEBHOOK_SECRET" | wrangler secret put STRIPE_WEBHOOK_SECRET
cd ../..

echo "✅ Secrets configured!"
echo ""

echo "📦 Step 2: Stripe Price IDs"
echo "-------------------------"
echo "Create 3 products in Stripe Dashboard with monthly + yearly prices"
echo "Then paste the Price IDs below:"
echo ""

read -p "Starter Monthly Price ID (price_...): " STARTER_MONTHLY
read -p "Starter Yearly Price ID (price_...): " STARTER_YEARLY
read -p "Pro Monthly Price ID (price_...): " PRO_MONTHLY
read -p "Pro Yearly Price ID (price_...): " PRO_YEARLY
read -p "Enterprise Monthly Price ID (price_...): " ENTERPRISE_MONTHLY
read -p "Enterprise Yearly Price ID (price_...): " ENTERPRISE_YEARLY

echo ""
echo "📝 Updating worker code with Price IDs..."

# Update the price IDs in the worker
cat > workers/payment-gateway/src/pricing-config.ts <<EOF
// Auto-generated pricing configuration
export const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      '10 AI Agents',
      '1,000 tasks/month',
      'Basic analytics',
      'Email support',
      'Community access'
    ],
    agentLimit: 10,
    stripePriceIdMonthly: '${STARTER_MONTHLY}',
    stripePriceIdYearly: '${STARTER_YEARLY}'
  },
  {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      '100 AI Agents',
      '10,000 tasks/month',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access'
    ],
    agentLimit: 100,
    stripePriceIdMonthly: '${PRO_MONTHLY}',
    stripePriceIdYearly: '${PRO_YEARLY}'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 499,
    priceYearly: 4990,
    features: [
      'Unlimited AI Agents',
      'Unlimited tasks',
      'Custom analytics',
      '24/7 phone support',
      'Dedicated account manager',
      'On-premise deployment',
      'SLA guarantees',
      'White-label options'
    ],
    agentLimit: -1,
    stripePriceIdMonthly: '${ENTERPRISE_MONTHLY}',
    stripePriceIdYearly: '${ENTERPRISE_YEARLY}'
  }
];
EOF

echo "✅ Price IDs configured!"
echo ""

echo "🚀 Step 3: Deploying worker..."
cd workers/payment-gateway
wrangler deploy --env production
cd ../..

echo ""
echo "🌐 Step 4: Deploying payment page..."
cd domains/pay-blackroad-io
wrangler pages deploy . --project-name=blackroad-payment-page
cd ../..

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "🎉 Your payment system is now LIVE!"
echo ""
echo "Next steps:"
echo "1. Visit https://pay.blackroad.io (may take 2-3 min for DNS)"
echo "2. Test with Stripe test card: 4242 4242 4242 4242"
echo "3. Check Stripe Dashboard for webhook events"
echo "4. Add pricing links to your main website"
echo ""
echo "📊 Monitor payments:"
echo "   Stripe Dashboard: https://dashboard.stripe.com/payments"
echo "   Worker Logs: wrangler tail blackroad-payment-gateway"
echo ""
echo "💰 Ready to accept payments!"
