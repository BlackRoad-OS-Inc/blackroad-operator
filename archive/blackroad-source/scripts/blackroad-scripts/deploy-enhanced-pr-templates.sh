#!/bin/bash
# Deploy Enhanced PR Templates to All BlackRoad Repositories
# This script copies the enhanced PR templates to all repositories

set -e

TEMPLATE_SOURCE=".github/PULL_REQUEST_TEMPLATE"
MAIN_TEMPLATE=".github/PULL_REQUEST_TEMPLATE.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BlackRoad OS PR Template Deployment Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Counter variables
UPDATED=0
SKIPPED=0
FAILED=0

# Function to deploy templates to a directory
deploy_templates() {
    local target_dir="$1"
    local target_github="$target_dir/.github"
    local target_template_dir="$target_github/PULL_REQUEST_TEMPLATE"
    
    # Skip if not a valid directory or no .git
    if [ ! -d "$target_dir" ] || [ ! -d "$target_dir/.git" ]; then
        return 1
    fi
    
    echo -e "${YELLOW}→${NC} Processing: $target_dir"
    
    # Create .github directory if it doesn't exist
    mkdir -p "$target_github"
    
    # Copy main template
    if cp "$MAIN_TEMPLATE" "$target_github/PULL_REQUEST_TEMPLATE.md" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Copied main PR template"
    else
        echo -e "  ${RED}✗${NC} Failed to copy main template"
        return 1
    fi
    
    # Create template directory
    mkdir -p "$target_template_dir"
    
    # Copy specialized templates
    local template_count=0
    for template in "$TEMPLATE_SOURCE"/*.md; do
        if [ -f "$template" ]; then
            local template_name=$(basename "$template")
            if cp "$template" "$target_template_dir/$template_name" 2>/dev/null; then
                ((template_count++))
            fi
        fi
    done
    
    echo -e "  ${GREEN}✓${NC} Copied $template_count specialized templates"
    
    return 0
}

# Deployment targets
echo -e "${BLUE}Deployment Strategy:${NC}"
echo "  1. All services in services/"
echo "  2. BlackRoad-Private repository"
echo "  3. BlackRoad-Public repository"
echo "  4. Template directories"
echo "  5. Major project directories"
echo ""

read -p "Deploy to ALL repositories? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Starting deployment...${NC}"
echo ""

# Deploy to services
if [ -d "services" ]; then
    echo -e "${BLUE}═══ Deploying to services/ ═══${NC}"
    for service in services/*/; do
        if deploy_templates "$service"; then
            ((UPDATED++))
        else
            ((SKIPPED++))
        fi
    done
    echo ""
fi

# Deploy to major repositories
MAJOR_REPOS=(
    "BlackRoad-Private"
    "BlackRoad-Public"
    "blackroad-prism-console"
    "blackroad-os-agents"
    "blackroad-workspace-fix"
    "blackroad-services-phase1"
    "projects"
    "templates"
)

echo -e "${BLUE}═══ Deploying to major repositories ═══${NC}"
for repo in "${MAJOR_REPOS[@]}"; do
    if [ -d "$repo" ]; then
        if deploy_templates "$repo"; then
            ((UPDATED++))
        else
            ((SKIPPED++))
        fi
    fi
done
echo ""

# Deploy to template directories
echo -e "${BLUE}═══ Deploying to template directories ═══${NC}"
for template_dir in templates/*/; do
    if deploy_templates "$template_dir"; then
        ((UPDATED++))
    else
        ((SKIPPED++))
    fi
done
echo ""

# Deploy to project directories
if [ -d "projects" ]; then
    echo -e "${BLUE}═══ Deploying to projects/ ═══${NC}"
    for project in projects/*/; do
        if deploy_templates "$project"; then
            ((UPDATED++))
        else
            ((SKIPPED++))
        fi
    done
    echo ""
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Deployment Summary                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Updated: $UPDATED repositories"
echo -e "  ${YELLOW}○${NC} Skipped: $SKIPPED repositories"
echo -e "  ${RED}✗${NC} Failed:  $FAILED repositories"
echo ""

# Git status check
echo -e "${BLUE}Git Status:${NC}"
if git status --short | grep -q "PULL_REQUEST_TEMPLATE"; then
    echo -e "  ${YELLOW}!${NC} Changes detected. Review with: ${GREEN}git status${NC}"
    echo ""
    read -p "Commit changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .github/PULL_REQUEST_TEMPLATE*
        git commit -m "feat(.github): enhance all PR templates with comprehensive structure

- Add main comprehensive PR template with all sections
- Add specialized templates: feature, bugfix, infrastructure, documentation
- Include detailed checklists for security, testing, deployment
- Add emojis for better visual scanning
- Standardize format across all BlackRoad repositories

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
        echo -e "${GREEN}✓${NC} Changes committed!"
    fi
else
    echo -e "  ${GREEN}✓${NC} No changes to commit"
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Review changes: git status"
echo "  2. Test a PR with: gh pr create --template feature"
echo "  3. Push to GitHub: git push"
echo ""
