#!/bin/bash
# Quick test of all critical endpoints

echo "⚡ QUICK STATUS CHECK"
echo "═══════════════════════════════════════"

test_quick() {
    url=$1
    code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>&1)
    if [[ "$code" == "200" ]]; then
        echo "✅ $url"
    else
        echo "❌ $url ($code)"
    fi
}

test_quick "https://blackroad-os-web.pages.dev"
test_quick "https://blackroad-os-api.pages.dev"
test_quick "https://blackroad-os-core.pages.dev"
test_quick "https://blackroad.systems"

echo "═══════════════════════════════════════"
