#!/bin/bash
# Deploy apps to ALL BlackRoad domains

CF_TOKEN="yP5h0HvsXX0BpHLs01tLmgtTbQurIKPL4YnQfIwy"
API="https://api.cloudflare.com/client/v4"
APP_DIR=~/blackroad-universal-app

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${PINK}━━━ DEPLOYING APPS TO ALL 20 BLACKROAD DOMAINS ━━━${NC}"

declare -A DOMAINS=(
    ["blackroad.io"]="blackroad-io-main"
    ["blackroadai.com"]="blackroad-ai"
    ["blackroadquantum.com"]="blackroad-quantum"
    ["lucidia.earth"]="lucidia-earth"
    ["lucidiaqi.com"]="lucidia-qi"
    ["lucidia.studio"]="lucidia-studio"
    ["roadchain.io"]="roadchain"
    ["roadcoin.io"]="roadcoin"
    ["blackroad.systems"]="blackroad-systems"
    ["blackroad.network"]="blackroad-network"
    ["blackroad.me"]="blackroad-me"
    ["blackroad.company"]="blackroad-company"
    ["blackroadinc.us"]="blackroad-inc-us"
    ["aliceqi.com"]="alice-qi"
    ["blackboxprogramming.io"]="blackbox-programming"
    ["blackroadqi.com"]="blackroad-qi"
    ["blackroadquantum.info"]="blackroad-quantum-info"
    ["blackroadquantum.net"]="blackroad-quantum-net"
    ["blackroadquantum.shop"]="blackroad-quantum-shop"
    ["blackroadquantum.store"]="blackroad-quantum-store"
)

get_zone_id() {
    curl -s "$API/zones?name=$1" -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id'
}

set_dns() {
    local domain="$1"
    local content="$2"
    local zone_id=$(get_zone_id "$domain")
    
    curl -s -X POST "$API/zones/$zone_id/dns_records" \
        -H "Authorization: Bearer $CF_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"CNAME\",\"name\":\"@\",\"content\":\"$content\",\"proxied\":true}" 2>/dev/null || true
}

for domain in "${!DOMAINS[@]}"; do
    project="${DOMAINS[$domain]}"
    echo -e "${YELLOW}[$domain]${NC} → $project"
    wrangler pages deploy "$APP_DIR" --project-name="$project" 2>&1 | tail -1
    sleep 0.3
done

echo -e "${GREEN}✓ Done!${NC}"
