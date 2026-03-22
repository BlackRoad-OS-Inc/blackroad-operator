#!/bin/bash
# Fix BlackRoad DNS records + chain tunnel
# Usage: ./cf-dns-fix.sh <CF_API_TOKEN>
# Create token at: dash.cloudflare.com/profile/api-tokens
# Needs: Zone:DNS:Edit + Zone:Zone:Read for blackroad.io

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

TOKEN="${1:-$CF_API_TOKEN}"
if [ -z "$TOKEN" ]; then
    echo -e "${RED}Usage: ./cf-dns-fix.sh <CF_API_TOKEN>${RESET}"
    echo -e "${AMBER}Create one at: dash.cloudflare.com/profile/api-tokens${RESET}"
    echo "  Permissions: Zone:DNS:Edit, Zone:Zone:Read"
    echo "  Zone: blackroad.io"
    exit 1
fi

ACCT="848cf0b18d51e0170e0d1537aec3505a"

echo -e "${PINK}BlackRoad DNS Fix${RESET}"
echo ""

# Get zone ID
echo -n "Getting blackroad.io zone ID... "
ZONE_ID=$(curl -sf "https://api.cloudflare.com/client/v4/zones?name=blackroad.io" \
    -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['result'][0]['id'])")
echo -e "${GREEN}$ZONE_ID${RESET}"

# Function to create CNAME
create_cname() {
    local name="$1"
    local target="$2"
    echo -n "  $name.blackroad.io → $target ... "

    RESULT=$(curl -sf -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"type\":\"CNAME\",\"name\":\"$name\",\"content\":\"$target\",\"proxied\":true,\"ttl\":1}" 2>&1) || true

    SUCCESS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if d.get('success') else 'no')" 2>/dev/null || echo "no")

    if [ "$SUCCESS" = "yes" ]; then
        echo -e "${GREEN}CREATED${RESET}"
    else
        # Check if it already exists
        EXISTS=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if any('already exists' in str(e).lower() or e.get('code')==81053 for e in d.get('errors',[])) else 'no')" 2>/dev/null || echo "no")
        if [ "$EXISTS" = "yes" ]; then
            echo -e "${AMBER}ALREADY EXISTS${RESET}"
        else
            echo -e "${RED}FAILED${RESET}"
            echo "    $RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'    {e}') for e in d.get('errors',[])]" 2>/dev/null || echo "    $RESULT"
        fi
    fi
}

echo ""
echo -e "${PINK}Creating DNS CNAME records...${RESET}"
create_cname "network" "blackroad-network.pages.dev"
create_cname "quantum" "blackroadquantum-com.pages.dev"
create_cname "lucidia" "lucidia-earth.pages.dev"

echo ""
echo -e "${PINK}Verifying DNS propagation (may take 30-60s)...${RESET}"
sleep 3
for domain in network.blackroad.io quantum.blackroad.io lucidia.blackroad.io; do
    echo -n "  $domain: "
    IP=$(dig +short "$domain" @1.1.1.1 2>/dev/null | head -1)
    if [ -n "$IP" ]; then
        echo -e "${GREEN}$IP${RESET}"
    else
        echo -e "${AMBER}propagating...${RESET}"
    fi
done

echo ""
echo -e "${PINK}Testing HTTP responses...${RESET}"
for domain in network.blackroad.io quantum.blackroad.io lucidia.blackroad.io index.blackroad.io; do
    echo -n "  https://$domain: "
    STATUS=$(curl -so /dev/null -w "%{http_code}" --max-time 5 "https://$domain" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}$STATUS OK${RESET}"
    elif [ "$STATUS" = "000" ]; then
        echo -e "${AMBER}DNS not ready${RESET}"
    else
        echo -e "${RED}$STATUS${RESET}"
    fi
done

echo ""
echo -e "${AMBER}Manual steps remaining:${RESET}"
echo "  1. chain.blackroad.io: Update tunnel 52915859 in Zero Trust dashboard"
echo "     Change chain.blackroad.io service: localhost:8100 → localhost:8080"
echo "  2. cloud.blackroad.io: Physical reboot of Octavia Pi"
echo ""
echo -e "${GREEN}Done.${RESET}"
