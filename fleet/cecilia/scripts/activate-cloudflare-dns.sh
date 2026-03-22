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
