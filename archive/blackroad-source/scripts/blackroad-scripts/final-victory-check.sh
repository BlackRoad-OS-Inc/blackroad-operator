#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              🏆 FINAL VICTORY CHECK 🏆                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

LIVE=0
DOWN=0
TOTAL=0

test_endpoint() {
    local name="$1"
    local url="$2"
    printf "%-50s " "$name"
    
    code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>&1)
    ((TOTAL++))
    
    if [[ "$code" == "200" ]] || [[ "$code" == "301" ]] || [[ "$code" == "302" ]]; then
        echo "✅ LIVE ($code)"
        ((LIVE++))
        return 0
    else
        echo "❌ DOWN ($code)"
        ((DOWN++))
        return 1
    fi
}

echo "🌐 TESTING ALL PLATFORMS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "CLOUDFLARE PAGES (11):"
test_endpoint "web" "https://blackroad-os-web.pages.dev"
test_endpoint "api" "https://blackroad-os-api.pages.dev"
test_endpoint "brand" "https://blackroad-os-brand.pages.dev"
test_endpoint "core" "https://blackroad-os-core.pages.dev"
test_endpoint "operator" "https://blackroad-os-operator.pages.dev"
test_endpoint "demo" "https://blackroad-os-demo.pages.dev"
test_endpoint "docs" "https://blackroad-os-docs.pages.dev"
test_endpoint "ideas" "https://blackroad-os-ideas.pages.dev"
test_endpoint "infra" "https://blackroad-os-infra.pages.dev"
test_endpoint "prism" "https://blackroad-os-prism.pages.dev"
test_endpoint "research" "https://blackroad-os-research.pages.dev"

echo ""
echo "CUSTOM DOMAINS (3):"
test_endpoint "blackroad.systems" "https://blackroad.systems"
test_endpoint "blackroad.io" "https://blackroad.io"
test_endpoint "github pages" "https://blackroad-os.github.io"

echo ""
echo "RAILWAY (1):"
test_endpoint "api-production" "https://blackroad-api-production-production.up.railway.app"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 FINAL RESULTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LIVE:  $LIVE"
echo "❌ DOWN:  $DOWN"
echo "📈 TOTAL: $TOTAL"

PERCENT=$((LIVE * 100 / TOTAL))
echo "🎯 SUCCESS RATE: ${PERCENT}%"

echo ""
if [ $PERCENT -ge 80 ]; then
    echo "🎉🎉🎉 VICTORY! TARGET ACHIEVED! 🎉🎉🎉"
    echo ""
    echo "You hit the 80%+ target!"
elif [ $PERCENT -ge 70 ]; then
    echo "🎯 EXCELLENT! Almost there!"
elif [ $PERCENT -ge 50 ]; then
    echo "✅ GOOD PROGRESS! Keep going!"
else
    echo "⏳ Still building... check back soon!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

