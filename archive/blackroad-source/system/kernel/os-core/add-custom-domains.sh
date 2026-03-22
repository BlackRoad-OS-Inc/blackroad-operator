#!/bin/bash

# Add custom domains to Cloudflare Pages projects using the API
# This automates what would normally be done in the dashboard

set -e

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
  echo "Please set it with your Cloudflare API token:"
  echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
  exit 1
fi

API_TOKEN="$CLOUDFLARE_API_TOKEN"

echo "🔧 Adding custom domains to Cloudflare Pages projects"
echo "======================================================"
echo ""

# Function to add a custom domain to a Pages project
add_domain() {
  local project_name=$1
  local domain=$2

  echo "📌 Adding $domain to $project_name..."

  # Cloudflare Pages API endpoint
  local api_url="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$project_name/domains"

  response=$(curl -s -X POST "$api_url" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$domain\"}")

  # Check if successful
  if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "   ✅ Successfully added $domain"
  else
    error_msg=$(echo "$response" | jq -r '.errors[0].message // "Unknown error"')
    echo "   ⚠️  Warning: $error_msg"
    echo "   → This domain may already exist or require manual configuration"
  fi

  echo ""
}

# Add custom domains to existing projects
echo "=== Configuring Existing Projects ==="
echo ""

add_domain "blackroad-os-docs" "docs.blackroad.io"
add_domain "blackroad-os-brand" "brand.blackroad.io"
add_domain "blackroad-os-prism" "prism.blackroad.io"

echo "=== Summary ==="
echo ""
echo "Custom domains configured. Next steps:"
echo ""
echo "1. Verify domains are active in Cloudflare dashboard:"
echo "   → https://dash.cloudflare.com/$ACCOUNT_ID/pages"
echo ""
echo "2. DNS should automatically update (CNAME records)"
echo "   - docs.blackroad.io → blackroad-os-docs.pages.dev"
echo "   - brand.blackroad.io → blackroad-os-brand.pages.dev"
echo "   - prism.blackroad.io → blackroad-os-prism.pages.dev"
echo ""
echo "3. SSL certificates will be issued automatically (1-2 minutes)"
echo ""
echo "Done! ✨"
