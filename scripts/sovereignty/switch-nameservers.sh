#!/bin/bash
# Switch ALL BlackRoad domains from Cloudflare NS to our own PowerDNS
# Requires: ~/.blackroad/godaddy-credentials with GODADDY_KEY and GODADDY_SECRET
# ns1 = 159.65.43.12 (Gematria)
# ns2 = 174.138.44.45 (Anastasia)
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

CREDS="$HOME/.blackroad/godaddy-credentials"
if [ ! -f "$CREDS" ]; then
  echo -e "${RED}No GoDaddy credentials at $CREDS${RESET}"
  echo "Create it with:"
  echo "  GODADDY_KEY=your_key"
  echo "  GODADDY_SECRET=your_secret"
  echo "Get keys at: https://developer.godaddy.com/keys"
  exit 1
fi

GD_KEY=$(grep '^GODADDY_KEY=' "$CREDS" | cut -d= -f2 | tr -d ' "'"'"'')
GD_SECRET=$(grep '^GODADDY_SECRET=' "$CREDS" | cut -d= -f2 | tr -d ' "'"'"'')
AUTH="sso-key ${GD_KEY}:${GD_SECRET}"

DOMAINS="blackroad.io blackroad.me blackroad.company blackroad.network blackroad.systems blackroadinc.us blackroadai.com blackroadqi.com blackroadquantum.com blackroadquantum.net blackroadquantum.info blackroadquantum.shop blackroadquantum.store blackboxprogramming.io lucidia.earth lucidia.studio lucidiaqi.com aliceqi.com roadchain.io roadcoin.io"

NS='[{"nameserver":"ns1.blackroad.io"},{"nameserver":"ns2.blackroad.io"}]'

echo -e "${PINK}Switching nameservers to BlackRoad PowerDNS${RESET}"
echo -e "${BLUE}ns1 = 159.65.43.12 (Gematria)${RESET}"
echo -e "${BLUE}ns2 = 174.138.44.45 (Anastasia)${RESET}"
echo ""

# First set glue records — ns1 and ns2 need IP addresses at the registrar
echo -e "${BLUE}Setting glue records...${RESET}"
for domain in blackroad.io; do
  curl -s -X PUT "https://api.godaddy.com/v1/domains/$domain/records" \
    -H "Authorization: $AUTH" \
    -H "Content-Type: application/json" \
    -d '[{"type":"A","name":"ns1","data":"159.65.43.12","ttl":3600},{"type":"A","name":"ns2","data":"174.138.44.45","ttl":3600}]' 2>/dev/null
  echo "  Glue records set for $domain"
done

echo ""
echo -e "${BLUE}Switching nameservers...${RESET}"
switched=0
failed=0

for domain in $DOMAINS; do
  result=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "https://api.godaddy.com/v1/domains/$domain" \
    -H "Authorization: $AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"nameServers\":[\"ns1.blackroad.io\",\"ns2.blackroad.io\"]}" 2>/dev/null)
  
  if [ "$result" = "200" ] || [ "$result" = "204" ]; then
    echo -e "  ${GREEN}$domain → ns1/ns2.blackroad.io${RESET}"
    switched=$((switched+1))
  else
    echo -e "  ${RED}$domain → FAILED (HTTP $result)${RESET}"
    failed=$((failed+1))
  fi
done

echo ""
echo -e "${PINK}Done: $switched switched, $failed failed${RESET}"
echo -e "${BLUE}DNS propagation takes 24-48 hours.${RESET}"
echo -e "${BLUE}Verify: dig NS blackroad.io +short${RESET}"
