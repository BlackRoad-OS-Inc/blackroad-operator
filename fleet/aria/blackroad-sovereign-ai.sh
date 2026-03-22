#!/bin/bash
# BlackRoad Sovereign AI - Pi Local Version
# Runs directly on Pi, queries local Ollama

# Colors
HOT_PINK='\033[38;2;255;29;108m'
AMBER='\033[38;2;245;166;35m'
VIOLET='\033[38;2;156;39;176m'
BLUE='\033[38;2;41;121;255m'
GREEN='\033[38;2;0;230;118m'
GRAY='\033[38;2;117;117;117m'
WHITE='\033[38;2;255;255;255m'
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

HOST=$(hostname)
BRAIN_FILE="$HOME/.blackroad/sovereign-brain.txt"
MODEL="${BLACKROAD_MODEL:-}"

# Auto-detect best model
find_model() {
    local models=$(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}')
    for m in qwen3:8b qwen2.5-coder:3b llama3.2:3b llama3:latest phi3.5:latest tinyllama:latest; do
        if echo "$models" | grep -qx "$m"; then
            echo "$m"
            return
        fi
    done
    echo "$models" | head -1
}

query() {
    local prompt="$1"
    local model="${MODEL:-$(find_model)}"
    
    # Load brain if exists
    if [[ -f "$BRAIN_FILE" ]]; then
        local brain=$(cat "$BRAIN_FILE")
        prompt="[SYSTEM CONTEXT]
${brain}

[USER QUERY]
${prompt}"
    fi
    
    TERM=dumb ollama run "$model" "$prompt" 2>/dev/null
}

show_help() {
    echo ""
    echo -e "${BOLD}${AMBER}SOVEREIGN AI${RESET} ${DIM}on ${VIOLET}${HOST}${RESET}"
    echo -e "${GRAY}Local inference, zero tokenization${RESET}"
    echo ""
    echo -e "  ${AMBER}ask${RESET} 'question'   ${GRAY}Query local Ollama${RESET}"
    echo -e "  ${AMBER}ask${RESET}              ${GRAY}Interactive mode${RESET}"
    echo ""
}

chat_mode() {
    local model=$(find_model)
    echo ""
    echo -e "${HOT_PINK}╔═══════════════════════════════════════╗${RESET}"
    echo -e "${HOT_PINK}║${RESET}  ${BOLD}${AMBER}SOVEREIGN AI${RESET} ${DIM}on ${VIOLET}${HOST}${RESET}          ${HOT_PINK}║${RESET}"
    echo -e "${HOT_PINK}║${RESET}  ${GREEN}Model:${RESET} ${WHITE}${model}${RESET}                  ${HOT_PINK}║${RESET}"
    echo -e "${HOT_PINK}╚═══════════════════════════════════════╝${RESET}"
    echo ""
    
    while true; do
        echo -en "${HOT_PINK}${HOST}${GRAY} ▸${RESET} "
        read -r input
        [[ -z "$input" ]] && continue
        [[ "$input" == "exit" || "$input" == "/exit" ]] && break
        
        echo -e "${DIM}${VIOLET}Thinking...${RESET}"
        response=$(query "$input")
        echo -e "${WHITE}${response}${RESET}"
        echo ""
    done
}

# Main
case "${1:-}" in
    -h|--help|help) show_help ;;
    "") chat_mode ;;
    *) query "$*" ;;
esac
