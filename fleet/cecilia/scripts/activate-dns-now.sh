#!/bin/bash
# Activate DNS for BlackRoad public launch
# Wave 9D: Go Public!

set -e

echo "🌐 BlackRoad DNS Activation - Going Public!"
echo ""

# Check if we have Cloudflare credentials
if [ -f ~/.cloudflare-api.env ]; then
    echo "✅ Found Cloudflare API credentials"
    source ~/.cloudflare-api.env
    
    if [ -n "$CF_API_TOKEN" ] && [ -n "$CF_ZONE_ID" ]; then
        echo "✅ API token and Zone ID configured"
        echo ""
        echo "🚀 Activating DNS via Cloudflare API..."
        echo ""
        
        # Get tunnel ID from config
        TUNNEL_ID=$(ssh octavia "grep 'tunnel:' /etc/cloudflared/config.yml | awk '{print \$2}'")
        echo "📡 Tunnel ID: $TUNNEL_ID"
        echo ""
        
        # DNS records to create
        declare -A RECORDS=(
            ["www"]="Nginx website (port 80)"
            ["tts"]="TTS API via load balancer"
            ["monitor"]="Monitor API via load balancer"
            ["fleet"]="Fleet monitoring dashboard"
            ["analytics"]="Analytics dashboard"
            ["grafana"]="Grafana dashboard"
        )
        
        echo "📝 Creating DNS records..."
        for subdomain in "${!RECORDS[@]}"; do
            description="${RECORDS[$subdomain]}"
            echo "  • $subdomain.blackroad.io - $description"
            
            # Create CNAME record pointing to tunnel
            curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
                -H "Authorization: Bearer $CF_API_TOKEN" \
                -H "Content-Type: application/json" \
                --data "{\"type\":\"CNAME\",\"name\":\"$subdomain\",\"content\":\"$TUNNEL_ID.cfargotunnel.com\",\"ttl\":1,\"proxied\":true}" \
                > /dev/null
        done
        
        echo ""
        echo "✅ DNS records created!"
        echo ""
        echo "⏳ DNS propagation in progress..."
        echo "   (typically 1-2 minutes)"
        echo ""
        
    else
        echo "⚠️  Missing CF_API_TOKEN or CF_ZONE_ID"
        echo ""
        echo "Set these in ~/.cloudflare-api.env:"
        echo "  export CF_API_TOKEN='your-token'"
        echo "  export CF_ZONE_ID='your-zone-id'"
        echo ""
        exit 1
    fi
else
    echo "📋 Manual DNS Activation Required"
    echo ""
    echo "Go to Cloudflare Dashboard:"
    echo "  https://dash.cloudflare.com"
    echo ""
    echo "Add these CNAME records for blackroad.io:"
    echo ""
    echo "┌─────────────┬──────────────────────────────────────┬─────────┐"
    echo "│ Name        │ Content                              │ Proxied │"
    echo "├─────────────┼──────────────────────────────────────┼─────────┤"
    echo "│ www         │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "│ tts         │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "│ monitor     │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "│ fleet       │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "│ analytics   │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "│ grafana     │ <tunnel-id>.cfargotunnel.com         │ Yes     │"
    echo "└─────────────┴──────────────────────────────────────┴─────────┘"
    echo ""
    
    # Get tunnel ID
    TUNNEL_ID=$(ssh octavia "grep 'tunnel:' /etc/cloudflared/config.yml | awk '{print \$2}'" 2>/dev/null || echo "TUNNEL_ID_HERE")
    echo "Your Tunnel ID: $TUNNEL_ID"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 BLACKROAD IS GOING LIVE!"
echo ""
echo "Once DNS propagates, access at:"
echo ""
echo "  🌐 https://www.blackroad.io          - Main website"
echo "  🎤 https://tts.blackroad.io          - TTS API"
echo "  📊 https://monitor.blackroad.io      - System monitor"
echo "  🚢 https://fleet.blackroad.io        - Fleet dashboard"
echo "  📈 https://analytics.blackroad.io    - Analytics"
echo "  🎨 https://grafana.blackroad.io      - Grafana UI"
echo ""
echo "All URLs automatically get:"
echo "  ✅ HTTPS/SSL (Cloudflare Universal SSL)"
echo "  ✅ DDoS protection"
echo "  ✅ CDN caching"
echo "  ✅ WAF security"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test when ready:"
echo "  curl -I https://www.blackroad.io"
echo ""
