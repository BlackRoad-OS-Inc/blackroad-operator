#!/bin/bash

echo "🔬 BLACKROAD E2E CLUSTER TEST"
echo "================================"
echo ""

# Test all nodes
NODES=("alice:192.168.4.49" "lucidia:192.168.4.81" "octavia:192.168.4.38" "aria:192.168.4.82")

echo "📡 1. Testing SSH connectivity to all nodes..."
for node in "${NODES[@]}"; do
    name="${node%%:*}"
    ip="${node##*:}"
    if timeout 5 ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o BatchMode=yes alexa@$ip "hostname" &>/dev/null; then
        echo "  ✅ $name ($ip) - ONLINE"
    else
        echo "  ⚠️  $name ($ip) - Cannot connect (may need password)"
    fi
done
echo ""

echo "🧠 2. Testing Lucidia brain services..."
echo "  Testing NATS (port 4222)..."
if timeout 3 nc -z 192.168.4.81 4222 2>/dev/null; then
    echo "  ✅ NATS port 4222 open"
else
    echo "  ⚠️  NATS port 4222 not accessible"
fi

echo "  Testing Ollama (port 11434)..."
if curl -s --connect-timeout 3 http://192.168.4.81:11434/api/tags 2>/dev/null | grep -q models; then
    echo "  ✅ Ollama responding"
    curl -s http://192.168.4.81:11434/api/tags | jq -r '.models[0].name' 2>/dev/null | head -1
else
    echo "  ⚠️  Ollama not responding"
fi
echo ""

echo "🌐 3. Testing network connectivity (ping test)..."
for node in "${NODES[@]}"; do
    name="${node%%:*}"
    ip="${node##*:}"
    if ping -c 2 -W 2 $ip > /dev/null 2>&1; then
        echo "  ✅ $name ($ip) - pingable"
    else
        echo "  ❌ $name ($ip) - not pingable"
    fi
done
echo ""

echo "🔍 4. Checking local system..."
echo "  Hostname: $(hostname)"
echo "  IP: $(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo 'N/A')"
echo "  Tailscale: $(tailscale status 2>/dev/null | head -1 || echo 'Not installed')"
echo ""

echo "✨ E2E TEST COMPLETE"
echo "================================"
