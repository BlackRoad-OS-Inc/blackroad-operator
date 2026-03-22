#!/bin/bash
# BlackRoad Model A/B Testing
# Compare models with statistical analysis
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

ABTEST_DIR="$HOME/.blackroad/abtests"
ABTEST_DB="$ABTEST_DIR/abtests.db"
ALL_NODES=("lucidia" "cecilia" "octavia" "aria" "alice")

# Initialize
init() {
    mkdir -p "$ABTEST_DIR"/{experiments,results}

    sqlite3 "$ABTEST_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    model_a TEXT,
    model_b TEXT,
    node_a TEXT,
    node_b TEXT,
    traffic_split REAL DEFAULT 0.5,
    status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    ended_at DATETIME
);

CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id TEXT,
    variant TEXT,
    prompt TEXT,
    response TEXT,
    latency_ms INTEGER,
    tokens INTEGER,
    rating INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES experiments(id)
);

CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id TEXT,
    prompt TEXT,
    category TEXT,
    expected_quality TEXT
);

CREATE INDEX IF NOT EXISTS idx_exp ON results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_variant ON results(variant);
SQL

    echo -e "${GREEN}A/B Testing system initialized${RESET}"
}

# Create experiment
create() {
    local name="$1"
    local model_a="$2"
    local model_b="$3"
    local node_a="${4:-cecilia}"
    local node_b="${5:-$node_a}"
    local description="${6:-}"

    local exp_id="exp_$(date +%s)_$(openssl rand -hex 4)"

    sqlite3 "$ABTEST_DB" "
        INSERT INTO experiments (id, name, description, model_a, model_b, node_a, node_b)
        VALUES ('$exp_id', '$name', '$description', '$model_a', '$model_b', '$node_a', '$node_b')
    "

    echo -e "${GREEN}Experiment created: $exp_id${RESET}"
    echo "  Name: $name"
    echo "  Model A: $model_a (on $node_a)"
    echo "  Model B: $model_b (on $node_b)"
}

# Add test prompts
add_prompt() {
    local exp_id="$1"
    local prompt="$2"
    local category="${3:-general}"
    local expected="${4:-}"

    sqlite3 "$ABTEST_DB" "
        INSERT INTO prompts (experiment_id, prompt, category, expected_quality)
        VALUES ('$exp_id', '$(echo "$prompt" | sed "s/'/''/g")', '$category', '$expected')
    "

    echo -e "${GREEN}Added prompt to $exp_id${RESET}"
}

# Add prompts from file
add_prompts_file() {
    local exp_id="$1"
    local file="$2"

    local count=0
    while IFS= read -r prompt; do
        [ -z "$prompt" ] && continue
        add_prompt "$exp_id" "$prompt" "batch" >/dev/null
        ((count++))
    done < "$file"

    echo -e "${GREEN}Added $count prompts from $file${RESET}"
}

# Start experiment
start() {
    local exp_id="$1"

    sqlite3 "$ABTEST_DB" "
        UPDATE experiments
        SET status = 'running', started_at = datetime('now')
        WHERE id = '$exp_id'
    "

    echo -e "${GREEN}Started experiment: $exp_id${RESET}"
}

# Run a single test
run_test() {
    local exp_id="$1"
    local prompt="$2"

    local exp=$(sqlite3 "$ABTEST_DB" "
        SELECT model_a, model_b, node_a, node_b, traffic_split FROM experiments WHERE id = '$exp_id'
    ")

    local model_a=$(echo "$exp" | cut -d'|' -f1)
    local model_b=$(echo "$exp" | cut -d'|' -f2)
    local node_a=$(echo "$exp" | cut -d'|' -f3)
    local node_b=$(echo "$exp" | cut -d'|' -f4)
    local split=$(echo "$exp" | cut -d'|' -f5)

    # Randomly select variant based on split
    local rand=$(awk "BEGIN {srand(); print rand()}")
    local variant="A"
    local model="$model_a"
    local node="$node_a"

    if [ "$(echo "$rand > $split" | bc -l)" = "1" ]; then
        variant="B"
        model="$model_b"
        node="$node_b"
    fi

    # Run inference
    local start_time=$(date +%s%N)

    local response=$(ssh -o ConnectTimeout=30 "$node" "
        curl -s http://localhost:11434/api/generate -d '{\"model\":\"$model\",\"prompt\":\"$prompt\",\"stream\":false}'
    " 2>/dev/null)

    local end_time=$(date +%s%N)
    local latency=$(( (end_time - start_time) / 1000000 ))

    local output=$(echo "$response" | jq -r '.response // ""' | head -c 5000 | sed "s/'/''/g")
    local tokens=$(echo "$response" | jq -r '.eval_count // 0')

    # Store result
    sqlite3 "$ABTEST_DB" "
        INSERT INTO results (experiment_id, variant, prompt, response, latency_ms, tokens)
        VALUES ('$exp_id', '$variant', '$(echo "$prompt" | sed "s/'/''/g")', '$output', $latency, $tokens)
    "

    echo -e "${CYAN}[$variant] ${model}${RESET} - ${latency}ms, ${tokens} tokens"
}

# Run full experiment
run() {
    local exp_id="$1"
    local iterations="${2:-1}"

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🧪 A/B TEST: $exp_id${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo

    start "$exp_id"

    # Get prompts
    local prompts=$(sqlite3 "$ABTEST_DB" "SELECT prompt FROM prompts WHERE experiment_id = '$exp_id'")

    if [ -z "$prompts" ]; then
        echo -e "${YELLOW}No prompts defined, using defaults${RESET}"
        prompts="What is the meaning of life?
Explain quantum computing in simple terms.
Write a haiku about programming.
What are the best practices for API design?
Summarize the theory of relativity."
    fi

    local total=0
    for i in $(seq 1 "$iterations"); do
        echo -e "\n${BLUE}=== Iteration $i ===${RESET}"

        echo "$prompts" | while IFS= read -r prompt; do
            [ -z "$prompt" ] && continue
            echo "Testing: ${prompt:0:50}..."
            run_test "$exp_id" "$prompt"
            ((total++))
        done
    done

    echo
    echo -e "${GREEN}Completed $total tests${RESET}"
    echo
    analyze "$exp_id"
}

# Interactive comparison
compare() {
    local exp_id="$1"
    local prompt="$2"

    local exp=$(sqlite3 "$ABTEST_DB" "
        SELECT model_a, model_b, node_a, node_b FROM experiments WHERE id = '$exp_id'
    ")

    local model_a=$(echo "$exp" | cut -d'|' -f1)
    local model_b=$(echo "$exp" | cut -d'|' -f2)
    local node_a=$(echo "$exp" | cut -d'|' -f3)
    local node_b=$(echo "$exp" | cut -d'|' -f4)

    echo -e "${PINK}=== SIDE-BY-SIDE COMPARISON ===${RESET}"
    echo
    echo "Prompt: $prompt"
    echo

    # Run both models in parallel
    echo -e "${BLUE}Model A ($model_a):${RESET}"
    local start_a=$(date +%s%N)
    local response_a=$(ssh "$node_a" "curl -s http://localhost:11434/api/generate -d '{\"model\":\"$model_a\",\"prompt\":\"$prompt\",\"stream\":false}'" | jq -r '.response')
    local end_a=$(date +%s%N)
    local latency_a=$(( (end_a - start_a) / 1000000 ))
    echo "$response_a"
    echo "  [${latency_a}ms]"

    echo
    echo -e "${GREEN}Model B ($model_b):${RESET}"
    local start_b=$(date +%s%N)
    local response_b=$(ssh "$node_b" "curl -s http://localhost:11434/api/generate -d '{\"model\":\"$model_b\",\"prompt\":\"$prompt\",\"stream\":false}'" | jq -r '.response')
    local end_b=$(date +%s%N)
    local latency_b=$(( (end_b - start_b) / 1000000 ))
    echo "$response_b"
    echo "  [${latency_b}ms]"

    # Store both results
    sqlite3 "$ABTEST_DB" "
        INSERT INTO results (experiment_id, variant, prompt, response, latency_ms)
        VALUES ('$exp_id', 'A', '$(echo "$prompt" | sed "s/'/''/g")', '$(echo "$response_a" | head -c 5000 | sed "s/'/''/g")', $latency_a),
               ('$exp_id', 'B', '$(echo "$prompt" | sed "s/'/''/g")', '$(echo "$response_b" | head -c 5000 | sed "s/'/''/g")', $latency_b)
    "

    echo
    echo "Which is better? (a/b/tie/skip)"
    read -r choice

    case "$choice" in
        a|A) rate "$exp_id" "A" 5 ;;
        b|B) rate "$exp_id" "B" 5 ;;
        tie) rate "$exp_id" "A" 3; rate "$exp_id" "B" 3 ;;
    esac
}

# Rate a result
rate() {
    local exp_id="$1"
    local variant="$2"
    local rating="$3"

    sqlite3 "$ABTEST_DB" "
        UPDATE results
        SET rating = $rating
        WHERE experiment_id = '$exp_id'
        AND variant = '$variant'
        AND id = (SELECT MAX(id) FROM results WHERE experiment_id = '$exp_id' AND variant = '$variant')
    "
}

# Analyze results
analyze() {
    local exp_id="$1"

    echo -e "${PINK}=== ANALYSIS: $exp_id ===${RESET}"
    echo

    local exp=$(sqlite3 "$ABTEST_DB" "SELECT name, model_a, model_b FROM experiments WHERE id = '$exp_id'")
    local name=$(echo "$exp" | cut -d'|' -f1)
    local model_a=$(echo "$exp" | cut -d'|' -f2)
    local model_b=$(echo "$exp" | cut -d'|' -f3)

    echo "Experiment: $name"
    echo "Model A: $model_a"
    echo "Model B: $model_b"
    echo

    # Get stats for each variant
    echo "Performance Metrics:"
    echo "┌────────────┬───────────┬───────────┬───────────┬───────────┐"
    echo "│ Variant    │ Count     │ Avg Lat   │ Avg Toks  │ Avg Rate  │"
    echo "├────────────┼───────────┼───────────┼───────────┼───────────┤"

    for variant in A B; do
        local stats=$(sqlite3 "$ABTEST_DB" "
            SELECT COUNT(*), AVG(latency_ms), AVG(tokens), AVG(rating)
            FROM results
            WHERE experiment_id = '$exp_id' AND variant = '$variant'
        ")

        local count=$(echo "$stats" | cut -d'|' -f1)
        local avg_lat=$(echo "$stats" | cut -d'|' -f2)
        local avg_tok=$(echo "$stats" | cut -d'|' -f3)
        local avg_rate=$(echo "$stats" | cut -d'|' -f4)

        printf "│ %-10s │ %-9s │ %-9.0f │ %-9.0f │ %-9.1f │\n" "$variant" "$count" "$avg_lat" "$avg_tok" "$avg_rate"
    done

    echo "└────────────┴───────────┴───────────┴───────────┴───────────┘"

    # Statistical significance (simplified)
    echo
    echo "Latency Distribution:"

    local lat_a=$(sqlite3 "$ABTEST_DB" "SELECT latency_ms FROM results WHERE experiment_id = '$exp_id' AND variant = 'A'")
    local lat_b=$(sqlite3 "$ABTEST_DB" "SELECT latency_ms FROM results WHERE experiment_id = '$exp_id' AND variant = 'B'")

    local mean_a=$(sqlite3 "$ABTEST_DB" "SELECT AVG(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'A'")
    local mean_b=$(sqlite3 "$ABTEST_DB" "SELECT AVG(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'B'")

    local min_a=$(sqlite3 "$ABTEST_DB" "SELECT MIN(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'A'")
    local max_a=$(sqlite3 "$ABTEST_DB" "SELECT MAX(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'A'")
    local min_b=$(sqlite3 "$ABTEST_DB" "SELECT MIN(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'B'")
    local max_b=$(sqlite3 "$ABTEST_DB" "SELECT MAX(latency_ms) FROM results WHERE experiment_id = '$exp_id' AND variant = 'B'")

    printf "  A: %.0fms (min: %d, max: %d)\n" "$mean_a" "$min_a" "$max_a"
    printf "  B: %.0fms (min: %d, max: %d)\n" "$mean_b" "$min_b" "$max_b"

    # Determine winner
    echo
    local diff=$(echo "$mean_a - $mean_b" | bc -l)
    local pct_diff=$(echo "scale=1; ($mean_a - $mean_b) / $mean_a * 100" | bc -l 2>/dev/null || echo "0")

    if [ "$(echo "$diff > 100" | bc -l)" = "1" ]; then
        echo -e "${GREEN}Winner: Model B is ${pct_diff}% faster${RESET}"
    elif [ "$(echo "$diff < -100" | bc -l)" = "1" ]; then
        echo -e "${GREEN}Winner: Model A is ${pct_diff#-}% faster${RESET}"
    else
        echo -e "${YELLOW}No significant difference detected${RESET}"
    fi
}

# List experiments
list() {
    echo -e "${PINK}=== EXPERIMENTS ===${RESET}"
    echo

    sqlite3 "$ABTEST_DB" "
        SELECT e.id, e.name, e.model_a, e.model_b, e.status,
               (SELECT COUNT(*) FROM results r WHERE r.experiment_id = e.id)
        FROM experiments e
        ORDER BY e.created_at DESC
    " | while IFS='|' read -r id name model_a model_b status count; do
        local status_color=$YELLOW
        [ "$status" = "running" ] && status_color=$GREEN
        [ "$status" = "completed" ] && status_color=$BLUE

        printf "  %-20s ${status_color}%-10s${RESET} %s vs %s (%d tests)\n" "$id" "[$status]" "$model_a" "$model_b" "$count"
        echo "    $name"
    done
}

# End experiment
end() {
    local exp_id="$1"

    sqlite3 "$ABTEST_DB" "
        UPDATE experiments
        SET status = 'completed', ended_at = datetime('now')
        WHERE id = '$exp_id'
    "

    echo -e "${GREEN}Ended experiment: $exp_id${RESET}"
    analyze "$exp_id"
}

# Export results
export_results() {
    local exp_id="$1"
    local format="${2:-json}"
    local output="$ABTEST_DIR/results/${exp_id}.${format}"

    case "$format" in
        json)
            sqlite3 "$ABTEST_DB" -json "SELECT * FROM results WHERE experiment_id = '$exp_id'" > "$output"
            ;;
        csv)
            sqlite3 "$ABTEST_DB" -header -csv "SELECT * FROM results WHERE experiment_id = '$exp_id'" > "$output"
            ;;
    esac

    echo -e "${GREEN}Exported to: $output${RESET}"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Model A/B Testing${RESET}"
    echo
    echo "Compare models with statistical analysis"
    echo
    echo "Commands:"
    echo "  create <name> <modelA> <modelB>     Create experiment"
    echo "  add-prompt <exp> <prompt>           Add test prompt"
    echo "  add-prompts <exp> <file>            Add prompts from file"
    echo "  start <exp>                         Start experiment"
    echo "  run <exp> [iterations]              Run full experiment"
    echo "  compare <exp> <prompt>              Interactive comparison"
    echo "  analyze <exp>                       Analyze results"
    echo "  list                                List experiments"
    echo "  end <exp>                           End experiment"
    echo "  export <exp> [json|csv]             Export results"
    echo
    echo "Examples:"
    echo "  $0 create 'phi-vs-llama' 'phi3:mini' 'llama3.2:1b'"
    echo "  $0 add-prompt exp_123 'Explain AI simply'"
    echo "  $0 run exp_123 5"
}

# Ensure initialized
[ -f "$ABTEST_DB" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    create|new)
        create "$2" "$3" "$4" "$5" "$6" "$7"
        ;;
    add-prompt|prompt)
        add_prompt "$2" "$3" "$4" "$5"
        ;;
    add-prompts|prompts)
        add_prompts_file "$2" "$3"
        ;;
    start)
        start "$2"
        ;;
    run|execute)
        run "$2" "$3"
        ;;
    compare|vs)
        compare "$2" "$3"
        ;;
    analyze|results)
        analyze "$2"
        ;;
    list|ls)
        list
        ;;
    end|stop)
        end "$2"
        ;;
    export)
        export_results "$2" "$3"
        ;;
    *)
        help
        ;;
esac
