#!/usr/bin/env bash
# BlackRoad OS - Railway DNS Configuration
# Configures Cloudflare DNS for all Railway services
# Author: Cece (via Claude Code)
# Date: 2025-12-14

set -e

echo "🌐 BlackRoad OS - Railway DNS Configuration"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Load service mapping
if [ ! -f "/tmp/railway-service-mapping.json" ]; then
    echo -e "${RED}Error: Service mapping not found${NC}"
    echo "Run: ./scripts/setup-railway-infrastructure.sh first"
    exit 1
fi

echo -e "${BLUE}This script will generate Cloudflare DNS records for all Railway services${NC}"
echo ""
echo -e "${YELLOW}You'll need to get the Railway URLs first:${NC}"
echo "  1. Go to https://railway.app"
echo "  2. For each service, copy the generated Railway URL"
echo "  3. Or run: railway domain"
echo ""

read -p "Continue? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Railway Service URLs${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

declare -A RAILWAY_URLS

# Prompt for Railway URLs
services=("api-gateway" "agent-platform" "app-backend" "admin-tools" "ecommerce" "quantum-services" "docs-services" "ai-services" "network-infra" "lucidia-platform")

for service in "${services[@]}"; do
    echo -e "${CYAN}Enter Railway URL for ${service}:${NC}"
    echo -e "${YELLOW}(Format: xyz123.up.railway.app or leave empty to skip)${NC}"
    read -p "URL: " url

    if [ -n "$url" ]; then
        # Clean URL (remove https:// if present)
        url=$(echo "$url" | sed 's|https://||' | sed 's|http://||')
        RAILWAY_URLS["$service"]="$url"
        echo -e "${GREEN}✓ Saved${NC}"
    else
        echo -e "${YELLOW}⊘ Skipped${NC}"
    fi
    echo ""
done

echo ""
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}Generating Cloudflare DNS Records${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Generate DNS records script
cat > /tmp/cloudflare-dns-commands.sh << 'HEADER'
#!/usr/bin/env bash
# Auto-generated Cloudflare DNS configuration
# Generated: 2025-12-14
#
# IMPORTANT: Set your Cloudflare API token and Zone IDs before running
#
# export CF_API_TOKEN="your-cloudflare-api-token"
# export ZONE_BLACKROAD_IO="zone-id-for-blackroad.io"
# export ZONE_BLACKROAD_SYSTEMS="zone-id-for-blackroad.systems"
# etc...

set -e

HEADER

echo '
# Cloudflare API endpoint
CF_API="https://api.cloudflare.com/client/v4"

# Function to create DNS record
create_dns_record() {
    local zone_id=$1
    local name=$2
    local target=$3

    echo "Creating CNAME: $name → $target"

    curl -X POST "$CF_API/zones/$zone_id/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"CNAME\",
            \"name\": \"$name\",
            \"content\": \"$target\",
            \"ttl\": 1,
            \"proxied\": true
        }" | jq .

    echo ""
}

echo "🌐 Creating Cloudflare DNS Records for Railway Services"
echo "========================================================"
echo ""
' >> /tmp/cloudflare-dns-commands.sh

# Generate DNS records for each service
echo -e "${BLUE}Generating DNS configuration...${NC}"
echo ""

# API Gateway
if [ -n "${RAILWAY_URLS[api-gateway]}" ]; then
    echo -e "${CYAN}API Gateway → ${RAILWAY_URLS[api-gateway]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ API Gateway ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "api" "${RAILWAY_URLS[api-gateway]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "api" "${RAILWAY_URLS[api-gateway]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "api" "${RAILWAY_URLS[api-gateway]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_COM" "api" "${RAILWAY_URLS[api-gateway]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "api" "${RAILWAY_URLS[api-gateway]}"

EOF
fi

# Agent Platform
if [ -n "${RAILWAY_URLS[agent-platform]}" ]; then
    echo -e "${CYAN}Agent Platform → ${RAILWAY_URLS[agent-platform]}${NC}"
    agents=("claude" "lucidia" "silas" "elias" "cadillac" "athena" "codex" "persephone" "anastasia" "ophelia" "sidian" "cordelia" "octavia" "cecilia" "copilot" "chatgpt")

    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Agent Platform (16 agents) ━━━"
EOF

    for agent in "${agents[@]}"; do
        cat >> /tmp/cloudflare-dns-commands.sh << EOF
create_dns_record "\$ZONE_BLACKROAD_IO" "$agent" "${RAILWAY_URLS[agent-platform]}"
EOF
    done

    echo "" >> /tmp/cloudflare-dns-commands.sh
fi

# App Backend
if [ -n "${RAILWAY_URLS[app-backend]}" ]; then
    echo -e "${CYAN}App Backend → ${RAILWAY_URLS[app-backend]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ App Backend ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "app" "${RAILWAY_URLS[app-backend]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "prism" "${RAILWAY_URLS[app-backend]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "console" "${RAILWAY_URLS[app-backend]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "app" "${RAILWAY_URLS[app-backend]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "dashboard" "${RAILWAY_URLS[app-backend]}"

EOF
fi

# Admin Tools
if [ -n "${RAILWAY_URLS[admin-tools]}" ]; then
    echo -e "${CYAN}Admin Tools → ${RAILWAY_URLS[admin-tools]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Admin & Monitoring ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "admin" "${RAILWAY_URLS[admin-tools]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "metrics" "${RAILWAY_URLS[admin-tools]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "logs" "${RAILWAY_URLS[admin-tools]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "status" "${RAILWAY_URLS[admin-tools]}"

EOF
fi

# E-commerce
if [ -n "${RAILWAY_URLS[ecommerce]}" ]; then
    echo -e "${CYAN}E-commerce → ${RAILWAY_URLS[ecommerce]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ E-commerce ━━━"
create_dns_record "\$ZONE_BLACKROADQUANTUM_SHOP" "cart" "${RAILWAY_URLS[ecommerce]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_SHOP" "checkout" "${RAILWAY_URLS[ecommerce]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_SHOP" "account" "${RAILWAY_URLS[ecommerce]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_STORE" "products" "${RAILWAY_URLS[ecommerce]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_STORE" "orders" "${RAILWAY_URLS[ecommerce]}"

EOF
fi

# Quantum Services
if [ -n "${RAILWAY_URLS[quantum-services]}" ]; then
    echo -e "${CYAN}Quantum Services → ${RAILWAY_URLS[quantum-services]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Quantum Services ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "quantum" "${RAILWAY_URLS[quantum-services]}"
create_dns_record "\$ZONE_BLACKROADQI_COM" "quantum" "${RAILWAY_URLS[quantum-services]}"
create_dns_record "\$ZONE_BLACKROADQI_COM" "lab" "${RAILWAY_URLS[quantum-services]}"
create_dns_record "\$ZONE_BLACKROADQI_COM" "simulator" "${RAILWAY_URLS[quantum-services]}"
create_dns_record "\$ZONE_BLACKROADQI_COM" "circuits" "${RAILWAY_URLS[quantum-services]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_COM" "lab" "${RAILWAY_URLS[quantum-services]}"

EOF
fi

# Documentation
if [ -n "${RAILWAY_URLS[docs-services]}" ]; then
    echo -e "${CYAN}Documentation → ${RAILWAY_URLS[docs-services]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Documentation Services ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "docs" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "docs" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "wiki" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "kb" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "guides" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROAD_SYSTEMS" "sdk" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_COM" "docs" "${RAILWAY_URLS[docs-services]}"
create_dns_record "\$ZONE_BLACKROADQUANTUM_COM" "sdk" "${RAILWAY_URLS[docs-services]}"

EOF
fi

# AI Services
if [ -n "${RAILWAY_URLS[ai-services]}" ]; then
    echo -e "${CYAN}AI Services → ${RAILWAY_URLS[ai-services]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ AI Services ━━━"
create_dns_record "\$ZONE_BLACKROAD_IO" "chat" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "chat" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "inference" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "models" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "training" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_BLACKROADAI_COM" "playground" "${RAILWAY_URLS[ai-services]}"
create_dns_record "\$ZONE_ALICEQI_COM" "chat" "${RAILWAY_URLS[ai-services]}"

EOF
fi

# Network Infrastructure
if [ -n "${RAILWAY_URLS[network-infra]}" ]; then
    echo -e "${CYAN}Network Infrastructure → ${RAILWAY_URLS[network-infra]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Network Infrastructure ━━━"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "edge" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "mesh" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "p2p" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "relay" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "tunnel" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "vpn" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "proxy" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_NETWORK" "cdn" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "cdn" "${RAILWAY_URLS[network-infra]}"
create_dns_record "\$ZONE_BLACKROAD_IO" "assets" "${RAILWAY_URLS[network-infra]}"

EOF
fi

# Lucidia Platform
if [ -n "${RAILWAY_URLS[lucidia-platform]}" ]; then
    echo -e "${CYAN}Lucidia Platform → ${RAILWAY_URLS[lucidia-platform]}${NC}"
    cat >> /tmp/cloudflare-dns-commands.sh << EOF

echo "━━━ Lucidia Platform ━━━"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "breath" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "sync" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "agents" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "console" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_EARTH" "dashboard" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_STUDIO" "create" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_STUDIO" "gallery" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_STUDIO" "collaborate" "${RAILWAY_URLS[lucidia-platform]}"
create_dns_record "\$ZONE_LUCIDIA_STUDIO" "export" "${RAILWAY_URLS[lucidia-platform]}"

EOF
fi

cat >> /tmp/cloudflare-dns-commands.sh << 'FOOTER'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DNS configuration complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Wait 5-10 minutes for DNS propagation, then test:"
echo "  curl -I https://api.blackroad.io"
echo ""
FOOTER

chmod +x /tmp/cloudflare-dns-commands.sh

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}DNS Configuration Script Generated! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Script location:${NC} /tmp/cloudflare-dns-commands.sh"
echo ""
echo -e "${YELLOW}Before running:${NC}"
echo "1. Get your Cloudflare API token from: https://dash.cloudflare.com/profile/api-tokens"
echo "2. Get Zone IDs for each domain from Cloudflare dashboard"
echo "3. Set environment variables:"
echo ""
echo "   export CF_API_TOKEN='your-api-token'"
echo "   export ZONE_BLACKROAD_IO='zone-id-1'"
echo "   export ZONE_BLACKROAD_SYSTEMS='zone-id-2'"
echo "   # ... etc for all domains"
echo ""
echo -e "${YELLOW}Then run:${NC}"
echo "   bash /tmp/cloudflare-dns-commands.sh"
echo ""
