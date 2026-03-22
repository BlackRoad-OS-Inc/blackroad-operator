#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  BLACKROAD NETWORK NEIGHBOR DISCOVERY
#  Purpose: Scan local network for all devices
#  Location: ~/blackroad-sandbox/discover-neighbors.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  BLACKROAD NETWORK NEIGHBOR DISCOVERY"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Get your Mac's current IP
MY_IP=$(ipconfig getifaddr en0 2>/dev/null || echo "Not connected")
echo "📍 Your Mac's IP: $MY_IP"
echo ""

# Determine subnet (assuming /22 = 192.168.4.0/22)
if [[ "$MY_IP" =~ ^192\.168\.4\. ]]; then
    SUBNET="192.168.4.0/22"
    echo "🔍 Scanning subnet: $SUBNET (192.168.4.0 - 192.168.7.255)"
    echo ""
else
    echo "⚠️  Not on the BlackRoad network (192.168.4.x)"
    echo ""
    read -p "Enter subnet to scan (e.g., 192.168.1.0/24): " SUBNET
    echo ""
fi

# Check if nmap is installed
if ! command -v nmap &> /dev/null; then
    echo "❌ nmap is not installed"
    echo ""
    echo "To install nmap:"
    echo "   brew install nmap"
    echo ""
    echo "Falling back to simple ping scan..."
    echo ""

    # Simple ping scan of known IPs
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  PING SCAN OF KNOWN DEVICES"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    declare -A known_hosts=(
        ["192.168.4.64"]="blackroad-pi"
        ["192.168.4.38"]="lucidia"
        ["192.168.4.49"]="alice"
        ["192.168.4.99"]="lucidia-alternate"
        ["192.168.4.68"]="iPhone-Koder"
    )

    for ip in "${!known_hosts[@]}"; do
        name="${known_hosts[$ip]}"
        printf "%-20s %-17s " "$name" "($ip)"

        if ping -c 1 -W 1 "$ip" &> /dev/null; then
            echo "✅ UP"

            # Try to get hostname
            hostname=$(ssh -o BatchMode=yes -o ConnectTimeout=2 -o StrictHostKeyChecking=no "$ip" "hostname" 2>/dev/null || echo "")
            if [ -n "$hostname" ]; then
                echo "   Hostname: $hostname"
            fi
        else
            echo "❌ DOWN"
        fi
    done

    exit 0
fi

# Full nmap scan
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  NMAP SCAN (this may take 30-60 seconds)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run nmap scan for active hosts
echo "🔎 Scanning for active hosts..."
nmap -sn "$SUBNET" -oG - | grep "Host:" | awk '{print $2, $3}' > /tmp/nmap_scan.txt

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DISCOVERED DEVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Known device mapping
declare -A known_devices=(
    ["192.168.4.64"]="blackroad-pi (Raspberry Pi 5)"
    ["192.168.4.38"]="lucidia (Raspberry Pi 5)"
    ["192.168.4.49"]="alice (Raspberry Pi 400)"
    ["192.168.4.99"]="lucidia-alternate (Raspberry Pi 5)"
    ["192.168.4.68"]="iPhone-Koder"
)

count=0
while IFS= read -r line; do
    ip=$(echo "$line" | awk '{print $1}')
    hostname=$(echo "$line" | awk '{print $2}' | tr -d '()')

    # Skip if hostname is "Up"
    if [ "$hostname" = "Up" ]; then
        hostname="Unknown"
    fi

    # Check if it's a known device
    if [ -n "${known_devices[$ip]}" ]; then
        device_name="${known_devices[$ip]}"
    else
        device_name="Unknown device"
    fi

    printf "%-17s %-30s %s\n" "$ip" "$hostname" "$device_name"

    # Try to check if SSH port is open
    if timeout 2 nc -z "$ip" 22 2>/dev/null; then
        echo "   └─ SSH port 22: OPEN"

        # Try to get SSH banner
        ssh_banner=$(timeout 2 ssh-keyscan -t rsa "$ip" 2>/dev/null | grep "^$ip" | head -1 || echo "")
        if [ -n "$ssh_banner" ]; then
            echo "   └─ SSH available"
        fi
    fi

    echo ""
    ((count++))
done < /tmp/nmap_scan.txt

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Total devices found: $count"
echo ""

# Show known devices that weren't found
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EXPECTED DEVICES NOT FOUND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

found_ips=$(awk '{print $1}' /tmp/nmap_scan.txt)
for ip in "${!known_devices[@]}"; do
    if ! echo "$found_ips" | grep -q "$ip"; then
        printf "%-17s %s\n" "$ip" "${known_devices[$ip]}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  Scan completed at $(date)"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Cleanup
rm -f /tmp/nmap_scan.txt

echo "💡 TIP: To scan with more detail, run:"
echo "   nmap -sV -O $SUBNET"
echo ""
