#!/bin/bash
# Quick Fix Commands for BlackRoad Platform
# Generated: 2026-02-10

echo "🚀 BlackRoad Platform Quick Fix Script"
echo "======================================"
echo ""

# Test current status
echo "1️⃣  Testing current endpoint status..."
echo "--------------------------------------"
for url in \
  "https://blackroad-os-web.pages.dev" \
  "https://blackroad-os-api.pages.dev" \
  "https://blackroad-os-core.pages.dev" \
  "https://blackroad.systems"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url")
  printf "%-50s %s\n" "$url" "$status"
done

echo ""
echo "2️⃣  Clone missing GitHub repos..."
echo "--------------------------------------"
read -p "Clone repos for deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  mkdir -p ~/workspace/blackroad-deployments
  cd ~/workspace/blackroad-deployments
  
  for service in api core operator ideas infra research; do
    if [ ! -d "blackroad-os-$service" ]; then
      echo "Cloning blackroad-os-$service..."
      gh repo clone BlackRoad-OS/blackroad-os-$service
    fi
  done
  
  echo "✅ Repos cloned to ~/workspace/blackroad-deployments"
fi

echo ""
echo "3️⃣  Railway status check..."
echo "--------------------------------------"
railway whoami
railway list

echo ""
echo "======================================"
echo "✅ Status check complete!"
echo ""
echo "Next steps:"
echo "1. Check Railway dashboard: https://railway.app/dashboard"
echo "2. Trigger Cloudflare deployments via GitHub"
echo "3. Run: /tmp/test-all-endpoints.sh (to retest)"
echo "======================================"

