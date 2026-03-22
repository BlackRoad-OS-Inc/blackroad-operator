#!/bin/bash
# Install and enable BlackRoad PatentNet Daily Anchor timer
# This ensures the patent anchoring system runs continuously (daily at 23:55 UTC)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SYSTEMD_DIR="$REPO_ROOT/systemd"

echo "=== BlackRoad PatentNet Daily Anchor Timer Installation ==="
echo ""

# Check if running with sudo for system-wide install or user install
if [ "$EUID" -eq 0 ]; then
    INSTALL_DIR="/etc/systemd/system"
    SYSTEMCTL_CMD="systemctl"
    INSTALL_TYPE="system-wide"
else
    INSTALL_DIR="$HOME/.config/systemd/user"
    SYSTEMCTL_CMD="systemctl --user"
    INSTALL_TYPE="user-level"
    mkdir -p "$INSTALL_DIR"
fi

echo "Installation type: $INSTALL_TYPE"
echo "Installing to: $INSTALL_DIR"
echo ""

# Copy service and timer files
echo "Installing systemd files..."
cp "$SYSTEMD_DIR/patent-anchor.service" "$INSTALL_DIR/"
cp "$SYSTEMD_DIR/patent-anchor.timer" "$INSTALL_DIR/"

# Reload systemd daemon
echo "Reloading systemd daemon..."
$SYSTEMCTL_CMD daemon-reload

# Enable and start the timer
echo "Enabling patent-anchor.timer..."
$SYSTEMCTL_CMD enable patent-anchor.timer

echo "Starting patent-anchor.timer..."
$SYSTEMCTL_CMD start patent-anchor.timer

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Timer status:"
$SYSTEMCTL_CMD list-timers --all | grep -E "(NEXT|patent-anchor)" || true
echo ""
echo "To check status: $SYSTEMCTL_CMD status patent-anchor.timer"
echo "To view logs: journalctl $([ "$EUID" -ne 0 ] && echo "--user") -u patent-anchor.service -f"
echo "To manually trigger: $SYSTEMCTL_CMD start patent-anchor.service"
echo ""
echo "The patent anchoring system will now run continuously at 23:55 UTC daily."
echo "If the system is down when a run is scheduled, it will catch up on next boot (Persistent=true)."
