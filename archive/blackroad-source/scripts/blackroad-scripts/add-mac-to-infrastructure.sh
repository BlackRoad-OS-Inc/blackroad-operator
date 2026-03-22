#!/bin/bash
# Add this Mac to BlackRoad infrastructure

echo "🖤 Adding Mac to BlackRoad Infrastructure"
echo ""
echo "Your Mac Details:"
echo "  Hostname: $(hostname)"
echo "  Local IP: $(ipconfig getifaddr en0)"
echo "  Tailscale: $(ifconfig utun4 2>/dev/null | grep 'inet ' | awk '{print $2}')"
echo ""

# Update SSH config to include this Mac
if ! grep -q "lucidia-operator" ~/.ssh/config 2>/dev/null; then
  echo "Adding to SSH config..."
  cat >> ~/.ssh/config << 'SSH'

# Local Mac
Host lucidia-operator
  HostName 192.168.4.28
  User alexa
  
Host mac
  HostName 192.168.4.28
  User alexa
SSH
  echo "✅ Added to SSH config"
else
  echo "✅ Already in SSH config"
fi

# Update hosts file for easy access
echo ""
echo "📝 Suggested additions to /etc/hosts:"
echo "192.168.4.28  lucidia-operator mac"
echo "192.168.4.49  alice"
echo "192.168.4.38  lucidia"
echo ""

# Update website registry
echo "🌐 Your Mac can host development versions:"
echo "  http://192.168.4.28 (local)"
echo "  http://mac.local (Bonjour)"
echo ""

echo "✅ Mac is now part of BlackRoad infrastructure!"
