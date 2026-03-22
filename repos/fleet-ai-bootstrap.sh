#!/bin/bash
# fleet-ai-bootstrap.sh — Pre-warm Ollama fleet, pin models in VRAM, zero cold starts
# Usage: ./fleet-ai-bootstrap.sh [--warm|--status|--fix]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
DIM='\033[2m'
RESET='\033[0m'

# ── Fleet nodes ──
declare -A NODES=(
  [cecilia]="blackroad@192.168.4.96"
  [lucidia]="octavia@192.168.4.38"
  [alice]="pi@192.168.4.49"
  [octavia]="pi@192.168.4.100"
)

# ── Models to pre-warm per node (fastest first) ──
# keep_alive=-1 means forever until restart
declare -A WARM_MODELS=(
  [cecilia]="llama3.2:3b tinyllama:latest qwen2.5-coder:3b deepseek-coder:1.3b cece:latest"
  [lucidia]="tinyllama:latest qwen2.5:3b llama3.2:1b"
  [alice]="tinyllama:latest llama3.2:1b"
)

SSH_OPTS="-o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes"

header() {
  echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${PINK}  ◆ BlackRoad Fleet AI Bootstrap${RESET}"
  echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

log() { echo -e "  ${BLUE}→${RESET} $1"; }
ok()  { echo -e "  ${GREEN}✓${RESET} $1"; }
warn(){ echo -e "  ${AMBER}⚠${RESET} $1"; }
err() { echo -e "  ${RED}✗${RESET} $1"; }

# ── Check if node is reachable ──
node_alive() {
  local host="${NODES[$1]}"
  ssh $SSH_OPTS "$host" "echo ok" &>/dev/null
}

# ── Get Ollama status on a node ──
node_ollama_status() {
  local name="$1"
  local host="${NODES[$name]}"

  echo -e "\n  ${VIOLET}[$name]${RESET} ${DIM}${host}${RESET}"

  if ! node_alive "$name"; then
    err "$name — unreachable"
    return 1
  fi
  ok "$name — online"

  # Check Ollama service
  local status
  status=$(ssh $SSH_OPTS "$host" "systemctl is-active ollama 2>/dev/null || echo dead")
  if [ "$status" != "active" ]; then
    err "ollama service: $status"
    return 1
  fi
  ok "ollama service: active"

  # Check loaded models
  local loaded
  loaded=$(ssh $SSH_OPTS "$host" "curl -s localhost:11434/api/ps 2>/dev/null" || echo '{}')
  local loaded_names
  loaded_names=$(echo "$loaded" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  for m in d.get('models',[]):
    print(m['name'])
except: pass
" 2>/dev/null)

  if [ -n "$loaded_names" ]; then
    ok "loaded in VRAM:"
    echo "$loaded_names" | while read -r m; do
      echo -e "    ${GREEN}●${RESET} $m"
    done
  else
    warn "no models in VRAM"
  fi

  # Check available memory
  local mem
  mem=$(ssh $SSH_OPTS "$host" "free -h | awk '/Mem:/{print \$4}'" 2>/dev/null)
  log "available RAM: ${mem:-unknown}"

  # Model count
  local count
  count=$(ssh $SSH_OPTS "$host" "curl -s localhost:11434/api/tags 2>/dev/null | python3 -c 'import sys,json;print(len(json.load(sys.stdin).get(\"models\",[])))'  2>/dev/null" || echo "?")
  log "models installed: $count"
}

# ── Pre-warm models on a node ──
node_warm() {
  local name="$1"
  local host="${NODES[$name]}"
  local models="${WARM_MODELS[$name]}"

  if [ -z "$models" ]; then
    log "no warm targets for $name"
    return
  fi

  echo -e "\n  ${VIOLET}[$name]${RESET} warming models..."

  if ! node_alive "$name"; then
    err "$name — unreachable, skipping"
    return
  fi

  # Check Ollama is running
  local status
  status=$(ssh $SSH_OPTS "$host" "systemctl is-active ollama 2>/dev/null || echo dead")
  if [ "$status" != "active" ]; then
    err "$name ollama not running ($status)"
    return
  fi

  for model in $models; do
    log "loading $model (keep_alive=-1)..."
    # Send a minimal generate request with keep_alive=-1 to pin model
    local result
    result=$(ssh $SSH_OPTS "$host" "curl -s -X POST localhost:11434/api/generate \
      -d '{\"model\":\"$model\",\"prompt\":\"hi\",\"keep_alive\":-1,\"options\":{\"num_predict\":1}}' \
      --max-time 120 2>&1 | tail -1" 2>/dev/null)

    if echo "$result" | grep -q '"done":true\|"done_reason"'; then
      ok "$model — loaded and pinned"
    else
      warn "$model — may have failed: $(echo "$result" | head -c 80)"
    fi
  done
}

# ── Fix Ollama on a node ──
node_fix() {
  local name="$1"
  local host="${NODES[$name]}"

  echo -e "\n  ${VIOLET}[$name]${RESET} fixing Ollama..."

  if ! node_alive "$name"; then
    err "$name — unreachable"
    return
  fi

  # Check if ollama binary exists
  local has_bin
  has_bin=$(ssh $SSH_OPTS "$host" "test -x /usr/local/bin/ollama && echo yes || echo no")

  if [ "$has_bin" = "no" ]; then
    log "ollama binary missing — installing..."
    ssh $SSH_OPTS "$host" "curl -fsSL https://ollama.com/install.sh | sudo sh" 2>&1 | tail -3
    ok "ollama installed"
  fi

  # Ensure service is enabled and running
  ssh $SSH_OPTS "$host" "sudo systemctl enable ollama && sudo systemctl restart ollama" 2>/dev/null
  sleep 2

  local status
  status=$(ssh $SSH_OPTS "$host" "systemctl is-active ollama 2>/dev/null || echo dead")
  if [ "$status" = "active" ]; then
    ok "ollama running on $name"
  else
    err "ollama still not running on $name"
  fi
}

# ── Configure Ollama for max speed ──
node_optimize() {
  local name="$1"
  local host="${NODES[$name]}"

  echo -e "\n  ${VIOLET}[$name]${RESET} optimizing Ollama config..."

  if ! node_alive "$name"; then
    err "$name — unreachable"
    return
  fi

  # Set environment variables for speed
  # OLLAMA_NUM_PARALLEL=2 — handle 2 concurrent requests
  # OLLAMA_KEEP_ALIVE=-1 — default keep forever
  # OLLAMA_MAX_LOADED_MODELS=3 — keep up to 3 models hot
  # OLLAMA_FLASH_ATTENTION=1 — faster attention
  ssh $SSH_OPTS "$host" "sudo mkdir -p /etc/systemd/system/ollama.service.d && \
    sudo tee /etc/systemd/system/ollama.service.d/speed.conf > /dev/null << 'UNIT'
[Service]
Environment=\"OLLAMA_KEEP_ALIVE=-1\"
Environment=\"OLLAMA_NUM_PARALLEL=2\"
Environment=\"OLLAMA_MAX_LOADED_MODELS=3\"
Environment=\"OLLAMA_FLASH_ATTENTION=1\"
UNIT
  sudo systemctl daemon-reload && sudo systemctl restart ollama" 2>/dev/null

  sleep 2
  local status
  status=$(ssh $SSH_OPTS "$host" "systemctl is-active ollama 2>/dev/null || echo dead")
  if [ "$status" = "active" ]; then
    ok "$name — optimized (keep_alive=-1, flash_attention, parallel=2, max_loaded=3)"
  else
    err "$name — ollama failed to restart after config"
  fi
}

# ── Deploy Ollama bridge config for chat.blackroad.io routing ──
deploy_chat_config() {
  echo -e "\n  ${PINK}Deploying chat fleet config...${RESET}"

  # Write fleet endpoint map that chat worker can use
  cat > /tmp/fleet-models.json << 'JSON'
{
  "endpoints": {
    "cecilia": "https://ollama.blackroad.io",
    "lucidia": "https://ai.blackroad.io"
  },
  "routing": {
    "qwen3:8b": "cecilia",
    "qwen2.5-coder:3b": "cecilia",
    "codellama:7b": "cecilia",
    "deepseek-coder:1.3b": "cecilia",
    "llama3:8b-instruct-q4_K_M": "cecilia",
    "llama3.2:3b": "cecilia",
    "deepseek-r1:1.5b": "cecilia",
    "cece:latest": "cecilia",
    "cece2:latest": "cecilia",
    "tinyllama:latest": "cecilia",
    "lucidia:latest": "lucidia",
    "qwen2.5:3b": "lucidia",
    "qwen2.5:1.5b": "lucidia"
  },
  "defaults": {
    "fast": "llama3.2:3b",
    "code": "qwen2.5-coder:3b",
    "instant": "tinyllama:latest",
    "reasoning": "qwen3:8b",
    "custom": "cece:latest"
  }
}
JSON
  ok "fleet model routing map: /tmp/fleet-models.json"
}

# ── Main ──
header

case "${1:---warm}" in
  --status)
    echo -e "${AMBER}Fleet AI Status${RESET}"
    for node in cecilia lucidia alice octavia; do
      node_ollama_status "$node" || true
    done
    ;;

  --fix)
    echo -e "${AMBER}Fixing Ollama on all nodes${RESET}"
    for node in cecilia lucidia alice; do
      node_fix "$node" || true
    done
    ;;

  --optimize)
    echo -e "${AMBER}Optimizing Ollama speed config${RESET}"
    for node in cecilia lucidia; do
      node_optimize "$node" || true
    done
    ;;

  --warm)
    echo -e "${AMBER}Optimizing + Warming Fleet${RESET}"

    # Step 1: Optimize Ollama config on working nodes
    for node in cecilia lucidia; do
      node_optimize "$node" || true
    done

    # Step 2: Pre-warm models
    for node in cecilia lucidia; do
      node_warm "$node" || true
    done

    # Step 3: Deploy routing config
    deploy_chat_config

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}  Fleet warmed. Models pinned. Zero cold starts.${RESET}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
    ;;

  --all)
    echo -e "${AMBER}Full bootstrap: fix → optimize → warm${RESET}"

    # Fix broken nodes first
    for node in cecilia lucidia alice; do
      node_fix "$node" || true
    done

    # Optimize
    for node in cecilia lucidia alice; do
      node_optimize "$node" || true
    done

    # Warm
    for node in cecilia lucidia alice; do
      node_warm "$node" || true
    done

    deploy_chat_config

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}  Full fleet bootstrap complete.${RESET}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
    ;;

  *)
    echo "Usage: $0 [--status|--warm|--fix|--optimize|--all]"
    echo ""
    echo "  --status    Check Ollama status on all nodes"
    echo "  --warm      Optimize config + pre-load models into VRAM (default)"
    echo "  --fix       Reinstall Ollama where broken"
    echo "  --optimize  Push speed config (keep_alive, flash_attention)"
    echo "  --all       Fix + optimize + warm everything"
    ;;
esac
