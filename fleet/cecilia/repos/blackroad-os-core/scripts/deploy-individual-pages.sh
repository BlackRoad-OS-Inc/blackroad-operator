#!/bin/bash

# Master deployment script for individual Cloudflare Pages
# This orchestrates the entire deployment process

set -e

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   BlackRoad OS - Individual Cloudflare Pages Deployment       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ Error: wrangler not found"
  echo "Install with: npm install -g wrangler"
  exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "❌ Error: gh CLI not found"
  echo "Install with: brew install gh"
  exit 1
fi

# Check if authenticated with Cloudflare
if ! wrangler whoami &> /dev/null; then
  echo "❌ Error: Not authenticated with Cloudflare"
  echo "Run: wrangler login"
  exit 1
fi

echo "✅ All prerequisites met"
echo ""

# Interactive menu
echo "═══════════════════════════════════════"
echo "What would you like to do?"
echo "═══════════════════════════════════════"
echo ""
echo "1. Add custom domains to existing projects (docs, brand, prism)"
echo "2. Create landing pages for projects without web UI"
echo "3. List all current Cloudflare Pages projects"
echo "4. Set up GitHub Actions for a repository"
echo "5. Clean up redundant subdomain projects"
echo "6. Run full deployment (all steps)"
echo "7. Exit"
echo ""

read -p "Select an option (1-7): " option

case $option in
  1)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Adding custom domains..."
    echo "═══════════════════════════════════════"
    echo ""

    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
      echo "⚠️  CLOUDFLARE_API_TOKEN not set"
      echo "This step requires API access. You can:"
      echo "1. Set CLOUDFLARE_API_TOKEN and run ./scripts/add-custom-domains.sh"
      echo "2. Add domains manually in the dashboard:"
      echo "   → https://dash.cloudflare.com/$ACCOUNT_ID/pages"
      echo ""
      echo "Manual steps:"
      echo "  • blackroad-os-docs → add docs.blackroad.io"
      echo "  • blackroad-os-brand → add brand.blackroad.io"
      echo "  • blackroad-os-prism → add prism.blackroad.io"
    else
      ./scripts/add-custom-domains.sh
    fi
    ;;

  2)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Creating landing pages..."
    echo "═══════════════════════════════════════"
    echo ""

    # Projects that might need landing pages
    PROJECTS=(
      "lucidia-math:Lucidia Math:Advanced mathematical engines for consciousness modeling"
      "lucidia-core:Lucidia Core:AI reasoning engines - physicist, mathematician, chemist"
      "blackroad-tools:BlackRoad Tools:ERP, CRM, and DevOps utilities"
      "blackroad-os-archive:BlackRoad Archive:Append-only archive and system artifacts"
    )

    for project_info in "${PROJECTS[@]}"; do
      IFS=':' read -r name title description <<< "$project_info"

      echo ""
      read -p "Create landing page for $name? (y/n): " create_landing

      if [ "$create_landing" = "y" ]; then
        ./scripts/create-simple-landing-page.sh "$name" "$title" "$description"
      fi
    done
    ;;

  3)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Current Cloudflare Pages Projects"
    echo "═══════════════════════════════════════"
    echo ""
    wrangler pages project list
    ;;

  4)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Set up GitHub Actions"
    echo "═══════════════════════════════════════"
    echo ""

    read -p "Enter repository name (e.g., blackroad-os-docs): " repo_name
    read -p "Enter project name for Cloudflare Pages (e.g., blackroad-os-docs): " project_name
    read -p "Enter build output directory (e.g., dist): " output_dir

    echo ""
    echo "To set up GitHub Actions:"
    echo ""
    echo "1. Clone the repository:"
    echo "   git clone https://github.com/BlackRoad-OS/$repo_name.git"
    echo ""
    echo "2. Copy the workflow template:"
    echo "   mkdir -p $repo_name/.github/workflows"
    echo "   cp scripts/github-actions-template.yml $repo_name/.github/workflows/deploy-cloudflare-pages.yml"
    echo ""
    echo "3. Edit the workflow file and replace:"
    echo "   - PROJECT_NAME_HERE → $project_name"
    echo "   - directory: dist → directory: $output_dir"
    echo ""
    echo "4. Add GitHub secrets to the repository:"
    echo "   https://github.com/BlackRoad-OS/$repo_name/settings/secrets/actions"
    echo "   Add these secrets:"
    echo "     CLOUDFLARE_API_TOKEN: (your Cloudflare API token)"
    echo "     CLOUDFLARE_ACCOUNT_ID: $ACCOUNT_ID"
    echo ""
    echo "5. Commit and push:"
    echo "   cd $repo_name"
    echo "   git add .github/workflows/deploy-cloudflare-pages.yml"
    echo "   git commit -m 'Add Cloudflare Pages deployment workflow'"
    echo "   git push"
    ;;

  5)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Clean up redundant projects"
    echo "═══════════════════════════════════════"
    echo ""
    ./scripts/cleanup-redundant-pages.sh
    ;;

  6)
    echo ""
    echo "═══════════════════════════════════════"
    echo "Running full deployment..."
    echo "═══════════════════════════════════════"
    echo ""

    echo "Step 1: Adding custom domains..."
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
      ./scripts/add-custom-domains.sh
    else
      echo "⚠️  Skipping (CLOUDFLARE_API_TOKEN not set)"
    fi

    echo ""
    echo "Step 2: Listing current projects..."
    wrangler pages project list | head -20

    echo ""
    echo "Step 3: Creating landing pages..."
    echo "This step is interactive. Please run option 2 separately."

    echo ""
    echo "Step 4: GitHub Actions setup..."
    echo "This step is interactive. Please run option 4 separately."

    echo ""
    echo "Step 5: Cleanup..."
    echo "Run option 5 separately after verifying individual projects work."

    echo ""
    echo "✅ Automated steps complete!"
    echo ""
    echo "Manual steps remaining:"
    echo "  • Create landing pages (option 2)"
    echo "  • Set up GitHub Actions (option 4)"
    echo "  • Clean up redundant projects (option 5)"
    ;;

  7)
    echo "Exiting..."
    exit 0
    ;;

  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "═══════════════════════════════════════"
echo "✨ Done!"
echo "═══════════════════════════════════════"
echo ""
echo "For more information, see:"
echo "  • CLOUDFLARE_PAGES_DEPLOYMENT_PLAN.md"
echo "  • CLOUDFLARE_PAGES_IMPLEMENTATION_GUIDE.md"
echo ""
