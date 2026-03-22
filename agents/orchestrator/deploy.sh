#!/bin/bash
# Deploy BlackRoad Agent Orchestrator to fleet
# Usage: ./deploy.sh [controller|supervisor|all]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

ORCHESTRATOR_DIR="$(cd "$(dirname "$0")" && pwd)"
REMOTE_DIR="/opt/blackroad/orchestrator"

# Node definitions
declare -A NODES=(
    [cecilia]="blackroad@192.168.4.96"
    [aria]="blackroad@192.168.4.98"
    [lucidia]="pi@192.168.4.38"
)

log() { echo -e "${PINK}[ORCHESTRATOR]${RESET} $1"; }
ok() { echo -e "${GREEN}  ✓${RESET} $1"; }

deploy_to_node() {
    local node="$1"
    local ssh_target="${NODES[$node]}"

    log "Deploying supervisor to ${BLUE}${node}${RESET} (${ssh_target})"

    # Create remote directory
    ssh -o ConnectTimeout=5 "$ssh_target" "sudo mkdir -p $REMOTE_DIR && sudo chown \$(whoami) $REMOTE_DIR" 2>/dev/null

    # Sync orchestrator code
    rsync -az --delete \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        "$ORCHESTRATOR_DIR/" "${ssh_target}:${REMOTE_DIR}/"
    ok "Code synced"

    # Install dependencies
    ssh "$ssh_target" "cd $REMOTE_DIR && pip3 install -q -r requirements.txt 2>/dev/null || pip install -q -r requirements.txt" 2>/dev/null
    ok "Dependencies installed"

    # Also sync spawn.db (agents need it)
    rsync -az "$ORCHESTRATOR_DIR/../spawn.db" "${ssh_target}:${REMOTE_DIR}/../spawn.db" 2>/dev/null || true

    # Create systemd service
    ssh "$ssh_target" "cat > /tmp/blackroad-supervisor.service << 'EOF'
[Unit]
Description=BlackRoad Agent Supervisor (${node})
After=network.target

[Service]
Type=simple
User=$(ssh "$ssh_target" whoami)
WorkingDirectory=${REMOTE_DIR}/..
ExecStart=/usr/bin/python3 -m orchestrator supervisor ${node}
Restart=always
RestartSec=5
Environment=PYTHONPATH=${REMOTE_DIR}/..

[Install]
WantedBy=multi-user.target
EOF
sudo mv /tmp/blackroad-supervisor.service /etc/systemd/system/blackroad-supervisor.service
sudo systemctl daemon-reload
sudo systemctl enable blackroad-supervisor.service" 2>/dev/null
    ok "Systemd service created"

    log "${node} ready. Start with: ssh ${ssh_target} 'sudo systemctl start blackroad-supervisor'"
}

deploy_controller() {
    log "Setting up controller on local machine (Alexandria)"

    # Install deps locally
    pip3 install -q -r "$ORCHESTRATOR_DIR/requirements.txt" 2>/dev/null
    ok "Dependencies installed locally"

    # Create launchd plist for macOS
    cat > ~/Library/LaunchAgents/io.blackroad.orchestrator.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.blackroad.orchestrator</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>-m</string>
        <string>orchestrator</string>
        <string>controller</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${ORCHESTRATOR_DIR}/..</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PYTHONPATH</key>
        <string>${ORCHESTRATOR_DIR}/..</string>
    </dict>
    <key>KeepAlive</key>
    <true/>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/blackroad-orchestrator.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/blackroad-orchestrator.err</string>
</dict>
</plist>
EOF
    ok "launchd plist created"
    log "Start with: launchctl load ~/Library/LaunchAgents/io.blackroad.orchestrator.plist"
}

case "${1:-all}" in
    controller)
        deploy_controller
        ;;
    supervisor)
        for node in cecilia aria lucidia; do
            deploy_to_node "$node"
        done
        ;;
    all)
        deploy_controller
        for node in cecilia aria lucidia; do
            deploy_to_node "$node"
        done
        log "Full deployment complete."
        echo ""
        echo "  Start controller:  launchctl load ~/Library/LaunchAgents/io.blackroad.orchestrator.plist"
        echo "  Start supervisors: ssh blackroad@192.168.4.96 'sudo systemctl start blackroad-supervisor'"
        echo "                     ssh blackroad@192.168.4.98 'sudo systemctl start blackroad-supervisor'"
        echo "                     ssh pi@192.168.4.38 'sudo systemctl start blackroad-supervisor'"
        echo ""
        echo "  API: http://localhost:8100/api/health"
        echo "  Submit task: curl -X POST http://localhost:8100/api/tasks -H 'Content-Type: application/json' -d '{\"prompt\":\"Hello\",\"archetype\":\"worker\"}'"
        ;;
    *)
        echo "Usage: $0 [controller|supervisor|all]"
        exit 1
        ;;
esac
