#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# Activate public DNS for BlackRoad services

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}╔═══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║   🌐 Public DNS Activation - Wave 6                    ║${RESET}"
echo -e "${PINK}╚═══════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Step 1: Check if cloudflared tunnel is running
echo -e "${BLUE}🔍 Checking Cloudflare tunnel status...${RESET}"
echo ""

TUNNEL_RUNNING=$(ssh octavia "systemctl is-active cloudflared 2>/dev/null" || echo "unknown")
if [ "$TUNNEL_RUNNING" = "active" ]; then
    echo -e "${GREEN}✅ Cloudflared is running${RESET}"
else
    echo -e "${AMBER}⚠️  Cloudflared not running as system service${RESET}"
fi
echo ""

# Step 2: Get tunnel configuration
echo -e "${BLUE}📋 Getting tunnel configuration...${RESET}"
echo ""

TUNNEL_CONFIG=$(ssh octavia "cat ~/.cloudflared/config.yml 2>/dev/null || echo 'not found'")

if [ "$TUNNEL_CONFIG" = "not found" ]; then
    echo -e "${AMBER}⚠️  No user tunnel config found${RESET}"
    echo "Checking system config..."
    echo ""
else
    echo "Found user tunnel config:"
    echo "$TUNNEL_CONFIG" | head -10
    echo ""
fi

# Step 3: Update tunnel config to point to load balancer
echo -e "${BLUE}🔧 Updating tunnel config to use load balancer...${RESET}"

cat > /tmp/tunnel-config-updated.yml << 'EOF'
# BlackRoad Cloudflare Tunnel Configuration
# Updated to route through load balancer

ingress:
  # TTS API via load balancer (with automatic failover)
  - hostname: tts.blackroad.io
    service: http://localhost:5100/tts
    originRequest:
      noTLSVerify: true
  
  # Monitoring API via load balancer (with automatic failover)
  - hostname: monitor.blackroad.io
    service: http://localhost:5100/monitor
    originRequest:
      noTLSVerify: true
  
  # Fleet monitoring dashboard
  - hostname: fleet.blackroad.io
    service: http://localhost:5200
    originRequest:
      noTLSVerify: true
  
  # Website (nginx)
  - hostname: www.blackroad.io
    service: http://localhost:80
    originRequest:
      noTLSVerify: true
  
  # Main domain (redirect to www)
  - hostname: blackroad.io
    service: http://localhost:80
    originRequest:
      noTLSVerify: true
  
  # Catch-all
  - service: http_status:404
EOF

scp /tmp/tunnel-config-updated.yml octavia:~/.cloudflared/config.yml

echo -e "${GREEN}✅ Tunnel config updated${RESET}"
echo ""

# Step 4: Test load balancer locally
echo -e "${BLUE}🧪 Testing load balancer endpoints...${RESET}"
echo ""

echo "Load Balancer Status:"
ssh octavia "curl -s http://localhost:5100/health | python3 -m json.tool 2>/dev/null || echo 'Load balancer not responding'"

echo ""
echo "TTS via Load Balancer:"
ssh octavia "curl -s http://localhost:5100/tts/health 2>&1 | head -3"

echo ""
echo "Monitor via Load Balancer:"
ssh octavia "curl -s http://localhost:5100/monitor/health 2>&1 | head -3"

echo ""
echo "Fleet Monitor:"
ssh octavia "curl -s http://localhost:5200/health 2>&1 | head -3"

echo ""

# Step 5: Create DNS automation script
echo -e "${BLUE}📝 Creating DNS automation script...${RESET}"

cat > ~/activate-cloudflare-dns.sh << 'DNS_SCRIPT'
#!/bin/bash
# Automated Cloudflare DNS record creation
# Usage: Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID then run

ZONE_ID="${CLOUDFLARE_ZONE_ID}"
API_TOKEN="${CLOUDFLARE_API_TOKEN}"
DOMAIN="blackroad.io"

if [ -z "$ZONE_ID" ] || [ -z "$API_TOKEN" ]; then
    echo "❌ Error: Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID environment variables"
    echo ""
    echo "Get them from:"
    echo "  API Token: https://dash.cloudflare.com/profile/api-tokens"
    echo "  Zone ID: https://dash.cloudflare.com → Select domain → Copy Zone ID"
    echo ""
    exit 1
fi

# Get tunnel ID from octavia
TUNNEL_ID=$(ssh octavia "grep 'tunnel:' ~/.cloudflared/config.yml 2>/dev/null | awk '{print \$2}'" 2>/dev/null || echo "")

if [ -z "$TUNNEL_ID" ]; then
    echo "⚠️  Warning: Could not auto-detect tunnel ID"
    echo "You'll need to add it manually"
    TUNNEL_TARGET="YOUR_TUNNEL_ID.cfargotunnel.com"
else
    TUNNEL_TARGET="${TUNNEL_ID}.cfargotunnel.com"
fi

echo "Creating DNS records for $DOMAIN..."
echo "Tunnel target: $TUNNEL_TARGET"
echo ""

# DNS records to create
declare -A RECORDS=(
    ["tts"]="TTS API with load balancing"
    ["monitor"]="Monitoring API with load balancing"
    ["fleet"]="Fleet monitoring dashboard"
    ["www"]="Main website"
)

for subdomain in "${!RECORDS[@]}"; do
    description="${RECORDS[$subdomain]}"
    
    echo "Creating: $subdomain.$DOMAIN ($description)"
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"CNAME\",
            \"name\": \"$subdomain\",
            \"content\": \"$TUNNEL_TARGET\",
            \"ttl\": 1,
            \"proxied\": true,
            \"comment\": \"BlackRoad - $description\"
        }" | jq -r 'if .success then "  ✅ Success" else "  ❌ Error: \(.errors[0].message)" end'
    
    echo ""
done

echo "✅ DNS records created!"
echo ""
echo "Services will be available at:"
echo "  https://tts.blackroad.io"
echo "  https://monitor.blackroad.io"
echo "  https://fleet.blackroad.io"
echo "  https://www.blackroad.io"
echo ""
echo "Note: DNS propagation may take 1-5 minutes"
DNS_SCRIPT

chmod +x ~/activate-cloudflare-dns.sh

echo -e "${GREEN}✅ Created ~/activate-cloudflare-dns.sh${RESET}"
echo ""

# Step 6: Create manual instructions
cat > ~/PUBLIC_DNS_ACTIVATION_GUIDE.md << 'GUIDE'
# Public DNS Activation Guide

## Quick Start (Automated)

### Prerequisites
1. Cloudflare API Token with DNS Edit permission
2. Zone ID for blackroad.io domain

### Get Credentials

**API Token**:
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit zone DNS" template
4. Select "blackroad.io" zone
5. Copy the token

**Zone ID**:
1. Go to https://dash.cloudflare.com
2. Select blackroad.io domain
3. Scroll down to "API" section in right sidebar
4. Copy "Zone ID"

### Run Automated Script

```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
~/activate-cloudflare-dns.sh
```

This will create all DNS records automatically.

---

## Manual Setup (Dashboard)

### Step 1: Get Tunnel ID

```bash
ssh octavia "grep 'tunnel:' ~/.cloudflared/config.yml | awk '{print \$2}'"
```

### Step 2: Add DNS Records

Go to https://dash.cloudflare.com → blackroad.io → DNS → Records

Add these CNAME records:

| Name | Target | Proxy | Description |
|------|--------|-------|-------------|
| tts | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | TTS API (load balanced) |
| monitor | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Monitoring API (load balanced) |
| fleet | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Fleet dashboard |
| www | `<tunnel-id>.cfargotunnel.com` | ✅ Proxied | Main website |

Replace `<tunnel-id>` with the ID from Step 1.

### Step 3: Restart Tunnel (if needed)

```bash
ssh octavia "sudo systemctl restart cloudflared"
```

Or for user service:
```bash
ssh octavia "systemctl --user restart cloudflared"
```

---

## Testing

Wait 2-5 minutes for DNS propagation, then test:

```bash
# Test TTS API
curl -s https://tts.blackroad.io/health | jq

# Test Monitoring API
curl -s https://monitor.blackroad.io/health | jq

# Test Fleet Dashboard
curl -s https://fleet.blackroad.io/health | jq

# Test Website
curl -s https://www.blackroad.io
```

---

## Architecture

```
Internet
    ↓
Cloudflare Edge (SSL/TLS)
    ↓
Cloudflare Tunnel
    ↓
Octavia Load Balancer (5100)
    ↓
    ├─→ Octavia Services (primary)
    └─→ Cecilia Services (backup failover)
```

All traffic benefits from:
- ✅ Automatic SSL/TLS via Cloudflare
- ✅ DDoS protection
- ✅ Load balancing with failover
- ✅ CDN caching
- ✅ WAF protection

---

## Troubleshooting

### DNS not resolving
- Wait 5 minutes for propagation
- Check DNS: `dig tts.blackroad.io`
- Verify Cloudflare proxy is enabled (orange cloud)

### Tunnel not connecting
```bash
ssh octavia "systemctl status cloudflared"
ssh octavia "journalctl -u cloudflared -n 50"
```

### 502 Bad Gateway
- Check local services: `ssh octavia "curl http://localhost:5100/health"`
- Verify load balancer running
- Check backend services

### SSL errors
- Cloudflare automatically provides SSL
- Ensure "Proxied" is enabled (orange cloud)
- Check SSL/TLS mode in Cloudflare dashboard (should be "Full" or "Flexible")
GUIDE

echo -e "${GREEN}✅ Created ~/PUBLIC_DNS_ACTIVATION_GUIDE.md${RESET}"
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║   ✅ Public DNS Activation Ready!                      ║${RESET}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${RESET}"
echo ""
echo "Next steps:"
echo ""
echo "1. Read the guide:"
echo "   cat ~/PUBLIC_DNS_ACTIVATION_GUIDE.md"
echo ""
echo "2. Automated setup:"
echo "   export CLOUDFLARE_API_TOKEN='your_token'"
echo "   export CLOUDFLARE_ZONE_ID='your_zone_id'"
echo "   ~/activate-cloudflare-dns.sh"
echo ""
echo "3. Or manually add DNS records in Cloudflare dashboard"
echo ""
echo "Services will be available at:"
echo "  https://tts.blackroad.io      (API with failover)"
echo "  https://monitor.blackroad.io  (Monitoring with failover)"
echo "  https://fleet.blackroad.io    (Fleet dashboard)"
echo "  https://www.blackroad.io      (Website)"
echo ""
