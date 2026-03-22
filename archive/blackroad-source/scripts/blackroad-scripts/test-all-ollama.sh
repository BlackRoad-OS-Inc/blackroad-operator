#!/bin/bash

echo "🧠 TESTING ALL 3 OLLAMA ENDPOINTS"
echo "=================================="
echo ""

ENDPOINTS=(
    "lucidia:192.168.4.81:11434:Local Pi 5 Brain"
    "shellfish:174.138.44.45:11434:Cloud (CentOS)"
    "codex-infinity:159.65.43.12:11434:Cloud (Ubuntu)"
)

for endpoint in "${ENDPOINTS[@]}"; do
    name="${endpoint%%:*}"
    rest="${endpoint#*:}"
    ip="${rest%%:*}"
    rest="${rest#*:}"
    port="${rest%%:*}"
    desc="${rest#*:}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Testing: $name ($desc)"
    echo "URL: http://$ip:$port"
    echo ""
    
    # Test connectivity
    if curl -s --connect-timeout 5 "http://$ip:$port/api/tags" > /tmp/ollama_test_$name.json 2>/dev/null; then
        echo "✅ Status: ONLINE"
        
        # Count models
        model_count=$(cat /tmp/ollama_test_$name.json | jq '.models | length' 2>/dev/null)
        if [ "$model_count" = "null" ] || [ -z "$model_count" ]; then
            echo "⚠️  Models: API responded but no models found"
        else
            echo "📦 Models: $model_count available"
            echo ""
            echo "Available models:"
            cat /tmp/ollama_test_$name.json | jq -r '.models[]?.name' 2>/dev/null | sed 's/^/  • /'
        fi
        
        # Test inference with a simple query
        echo ""
        echo "🧪 Testing inference (simple query)..."
        response=$(curl -s --connect-timeout 10 "http://$ip:$port/api/generate" \
            -d '{"model":"'$(cat /tmp/ollama_test_$name.json | jq -r '.models[0].name' 2>/dev/null)'", "prompt":"Say hi in 3 words", "stream":false}' 2>/dev/null)
        
        if echo "$response" | jq -e '.response' >/dev/null 2>&1; then
            echo "✅ Inference: Working!"
            echo "   Response: $(echo "$response" | jq -r '.response' | head -c 100)"
        else
            echo "⚠️  Inference: No model available for testing"
        fi
        
    else
        echo "❌ Status: OFFLINE or not responding"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 SUMMARY"
echo "=========="

# Count online endpoints
online=0
for endpoint in "${ENDPOINTS[@]}"; do
    name="${endpoint%%:*}"
    if [ -f "/tmp/ollama_test_$name.json" ]; then
        online=$((online + 1))
    fi
done

echo "  Online: $online/3"
echo "  Total models available: $(cat /tmp/ollama_test_*.json 2>/dev/null | jq -s 'map(.models // []) | flatten | length' 2>/dev/null || echo '0')"
echo ""

if [ $online -eq 3 ]; then
    echo "✅ All 3 Ollama endpoints operational!"
    echo ""
    echo "💡 You have distributed LLM inference:"
    echo "   • Local (low latency): lucidia"
    echo "   • Cloud (public): shellfish, codex-infinity"
    echo "   • Load balancing ready!"
elif [ $online -gt 0 ]; then
    echo "⚠️  $online endpoint(s) online, $(( 3 - online )) offline"
else
    echo "❌ No Ollama endpoints responding"
fi

# Cleanup
rm -f /tmp/ollama_test_*.json 2>/dev/null

