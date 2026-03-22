#!/bin/zsh
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# BlackRoad Sovereign AI Bridge
# Zero tokenization. 100% local inference.
# Routes to best available model across Pi fleet via SSH

# ═══════════════════════════════════════════════════════════════════════════════
# BLACKROAD BRAND COLORS (True Color 24-bit)
# ═══════════════════════════════════════════════════════════════════════════════

# Primary Brand Colors
HOT_PINK='\033[38;2;255;29;108m'      # #FF1D6C - Primary brand
AMBER='\033[38;2;245;166;35m'          # #F5A623 - Accent
ORANGE='\033[38;2;242;101;34m'         # #F26522 - Warning/energy
ELECTRIC_BLUE='\033[38;2;41;121;255m'  # #2979FF - Info/links
SKY_BLUE='\033[38;2;68;138;255m'       # #448AFF - Secondary blue
VIOLET='\033[38;2;156;39;176m'         # #9C27B0 - AI/quantum
DEEP_PURPLE='\033[38;2;94;53;177m'     # #5E35B1 - Deep accent
MAGENTA='\033[38;2;233;30;99m'         # #E91E63 - Highlight

# Status Colors
SUCCESS='\033[38;2;0;230;118m'         # #00E676 - Green success
WARNING='\033[38;2;255;193;7m'         # #FFC107 - Yellow warning
ERROR='\033[38;2;255;82;82m'           # #FF5252 - Red error

# Neutral Colors
WHITE='\033[38;2;255;255;255m'         # #FFFFFF
SILVER='\033[38;2;189;189;189m'        # #BDBDBD
GRAY='\033[38;2;117;117;117m'          # #757575
DARK_GRAY='\033[38;2;66;66;66m'        # #424242
CHARCOAL='\033[38;2;33;33;33m'         # #212121

# Text Styles
BOLD='\033[1m'
DIM='\033[2m'
ITALIC='\033[3m'
UNDERLINE='\033[4m'
BLINK='\033[5m'
REVERSE='\033[7m'
RESET='\033[0m'

# Background Colors
BG_BLACK='\033[48;2;0;0;0m'
BG_PINK='\033[48;2;255;29;108m'
BG_DARK='\033[48;2;18;18;18m'

# ═══════════════════════════════════════════════════════════════════════════════
# GRADIENT HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

# Print gradient text (simplified - amber to pink to blue)
gradient_text() {
    local text="$1"
    # Simple 3-color gradient
    local third=$((${#text} / 3))
    local p1="${text:0:$third}"
    local p2="${text:$third:$third}"
    local p3="${text:$((third*2))}"
    printf "${AMBER}%s${HOT_PINK}%s${ELECTRIC_BLUE}%s${RESET}" "$p1" "$p2" "$p3"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

# Model preferences (best to fallback)
PREFERRED_MODELS=(
    "qwen3:8b"
    "llama3:8b-instruct-q4_K_M"
    "qwen2.5-coder:3b"
    "llama3.2:3b"
    "llama3:latest"
    "qwen2.5:1.5b"
    "phi3.5:latest"
    "tinyllama:latest"
)

# Fast models (no chain-of-thought)
FAST_MODELS=(
    "llama3.2:3b"
    "llama3:latest"
    "qwen2.5:1.5b"
    "tinyllama:latest"
)

# Fleet hosts in priority order
FLEET_HOSTS=(cecilia lucidia aria octavia alice)

# Fleet descriptions
typeset -A FLEET_DESC
FLEET_DESC=(
    cecilia "Primary AI (Hailo-8 26 TOPS)"
    lucidia "Inference Node (Pi 5 + NVMe)"
    aria "Harmony Protocol (Pi 5)"
    octavia "Multi-Processor (Bitcoin)"
    alice "Worker Node (Pi 4)"
)

# Config
CONFIG_DIR="${HOME}/.blackroad"
SOVEREIGN_CONFIG="${CONFIG_DIR}/sovereign-ai.conf"
HISTORY_FILE="${CONFIG_DIR}/sovereign-history.jsonl"
BRAIN_FILE="${CONFIG_DIR}/sovereign-brain.txt"
MEMORY_FILE="${CONFIG_DIR}/sovereign-memory.jsonl"
RAG_INDEX="${HOME}/blackroad-codex/index/components.db"
API_PORT=7777
VOICE_ENABLED=false

# Code-related keywords for routing
CODE_KEYWORDS="code|function|class|debug|fix|error|syntax|compile|script|python|bash|javascript|typescript|rust|go|java|css|html|api|endpoint|database|sql|query|regex|algorithm|implement|refactor"

# Coder models (prefer for code tasks)
CODER_MODELS=(
    "qwen2.5-coder:3b"
    "qwen2.5-coder:7b"
    "codellama:7b"
    "deepseek-coder:6.7b"
)

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

load_config() {
    mkdir -p "$CONFIG_DIR"
    if [[ -f "$SOVEREIGN_CONFIG" ]]; then
        source "$SOVEREIGN_CONFIG"
    else
        PREFERRED_HOST="cecilia"
        PREFERRED_MODEL="qwen3:8b"
        save_config
    fi
}

save_config() {
    cat > "$SOVEREIGN_CONFIG" << EOF
PREFERRED_HOST="${PREFERRED_HOST}"
PREFERRED_MODEL="${PREFERRED_MODEL}"
EOF
}

check_host() {
    local host="$1"
    ssh -o ConnectTimeout=2 -o BatchMode=yes "$host" "echo ok" &>/dev/null
}

get_models() {
    local host="$1"
    ssh -o ConnectTimeout=3 "$host" "ollama list 2>/dev/null" | tail -n +2 | awk '{print $1}'
}

find_best_model() {
    local host="$1"
    local models=$(get_models "$host")

    for preferred in "${PREFERRED_MODELS[@]}"; do
        if echo "$models" | grep -qx "$preferred"; then
            echo "$preferred"
            return 0
        fi
    done
    echo "$models" | head -1
}

find_fast_model() {
    local host="$1"
    local models=$(get_models "$host")

    for fast in "${FAST_MODELS[@]}"; do
        if echo "$models" | grep -qx "$fast"; then
            echo "$fast"
            return 0
        fi
    done
    echo "$models" | grep -v "qwen3" | head -1
}

find_best_host() {
    if check_host "$PREFERRED_HOST"; then
        echo "$PREFERRED_HOST"
        return 0
    fi

    for host in "${FLEET_HOSTS[@]}"; do
        [[ "$host" == "$PREFERRED_HOST" ]] && continue
        if check_host "$host"; then
            echo "$host"
            return 0
        fi
    done
    return 1
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 1: MULTI-MODEL ROUTING
# ═══════════════════════════════════════════════════════════════════════════════

is_code_query() {
    local query="$1"
    echo "$query" | grep -qiE "$CODE_KEYWORDS"
}

find_coder_model() {
    local host="$1"
    local models=$(get_models "$host")

    for coder in "${CODER_MODELS[@]}"; do
        if echo "$models" | grep -qx "$coder"; then
            echo "$coder"
            return 0
        fi
    done
    # Fallback to best model
    find_best_model "$host"
}

select_model_for_query() {
    local host="$1"
    local query="$2"
    local fast="$3"

    if [[ "$fast" == "true" ]]; then
        find_fast_model "$host"
    elif is_code_query "$query"; then
        find_coder_model "$host"
    else
        find_best_model "$host"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 2: CONVERSATION MEMORY
# ═══════════════════════════════════════════════════════════════════════════════

SESSION_ID="$(date +%Y%m%d)-$$"
MEMORY_CONTEXT=""

load_memory() {
    if [[ -f "$MEMORY_FILE" ]]; then
        # Load last 5 exchanges for context
        MEMORY_CONTEXT=$(tail -10 "$MEMORY_FILE" 2>/dev/null | jq -rs '
            .[-5:] | map("[" + .role + "]: " + .content) | join("\n")
        ' 2>/dev/null || echo "")
    fi
}

save_to_memory() {
    local role="$1"
    local content="$2"

    mkdir -p "$(dirname "$MEMORY_FILE")"
    echo "{\"ts\":\"$(date -Iseconds)\",\"session\":\"$SESSION_ID\",\"role\":\"$role\",\"content\":$(echo "$content" | jq -Rs .)}" >> "$MEMORY_FILE"
}

clear_memory() {
    rm -f "$MEMORY_FILE"
    MEMORY_CONTEXT=""
    echo -e "${SUCCESS}Memory cleared.${RESET}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 3: RAG BRAIN (Codebase Search)
# ═══════════════════════════════════════════════════════════════════════════════

search_rag() {
    local query="$1"
    local limit="${2:-3}"

    if [[ ! -f "$RAG_INDEX" ]]; then
        return 1
    fi

    # Search components.db for relevant code
    sqlite3 "$RAG_INDEX" "
        SELECT name, type, file_path
        FROM components
        WHERE name LIKE '%${query}%'
           OR file_path LIKE '%${query}%'
        LIMIT $limit
    " 2>/dev/null | while read line; do
        echo "  - $line"
    done
}

get_rag_context() {
    local query="$1"

    # Extract potential code terms
    local terms=$(echo "$query" | grep -oE '[a-zA-Z_][a-zA-Z0-9_]+' | sort -u | head -5)
    local rag_results=""

    for term in $terms; do
        local results=$(search_rag "$term" 2)
        if [[ -n "$results" ]]; then
            rag_results+="Related components for '$term':\n$results\n"
        fi
    done

    echo "$rag_results"
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 4: AGENT MODE (Command Execution)
# ═══════════════════════════════════════════════════════════════════════════════

AGENT_MODE=false

extract_commands() {
    local response="$1"
    # Extract all code blocks (bash, sh, zsh, or unmarked)
    echo "$response" | sed -n '/```\(bash\|sh\|zsh\|shell\|\)/,/```/p' | grep -v '```'
}

execute_with_confirm() {
    local cmd="$1"

    echo ""
    echo -e "${ORANGE}${BOLD}Command detected:${RESET}"
    echo -e "${WHITE}${cmd}${RESET}"
    echo ""
    echo -en "${AMBER}Execute? ${RESET}[${SUCCESS}y${RESET}/${ERROR}n${RESET}/${VIOLET}e${RESET}dit]: "
    read -r confirm

    case "$confirm" in
        y|Y|yes)
            echo -e "${DIM}${GRAY}─────────────────────────────────────${RESET}"
            eval "$cmd" 2>&1
            local exit_code=$?
            echo -e "${DIM}${GRAY}─────────────────────────────────────${RESET}"
            if [[ $exit_code -eq 0 ]]; then
                echo -e "${SUCCESS}✓ Command succeeded${RESET}"
            else
                echo -e "${ERROR}✗ Exit code: $exit_code${RESET}"
            fi
            ;;
        e|E|edit)
            echo -en "${AMBER}Edit command:${RESET} "
            read -e -i "$cmd" edited_cmd
            if [[ -n "$edited_cmd" ]]; then
                execute_with_confirm "$edited_cmd"
            fi
            ;;
        *)
            echo -e "${DIM}${GRAY}Skipped.${RESET}"
            ;;
    esac
}

process_agent_response() {
    local response="$1"

    # Print the response first
    echo -e "${WHITE}${response}${RESET}"

    # If agent mode is on, check for commands
    if [[ "$AGENT_MODE" == "true" ]]; then
        local commands=$(extract_commands "$response")
        if [[ -n "$commands" ]]; then
            echo "$commands" | while IFS= read -r cmd; do
                [[ -n "$cmd" ]] && execute_with_confirm "$cmd"
            done
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 5: VOICE MODE (Whisper STT)
# ═══════════════════════════════════════════════════════════════════════════════

check_voice_deps() {
    command -v sox &>/dev/null && command -v whisper &>/dev/null
}

record_voice() {
    local duration="${1:-5}"
    local tmpfile="/tmp/sovereign-voice-$$.wav"

    echo -e "${VIOLET}${BOLD}🎤 Recording for ${duration}s...${RESET} ${DIM}(speak now)${RESET}"
    sox -d -r 16000 -c 1 "$tmpfile" trim 0 "$duration" 2>/dev/null

    if [[ -f "$tmpfile" ]]; then
        echo -e "${DIM}${GRAY}Transcribing...${RESET}"
        local text=$(whisper "$tmpfile" --model tiny --output_format txt 2>/dev/null | cat)
        rm -f "$tmpfile" "${tmpfile%.wav}.txt"
        echo "$text"
    fi
}

voice_query() {
    if ! check_voice_deps; then
        echo -e "${ERROR}Voice mode requires: sox, whisper${RESET}"
        echo -e "${GRAY}Install: pip install openai-whisper && brew install sox${RESET}"
        return 1
    fi

    local text=$(record_voice 5)
    if [[ -n "$text" ]]; then
        echo -e "${ELECTRIC_BLUE}You said:${RESET} ${WHITE}$text${RESET}"
        echo ""
        echo "$text"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE 6: API SERVER (Tailscale accessible)
# ═══════════════════════════════════════════════════════════════════════════════

start_api_server() {
    local port="${1:-$API_PORT}"

    echo -e "${ELECTRIC_BLUE}${BOLD}Starting Sovereign AI API on port $port${RESET}"
    echo -e "${GRAY}Endpoint: http://$(hostname):$port/query${RESET}"
    echo -e "${GRAY}Tailscale: http://$(tailscale ip -4 2>/dev/null || echo 'N/A'):$port/query${RESET}"
    echo -e "${DIM}Press Ctrl+C to stop${RESET}"
    echo ""

    while true; do
        {
            read request

            # Parse query from POST body or GET param
            local query=$(echo "$request" | grep -oP '(?<=query=)[^&\s]+' | sed 's/+/ /g;s/%20/ /g' || echo "")

            if [[ -z "$query" ]]; then
                # Try to read POST body
                while read -t 0.1 line; do
                    query+="$line"
                done
            fi

            if [[ -n "$query" ]]; then
                local host=$(find_best_host)
                local model=$(find_best_model "$host")
                local response=$(query_ollama_ssh "$host" "$model" "$query" "false")

                echo "HTTP/1.1 200 OK"
                echo "Content-Type: application/json"
                echo "Access-Control-Allow-Origin: *"
                echo ""
                echo "{\"host\":\"$host\",\"model\":\"$model\",\"response\":$(echo "$response" | jq -Rs .)}"
            else
                echo "HTTP/1.1 400 Bad Request"
                echo "Content-Type: application/json"
                echo ""
                echo '{"error":"No query provided"}'
            fi
        } | nc -l -p "$port" -q 1
    done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ENHANCED QUERY (with all features)
# ═══════════════════════════════════════════════════════════════════════════════

query_ollama_ssh() {
    local host="$1"
    local model="$2"
    local prompt="$3"
    local fast="${4:-false}"
    local use_brain="${5:-true}"

    if [[ "$fast" == "true" ]]; then
        model=$(find_fast_model "$host")
    fi

    # Build full prompt with all context
    local full_prompt="$prompt"

    # 1. Add brain context
    if [[ "$use_brain" == "true" && -f "$BRAIN_FILE" ]]; then
        local brain=$(cat "$BRAIN_FILE")
        full_prompt="[SYSTEM CONTEXT]
${brain}
"
    fi

    # 2. Add RAG context for code queries
    if is_code_query "$prompt"; then
        local rag=$(get_rag_context "$prompt")
        if [[ -n "$rag" ]]; then
            full_prompt+="
[CODEBASE CONTEXT]
${rag}
"
        fi
    fi

    # 3. Add conversation memory
    if [[ -n "$MEMORY_CONTEXT" ]]; then
        full_prompt+="
[CONVERSATION HISTORY]
${MEMORY_CONTEXT}
"
    fi

    # 4. Add the actual query
    full_prompt+="
[USER QUERY]
${prompt}"

    # Save user message to memory
    save_to_memory "user" "$prompt"

    local escaped_prompt=$(printf '%s' "$full_prompt" | sed "s/'/'\\\\''/g")
    local response=$(ssh -o ConnectTimeout=5 "$host" "TERM=dumb ollama run '$model' '$escaped_prompt'" 2>/dev/null)

    # Save assistant response to memory
    [[ -n "$response" ]] && save_to_memory "assistant" "$response"

    echo "$response"
}

# ═══════════════════════════════════════════════════════════════════════════════
# BANNER
# ═══════════════════════════════════════════════════════════════════════════════

show_banner() {
    echo ""
    echo -e "${HOT_PINK}  ╔═══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${HOT_PINK}  ║${RESET}  ${BOLD}$(gradient_text "SOVEREIGN AI")${RESET}                                          ${HOT_PINK}║${RESET}"
    echo -e "${HOT_PINK}  ║${RESET}  ${DIM}${SILVER}Zero Tokenization • 100% Local Inference${RESET}                  ${HOT_PINK}║${RESET}"
    echo -e "${HOT_PINK}  ╠═══════════════════════════════════════════════════════════════╣${RESET}"
}

show_connection_info() {
    local host="$1"
    local model="$2"
    local desc="${FLEET_DESC[$host]}"

    echo -e "${HOT_PINK}  ║${RESET}  ${ELECTRIC_BLUE}Host${RESET}   ${AMBER}${host}${RESET} ${DIM}${GRAY}${desc}${RESET}"
    echo -e "${HOT_PINK}  ║${RESET}  ${ELECTRIC_BLUE}Model${RESET}  ${SUCCESS}${model}${RESET}"
    echo -e "${HOT_PINK}  ║${RESET}  ${DIM}${GRAY}/help for commands • /exit to quit${RESET}"
    echo -e "${HOT_PINK}  ╚═══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# INTERACTIVE CHAT
# ═══════════════════════════════════════════════════════════════════════════════

chat_mode() {
    local host=$(find_best_host)

    if [[ -z "$host" ]]; then
        echo -e "${ERROR}${BOLD} No Pi nodes available!${RESET}"
        echo -e "${GRAY}Check that your Pis are online: ${WHITE}ssh cecilia${RESET}"
        exit 1
    fi

    local model=$(find_best_model "$host")

    # Load conversation memory
    load_memory

    show_banner
    show_connection_info "$host" "$model"

    # Show active features
    echo -e "${DIM}${GRAY}Features: ${RESET}${SUCCESS}Memory${RESET}${GRAY}, ${RESET}${ELECTRIC_BLUE}Multi-Model${RESET}${GRAY}, ${RESET}${VIOLET}RAG${RESET}${GRAY}${RESET}"
    [[ "$AGENT_MODE" == "true" ]] && echo -e "${DIM}${ORANGE}Agent Mode: ON ${RESET}${GRAY}(will execute commands)${RESET}"
    echo ""

    while true; do
        # Gradient prompt with agent indicator
        if [[ "$AGENT_MODE" == "true" ]]; then
            echo -en "${ORANGE}agent${DARK_GRAY}@${VIOLET}${host}${HOT_PINK} ${AMBER}▸${RESET} "
        else
            echo -en "${HOT_PINK}sovereign${DARK_GRAY}@${VIOLET}${host}${HOT_PINK} ${AMBER}▸${RESET} "
        fi
        read -r input

        [[ -z "$input" ]] && continue

        case "$input" in
            /exit|/quit|exit|quit)
                echo -e "${DIM}${HOT_PINK}Sovereign AI disconnected.${RESET}"
                echo ""
                break
                ;;
            /help)
                echo ""
                echo -e "${ELECTRIC_BLUE}${BOLD}Commands${RESET}"
                echo -e "  ${AMBER}/status${RESET}       ${GRAY}Current connection info${RESET}"
                echo -e "  ${AMBER}/switch${RESET}       ${GRAY}Reconnect to best host${RESET}"
                echo -e "  ${AMBER}/models${RESET}       ${GRAY}List available models${RESET}"
                echo -e "  ${AMBER}/use${RESET} ${WHITE}<model>${RESET}  ${GRAY}Switch model${RESET}"
                echo -e "  ${AMBER}/fast${RESET}         ${GRAY}Quick mode (llama3)${RESET}"
                echo -e "  ${AMBER}/think${RESET}        ${GRAY}Deep mode (qwen3)${RESET}"
                echo -e "  ${AMBER}/code${RESET}         ${GRAY}Code mode (qwen2.5-coder)${RESET}"
                echo ""
                echo -e "${VIOLET}${BOLD}Agent Mode${RESET}"
                echo -e "  ${AMBER}/agent${RESET}        ${GRAY}Toggle agent mode (execute commands)${RESET}"
                echo -e "  ${AMBER}/run${RESET} ${WHITE}<cmd>${RESET}    ${GRAY}Execute command directly${RESET}"
                echo ""
                echo -e "${ELECTRIC_BLUE}${BOLD}Memory & RAG${RESET}"
                echo -e "  ${AMBER}/memory${RESET}       ${GRAY}Show conversation history${RESET}"
                echo -e "  ${AMBER}/forget${RESET}       ${GRAY}Clear conversation memory${RESET}"
                echo -e "  ${AMBER}/rag${RESET} ${WHITE}<query>${RESET}  ${GRAY}Search codebase directly${RESET}"
                echo ""
                echo -e "${MAGENTA}${BOLD}Voice${RESET}"
                echo -e "  ${AMBER}/voice${RESET}        ${GRAY}Voice input (5 sec recording)${RESET}"
                echo ""
                echo -e "${GRAY}/fleet /clear /exit${RESET}"
                echo ""
                ;;
            /status)
                echo ""
                echo -e "${ELECTRIC_BLUE}Host${RESET}      ${AMBER}${host}${RESET} ${DIM}(${FLEET_DESC[$host]})${RESET}"
                echo -e "${ELECTRIC_BLUE}Model${RESET}     ${SUCCESS}${model}${RESET}"
                echo -e "${ELECTRIC_BLUE}Agent${RESET}     ${AGENT_MODE}"
                echo -e "${ELECTRIC_BLUE}Memory${RESET}    $(wc -l < "$MEMORY_FILE" 2>/dev/null || echo 0) entries"
                echo -e "${ELECTRIC_BLUE}Session${RESET}   ${SESSION_ID}"
                echo ""
                ;;
            /switch)
                echo -e "${DIM}${GRAY}Scanning fleet...${RESET}"
                host=$(find_best_host)
                model=$(find_best_model "$host")
                echo -e "${SUCCESS}Connected:${RESET} ${AMBER}${host}${RESET} / ${SUCCESS}${model}${RESET}"
                echo ""
                ;;
            /models)
                echo ""
                echo -e "${ELECTRIC_BLUE}${BOLD}Models on ${AMBER}${host}${RESET}"
                get_models "$host" | while read m; do
                    if [[ "$m" == "$model" ]]; then
                        echo -e "  ${SUCCESS}●${RESET} ${WHITE}${m}${RESET} ${DIM}(active)${RESET}"
                    else
                        echo -e "  ${GRAY}○${RESET} ${SILVER}${m}${RESET}"
                    fi
                done
                echo ""
                ;;
            /use\ *)
                model="${input#/use }"
                echo -e "${SUCCESS}Switched to:${RESET} ${WHITE}${model}${RESET}"
                echo ""
                ;;
            /fast|/nothink)
                NOTHINK_MODE="true"
                model=$(find_fast_model "$host")
                echo -e "${SUCCESS}Fast mode${RESET} ${DIM}→${RESET} ${WHITE}${model}${RESET}"
                echo ""
                ;;
            /think)
                NOTHINK_MODE="false"
                model=$(find_best_model "$host")
                echo -e "${VIOLET}Think mode${RESET} ${DIM}→${RESET} ${WHITE}${model}${RESET}"
                echo ""
                ;;
            /code)
                model=$(find_coder_model "$host")
                echo -e "${ELECTRIC_BLUE}Code mode${RESET} ${DIM}→${RESET} ${WHITE}${model}${RESET}"
                echo ""
                ;;
            /agent)
                if [[ "$AGENT_MODE" == "true" ]]; then
                    AGENT_MODE=false
                    echo -e "${GRAY}Agent mode:${RESET} ${ERROR}OFF${RESET}"
                else
                    AGENT_MODE=true
                    echo -e "${GRAY}Agent mode:${RESET} ${SUCCESS}ON${RESET} ${DIM}(will offer to execute bash commands)${RESET}"
                fi
                echo ""
                ;;
            /run\ *)
                local cmd="${input#/run }"
                execute_with_confirm "$cmd"
                echo ""
                ;;
            /memory)
                echo ""
                echo -e "${ELECTRIC_BLUE}${BOLD}Conversation Memory${RESET}"
                if [[ -f "$MEMORY_FILE" ]]; then
                    tail -10 "$MEMORY_FILE" | jq -r '"\(.role): \(.content | .[0:100])..."' 2>/dev/null | while read line; do
                        echo -e "  ${GRAY}$line${RESET}"
                    done
                else
                    echo -e "${GRAY}  No memory yet.${RESET}"
                fi
                echo ""
                ;;
            /forget)
                clear_memory
                echo ""
                ;;
            /rag\ *)
                local query="${input#/rag }"
                echo ""
                echo -e "${VIOLET}${BOLD}Codebase Search: ${WHITE}${query}${RESET}"
                local results=$(search_rag "$query" 10)
                if [[ -n "$results" ]]; then
                    echo "$results"
                else
                    echo -e "${GRAY}  No components found.${RESET}"
                fi
                echo ""
                ;;
            /voice)
                local voice_text=$(voice_query)
                if [[ -n "$voice_text" ]]; then
                    # Process voice input as a query
                    local selected_model=$(select_model_for_query "$host" "$voice_text" "$NOTHINK_MODE")
                    echo -e "${DIM}${VIOLET}Thinking...${RESET}"
                    response=$(query_ollama_ssh "$host" "$selected_model" "$voice_text" "$NOTHINK_MODE")
                    if [[ -n "$response" ]]; then
                        process_agent_response "$response"
                    else
                        echo -e "${ERROR}No response.${RESET}"
                    fi
                fi
                echo ""
                ;;
            /fleet)
                echo ""
                show_fleet
                ;;
            /clear)
                clear
                show_banner
                show_connection_info "$host" "$model"
                ;;
            *)
                # Auto-select model based on query type
                local selected_model=$(select_model_for_query "$host" "$input" "$NOTHINK_MODE")
                if [[ "$selected_model" != "$model" ]]; then
                    echo -e "${DIM}${GRAY}→ Using ${selected_model} for this query${RESET}"
                    model="$selected_model"
                fi

                # Thinking indicator
                if [[ "$NOTHINK_MODE" == "true" ]]; then
                    echo -e "${DIM}${GRAY}...${RESET}"
                elif is_code_query "$input"; then
                    echo -e "${DIM}${ELECTRIC_BLUE}Coding...${RESET}"
                else
                    echo -e "${DIM}${VIOLET}Thinking...${RESET}"
                fi

                response=$(query_ollama_ssh "$host" "$model" "$input" "$NOTHINK_MODE")

                if [[ -n "$response" ]]; then
                    # Process response (handles agent mode command execution)
                    process_agent_response "$response"

                    # Log to history
                    mkdir -p "$(dirname "$HISTORY_FILE")"
                    echo "{\"ts\":\"$(date -Iseconds)\",\"host\":\"$host\",\"model\":\"$model\",\"q\":\"$input\"}" >> "$HISTORY_FILE"
                else
                    echo -e "${ERROR}No response.${RESET} ${GRAY}Try${RESET} ${AMBER}/switch${RESET}"
                fi
                echo ""
                ;;
        esac
    done
}

# ═══════════════════════════════════════════════════════════════════════════════
# ONE-SHOT QUERY
# ═══════════════════════════════════════════════════════════════════════════════

oneshot() {
    local fast="false"
    if [[ "$1" == "--fast" || "$1" == "-q" ]]; then
        fast="true"
        shift
    fi

    local query="$*"
    local host=$(find_best_host)

    if [[ -z "$host" ]]; then
        echo -e "${ERROR}No Pi nodes available!${RESET}" >&2
        exit 1
    fi

    local model
    if [[ "$fast" == "true" ]]; then
        model=$(find_fast_model "$host")
        echo -e "${DIM}${GRAY}[${AMBER}${host}${GRAY}/${SUCCESS}${model}${GRAY}] ${SILVER}fast${RESET}" >&2
    else
        model=$(find_best_model "$host")
        echo -e "${DIM}${GRAY}[${AMBER}${host}${GRAY}/${VIOLET}${model}${GRAY}]${RESET}" >&2
    fi

    query_ollama_ssh "$host" "$model" "$query" "false"
}

# ═══════════════════════════════════════════════════════════════════════════════
# FLEET STATUS
# ═══════════════════════════════════════════════════════════════════════════════

show_fleet() {
    echo -e "${HOT_PINK}${BOLD}═══ BlackRoad Sovereign AI Fleet ═══${RESET}"
    echo ""

    for host in "${FLEET_HOSTS[@]}"; do
        local desc="${FLEET_DESC[$host]}"

        if check_host "$host"; then
            local top_model=$(find_best_model "$host")
            echo -e "  ${SUCCESS}●${RESET} ${AMBER}${BOLD}${host}${RESET}"
            echo -e "    ${GRAY}${desc}${RESET}"
            echo -e "    ${ELECTRIC_BLUE}Model:${RESET} ${WHITE}${top_model}${RESET}"
        else
            echo -e "  ${ERROR}○${RESET} ${DARK_GRAY}${host}${RESET} ${DIM}(offline)${RESET}"
            echo -e "    ${DARK_GRAY}${desc}${RESET}"
        fi
        echo ""
    done
}

# ═══════════════════════════════════════════════════════════════════════════════
# HELP
# ═══════════════════════════════════════════════════════════════════════════════

show_help() {
    echo ""
    echo -e "${BOLD}$(gradient_text "BlackRoad Sovereign AI")${RESET}"
    echo -e "${DIM}${SILVER}Local inference, zero tokenization${RESET}"
    echo ""
    echo -e "${ELECTRIC_BLUE}${BOLD}Usage${RESET}"
    echo -e "  ${AMBER}ask${RESET}                    ${GRAY}Interactive chat mode${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}'question'${RESET}         ${GRAY}One-shot query${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--fast${RESET} ${WHITE}'question'${RESET}  ${GRAY}Quick mode (no reasoning)${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--code${RESET} ${WHITE}'question'${RESET}  ${GRAY}Code mode (uses coder model)${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--agent${RESET}            ${GRAY}Start with agent mode ON${RESET}"
    echo ""
    echo -e "${VIOLET}${BOLD}Fleet & API${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--fleet${RESET}            ${GRAY}Show fleet status${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--api${RESET} ${DIM}[port]${RESET}        ${GRAY}Start HTTP API server${RESET}"
    echo ""
    echo -e "${MAGENTA}${BOLD}Voice${RESET}"
    echo -e "  ${AMBER}ask${RESET} ${WHITE}--voice${RESET}            ${GRAY}Record & transcribe (requires whisper)${RESET}"
    echo ""
    echo -e "${ELECTRIC_BLUE}${BOLD}Chat Commands${RESET}"
    echo -e "  ${GRAY}/help /status /switch /models /fast /think /code${RESET}"
    echo -e "  ${GRAY}/agent /run /memory /forget /rag /voice /fleet /exit${RESET}"
    echo ""
    echo -e "${DIM}${GRAY}Routes: cecilia → lucidia → aria → octavia${RESET}"
    echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

load_config
load_memory

case "${1:-}" in
    -h|--help|help)
        show_help
        ;;
    --fleet|-f|fleet)
        echo ""
        show_fleet
        ;;
    --config|-c|config)
        echo ""
        echo -e "${ELECTRIC_BLUE}Config:${RESET} ${SILVER}$SOVEREIGN_CONFIG${RESET}"
        [[ -f "$SOVEREIGN_CONFIG" ]] && cat "$SOVEREIGN_CONFIG"
        echo ""
        ;;
    --api)
        shift
        start_api_server "${1:-$API_PORT}"
        ;;
    --voice)
        text=$(voice_query)
        if [[ -n "$text" ]]; then
            oneshot "$text"
        fi
        ;;
    --agent)
        AGENT_MODE=true
        shift
        if [[ -n "$1" ]]; then
            oneshot "$@"
        else
            chat_mode
        fi
        ;;
    --code)
        shift
        _host=$(find_best_host)
        _model=$(find_coder_model "$_host")
        echo -e "${DIM}${GRAY}[${AMBER}${_host}${GRAY}/${ELECTRIC_BLUE}${_model}${GRAY}] code mode${RESET}" >&2
        query_ollama_ssh "$_host" "$_model" "$*" "false"
        ;;
    --rag)
        shift
        echo ""
        echo -e "${VIOLET}${BOLD}RAG Search: ${WHITE}$*${RESET}"
        search_rag "$*" 20
        echo ""
        ;;
    --memory)
        echo ""
        echo -e "${ELECTRIC_BLUE}${BOLD}Conversation Memory${RESET}"
        if [[ -f "$MEMORY_FILE" ]]; then
            cat "$MEMORY_FILE" | jq -r '"\(.ts) [\(.role)]: \(.content | .[0:80])..."'
        else
            echo -e "${GRAY}No memory yet.${RESET}"
        fi
        echo ""
        ;;
    "")
        chat_mode
        ;;
    *)
        oneshot "$@"
        ;;
esac
