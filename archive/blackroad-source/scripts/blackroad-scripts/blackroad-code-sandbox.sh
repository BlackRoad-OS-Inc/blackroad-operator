#!/bin/bash
# BlackRoad Code Sandbox
# Safe code execution environment using Docker on the cluster
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

SANDBOX_DIR="$HOME/.blackroad/sandbox"
EXEC_NODE="aria"  # Node with Docker for sandboxing
TIMEOUT=30        # Max execution time in seconds
MAX_MEMORY="256m" # Memory limit

# Language configurations
declare -A LANG_IMAGES=(
    ["python"]="python:3.11-slim"
    ["node"]="node:20-slim"
    ["bash"]="alpine:latest"
    ["ruby"]="ruby:3.2-slim"
    ["go"]="golang:1.21-alpine"
)

declare -A LANG_COMMANDS=(
    ["python"]="python"
    ["node"]="node"
    ["bash"]="sh"
    ["ruby"]="ruby"
    ["go"]="go run"
)

declare -A LANG_EXTENSIONS=(
    ["python"]=".py"
    ["node"]=".js"
    ["bash"]=".sh"
    ["ruby"]=".rb"
    ["go"]=".go"
)

# Initialize
init() {
    mkdir -p "$SANDBOX_DIR"
    echo -e "${GREEN}Code sandbox initialized${RESET}"
    echo "  Sandbox dir: $SANDBOX_DIR"
    echo "  Exec node: $EXEC_NODE"
    echo "  Timeout: ${TIMEOUT}s"
    echo "  Memory limit: $MAX_MEMORY"
}

# Execute code in sandbox
execute() {
    local lang="$1"
    local code="$2"

    if [ -z "${LANG_IMAGES[$lang]}" ]; then
        echo -e "${RED}Unsupported language: $lang${RESET}"
        echo "Supported: ${!LANG_IMAGES[*]}"
        return 1
    fi

    local image="${LANG_IMAGES[$lang]}"
    local cmd="${LANG_COMMANDS[$lang]}"
    local ext="${LANG_EXTENSIONS[$lang]}"
    local exec_id=$(date +%s%N | md5sum | head -c 8)
    local code_file="code_$exec_id$ext"

    echo -e "${BLUE}Executing $lang code...${RESET}"
    echo -e "${YELLOW}Image: $image | Timeout: ${TIMEOUT}s | Memory: $MAX_MEMORY${RESET}"
    echo

    # Create temp file with code on remote node
    ssh "$EXEC_NODE" "cat > /tmp/$code_file << 'CODEEOF'
$code
CODEEOF"

    # Run in Docker with restrictions
    local start_time=$(date +%s%N)

    local output=$(ssh -o ConnectTimeout=60 "$EXEC_NODE" "
        timeout $TIMEOUT docker run --rm \
            --memory=$MAX_MEMORY \
            --memory-swap=$MAX_MEMORY \
            --cpus=1 \
            --network=none \
            --security-opt=no-new-privileges \
            --read-only \
            -v /tmp/$code_file:/code$ext:ro \
            $image $cmd /code$ext 2>&1
        exit_code=\$?
        rm -f /tmp/$code_file
        exit \$exit_code
    " 2>&1)

    local exit_code=$?
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))

    echo -e "${GREEN}=== OUTPUT ===${RESET}"
    echo "$output"
    echo
    echo -e "${BLUE}Exit code: $exit_code | Duration: ${duration}ms${RESET}"

    # Log execution
    echo "{\"id\":\"$exec_id\",\"lang\":\"$lang\",\"exit_code\":$exit_code,\"duration_ms\":$duration,\"timestamp\":\"$(date -Iseconds)\"}" >> "$SANDBOX_DIR/executions.jsonl"

    return $exit_code
}

# Execute from file
execute_file() {
    local file="$1"
    local lang=""

    # Detect language from extension
    case "$file" in
        *.py) lang="python" ;;
        *.js) lang="node" ;;
        *.sh) lang="bash" ;;
        *.rb) lang="ruby" ;;
        *.go) lang="go" ;;
        *)
            echo -e "${RED}Cannot detect language for: $file${RESET}"
            return 1
            ;;
    esac

    if [ ! -f "$file" ]; then
        echo -e "${RED}File not found: $file${RESET}"
        return 1
    fi

    execute "$lang" "$(cat "$file")"
}

# Interactive REPL
repl() {
    local lang="${1:-python}"

    if [ -z "${LANG_IMAGES[$lang]}" ]; then
        echo -e "${RED}Unsupported language: $lang${RESET}"
        return 1
    fi

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🔒 BLACKROAD CODE SANDBOX - $lang                  ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo "Type code and press Enter twice to execute"
    echo "Type 'exit' to quit, 'lang <name>' to switch language"
    echo

    local code=""
    local empty_lines=0

    while true; do
        echo -n -e "${GREEN}[$lang]> ${RESET}"
        read -r line

        case "$line" in
            exit|quit|q)
                echo "Goodbye!"
                break
                ;;
            lang\ *)
                lang="${line#lang }"
                if [ -z "${LANG_IMAGES[$lang]}" ]; then
                    echo -e "${RED}Unsupported: $lang${RESET}"
                    lang="python"
                else
                    echo -e "${BLUE}Switched to $lang${RESET}"
                fi
                ;;
            "")
                if [ -n "$code" ]; then
                    ((empty_lines++))
                    if [ $empty_lines -ge 1 ]; then
                        execute "$lang" "$code"
                        code=""
                        empty_lines=0
                        echo
                    fi
                fi
                ;;
            *)
                code+="$line"$'\n'
                empty_lines=0
                ;;
        esac
    done
}

# AI-assisted code generation and execution
ai_code() {
    local task="$*"
    local lang="${SANDBOX_LANG:-python}"

    echo -e "${PINK}=== AI CODE GENERATION ===${RESET}"
    echo -e "Task: $task"
    echo -e "Language: $lang"
    echo

    local prompt="You are a code assistant. Write $lang code to accomplish this task. Output ONLY the code, no explanations.

Task: $task

Code:"

    echo -e "${BLUE}Generating code...${RESET}"

    local code=$(ssh -o ConnectTimeout=30 cecilia \
        "curl -s http://localhost:11434/api/generate -d '{\"model\":\"codellama:7b\",\"prompt\":\"$prompt\",\"stream\":false}'" 2>/dev/null \
        | jq -r '.response // "# Error generating code"')

    echo -e "${GREEN}Generated code:${RESET}"
    echo "$code"
    echo

    echo -n "Execute? [y/N] "
    read -r confirm

    if [[ "$confirm" =~ ^[Yy] ]]; then
        execute "$lang" "$code"
    fi
}

# Benchmark a code snippet
benchmark() {
    local lang="$1"
    shift
    local code="$*"
    local runs="${BENCHMARK_RUNS:-5}"

    echo -e "${PINK}=== BENCHMARK ===${RESET}"
    echo "Language: $lang"
    echo "Runs: $runs"
    echo

    local total=0
    for ((i=1; i<=runs; i++)); do
        echo -n "Run $i: "
        local start=$(date +%s%N)
        execute "$lang" "$code" >/dev/null 2>&1
        local end=$(date +%s%N)
        local duration=$(( (end - start) / 1000000 ))
        echo "${duration}ms"
        total=$((total + duration))
    done

    local avg=$((total / runs))
    echo
    echo -e "${GREEN}Average: ${avg}ms${RESET}"
}

# Check sandbox status
status() {
    echo -e "${PINK}=== SANDBOX STATUS ===${RESET}"
    echo

    echo -n "Exec node ($EXEC_NODE): "
    if ssh -o ConnectTimeout=3 "$EXEC_NODE" "echo ok" >/dev/null 2>&1; then
        echo -e "${GREEN}ONLINE${RESET}"
    else
        echo -e "${RED}OFFLINE${RESET}"
    fi

    echo -n "Docker: "
    if ssh -o ConnectTimeout=3 "$EXEC_NODE" "docker ps" >/dev/null 2>&1; then
        echo -e "${GREEN}RUNNING${RESET}"
    else
        echo -e "${RED}NOT AVAILABLE${RESET}"
    fi

    echo
    echo "Available languages:"
    for lang in "${!LANG_IMAGES[@]}"; do
        echo "  $lang: ${LANG_IMAGES[$lang]}"
    done

    echo
    local exec_count=$(wc -l < "$SANDBOX_DIR/executions.jsonl" 2>/dev/null || echo 0)
    echo "Total executions: $exec_count"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Code Sandbox${RESET}"
    echo
    echo "Safe code execution using Docker containers"
    echo
    echo "Commands:"
    echo "  exec <lang> <code>  Execute code (python/node/bash/ruby/go)"
    echo "  file <path>         Execute file"
    echo "  repl [lang]         Interactive REPL (default: python)"
    echo "  ai <task>           AI-generate and execute code"
    echo "  benchmark <lang> <code>  Benchmark code"
    echo "  status              Show sandbox status"
    echo
    echo "Examples:"
    echo "  $0 exec python 'print(sum(range(100)))'"
    echo "  $0 exec node 'console.log(Math.PI)'"
    echo "  $0 file script.py"
    echo "  $0 repl python"
    echo "  $0 ai 'calculate fibonacci of 20'"
}

# Ensure initialized
[ -d "$SANDBOX_DIR" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    exec|run)
        execute "$2" "$3"
        ;;
    file)
        execute_file "$2"
        ;;
    repl|interactive)
        repl "$2"
        ;;
    ai|generate)
        shift
        ai_code "$@"
        ;;
    benchmark|bench)
        shift
        benchmark "$@"
        ;;
    status)
        status
        ;;
    *)
        help
        ;;
esac
