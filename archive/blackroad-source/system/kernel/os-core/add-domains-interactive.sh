#!/bin/bash

# Interactive script to add custom domains to Cloudflare Pages
# This will guide you through getting the API token and adding domains

set -e

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Add Custom Domains to Cloudflare Pages                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if API token is already set
if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
  echo "✅ Found CLOUDFLARE_API_TOKEN in environment"
  API_TOKEN="$CLOUDFLARE_API_TOKEN"
else
  echo "🔑 Cloudflare API Token Required"
  echo ""
  echo "To get your API token:"
  echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
  echo "2. Click 'Create Token'"
  echo "3. Use 'Edit Cloudflare Pages' template (or create custom with Pages edit permission)"
  echo "4. Copy the token"
  echo ""
  echo "Opening browser to API tokens page..."
  sleep 2
  open "https://dash.cloudflare.com/profile/api-tokens" 2>/dev/null || echo "Please visit: https://dash.cloudflare.com/profile/api-tokens"
  echo ""

  read -sp "Paste your API token here (it won't be displayed): " API_TOKEN
  echo ""
  echo ""
fi

# Validate token works
echo "🔍 Validating API token..."
test_response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json")

if echo "$test_response" | grep -q '"success":true'; then
  echo "✅ API token is valid!"
else
  echo "❌ API token validation failed"
  echo "Response: $test_response"
  exit 1
fi

echo ""
echo "════════════════════════════════════════"
echo "Adding Custom Domains"
echo "════════════════════════════════════════"
echo ""

# Function to add domain
add_domain() {
  local project_name=$1
  local domain=$2

  echo "📌 Adding $domain to $project_name..."

  response=$(curl -s -X POST \
    "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$project_name/domains" \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$domain\"}")

  if echo "$response" | grep -q '"success":true'; then
    echo "   ✅ Successfully added $domain"
  else
    error=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1)
    if echo "$response" | grep -q "already exists"; then
      echo "   ℹ️  Domain already exists (this is fine)"
    else
      echo "   ⚠️  Warning: $error"
      echo "   → You may need to add this manually in the dashboard"
    fi
  fi
  echo ""
}

# Add domains to projects
echo "Adding domains to existing Cloudflare Pages projects:"
echo ""

add_domain "blackroad-os-docs" "docs.blackroad.io"
add_domain "blackroad-os-brand" "brand.blackroad.io"
add_domain "blackroad-os-prism" "prism.blackroad.io"

echo "════════════════════════════════════════"
echo "✨ Domain Configuration Complete!"
echo "════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Wait 1-2 minutes for DNS to propagate"
echo ""
echo "2. Test your domains:"
echo "   curl -I https://docs.blackroad.io"
echo "   curl -I https://brand.blackroad.io"
echo "   curl -I https://prism.blackroad.io"
echo ""
echo "3. Open in browser to verify content:"
echo "   open https://docs.blackroad.io"
echo "   open https://brand.blackroad.io"
echo "   open https://prism.blackroad.io"
echo ""
echo "4. If you want to save this token for future use:"
echo "   echo 'export CLOUDFLARE_API_TOKEN=\"$API_TOKEN\"' >> ~/.zshrc"
echo "   source ~/.zshrc"
echo ""
echo "Domains should now show content from their individual repositories!"
echo ""
