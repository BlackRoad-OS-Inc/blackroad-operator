#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  BLACKROAD MESH SSH CONNECTION TEST
#  Purpose: Test SSH connections to all devices in the BlackRoad mesh
#  Location: ~/blackroad-sandbox/test-all-ssh.sh
# ═══════════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  BLACKROAD MESH CONNECTION TEST"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Device definitions: name|user@ip|description
declare -a devices=(
    "blackroad-pi|pi@192.168.4.64|Raspberry Pi 5 8GB - Primary Pi Node"
    "lucidia|pi@192.168.4.38|Raspberry Pi 5 8GB - Lucidia Core Host"
    "alice|alice@192.168.4.49|Raspberry Pi 400 4GB - Secondary Node"
    "codex-infinity|root@159.65.43.12|DigitalOcean - Monaco Editor"
    "shellfish-drop|root@174.138.44.45|DigitalOcean - Backup"
)

# Tailscale connections
declare -a tailscale_devices=(
    "lucidia-ts|pi@100.66.235.47|Lucidia via Tailscale"
    "alice-ts|alice@100.66.58.5|Alice via Tailscale"
)

# Function to test connection
test_connection() {
    local name=$1
    local target=$2
    local description=$3

    printf "%-20s %-25s " "$name" "($target)"

    # Try to connect with 5 second timeout
    if timeout 5 ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$target" "echo OK" &>/dev/null; then
        echo -e "${GREEN}✅ CONNECTED${NC}"

        # Get additional info
        info=$(timeout 5 ssh -o BatchMode=yes -o ConnectTimeout=5 "$target" "echo \"   Hostname: \$(hostname)\" && echo \"   Uptime: \$(uptime -p 2>/dev/null || uptime | awk '{print \$3, \$4}')\" && echo \"   Load: \$(uptime | awk -F'load average:' '{print \$2}')\"" 2>/dev/null)

        if [ -n "$info" ]; then
            echo "$info"
        fi

        echo "   Description: $description"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "   Description: $description"
        echo "   Target: $target"
        return 1
    fi
    echo ""
}

# Test local network devices
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  LOCAL NETWORK DEVICES (192.168.4.x)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

local_success=0
local_total=0

for device in "${devices[@]}"; do
    IFS='|' read -r name target description <<< "$device"

    # Only test local network (192.168.x.x)
    if [[ $target == *"192.168"* ]]; then
        test_connection "$name" "$target" "$description" && ((local_success++))
        ((local_total++))
        echo ""
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  CLOUD SERVERS (DigitalOcean)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cloud_success=0
cloud_total=0

for device in "${devices[@]}"; do
    IFS='|' read -r name target description <<< "$device"

    # Only test cloud servers (not 192.168.x.x)
    if [[ $target != *"192.168"* ]] && [[ $target != *"100.66"* ]]; then
        test_connection "$name" "$target" "$description" && ((cloud_success++))
        ((cloud_total++))
        echo ""
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TAILSCALE MESH NETWORK (100.x.x.x)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ts_success=0
ts_total=0

for device in "${tailscale_devices[@]}"; do
    IFS='|' read -r name target description <<< "$device"
    test_connection "$name" "$target" "$description" && ((ts_success++))
    ((ts_total++))
    echo ""
done

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

total_success=$((local_success + cloud_success + ts_success))
total_devices=$((local_total + cloud_total + ts_total))

echo "  Local Network:   $local_success/$local_total devices connected"
echo "  Cloud Servers:   $cloud_success/$cloud_total devices connected"
echo "  Tailscale Mesh:  $ts_success/$ts_total devices connected"
echo "  ─────────────────────────────────────────────────────────"
echo "  TOTAL:           $total_success/$total_devices devices connected"
echo ""

if [ $total_success -eq $total_devices ]; then
    echo -e "${GREEN}🎉 ALL DEVICES CONNECTED!${NC}"
    echo ""
    echo "Your BlackRoad mesh is fully operational."
elif [ $total_success -gt 0 ]; then
    echo -e "${YELLOW}⚠️  PARTIAL CONNECTIVITY${NC}"
    echo ""
    echo "Some devices are not responding. Check:"
    echo "  1. Are devices powered on?"
    echo "  2. Are you on the correct network?"
    echo "  3. Is SSH service running on failed devices?"
    echo "  4. Are SSH keys properly configured?"
else
    echo -e "${RED}❌ NO DEVICES CONNECTED${NC}"
    echo ""
    echo "Cannot reach any devices. Check:"
    echo "  1. Network connectivity"
    echo "  2. SSH configuration (~/.ssh/config)"
    echo "  3. SSH keys (~/.ssh/id_br_ed25519)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "  Test completed at $(date)"
echo "═══════════════════════════════════════════════════════════════════════════════"
