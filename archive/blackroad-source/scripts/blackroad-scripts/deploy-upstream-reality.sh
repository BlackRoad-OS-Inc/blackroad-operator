#!/bin/bash
# Deploy BlackRoad Upstream Sync to ALL forks
# This makes the auto-implement reality REAL

set -e

WORK_DIR="/tmp/blackroad-upstream-deploy"
LOG_FILE="$HOME/.blackroad/deployment.log"
DB_FILE="$HOME/.blackroad/upstream-reality.db"

mkdir -p "$WORK_DIR"
mkdir -p "$(dirname $LOG_FILE)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
HOT_PINK='\033[38;5;198m'
NC='\033[0m'

echo -e "${HOT_PINK}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${HOT_PINK}║  🚀 DEPLOYING UPSTREAM SYNC TO ALL FORKS                ║${NC}"
echo -e "${HOT_PINK}║  Making Auto-Implement REAL                              ║${NC}"
echo -e "${HOT_PINK}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get all forks
forks=$(sqlite3 "$DB_FILE" "SELECT fork_repo, upstream_repo FROM forks;")
total=$(echo "$forks" | wc -l | tr -d ' ')
count=0
deployed=0
skipped=0
failed=0

echo -e "${CYAN}Deploying to $total forks...${NC}"
echo ""

while IFS='|' read -r fork_repo upstream_repo; do
    ((count++))
    repo_name=$(basename "$fork_repo")
    
    printf "[%3d/%3d] %s ... " "$count" "$total" "$repo_name"
    
    # Clone
    repo_dir="$WORK_DIR/$repo_name"
    rm -rf "$repo_dir"
    
    if ! gh repo clone "$fork_repo" "$repo_dir" 2>/dev/null; then
        echo -e "${RED}✗ clone failed${NC}"
        ((failed++))
        continue
    fi
    
    cd "$repo_dir"
    
    # Check if workflow already exists
    if [ -f ".github/workflows/blackroad-upstream-sync.yml" ]; then
        if grep -q "6 hours" ".github/workflows/blackroad-upstream-sync.yml" 2>/dev/null; then
            echo -e "${YELLOW}⏭️ already deployed${NC}"
            ((skipped++))
            rm -rf "$repo_dir"
            continue
        fi
    fi
    
    # Create workflow directory
    mkdir -p .github/workflows
    
    # Create the sync workflow
    cat > .github/workflows/blackroad-upstream-sync.yml << 'WORKFLOWEOF'
name: BlackRoad Upstream Sync

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Configure Git
        run: |
          git config user.name "BlackRoad Sync Bot"
          git config user.email "sync@blackroad.io"
      
      - name: Get upstream info
        id: upstream
        run: |
          UPSTREAM=$(gh api repos/${{ github.repository }} --jq '.parent.full_name // empty')
          echo "repo=$UPSTREAM" >> $GITHUB_OUTPUT
          echo "🔍 Upstream: $UPSTREAM"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Sync from upstream
        if: steps.upstream.outputs.repo != ''
        run: |
          echo "🔄 Starting sync from ${{ steps.upstream.outputs.repo }}"
          
          git remote add upstream https://github.com/${{ steps.upstream.outputs.repo }}.git || true
          git fetch upstream
          
          DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
          echo "📌 Default branch: $DEFAULT_BRANCH"
          
          # Check if there are changes
          CHANGES=$(git rev-list --count HEAD..upstream/$DEFAULT_BRANCH 2>/dev/null || echo "0")
          echo "📊 Commits behind upstream: $CHANGES"
          
          if [ "$CHANGES" = "0" ]; then
            echo "✅ Already up to date with upstream"
            exit 0
          fi
          
          # Try to merge
          if git merge upstream/$DEFAULT_BRANCH -m "🔄 Auto-sync from upstream

          Automated by BlackRoad Upstream Sync
          Source: ${{ steps.upstream.outputs.repo }}
          Commits merged: $CHANGES"; then
            git push origin $DEFAULT_BRANCH
            echo "✅ Successfully synced $CHANGES commits from upstream"
          else
            echo "⚠️ Merge conflict detected - creating PR"
            git merge --abort
            
            BRANCH_NAME="upstream-sync-$(date +%Y%m%d-%H%M%S)"
            git checkout -b $BRANCH_NAME
            git reset --hard upstream/$DEFAULT_BRANCH
            git push -u origin $BRANCH_NAME
            
            gh pr create \
              --title "🔄 Upstream sync requires manual merge" \
              --body "## Automated Sync from Upstream

This PR contains updates from the upstream repository that could not be automatically merged.

**Source:** ${{ steps.upstream.outputs.repo }}
**Commits:** $CHANGES new commits

### Manual Resolution Required
Please review and merge these changes manually.

---
🖤🛣️ Generated by BlackRoad Upstream Sync" \
              --head $BRANCH_NAME \
              --base $DEFAULT_BRANCH
            
            echo "📝 Created PR for manual review"
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Verify sync
        run: |
          echo ""
          echo "🖤🛣️ BlackRoad Upstream Sync Complete"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "Repository: ${{ github.repository }}"
          echo "Upstream: ${{ steps.upstream.outputs.repo }}"
          echo "Time: $(date -u)"
WORKFLOWEOF

    # Create/update .blackroad.yml
    cat > .blackroad.yml << CONFIGEOF
# BlackRoad Fork Configuration
version: 2.0.0
fork_type: sovereignty
upstream: $upstream_repo
upstream_sync:
  enabled: true
  schedule: "0 */6 * * *"
  auto_merge: true
  conflict_action: create_pr
design_system:
  colors:
    hot_pink: "#FF1D6C"
    amber: "#F5A623"
    electric_blue: "#2979FF"
    violet: "#9C27B0"
organization: BlackRoad-OS
website: https://blackroad.io
CONFIGEOF

    # Commit and push
    git add .github/workflows/blackroad-upstream-sync.yml .blackroad.yml
    
    if git commit -m "🔄 Add BlackRoad Upstream Sync automation

- Automatic upstream sync every 6 hours
- Auto-merge when possible
- Creates PR on merge conflicts
- BlackRoad configuration added

Part of BlackRoad Upstream Reality System
https://blackroad.io" 2>/dev/null; then
        
        if git push 2>/dev/null; then
            echo -e "${GREEN}✓ deployed${NC}"
            ((deployed++))
            
            # Update database
            sqlite3 "$DB_FILE" "UPDATE forks SET brand_applied=1 WHERE fork_repo='$fork_repo';" 2>/dev/null || true
        else
            echo -e "${RED}✗ push failed${NC}"
            ((failed++))
        fi
    else
        echo -e "${YELLOW}⏭️ no changes${NC}"
        ((skipped++))
    fi
    
    rm -rf "$repo_dir"
    
    # Rate limiting
    sleep 2
done <<< "$forks"

echo ""
echo -e "${HOT_PINK}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${HOT_PINK}║  📊 DEPLOYMENT COMPLETE                                 ║${NC}"
echo -e "${HOT_PINK}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${HOT_PINK}║  ${GREEN}✓ Deployed:${NC}  $deployed                                    ${HOT_PINK}║${NC}"
echo -e "${HOT_PINK}║  ${YELLOW}⏭️ Skipped:${NC}   $skipped                                    ${HOT_PINK}║${NC}"
echo -e "${HOT_PINK}║  ${RED}✗ Failed:${NC}    $failed                                     ${HOT_PINK}║${NC}"
echo -e "${HOT_PINK}╚══════════════════════════════════════════════════════════╝${NC}"

# Log to memory
~/memory-system.sh log deployed "upstream-reality-workflows" "Deployed upstream sync to $deployed forks (skipped: $skipped, failed: $failed). Auto-implement is now REAL across $deployed repositories." "upstream,deployment,automation" 2>/dev/null || true

echo ""
echo -e "${GREEN}🎉 AUTO-IMPLEMENT IS NOW REAL!${NC}"
echo "All deployed forks will now automatically sync from upstream every 6 hours."
