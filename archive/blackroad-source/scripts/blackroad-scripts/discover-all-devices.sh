#!/bin/bash
echo "🔎 Full Device Scan - BlackRoad Infrastructure"
echo "=============================================="
echo ""

# Try different SSH users
USERS=("pi" "alice" "lucidia" "root" "operator" "admin")
UNKNOWN_IPS=(192.168.4.22 192.168.4.27 192.168.4.33 192.168.4.44 192.168.4.82)

for ip in "${UNKNOWN_IPS[@]}"; do
    echo "🔍 Probing $ip..."
    found=false
    
    for user in "${USERS[@]}"; do
        if hostname=$(ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o BatchMode=yes $user@$ip "hostname" 2>/dev/null); then
            echo "   ✅ Found: $hostname (user: $user)"
            ssh $user@$ip "uname -a; cat /proc/cpuinfo 2>/dev/null | grep Model || echo 'Not a Pi'" 2>/dev/null
            found=true
            break
        fi
    done
    
    if [ "$found" = false ]; then
        # Try web ports
        if curl -s --connect-timeout 1 http://$ip >/dev/null 2>&1; then
            echo "   🌐 HTTP service on port 80"
        fi
        if curl -s --connect-timeout 1 http://$ip:3000 >/dev/null 2>&1; then
            echo "   🌐 Service on port 3000"
        fi
    fi
    echo ""
done

echo "📋 Summary of Accessible Devices:"
echo "  ✅ alice (192.168.4.49 / 100.77.210.18)"
echo "  ✅ lucidia (192.168.4.38 / 100.66.235.47)"
echo "  ✅ aria (100.109.14.17 tailscale)"
echo "  ✅ shellfish (174.138.44.45 / 100.94.33.37)"
echo "  ✅ codex-infinity (159.65.43.12 / 100.108.132.8)"
