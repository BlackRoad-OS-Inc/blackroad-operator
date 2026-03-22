#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  LUCIDIA SSH SETUP SCRIPT
#  Purpose: Add Mac's public key to Lucidia's authorized_keys
#  Location: ~/blackroad-sandbox/setup-lucidia-ssh.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  LUCIDIA SSH KEY SETUP"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Your Mac's public key
MAC_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad"

# Lucidia connection info
LUCIDIA_LAN="192.168.4.38"
LUCIDIA_TAILSCALE="100.66.235.47"
LUCIDIA_USER="pi"

echo "📋 Your Mac's public key:"
echo "   $MAC_PUBKEY"
echo ""

# Function to add key via manual paste
add_key_manual() {
    echo "═══════════════════════════════════════════════════════════════"
    echo "  MANUAL SETUP REQUIRED"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "Since SSH isn't working yet, you need to run these commands"
    echo "on Lucidia directly (via keyboard/monitor or VNC):"
    echo ""
    echo "──────────────────────────────────────────────────────────────"
    cat << 'ENDSCRIPT'
# On Lucidia, run these commands as user 'pi':

mkdir -p $HOME/.ssh
chmod 700 $HOME/.ssh
touch $HOME/.ssh/authorized_keys
chmod 600 $HOME/.ssh/authorized_keys

# Add Mac's public key (all one line):
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIN1UUN4BImgy9WnJZ0A5JXr3DjyBAsCtOoKavf+DFmDg alexa@blackroad' >> $HOME/.ssh/authorized_keys

# Verify it was added:
tail -n 1 $HOME/.ssh/authorized_keys

# Make sure SSH is running:
sudo systemctl enable --now ssh
sudo systemctl restart ssh
ENDSCRIPT
    echo "──────────────────────────────────────────────────────────────"
    echo ""
    echo "After running those commands on Lucidia, press ENTER to test..."
    read -r
}

# Try to test connection first
echo "🔍 Testing connection to Lucidia..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 ${LUCIDIA_USER}@${LUCIDIA_LAN} "echo OK" 2>/dev/null; then
    echo "✅ Already connected! Key is already set up."
    echo ""
    ssh ${LUCIDIA_USER}@${LUCIDIA_LAN} "echo '   Lucidia says: SSH is working perfectly!'"
    exit 0
fi

echo "❌ Cannot connect yet (expected)"
echo ""

# Provide manual instructions
add_key_manual

# Test again after manual setup
echo ""
echo "🔍 Testing connection after setup..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 ${LUCIDIA_USER}@${LUCIDIA_LAN} "echo OK" 2>/dev/null; then
    echo "✅ SUCCESS! SSH connection established!"
    echo ""
    echo "Testing both LAN and Tailscale..."
    echo ""

    echo "📡 LAN connection ($LUCIDIA_LAN):"
    ssh ${LUCIDIA_USER}@${LUCIDIA_LAN} "hostname && uptime"
    echo ""

    echo "🌐 Tailscale connection ($LUCIDIA_TAILSCALE):"
    ssh ${LUCIDIA_USER}@${LUCIDIA_TAILSCALE} "hostname && uptime" 2>/dev/null || echo "   ⚠️  Tailscale not responding (check if it's running)"
    echo ""

    echo "═══════════════════════════════════════════════════════════════"
    echo "  ✅ SETUP COMPLETE"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "You can now connect with:"
    echo "   ssh pi@192.168.4.38          # LAN"
    echo "   ssh pi@100.66.235.47         # Tailscale"
    echo "   ssh lucidia                   # if you set up SSH config"
    echo ""
else
    echo "❌ Still cannot connect. Troubleshooting:"
    echo ""
    echo "1. Make sure you ran the commands on Lucidia as user 'pi'"
    echo "2. Verify SSH is running: sudo systemctl status ssh"
    echo "3. Check firewall: sudo ufw status"
    echo "4. Try password auth once: ssh pi@192.168.4.38"
    echo "5. Check /var/log/auth.log on Lucidia for errors"
    exit 1
fi
