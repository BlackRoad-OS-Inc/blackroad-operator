#!/bin/bash
# BlackRoad OS - Raspberry Pi Deployment Script
# Deploys blackroad-os-core to your Pi fleet

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PI_USER="${PI_USER:-pi}"
REMOTE_DIR="${REMOTE_DIR:-/home/$PI_USER/blackroad}"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Pi fleet from CLAUDE.md
declare -A PI_FLEET=(
    ["lucidia"]="192.168.4.38"
    ["blackroad-pi"]="192.168.4.64"
    ["lucidia-alt"]="192.168.4.99"
)

# Pi roles
declare -A PI_ROLES=(
    ["lucidia"]="primary-breath-engine"
    ["blackroad-pi"]="agent-runner"
    ["lucidia-alt"]="backup-breath-engine"
)

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  BlackRoad OS - Pi Fleet Deployment   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
TARGET_PI="${1:-all}"
FORCE="${2}"

# Function to deploy to a single Pi
deploy_to_pi() {
    local pi_name=$1
    local pi_ip=$2
    local pi_role=$3

    echo -e "${BLUE}┌─────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│ Deploying to: ${pi_name} (${pi_ip})${NC}"
    echo -e "${BLUE}│ Role: ${pi_role}${NC}"
    echo -e "${BLUE}└─────────────────────────────────────┘${NC}"

    # Check connectivity
    if ! ping -c 1 -W 2 "${pi_ip}" > /dev/null 2>&1; then
        echo -e "${RED}✗ ${pi_name} not reachable at ${pi_ip}${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ ${pi_name} is reachable${NC}"

    # Check SSH access
    if ! ssh -o ConnectTimeout=5 "${PI_USER}@${pi_ip}" "echo ''" > /dev/null 2>&1; then
        echo -e "${RED}✗ Cannot SSH to ${pi_name}${NC}"
        echo -e "${YELLOW}  Run: ssh-copy-id ${PI_USER}@${pi_ip}${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ SSH access verified${NC}"

    # Create remote directory
    ssh "${PI_USER}@${pi_ip}" "mkdir -p ${REMOTE_DIR}"

    # Sync source code
    echo -e "${BLUE}→ Syncing source code...${NC}"
    rsync -avz --delete \
        --exclude 'venv/' \
        --exclude 'node_modules/' \
        --exclude '.git/' \
        --exclude '__pycache__/' \
        --exclude '*.pyc' \
        --exclude '.next/' \
        --exclude 'dist/' \
        --exclude 'build/' \
        --exclude '.turbo/' \
        "${SOURCE_DIR}/src/blackroad_core/" \
        "${PI_USER}@${pi_ip}:${REMOTE_DIR}/blackroad_core/"

    # Copy setup files
    rsync -avz \
        "${SOURCE_DIR}/setup.py" \
        "${SOURCE_DIR}/README.md" \
        "${SOURCE_DIR}/examples/" \
        "${PI_USER}@${pi_ip}:${REMOTE_DIR}/"

    echo -e "${GREEN}✓ Code synced${NC}"

    # Install on Pi
    echo -e "${BLUE}→ Installing on ${pi_name}...${NC}"
    ssh "${PI_USER}@${pi_ip}" "bash -s" << 'REMOTE_SCRIPT'
set -e

# Navigate to project
cd ~/blackroad

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
if (( $(echo "$PYTHON_VERSION < 3.10" | bc -l) )); then
    echo "ERROR: Python 3.10+ required, found $PYTHON_VERSION"
    exit 1
fi

# Create venv if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and install
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip > /dev/null 2>&1

# Install dependencies
echo "Installing dependencies..."
pip install -q pydantic pyyaml requests

# Install package in editable mode
echo "Installing blackroad-os-core..."
cat > setup.py << 'SETUP_PY'
from setuptools import setup, find_packages

setup(
    name="blackroad-os-core",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pydantic>=2.8.2",
        "pyyaml>=6.0.2",
        "requests>=2.32.3",
    ],
)
SETUP_PY

pip install -q -e .

# Verify installation
python3 -c "import blackroad_core; print('✓ blackroad_core v' + blackroad_core.__version__)"

echo "✓ Installation complete"
REMOTE_SCRIPT

    echo -e "${GREEN}✓ ${pi_name} deployed successfully${NC}"

    # Set up systemd service based on role
    case "$pi_role" in
        "primary-breath-engine")
            setup_breath_engine "$pi_ip" "$pi_name"
            ;;
        "agent-runner")
            setup_agent_runner "$pi_ip" "$pi_name"
            ;;
        "backup-breath-engine")
            setup_backup_engine "$pi_ip" "$pi_name"
            ;;
    esac

    echo ""
    return 0
}

# Setup breath engine service
setup_breath_engine() {
    local pi_ip=$1
    local pi_name=$2

    echo -e "${BLUE}→ Setting up Lucidia breath engine service...${NC}"

    ssh "${PI_USER}@${pi_ip}" "sudo tee /etc/systemd/system/blackroad-lucidia.service > /dev/null" << 'SERVICE'
[Unit]
Description=BlackRoad Lucidia Breath Engine
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad
Environment="PATH=/home/pi/blackroad/venv/bin"
ExecStart=/home/pi/blackroad/venv/bin/python3 -m blackroad_core.lucidia
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

    ssh "${PI_USER}@${pi_ip}" "sudo systemctl daemon-reload"
    ssh "${PI_USER}@${pi_ip}" "sudo systemctl enable blackroad-lucidia.service"

    echo -e "${GREEN}✓ Lucidia service configured${NC}"
}

# Setup agent runner service
setup_agent_runner() {
    local pi_ip=$1
    local pi_name=$2

    echo -e "${BLUE}→ Setting up agent runner service...${NC}"

    ssh "${PI_USER}@${pi_ip}" "sudo tee /etc/systemd/system/blackroad-agent.service > /dev/null" << 'SERVICE'
[Unit]
Description=BlackRoad Agent Runner
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad
Environment="PATH=/home/pi/blackroad/venv/bin"
ExecStart=/home/pi/blackroad/venv/bin/python3 -m blackroad_core.spawner
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

    ssh "${PI_USER}@${pi_ip}" "sudo systemctl daemon-reload"
    ssh "${PI_USER}@${pi_ip}" "sudo systemctl enable blackroad-agent.service"

    echo -e "${GREEN}✓ Agent runner service configured${NC}"
}

# Setup backup engine
setup_backup_engine() {
    local pi_ip=$1
    local pi_name=$2

    echo -e "${BLUE}→ Setting up backup breath engine...${NC}"
    setup_breath_engine "$pi_ip" "$pi_name"
}

# Main deployment logic
if [ "$TARGET_PI" == "all" ]; then
    echo -e "${YELLOW}Deploying to all Pis in fleet...${NC}"
    echo ""

    SUCCESS_COUNT=0
    FAIL_COUNT=0

    for pi_name in "${!PI_FLEET[@]}"; do
        pi_ip="${PI_FLEET[$pi_name]}"
        pi_role="${PI_ROLES[$pi_name]}"

        if deploy_to_pi "$pi_name" "$pi_ip" "$pi_role"; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
        fi
    done

    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         Deployment Summary             ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ ${GREEN}Successful: ${SUCCESS_COUNT}${BLUE}                         ║${NC}"
    echo -e "${BLUE}║ ${RED}Failed: ${FAIL_COUNT}${BLUE}                             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

else
    # Deploy to specific Pi
    if [ -n "${PI_FLEET[$TARGET_PI]}" ]; then
        pi_ip="${PI_FLEET[$TARGET_PI]}"
        pi_role="${PI_ROLES[$TARGET_PI]}"
        deploy_to_pi "$TARGET_PI" "$pi_ip" "$pi_role"
    else
        echo -e "${RED}Unknown Pi: ${TARGET_PI}${NC}"
        echo "Available Pis: ${!PI_FLEET[@]}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Check health: ./pi-deploy/check-pi-health.sh"
echo "  2. Start services: ssh pi@<ip> 'sudo systemctl start blackroad-lucidia'"
echo "  3. Monitor: ./pi-deploy/monitor-pis.sh"
echo ""
