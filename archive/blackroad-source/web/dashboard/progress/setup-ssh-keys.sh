#!/bin/bash
#
# BlackRoad OS - SSH Key Setup Script
# Sets up passwordless SSH access to all Pi nodes
#

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🖤🛣️  BlackRoad OS - SSH Key Setup  🖤🛣️                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "🔑 No SSH key found. Generating new ed25519 key..."
    ssh-keygen -t ed25519 -C "blackroad-dashboard-$(hostname)" -f ~/.ssh/id_ed25519 -N ""
    echo "✅ SSH key generated!"
    echo ""
fi

# Pi nodes to configure
PI_NODES=(
    "alice:192.168.4.49"
    "aria:192.168.4.64"
    "octavia:192.168.4.74"
    "lucidia:192.168.4.38"
)

echo "📡 Setting up SSH access to Pi nodes..."
echo ""

for node_info in "${PI_NODES[@]}"; do
    IFS=':' read -r name ip <<< "$node_info"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Configuring $name ($ip)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Test connectivity first
    if ssh -o ConnectTimeout=3 -o StrictHostKeyChecking=no -o PasswordAuthentication=no pi@$ip "echo 'Already configured!'" 2>/dev/null; then
        echo "✅ $name - SSH key already configured"
    else
        echo "⏳ $name - Setting up SSH key access..."
        echo "   (You may need to enter the password for pi@$ip)"

        # Try to copy SSH key
        if ssh-copy-id -o ConnectTimeout=5 pi@$ip 2>/dev/null; then
            echo "✅ $name - SSH key installed successfully!"
        else
            echo "⚠️  $name - Could not connect (may be offline or password required)"
        fi
    fi

    echo ""
done

# Add SSH config entries
echo "📝 Adding SSH config entries..."

CONFIG_FILE=~/.ssh/config

# Backup existing config
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%s)"
fi

# Create or append to SSH config
cat >> "$CONFIG_FILE" << 'EOF'

# BlackRoad OS Pi Fleet
Host alice
    HostName 192.168.4.49
    User pi
    StrictHostKeyChecking no
    ConnectTimeout 5

Host aria
    HostName 192.168.4.64
    User pi
    StrictHostKeyChecking no
    ConnectTimeout 5

Host octavia
    HostName 192.168.4.74
    User pi
    StrictHostKeyChecking no
    ConnectTimeout 5

Host lucidia
    HostName 192.168.4.38
    User pi
    StrictHostKeyChecking no
    ConnectTimeout 5

Host shellfish
    HostName 174.138.44.45
    User pi
    StrictHostKeyChecking no
    ConnectTimeout 5
EOF

echo "✅ SSH config updated!"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🎉 SSH Setup Complete!                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "You can now SSH to your Pis using just the hostname:"
echo "  ssh alice"
echo "  ssh aria"
echo "  ssh lucidia"
echo "  ssh octavia"
echo ""
echo "🚀 Start the dashboard server with: npm start"
echo ""
