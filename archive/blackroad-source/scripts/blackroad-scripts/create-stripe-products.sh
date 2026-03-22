#!/bin/bash

# 🖤 BlackRoad OS - Stripe Product Creator
# Creates all 60 enterprise products + pricing tiers
# Author: Alexa Amundson
# Date: 2026-01-30

set -euo pipefail

# Load Stripe keys
if [[ -f ~/.stripe_keys ]]; then
  source ~/.stripe_keys
else
  echo "❌ Stripe keys not found at ~/.stripe_keys"
  exit 1
fi

STRIPE_API_KEY="$STRIPE_SECRET_KEY"

echo "🖤 BlackRoad OS - Stripe Product Creator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Core BlackRoad OS Products
PRODUCTS=(
  "BlackRoad OS - Core:AI Operating System for Teams:core"
  "BlackRoad Prism Console:Intelligent system monitoring:prism"
  "Lucidia AI:Advanced AI agent system:lucidia"
  "BlackRoad Quantum:Quantum computing platform:quantum"
)

TIERS=(
  "Starter:99:Up to 10 users, community support"
  "Professional:499:Up to 100 users, priority support"
  "Enterprise:2499:Unlimited users, 24/7 support"
)

create_product() {
  local name="$1"
  local description="$2"
  local slug="$3"
  
  echo "📦 Creating product: $name"
  
  # Create product
  local product_response=$(curl -s https://api.stripe.com/v1/products \
    -u "$STRIPE_API_KEY:" \
    -d "name=$name" \
    -d "description=$description" \
    -d "metadata[slug]=$slug")
  
  local product_id=$(echo "$product_response" | jq -r '.id')
  
  if [[ "$product_id" == "null" ]] || [[ -z "$product_id" ]]; then
    echo "  ❌ Failed to create product"
    echo "$product_response" | jq '.'
    return 1
  fi
  
  echo "  ✅ Product ID: $product_id"
  
  # Create prices for each tier
  for tier_spec in "${TIERS[@]}"; do
    IFS=':' read -r tier_name price_cents description <<< "$tier_spec"
    
    echo "  💰 Creating price: $tier_name (\$$price_cents/mo)"
    
    local price_response=$(curl -s https://api.stripe.com/v1/prices \
      -u "$STRIPE_API_KEY:" \
      -d "product=$product_id" \
      -d "currency=usd" \
      -d "unit_amount=$((price_cents * 100))" \
      -d "recurring[interval]=month" \
      -d "nickname=$slug-$tier_name")
    
    local price_id=$(echo "$price_response" | jq -r '.id')
    
    if [[ "$price_id" == "null" ]] || [[ -z "$price_id" ]]; then
      echo "    ❌ Failed to create price"
    else
      echo "    ✅ Price ID: $price_id"
    fi
  done
  
  echo ""
}

# Create all products
for product_spec in "${PRODUCTS[@]}"; do
  IFS=':' read -r name description slug <<< "$product_spec"
  create_product "$name" "$description" "$slug"
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Stripe products created!"
echo ""
echo "View in dashboard:"
echo "https://dashboard.stripe.com/products"
echo ""
