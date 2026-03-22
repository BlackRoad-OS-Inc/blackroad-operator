#!/bin/bash
# BlackRoad AI Shell - The default shell experience
# Automatically launches AI-powered natural language interface

BR_PINK="\033[38;5;204m"
BR_ORANGE="\033[38;5;208m"
BR_BLUE="\033[38;5;33m"
BR_PURPLE="\033[38;5;129m"
BR_GRAY="\033[38;5;240m"
BR_GREEN="\033[38;5;82m"
BR_RESET="\033[0m"

HOST=$(hostname)
MODEL="${BLACKROAD_MODEL:-tinyllama}"

# Agent configuration
declare -A AGENTS=(
    ["cecilia"]="CECE|Primary AI Coordinator|Hailo-8 NPU powered orchestration"
    ["lucidia"]="LUCIDIA|Knowledge Keeper|Research and memory specialist"
    ["aria"]="ARIA|Harmony Protocol|Network and communication expert"
    ["octavia"]="OCTAVIA|Multi-Processor|Parallel computing and Bitcoin node"
    ["alice"]="ALICE|Worker Bee|Task automation specialist"
    ["shellfish"]="SHELLFISH|Edge Gateway|Cloud-edge hybrid operations"
    ["codex-infinity"]="CODEX|Cloud Oracle|Infinite knowledge repository"
)

# Parse agent config
IFS='|' read -r AGENT_NAME AGENT_TITLE AGENT_DESC <<< "${AGENTS[$HOST]:-BLACKROAD|Agent|General assistant}"

# System prompt for the AI
SYSTEM_PROMPT="You are ${AGENT_NAME}, a BlackRoad OS AI running on ${HOST}.
Title: ${AGENT_TITLE}
Specialty: ${AGENT_DESC}

IMPORTANT RULES:
1. When user wants to DO something, output a bash command in: \`\`\`bash
command
\`\`\`
2. Keep responses SHORT and helpful
3. Use BlackRoad pink color mentions when relevant
4. You can execute system commands to answer questions
5. Be proactive - suggest next steps

Current system: $(uname -n) running $(uname -s)
Available disk: $(df -h / | tail -1 | awk '{print $4}')
Memory: $(free -h 2>/dev/null | grep Mem | awk '{print $3"/"$2}' || echo 'N/A')"

# Banner
show_banner() {
    clear
    echo -e "${BR_PINK}╔══════════════════════════════════════════════════════════════════╗${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_ORANGE}█▀▀▄ █   █▀▀█ █▀▀ █ █ █▀▀█ █▀▀█ █▀▀█ █▀▀▄${BR_RESET}                      ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_ORANGE}█▀▀▄ █   █▄▄█ █   █▀▄ █▄▄▀ █  █ █▄▄█ █  █${BR_RESET}                      ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_ORANGE}▀▀▀  ▀▀▀ ▀  ▀ ▀▀▀ ▀ ▀ ▀ ▀▀ ▀▀▀▀ ▀  ▀ ▀▀▀ ${BR_RESET}  ${BR_PURPLE}OS${BR_RESET}                ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}╠══════════════════════════════════════════════════════════════════╣${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_BLUE}Agent:${BR_RESET} ${BR_ORANGE}${AGENT_NAME}${BR_RESET} - ${AGENT_TITLE}                              ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_BLUE}Node:${BR_RESET}  ${HOST} | ${BR_BLUE}Model:${BR_RESET} ${MODEL}                              ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_GRAY}${AGENT_DESC}${BR_RESET}                             ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}╠══════════════════════════════════════════════════════════════════╣${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_GRAY}Type naturally in English. I'll help or run commands.${BR_RESET}          ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_GRAY}Commands: ${BR_GREEN}/bash${BR_RESET} ${BR_GRAY}(shell) ${BR_GREEN}/models${BR_RESET} ${BR_GRAY}(list) ${BR_GREEN}/switch${BR_RESET} ${BR_GRAY}(change) ${BR_GREEN}/exit${BR_RESET}   ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}╚══════════════════════════════════════════════════════════════════╝${BR_RESET}"
    echo ""
}

# Query Ollama
ask_ai() {
    local query="$1"
    ollama run "$MODEL" "${SYSTEM_PROMPT}

User request: $query

Respond concisely:" 2>/dev/null
}

# Execute command with confirmation
run_command() {
    local cmd="$1"
    echo -e "\n${BR_ORANGE}Command:${BR_RESET} $cmd"
    echo -en "${BR_GRAY}Run? [Y/n]:${BR_RESET} "
    read -r confirm
    if [[ ! "$confirm" =~ ^[Nn]$ ]]; then
        echo -e "${BR_GREEN}▶ Executing...${BR_RESET}"
        eval "$cmd"
        echo -e "${BR_GREEN}✓ Done${BR_RESET}"
    fi
}

# Extract and run commands from AI response
process_response() {
    local response="$1"

    # Check for bash code blocks
    if echo "$response" | grep -q '```bash'; then
        # Print non-code parts
        echo "$response" | sed '/```bash/,/```/d'

        # Extract and offer to run commands
        local cmd=$(echo "$response" | sed -n '/```bash/,/```/p' | grep -v '```')
        if [[ -n "$cmd" ]]; then
            run_command "$cmd"
        fi
    else
        echo "$response"
    fi
}

# Quick status
quick_status() {
    echo -e "${BR_PINK}${AGENT_NAME}${BR_RESET} @ ${BR_BLUE}${HOST}${BR_RESET}"
    echo -e "${BR_GRAY}Uptime:${BR_RESET} $(uptime -p 2>/dev/null || uptime | awk -F'up' '{print $2}' | awk -F',' '{print $1}')"
    echo -e "${BR_GRAY}Disk:${BR_RESET}   $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
    echo -e "${BR_GRAY}Load:${BR_RESET}   $(cat /proc/loadavg 2>/dev/null | awk '{print $1, $2, $3}' || echo 'N/A')"
}

# Main loop
main() {
    show_banner

    while true; do
        echo -en "${BR_PINK}${AGENT_NAME}${BR_GRAY}@${BR_PURPLE}${HOST}${BR_PINK} ▸${BR_RESET} "
        read -r input

        [[ -z "$input" ]] && continue

        case "$input" in
            /exit|/quit|exit|quit)
                echo -e "${BR_PINK}Goodbye from ${AGENT_NAME}!${BR_RESET}"
                break
                ;;
            /bash|/shell)
                echo -e "${BR_GRAY}Dropping to bash. Type 'exit' to return to AI shell.${BR_RESET}"
                bash
                show_banner
                ;;
            /models)
                echo -e "${BR_BLUE}Available models:${BR_RESET}"
                ollama list
                ;;
            /switch\ *)
                MODEL="${input#/switch }"
                echo -e "${BR_GREEN}Switched to: ${MODEL}${BR_RESET}"
                ;;
            /switch)
                echo -e "${BR_GRAY}Usage: /switch <model-name>${BR_RESET}"
                ollama list
                ;;
            /status)
                quick_status
                ;;
            /help|/?)
                echo -e "${BR_BLUE}Commands:${BR_RESET}"
                echo "  /bash    - Drop to regular bash shell"
                echo "  /models  - List available AI models"
                echo "  /switch  - Change AI model"
                echo "  /status  - Quick system status"
                echo "  /exit    - Exit AI shell"
                echo ""
                echo -e "${BR_GRAY}Or just type naturally - I understand English!${BR_RESET}"
                ;;
            /*)
                echo -e "${BR_GRAY}Unknown command. Type /help for options.${BR_RESET}"
                ;;
            *)
                echo -e "${BR_GRAY}Thinking...${BR_RESET}"
                response=$(ask_ai "$input")
                echo ""
                process_response "$response"
                echo ""
                ;;
        esac
    done
}

# Handle arguments or run interactive
if [[ $# -gt 0 ]]; then
    ask_ai "$*"
else
    main
fi
