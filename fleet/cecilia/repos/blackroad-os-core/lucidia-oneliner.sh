#!/bin/bash
# Run this entire script on Lucidia as user 'pi'
# Copy and paste the whole thing into your Termius/SSH session

set -e

echo "════════════════════════════════════════════════════════════════"
echo "  Adding Mac SSH Key to Lucidia"
echo "  $(date)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Create SSH directory if needed
mkdir -p $HOME/.ssh
chmod 700 $HOME/.ssh
touch $HOME/.ssh/authorized_keys
chmod 600 $HOME/.ssh/authorized_keys

# Add your Mac's primary SSH key
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHJWIHlfOkBRPJjirPmhjckW2Rtz+X/Ss4norgWg/sBO alexa@blackroad' >> $HOME/.ssh/authorized_keys

echo "✅ Key added to authorized_keys"
echo ""
echo "Last 3 keys in authorized_keys:"
echo "────────────────────────────────────────────────────────────────"
tail -n 3 $HOME/.ssh/authorized_keys
echo "────────────────────────────────────────────────────────────────"
echo ""

# Check permissions
echo "📁 Checking permissions..."
ls -la $HOME/.ssh/authorized_keys
echo ""

# Ensure SSH is running
echo "🔄 Restarting SSH service..."
sudo systemctl enable ssh
sudo systemctl restart ssh
sudo systemctl status ssh --no-pager | head -5
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  ✅ SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Now test from your Mac with:"
echo ""
echo "   ssh pi@192.168.4.38"
echo ""
echo "Or:"
echo ""
echo "   ssh lucidia"
echo ""
echo "════════════════════════════════════════════════════════════════"
