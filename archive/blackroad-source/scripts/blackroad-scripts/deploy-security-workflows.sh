#!/bin/bash

# Deploy Security Workflows to All BlackRoad OS Repositories
# This script adds GitHub security scanning, Dependabot, and security policies

set -e

echo "🔒 BlackRoad OS Security Enhancement Deployment"
echo "=============================================="
echo ""

WORKFLOWS_DIR="$HOME/.github-security-workflows"
TOTAL_REPOS=0
SUCCESSFUL_REPOS=0
FAILED_REPOS=0
LOG_FILE="$HOME/security-deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to deploy security files to a repository
deploy_to_repo() {
    local repo=$1
    local repo_name=$(basename "$repo")
    
    echo -e "${YELLOW}Processing: $repo${NC}" | tee -a "$LOG_FILE"
    
    # Create temporary directory for this repo
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Clone the repository
    if ! gh repo clone "$repo" . 2>> "$LOG_FILE"; then
        echo -e "${RED}✗ Failed to clone $repo${NC}" | tee -a "$LOG_FILE"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Create .github/workflows directory if it doesn't exist
    mkdir -p .github/workflows
    
    # Copy security workflows
    cp "$WORKFLOWS_DIR/codeql-analysis.yml" .github/workflows/
    cp "$WORKFLOWS_DIR/dependency-review.yml" .github/workflows/
    cp "$WORKFLOWS_DIR/security-audit.yml" .github/workflows/
    
    # Copy Dependabot config
    cp "$WORKFLOWS_DIR/dependabot.yml" .github/
    
    # Copy SECURITY.md if it doesn't exist
    if [ ! -f "SECURITY.md" ]; then
        cp "$WORKFLOWS_DIR/SECURITY.md" .
    fi
    
    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}  No changes needed${NC}" | tee -a "$LOG_FILE"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 0
    fi
    
    # Create branch for changes
    local branch_name="security/add-security-scanning-$(date +%Y%m%d)"
    git checkout -b "$branch_name" 2>> "$LOG_FILE"
    
    # Stage all changes
    git add .github/workflows/*.yml .github/dependabot.yml SECURITY.md 2>> "$LOG_FILE"
    
    # Commit changes
    git commit -m "security: Add GitHub security scanning workflows

- Add CodeQL analysis for automated code scanning
- Add Dependabot for dependency updates
- Add dependency review for PRs
- Add security audit workflows
- Add SECURITY.md policy

These changes enhance repository security by:
- Scanning for vulnerabilities in code
- Keeping dependencies up to date
- Reviewing dependencies in pull requests
- Establishing clear security reporting procedures" 2>> "$LOG_FILE"
    
    # Push branch
    if ! git push -u origin "$branch_name" 2>> "$LOG_FILE"; then
        echo -e "${RED}✗ Failed to push to $repo${NC}" | tee -a "$LOG_FILE"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Create pull request
    if gh pr create \
        --title "🔒 Add Security Scanning & Dependabot" \
        --body "## Security Enhancement

This PR adds comprehensive security scanning to the repository:

### What's Added

- **CodeQL Analysis**: Automated code scanning for security vulnerabilities
  - Runs on push, PR, and weekly schedule
  - Supports JavaScript, TypeScript, and Python
  
- **Dependabot**: Automated dependency updates
  - Weekly scans for GitHub Actions, npm, pip, and Docker
  - Keeps dependencies secure and up-to-date
  
- **Dependency Review**: PR-based dependency scanning
  - Reviews new dependencies in pull requests
  - Blocks moderate+ severity vulnerabilities
  
- **Security Audit**: Daily security audits
  - npm audit for Node.js projects
  - pip-audit for Python projects
  
- **SECURITY.md**: Security policy and reporting guidelines

### Benefits

✅ Proactive vulnerability detection
✅ Automated security updates  
✅ Clear security reporting process
✅ Compliance with security best practices

### Testing

These workflows will run automatically on:
- Every push to main/master/develop
- Every pull request
- Scheduled intervals (daily/weekly)

No action required - the workflows will begin scanning once merged." \
        --label "security" \
        --label "enhancement" 2>> "$LOG_FILE"; then
        
        echo -e "${GREEN}✓ Successfully deployed to $repo${NC}" | tee -a "$LOG_FILE"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 0
    else
        echo -e "${RED}✗ Failed to create PR for $repo${NC}" | tee -a "$LOG_FILE"
        cd - > /dev/null
        rm -rf "$temp_dir"
        return 1
    fi
}

# Get list of all BlackRoad OS repositories
echo "Fetching BlackRoad OS repositories..." | tee -a "$LOG_FILE"
repos=$(gh repo list blackroad-os --limit 1000 --json nameWithOwner --jq '.[].nameWithOwner')

if [ -z "$repos" ]; then
    echo -e "${RED}No repositories found!${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# Count total repositories
TOTAL_REPOS=$(echo "$repos" | wc -l | tr -d ' ')
echo -e "${GREEN}Found $TOTAL_REPOS repositories${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Process each repository
counter=0
for repo in $repos; do
    counter=$((counter + 1))
    echo "" | tee -a "$LOG_FILE"
    echo "[$counter/$TOTAL_REPOS] Processing $repo" | tee -a "$LOG_FILE"
    echo "----------------------------------------" | tee -a "$LOG_FILE"
    
    if deploy_to_repo "$repo"; then
        SUCCESSFUL_REPOS=$((SUCCESSFUL_REPOS + 1))
    else
        FAILED_REPOS=$((FAILED_REPOS + 1))
    fi
    
    # Small delay to avoid rate limiting
    sleep 2
done

# Summary
echo "" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo "🔒 Security Deployment Complete" | tee -a "$LOG_FILE"
echo "============================================" | tee -a "$LOG_FILE"
echo -e "Total Repositories: ${YELLOW}$TOTAL_REPOS${NC}" | tee -a "$LOG_FILE"
echo -e "Successfully Deployed: ${GREEN}$SUCCESSFUL_REPOS${NC}" | tee -a "$LOG_FILE"
echo -e "Failed: ${RED}$FAILED_REPOS${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"

if [ $FAILED_REPOS -eq 0 ]; then
    echo -e "${GREEN}✓ All repositories updated successfully!${NC}" | tee -a "$LOG_FILE"
    exit 0
else
    echo -e "${YELLOW}⚠ Some repositories failed. Check the log for details.${NC}" | tee -a "$LOG_FILE"
    exit 1
fi
