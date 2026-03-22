#!/bin/bash
# Probe unknown devices to identify them
set -e

UNKNOWN_IPS="192.168.4.26 192.168.4.27 192.168.4.33 192.168.4.69 192.168.4.70"

echo "=== Probing Unknown Devices ==="
echo ""

for ip in $UNKNOWN_IPS; do
  echo "Probing $ip..."
  
  # 1. Ping test
  if ping -c 1 -W 1 "$ip" >/dev/null 2>&1; then
    echo "  ✓ Ping: Alive"
  else
    echo "  ✗ Ping: No response"
    continue
  fi
  
  # 2. Try common SSH ports with different users
  SSH_FOUND=false
  for user in alexa pi ubuntu nvidia jetson admin root; do
    if ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "echo SSH_OK" 2>/dev/null | grep -q "SSH_OK"; then
      echo "  ✓ SSH: Accessible as user '$user'"
      SSH_FOUND=true
      
      # Get hostname
      HOSTNAME=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "hostname" 2>/dev/null || echo "unknown")
      echo "    Hostname: $HOSTNAME"
      
      # Check for Jetson
      if ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "test -f /etc/nv_tegra_release && cat /etc/nv_tegra_release | head -1" 2>/dev/null; then
        echo "    🎯 JETSON ORIN FOUND!"
        TEGRA=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "cat /etc/nv_tegra_release | head -1" 2>/dev/null)
        echo "    Tegra: $TEGRA"
      fi
      
      # Get OS info
      OS=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "uname -s" 2>/dev/null || echo "unknown")
      ARCH=$(ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR "$user@$ip" "uname -m" 2>/dev/null || echo "unknown")
      echo "    OS: $OS, Arch: $ARCH"
      
      break
    fi
  done
  
  if [ "$SSH_FOUND" = false ]; then
    echo "  ✗ SSH: Not accessible (tried alexa, pi, ubuntu, nvidia, jetson, admin, root)"
    
    # Try HTTP
    if curl -s --connect-timeout 2 "http://$ip" >/dev/null 2>&1; then
      echo "  ✓ HTTP: Web server detected on port 80"
    fi
    
    # Try common ports
    for port in 22 80 443 8080 3000 5000; do
      if nc -z -w 1 "$ip" "$port" 2>/dev/null; then
        echo "  ✓ Port $port: Open"
      fi
    done
  fi
  
  echo ""
done

echo "=== Summary ==="
echo "Check output above for any Jetson Orin detections (marked with 🎯)"
