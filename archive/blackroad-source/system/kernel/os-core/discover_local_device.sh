#!/bin/sh
#
# discover_local_device.sh
#
# Discovers and reports local device info in JSON format.
# Works on macOS, Linux (Pi), and Jetson Orin.
# Safe, read-only, no aggressive scanning.
#
# Usage: ./discover_local_device.sh [--role ROLE] [--notes "NOTES"]
#

set -e

# Parse args
ROLE_OVERRIDE=""
NOTES_OVERRIDE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --role)
      ROLE_OVERRIDE="$2"
      shift 2
      ;;
    --notes)
      NOTES_OVERRIDE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

# Detect OS
OS="unknown"
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS="$ID"
elif [ "$(uname -s)" = "Darwin" ]; then
  OS="macos"
fi

# Detect architecture
ARCH="$(uname -m)"

# Get hostname
HOSTNAME="$(hostname -s 2>/dev/null || hostname)"

# --- LAN IP (prefer 192.168.*) ---
LAN_IP=""
if [ "$OS" = "macos" ]; then
  # Try en0 first, then en1
  LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo '')"
else
  # Linux: find first non-loopback 192.168.* address
  LAN_IP="$(ip -4 addr show | grep -oP '(?<=inet\s)192\.168\.[0-9]+\.[0-9]+' | head -1)"
fi

# --- Tailscale IP ---
TAILSCALE_IP=""
if command -v tailscale >/dev/null 2>&1; then
  TAILSCALE_IP="$(tailscale ip -4 2>/dev/null || echo '')"
fi

# --- MAC address (LAN interface) ---
MAC_ADDRESS=""
MAC_VENDOR=""
if [ "$OS" = "macos" ]; then
  # Get MAC from en0
  MAC_ADDRESS="$(ifconfig en0 2>/dev/null | awk '/ether/ {print $2}')"
else
  # Linux: get MAC from primary interface
  PRIMARY_IFACE="$(ip route show default | awk '/default/ {print $5}' | head -1)"
  if [ -n "$PRIMARY_IFACE" ]; then
    MAC_ADDRESS="$(cat /sys/class/net/$PRIMARY_IFACE/address 2>/dev/null || echo '')"
  fi
fi

# Simple vendor lookup (first 3 octets)
if [ -n "$MAC_ADDRESS" ]; then
  MAC_PREFIX="$(echo "$MAC_ADDRESS" | cut -d: -f1-3 | tr '[:lower:]' '[:upper:]')"
  case "$MAC_PREFIX" in
    B8:27:EB|DC:A6:32|E4:5F:01|D8:3A:DD|2C:CF:67)
      MAC_VENDOR="Raspberry Pi Foundation"
      ;;
    48:B0:2D)
      MAC_VENDOR="NVIDIA (Jetson)"
      ;;
    B0:BE:83|AC:DE:48|88:66:5A)
      MAC_VENDOR="Apple"
      ;;
    *)
      MAC_VENDOR="Unknown"
      ;;
  esac
fi

# --- Role detection ---
ROLE="$ROLE_OVERRIDE"
if [ -z "$ROLE" ]; then
  # Auto-detect role
  if [ "$OS" = "macos" ]; then
    ROLE="mac-operator"
  elif [ "$MAC_VENDOR" = "Raspberry Pi Foundation" ]; then
    ROLE="pi-node"
  elif [ "$MAC_VENDOR" = "NVIDIA (Jetson)" ] || [ -f /etc/nv_tegra_release ]; then
    ROLE="jetson-orin"
  elif [ "$OS" = "debian" ] || [ "$OS" = "raspbian" ]; then
    ROLE="pi-node"
  elif [ "$OS" = "ubuntu" ] && [ -f /etc/nv_tegra_release ]; then
    ROLE="jetson-orin"
  else
    ROLE="unknown-linux"
  fi
fi

# --- Jetson Orin specific detection ---
JETSON_MODEL=""
JETSON_CUDA=""
if [ -f /etc/nv_tegra_release ]; then
  JETSON_MODEL="$(cat /etc/nv_tegra_release | head -1)"
  if command -v nvcc >/dev/null 2>&1; then
    JETSON_CUDA="$(nvcc --version | grep 'release' | awk '{print $5}' | tr -d ',')"
  fi
fi

# --- SSH reachable? (check if sshd is running) ---
SSH_REACHABLE="false"
if [ "$OS" = "macos" ]; then
  if sudo systemsetup -getremotelogin 2>/dev/null | grep -q "On"; then
    SSH_REACHABLE="true"
  fi
else
  if systemctl is-active --quiet ssh 2>/dev/null || systemctl is-active --quiet sshd 2>/dev/null; then
    SSH_REACHABLE="true"
  elif pgrep -x sshd >/dev/null 2>&1; then
    SSH_REACHABLE="true"
  fi
fi

# --- Docker bridge IPs (exclude from LAN) ---
DOCKER_BRIDGES=""
if command -v docker >/dev/null 2>&1; then
  DOCKER_BRIDGES="$(docker network inspect bridge -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 2>/dev/null || echo '')"
fi

# --- Notes ---
NOTES="$NOTES_OVERRIDE"
if [ -z "$NOTES" ]; then
  # Auto-generate notes based on hostname patterns
  case "$HOSTNAME" in
    *alice*|*Alice*)
      NOTES="Alice Pi node"
      ;;
    *lucidia*|*Lucidia*)
      NOTES="Lucidia Pi node"
      ;;
    *blackroad*|*br*)
      NOTES="BlackRoad node"
      ;;
    *)
      NOTES=""
      ;;
  esac
fi

# --- Output JSON ---
# Use printf to avoid issues with special characters
# POSIX sh compatible (no associative arrays)

cat <<EOF
{
  "hostname": "$HOSTNAME",
  "lan_ip": "$LAN_IP",
  "tailscale_ip": "$TAILSCALE_IP",
  "mac_address": "$MAC_ADDRESS",
  "mac_vendor": "$MAC_VENDOR",
  "role": "$ROLE",
  "os": "$OS",
  "arch": "$ARCH",
  "ssh_reachable": $SSH_REACHABLE,
  "notes": "$NOTES",
  "jetson_model": "$JETSON_MODEL",
  "jetson_cuda": "$JETSON_CUDA",
  "docker_bridges": "$DOCKER_BRIDGES",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
