#!/bin/bash
# fleet-agents.sh — Agent coordination, handoff, memory, and continuity
# The nervous system of BlackRoad OS
#
# Usage:
#   fleet-agents.sh roster              # Show all agents, their nodes, purpose
#   fleet-agents.sh handoff <from> <to> <task-id>  # Transfer task with context
#   fleet-agents.sh dispatch <prompt>   # Route prompt to best agent
#   fleet-agents.sh memory <agent> [query]  # Read/search agent memory
#   fleet-agents.sh inject <agent> <key> <value>  # Write to agent memory
#   fleet-agents.sh chain <task-id>     # Show task chain (who touched it)
#   fleet-agents.sh status              # Live fleet agent status
#   fleet-agents.sh wake <agent>        # Load agent's model into VRAM
#   fleet-agents.sh think <agent> <prompt>  # Direct inference from agent

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;87m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

AGENT_DB="$HOME/.blackroad/agent-memory.db"
TASK_DB="$HOME/.blackroad/agent-tasks.db"
HEARTBEAT_DB="$HOME/.blackroad/fleet-heartbeat.db"
MEMORIES_DIR="$HOME/.blackroad/agents/memories"
COMM_DIR="$HOME/.blackroad/agent-comm"
REGISTRY="$HOME/.blackroad/agents/config/agent-registry.json"

SSH_OPTS="-o ConnectTimeout=5 -o StrictHostKeyChecking=no -o BatchMode=yes"

# ── Agent → Node → Model mapping ──
# Every agent has: a name, a node, a model, a purpose, capabilities
# This is the source of truth for who does what
declare -A AGENT_NODE=(
  # Cecilia fleet (main AI, 15 models, Hailo-8)
  [athena]="cecilia"      # Strategy + architecture — qwen3:8b (best reasoning)
  [prometheus]="cecilia"  # Code generation — qwen2.5-coder:3b
  [apollo]="cecilia"      # General knowledge — llama3.2:3b
  [cece]="cecilia"        # BlackRoad custom agent — cece:latest
  [hermes]="cecilia"      # Fast messenger — tinyllama:latest

  # Lucidia fleet (6 models, CI/CD, web)
  [lucidia]="lucidia"     # Oracle, long-form — lucidia:latest
  [morpheus]="lucidia"    # Dream/creative — qwen2.5:3b
  [chronos]="lucidia"     # Quick tasks — llama3.2:1b

  # Alice fleet (gateway, 3.7GB RAM)
  [gaia]="alice"          # Earth/infra monitoring — tinyllama:latest

  # Octavia fleet (NVMe, Gitea, Docker Swarm)
  [hades]="octavia"       # Storage, repos, data — local services
  [daedalus]="octavia"    # Build/deploy — docker + gitea
)

declare -A AGENT_MODEL=(
  [athena]="qwen3:8b"
  [prometheus]="qwen2.5-coder:3b"
  [apollo]="llama3.2:3b"
  [cece]="cece:latest"
  [hermes]="tinyllama:latest"
  [lucidia]="lucidia:latest"
  [morpheus]="qwen2.5:3b"
  [chronos]="llama3.2:1b"
  [gaia]="tinyllama:latest"
  [hades]=""
  [daedalus]=""
)

declare -A AGENT_PURPOSE=(
  [athena]="Strategy, architecture, code review, system design"
  [prometheus]="Code generation, debugging, refactoring, tests"
  [apollo]="General Q&A, documentation, explanations"
  [cece]="BlackRoad custom agent — fleet knowledge, personality"
  [hermes]="Fast dispatch, routing, quick answers, message relay"
  [lucidia]="Deep reasoning, long-form analysis, oracle predictions"
  [morpheus]="Creative writing, brainstorming, dream logic"
  [chronos]="Quick tasks, timestamps, scheduling, cron"
  [gaia]="Infrastructure monitoring, DNS, network health"
  [hades]="Data storage, repo management, backups, NVMe"
  [daedalus]="Build pipelines, Docker, CI/CD, deployment"
)

declare -A AGENT_CAPS=(
  [athena]="code,architecture,review,strategy,math"
  [prometheus]="code,debug,test,refactor,generate"
  [apollo]="chat,explain,docs,general,search"
  [cece]="chat,fleet,personality,custom"
  [hermes]="chat,fast,route,relay"
  [lucidia]="chat,reason,oracle,long-form,analysis"
  [morpheus]="chat,creative,brainstorm,write"
  [chronos]="chat,fast,schedule,time"
  [gaia]="monitor,dns,network,infra"
  [hades]="storage,git,backup,data"
  [daedalus]="docker,build,deploy,ci"
)

declare -A NODE_SSH=(
  [cecilia]="blackroad@192.168.4.96"
  [lucidia]="octavia@192.168.4.38"
  [alice]="pi@192.168.4.49"
  [octavia]="pi@192.168.4.100"
)

declare -A NODE_OLLAMA=(
  [cecilia]="http://192.168.4.96:11434"
  [lucidia]="http://192.168.4.38:11434"
  [alice]="http://192.168.4.49:11434"
)

# ── Helpers ──
header() {
  echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${PINK}  ◆ BlackRoad Agent Mesh${RESET}"
  echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

log()  { echo -e "  ${BLUE}→${RESET} $1"; }
ok()   { echo -e "  ${GREEN}✓${RESET} $1"; }
warn() { echo -e "  ${AMBER}⚠${RESET} $1"; }
err()  { echo -e "  ${RED}✗${RESET} $1"; }

roadid() {
  # Generate a RoadID: <node>-<type>-<time_base36>-<rand>
  local node="${1:-mac}"
  local type="${2:-task}"
  local ts=$(printf '%s' "$(date +%s)" | python3 -c "import sys; n=int(sys.stdin.read()); s=''; d='0123456789abcdefghijklmnopqrstuvwxyz'
while n>0: s=d[n%36]+s; n//=36
print(s)")
  local rand=$(head -c 4 /dev/urandom | xxd -p | head -c 4)
  echo "${node}-${type}-${ts}-${rand}"
}

# ── ROSTER: Show all agents, their purpose, node, model ──
cmd_roster() {
  header
  echo -e "${AMBER}Agent Roster${RESET}\n"

  printf "  ${DIM}%-12s %-10s %-22s %s${RESET}\n" "AGENT" "NODE" "MODEL" "PURPOSE"
  echo -e "  ${DIM}$(printf '─%.0s' {1..80})${RESET}"

  for agent in athena prometheus apollo cece hermes lucidia morpheus chronos gaia hades daedalus; do
    local node="${AGENT_NODE[$agent]}"
    local model="${AGENT_MODEL[$agent]:-—}"
    local purpose="${AGENT_PURPOSE[$agent]}"

    # Color by node
    local color="$RESET"
    case "$node" in
      cecilia) color="$PINK" ;;
      lucidia) color="$VIOLET" ;;
      alice)   color="$BLUE" ;;
      octavia) color="$CYAN" ;;
    esac

    printf "  ${color}%-12s${RESET} %-10s %-22s %s\n" "$agent" "$node" "$model" "$purpose"
  done

  echo ""
  echo -e "  ${DIM}Mythological personas (persistent memory):${RESET}"
  local count=$(ls "$MEMORIES_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo -e "  ${DIM}$count agents with memory in $MEMORIES_DIR${RESET}"
  echo ""
}

# ── STATUS: Live agent status across fleet ──
cmd_status() {
  header
  echo -e "${AMBER}Fleet Agent Status${RESET}\n"

  for node in cecilia lucidia alice octavia; do
    local ssh="${NODE_SSH[$node]}"
    echo -e "  ${VIOLET}[$node]${RESET} ${DIM}$ssh${RESET}"

    if ! ssh $SSH_OPTS "$ssh" "echo ok" &>/dev/null; then
      err "unreachable"
      echo ""
      continue
    fi
    ok "online"

    # Get loaded models (= active agents)
    local loaded
    loaded=$(ssh $SSH_OPTS "$ssh" "curl -s localhost:11434/api/ps 2>/dev/null" || echo '{}')

    local models
    models=$(echo "$loaded" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  for m in d.get('models',[]):
    print(m['name']+'|'+str(round(m.get('size',0)/1e9,1))+'GB')
except: pass
" 2>/dev/null)

    if [ -n "$models" ]; then
      echo "$models" | while IFS='|' read -r mname msize; do
        # Find which agent uses this model
        local agent_name="—"
        for a in "${!AGENT_MODEL[@]}"; do
          if [ "${AGENT_MODEL[$a]}" = "$mname" ] && [ "${AGENT_NODE[$a]}" = "$node" ]; then
            agent_name="$a"
            break
          fi
        done
        echo -e "    ${GREEN}●${RESET} $mname ${DIM}($msize)${RESET} → ${CYAN}$agent_name${RESET}"
      done
    else
      warn "no models loaded"
    fi

    # Memory
    local mem
    mem=$(ssh $SSH_OPTS "$ssh" "free -h | awk '/Mem:/{print \$4\"/\"\$2}'" 2>/dev/null)
    echo -e "    ${DIM}RAM: $mem${RESET}"
    echo ""
  done
}

# ── DISPATCH: Route a prompt to the best agent ──
cmd_dispatch() {
  local prompt="$*"
  if [ -z "$prompt" ]; then
    err "Usage: fleet-agents.sh dispatch <prompt>"
    exit 1
  fi

  header
  echo -e "${AMBER}Dispatching:${RESET} ${DIM}\"$(echo "$prompt" | head -c 60)...\"${RESET}\n"

  # Keyword matching → capability → agent
  local prompt_lower=$(echo "$prompt" | tr '[:upper:]' '[:lower:]')
  local best_agent=""
  local best_score=0

  for agent in "${!AGENT_CAPS[@]}"; do
    local caps="${AGENT_CAPS[$agent]}"
    local score=0

    # Score by keyword match
    IFS=',' read -ra cap_arr <<< "$caps"
    for cap in "${cap_arr[@]}"; do
      case "$cap" in
        code)     echo "$prompt_lower" | grep -qE 'code|function|script|debug|bug|error|fix|write.*program|implement|refactor' && ((score+=10)) ;;
        chat)     ((score+=1)) ;;  # base score for all chat agents
        fast)     echo "$prompt_lower" | grep -qE 'quick|fast|brief|short|simple' && ((score+=5)) ;;
        creative) echo "$prompt_lower" | grep -qE 'write|story|creative|brainstorm|idea|dream' && ((score+=8)) ;;
        reason)   echo "$prompt_lower" | grep -qE 'explain|why|how|analyze|think|reason|complex' && ((score+=8)) ;;
        architecture) echo "$prompt_lower" | grep -qE 'architect|design|system|plan|structure|scale' && ((score+=10)) ;;
        review)   echo "$prompt_lower" | grep -qE 'review|check|audit|quality' && ((score+=8)) ;;
        monitor)  echo "$prompt_lower" | grep -qE 'monitor|health|status|ping|check.*server|dns|network' && ((score+=10)) ;;
        docker)   echo "$prompt_lower" | grep -qE 'docker|container|deploy|build|ci|pipeline' && ((score+=10)) ;;
        git)      echo "$prompt_lower" | grep -qE 'git|repo|commit|branch|merge|pull' && ((score+=10)) ;;
        storage)  echo "$prompt_lower" | grep -qE 'storage|disk|file|backup|nvme|data' && ((score+=10)) ;;
        fleet)    echo "$prompt_lower" | grep -qE 'fleet|blackroad|node|pi|raspberry' && ((score+=8)) ;;
        math)     echo "$prompt_lower" | grep -qE 'math|calcul|equation|algebra|geometry' && ((score+=8)) ;;
        schedule) echo "$prompt_lower" | grep -qE 'cron|schedule|timer|every.*minute|recurring' && ((score+=10)) ;;
        search)   echo "$prompt_lower" | grep -qE 'search|find|look.*up|where' && ((score+=6)) ;;
      esac
    done

    if [ "$score" -gt "$best_score" ]; then
      best_score=$score
      best_agent=$agent
    fi
  done

  # Default to apollo (general) if no strong match
  if [ "$best_score" -lt 3 ]; then
    best_agent="apollo"
  fi

  local node="${AGENT_NODE[$best_agent]}"
  local model="${AGENT_MODEL[$best_agent]}"

  ok "Routed to ${CYAN}${best_agent}${RESET} on ${VIOLET}${node}${RESET} (score: $best_score)"
  log "Model: $model"
  log "Purpose: ${AGENT_PURPOSE[$best_agent]}"

  # Create task record
  local task_id=$(roadid "$node" "task")
  sqlite3 "$TASK_DB" "INSERT INTO tasks (id, title, description, assigned_to, status, priority)
    VALUES ('$task_id', '$(echo "$prompt" | head -c 40 | sed "s/'/''/g")', '$(echo "$prompt" | sed "s/'/''/g")', '$best_agent', 'dispatched', 5);"
  ok "Task: $task_id"

  # If agent has a model, run inference
  if [ -n "$model" ]; then
    local ssh="${NODE_SSH[$node]}"
    echo -e "\n  ${PINK}$best_agent responds:${RESET}\n"

    ssh $SSH_OPTS "$ssh" "curl -s -X POST localhost:11434/api/generate \
      -d '{\"model\":\"$model\",\"prompt\":\"$(echo "$prompt" | sed 's/"/\\"/g')\",\"stream\":false,\"keep_alive\":-1,\"options\":{\"num_predict\":512}}' \
      --max-time 120 2>/dev/null" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  print(d.get('response','(no response)'))
except Exception as e:
  print(f'Error: {e}')
" 2>/dev/null

    # Mark done
    sqlite3 "$TASK_DB" "UPDATE tasks SET status='done', completed_at=strftime('%s','now') WHERE id='$task_id';"
    echo -e "\n  ${GREEN}✓${RESET} Task complete: $task_id"
  fi
}

# ── HANDOFF: Transfer task from one agent to another with full context ──
cmd_handoff() {
  local from="$1" to="$2" task_id="$3"

  if [ -z "$from" ] || [ -z "$to" ]; then
    err "Usage: fleet-agents.sh handoff <from-agent> <to-agent> [task-id]"
    exit 1
  fi

  header
  echo -e "${AMBER}Handoff: ${CYAN}$from${RESET} → ${CYAN}$to${RESET}\n"

  # Validate agents exist
  if [ -z "${AGENT_NODE[$from]}" ]; then err "Unknown agent: $from"; exit 1; fi
  if [ -z "${AGENT_NODE[$to]}" ]; then err "Unknown agent: $to"; exit 1; fi

  # Get task context
  if [ -n "$task_id" ]; then
    local task_info
    task_info=$(sqlite3 "$TASK_DB" "SELECT title, description, result FROM tasks WHERE id='$task_id';" 2>/dev/null)
    if [ -z "$task_info" ]; then
      warn "Task $task_id not found, creating handoff without prior context"
    else
      log "Task: $task_id"
      log "Context: $(echo "$task_info" | head -c 80)"
    fi
  fi

  # Get from-agent's recent memory/conversation
  local from_context
  from_context=$(sqlite3 "$AGENT_DB" "
    SELECT content FROM messages
    WHERE conversation_id IN (
      SELECT id FROM conversations WHERE model='${AGENT_MODEL[$from]}' ORDER BY updated_at DESC LIMIT 1
    )
    ORDER BY created_at DESC LIMIT 5;
  " 2>/dev/null)

  # Create handoff record
  local handoff_id=$(roadid "mac" "task")
  local handoff_time=$(date +%s)

  # Write to agent inbox
  local inbox_file="$COMM_DIR/${to}-handoff.json"
  cat > "$inbox_file" << HANDOFF
{
  "handoff_id": "$handoff_id",
  "from": "$from",
  "to": "$to",
  "original_task": "$task_id",
  "timestamp": $handoff_time,
  "from_node": "${AGENT_NODE[$from]}",
  "to_node": "${AGENT_NODE[$to]}",
  "from_model": "${AGENT_MODEL[$from]}",
  "to_model": "${AGENT_MODEL[$to]}",
  "context": $(echo "$from_context" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))" 2>/dev/null || echo '""'),
  "reason": "Agent handoff: $from capabilities exhausted or $to better suited"
}
HANDOFF

  # Log handoff in task DB
  sqlite3 "$TASK_DB" "INSERT INTO agent_log (agent, event, detail)
    VALUES ('$from', 'handoff_out', 'to=$to task=$task_id handoff=$handoff_id');"
  sqlite3 "$TASK_DB" "INSERT INTO agent_log (agent, event, detail)
    VALUES ('$to', 'handoff_in', 'from=$from task=$task_id handoff=$handoff_id');"

  # Create continuation task
  sqlite3 "$TASK_DB" "INSERT INTO tasks (id, title, description, assigned_to, status, priority, chain_to)
    VALUES ('$handoff_id', 'Handoff from $from', 'Continue task $task_id', '$to', 'dispatched', 3, '$task_id');"

  ok "Handoff complete: $handoff_id"
  ok "From: $from (${AGENT_NODE[$from]}) → To: $to (${AGENT_NODE[$to]})"
  ok "Context transferred: $(echo "$from_context" | wc -c | tr -d ' ') bytes"
  ok "Inbox written: $inbox_file"

  # If target agent has a model, notify it
  local to_model="${AGENT_MODEL[$to]}"
  local to_node="${AGENT_NODE[$to]}"
  if [ -n "$to_model" ] && [ -n "${NODE_SSH[$to_node]}" ]; then
    log "Waking $to on $to_node..."
    ssh $SSH_OPTS "${NODE_SSH[$to_node]}" "curl -s -X POST localhost:11434/api/generate \
      -d '{\"model\":\"$to_model\",\"prompt\":\"ping\",\"keep_alive\":-1,\"options\":{\"num_predict\":1}}' \
      --max-time 30 >/dev/null 2>&1" &
    ok "$to model loaded on $to_node"
  fi
}

# ── MEMORY: Read or search agent memory ──
cmd_memory() {
  local agent="$1"
  local query="$2"

  if [ -z "$agent" ]; then
    # Show all agents with memory
    header
    echo -e "${AMBER}Agent Memories${RESET}\n"
    for f in "$MEMORIES_DIR"/*.md; do
      local name=$(basename "$f" .md)
      local sessions=$(grep -c "Session" "$f" 2>/dev/null || echo 0)
      local size=$(wc -c < "$f" | tr -d ' ')
      printf "  ${CYAN}%-14s${RESET} %6s bytes  %s sessions\n" "$name" "$size" "$sessions"
    done
    echo ""
    echo -e "  ${DIM}Agent state in DB:${RESET}"
    sqlite3 "$AGENT_DB" "SELECT agent_id, json_extract(state,'$.status') as status, datetime(updated_at,'unixepoch') as updated FROM agent_state ORDER BY updated_at DESC;" 2>/dev/null | while IFS='|' read -r aid status updated; do
      echo -e "    ${GREEN}●${RESET} $aid — $status ($updated)"
    done
    return
  fi

  # Show specific agent memory
  local mem_file="$MEMORIES_DIR/$(echo "$agent" | tr '[:lower:]' '[:upper:]' | head -c 1)$(echo "$agent" | tail -c +2).md"
  if [ ! -f "$mem_file" ]; then
    # Try uppercase
    mem_file="$MEMORIES_DIR/$(echo "$agent" | tr '[:lower:]' '[:upper:]').md"
  fi

  header
  echo -e "${AMBER}Memory: ${CYAN}$agent${RESET}\n"

  if [ -f "$mem_file" ]; then
    cat "$mem_file"
  else
    warn "No memory file for $agent"
  fi

  # Also show recent conversation history
  local model="${AGENT_MODEL[$agent]}"
  if [ -n "$model" ]; then
    echo -e "\n  ${DIM}Recent conversations (model: $model):${RESET}"
    sqlite3 "$AGENT_DB" "
      SELECT c.title, datetime(c.updated_at,'unixepoch'), COUNT(m.id) as msgs
      FROM conversations c
      LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.model = '$model'
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT 5;
    " 2>/dev/null | while IFS='|' read -r title updated msgs; do
      echo -e "    ${DIM}$updated${RESET} — $title ($msgs msgs)"
    done
  fi

  # Search if query provided
  if [ -n "$query" ]; then
    echo -e "\n  ${AMBER}Search: \"$query\"${RESET}"
    sqlite3 "$AGENT_DB" "
      SELECT m.content FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.model = '$model' AND m.content LIKE '%$query%'
      ORDER BY m.created_at DESC LIMIT 5;
    " 2>/dev/null | while read -r content; do
      echo -e "    ${DIM}$(echo "$content" | head -c 120)${RESET}"
    done
  fi
}

# ── INJECT: Write to agent memory ──
cmd_inject() {
  local agent="$1" key="$2" value="$3"

  if [ -z "$agent" ] || [ -z "$key" ] || [ -z "$value" ]; then
    err "Usage: fleet-agents.sh inject <agent> <key> <value>"
    exit 1
  fi

  # Update agent_state in DB
  local state_json=$(sqlite3 "$AGENT_DB" "SELECT state FROM agent_state WHERE agent_id='$agent';" 2>/dev/null)
  if [ -z "$state_json" ]; then
    state_json='{}'
  fi

  local new_state
  new_state=$(echo "$state_json" | python3 -c "
import sys,json
d=json.loads(sys.stdin.read() or '{}')
d['$key']='$value'
d['updated']='$(date -u +%Y-%m-%dT%H:%M:%SZ)'
print(json.dumps(d))
" 2>/dev/null)

  sqlite3 "$AGENT_DB" "INSERT OR REPLACE INTO agent_state (agent_id, state, context, updated_at)
    VALUES ('$agent', '$(echo "$new_state" | sed "s/'/''/g")', '$key=$value', strftime('%s','now'));"

  # Also append to memory file
  local mem_file="$MEMORIES_DIR/$(echo "$agent" | tr '[:lower:]' '[:upper:]').md"
  if [ -f "$mem_file" ]; then
    echo "" >> "$mem_file"
    echo "### Memory Injection ($(date -u +%Y-%m-%d))" >> "$mem_file"
    echo "- **$key**: $value" >> "$mem_file"
  fi

  ok "Injected into $agent: $key = $value"
  sqlite3 "$TASK_DB" "INSERT INTO agent_log (agent, event, detail) VALUES ('$agent', 'memory_inject', '$key=$value');"
}

# ── CHAIN: Show task handoff chain ──
cmd_chain() {
  local task_id="$1"

  if [ -z "$task_id" ]; then
    # Show recent task chains
    header
    echo -e "${AMBER}Recent Task Chains${RESET}\n"
    sqlite3 "$TASK_DB" "
      SELECT id, assigned_to, status, title, chain_to, datetime(created_at,'unixepoch')
      FROM tasks
      WHERE chain_to != '' OR id IN (SELECT chain_to FROM tasks WHERE chain_to != '')
      ORDER BY created_at DESC LIMIT 20;
    " 2>/dev/null | while IFS='|' read -r tid agent status title chain_to created; do
      local arrow=""
      [ -n "$chain_to" ] && arrow=" ← $chain_to"
      echo -e "  ${CYAN}$tid${RESET} ${DIM}$created${RESET}"
      echo -e "    ${GREEN}$agent${RESET} ($status) — $title$arrow"
    done
    return
  fi

  header
  echo -e "${AMBER}Task Chain: $task_id${RESET}\n"

  # Walk the chain forward and backward
  local current="$task_id"
  local chain=()

  # Walk backward (find origin)
  while true; do
    local info
    info=$(sqlite3 "$TASK_DB" "SELECT id, assigned_to, status, title, chain_to FROM tasks WHERE id='$current';" 2>/dev/null)
    if [ -z "$info" ]; then break; fi

    chain=("$info" "${chain[@]}")
    local prev=$(echo "$info" | cut -d'|' -f5)
    if [ -z "$prev" ] || [ "$prev" = "$current" ]; then break; fi
    current="$prev"
  done

  # Walk forward (find continuations)
  current="$task_id"
  while true; do
    local next
    next=$(sqlite3 "$TASK_DB" "SELECT id, assigned_to, status, title, chain_to FROM tasks WHERE chain_to='$current' LIMIT 1;" 2>/dev/null)
    if [ -z "$next" ]; then break; fi
    chain+=("$next")
    current=$(echo "$next" | cut -d'|' -f1)
  done

  # Display chain
  local i=0
  for entry in "${chain[@]}"; do
    IFS='|' read -r tid agent status title chain_to <<< "$entry"
    local marker="  "
    [ "$tid" = "$task_id" ] && marker="→ "
    echo -e "  ${marker}${CYAN}$tid${RESET}"
    echo -e "    Agent: ${GREEN}$agent${RESET}  Status: $status"
    echo -e "    ${DIM}$title${RESET}"
    if [ $i -lt $((${#chain[@]}-1)) ]; then
      echo -e "    ${DIM}↓ handoff${RESET}"
    fi
    ((i++))
  done
}

# ── WAKE: Load an agent's model into VRAM ──
cmd_wake() {
  local agent="$1"

  if [ -z "$agent" ]; then
    err "Usage: fleet-agents.sh wake <agent>"
    echo -e "  Available: ${!AGENT_MODEL[*]}"
    exit 1
  fi

  local model="${AGENT_MODEL[$agent]}"
  local node="${AGENT_NODE[$agent]}"

  if [ -z "$model" ]; then
    warn "$agent has no LLM model (service agent)"
    return
  fi

  local ssh="${NODE_SSH[$node]}"
  if [ -z "$ssh" ]; then
    err "No SSH config for node $node"
    return
  fi

  log "Waking $agent on $node ($model)..."

  ssh $SSH_OPTS "$ssh" "curl -s -X POST localhost:11434/api/generate \
    -d '{\"model\":\"$model\",\"prompt\":\"ping\",\"keep_alive\":-1,\"options\":{\"num_predict\":1}}' \
    --max-time 60 >/dev/null 2>&1"

  ok "$agent is awake on $node (model: $model, keep_alive=forever)"

  sqlite3 "$TASK_DB" "INSERT INTO agent_log (agent, event, detail) VALUES ('$agent', 'wake', 'model=$model node=$node');"
}

# ── THINK: Direct inference from a specific agent ──
cmd_think() {
  local agent="$1"
  shift
  local prompt="$*"

  if [ -z "$agent" ] || [ -z "$prompt" ]; then
    err "Usage: fleet-agents.sh think <agent> <prompt>"
    exit 1
  fi

  local model="${AGENT_MODEL[$agent]}"
  local node="${AGENT_NODE[$agent]}"
  local purpose="${AGENT_PURPOSE[$agent]}"

  if [ -z "$model" ]; then
    err "$agent has no LLM model"
    exit 1
  fi

  local ssh="${NODE_SSH[$node]}"

  echo -e "\n${CYAN}$agent${RESET} ${DIM}($model on $node)${RESET}\n"

  # Build system prompt with agent identity
  local sys_prompt="You are $agent, a BlackRoad AI agent. Your purpose: $purpose. Be concise and direct."

  # Create task
  local task_id=$(roadid "$node" "task")
  sqlite3 "$TASK_DB" "INSERT INTO tasks (id, title, assigned_to, status, priority)
    VALUES ('$task_id', '$(echo "$prompt" | head -c 40 | sed "s/'/''/g")', '$agent', 'running', 5);"

  # Run inference
  local response
  response=$(ssh $SSH_OPTS "$ssh" "curl -s -X POST localhost:11434/api/generate \
    -d '{\"model\":\"$model\",\"system\":\"$(echo "$sys_prompt" | sed 's/"/\\"/g')\",\"prompt\":\"$(echo "$prompt" | sed 's/"/\\"/g')\",\"stream\":false,\"keep_alive\":-1,\"options\":{\"num_predict\":-1}}' \
    --max-time 300 2>/dev/null" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  print(d.get('response','(no response)'))
except Exception as e:
  print(f'Error: {e}')
" 2>/dev/null)

  echo "$response"

  # Store in memory
  local conv_id=$(roadid "mac" "sess")
  sqlite3 "$AGENT_DB" "INSERT INTO conversations (id, title, model) VALUES ('$conv_id', '$(echo "$prompt" | head -c 40 | sed "s/'/''/g")', '$model');"
  sqlite3 "$AGENT_DB" "INSERT INTO messages (id, conversation_id, role, content, model) VALUES ('$(roadid mac msg)', '$conv_id', 'user', '$(echo "$prompt" | sed "s/'/''/g")', '$model');"
  sqlite3 "$AGENT_DB" "INSERT INTO messages (id, conversation_id, role, content, model) VALUES ('$(roadid mac msg)', '$conv_id', 'assistant', '$(echo "$response" | sed "s/'/''/g")', '$model');"

  # Complete task
  sqlite3 "$TASK_DB" "UPDATE tasks SET status='done', result='$(echo "$response" | head -c 200 | sed "s/'/''/g")', completed_at=strftime('%s','now') WHERE id='$task_id';"

  echo -e "\n${DIM}task: $task_id${RESET}"
}

# ── Main ──
case "${1:-roster}" in
  roster)   cmd_roster ;;
  status)   cmd_status ;;
  dispatch) shift; cmd_dispatch "$@" ;;
  handoff)  shift; cmd_handoff "$@" ;;
  memory)   shift; cmd_memory "$@" ;;
  inject)   shift; cmd_inject "$@" ;;
  chain)    shift; cmd_chain "$@" ;;
  wake)     shift; cmd_wake "$@" ;;
  think)    shift; cmd_think "$@" ;;
  *)
    echo "Usage: fleet-agents.sh <command>"
    echo ""
    echo "  roster              All agents, their nodes, purpose"
    echo "  status              Live fleet agent status"
    echo "  dispatch <prompt>   Route prompt to best agent"
    echo "  handoff <from> <to> [task-id]  Transfer task with context"
    echo "  memory [agent] [query]  Read/search agent memory"
    echo "  inject <agent> <key> <value>  Write to agent memory"
    echo "  chain [task-id]     Show task handoff chain"
    echo "  wake <agent>        Load agent model into VRAM"
    echo "  think <agent> <prompt>  Direct inference from agent"
    ;;
esac
