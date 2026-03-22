#!/bin/bash
# BlackRoad Agent Orchestrator CLI
# Usage: br agent-orchestrator <command>

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

CONTROLLER_URL="${BLACKROAD_ORCHESTRATOR_URL:-http://localhost:8100}"
ORCHESTRATOR_DIR="$HOME/blackroad-operator/agents/orchestrator"

log() { echo -e "${PINK}[ORCHESTRATOR]${RESET} $1"; }

cmd_status() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║  BLACKROAD 30K AGENT ORCHESTRATOR                       ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""

    # Try controller API first
    health=$(curl -s "$CONTROLLER_URL/api/health" 2>/dev/null)
    if [ -n "$health" ]; then
        echo -e "  ${GREEN}Controller:${RESET} ONLINE ($CONTROLLER_URL)"
        cluster=$(curl -s "$CONTROLLER_URL/api/cluster" 2>/dev/null)
        echo "$cluster" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'  Nodes:      {d[\"healthy_nodes\"]}/{d[\"total_nodes\"]} healthy')
print(f'  Agents:     {d[\"total_agents_registered\"]:,} registered, {d[\"total_agents_active\"]:,} active')
print(f'  Tasks:      {d[\"total_pending\"]} pending')
print(f'  Inference:  {d[\"total_inference_queue\"]} queued')
" 2>/dev/null
        echo ""
        echo -e "  ${CYAN}Nodes:${RESET}"
        curl -s "$CONTROLLER_URL/api/nodes" 2>/dev/null | python3 -c "
import sys,json
for n in json.load(sys.stdin):
    status = '🟢' if n['healthy'] else '🔴'
    print(f\"    {status} {n['node']:10s} {n['host']:15s} active={n['active_agents']:<5} idle={n['idle_agents']:<6} max={n['max_concurrent']}\")
" 2>/dev/null
        echo ""
        echo -e "  ${CYAN}Available by archetype:${RESET}"
        curl -s "$CONTROLLER_URL/api/pools/available" 2>/dev/null | python3 -c "
import sys,json
for k,v in sorted(json.load(sys.stdin).items(), key=lambda x: -x[1]):
    bar = '█' * min(40, v // 250) + '░' * max(0, 40 - v // 250)
    print(f'    {k:15s} {v:>6,}  {bar}')
" 2>/dev/null
    else
        echo -e "  ${YELLOW}Controller:${RESET} OFFLINE"
        # Fallback to local DB
        cd "$HOME/blackroad-operator/agents" && PYTHONPATH=. python3 -m orchestrator status 2>/dev/null
    fi
}

cmd_submit() {
    local prompt="$1"
    local archetype="${2:-worker}"
    local priority="${3:-5}"

    if [ -z "$prompt" ]; then
        echo "Usage: br agent-orchestrator submit \"<prompt>\" [archetype] [priority]"
        echo "Archetypes: worker, researcher, coder, monitor, creative, security, analyst, coordinator"
        exit 1
    fi

    result=$(curl -s -X POST "$CONTROLLER_URL/api/tasks" \
        -H 'Content-Type: application/json' \
        -d "{\"prompt\":$(python3 -c "import json;print(json.dumps('$prompt'))"),\"archetype\":\"$archetype\",\"priority\":$priority}")

    task_id=$(echo "$result" | python3 -c "import sys,json;print(json.load(sys.stdin)['task_id'])" 2>/dev/null)
    echo -e "${GREEN}Task submitted:${RESET} $task_id (archetype=$archetype)"
    echo -e "  Check: br agent-orchestrator result $task_id"
}

cmd_result() {
    local task_id="$1"
    if [ -z "$task_id" ]; then
        echo "Usage: br agent-orchestrator result <task_id>"
        exit 1
    fi

    curl -s "$CONTROLLER_URL/api/tasks/$task_id" | python3 -m json.tool
}

cmd_tasks() {
    curl -s "$CONTROLLER_URL/api/tasks?limit=${1:-20}" | python3 -c "
import sys,json
tasks = json.load(sys.stdin)
print(f'Recent tasks ({len(tasks)}):')
for t in tasks:
    status_icon = {'completed':'✅','failed':'❌','pending':'⏳'}.get(t['status'],'❓')
    latency = f\"{t.get('latency_ms',0)}ms\" if t.get('latency_ms') else '-'
    print(f\"  {status_icon} {t['task_id']}  {t.get('archetype','?'):12s}  {t['status']:10s}  {latency:>8s}  {(t.get('agent_id') or '-'):20s}\")
" 2>/dev/null
}

cmd_start() {
    log "Starting controller..."
    cd "$HOME/blackroad-operator/agents" && PYTHONPATH=. python3 -m orchestrator controller > /tmp/blackroad-orchestrator.log 2>&1 &
    echo $! > /tmp/blackroad-orchestrator.pid
    sleep 2
    curl -s "$CONTROLLER_URL/api/health" > /dev/null 2>&1 && echo -e "${GREEN}  ✓ Controller started${RESET} (PID $(cat /tmp/blackroad-orchestrator.pid))" || echo -e "${YELLOW}  ⚠ Controller may still be starting${RESET}"
}

cmd_stop() {
    if [ -f /tmp/blackroad-orchestrator.pid ]; then
        kill $(cat /tmp/blackroad-orchestrator.pid) 2>/dev/null
        rm /tmp/blackroad-orchestrator.pid
        echo -e "${GREEN}  ✓ Controller stopped${RESET}"
    else
        pkill -f "orchestrator controller" 2>/dev/null && echo -e "${GREEN}  ✓ Controller stopped${RESET}" || echo "Not running"
    fi
}

cmd_deploy() {
    bash "$ORCHESTRATOR_DIR/deploy.sh" "${1:-all}"
}

show_help() {
    echo -e "${PINK}BlackRoad Agent Orchestrator${RESET} — 30,000 agent management"
    echo ""
    echo "Commands:"
    echo "  status                       Cluster status + node health"
    echo "  submit \"<prompt>\" [arch]      Submit a task"
    echo "  result <task_id>             Get task result"
    echo "  tasks [limit]                List recent tasks"
    echo "  start                        Start controller"
    echo "  stop                         Stop controller"
    echo "  deploy [controller|supervisor|all]  Deploy to fleet"
    echo ""
    echo "Archetypes: worker, researcher, coder, monitor, creative, security, analyst, coordinator"
}

case "${1:-status}" in
    status)  cmd_status ;;
    submit)  cmd_submit "$2" "$3" "$4" ;;
    result)  cmd_result "$2" ;;
    tasks)   cmd_tasks "$2" ;;
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    deploy)  cmd_deploy "$2" ;;
    help|-h) show_help ;;
    *)       show_help ;;
esac
