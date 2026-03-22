#!/bin/bash
# DNS Migration: Pis First, Gematria Fallback
# Moves ALL subdomains to Pi-hosted CF Tunnels
# Keeps root domains on CF as DDoS shield
# Kills all Anastasia (159.65.43.12) references
#
# Architecture:
#   Internet → CF (root only) → CF Tunnel → Pi Fleet
#   Alice:    headscale, qdrant, stats-proxy, auth, chat, dispatch
#   Octavia:  portal, git, code, cloud, roundtrip, ollama, workers (:9001-9015)
#   Lucidia:  web apps, prism, api-lucidia, monitor
#   Gematria: fallback catch-all (Caddy)

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

# CF API
CF_TOKEN="${CF_API_TOKEN:-$(cat ~/.cloudflare-token 2>/dev/null)}"
CF_ACCOUNT="848cf0b18d51e0170e0d1537aec3505a"
API="https://api.cloudflare.com/client/v4"

if [ -z "$CF_TOKEN" ]; then
  echo -e "${RED}ERROR: No CF_API_TOKEN or ~/.cloudflare-token found${RESET}"
  exit 1
fi

cf_api() {
  local method="$1" path="$2" data="$3"
  if [ -n "$data" ]; then
    curl -s -X "$method" "$API$path" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data"
  else
    curl -s -X "$method" "$API$path" \
      -H "Authorization: Bearer $CF_TOKEN" \
      -H "Content-Type: application/json"
  fi
}

echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║${RESET}  ${BLUE}DNS Migration: Pis First${RESET}                              ${PINK}║${RESET}"
echo -e "${PINK}║${RESET}  Kill Anastasia refs, route through CF Tunnels to Pis    ${PINK}║${RESET}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# All 19 domains
DOMAINS=(
  blackboxprogramming.io blackroad.company blackroad.io blackroad.me
  blackroad.network blackroad.systems blackroadai.com blackroadinc.us
  blackroadqi.com blackroadquantum.com blackroadquantum.info
  blackroadquantum.net blackroadquantum.shop blackroadquantum.store
  lucidia.earth lucidia.studio lucidiaqi.com roadchain.io roadcoin.io
)

# Tunnel IDs
TUNNEL_ALICE="52915859-da18-4aa6-add5-7bd9fcac2e0b"
TUNNEL_OCTAVIA="0447556b-9f07-4506-ab03-0440731d3656"
TUNNEL_LUCIDIA="b7e9f25e-82b6-4a04-8e85-ee5b4ce6eddb"

# Anastasia IP to kill
ANASTASIA="159.65.43.12"
# Gematria as fallback
GEMATRIA="174.138.44.45"

# Step 1: Get all zone IDs
echo -e "${BLUE}Step 1: Fetching zone IDs...${RESET}"
declare -A ZONE_IDS

for domain in "${DOMAINS[@]}"; do
  zone_id=$(cf_api GET "/zones?name=$domain&status=active" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result',[])
print(r[0]['id'] if r else '')
" 2>/dev/null)
  if [ -n "$zone_id" ]; then
    ZONE_IDS["$domain"]="$zone_id"
    echo -e "  ${GREEN}✓${RESET} $domain → $zone_id"
  else
    echo -e "  ${RED}✗${RESET} $domain — not found"
  fi
done

echo ""
echo -e "${BLUE}Step 2: Scanning for Anastasia records (${ANASTASIA})...${RESET}"

ANASTASIA_RECORDS=()
for domain in "${DOMAINS[@]}"; do
  zone_id="${ZONE_IDS[$domain]}"
  [ -z "$zone_id" ] && continue

  # Get all DNS records
  page=1
  while true; do
    result=$(cf_api GET "/zones/$zone_id/dns_records?per_page=100&page=$page")
    records=$(echo "$result" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for r in d.get('result',[]):
  if r.get('content') == '$ANASTASIA':
    print(f\"{r['id']}|{r['type']}|{r['name']}|{r['content']}|{r.get('proxied',False)}\")
" 2>/dev/null)

    if [ -n "$records" ]; then
      while IFS= read -r line; do
        ANASTASIA_RECORDS+=("$domain|$zone_id|$line")
        rec_name=$(echo "$line" | cut -d'|' -f3)
        echo -e "  ${AMBER}⚠${RESET} $rec_name → $ANASTASIA"
      done <<< "$records"
    fi

    # Check if more pages
    total_pages=$(echo "$result" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('result_info',{}).get('total_pages',1))" 2>/dev/null)
    [ "$page" -ge "${total_pages:-1}" ] && break
    page=$((page + 1))
  done
done

echo ""
echo -e "${BLUE}Found ${#ANASTASIA_RECORDS[@]} Anastasia records to migrate${RESET}"
echo ""

# Step 3: Show what we'll do
echo -e "${BLUE}Step 3: Migration plan${RESET}"
echo ""
echo "  For each Anastasia subdomain record:"
echo "  → If it maps to a Pi-hosted service → CNAME to tunnel"
echo "  → If it's a generic subdomain → Point to Gematria as fallback"
echo "  → Root domains stay as-is (CF-proxied)"
echo ""

if [ "$1" != "--execute" ]; then
  echo -e "${AMBER}DRY RUN — pass --execute to apply changes${RESET}"
  echo ""

  for entry in "${ANASTASIA_RECORDS[@]}"; do
    domain=$(echo "$entry" | cut -d'|' -f1)
    zone_id=$(echo "$entry" | cut -d'|' -f2)
    rec_id=$(echo "$entry" | cut -d'|' -f3)
    rec_type=$(echo "$entry" | cut -d'|' -f4)
    rec_name=$(echo "$entry" | cut -d'|' -f5)

    # Determine new target
    sub="${rec_name%%.$domain}"
    case "$sub" in
      portal|services|squad|roadcode-squad)
        new_target="$TUNNEL_OCTAVIA.cfargotunnel.com"
        echo -e "  ${GREEN}CNAME${RESET} $rec_name → Octavia tunnel"
        ;;
      git|code|roadcode|cloud)
        new_target="$TUNNEL_OCTAVIA.cfargotunnel.com"
        echo -e "  ${GREEN}CNAME${RESET} $rec_name → Octavia tunnel"
        ;;
      chat|auth|dispatch|headscale|qdrant|stats-proxy)
        new_target="$TUNNEL_ALICE.cfargotunnel.com"
        echo -e "  ${GREEN}CNAME${RESET} $rec_name → Alice tunnel"
        ;;
      api-lucidia|monitor-lucidia|prism|lucidia)
        new_target="$TUNNEL_LUCIDIA.cfargotunnel.com"
        echo -e "  ${GREEN}CNAME${RESET} $rec_name → Lucidia tunnel"
        ;;
      *)
        new_target="$GEMATRIA"
        echo -e "  ${BLUE}A    ${RESET} $rec_name → Gematria (fallback)"
        ;;
    esac
  done

  echo ""
  echo -e "${AMBER}Run with --execute to apply all changes${RESET}"
  exit 0
fi

# Step 4: Execute migration
echo -e "${RED}EXECUTING MIGRATION...${RESET}"
echo ""

migrated=0
failed=0

for entry in "${ANASTASIA_RECORDS[@]}"; do
  domain=$(echo "$entry" | cut -d'|' -f1)
  zone_id=$(echo "$entry" | cut -d'|' -f2)
  rec_id=$(echo "$entry" | cut -d'|' -f3)
  rec_type=$(echo "$entry" | cut -d'|' -f4)
  rec_name=$(echo "$entry" | cut -d'|' -f5)

  sub="${rec_name%%.$domain}"
  case "$sub" in
    portal|services|squad|roadcode-squad|git|code|roadcode|cloud|roundtrip|ollama*)
      new_type="CNAME"
      new_content="$TUNNEL_OCTAVIA.cfargotunnel.com"
      ;;
    chat|auth|dispatch|headscale|qdrant|stats-proxy|pi)
      new_type="CNAME"
      new_content="$TUNNEL_ALICE.cfargotunnel.com"
      ;;
    api-lucidia|monitor-lucidia|prism|lucidia)
      new_type="CNAME"
      new_content="$TUNNEL_LUCIDIA.cfargotunnel.com"
      ;;
    *)
      new_type="A"
      new_content="$GEMATRIA"
      ;;
  esac

  # Update the record
  result=$(cf_api PUT "/zones/$zone_id/dns_records/$rec_id" "{
    \"type\": \"$new_type\",
    \"name\": \"$rec_name\",
    \"content\": \"$new_content\",
    \"proxied\": true,
    \"ttl\": 1
  }")

  success=$(echo "$result" | python3 -c "import json,sys; print(json.load(sys.stdin).get('success',False))" 2>/dev/null)

  if [ "$success" = "True" ]; then
    echo -e "  ${GREEN}✓${RESET} $rec_name → $new_content"
    migrated=$((migrated + 1))
  else
    error=$(echo "$result" | python3 -c "import json,sys; errs=json.load(sys.stdin).get('errors',[]); print(errs[0].get('message','unknown') if errs else 'unknown')" 2>/dev/null)
    echo -e "  ${RED}✗${RESET} $rec_name — $error"
    failed=$((failed + 1))
  fi
done

echo ""
echo -e "${PINK}════════════════════════════════════════════════════════════${RESET}"
echo -e "  ${GREEN}Migrated:${RESET} $migrated"
echo -e "  ${RED}Failed:${RESET}   $failed"
echo -e "${PINK}════════════════════════════════════════════════════════════${RESET}"
