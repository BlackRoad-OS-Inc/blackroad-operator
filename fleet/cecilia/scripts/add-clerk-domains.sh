#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# Add all 20 domains to Clerk via API

CLERK_SECRET="sk_test_8YUC3WTdI3xJs2qQP0TyXWsAKuVlXWXRzaWCm0QlB8"

DOMAINS=(
  "blackroad.io"
  "blackroad.systems"
  "blackroadquantum.com"
  "blackroadquantum.info"
  "blackroadquantum.net"
  "blackroadquantum.shop"
  "blackroadquantum.store"
  "blackroadai.com"
  "blackroadqi.com"
  "lucidia.earth"
  "lucidiaqi.com"
  "lucidia.studio"
  "aliceqi.com"
  "blackroad.me"
  "blackroad.company"
  "blackroadinc.us"
  "blackroad.network"
  "roadchain.io"
  "roadcoin.io"
  "blackboxprogramming.io"
)

echo "🌐 Adding Domains to Clerk"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ADDED=0
FAILED=0
SKIPPED=0

for domain in "${DOMAINS[@]}"; do
  echo -n "➕ Adding: $domain ... "
  
  response=$(curl -s -X POST https://api.clerk.com/v1/domains \
    -H "Authorization: Bearer $CLERK_SECRET" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$domain\",
      \"is_satellite\": false
    }")
  
  # Check if successful
  if echo "$response" | grep -q '"object":"domain"'; then
    echo "✅ SUCCESS"
    ((ADDED++))
  elif echo "$response" | grep -q "already exists"; then
    echo "⏭️  ALREADY EXISTS"
    ((SKIPPED++))
  else
    echo "❌ FAILED"
    echo "   Error: $response" | head -c 100
    echo ""
    ((FAILED++))
  fi
  
  # Rate limit - don't hammer the API
  sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   Added:   $ADDED"
echo "   Skipped: $SKIPPED"
echo "   Failed:  $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ADDED -gt 0 ] || [ $SKIPPED -eq 20 ]; then
  echo "✅ Clerk domains configured!"
  echo ""
  echo "🎯 Next: Set up Clerk webhook"
  echo "   1. Go to: https://dashboard.clerk.com → Webhooks"
  echo "   2. Add endpoint: https://blackroad.io/api/clerk/webhook"
  echo "   3. Select events: user.created, user.updated"
  echo ""
fi
