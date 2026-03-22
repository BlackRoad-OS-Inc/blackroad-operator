#!/bin/bash
# BlackRoad Natural Language Shell
# Type English, get results

BR_PINK="\033[38;5;204m"
BR_ORANGE="\033[38;5;208m"
BR_BLUE="\033[38;5;33m"
BR_GRAY="\033[38;5;240m"
BR_GREEN="\033[38;5;82m"
BR_RESET="\033[0m"

HOST=$(hostname)
MODEL="${BLACKROAD_MODEL:-tinyllama}"

# Agent personality based on hostname
case "$HOST" in
    cecilia)
        AGENT_NAME="CECE"
        AGENT_ROLE="Primary AI Coordinator with Hailo-8 NPU. Expert in orchestration and system management."
        ;;
    lucidia)
        AGENT_NAME="LUCIDIA"
        AGENT_ROLE="Knowledge and Memory Specialist. Expert in research, documentation, and data analysis."
        ;;
    aria)
        AGENT_NAME="ARIA"
        AGENT_ROLE="Harmony Protocol Manager. Expert in networking, communication, and system integration."
        ;;
    octavia)
        AGENT_NAME="OCTAVIA"
        AGENT_ROLE="Multi-arm Processing Expert. Specialist in parallel computing, Bitcoin, and heavy workloads."
        ;;
    alice)
        AGENT_NAME="ALICE"
        AGENT_ROLE="Worker Node Coordinator. Efficient task executor and automation specialist."
        ;;
    shellfish)
        AGENT_NAME="SHELLFISH"
        AGENT_ROLE="Edge Computing Gateway. Cloud-edge hybrid specialist and external API handler."
        ;;
    codex-infinity)
        AGENT_NAME="CODEX"
        AGENT_ROLE="Cloud Oracle and Knowledge Repository. Expert in documentation and infinite storage."
        ;;
    *)
        AGENT_NAME="BLACKROAD"
        AGENT_ROLE="BlackRoad OS Agent. General purpose assistant."
        ;;
esac

SYSTEM_PROMPT="You are ${AGENT_NAME}, a BlackRoad OS AI agent running on ${HOST}.
Role: ${AGENT_ROLE}

You help users by:
1. Answering questions about the system
2. Suggesting and executing shell commands
3. Managing files and services
4. Coordinating with other BlackRoad nodes

When the user asks you to DO something (not just explain), output the command in this format:
\`\`\`execute
command here
\`\`\`

Keep responses concise. Use BlackRoad terminology. Be helpful and proactive."

# Function to query Ollama
ask_ollama() {
    local query="$1"
    local response

    response=$(ollama run "$MODEL" "$SYSTEM_PROMPT

User: $query" 2>/dev/null)

    echo "$response"
}

# Function to extract and optionally execute commands
process_response() {
    local response="$1"

    # Check for executable commands
    if echo "$response" | grep -q '```execute'; then
        local cmd=$(echo "$response" | sed -n '/```execute/,/```/p' | grep -v '```')

        # Show the command
        echo -e "\n${BR_ORANGE}Command:${BR_RESET} $cmd"
        echo -en "${BR_GRAY}Execute? [y/N]: ${BR_RESET}"
        read -r confirm

        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            echo -e "${BR_GREEN}Executing...${BR_RESET}"
            eval "$cmd"
        else
            echo -e "${BR_GRAY}Skipped${BR_RESET}"
        fi

        # Show non-command part of response
        echo "$response" | sed '/```execute/,/```/d'
    else
        echo "$response"
    fi
}

# Interactive mode
interactive_shell() {
    echo -e "${BR_PINK}╔══════════════════════════════════════════════════════════╗${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_ORANGE}${AGENT_NAME}${BR_RESET} - BlackRoad Natural Language Shell            ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}║${BR_RESET}  ${BR_GRAY}Type English commands. 'exit' to quit.${BR_RESET}                ${BR_PINK}║${BR_RESET}"
    echo -e "${BR_PINK}╚══════════════════════════════════════════════════════════╝${BR_RESET}"
    echo ""

    while true; do
        echo -en "${BR_PINK}${AGENT_NAME}${BR_GRAY}@${BR_BLUE}${HOST}${BR_PINK} ▸${BR_RESET} "
        read -r input

        [[ -z "$input" ]] && continue
        [[ "$input" == "exit" || "$input" == "quit" ]] && break

        # Special commands
        case "$input" in
            "help"|"?")
                echo -e "${BR_ORANGE}Commands:${BR_RESET}"
                echo "  Any English question or instruction"
                echo "  'status' - System status"
                echo "  'models' - List available models"
                echo "  'switch <model>' - Change AI model"
                echo "  'exit' - Exit shell"
                continue
                ;;
            "status")
                br-info 2>/dev/null || echo "$(hostname): $(uptime -p)"
                continue
                ;;
            "models")
                ollama list
                continue
                ;;
            switch\ *)
                MODEL="${input#switch }"
                echo -e "${BR_GREEN}Switched to model: ${MODEL}${BR_RESET}"
                continue
                ;;
        esac

        echo -e "${BR_GRAY}Thinking...${BR_RESET}"
        response=$(ask_ollama "$input")
        process_response "$response"
        echo ""
    done

    echo -e "${BR_PINK}Goodbye from ${AGENT_NAME}!${BR_RESET}"
}

# Main
if [[ $# -gt 0 ]]; then
    # One-shot mode
    response=$(ask_ollama "$*")
    process_response "$response"
else
    # Interactive mode
    interactive_shell
fi
