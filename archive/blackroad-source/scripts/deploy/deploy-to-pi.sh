#!/bin/bash
# Deploy Cloudflare Workers to Pi fleet as Node.js services
# Usage: ./deploy-to-pi.sh [all|<worker-name>]

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
CYAN='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

EDGE_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNNER="$EDGE_DIR/worker-to-node.js"
REMOTE_BASE="/opt/blackroad/workers"

# Worker → port mapping (must not conflict with existing services)
declare -A WORKERS=(
  [roadpay]="$HOME/tollbooth:9001"
  [road-search]="$HOME/road-search:9002"
  [auth-blackroad]="$HOME/auth-blackroad:9003"
  [portal-blackroad]="$HOME/portal-blackroad:9004"
  [images-blackroad]="$HOME/images-blackroad:9005"
  [index-blackroad]="$HOME/index-blackroad:9006"
  [analytics-blackroad]="$HOME/analytics-blackroad:9007"
  [stats-blackroad]="$HOME/stats-blackroad:9008"
  [chat-blackroad]="$HOME/chat-blackroad:9009"
  [blackroad-services]="$HOME/blackroad-services:9010"
  [blackroad-slack]="$HOME/blackroad-slack-app:9011"
  [blackroad-stripe]="$HOME/blackroad-stripe:9012"
  [roadcode-squad]="$HOME/roadcode-squad:9013"
  [squad-webhook]="$HOME/squad-webhook:9014"
  [fleet-api]="$HOME/fleet-api:9015"
)

# Target node (default: Octavia — has NVMe + good CPU)
TARGET_USER="pi"
TARGET_HOST="192.168.4.101"
TARGET="${TARGET_USER}@${TARGET_HOST}"

log() { echo -e "${PINK}[edge-deploy]${RESET} $1"; }
ok() { echo -e "  ${GREEN}✓${RESET} $1"; }
err() { echo -e "  ${RED}✗${RESET} $1"; }

deploy_worker() {
  local name="$1"
  local spec="${WORKERS[$name]}"
  if [ -z "$spec" ]; then
    err "Unknown worker: $name"
    return 1
  fi

  local dir="${spec%%:*}"
  local port="${spec##*:}"

  if [ ! -d "$dir" ]; then
    err "Directory not found: $dir"
    return 1
  fi

  log "Deploying ${CYAN}$name${RESET} → ${TARGET}:${port}"

  # Create remote directory
  ssh -o ConnectTimeout=5 "$TARGET" "sudo mkdir -p $REMOTE_BASE/$name && sudo chown $TARGET_USER $REMOTE_BASE/$name" 2>/dev/null

  # Sync worker code (src/ + package.json + wrangler.toml only)
  rsync -az --delete \
    --include='src/***' \
    --include='package.json' \
    --include='wrangler.toml' \
    --include='migrations/***' \
    --exclude='*' \
    "$dir/" "${TARGET}:${REMOTE_BASE}/${name}/" 2>/dev/null
  ok "Code synced"

  # Sync the runner
  rsync -az "$RUNNER" "${TARGET}:${REMOTE_BASE}/worker-to-node.js" 2>/dev/null

  # Read env vars from wrangler.toml
  local env_args=""
  if [ -f "$dir/wrangler.toml" ]; then
    # Extract [vars] section
    local in_vars=false
    while IFS= read -r line; do
      if [[ "$line" =~ ^\[vars\] ]]; then
        in_vars=true
        continue
      fi
      if [[ "$line" =~ ^\[ ]] && [ "$in_vars" = true ]; then
        break
      fi
      if [ "$in_vars" = true ] && [[ "$line" =~ ^[A-Z] ]]; then
        local key=$(echo "$line" | cut -d= -f1 | tr -d ' ')
        local val=$(echo "$line" | cut -d= -f2- | tr -d ' "')
        env_args="$env_args --env ${key}=${val}"
      fi
    done < "$dir/wrangler.toml"
  fi

  # Create systemd service
  ssh "$TARGET" "cat > /tmp/br-worker-${name}.service << 'SVCEOF'
[Unit]
Description=BlackRoad Worker: ${name}
After=network.target

[Service]
Type=simple
User=${TARGET_USER}
WorkingDirectory=${REMOTE_BASE}/${name}
ExecStart=/usr/bin/node ${REMOTE_BASE}/worker-to-node.js ${REMOTE_BASE}/${name} ${port} ${env_args}
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SVCEOF
sudo mv /tmp/br-worker-${name}.service /etc/systemd/system/br-worker-${name}.service
sudo systemctl daemon-reload
sudo systemctl enable br-worker-${name}.service
sudo systemctl restart br-worker-${name}.service" 2>/dev/null
  ok "Service created and started on port $port"

  # Verify
  sleep 2
  local check=$(ssh "$TARGET" "curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}/ 2>/dev/null" 2>/dev/null)
  if [ "$check" = "200" ]; then
    ok "Health check passed (HTTP $check)"
  else
    err "Health check: HTTP $check"
  fi
}

case "${1:-}" in
  all)
    log "Deploying all ${#WORKERS[@]} workers to $TARGET"
    for name in "${!WORKERS[@]}"; do
      deploy_worker "$name"
      echo ""
    done
    log "Done. Update tunnel config to route to localhost:9001-9015"
    ;;
  "")
    echo "Usage: $0 [all|<worker-name>]"
    echo ""
    echo "Available workers:"
    for name in $(echo "${!WORKERS[@]}" | tr ' ' '\n' | sort); do
      local spec="${WORKERS[$name]}"
      echo "  $name → port ${spec##*:}"
    done
    ;;
  *)
    deploy_worker "$1"
    ;;
esac
