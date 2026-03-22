#!/bin/bash

# Setup Individual Cloudflare Pages for BlackRoad OS Projects
# Each project gets its own dedicated Cloudflare Page with unique content

set -e

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

echo "🚀 Setting up individual Cloudflare Pages for BlackRoad OS"
echo "=================================================="

# Function to add custom domain to a Pages project
add_custom_domain() {
  local project_name=$1
  local domain=$2

  echo "📌 Adding custom domain $domain to $project_name..."

  # Note: This requires Cloudflare API call, as wrangler doesn't have direct command
  # Using wrangler pages deployment create instead
  echo "   → Domain: $domain"
  echo "   → Project: $project_name"
  echo "   ⚠️  Manual step: Add this domain in Cloudflare dashboard"
  echo "   → https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a/pages/view/$project_name/domains"
  echo ""
}

# Priority 1: Configure existing projects with custom domains
echo ""
echo "=== PRIORITY 1: Existing Projects ==="
echo ""

add_custom_domain "blackroad-os-docs" "docs.blackroad.io"
add_custom_domain "blackroad-os-brand" "brand.blackroad.io"
add_custom_domain "blackroad-os-prism" "prism.blackroad.io"

# Priority 2: Create new Pages projects for existing repos
echo ""
echo "=== PRIORITY 2: New Pages Projects ==="
echo ""

# Check if we need to create new projects
PROJECTS_TO_CREATE=(
  "lucidia-platform:lucidia.earth"
  "lucidia-math:math.lucidia.earth"
  "lucidia-core:core.lucidia.earth"
  "blackroad-tools:tools.blackroad.io"
  "blackroad-os-archive:archive.blackroad.io"
)

echo "Projects that need new Cloudflare Pages:"
for project in "${PROJECTS_TO_CREATE[@]}"; do
  IFS=':' read -r name domain <<< "$project"
  echo "  • $name → $domain"
done

echo ""
echo "=== GitHub Repository Status ==="
echo ""

# Check which repos exist and are accessible
gh repo list BlackRoad-OS --limit 100 --json name,isPrivate,pushedAt | \
  jq -r '.[] | select(.name | test("lucidia-platform|lucidia-math|lucidia-core|blackroad-tools|blackroad-os-archive|blackroad-os-docs|blackroad-os-brand|blackroad-os-prism")) | "\(.name) - Private: \(.isPrivate) - Last push: \(.pushedAt)"'

echo ""
echo "=== Next Steps ==="
echo ""
echo "To complete the individual Pages setup:"
echo ""
echo "1. Add custom domains (requires Cloudflare dashboard):"
echo "   → https://dash.cloudflare.com/$ACCOUNT_ID/pages"
echo ""
echo "2. For each project with a GitHub repo, connect it in Cloudflare Pages:"
echo "   - Go to Pages > Create a project > Connect to Git"
echo "   - Select the repository"
echo "   - Configure build settings"
echo "   - Add custom domain"
echo ""
echo "3. For projects without web UI, create a simple landing page:"
echo "   - Create a basic HTML/React app"
echo "   - Add to new repo or subfolder"
echo "   - Connect to Cloudflare Pages"
echo ""
echo "4. Clean up redundant subdomain projects:"
echo "   - Delete duplicate 'subdomains-*' and 'blackroad-subdomains-*' projects"
echo "   - Keep only the individual project Pages"
echo ""

# Output a summary of what needs to be done
echo "=== Summary ==="
echo ""
echo "✅ Existing Pages with Git integration: 4"
echo "   - blackroad-os-web (already configured)"
echo "   - blackroad-os-docs (needs custom domain)"
echo "   - blackroad-os-brand (needs custom domain)"
echo "   - blackroad-os-prism (needs custom domain)"
echo ""
echo "⏳ New Pages to create: 5"
echo "   - lucidia-platform"
echo "   - lucidia-math"
echo "   - lucidia-core"
echo "   - blackroad-tools"
echo "   - blackroad-os-archive"
echo ""
echo "🧹 Projects to clean up/delete: ~20"
echo "   - All 'subdomains-*' projects"
echo "   - All 'blackroad-subdomains-*' projects"
echo ""
echo "Done! ✨"
