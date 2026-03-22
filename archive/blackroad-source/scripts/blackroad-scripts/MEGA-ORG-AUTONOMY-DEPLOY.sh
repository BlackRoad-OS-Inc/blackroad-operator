#!/bin/bash
# MEGA ORG AUTONOMY DEPLOYMENT
# Deploy self-healing to ALL BlackRoad organizations

echo "🚀🚀🚀 MEGA ORG AUTONOMY DEPLOYMENT! 🚀🚀🚀"
echo "=========================================="
echo ""

# All organizations
ORGS=(
  "BlackRoad-AI"
  "BlackRoad-Labs"
  "BlackRoad-Cloud"
  "BlackRoad-Ventures"
  "BlackRoad-Foundation"
  "BlackRoad-Media"
  "BlackRoad-Hardware"
  "BlackRoad-Education"
  "BlackRoad-Gov"
  "BlackRoad-Security"
  "BlackRoad-Interactive"
  "BlackRoad-Archive"
  "BlackRoad-Studio"
  "Blackbox-Enterprises"
)

TOTAL_DEPLOYED=0
TOTAL_SKIPPED=0
TOTAL_REPOS=0

# Workflow files
WORKFLOW1="$HOME/.github/workflows/self-healing-master.yml"
WORKFLOW2="$HOME/.github/workflows/test-auto-heal.yml"

for ORG in "${ORGS[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🏢 ORGANIZATION: $ORG"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Get all repos in org
  REPOS=$(gh repo list "$ORG" --limit 1000 --json name --jq '.[].name')
  REPO_COUNT=$(echo "$REPOS" | wc -l | tr -d ' ')
  
  echo "📦 Found $REPO_COUNT repos in $ORG"
  echo ""
  
  ORG_DEPLOYED=0
  ORG_SKIPPED=0
  COUNTER=0
  
  while IFS= read -r REPO; do
    COUNTER=$((COUNTER + 1))
    TOTAL_REPOS=$((TOTAL_REPOS + 1))
    
    printf "[%3d/%3d] %-50s " "$COUNTER" "$REPO_COUNT" "$REPO"
    
    # Deploy workflow 1
    CONTENT1=$(base64 -i "$WORKFLOW1" | tr -d '\n')
    RESULT1=$(gh api --method PUT \
      --silent \
      "/repos/$ORG/$REPO/contents/.github/workflows/self-healing-master.yml" \
      -f message="🤖 Multi-org autonomy deployment" \
      -f content="$CONTENT1" 2>/dev/null)
    
    # Deploy workflow 2
    CONTENT2=$(base64 -i "$WORKFLOW2" | tr -d '\n')
    RESULT2=$(gh api --method PUT \
      --silent \
      "/repos/$ORG/$REPO/contents/.github/workflows/test-auto-heal.yml" \
      -f message="🤖 Multi-org autonomy deployment" \
      -f content="$CONTENT2" 2>/dev/null)
    
    if [ -n "$RESULT1" ] || [ -n "$RESULT2" ]; then
      echo "✅"
      ORG_DEPLOYED=$((ORG_DEPLOYED + 1))
      TOTAL_DEPLOYED=$((TOTAL_DEPLOYED + 1))
    else
      echo "⏭️"
      ORG_SKIPPED=$((ORG_SKIPPED + 1))
      TOTAL_SKIPPED=$((TOTAL_SKIPPED + 1))
    fi
    
  done <<< "$REPOS"
  
  echo ""
  echo "📊 $ORG Summary:"
  echo "   ✅ Deployed: $ORG_DEPLOYED"
  echo "   ⏭️ Skipped:  $ORG_SKIPPED"
  echo ""
  
done

echo ""
echo "=========================================="
echo "🎉 MEGA DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "📊 FINAL STATS:"
echo "   Organizations: 14"
echo "   Total Repos:   $TOTAL_REPOS"
echo "   ✅ Deployed:   $TOTAL_DEPLOYED"
echo "   ⏭️ Skipped:    $TOTAL_SKIPPED"
echo ""
echo "🏆 COMBINED WITH BlackRoad-OS (199 repos)"
echo "🏆 GRAND TOTAL: $((TOTAL_DEPLOYED + 199)) AUTONOMOUS REPOS!"
echo ""
echo "=========================================="
echo "💯💯💯 EMPIRE-WIDE AUTONOMY! 💯💯💯"
echo "=========================================="
