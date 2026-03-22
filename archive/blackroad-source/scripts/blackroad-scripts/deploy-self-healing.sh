#!/bin/bash
set -e

echo "🤖 Deploying Self-Healing Workflows to All Repos"
echo "=================================================="

# Get list of BlackRoad-OS repos
REPOS=$(gh repo list BlackRoad-OS --limit 100 --json name --jq '.[].name')

COUNT=0
SUCCESS=0
FAILED=0

for REPO in $REPOS; do
  COUNT=$((COUNT + 1))
  echo ""
  echo "[$COUNT] Processing: BlackRoad-OS/$REPO"
  
  # Clone repo
  TEMP_DIR=$(mktemp -d)
  if gh repo clone "BlackRoad-OS/$REPO" "$TEMP_DIR" 2>/dev/null; then
    cd "$TEMP_DIR"
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    # Copy workflows
    cp ~/.github/workflows/self-healing-master.yml .github/workflows/
    cp ~/.github/workflows/test-auto-heal.yml .github/workflows/
    
    # Commit and push
    git config user.name "BlackRoad Automation"
    git config user.email "automation@blackroad.io"
    git add .github/workflows/
    
    if git diff --staged --quiet; then
      echo "  ✅ Already has self-healing workflows"
    else
      git commit -m "🤖 Add self-healing workflows"
      if git push; then
        echo "  ✅ Self-healing workflows deployed"
        SUCCESS=$((SUCCESS + 1))
      else
        echo "  ❌ Failed to push"
        FAILED=$((FAILED + 1))
      fi
    fi
    
    cd -
    rm -rf "$TEMP_DIR"
  else
    echo "  ⚠️  Skipped (no access or empty)"
  fi
done

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "   Total Repos: $COUNT"
echo "   Deployed: $SUCCESS"
echo "   Failed: $FAILED"
