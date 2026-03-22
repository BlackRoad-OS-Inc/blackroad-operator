#!/bin/bash

# Cleanup redundant Cloudflare Pages projects
# These are duplicate subdomain projects that all point to the same content

set -e

echo "🧹 Cloudflare Pages Cleanup Script"
echo "===================================="
echo ""
echo "⚠️  WARNING: This will DELETE Cloudflare Pages projects permanently!"
echo "This script will remove redundant subdomain projects that were created"
echo "before implementing individual Pages per project."
echo ""

# List of redundant projects to delete
REDUNDANT_PROJECTS=(
  "subdomains-blackroad-io"
  "subdomains-blackroad-me"
  "subdomains-blackroad-network"
  "subdomains-blackroad-systems"
  "subdomains-blackroadai-com"
  "subdomains-blackroadqi-com"
  "subdomains-blackroadinc-us"
  "subdomains-lucidia-earth"
  "subdomains-lucidiastud-io"
  "subdomains-lucidiaqi-com"
  "subdomains-aliceqi-com"
  "blackroad-subdomains"
  "blackroad-subdomains-blackroad-io"
  "blackroad-subdomains-blackroad-me"
  "blackroad-subdomains-blackroad-network"
  "blackroad-subdomains-blackroad-systems"
  "blackroad-subdomains-blackroadai-com"
  "blackroad-subdomains-blackroadqi-com"
  "blackroad-subdomains-blackroadinc-us"
  "blackroad-subdomains-blackroadquantum-com"
  "blackroad-subdomains-blackroadquantum-info"
  "blackroad-subdomains-blackroadquantum-net"
  "blackroad-subdomains-blackroadquantum-shop"
  "blackroad-subdomains-blackroadquantum-store"
  "blackroad-subdomains-lucidia-earth"
  "blackroad-subdomains-lucidiastud-io"
  "blackroad-subdomains-lucidiaqi-com"
  "blackroad-subdomains-aliceqi-com"
)

# Projects to KEEP (do not delete these)
KEEP_PROJECTS=(
  "blackroad-os-web"
  "blackroad-os-docs"
  "blackroad-os-brand"
  "blackroad-os-prism"
  "lucidia-platform"
  "lucidia-math"
  "lucidia-core"
  "blackroad-tools"
  "blackroad-os-archive"
  "blackroad-agents"
  "blackroad-chat"
  "blackroad-api-docs"
  "blackroad-status"
)

echo "Projects to DELETE (${#REDUNDANT_PROJECTS[@]} total):"
echo ""
for project in "${REDUNDANT_PROJECTS[@]}"; do
  echo "  ❌ $project"
done

echo ""
echo "Projects to KEEP (will not be deleted):"
echo ""
for project in "${KEEP_PROJECTS[@]}"; do
  echo "  ✅ $project"
done

echo ""
echo "────────────────────────────────────────"
echo ""

# Ask for confirmation
read -p "Are you sure you want to DELETE these ${#REDUNDANT_PROJECTS[@]} projects? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo ""
  echo "❌ Cancelled. No projects were deleted."
  exit 0
fi

echo ""
echo "🗑️  Starting deletion process..."
echo ""

# Counter for successful deletions
deleted_count=0
failed_count=0
skipped_count=0

# Delete each redundant project
for project in "${REDUNDANT_PROJECTS[@]}"; do
  echo "Processing: $project"

  # Check if project exists
  if wrangler pages project list 2>/dev/null | grep -q "│ $project "; then
    echo "  → Deleting $project..."

    # Attempt deletion
    if wrangler pages project delete "$project" --yes 2>/dev/null; then
      echo "  ✅ Deleted $project"
      ((deleted_count++))
    else
      echo "  ⚠️  Failed to delete $project"
      ((failed_count++))
    fi
  else
    echo "  ℹ️  Project $project not found (already deleted or doesn't exist)"
    ((skipped_count++))
  fi

  echo ""
done

# Summary
echo "════════════════════════════════════════"
echo "🎉 Cleanup Complete!"
echo "════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  ✅ Deleted: $deleted_count projects"
echo "  ⚠️  Failed: $failed_count projects"
echo "  ℹ️  Skipped: $skipped_count projects (not found)"
echo ""
echo "Total processed: ${#REDUNDANT_PROJECTS[@]} projects"
echo ""

# List remaining projects
echo "Remaining Cloudflare Pages projects:"
echo ""
wrangler pages project list 2>/dev/null | grep "│" | head -20

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Verify individual projects are working correctly"
echo "2. Update any documentation that referenced old projects"
echo "3. Monitor your Cloudflare Pages dashboard"
echo ""
