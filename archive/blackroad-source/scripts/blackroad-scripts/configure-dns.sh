#!/bin/bash
#
# BlackRoad Services - DNS Configuration Script
# Updates Cloudflare DNS to point to Vercel
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load Cloudflare token
if [ ! -f ~/.cloudflare_dns_token ]; then
  echo -e "${RED}Error: Cloudflare DNS token not found at ~/.cloudflare_dns_token${NC}"
  exit 1
fi

export CF_TOKEN=$(cat ~/.cloudflare_dns_token)
export ZONE_ID="13293825c2b0491085cbece9fc02e401"

# Service mappings (subdomain:vercel_url)
declare -A SERVICES=(
  ["prism"]="prism-two-ruby.vercel.app"
  ["operator"]="operator-swart.vercel.app"
  ["brand"]="brand-ten-woad.vercel.app"
  ["docs"]="docs-one-wheat.vercel.app"
  ["core"]="core-six-dun.vercel.app"
  ["ideas"]="ideas-five-self.vercel.app"
  ["infra"]="infra-ochre-three.vercel.app"
  ["research"]="research-ten-zeta.vercel.app"
  ["demo"]="demo-psi-hazel-24.vercel.app"
  ["api"]="api-pearl-seven.vercel.app"
)

echo -e "${BLUE}🌐 BlackRoad DNS Configuration${NC}"
echo -e "${BLUE}===============================${NC}\n"

# Function to update DNS record
update_dns() {
  local subdomain=$1
  local target=$2
  
  echo -e "${BLUE}Configuring $subdomain.blackroad.systems...${NC}"
  
  # Get existing record ID
  record_id=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$subdomain.blackroad.systems" \
    -H "Authorization: Bearer $CF_TOKEN" | jq -r '.result[0].id // empty')
  
  if [ -z "$record_id" ]; then
    # Create new record
    echo -e "${YELLOW}  Creating new DNS record...${NC}"
    result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{
        \"type\": \"CNAME\",
        \"name\": \"$subdomain\",
        \"content\": \"cname.vercel-dns.com\",
        \"ttl\": 1,
        \"proxied\": false
      }")
  else
    # Update existing record
    echo -e "${YELLOW}  Updating existing DNS record...${NC}"
    result=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$record_id" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -H "Content-Type: application/json" \
      --data "{
        \"type\": \"CNAME\",
        \"name\": \"$subdomain\",
        \"content\": \"cname.vercel-dns.com\",
        \"ttl\": 1,
        \"proxied\": false
      }")
  fi
  
  success=$(echo "$result" | jq -r '.success')
  
  if [ "$success" = "true" ]; then
    echo -e "${GREEN}  ✅ DNS configured successfully${NC}\n"
  else
    error=$(echo "$result" | jq -r '.errors[0].message // "Unknown error"')
    echo -e "${RED}  ❌ Failed: $error${NC}\n"
  fi
}

# Configure DNS for all services
for subdomain in "${!SERVICES[@]}"; do
  update_dns "$subdomain" "${SERVICES[$subdomain]}"
  sleep 1
done

echo -e "${BLUE}===============================${NC}"
echo -e "${GREEN}🎉 DNS Configuration Complete!${NC}"
echo -e "${BLUE}===============================${NC}\n"

echo -e "${YELLOW}Note: DNS propagation may take a few minutes.${NC}"
echo -e "${YELLOW}Test with: dig +short <subdomain>.blackroad.systems CNAME${NC}\n"
