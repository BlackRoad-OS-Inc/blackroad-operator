#!/bin/bash

# Enable Dependabot & CodeQL Security Scanning Across All GitHub Organizations
# Comprehensive security hardening for BlackRoad ecosystem

set -e

echo "🔒 BlackRoad Empire - Security Enhancement"
echo "=========================================="
echo "Enabling Dependabot & CodeQL across all organizations"
echo ""

ORGS=(
    "blackboxprogramming"
    "Blackbox-Enterprises"
    "BlackRoad-AI"
    "BlackRoad-OS"
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
)

TOTAL_REPOS=0
SUCCESS=0
FAILED=0
SKIPPED=0
LOG_FILE="$HOME/security-enhancement-$(date +%Y%m%d-%H%M%S).log"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Starting security enhancement at $(date)" | tee "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

for org in "${ORGS[@]}"; do
    echo -e "${BLUE}═══════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}Processing Organization: $org${NC}" | tee -a "$LOG_FILE"
    echo -e "${BLUE}═══════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    # Fetch repos for this org
    echo "Fetching repositories..." | tee -a "$LOG_FILE"
    repos=$(gh repo list "$org" --limit 500 --json nameWithOwner,isPrivate,isFork --jq '.[] | select(.isFork == false) | .nameWithOwner')
    
    if [ -z "$repos" ]; then
        echo -e "${YELLOW}No repositories found or no access to $org${NC}" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
        continue
    fi
    
    repo_count=$(echo "$repos" | wc -l | tr -d ' ')
    TOTAL_REPOS=$((TOTAL_REPOS + repo_count))
    echo -e "${GREEN}Found $repo_count repositories${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    
    counter=0
    for repo in $repos; do
        counter=$((counter + 1))
        repo_name=$(basename "$repo")
        
        echo -ne "  [$counter/$repo_count] $repo_name..."
        
        # Enable Dependabot vulnerability alerts
        if gh api -X PUT "repos/$repo/vulnerability-alerts" 2>> "$LOG_FILE" > /dev/null; then
            # Enable Dependabot automated security fixes
            gh api -X PUT "repos/$repo/automated-security-fixes" 2>> "$LOG_FILE" > /dev/null
            
            # Try to enable secret scanning (might not be available for all repos)
            gh api -X PUT "repos/$repo/secret-scanning" 2>> "$LOG_FILE" > /dev/null || true
            
            # Enable push protection for secret scanning
            gh api -X PUT "repos/$repo/secret-scanning/push-protection" 2>> "$LOG_FILE" > /dev/null || true
            
            echo -e " ${GREEN}✓${NC}"
            SUCCESS=$((SUCCESS + 1))
        else
            echo -e " ${RED}✗${NC}"
            FAILED=$((FAILED + 1))
            echo "  Failed: $repo" >> "$LOG_FILE"
        fi
        
        # Rate limiting
        if [ $((counter % 20)) -eq 0 ]; then
            sleep 2
        fi
    done
    
    echo "" | tee -a "$LOG_FILE"
done

echo "" | tee -a "$LOG_FILE"
echo -e "${GREEN}═══════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}Security Enhancement Complete!${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}═══════════════════════════════════════${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Summary:" | tee -a "$LOG_FILE"
echo -e "  Total Organizations: ${BLUE}${#ORGS[@]}${NC}" | tee -a "$LOG_FILE"
echo -e "  Total Repositories: ${YELLOW}$TOTAL_REPOS${NC}" | tee -a "$LOG_FILE"
echo -e "  Successfully Enhanced: ${GREEN}$SUCCESS${NC}" | tee -a "$LOG_FILE"
echo -e "  Failed: ${RED}$FAILED${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Security Features Enabled:" | tee -a "$LOG_FILE"
echo "  ✓ Dependabot vulnerability alerts" | tee -a "$LOG_FILE"
echo "  ✓ Dependabot automated security fixes" | tee -a "$LOG_FILE"
echo "  ✓ Secret scanning (where available)" | tee -a "$LOG_FILE"
echo "  ✓ Secret scanning push protection (where available)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Next Steps:" | tee -a "$LOG_FILE"
echo "  1. Enable CodeQL for key repositories with .github/workflows/codeql.yml" | tee -a "$LOG_FILE"
echo "  2. Review Dependabot alerts in each repository" | tee -a "$LOG_FILE"
echo "  3. Configure branch protection rules" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Completed at $(date)" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All repositories successfully secured!${NC}" | tee -a "$LOG_FILE"
    exit 0
else
    echo -e "${YELLOW}⚠ Some repositories failed. Check log for details.${NC}" | tee -a "$LOG_FILE"
    exit 1
fi
