#!/bin/bash

echo "🔬 BLACKROAD E2E FULL TEST"
echo "================================"
echo "Running from: $(hostname) @ $(hostname -I | awk '{print $1}')"
echo ""

# Test Lucidia brain directly
echo "🧠 Testing Lucidia Brain (192.168.4.81)..."
echo ""

echo "1️⃣ NATS Service:"
if nc -z 192.168.4.81 4222 2>/dev/null; then
    echo "  ✅ Port 4222 OPEN"
else
    echo "  ❌ Port 4222 CLOSED"
fi

echo ""
echo "2️⃣ Ollama Service:"
response=$(curl -s --connect-timeout 5 http://192.168.4.81:11434/api/tags 2>/dev/null)
if echo "$response" | grep -q "models"; then
    echo "  ✅ Ollama API responding"
    echo "  Models available:"
    echo "$response" | jq -r '.models[]?.name' 2>/dev/null | head -5 | sed 's/^/    - /'
else
    echo "  ⚠️  Ollama not responding - testing localhost..."
    local_response=$(curl -s --connect-timeout 5 http://localhost:11434/api/tags 2>/dev/null)
    if echo "$local_response" | grep -q "models"; then
        echo "  ✅ Ollama running on localhost"
        echo "$local_response" | jq -r '.models[]?.name' 2>/dev/null | head -5 | sed 's/^/    - /'
    else
        echo "  ❌ Ollama not available"
    fi
fi

echo ""
echo "3️⃣ Network Topology:"
echo "  All nodes pingable from local network:"
for ip in 192.168.4.49 192.168.4.81 192.168.4.38 192.168.4.82; do
    if ping -c 1 -W 1 $ip > /dev/null 2>&1; then
        echo "    ✅ $ip"
    else
        echo "    ❌ $ip"
    fi
done

echo ""
echo "4️⃣ Current System Status:"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $3 " / " $2}' 2>/dev/null || echo 'N/A')"
echo "  Disk: $(df -h / | tail -1 | awk '{print $3 " / " $2 " (" $5 " used)"}')"
echo "  Uptime: $(uptime -p 2>/dev/null || uptime)"

echo ""
echo "✨ E2E TEST COMPLETE"
