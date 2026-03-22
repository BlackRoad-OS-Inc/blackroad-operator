#!/bin/bash
# BlackRoad OS - Quick Sync to Pi Fleet
# For rapid code updates without full deployment

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

PI_USER="${PI_USER:-pi}"
REMOTE_DIR="/home/$PI_USER/blackroad"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

declare -A PI_FLEET=(
    ["lucidia"]="192.168.4.38"
    ["blackroad-pi"]="192.168.4.64"
    ["lucidia-alt"]="192.168.4.99"
)

echo -e "${BLUE}🔄 Syncing code to Pi fleet...${NC}"
echo ""

for pi_name in "${!PI_FLEET[@]}"; do
    pi_ip="${PI_FLEET[$pi_name]}"

    echo -e "${BLUE}→ Syncing to ${pi_name} (${pi_ip})${NC}"

    if ! ping -c 1 -W 2 "${pi_ip}" > /dev/null 2>&1; then
        echo -e "  Skipping (offline)"
        continue
    fi

    # Sync only Python source
    rsync -avz --delete \
        --exclude '__pycache__/' \
        --exclude '*.pyc' \
        "${SOURCE_DIR}/src/blackroad_core/" \
        "${PI_USER}@${pi_ip}:${REMOTE_DIR}/blackroad_core/" \
        2>/dev/null && echo -e "${GREEN}  ✓ Synced${NC}" || echo -e "  Failed"
done

echo ""
echo -e "${GREEN}✅ Sync complete${NC}"
echo ""
echo "Restart services to apply changes:"
echo "  ssh pi@<ip> 'sudo systemctl restart blackroad-lucidia'"
