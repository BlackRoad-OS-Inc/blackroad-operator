#!/bin/bash
# Fix Hailo-8 PCIe driver on Octavia
# Run this ON Octavia with: sudo bash fix-hailo-octavia.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

echo -e "${PINK}═══ BlackRoad Hailo-8 Driver Fix ═══${RESET}"
echo ""

KERNEL=$(uname -r)
echo -e "${AMBER}Kernel: ${KERNEL}${RESET}"

# Step 1: Force purge the broken package
echo -e "\n${AMBER}[1/5] Force-purging broken hailort-pcie-driver...${RESET}"
dpkg --force-remove-reinstreq --purge hailort-pcie-driver || true

# Step 2: Clean up any leftover source
echo -e "\n${AMBER}[2/5] Cleaning leftover source dirs...${RESET}"
rm -rf /usr/src/hailort-pcie-driver 2>/dev/null || true

# Step 3: Fix any broken deps
echo -e "\n${AMBER}[3/5] Fixing broken deps...${RESET}"
apt --fix-broken install -y

# Step 4: Reinstall the driver
echo -e "\n${AMBER}[4/5] Reinstalling hailort-pcie-driver...${RESET}"
apt install -y hailort-pcie-driver

# Step 5: Load the module
echo -e "\n${AMBER}[5/5] Loading hailo_pci module...${RESET}"
modprobe hailo_pci

# Verify
echo ""
if [ -e /dev/hailo0 ]; then
  echo -e "${GREEN}✓ /dev/hailo0 exists — Hailo-8 is ready!${RESET}"
  echo -e "${GREEN}✓ Module loaded:${RESET}"
  lsmod | grep hailo
else
  echo -e "${PINK}✗ /dev/hailo0 not found${RESET}"
  echo "Check: dmesg | tail -20"
  echo ""
  echo "If the module wasn't built for ${KERNEL}, try:"
  echo "  apt install linux-headers-${KERNEL}"
  echo "  dpkg-reconfigure hailort-pcie-driver"
  echo "  modprobe hailo_pci"
fi
