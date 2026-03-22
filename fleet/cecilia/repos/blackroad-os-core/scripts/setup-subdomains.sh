#!/bin/bash

# Setup all BlackRoad OS subdomains
# Configures DNS records and Railway custom domains

set -e

echo "🌐 BlackRoad OS - Complete Subdomain Setup"
echo "==========================================="
echo ""
echo "This script will help you configure:"
echo "  1. DNS records in Cloudflare"
echo "  2. Custom domains in Railway"
echo "  3. Cloudflare Pages custom domains"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Railway Project IDs
declare -A RAILWAY_PROJECTS=(
  ["roadwork"]="9d3d2549-3778-4c86-8afd-cefceaaa74d2"
  ["core"]="aa968fb7-ec35-4a8b-92dc-1eba70fa8478"
  ["operator"]="e8b256aa-8708-4eb2-ba24-99eba4fe7c2e"
  ["master"]="85e6de55-fefd-4e8d-a9ec-d20c235c2551"
  ["beacon"]="8ac583cb-ffad-40bd-8676-6569783274d1"
  ["packs"]="b61ecd98-adb2-4788-a2e0-f98e322af53a"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Cloudflare DNS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please add these DNS records in Cloudflare Dashboard:"
echo "https://dash.cloudflare.com → blackroad.io → DNS → Records"
echo ""

echo "${YELLOW}Frontend Subdomains (Cloudflare Pages):${NC}"
echo ""
cat <<EOF
┌────────────┬─────────────────────────────────────────┬─────────┐
│ Type       │ Name      │ Content                     │ Proxy   │
├────────────┼───────────┼─────────────────────────────┼─────────┤
│ CNAME      │ @         │ blackroad-home.pages.dev    │ Proxied │
│ CNAME      │ app       │ blackroad-console.pages.dev │ Proxied │
│ CNAME      │ roadwork  │ roadwork.pages.dev          │ Proxied │
│ CNAME      │ prism     │ blackroad-prism-console.p.. │ Proxied │
│ CNAME      │ docs      │ blackroad-docs.pages.dev    │ Proxied │
└────────────┴───────────┴─────────────────────────────┴─────────┘
EOF
echo ""

echo "${YELLOW}Backend Subdomains (Railway):${NC}"
echo ""
cat <<EOF
┌────────────┬──────────────┬─────────────────────────────────────────┬─────────┐
│ Type       │ Name         │ Content                                 │ Proxy   │
├────────────┼──────────────┼─────────────────────────────────────────┼─────────┤
│ CNAME      │ api          │ blackroad-core-production.up.railway... │ Proxied │
│ CNAME      │ api-roadwork │ roadwork-production.up.railway.app      │ Proxied │
│ CNAME      │ operator     │ blackroad-operator-production.up.rai... │ Proxied │
│ CNAME      │ master       │ blackroad-master-production.up.railw... │ Proxied │
│ CNAME      │ beacon       │ blackroad-beacon-production.up.railw... │ Proxied │
│ CNAME      │ packs        │ blackroad-packs-production.up.railway.. │ Proxied │
└────────────┴──────────────┴─────────────────────────────────────────┴─────────┘
EOF
echo ""

read -p "Have you added these DNS records in Cloudflare? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please add DNS records first, then run this script again."
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Railway Custom Domains"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configuring Railway custom domains..."
echo ""

configure_railway_domain() {
  local project_name=$1
  local project_id=$2
  local domain=$3
  local service_name=$4

  echo "📦 Configuring $domain → $project_name"

  railway link "$project_id" 2>/dev/null || true

  echo "   → Add custom domain: $domain"
  echo "   → In Railway Dashboard:"
  echo "     1. Go to https://railway.app/project/$project_id"
  echo "     2. Select service: $service_name"
  echo "     3. Settings → Domains"
  echo "     4. Add custom domain: $domain"
  echo ""
}

# Configure each Railway service
configure_railway_domain "RoadWork" "${RAILWAY_PROJECTS[roadwork]}" "api-roadwork.blackroad.io" "roadwork-api"
configure_railway_domain "Core" "${RAILWAY_PROJECTS[core]}" "api.blackroad.io" "blackroad-os-core"
configure_railway_domain "Operator" "${RAILWAY_PROJECTS[operator]}" "operator.blackroad.io" "blackroad-os-operator"
configure_railway_domain "Master" "${RAILWAY_PROJECTS[master]}" "master.blackroad.io" "blackroad-os-master"
configure_railway_domain "Beacon" "${RAILWAY_PROJECTS[beacon]}" "beacon.blackroad.io" "blackroad-os-beacon"
configure_railway_domain "Packs" "${RAILWAY_PROJECTS[packs]}" "packs.blackroad.io" "blackroad-packs"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Cloudflare Pages Custom Domains"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configure custom domains for Cloudflare Pages:"
echo ""

add_pages_domain() {
  local project_name=$1
  local domain=$2
  local pages_project=$3

  echo "📄 $project_name"
  echo "   Domain: $domain"
  echo "   Pages Project: $pages_project"
  echo ""
  echo "   Steps:"
  echo "   1. Go to Cloudflare Dashboard → Pages"
  echo "   2. Select project: $pages_project"
  echo "   3. Custom domains → Set up a custom domain"
  echo "   4. Enter: $domain"
  echo "   5. Cloudflare auto-configures DNS"
  echo ""
}

add_pages_domain "RoadWork" "roadwork.blackroad.io" "roadwork"
add_pages_domain "BlackRoad Home" "blackroad.io" "blackroad-home"
add_pages_domain "App Console" "app.blackroad.io" "blackroad-console"
add_pages_domain "Prism" "prism.blackroad.io" "blackroad-prism-console"
add_pages_domain "Docs" "docs.blackroad.io" "blackroad-docs"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuration Guide Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1. Add DNS records in Cloudflare (if not done)"
echo "2. Add custom domains in Railway for each service"
echo "3. Add custom domains in Cloudflare Pages"
echo "4. Wait for DNS propagation (5-10 minutes)"
echo "5. Test each subdomain!"
echo ""
echo "Test URLs:"
echo "  Frontend (should work immediately after Pages config):"
echo "    https://roadwork.blackroad.io"
echo "    https://app.blackroad.io"
echo "    https://blackroad.io"
echo ""
echo "  Backend (after Railway deployment):"
echo "    https://api-roadwork.blackroad.io/health"
echo "    https://api.blackroad.io/health"
echo ""
echo "📚 Full documentation: RAILWAY_SUBDOMAIN_MAPPING.md"
echo ""
