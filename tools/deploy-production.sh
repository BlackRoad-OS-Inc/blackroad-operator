#!/bin/bash
# Deploy all production sites to CF Pages
# Usage: ./deploy-production.sh [site]  — deploy one site
#        ./deploy-production.sh all     — deploy all sites
set -e

PROD="$HOME/blackroad-operator/production"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
DIM='\033[2m'
BOLD='\033[1m'
RED='\033[0;31m'
RESET='\033[0m'

# site_dir → CF Pages project name
declare -A SITES=(
  ["blackroad-io"]="blackroad-io"
  ["search"]="blackroad-search-site"
  ["social"]="backroad-social-site"
  ["docs"]="blackroad-docs-site"
  ["status"]="blackroad-status-site"
  ["pay"]="blackroad-pay-site"
  ["tutor"]="blackroad-tutor"
  ["agents"]="blackroad-agents-site"
  ["pricing"]="blackroad-pricing-site"
)

deploy_site() {
  local dir="$1" project="$2"
  local path="$PROD/$dir"

  if [ ! -f "$path/index.html" ]; then
    echo -e "  ${RED}skip${RESET} $dir — no index.html"
    return
  fi

  # Add common files
  cat > "$path/robots.txt" 2>/dev/null << EOF
User-agent: *
Allow: /
Sitemap: https://$(grep -o 'href="https://[^"]*"' "$path/index.html" | grep canonical | sed 's/.*href="//;s/".*//')/sitemap.xml
EOF

  cat > "$path/_headers" 2>/dev/null << EOF
/*
  X-Powered-By: BlackRoad OS
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
EOF

  # Create project if needed (ignore errors if exists)
  npx wrangler pages project create "$project" --production-branch main 2>/dev/null || true

  # Deploy
  local result=$(npx wrangler pages deploy "$path" --project-name "$project" 2>&1)
  if echo "$result" | grep -q "Deployment complete"; then
    local url=$(echo "$result" | grep -o 'https://[^ ]*pages.dev' | head -1)
    echo -e "  ${GREEN}✓${RESET} ${BOLD}$dir${RESET} → $project  ${DIM}$url${RESET}"
  else
    echo -e "  ${RED}✗${RESET} $dir — $(echo "$result" | tail -1)"
  fi
}

echo -e "\n${PINK}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  Deploy Production Sites to CF Pages             ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n"

if [ "$1" = "all" ] || [ -z "$1" ]; then
  for dir in "${!SITES[@]}"; do
    deploy_site "$dir" "${SITES[$dir]}"
  done
else
  if [ -n "${SITES[$1]}" ]; then
    deploy_site "$1" "${SITES[$1]}"
  else
    echo -e "  ${RED}Unknown site:${RESET} $1"
    echo "  Available: ${!SITES[*]}"
  fi
fi

echo -e "\n  ${BOLD}${GREEN}Done.${RESET}\n"
