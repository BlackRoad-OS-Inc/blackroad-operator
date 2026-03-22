#!/bin/bash
echo "🔍 Searching for Pironman Pi 5s (octavia & anastasia)"
echo "======================================================"
echo ""

# Known info
echo "📋 Known Details:"
echo "  • octavia - Pironman case, Pi 5, Hailo AI + NVMe"
echo "  • anastasia - Pironman case, Pi 5, (no Hailo yet)"
echo "  • Expected around .74 range or unknown"
echo ""

# Scan broader range for Pi 5s
echo "🔎 Scanning network for Raspberry Pi 5s..."
for i in {1..254}; do
    ip="192.168.4.$i"
    # Quick ping check
    if ping -c 1 -W 1 $ip >/dev/null 2>&1; then
        echo "  Found device at $ip - checking..."
        # Try to identify if it's a Pi 5
        curl -s --connect-timeout 1 http://$ip:2021 >/dev/null 2>&1 && echo "    🎯 Pironman management interface detected!"
        
        # Try SSH with different users
        for user in pi octavia anastasia operator; do
            if ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o BatchMode=yes $user@$ip "hostname" 2>/dev/null; then
                echo "    ✅ SSH accessible as $user"
                ssh $user@$ip "cat /proc/cpuinfo | grep -E '(Model|Revision)'; lspci 2>/dev/null | grep -i hailo; lsblk | grep nvme" 2>/dev/null
                break
            fi
        done
    fi
done

echo ""
echo "💡 Tip: If not found, they may be:"
echo "  1. Powered off - check physical devices"
echo "  2. On different subnet"
echo "  3. Need keyboard/monitor to enable SSH"
