#!/bin/bash

# Create Pull Requests for Security Enhancement Branches
# Merges security scanning workflows across all BlackRoad OS repositories

set -e

echo "🔒 Creating Security Enhancement Pull Requests"
echo "=============================================="
echo ""

SUCCESSFUL=0
FAILED=0
LOG_FILE="$HOME/security-pr-creation-$(date +%Y%m%d-%H%M%S).log"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get all repos with the security branch
echo "Finding repositories with security branches..." | tee -a "$LOG_FILE"

gh repo list blackroad-os --limit 1000 --json nameWithOwner --jq '.[].nameWithOwner' | while read repo; do
    echo "" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}Checking: $repo${NC}" | tee -a "$LOG_FILE"
    
    # Check if security branch exists
    if gh api "repos/$repo/git/refs/heads/security/add-security-scanning-20260202" 2>/dev/null > /dev/null; then
        echo -e "  ${GREEN}✓ Security branch found${NC}" | tee -a "$LOG_FILE"
        
        # Check if PR already exists
        existing_pr=$(gh pr list --repo "$repo" --head "security/add-security-scanning-20260202" --json number --jq '.[0].number' 2>/dev/null || echo "")
        
        if [ -n "$existing_pr" ]; then
            echo -e "  ${YELLOW}PR already exists (#$existing_pr)${NC}" | tee -a "$LOG_FILE"
        else
            # Create PR
            if gh pr create --repo "$repo" \
                --head "security/add-security-scanning-20260202" \
                --base "main" \
                --title "🔒 Security: Add GitHub Security Scanning & Dependabot" \
                --body "## Security Enhancement 🔒

This PR adds comprehensive security scanning to the repository.

### What's Included

✅ **CodeQL Analysis** - Automated code vulnerability scanning
- Scans JavaScript, TypeScript, and Python
- Runs on push, PR, and weekly schedule

✅ **Dependabot** - Automated dependency updates
- Weekly updates for npm, pip, Docker, and GitHub Actions
- Keeps dependencies secure and current

✅ **Dependency Review** - PR security checks
- Blocks moderate+ severity vulnerabilities
- Reviews all dependency changes

✅ **Security Audit** - Daily vulnerability scanning
- npm audit for Node.js projects
- pip-audit for Python projects

✅ **SECURITY.md** - Security policy
- Vulnerability reporting process
- Security contact: security@blackroad.io
- 48-hour response commitment

### Benefits

- Proactive vulnerability detection
- Automated security updates
- Compliance with industry best practices
- Clear security reporting channel

### No Action Required

These workflows will run automatically once merged. No configuration needed.

---
**Deployment**: Part of organization-wide security enhancement
**Date**: $(date +%Y-%m-%d)" 2>> "$LOG_FILE"; then
                
                echo -e "  ${GREEN}✓ PR created successfully${NC}" | tee -a "$LOG_FILE"
                SUCCESSFUL=$((SUCCESSFUL + 1))
            else
                echo -e "  ${RED}✗ Failed to create PR${NC}" | tee -a "$LOG_FILE"
                FAILED=$((FAILED + 1))
            fi
        fi
    else
        echo -e "  ${YELLOW}No security branch found${NC}" | tee -a "$LOG_FILE"
    fi
    
    # Rate limiting delay
    sleep 1
done

echo "" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo "🔒 PR Creation Complete" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo -e "Successfully Created: ${GREEN}$SUCCESSFUL${NC}" | tee -a "$LOG_FILE"
echo -e "Failed: ${RED}$FAILED${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
