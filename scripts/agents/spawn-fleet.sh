#!/opt/homebrew/bin/bash
# BlackRoad Agent Spawner — generates agent identities at scale
# Creates agent pools distributed across fleet Ollama instances
#
# Usage:
#   spawn-fleet.sh                    # Spawn default fleet (30K agents)
#   spawn-fleet.sh --count 1000      # Spawn specific number
#   spawn-fleet.sh --status          # Show spawn status
#   spawn-fleet.sh --invoke <id> <task>  # Invoke a specific agent

set -euo pipefail

AGENTS_DIR="/Users/alexa/blackroad-operator/agents"
POOL_DIR="$AGENTS_DIR/pool"
REGISTRY="$AGENTS_DIR/registry.json"
SPAWN_DB="$AGENTS_DIR/spawn.db"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
DIM='\033[38;5;242m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Fleet Ollama Endpoints ───────────────────────────────
# Each Pi/droplet has Ollama with different models
declare -A OLLAMA_ENDPOINTS
OLLAMA_ENDPOINTS[cecilia]="http://192.168.4.96:11434"    # Pi5 8GB, Hailo-8, 15 models
OLLAMA_ENDPOINTS[aria]="http://192.168.4.98:11434"       # Pi5 8GB, 6 models
OLLAMA_ENDPOINTS[lucidia]="http://192.168.4.38:11434"    # Pi5 8GB, 6 models

# Models available per node (from fleet scan)
declare -A NODE_MODELS
NODE_MODELS[cecilia]="qwen3:8b,llama3:8b-instruct-q4_K_M,cece:latest,cece2:latest,codellama:7b,qwen2.5-coder:3b,llama3.2:3b,deepseek-r1:1.5b,deepseek-coder:1.3b,tinyllama:latest"
NODE_MODELS[aria]="qwen2.5-coder:3b,llama3.2:3b,llama3.2:1b,deepseek-r1:1.5b,tinyllama:latest"
NODE_MODELS[lucidia]="qwen2.5:3b,lucidia:latest,llama3.2:1b,tinyllama:latest,qwen2.5:1.5b"

# Agent archetypes — each spawns thousands of instances
declare -A ARCHETYPES
ARCHETYPES[worker]="Execute tasks, process data, run operations"
ARCHETYPES[researcher]="Analyze information, find patterns, synthesize knowledge"
ARCHETYPES[coder]="Write code, debug, review, refactor"
ARCHETYPES[monitor]="Watch systems, detect anomalies, alert on issues"
ARCHETYPES[creative]="Generate ideas, design solutions, imagine possibilities"
ARCHETYPES[security]="Scan vulnerabilities, audit access, detect threats"
ARCHETYPES[analyst]="Process data, generate reports, forecast trends"
ARCHETYPES[coordinator]="Route tasks, manage workflows, orchestrate agents"

# ── Initialize SQLite ────────────────────────────────────
init_db() {
    sqlite3 "$SPAWN_DB" << 'SQL'
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS agents (
    agent_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    archetype TEXT NOT NULL,
    node TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT DEFAULT 'idle',
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    last_active TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    pool_id INTEGER
);

CREATE TABLE IF NOT EXISTS pools (
    pool_id INTEGER PRIMARY KEY AUTOINCREMENT,
    archetype TEXT NOT NULL,
    node TEXT NOT NULL,
    model TEXT NOT NULL,
    count INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    agent_id TEXT,
    input TEXT NOT NULL,
    intent TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending',
    result TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    started_at TEXT,
    completed_at TEXT,
    latency_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_agents_archetype ON agents(archetype);
CREATE INDEX IF NOT EXISTS idx_agents_node ON agents(node);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
SQL
}

# ── Name Generator ───────────────────────────────────────
generate_name() {
    local archetype="$1"
    local index="$2"

    local prefixes_worker=("task" "exec" "run" "ops" "proc" "work" "job" "auto")
    local prefixes_researcher=("seek" "find" "scan" "deep" "think" "mind" "query" "know")
    local prefixes_coder=("code" "dev" "hack" "build" "ship" "byte" "func" "git")
    local prefixes_monitor=("watch" "eye" "pulse" "alert" "guard" "sense" "check" "probe")
    local prefixes_creative=("dream" "muse" "spark" "nova" "bloom" "wave" "flux" "arc")
    local prefixes_security=("shield" "lock" "vault" "sentry" "fort" "armor" "cage" "wall")
    local prefixes_analyst=("data" "stat" "graph" "trend" "chart" "metric" "signal" "flow")
    local prefixes_coordinator=("hub" "link" "mesh" "route" "sync" "bridge" "nexus" "core")

    local -n prefixes="prefixes_$archetype"
    local prefix="${prefixes[$((index % ${#prefixes[@]}))]}"
    local hex
    hex=$(printf '%04x' "$index")
    echo "${prefix}-${hex}"
}

# ── Spawn Agents ─────────────────────────────────────────
spawn_fleet() {
    local total="${1:-30000}"
    echo -e "${PINK}${BOLD}Spawning $total agents across fleet...${RESET}"

    init_db

    # Distribution: weighted by node capacity
    # Cecilia (8GB, 15 models, Hailo): 35%
    # Gematria (8GB, 7 models): 25%
    # Lucidia (8GB, 6 models): 15%
    # Aria (8GB, 6 models): 15%
    # Alice (4GB, 6 models): 10%
    declare -A NODE_ALLOC
    NODE_ALLOC[cecilia]=$((total * 45 / 100))   # Most models + Hailo-8
    NODE_ALLOC[aria]=$((total * 28 / 100))       # Coding models
    NODE_ALLOC[lucidia]=$((total * 27 / 100))    # Custom lucidia model

    # Archetype distribution per node
    local archetypes=("worker" "researcher" "coder" "monitor" "creative" "security" "analyst" "coordinator")
    local weights=(30 20 15 10 8 7 5 5)  # percentages

    local spawned=0

    for node in cecilia aria lucidia; do
        local node_total="${NODE_ALLOC[$node]}"
        local models="${NODE_MODELS[$node]}"
        local endpoint="${OLLAMA_ENDPOINTS[$node]}"

        # Pick primary model for this node (first one that's small enough for batch)
        IFS=',' read -ra model_list <<< "$models"
        local primary_model="${model_list[0]}"

        echo -e "  ${BLUE}$node${RESET} — ${node_total} agents on ${primary_model}"

        local arch_index=0
        for archetype in "${archetypes[@]}"; do
            local weight="${weights[$arch_index]}"
            local arch_count=$((node_total * weight / 100))

            # Assign model based on archetype
            local model="$primary_model"
            case "$archetype" in
                coder)
                    # Use coding-specific model if available
                    for m in "${model_list[@]}"; do
                        [[ "$m" == *coder* ]] && model="$m" && break
                    done
                    ;;
                researcher|creative)
                    # Use larger model if available
                    for m in "${model_list[@]}"; do
                        [[ "$m" == *8b* || "$m" == *7b* ]] && model="$m" && break
                    done
                    ;;
                security)
                    for m in "${model_list[@]}"; do
                        [[ "$m" == *deepseek* ]] && model="$m" && break
                    done
                    ;;
            esac

            # Create pool entry
            sqlite3 "$SPAWN_DB" "INSERT INTO pools (archetype, node, model, count) VALUES ('$archetype', '$node', '$model', $arch_count);"
            local pool_id
            pool_id=$(sqlite3 "$SPAWN_DB" "SELECT last_insert_rowid();")

            # Batch insert agents
            local batch_sql="BEGIN TRANSACTION;"
            for ((i=0; i<arch_count; i++)); do
                local agent_id="${node:0:3}-${archetype:0:3}-$(printf '%06d' $((spawned + i)))"
                local name
                name=$(generate_name "$archetype" $((spawned + i)))
                batch_sql+="INSERT OR IGNORE INTO agents (agent_id, name, archetype, node, model, pool_id) VALUES ('$agent_id', '$name', '$archetype', '$node', '$model', $pool_id);"

                # Progress every 5000
                if (( (spawned + i) % 5000 == 0 )) && (( spawned + i > 0 )); then
                    echo -e "    ${DIM}...$(( spawned + i )) agents spawned${RESET}"
                fi
            done
            batch_sql+="COMMIT;"

            echo "$batch_sql" | sqlite3 "$SPAWN_DB"
            spawned=$((spawned + arch_count))
            arch_index=$((arch_index + 1))
        done
    done

    echo -e "\n${GREEN}${BOLD}Spawned $spawned agents across fleet${RESET}"
    show_status
}

# ── Show Status ──────────────────────────────────────────
show_status() {
    echo -e "\n${PINK}${BOLD}  Agent Fleet Status${RESET}\n"

    echo -e "  ${VIOLET}${BOLD}By Node${RESET}"
    sqlite3 -separator '|' "$SPAWN_DB" "
        SELECT node, COUNT(*), GROUP_CONCAT(DISTINCT model)
        FROM agents GROUP BY node ORDER BY COUNT(*) DESC;
    " | while IFS='|' read -r node count models; do
        printf "  ${BLUE}%-12s${RESET} %6s agents  ${DIM}%s${RESET}\n" "$node" "$count" "$models"
    done

    echo -e "\n  ${VIOLET}${BOLD}By Archetype${RESET}"
    sqlite3 -separator '|' "$SPAWN_DB" "
        SELECT archetype, COUNT(*), SUM(tasks_completed), SUM(tasks_failed)
        FROM agents GROUP BY archetype ORDER BY COUNT(*) DESC;
    " | while IFS='|' read -r archetype count completed failed; do
        printf "  ${AMBER}%-14s${RESET} %6s agents  ${GREEN}%s done${RESET}  ${DIM}%s failed${RESET}\n" \
            "$archetype" "$count" "${completed:-0}" "${failed:-0}"
    done

    echo -e "\n  ${VIOLET}${BOLD}By Status${RESET}"
    sqlite3 -separator '|' "$SPAWN_DB" "
        SELECT status, COUNT(*) FROM agents GROUP BY status;
    " | while IFS='|' read -r status count; do
        printf "  %-12s %6s\n" "$status" "$count"
    done

    local total
    total=$(sqlite3 "$SPAWN_DB" "SELECT COUNT(*) FROM agents;")
    echo -e "\n  ${PINK}${BOLD}Total: $total agents${RESET}\n"
}

# ── Invoke Agent ─────────────────────────────────────────
invoke_agent() {
    local agent_id="$1"
    local task="$2"
    local intent="${3:-general}"

    # Get agent info
    local agent_info
    agent_info=$(sqlite3 -separator '|' "$SPAWN_DB" "
        SELECT node, model, archetype FROM agents WHERE agent_id='$agent_id';
    ")

    if [ -z "$agent_info" ]; then
        echo "Agent not found: $agent_id"
        return 1
    fi

    IFS='|' read -r node model archetype <<< "$agent_info"
    local endpoint="${OLLAMA_ENDPOINTS[$node]}"

    # Build system prompt
    local system_prompt="You are agent $agent_id, a $archetype specialist in the BlackRoad fleet. ${ARCHETYPES[$archetype]} You are running on node $node with model $model. Be concise and actionable."

    # Create task record
    local task_id
    task_id="t-$(date +%s)-$RANDOM"
    sqlite3 "$SPAWN_DB" "INSERT INTO tasks (task_id, agent_id, input, intent) VALUES ('$task_id', '$agent_id', '$(echo "$task" | sed "s/'/''/g")', '$intent');"

    # Update agent status
    sqlite3 "$SPAWN_DB" "UPDATE agents SET status='working', last_active=datetime('now') WHERE agent_id='$agent_id';"

    echo -e "${BLUE}Invoking ${BOLD}$agent_id${RESET} ${DIM}($archetype on $node via $model)${RESET}"

    local start_ms
    start_ms=$(python3 -c "import time; print(int(time.time()*1000))")

    # Call Ollama
    local result
    result=$(curl -sf --max-time 60 "$endpoint/api/generate" \
        -d "$(jq -n --arg model "$model" --arg prompt "$system_prompt\n\nTask: $task" \
            '{model: $model, prompt: $prompt, stream: false}')" 2>/dev/null)

    local end_ms
    end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
    local latency=$((end_ms - start_ms))

    if [ -n "$result" ]; then
        local response
        response=$(echo "$result" | jq -r '.response // empty' 2>/dev/null)

        if [ -n "$response" ]; then
            sqlite3 "$SPAWN_DB" "
                UPDATE tasks SET status='completed', result='$(echo "$response" | head -20 | sed "s/'/''/g")', completed_at=datetime('now'), latency_ms=$latency WHERE task_id='$task_id';
                UPDATE agents SET status='idle', tasks_completed=tasks_completed+1 WHERE agent_id='$agent_id';
            "
            echo -e "${GREEN}Response${RESET} ${DIM}(${latency}ms)${RESET}:"
            echo "$response"
        else
            sqlite3 "$SPAWN_DB" "
                UPDATE tasks SET status='failed', result='empty response', completed_at=datetime('now'), latency_ms=$latency WHERE task_id='$task_id';
                UPDATE agents SET status='idle', tasks_failed=tasks_failed+1 WHERE agent_id='$agent_id';
            "
            echo -e "${AMBER}Empty response from $model${RESET}"
        fi
    else
        sqlite3 "$SPAWN_DB" "
            UPDATE tasks SET status='failed', result='connection failed', completed_at=datetime('now'), latency_ms=$latency WHERE task_id='$task_id';
            UPDATE agents SET status='idle', tasks_failed=tasks_failed+1 WHERE agent_id='$agent_id';
        "
        echo -e "${AMBER}Failed to reach $endpoint${RESET}"
    fi
}

# ── Batch Invoke (fan-out) ───────────────────────────────
batch_invoke() {
    local archetype="$1"
    local task="$2"
    local count="${3:-5}"

    echo -e "${PINK}${BOLD}Fan-out: $count $archetype agents${RESET}"

    # Pick random idle agents of this archetype across different nodes
    local agents
    agents=$(sqlite3 "$SPAWN_DB" "
        SELECT agent_id FROM agents
        WHERE archetype='$archetype' AND status='idle'
        GROUP BY node
        ORDER BY RANDOM()
        LIMIT $count;
    ")

    local pids=()
    for agent_id in $agents; do
        invoke_agent "$agent_id" "$task" &
        pids+=($!)
    done

    # Wait for all
    for pid in "${pids[@]}"; do
        wait "$pid" 2>/dev/null || true
    done

    echo -e "\n${GREEN}Batch complete — $count agents responded${RESET}"
}

# ── Main ─────────────────────────────────────────────────
case "${1:-}" in
    --status|-s)
        show_status
        ;;
    --invoke|-i)
        invoke_agent "${2:?agent_id required}" "${3:?task required}" "${4:-general}"
        ;;
    --batch|-b)
        batch_invoke "${2:?archetype required}" "${3:?task required}" "${4:-5}"
        ;;
    --count|-c)
        spawn_fleet "${2:-30000}"
        ;;
    --help|-h)
        echo "BlackRoad Agent Spawner"
        echo "  spawn-fleet.sh              Spawn 30K agents"
        echo "  spawn-fleet.sh --count N    Spawn N agents"
        echo "  spawn-fleet.sh --status     Show fleet status"
        echo "  spawn-fleet.sh --invoke ID TASK  Invoke agent"
        echo "  spawn-fleet.sh --batch TYPE TASK [N]  Fan-out to N agents"
        ;;
    *)
        spawn_fleet "${2:-30000}"
        ;;
esac
