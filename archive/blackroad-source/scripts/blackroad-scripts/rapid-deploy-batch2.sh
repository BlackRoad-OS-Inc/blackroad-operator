#!/bin/bash
echo "🔥 RAPID BATCH DEPLOYMENT #2"
echo "============================="
echo ""

# High-value repos for autonomy
REPOS=(
  "blackroad-analytics-pro"
  "blackroad-guardian"
  "blackroad-security-operations"
  "blackroad-testing"
  "blackroad-edge"
  "blackroad-api-tester"
  "blackroad-models"
  "blackroad-monitor"
  "blackroad-domains"
  "blackroad-os-lucidia"
  "blackroad-creator-studio"
  "blackroad-data-pipeline"
)

SUCCESS=0
SKIPPED=0

for REPO in "${REPOS[@]}"; do
  echo "⚡ $REPO"
  
  # Quick check if it exists
  if gh repo view "BlackRoad-OS/$REPO" >/dev/null 2>&1; then
    # Try to create both workflow files
    if gh api --silent --method PUT \
      "/repos/BlackRoad-OS/$REPO/contents/.github/workflows/self-healing-master.yml" \
      -f message="🤖 Add self-healing autonomy" \
      -f content="$(base64 -i ~/.github/workflows/self-healing-master.yml | tr -d '\n')" 2>/dev/null; then
      
      gh api --silent --method PUT \
        "/repos/BlackRoad-OS/$REPO/contents/.github/workflows/test-auto-heal.yml" \
        -f message="🤖 Add test auto-heal" \
        -f content="$(base64 -i ~/.github/workflows/test-auto-heal.yml | tr -d '\n')" 2>/dev/null
      
      echo "  ✅ Deployed!"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "  ℹ️  Already has workflows"
      SKIPPED=$((SKIPPED + 1))
    fi
  else
    echo "  ⚠️  Repo not accessible"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo "================================"
echo "✅ BATCH 2 COMPLETE!"
echo "   Newly Deployed: $SUCCESS"
echo "   Already Had/Skipped: $SKIPPED"
echo "   Total in Batch: ${#REPOS[@]}"
echo "================================"
