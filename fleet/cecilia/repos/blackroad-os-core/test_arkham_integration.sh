#!/bin/bash
# Test Arkham Intelligence Integration with RoadChain API

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Testing Arkham Intelligence Integration with RoadChain      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if API key is set
if [[ -z "${ARKHAM_API_KEY:-}" ]] || [[ "$ARKHAM_API_KEY" == "your-api-key-here" ]]; then
    echo "❌ ARKHAM_API_KEY not set"
    echo ""
    echo "To set it:"
    echo "  export ARKHAM_API_KEY='your-key-here'"
    echo ""
    echo "To get an API key:"
    echo "  → Visit: https://platform.arkm.com/settings/api"
    echo ""
    exit 1
fi

echo "✅ ARKHAM_API_KEY is set (${#ARKHAM_API_KEY} characters)"
echo ""

# Check if RoadChain API is running
API_URL="${ROADCHAIN_API_URL:-http://localhost:3000}"
echo "Checking RoadChain API at: $API_URL"
echo ""

if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ RoadChain API not running at $API_URL"
    echo ""
    echo "To start it:"
    echo "  cd roadchain-api"
    echo "  export ARKHAM_API_KEY='$ARKHAM_API_KEY'"
    echo "  pnpm dev"
    echo ""
    exit 1
fi

echo "✅ RoadChain API is healthy"
echo ""

# Test endpoints
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Arkham Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Entity lookup
echo "1️⃣  Testing entity lookup: alexamundson77"
ENTITY_RESPONSE=$(curl -s "$API_URL/api/arkham/entity/alexamundson77")
echo "$ENTITY_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30 || echo "$ENTITY_RESPONSE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: Address intelligence (Binance hot wallet)
BINANCE_ADDRESS="0x28C6c06298d514Db089934071355E5743bf21d60"
echo "2️⃣  Testing address intelligence: $BINANCE_ADDRESS (Binance)"
ADDRESS_RESPONSE=$(curl -s "$API_URL/api/arkham/address/$BINANCE_ADDRESS")
echo "$ADDRESS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30 || echo "$ADDRESS_RESPONSE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Labels
echo "3️⃣  Testing labels: $BINANCE_ADDRESS"
LABELS_RESPONSE=$(curl -s "$API_URL/api/arkham/labels/$BINANCE_ADDRESS")
echo "$LABELS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LABELS_RESPONSE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 4: Wallet analytics
echo "4️⃣  Testing wallet analytics: $BINANCE_ADDRESS"
ANALYTICS_RESPONSE=$(curl -s "$API_URL/api/arkham/analytics/$BINANCE_ADDRESS")
echo "$ANALYTICS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -40 || echo "$ANALYTICS_RESPONSE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Search
echo "5️⃣  Testing search: 'vitalik'"
SEARCH_RESPONSE=$(curl -s "$API_URL/api/arkham/search?q=vitalik")
echo "$SEARCH_RESPONSE" | python3 -m json.tool 2>/dev/null | head -30 || echo "$SEARCH_RESPONSE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Available Endpoints:"
echo "  → $API_URL/api/arkham/entity/:nameOrUsername"
echo "  → $API_URL/api/arkham/address/:address"
echo "  → $API_URL/api/arkham/portfolio/:address"
echo "  → $API_URL/api/arkham/transfers/:address"
echo "  → $API_URL/api/arkham/labels/:address"
echo "  → $API_URL/api/arkham/search?q=query"
echo "  → $API_URL/api/arkham/enrich/:address"
echo "  → $API_URL/api/arkham/analytics/:address"
echo ""
echo "📚 Full documentation: /Users/alexa/blackroad-sandbox/ARKHAM_INTEGRATION_README.md"
echo ""
