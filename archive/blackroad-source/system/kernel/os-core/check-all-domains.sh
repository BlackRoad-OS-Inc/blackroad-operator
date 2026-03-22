#!/bin/bash

domains=(
  "blackroad.io"
  "blackroad.me"
  "blackroad.network"
  "blackroadai.com"
  "blackroadinc.us"
  "blackroadqi.com"
  "blackroadquantum.com"
  "blackroadquantum.info"
  "blackroadquantum.net"
  "blackroadquantum.shop"
  "blackroadquantum.store"
  "lucidia.studio"
  "www.blackroad.io"
  "www.blackroad.me"
  "www.blackroad.network"
  "www.blackroadai.com"
  "www.blackroadinc.us"
  "www.blackroadqi.com"
)

echo "🔍 Checking all 18 domains for BREAK..."
echo ""

working=0
broken=0

for domain in "${domains[@]}"; do
  echo -n "Checking $domain... "
  if curl -sL --max-time 5 "https://$domain" | grep -q "BREAK"; then
    echo "✅ BREAK found"
    ((working++))
  else
    echo "❌ BREAK not found or timeout"
    ((broken++))
  fi
done

echo ""
echo "========================================="
echo "Results:"
echo "✅ Working: $working"
echo "❌ Broken: $broken"
echo "========================================="
