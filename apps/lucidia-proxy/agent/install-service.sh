#!/bin/bash
# Install Lucidia Agent as systemd service
# Run as root

set -euo pipefail

LUCIDIA_HOME="/home/blackroad/.lucidia"
SERVICE_FILE="/etc/systemd/system/lucidia-agent.service"

echo "Installing Lucidia Agent service..."

# Copy service file
cp "$LUCIDIA_HOME/agent/lucidia-agent.service" "$SERVICE_FILE"

# Make agent executable
chmod +x "$LUCIDIA_HOME/agent/lucidia-agent"

# Create agent directory for blackroad user
mkdir -p "$LUCIDIA_HOME/agent"
chown -R blackroad:blackroad "$LUCIDIA_HOME"

# Reload systemd
systemctl daemon-reload

# Enable service (start on boot)
systemctl enable lucidia-agent

# Start service
systemctl start lucidia-agent

echo "Lucidia Agent service installed and started."
echo ""
echo "Commands:"
echo "  systemctl status lucidia-agent   # Check status"
echo "  systemctl restart lucidia-agent  # Restart"
echo "  journalctl -u lucidia-agent -f   # View logs"
