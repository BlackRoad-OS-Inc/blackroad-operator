#!/bin/bash
#
# find_jetson_orin.sh
#
# Specialized script to locate NVIDIA Jetson Orin on the network.
# Uses multiple detection methods for reliability.
#

set -e

SUBNET="${1:-192.168.4.0/24}"

echo "=== Finding NVIDIA Jetson Orin on $SUBNET ===" >&2
echo "" >&2

# Method 1: Check ARP table for NVIDIA MAC
echo "[1/4] Checking ARP table for NVIDIA MAC addresses..." >&2
NVIDIA_MAC_PREFIXES=(
  "48:b0:2d"
  "00:04:4b"
)

for prefix in "${NVIDIA_MAC_PREFIXES[@]}"; do
  FOUND=$(arp -a | grep -i "$prefix" || true)
  if [ -n "$FOUND" ]; then
    echo "  ✓ Found NVIDIA device(s):" >&2
    echo "$FOUND" | while read line; do
      IP=$(echo "$line" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1)
      MAC=$(echo "$line" | grep -oE '([0-9a-f]{1,2}:){5}[0-9a-f]{1,2}' | head -1)
      echo "    IP: $IP, MAC: $MAC" >&2
    done
  fi
done

# Method 2: Check for common Jetson hostnames in DNS/mDNS
echo "" >&2
echo "[2/4] Checking for common Jetson hostnames..." >&2
COMMON_JETSON_NAMES=(
  "jetson"
  "jetson-orin"
  "orin"
  "nvidia-desktop"
  "tegra"
)

for name in "${COMMON_JETSON_NAMES[@]}"; do
  # Try ping
  if ping -c 1 -W 1 "$name" >/dev/null 2>&1; then
    IP=$(ping -c 1 "$name" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1)
    echo "  ✓ Found: $name → $IP" >&2
  fi

  # Try with .local (mDNS)
  if ping -c 1 -W 1 "$name.local" >/dev/null 2>&1; then
    IP=$(ping -c 1 "$name.local" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1)
    echo "  ✓ Found: $name.local → $IP" >&2
  fi
done

# Method 3: Network scan (if nmap available)
echo "" >&2
echo "[3/4] Network scan..." >&2
if command -v nmap >/dev/null 2>&1; then
  echo "  Running nmap host discovery on $SUBNET..." >&2
  SCAN_RESULTS=$(mktemp)
  sudo nmap -sn -oG "$SCAN_RESULTS" "$SUBNET" >/dev/null 2>&1

  # Check each discovered host
  while read line; do
    if echo "$line" | grep -q "Up"; then
      IP=$(echo "$line" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}')

      # Quick SSH probe for Jetson signature
      if timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "test -f /etc/nv_tegra_release" 2>/dev/null; then
        echo "  ✓ Jetson detected at $IP (has /etc/nv_tegra_release)" >&2

        # Get full info
        MODEL=$(timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "cat /etc/nv_tegra_release | head -1" 2>/dev/null)
        HOSTNAME=$(timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "hostname" 2>/dev/null)

        echo "    Hostname: $HOSTNAME" >&2
        echo "    Model: $MODEL" >&2
      fi
    fi
  done < "$SCAN_RESULTS"

  rm -f "$SCAN_RESULTS"
else
  echo "  nmap not installed, skipping network scan" >&2
  echo "  Install with: brew install nmap" >&2
fi

# Method 4: Check all IPs in subnet with SSH (slow but thorough)
echo "" >&2
echo "[4/4] SSH probe (checking common IPs)..." >&2
BASE_IP=$(echo "$SUBNET" | cut -d/ -f1 | cut -d. -f1-3)

# Check common DHCP ranges (skip .1 router, .28 is Mac, .255 broadcast)
COMMON_IPS=(50 51 52 53 54 55 56 57 58 59 60 61 62 63)

for i in "${COMMON_IPS[@]}"; do
  IP="$BASE_IP.$i"

  # Skip known devices
  [ "$IP" = "192.168.4.28" ] && continue  # Mac
  [ "$IP" = "192.168.4.38" ] && continue  # Lucidia
  [ "$IP" = "192.168.4.49" ] && continue  # Alice
  [ "$IP" = "192.168.4.64" ] && continue  # BlackRoad Pi
  [ "$IP" = "192.168.4.68" ] && continue  # iPhone

  # Quick ping first
  if ping -c 1 -W 1 "$IP" >/dev/null 2>&1; then
    # Try SSH probe
    if timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "test -f /etc/nv_tegra_release && cat /etc/nv_tegra_release" 2>/dev/null; then
      echo "  ✓ Jetson Orin found at $IP!" >&2

      # Get detailed info
      HOSTNAME=$(timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "hostname" 2>/dev/null || echo "unknown")
      ARCH=$(timeout 2 ssh -o ConnectTimeout=1 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR alexa@$IP "uname -m" 2>/dev/null || echo "unknown")

      echo "" >&2
      echo "=== Jetson Orin Details ===" >&2
      echo "IP: $IP" >&2
      echo "Hostname: $HOSTNAME" >&2
      echo "Architecture: $ARCH" >&2
      echo "" >&2
      echo "To add to mesh-hosts.txt:" >&2
      echo "$IP:$HOSTNAME:NVIDIA Jetson Orin edge compute" >&2
      echo "" >&2

      exit 0
    fi
  fi
done

echo "" >&2
echo "No Jetson Orin found. Troubleshooting steps:" >&2
echo "1. Ensure Jetson is powered on and Ethernet cable connected" >&2
echo "2. Check router DHCP leases: http://192.168.4.1" >&2
echo "3. Connect via HDMI+keyboard and check IP: ip addr show" >&2
echo "4. Ensure SSH is enabled: sudo systemctl status ssh" >&2
echo "5. Try default Jetson credentials: nvidia/nvidia" >&2
