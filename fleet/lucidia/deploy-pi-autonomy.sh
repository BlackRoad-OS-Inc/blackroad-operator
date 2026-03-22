#!/bin/bash
# Deploy BlackRoad Autonomy to all Pis
# Run from alexandria (Mac)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTONOMY_SCRIPT="$SCRIPT_DIR/blackroad-pi-autonomy.sh"

# Pi fleet
PIES=(cecilia lucidia octavia aria alice)

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PINK='\033[38;5;205m'
NC='\033[0m'

echo -e "${PINK}═══════════════════════════════════════════════${NC}"
echo -e "${PINK}   BlackRoad Pi Autonomy Fleet Deployment${NC}"
echo -e "${PINK}═══════════════════════════════════════════════${NC}"
echo ""

# Create central monitoring directory
mkdir -p ~/.blackroad/pi-fleet

SUCCESS=0
FAILED=0

for pi in "${PIES[@]}"; do
    echo -e "\n${PINK}[$pi]${NC} Deploying autonomy system..."

    # Test connectivity
    if ! ssh -o ConnectTimeout=5 "$pi" "echo ok" &>/dev/null; then
        echo -e "  ${RED}OFFLINE${NC} - skipping"
        ((FAILED++))
        continue
    fi

    # Create directory and copy script
    ssh "$pi" "mkdir -p ~/.blackroad-autonomy/tasks/{pending,completed}" 2>/dev/null

    scp -q "$AUTONOMY_SCRIPT" "$pi:~/.blackroad-autonomy/blackroad-pi-autonomy.sh"
    ssh "$pi" "chmod +x ~/.blackroad-autonomy/blackroad-pi-autonomy.sh"

    # Install as service
    echo -e "  Installing service..."
    ssh "$pi" "~/.blackroad-autonomy/blackroad-pi-autonomy.sh install" 2>&1 | sed 's/^/    /'

    # Verify
    if ssh "$pi" "systemctl is-active --quiet blackroad-autonomy" 2>/dev/null; then
        echo -e "  ${GREEN}SUCCESS${NC} - autonomy running"
        ((SUCCESS++))
    else
        echo -e "  ${YELLOW}WARNING${NC} - service may need manual start"
        ((SUCCESS++))
    fi
done

echo ""
echo -e "${PINK}═══════════════════════════════════════════════${NC}"
echo -e "Deployment Complete: ${GREEN}$SUCCESS${NC} success, ${RED}$FAILED${NC} failed"
echo -e "${PINK}═══════════════════════════════════════════════${NC}"
echo ""
echo "Monitor fleet: ~/pi-autonomy-package/pi-fleet-status.sh"
