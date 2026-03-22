#!/bin/bash
echo "🔍 Searching for Pironmans on TP-Link Ethernet"
echo "==============================================="
echo ""

# Common TP-Link gateway IPs
TPLINK_GATEWAYS=(
    "192.168.0.1"
    "192.168.1.1"
    "192.168.0.254"
    "10.0.0.1"
)

echo "📡 Checking for TP-Link gateways..."
for gw in "${TPLINK_GATEWAYS[@]}"; do
    if ping -c 1 -W 1 $gw >/dev/null 2>&1; then
        echo "  ✅ Found gateway at $gw"
        
        # Scan that subnet
        subnet="${gw%.*}.0/24"
        echo "  🔎 Scanning $subnet for devices..."
        
        # Quick scan for SSH ports
        for i in {1..254}; do
            ip="${gw%.*}.$i"
            if timeout 1 nc -z $ip 22 2>/dev/null; then
                echo "    → SSH found at $ip"
                
                # Try to identify
                for user in pi octavia anastasia operator; do
                    hostname=$(ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o BatchMode=yes $user@$ip "hostname" 2>/dev/null)
                    if [ $? -eq 0 ]; then
                        echo "      ✅ $hostname (user: $user)"
                        break
                    fi
                done
            fi
        done
    fi
done

echo ""
echo "🔌 Checking if Mac has additional ethernet interfaces..."
ifconfig | grep -E "^en[0-9]:|^eth[0-9]:" | cut -d: -f1 | while read iface; do
    ip=$(ifconfig $iface 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')
    if [ ! -z "$ip" ]; then
        echo "  Interface $iface: $ip"
        subnet="${ip%.*}.0/24"
        echo "    Subnet: $subnet"
    fi
done

echo ""
echo "💡 Quick Test: Try these if you know the TP-Link network:"
echo "  ssh pi@192.168.0.74"
echo "  ssh pi@192.168.1.74"
echo "  ssh octavia@192.168.0.100"
echo "  ssh anastasia@192.168.0.101"
