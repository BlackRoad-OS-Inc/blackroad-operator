#!/bin/bash
#===============================================================================
# DEPLOY BLACKROAD AGENTS TO RASPBERRY PI
# Syncs the agent system to your Pi fleet
#===============================================================================

set -e

AGENT_HOME="${HOME}/.blackroad-agents"

# Pi fleet - add your Pis here
declare -A PI_FLEET=(
    ["lucidia"]="192.168.4.38"
    ["alice"]="192.168.4.64"
    ["blackroad-pi"]="192.168.4.99"
)

PI_USER="${PI_USER:-pi}"

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║         DEPLOY BLACKROAD AGENTS TO PI FLEET                       ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

deploy_to_pi() {
    local name=$1
    local ip=$2

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Deploying to $name ($ip)..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check if Pi is reachable
    if ! ping -c 1 -W 2 "$ip" &>/dev/null; then
        echo "  ✗ $name is not reachable"
        return 1
    fi

    # Sync agent system (excluding models - too large)
    echo "  Syncing agent system..."
    rsync -avz --exclude 'models/*.gguf' \
        "$AGENT_HOME/" \
        "${PI_USER}@${ip}:~/.blackroad-agents/"

    # Run install on Pi
    echo "  Running install on Pi..."
    ssh "${PI_USER}@${ip}" "chmod +x ~/.blackroad-agents/install.sh && ~/.blackroad-agents/install.sh"

    echo "  ✓ $name deployed"
    echo ""
}

# Deploy to all Pis or specific one
if [[ -n "$1" ]]; then
    # Deploy to specific Pi
    if [[ -n "${PI_FLEET[$1]}" ]]; then
        deploy_to_pi "$1" "${PI_FLEET[$1]}"
    else
        echo "Unknown Pi: $1"
        echo "Available: ${!PI_FLEET[*]}"
        exit 1
    fi
else
    # Deploy to all
    for name in "${!PI_FLEET[@]}"; do
        deploy_to_pi "$name" "${PI_FLEET[$name]}" || true
    done
fi

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT COMPLETE                            ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Now download models on each Pi:"
echo "  ssh pi@<ip>"
echo "  wget -P ~/.blackroad-agents/models \\"
echo "    https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf"
