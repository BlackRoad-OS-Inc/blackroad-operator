#!/usr/bin/env zsh
# BR Agents Status — Live agent fleet status
# Shows all registered agents, their status, node assignment, and capabilities
#
# Usage: br agents status [--json]

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[0;31m'
CYAN='\033[38;5;69m'
VIOLET='\033[38;5;135m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

JSON_MODE=false
[[ "$1" == "--json" || "$2" == "--json" ]] && JSON_MODE=true

# ── Gather Agent Data ────────────────────────────────────

# CarPool agents
CARPOOL_DIR="$HOME/blackroad-operator/carpool"
AGENTS_DIR="$HOME/blackroad-operator/agents"
REGISTRY="$AGENTS_DIR/registry.json"

# Count agents by type
core_count=0; worker_count=0; hardware_count=0; total=0
if [[ -d "$CARPOOL_DIR" ]]; then
    for f in "$CARPOOL_DIR"/**/*.json(N); do
        (( total++ ))
        case "$f" in
            *worker*) (( worker_count++ )) ;;
            *pi*|*hardware*) (( hardware_count++ )) ;;
            *) (( core_count++ )) ;;
        esac
    done
fi

# Active agents from registry
active_agents=()
if [[ -f "$REGISTRY" ]]; then
    while IFS= read -r agent; do
        active_agents+=("$agent")
    done < <(python3 -c "
import json
with open('$REGISTRY') as f:
    data = json.load(f)
for name, info in data.items():
    status = info.get('status', 'idle')
    model = info.get('model', 'unknown')
    role = info.get('role', '')
    print(f'{name}|{status}|{model}|{role}')
" 2>/dev/null)
fi

# Fleet node status
declare -A NODE_STATUS NODE_OLLAMA
NODES=("Alice:pi@192.168.4.49" "Cecilia:blackroad@192.168.4.96" "Octavia:pi@192.168.4.101" "Aria:blackroad@192.168.4.98" "Lucidia:octavia@192.168.4.38")

for entry in "${NODES[@]}"; do
    IFS=':' read -r name ssh_target <<< "$entry"
    if ssh -o ConnectTimeout=2 -o BatchMode=yes "$ssh_target" "echo ok" &>/dev/null; then
        NODE_STATUS[$name]="online"
        # Check Ollama
        models=$(ssh -o ConnectTimeout=2 "$ssh_target" "curl -s localhost:11434/api/tags 2>/dev/null | python3 -c 'import sys,json; print(len(json.load(sys.stdin).get(\"models\",[])))' 2>/dev/null" 2>/dev/null || echo "0")
        NODE_OLLAMA[$name]="$models"
    else
        NODE_STATUS[$name]="offline"
        NODE_OLLAMA[$name]="0"
    fi
done

# AI Skills count
skills_count=$(python3 -c "
import sys; sys.path.insert(0, '$HOME/blackroad-operator/orgs/core/blackroad-cli/bots/skills')
import frontier_skill; print(len(frontier_skill.list_skills()))
" 2>/dev/null || echo "0")

# ── JSON Output ──────────────────────────────────────────

if $JSON_MODE; then
    python3 -c "
import json
agents = []
for line in '''$(printf '%s\n' "${active_agents[@]}")'''.strip().split('\n'):
    if '|' in line:
        parts = line.split('|')
        agents.append({'name': parts[0], 'status': parts[1], 'model': parts[2], 'role': parts[3]})

nodes = {}
$(for entry in "${NODES[@]}"; do
    IFS=':' read -r name ssh_target <<< "$entry"
    echo "nodes['$name'] = {'status': '${NODE_STATUS[$name]:-unknown}', 'ollama_models': ${NODE_OLLAMA[$name]:-0}}"
done)

print(json.dumps({
    'agents': agents,
    'total_registered': $total,
    'core': $core_count,
    'workers': $worker_count,
    'hardware': $hardware_count,
    'ai_skills': $skills_count,
    'nodes': nodes,
}, indent=2))
"
    exit 0
fi

# ── Display ──────────────────────────────────────────────

echo ""
echo -e "  ${PINK}BlackRoad Agent Fleet${NC}"
echo -e "  ${DIM}${total} registered · ${skills_count} AI skills · $(date '+%H:%M:%S')${NC}"
echo ""

# Fleet nodes
echo -e "  ${CYAN}Fleet Nodes${NC}"
for entry in "${NODES[@]}"; do
    IFS=':' read -r name ssh_target <<< "$entry"
    status="${NODE_STATUS[$name]:-unknown}"
    models="${NODE_OLLAMA[$name]:-0}"
    if [[ "$status" == "online" ]]; then
        echo -e "  ${GREEN}●${NC}  ${BOLD}${name}${NC}  ${DIM}${ssh_target##*@}${NC}  ${DIM}${models} models${NC}"
    else
        echo -e "  ${RED}●${NC}  ${BOLD}${name}${NC}  ${DIM}${ssh_target##*@}${NC}  ${RED}offline${NC}"
    fi
done

echo ""
echo -e "  ${CYAN}Named Agents${NC}"

# Show registry agents
for agent_line in "${active_agents[@]}"; do
    IFS='|' read -r name status model role <<< "$agent_line"
    case "$status" in
        active)  icon="${GREEN}●${NC}" ;;
        idle)    icon="${AMBER}○${NC}" ;;
        *)       icon="${DIM}·${NC}" ;;
    esac
    printf "  %b  %-14s %-12s %-20s %b\n" "$icon" "${BOLD}${name}${NC}" "${DIM}${status}${NC}" "${DIM}${model}${NC}" "${DIM}${role}${NC}"
done

echo ""
echo -e "  ${CYAN}Summary${NC}"
echo -e "  ${DIM}Registered:${NC}  ${total} agents (${core_count} core, ${worker_count} workers, ${hardware_count} hardware)"
echo -e "  ${DIM}AI Skills:${NC}   ${skills_count} (agentic, generation, orchestration, knowledge, multimodal, frontier)"
online_count=0
for name status in "${(kv)NODE_STATUS[@]}"; do
    [[ "$status" == "online" ]] && (( online_count++ ))
done
echo -e "  ${DIM}Fleet:${NC}       ${online_count}/5 nodes online"

echo ""
echo -e "  ${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
echo ""
