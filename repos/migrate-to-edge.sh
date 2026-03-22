#!/bin/bash
# BlackRoad Edge Migration — move everything off Cloudflare to our own metal
# Gematria (159.65.43.12) serves all domains via Caddy + Let's Encrypt
# Traffic routes through WireGuard to Pi fleet
#
# Usage:
#   migrate-to-edge.sh sync-sites     — rsync static sites to Gematria
#   migrate-to-edge.sh deploy-caddy   — push Caddyfile and reload
#   migrate-to-edge.sh flip-dns       — point DNS A records to Gematria
#   migrate-to-edge.sh all            — do everything
#   migrate-to-edge.sh status         — check what's live

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
CYAN='\033[38;5;69m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

GEMATRIA_HOST="gematria"  # uses ~/.ssh/config (proxied through Anastasia)
GEMATRIA_IP="159.65.43.12"
CF_TOKEN=$(cat ~/.cloudflare_dns_token 2>/dev/null)
ZONE_ID="d6566eba4500b460ffec6650d3b4baf6"
OPERATOR="$HOME/blackroad-operator"
EDGE_DIR="$HOME/blackroad-edge"

echo -e "${PINK}BlackRoad Edge Migration${NC}"
echo -e "${DIM}Cloudflare → Our Metal${NC}"
echo ""

# Map of subdomain → source directory (from monorepo)
declare -A SITE_MAP
for dir in "$OPERATOR/orgs/core/"*-blackroadio; do
    name=$(basename "$dir" | sed 's/-blackroadio$//')
    if [ -f "$dir/public/index.html" ]; then
        SITE_MAP["$name"]="$dir/public"
    elif [ -f "$dir/index.html" ]; then
        SITE_MAP["$name"]="$dir"
    fi
done

# Also map the main site
SITE_MAP["blackroad.io"]="$OPERATOR/orgs/core/blackroad-web/dist"
if [ ! -d "${SITE_MAP[blackroad.io]}" ]; then
    # fallback to public
    SITE_MAP["blackroad.io"]="$OPERATOR/orgs/core/blackroad-web/public"
fi

sync_sites() {
    echo -e "${CYAN}Syncing ${#SITE_MAP[@]} static sites to Gematria...${NC}"

    # Create directories first
    ssh "$GEMATRIA_HOST" "mkdir -p /var/www/blackroad.io" 2>/dev/null

    local synced=0
    local failed=0

    for sub in $(echo "${!SITE_MAP[@]}" | tr ' ' '\n' | sort); do
        src="${SITE_MAP[$sub]}"
        if [ "$sub" = "blackroad.io" ]; then
            dest="/var/www/blackroad.io/"
        else
            dest="/var/www/$sub/"
        fi

        ssh "$GEMATRIA_HOST" "mkdir -p $dest" 2>/dev/null

        if rsync -az --delete "$src/" "$GEMATRIA_HOST:$dest" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $sub → $dest"
            synced=$((synced + 1))
        else
            echo -e "  ${RED}✗${NC} $sub — rsync failed"
            failed=$((failed + 1))
        fi
    done

    # Also sync the cloud.blackroad.io site we just built
    if [ -d "$HOME/cloud-blackroad/public" ]; then
        ssh "$GEMATRIA_HOST" "mkdir -p /var/www/cloud/" 2>/dev/null
        rsync -az "$HOME/cloud-blackroad/public/" "$GEMATRIA_HOST:/var/www/cloud/" 2>/dev/null && \
            echo -e "  ${GREEN}✓${NC} cloud → /var/www/cloud/" || \
            echo -e "  ${RED}✗${NC} cloud — rsync failed"
    fi

    echo ""
    echo -e "${GREEN}Synced: $synced${NC} | ${RED}Failed: $failed${NC}"
}

deploy_caddy() {
    echo -e "${CYAN}Deploying Caddyfile to Gematria...${NC}"

    # Backup existing
    ssh "$GEMATRIA_HOST" "cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak.$(date +%s)" 2>/dev/null

    # Push new Caddyfile
    scp "$EDGE_DIR/Caddyfile" "$GEMATRIA_HOST:/etc/caddy/Caddyfile" 2>/dev/null

    # Validate
    echo -e "${DIM}Validating Caddy config...${NC}"
    if ssh "$GEMATRIA_HOST" "caddy validate --config /etc/caddy/Caddyfile" 2>&1; then
        echo -e "${GREEN}✓ Config valid${NC}"

        # Reload
        echo -e "${DIM}Reloading Caddy...${NC}"
        ssh "$GEMATRIA_HOST" "systemctl reload caddy" 2>/dev/null
        echo -e "${GREEN}✓ Caddy reloaded${NC}"
    else
        echo -e "${RED}✗ Config invalid — rolling back${NC}"
        ssh "$GEMATRIA_HOST" "cp /etc/caddy/Caddyfile.bak.* /etc/caddy/Caddyfile && systemctl reload caddy" 2>/dev/null
        return 1
    fi
}

flip_dns() {
    echo -e "${CYAN}Flipping DNS records to point to Gematria ($GEMATRIA_IP)...${NC}"
    echo -e "${AMBER}This will change ALL proxied CNAME records to A records pointing to our server.${NC}"
    echo ""

    if [ -z "$CF_TOKEN" ]; then
        echo -e "${RED}No Cloudflare token found at ~/.cloudflare_dns_token${NC}"
        return 1
    fi

    # Get all CNAME and AAAA records for blackroad.io zone
    local records
    records=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=200" \
        -H "Authorization: Bearer $CF_TOKEN" \
        -H "Content-Type: application/json")

    # Process each record
    local flipped=0
    local skipped=0

    echo "$records" | python3 -c "
import json, sys

data = json.load(sys.stdin)
records = data.get('result', [])
gematria_ip = '$GEMATRIA_IP'
zone_id = '$ZONE_ID'
token = '$CF_TOKEN'

# Skip these — they need special handling or should stay
skip = {
    'studio.blackroad.io',      # Vercel
    'services.blackroad.io',    # CNAME to api
    'ollama.gematria.blackroad.io',  # Already A record
    's3.blackroad.io',          # Already A record
    'test.blackroad.io',        # Already A record
    'websocket.blackroad.io',   # Already A record
}

# Records to update
to_update = []
for r in records:
    name = r['name']
    rtype = r['type']
    rid = r['id']

    # Skip non-address records
    if rtype not in ('CNAME', 'AAAA', 'A'):
        continue

    # Skip records not in blackroad.io (sub-sub domains of other zones)
    if name.count('.') > 2 and not name.endswith('.blackroad.io'):
        continue

    # Skip special records
    if name in skip:
        continue

    # Skip MX/TXT/CAA
    if rtype in ('MX', 'TXT', 'CAA'):
        continue

    # Already pointing to us
    if rtype == 'A' and r['content'] == gematria_ip:
        continue

    to_update.append({
        'id': rid,
        'name': name,
        'old_type': rtype,
        'old_content': r['content'],
        'proxied': r.get('proxied', False)
    })

# Output as JSON for the shell to process
print(json.dumps(to_update))
" > /tmp/dns_updates.json

    local count
    count=$(python3 -c "import json; d=json.load(open('/tmp/dns_updates.json')); print(len(d))")
    echo -e "${AMBER}$count records to update${NC}"
    echo ""

    # Actually flip them
    python3 -c "
import json, sys, urllib.request

updates = json.load(open('/tmp/dns_updates.json'))
token = '$CF_TOKEN'
zone_id = '$ZONE_ID'
gematria_ip = '$GEMATRIA_IP'

flipped = 0
failed = 0

for u in updates:
    rid = u['id']
    name = u['name']

    # Update to A record pointing to Gematria, DNS-only (no CF proxy)
    data = json.dumps({
        'type': 'A',
        'name': name,
        'content': gematria_ip,
        'proxied': False,
        'ttl': 300
    }).encode()

    req = urllib.request.Request(
        f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{rid}',
        data=data,
        method='PUT',
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    )

    try:
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        if result.get('success'):
            print(f'  ✓ {name}: {u[\"old_type\"]} {u[\"old_content\"][:40]} → A {gematria_ip}')
            flipped += 1
        else:
            print(f'  ✗ {name}: {result.get(\"errors\")}')
            failed += 1
    except Exception as e:
        print(f'  ✗ {name}: {e}')
        failed += 1

print(f'\nFlipped: {flipped} | Failed: {failed}')
"
}

check_status() {
    echo -e "${CYAN}Checking edge status...${NC}"
    echo ""

    # Check Gematria
    echo -e "${PINK}Gematria:${NC}"
    ssh "$GEMATRIA_HOST" "
        echo \"  Caddy: \$(systemctl is-active caddy)\"
        echo \"  Ollama: \$(systemctl is-active ollama)\"
        echo \"  NATS: \$(systemctl is-active nats)\"
        echo \"  WG: \$(wg show wg0 2>/dev/null | grep -c peer) peers\"
        echo \"  Sites: \$(ls /var/www/ | wc -l) directories\"
        echo \"  Disk: \$(df -h / | tail -1 | awk '{print \$3\"/\"\$2\" (\"\$5\")\"}')\"
        echo \"  Certs: \$(ls /var/lib/caddy/.local/share/caddy/certificates/ 2>/dev/null | wc -l) issuers\"
    " 2>/dev/null

    echo ""

    # Check a few key domains
    echo -e "${PINK}Domain checks:${NC}"
    for domain in blackroad.io git.blackroad.io ai.blackroad.io chat.blackroad.io cloud.blackroad.io; do
        ip=$(dig +short "$domain" 2>/dev/null | tail -1)
        code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "https://$domain" 2>/dev/null || echo "000")
        served_by=$(curl -s -I --max-time 5 "https://$domain" 2>/dev/null | grep -i "x-served-by" | cut -d: -f2- | tr -d ' ')

        if [ "$ip" = "$GEMATRIA_IP" ]; then
            echo -e "  ${GREEN}✓${NC} $domain → $ip (HTTP $code) ${DIM}$served_by${NC}"
        else
            echo -e "  ${AMBER}○${NC} $domain → $ip (not yet on edge)"
        fi
    done
}

case "${1:-status}" in
    sync-sites|sync)   sync_sites ;;
    deploy-caddy|caddy) deploy_caddy ;;
    flip-dns|dns)      flip_dns ;;
    status)            check_status ;;
    all)
        sync_sites
        echo ""
        deploy_caddy
        echo ""
        echo -e "${AMBER}DNS flip is separate — run: $0 flip-dns${NC}"
        echo -e "${AMBER}This is the point of no return. Make sure sites work first.${NC}"
        ;;
    *)
        echo "Usage: $0 {sync-sites|deploy-caddy|flip-dns|status|all}"
        ;;
esac
