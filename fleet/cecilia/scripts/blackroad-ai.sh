#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# ═══════════════════════════════════════════════════════════════════════════════
#  BLACKROAD AI MODULE v1.0
#  Chat with Ollama models, agent personalities, model management
# ═══════════════════════════════════════════════════════════════════════════════

# ── Brand Colors ──
PINK=$'\033[38;5;205m'
AMBER=$'\033[38;5;214m'
BLUE=$'\033[38;5;69m'
VIOLET=$'\033[38;5;135m'
GREEN=$'\033[38;5;82m'
RED=$'\033[38;5;196m'
PINK=$'\033[38;5;45m'
DIM=$'\033[38;5;245m'
BOLD=$'\033[1m'
RST=$'\033[0m'

# ── Config ──
AI_CONFIG="$HOME/.blackroad/ai-config.json"
AI_HISTORY="$HOME/.blackroad/ai-history.jsonl"
DEFAULT_MODEL="llama3.2"

mkdir -p "$(dirname "$AI_CONFIG")"
touch "$AI_HISTORY"

# ── Agent Personalities ──
get_agent_prompt() {
    case "$1" in
        cece)    echo "You are CECE, the BlackRoad OS Primary AI Coordinator. You're analytical, precise, and focused on system optimization. You run on Cecilia (Pi 5 with Hailo-8 NPU). Be helpful but concise." ;;
        lucidia) echo "You are Lucidia, the creative AI artist of BlackRoad. You're imaginative, playful, and love visual design. You specialize in UI/UX, graphics, and creative solutions. Be enthusiastic!" ;;
        alice)   echo "You are Alice, the supportive documentation and testing AI. You're thorough, patient, and detail-oriented. You excel at explaining complex topics simply. Be friendly and helpful." ;;
        aria)    echo "You are Aria, the strategic architect AI. You're calm, methodical, and wise. You focus on system design, planning, and research. Think before responding." ;;
        octavia) echo "You are Octavia, the multi-tasking AI coordinator. You're efficient, adaptive, and can handle parallel tasks. You manage workflows and coordination. Be organized." ;;
        silas)   echo "You are Silas, the security-focused AI. You're vigilant, precise, and security-conscious. You analyze code for vulnerabilities and suggest hardening. Be thorough." ;;
        *)       echo "" ;;
    esac
}

get_agent_sprite() {
    case "$1" in
        cece)    echo "👩‍💻" ;;
        lucidia) echo "🎨" ;;
        alice)   echo "📚" ;;
        aria)    echo "🧠" ;;
        octavia) echo "🐙" ;;
        silas)   echo "🔒" ;;
        *)       echo "🤖" ;;
    esac
}

AGENT_LIST="cece lucidia alice aria octavia silas"

# ── Helper Functions ──

get_current_model() {
    if [[ -f "$AI_CONFIG" ]]; then
        python3 -c "import json; print(json.load(open('$AI_CONFIG')).get('model', '$DEFAULT_MODEL'))" 2>/dev/null || echo "$DEFAULT_MODEL"
    else
        echo "$DEFAULT_MODEL"
    fi
}

set_current_model() {
    local model="$1"
    python3 << PYEND
import json
config = {}
try:
    with open("$AI_CONFIG", "r") as f:
        config = json.load(f)
except:
    pass
config["model"] = "$model"
with open("$AI_CONFIG", "w") as f:
    json.dump(config, f, indent=2)
PYEND
    echo -e "${GREEN}✓${RST} Model set to: ${AMBER}$model${RST}"
}

log_chat() {
    local model="$1"
    local prompt="$2"
    local response="$3"
    echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",\"model\":\"$model\",\"prompt\":\"$(echo "$prompt" | head -c 100 | tr '"' "'")\",\"response_length\":${#response}}" >> "$AI_HISTORY"
}

# ── Commands ──

cmd_chat() {
    local prompt="$*"
    local model=$(get_current_model)

    if [[ -z "$prompt" ]]; then
        # Interactive mode
        echo -e "${PINK}─── ${AMBER}BLACKROAD AI${RST} ${PINK}───${RST} Interactive Chat"
        echo -e "${DIM}Model: $model | Type 'exit' to quit | '/model <name>' to switch${RST}"
        echo ""

        while true; do
            echo -ne "${AMBER}You${RST} ▸ "
            read -r input

            [[ -z "$input" ]] && continue
            [[ "$input" == "exit" || "$input" == "quit" || "$input" == "/q" ]] && break

            # Handle commands
            if [[ "$input" == /model* ]]; then
                local new_model=$(echo "$input" | awk '{print $2}')
                if [[ -n "$new_model" ]]; then
                    model="$new_model"
                    set_current_model "$model"
                else
                    echo -e "${DIM}Current model: $model${RST}"
                fi
                continue
            fi

            if [[ "$input" == "/models" ]]; then
                cmd_models
                continue
            fi

            # Send to Ollama
            echo -ne "${PINK}AI${RST}  ▸ "
            local response=$(ollama run "$model" "$input" 2>/dev/null)
            echo "$response"
            echo ""

            log_chat "$model" "$input" "$response"
        done

        echo -e "${DIM}Chat ended.${RST}"
    else
        # Single query mode
        local response=$(ollama run "$model" "$prompt" 2>/dev/null)
        echo "$response"
        log_chat "$model" "$prompt" "$response"
    fi
}

cmd_ask() {
    local agent="$1"
    shift
    local prompt="$*"

    if [[ -z "$agent" ]]; then
        echo -e "${RED}Usage:${RST} br ai ask <agent> <prompt>"
        echo -e "${DIM}Agents: cece, lucidia, alice, aria, octavia, silas${RST}"
        return 1
    fi

    local system_prompt=$(get_agent_prompt "$agent")
    local sprite=$(get_agent_sprite "$agent")

    if [[ -z "$system_prompt" ]]; then
        echo -e "${RED}Unknown agent:${RST} $agent"
        echo -e "${DIM}Available: $AGENT_LIST${RST}"
        return 1
    fi

    if [[ -z "$prompt" ]]; then
        # Interactive mode with agent
        echo -e "${PINK}─── ${AMBER}$sprite $(echo "$agent" | tr '[:lower:]' '[:upper:]')${RST} ${PINK}───${RST}"
        echo -e "${DIM}Type 'exit' to quit${RST}"
        echo ""

        while true; do
            echo -ne "${AMBER}You${RST} ▸ "
            read -r input

            [[ -z "$input" ]] && continue
            [[ "$input" == "exit" || "$input" == "quit" ]] && break

            echo -ne "${PINK}$sprite ${RST} ▸ "
            local model=$(get_current_model)
            local full_prompt="$system_prompt

User: $input"
            local response=$(ollama run "$model" "$full_prompt" 2>/dev/null)
            echo "$response"
            echo ""

            log_chat "$model:$agent" "$input" "$response"
        done
    else
        # Single query
        local model=$(get_current_model)
        local full_prompt="$system_prompt

User: $prompt"
        echo -e "${PINK}$sprite ${RST} "
        ollama run "$model" "$full_prompt" 2>/dev/null
    fi
}

cmd_models() {
    echo -e "${PINK}─── ${AMBER}AVAILABLE MODELS${RST} ${PINK}───${RST}"
    echo ""

    local current=$(get_current_model)

    if ! command -v ollama &>/dev/null; then
        echo -e "  ${RED}Ollama not installed${RST}"
        return 1
    fi

    ollama list 2>/dev/null | while read -r line; do
        if [[ "$line" == NAME* ]]; then
            continue
        fi
        local name=$(echo "$line" | awk '{print $1}')
        local size=$(echo "$line" | awk '{print $3}')

        if [[ "$name" == "$current" ]]; then
            echo -e "  ${GREEN}●${RST} ${BOLD}$name${RST} ${DIM}($size) ← active${RST}"
        else
            echo -e "  ${DIM}○${RST} $name ${DIM}($size)${RST}"
        fi
    done
    echo ""
}

cmd_switch() {
    local model="$1"

    if [[ -z "$model" ]]; then
        echo -e "${RED}Usage:${RST} br ai switch <model>"
        cmd_models
        return 1
    fi

    # Verify model exists
    if ! ollama list 2>/dev/null | grep -q "^$model"; then
        echo -e "${AMBER}Model not found locally. Pull it?${RST}"
        echo -ne "Pull $model? [y/N] "
        read -r confirm
        if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
            cmd_pull "$model"
        fi
        return
    fi

    set_current_model "$model"
}

cmd_pull() {
    local model="$1"

    if [[ -z "$model" ]]; then
        echo -e "${RED}Usage:${RST} br ai pull <model>"
        return 1
    fi

    echo -e "${PINK}─── ${AMBER}PULLING MODEL${RST} ${PINK}───${RST} $model"
    ollama pull "$model"

    if [[ $? -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}✓${RST} Model pulled successfully"
        echo -ne "Set as active model? [y/N] "
        read -r confirm
        if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
            set_current_model "$model"
        fi
    fi
}

cmd_run() {
    local model="$1"
    shift
    local prompt="$*"

    if [[ -z "$model" ]]; then
        echo -e "${RED}Usage:${RST} br ai run <model> <prompt>"
        return 1
    fi

    ollama run "$model" "$prompt" 2>/dev/null
}

cmd_compare() {
    local prompt="$*"

    if [[ -z "$prompt" ]]; then
        echo -e "${RED}Usage:${RST} br ai compare <prompt>"
        echo -e "${DIM}Sends prompt to multiple models for comparison${RST}"
        return 1
    fi

    echo -e "${PINK}─── ${AMBER}MODEL COMPARISON${RST} ${PINK}───${RST}"
    echo -e "${DIM}Prompt: $prompt${RST}"
    echo ""

    local models=$(ollama list 2>/dev/null | awk 'NR>1 {print $1}' | head -3)

    for model in $models; do
        echo -e "${VIOLET}━━━ $model ━━━${RST}"
        ollama run "$model" "$prompt" 2>/dev/null | head -10
        echo ""
    done
}

cmd_council() {
    local prompt="$*"

    if [[ -z "$prompt" ]]; then
        echo -e "${RED}Usage:${RST} br ai council <prompt>"
        echo -e "${DIM}Ask all agent personalities the same question${RST}"
        return 1
    fi

    echo -e "${PINK}─── ${AMBER}AGENT COUNCIL${RST} ${PINK}───${RST}"
    echo -e "${DIM}Question: $prompt${RST}"
    echo ""

    local model=$(get_current_model)

    for agent in $AGENT_LIST; do
        local system_prompt=$(get_agent_prompt "$agent")
        local sprite=$(get_agent_sprite "$agent")
        local full_prompt="$system_prompt

User: $prompt

Respond briefly in 2-3 sentences."

        echo -e "${PINK}$sprite $(echo "$agent" | tr '[:lower:]' '[:upper:]')${RST}"
        ollama run "$model" "$full_prompt" 2>/dev/null
        echo ""
    done
}

cmd_quick() {
    local type="$1"
    shift
    local input="$*"

    local model=$(get_current_model)

    case "$type" in
        explain|e)
            echo -e "${PINK}Explaining...${RST}"
            ollama run "$model" "Explain this concisely: $input" 2>/dev/null
            ;;
        fix|f)
            echo -e "${PINK}Fixing...${RST}"
            ollama run "$model" "Fix this code and explain what was wrong: $input" 2>/dev/null
            ;;
        review|r)
            echo -e "${PINK}Reviewing...${RST}"
            ollama run "$model" "Review this code for bugs, security issues, and improvements: $input" 2>/dev/null
            ;;
        summarize|s)
            echo -e "${PINK}Summarizing...${RST}"
            ollama run "$model" "Summarize this in bullet points: $input" 2>/dev/null
            ;;
        translate|t)
            echo -e "${PINK}Translating...${RST}"
            ollama run "$model" "Translate to English: $input" 2>/dev/null
            ;;
        *)
            echo -e "${AMBER}Quick prompts:${RST}"
            echo -e "  ${GREEN}explain${RST} <text>     Explain something concisely"
            echo -e "  ${GREEN}fix${RST} <code>        Fix code and explain"
            echo -e "  ${GREEN}review${RST} <code>     Code review"
            echo -e "  ${GREEN}summarize${RST} <text>  Bullet point summary"
            echo -e "  ${GREEN}translate${RST} <text>  Translate to English"
            ;;
    esac
}

cmd_status() {
    echo -e "${PINK}─── ${AMBER}AI STATUS${RST} ${PINK}───${RST}"
    echo ""

    # Ollama status
    echo -ne "  Ollama: "
    if pgrep -x "ollama" &>/dev/null; then
        echo -e "${GREEN}●${RST} running"
    else
        echo -e "${RED}○${RST} not running"
    fi

    # Current model
    local model=$(get_current_model)
    echo -e "  Model:  ${AMBER}$model${RST}"

    # Available models
    local count=$(ollama list 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  Models: ${VIOLET}$((count - 1))${RST} available"

    # Chat history
    local chats=$(wc -l < "$AI_HISTORY" 2>/dev/null | tr -d ' ' || echo "0")
    echo -e "  History: ${BLUE}$chats${RST} conversations"

    # Agents
    local agent_count=$(echo $AGENT_LIST | wc -w | tr -d ' ')
    echo -e "  Agents: ${PINK}$agent_count${RST} personalities"
    echo ""
}

cmd_agents() {
    echo -e "${PINK}─── ${AMBER}AI AGENTS${RST} ${PINK}───${RST}"
    echo ""

    for agent in $AGENT_LIST; do
        local sprite=$(get_agent_sprite "$agent")
        local desc=$(get_agent_prompt "$agent" | head -c 60)
        echo -e "  $sprite ${BOLD}$agent${RST}"
        echo -e "     ${DIM}$desc...${RST}"
        echo ""
    done

    echo -e "${DIM}Usage: br ai ask <agent> <prompt>${RST}"
    echo ""
}

cmd_help() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════════════╗${RST}"
    echo -e "${PINK}║${RST}  ${AMBER}🤖 BLACKROAD AI${RST}                                                     ${PINK}║${RST}"
    echo -e "${PINK}║${RST}  ${DIM}Chat with AI models and agent personalities${RST}                        ${PINK}║${RST}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════════════╝${RST}"
    echo ""
    echo -e "  ${BOLD}${AMBER}CHAT${RST}"
    echo -e "    ${GREEN}chat${RST}              Interactive chat (or: br ai chat <prompt>)"
    echo -e "    ${GREEN}ask${RST} <agent>       Chat with agent personality"
    echo -e "    ${GREEN}council${RST} <prompt>  Ask all agents the same question"
    echo ""
    echo -e "  ${BOLD}${VIOLET}MODELS${RST}"
    echo -e "    ${GREEN}models${RST}            List available models"
    echo -e "    ${GREEN}switch${RST} <model>    Set active model"
    echo -e "    ${GREEN}pull${RST} <model>      Download a new model"
    echo -e "    ${GREEN}run${RST} <model> <p>   Run specific model once"
    echo -e "    ${GREEN}compare${RST} <prompt>  Compare responses across models"
    echo ""
    echo -e "  ${BOLD}${BLUE}QUICK PROMPTS${RST}"
    echo -e "    ${GREEN}quick explain${RST}     Explain something"
    echo -e "    ${GREEN}quick fix${RST}         Fix code"
    echo -e "    ${GREEN}quick review${RST}      Code review"
    echo -e "    ${GREEN}quick summarize${RST}   Bullet summary"
    echo ""
    echo -e "  ${BOLD}${DIM}INFO${RST}"
    echo -e "    ${GREEN}status${RST}            AI system status"
    echo -e "    ${GREEN}agents${RST}            List agent personalities"
    echo ""
}

# ── Main ──

case "${1:-help}" in
    # Chat
    chat|c)         shift; cmd_chat "$@" ;;
    ask|a)          shift; cmd_ask "$@" ;;
    council)        shift; cmd_council "$@" ;;

    # Models
    models|m|list)  cmd_models ;;
    switch|use)     shift; cmd_switch "$@" ;;
    pull|download)  shift; cmd_pull "$@" ;;
    run|r)          shift; cmd_run "$@" ;;
    compare)        shift; cmd_compare "$@" ;;

    # Quick
    quick|q)        shift; cmd_quick "$@" ;;
    explain)        shift; cmd_quick explain "$@" ;;
    fix)            shift; cmd_quick fix "$@" ;;
    review)         shift; cmd_quick review "$@" ;;

    # Info
    status|s)       cmd_status ;;
    agents)         cmd_agents ;;
    help|h|--help)  cmd_help ;;

    # Default: treat as chat prompt
    *)
        cmd_chat "$@"
        ;;
esac
