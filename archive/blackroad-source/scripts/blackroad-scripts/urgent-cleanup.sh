#!/bin/bash
# Urgent cleanup for overfull Pi nodes

echo "🧹 BlackRoad Emergency Cleanup"
echo "=============================="
echo ""

# Check which node to clean
if [ "$1" == "" ]; then
    echo "Usage: ./urgent-cleanup.sh [octavia|alice|both]"
    echo ""
    echo "Current status:"
    echo "  octavia: 90% full (199GB/235GB) - CRITICAL"
    echo "  alice:   93% full (13GB/15GB) - CRITICAL"
    exit 1
fi

cleanup_node() {
    NODE=$1
    IP=$2
    KEY=$3
    
    echo "🔧 Cleaning $NODE ($IP)..."
    
    if [ "$KEY" != "" ]; then
        SSH_CMD="ssh -i $KEY pi@$IP"
    else
        SSH_CMD="ssh pi@$IP"
    fi
    
    echo "  → Removing unused Docker images..."
    $SSH_CMD "docker system prune -af --volumes" 2>/dev/null || echo "  ⚠️  Docker cleanup failed"
    
    echo "  → Cleaning apt cache..."
    $SSH_CMD "sudo apt clean && sudo apt autoremove -y" 2>/dev/null
    
    echo "  → Finding large files..."
    $SSH_CMD "sudo du -h / 2>/dev/null | sort -rh | head -10" || echo "  ⚠️  File scan failed"
    
    echo "  → Current disk usage:"
    $SSH_CMD "df -h / | tail -1"
    
    echo ""
}

if [ "$1" == "octavia" ] || [ "$1" == "both" ]; then
    cleanup_node "octavia" "192.168.4.38" "~/.ssh/br_mesh_ed25519"
fi

if [ "$1" == "alice" ] || [ "$1" == "both" ]; then
    cleanup_node "alice" "192.168.4.49" ""
fi

echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "  1. Check disk space: ssh pi@octavia 'df -h'"
echo "  2. If still full, investigate large files"
echo "  3. Consider adding NVMe storage to octavia"
