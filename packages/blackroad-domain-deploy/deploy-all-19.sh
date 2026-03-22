#!/bin/bash
# Deploy all 19 BlackRoad domain sites to Cloudflare Pages
# Usage: ./deploy-all-19.sh [--dry-run] [--only domain.com]
set -e

ACCT="848cf0b18d51e0170e0d1537aec3505a"
SITES_DIR="$(cd "$(dirname "$0")/sites" && pwd)"
DRY_RUN=false
ONLY=""

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --only) ONLY="$2"; shift 2 ;;
    *) echo "Usage: $0 [--dry-run] [--only domain.com]"; exit 1 ;;
  esac
done

DOMAINS=(
  blackroad.io
  blackroad.company
  blackroad.me
  blackroad.network
  blackroad.systems
  blackroadqi.com
  blackroadquantum.com
  blackroadquantum.info
  blackroadquantum.net
  blackroadquantum.shop
  blackroadquantum.store
  lucidia.earth
  lucidia.studio
  lucidiaqi.com
  roadchain.io
  roadcoin.io
  blackroadai.com
  blackboxprogramming.io
  blackroadinc.us
)

ok=0; fail=0; skip=0

echo -e "${PINK}━━━ BlackRoad Domain Deploy ━━━${RESET}"
echo -e "${AMBER}Deploying ${#DOMAINS[@]} domains to Cloudflare Pages${RESET}"
echo ""

for domain in "${DOMAINS[@]}"; do
  if [[ -n "$ONLY" && "$domain" != "$ONLY" ]]; then
    continue
  fi

  # Convert domain to project name (dots to dashes)
  project="${domain//./-}"
  site_dir="$SITES_DIR/$domain"

  if [[ ! -f "$site_dir/index.html" ]]; then
    echo -e "${RED}SKIP${RESET} $domain — no index.html"
    ((skip++))
    continue
  fi

  size=$(wc -c < "$site_dir/index.html")
  echo -ne "${BLUE}DEPLOY${RESET} $domain (${size}B) → $project ... "

  if $DRY_RUN; then
    echo -e "${AMBER}DRY RUN${RESET}"
    ((ok++))
    continue
  fi

  # Create project if it doesn't exist (ignore errors if already exists)
  npx wrangler pages project create "$project" --production-branch main 2>/dev/null || true

  # Deploy
  if npx wrangler pages deploy "$site_dir" --project-name "$project" --branch main 2>/dev/null; then
    echo -e "${GREEN}OK${RESET}"
    ((ok++))
  else
    echo -e "${RED}FAIL${RESET}"
    ((fail++))
  fi
done

echo ""
echo -e "${PINK}━━━ Summary ━━━${RESET}"
echo -e "${GREEN}OK: $ok${RESET}  ${RED}FAIL: $fail${RESET}  ${AMBER}SKIP: $skip${RESET}"
