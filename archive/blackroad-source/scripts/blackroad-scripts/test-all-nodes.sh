#!/bin/bash

echo "🔍 COMPLETE BLACKROAD INFRASTRUCTURE AUDIT"
echo "=========================================="
echo ""

# Local network nodes
LOCAL_NODES=("alice:192.168.4.49" "lucidia:192.168.4.81" "octavia:192.168.4.38" "aria:192.168.4.82" "cecilia:192.168.4.89")

# Cloud nodes
CLOUD_NODES=("shellfish:174.138.44.45" "codex:159.65.43.12")

# Tailscale nodes  
TS_NODES=("cecilia-ts:100.72.180.98" "lucidia-ts:100.83.149.86" "aria-ts:100.109.14.17")

echo "🏠 LOCAL NETWORK NODES (192.168.4.x)"
echo "======================================"
for node in "${LOCAL_NODES[@]}"; do
    name="${node%%:*}"
    ip="${node##*:}"
    echo ""
    echo "📍 $name ($ip)"
    if timeout 3 ping -c 1 $ip >/dev/null 2>&1; then
        echo "   Status: ✅ ONLINE"
        # Try to get hostname without SSH
        ssh -o ConnectTimeout=2 -o BatchMode=yes $name "hostname && cat /proc/cpuinfo | grep Model | head -1 && df -h / | tail -1" 2>/dev/null || echo "   (SSH requires password)"
    else
        echo "   Status: ❌ OFFLINE"
    fi
done

echo ""
echo ""
echo "☁️  CLOUD NODES (Public IPs)"
echo "============================="
for node in "${CLOUD_NODES[@]}"; do
    name="${node%%:*}"
    ip="${node##*:}"
    echo ""
    echo "📍 $name ($ip)"
    if timeout 3 ping -c 1 $ip >/dev/null 2>&1; then
        echo "   Status: ✅ ONLINE"
    else
        echo "   Status: ❌ OFFLINE or filtered"
    fi
done

echo ""
echo ""
echo "🌐 TAILSCALE MESH (100.x.x.x)"
echo "=============================="
for node in "${TS_NODES[@]}"; do
    name="${node%%:*}"
    ip="${node##*:}"
    echo ""
    echo "📍 $name ($ip)"
    if timeout 3 ping -c 1 $ip >/dev/null 2>&1; then
        echo "   Status: ✅ CONNECTED"
    else
        echo "   Status: ⚠️  Not reachable (Tailscale may be down)"
    fi
done

echo ""
echo ""
echo "📊 SUMMARY"
echo "=========="
echo "  Local nodes: 5 (alice, lucidia, octavia, aria, cecilia)"
echo "  Cloud nodes: 2 (shellfish, codex-infinity)"
echo "  Tailscale:   3 configured (cecilia, lucidia, aria)"
echo "  Other:       olympia (pikvm.local), alexandria (this machine)"
echo ""
echo "Total infrastructure: 10+ nodes"

