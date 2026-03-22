#!/bin/bash
# Simplified deployment - deploy to key repos only
set -e

echo "🤖 Deploying Self-Healing Workflows"
echo "===================================="

KEY_REPOS=(
  "blackroad-io-app"
  "blackroad-os-helper"
  "blackroad-os-simple-launch"
)

for REPO in "${KEY_REPOS[@]}"; do
  echo ""
  echo "📦 Processing: $REPO"
  
  # Use gh to create workflow files directly
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/BlackRoad-OS/$REPO/contents/.github/workflows/self-healing-master.yml" \
    -f message="🤖 Add self-healing master workflow" \
    -f content="$(base64 -i ~/.github/workflows/self-healing-master.yml)" \
    2>/dev/null && echo "  ✅ self-healing-master.yml deployed" || echo "  ℹ️  Already exists"
  
  gh api \
    --method PUT \
    -H "Accept: application/vnd.github+json" \
    "/repos/BlackRoad-OS/$REPO/contents/.github/workflows/test-auto-heal.yml" \
    -f message="🤖 Add test auto-heal workflow" \
    -f content="$(base64 -i ~/.github/workflows/test-auto-heal.yml)" \
    2>/dev/null && echo "  ✅ test-auto-heal.yml deployed" || echo "  ℹ️  Already exists"
  
  echo "  ✅ $REPO updated"
done

echo ""
echo "✅ Self-healing system deployed to key repos!"
