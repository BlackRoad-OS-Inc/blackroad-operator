#!/bin/bash

# Enable GitHub Security Features Across All BlackRoad OS Repositories
# Activates Dependabot alerts and automated security fixes

set -e

echo "🔒 BlackRoad OS Security Features Activation"
echo "============================================"
echo ""

TOTAL=0
SUCCESS=0
FAILED=0
LOG_FILE="$HOME/security-activation-$(date +%Y%m%d-%H%M%S).log"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Fetching repositories..." | tee -a "$LOG_FILE"
repos=$(gh repo list blackroad-os --limit 1000 --json nameWithOwner --jq '.[].nameWithOwner')

TOTAL=$(echo "$repos" | wc -l | tr -d ' ')
echo -e "${GREEN}Found $TOTAL repositories${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

counter=0
for repo in $repos; do
    counter=$((counter + 1))
    repo_name=$(basename "$repo")
    
    if [ $((counter % 50)) -eq 0 ]; then
        echo "Progress: $counter/$TOTAL repositories processed..." | tee -a "$LOG_FILE"
    fi
    
    # Enable Dependabot vulnerability alerts
    if gh api -X PUT "repos/$repo/vulnerability-alerts" 2>> "$LOG_FILE" > /dev/null; then
        # Enable Dependabot automated security fixes
        gh api -X PUT "repos/$repo/automated-security-fixes" 2>> "$LOG_FILE" > /dev/null
        SUCCESS=$((SUCCESS + 1))
    else
        FAILED=$((FAILED + 1))
        echo "  Failed: $repo" >> "$LOG_FILE"
    fi
    
    # Rate limiting - small delay
    if [ $((counter % 10)) -eq 0 ]; then
        sleep 1
    fi
done

echo "" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo "🔒 Security Activation Complete" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo -e "Total Repositories: ${YELLOW}$TOTAL${NC}" | tee -a "$LOG_FILE"
echo -e "Successfully Enabled: ${GREEN}$SUCCESS${NC}" | tee -a "$LOG_FILE"
echo -e "Failed: ${RED}$FAILED${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Features Enabled:" | tee -a "$LOG_FILE"
echo "  ✓ Dependabot vulnerability alerts" | tee -a "$LOG_FILE"
echo "  ✓ Dependabot automated security fixes" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All repositories secured!${NC}" | tee -a "$LOG_FILE"
else
    echo -e "${YELLOW}⚠ Some repositories failed. Check log for details.${NC}" | tee -a "$LOG_FILE"
fi
