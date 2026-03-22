#!/bin/bash

echo "🔍 CHECKING CLOUDFLARE PAGES DEPLOYMENTS"
echo "══════════════════════════════════════════════════"
echo ""

SUCCESS=0
BUILDING=0
FAILED=0
TOTAL=0

SERVICES=(
    "web"
    "api"
    "brand"
    "core"
    "operator"
    "demo"
    "docs"
    "ideas"
    "infra"
    "prism"
    "research"
)

for service in "${SERVICES[@]}"; do
    ((TOTAL++))
    url="https://blackroad-os-$service.pages.dev"
    printf "%-40s " "$service"
    
    code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>&1)
    
    if [[ "$code" == "200" ]]; then
        echo "✅ LIVE"
        ((SUCCESS++))
    elif [[ "$code" == "000" ]]; then
        echo "⏳ Building..."
        ((BUILDING++))
    else
        echo "❌ $code"
        ((FAILED++))
    fi
done

echo ""
echo "══════════════════════════════════════════════════"
echo "✅ Live: $SUCCESS/$TOTAL"
echo "⏳ Building: $BUILDING/$TOTAL"
echo "❌ Failed: $FAILED/$TOTAL"

if [ $SUCCESS -eq $TOTAL ]; then
    echo ""
    echo "🎉 ALL SERVICES DEPLOYED! 100% SUCCESS!"
    echo ""
elif [ $SUCCESS -ge 10 ]; then
    echo ""
    echo "🎯 EXCELLENT! $SUCCESS/$TOTAL working!"
    PERCENT=$((SUCCESS * 100 / TOTAL))
    echo "📊 Success Rate: ${PERCENT}%"
    echo ""
else
    echo ""
    echo "⏳ Keep waiting for builds to complete..."
    echo ""
fi

echo "══════════════════════════════════════════════════"

