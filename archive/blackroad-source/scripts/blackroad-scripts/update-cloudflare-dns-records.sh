#!/bin/bash
# Update Cloudflare DNS Records for BlackRoad
# Adds api subdomain, wildcard, and service CNAMEs
# Uses Cloudflare API directly

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🖤 CLOUDFLARE DNS UPDATE - BLACKROAD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
CODEX_IP="159.65.43.12"
ZONE_NAME="blackroad.io"
CF_ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"

# Read API token from file
if [ -f ~/.cloudflare_dns_token ]; then
    CF_API_TOKEN=$(cat ~/.cloudflare_dns_token)
else
    echo "❌ Cloudflare API token not found at ~/.cloudflare_dns_token"
    echo "Please save your API token there first"
    exit 1
fi

echo "📋 DNS Records to Add:"
echo "  1. api.blackroad.io → $CODEX_IP (A record)"
echo "  2. *.blackroad.io → $CODEX_IP (Wildcard A record)"
echo "  3. services.blackroad.io → api.blackroad.io (CNAME)"
echo ""

# Get zone ID using Cloudflare API
echo "🔍 Getting zone ID for $ZONE_NAME..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" | \
    jq -r '.result[0].id')

if [ -z "$ZONE_ID" ] || [ "$ZONE_ID" = "null" ]; then
    echo "❌ Could not get zone ID for $ZONE_NAME"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Creating DNS Records"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Add api.blackroad.io A record
echo "1️⃣  Adding api.blackroad.io → $CODEX_IP"
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"api\",\"content\":\"$CODEX_IP\",\"ttl\":1,\"proxied\":false}")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ api.blackroad.io created successfully"
else
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "⚠️  $ERROR_MSG"
fi
echo ""

# 2. Add wildcard *.blackroad.io A record
echo "2️⃣  Adding *.blackroad.io → $CODEX_IP (wildcard)"
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"*\",\"content\":\"$CODEX_IP\",\"ttl\":1,\"proxied\":false}")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ *.blackroad.io wildcard created successfully"
else
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "⚠️  $ERROR_MSG"
fi
echo ""

# 3. Add services.blackroad.io CNAME
echo "3️⃣  Adding services.blackroad.io → api.blackroad.io (CNAME)"
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"CNAME\",\"name\":\"services\",\"content\":\"api.blackroad.io\",\"ttl\":1,\"proxied\":false}")

if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
    echo "✅ services.blackroad.io CNAME created successfully"
else
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // "Unknown error"')
    echo "⚠️  $ERROR_MSG"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Fetching current DNS records for $ZONE_NAME..."
echo ""

# List DNS records
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=api.blackroad.io" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[] | "  • \(.name) (\(.type)) → \(.content)"'

curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=services.blackroad.io" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" | jq -r '.result[] | "  • \(.name) (\(.type)) → \(.content)"'

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DNS Update Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your new DNS records:"
echo "  • https://api.blackroad.io"
echo "  • https://services.blackroad.io"
echo "  • https://any-subdomain.blackroad.io (wildcard)"
echo ""
echo "⏱️  DNS propagation may take 1-5 minutes"
echo ""
echo "🧪 Test with:"
echo "  dig api.blackroad.io"
echo "  curl -I https://api.blackroad.io"
echo ""
