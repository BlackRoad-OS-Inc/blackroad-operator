#!/bin/bash
# BlackRoad Agent Orchestra
# Multi-agent system with specialized agents working together
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
VIOLET='\033[38;5;135m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

# Agent definitions
declare -A AGENTS=(
    ["lucidia"]="General assistant, friendly and helpful"
    ["coder"]="Expert programmer, writes clean code"
    ["analyst"]="Data analyst, breaks down complex problems"
    ["critic"]="Critical reviewer, finds flaws and improvements"
    ["creative"]="Creative thinker, generates novel ideas"
)

declare -A AGENT_MODELS=(
    ["lucidia"]="llama3.2:1b"
    ["coder"]="codellama:7b"
    ["analyst"]="llama3.2:3b"
    ["critic"]="llama3.2:1b"
    ["creative"]="tinyllama"
)

declare -A AGENT_NODES=(
    ["lucidia"]="lucidia"
    ["coder"]="cecilia"
    ["analyst"]="cecilia"
    ["critic"]="octavia"
    ["creative"]="lucidia"
)

# Query a specific agent
query_agent() {
    local agent="$1"
    local prompt="$2"

    local model="${AGENT_MODELS[$agent]}"
    local node="${AGENT_NODES[$agent]}"
    local personality="${AGENTS[$agent]}"

    local full_prompt="You are $agent, a specialized AI agent. Your role: $personality. Respond concisely and in character.

User: $prompt
$agent:"

    ssh -o ConnectTimeout=10 "$node" \
        "curl -s http://localhost:11434/api/generate -d '{\"model\":\"$model\",\"prompt\":\"$full_prompt\",\"stream\":false}'" 2>/dev/null \
        | jq -r '.response // "No response"'
}

# Multi-agent discussion on a topic
discuss() {
    local topic="$*"

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🎭 AGENT ORCHESTRA - DISCUSSION 🎭                 ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo -e "${YELLOW}Topic: $topic${RESET}"
    echo

    # Each agent weighs in
    for agent in lucidia coder analyst critic creative; do
        local color
        case $agent in
            lucidia) color=$VIOLET ;;
            coder) color=$GREEN ;;
            analyst) color=$BLUE ;;
            critic) color=$YELLOW ;;
            creative) color=$AMBER ;;
        esac

        echo -e "${color}[$agent]${RESET} thinking..."
        local response=$(query_agent "$agent" "Give your perspective on: $topic (2-3 sentences max)")
        echo -e "${color}$agent:${RESET} $response"
        echo
    done
}

# Chain of agents for complex task
chain() {
    local task="$*"

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🔗 AGENT CHAIN - COMPLEX TASK 🔗                   ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo -e "${YELLOW}Task: $task${RESET}"
    echo

    # Step 1: Analyst breaks down the task
    echo -e "${BLUE}[Step 1: Analyst]${RESET} Breaking down the task..."
    local analysis=$(query_agent "analyst" "Break down this task into 3 steps: $task")
    echo -e "$analysis"
    echo

    # Step 2: Creative generates ideas
    echo -e "${AMBER}[Step 2: Creative]${RESET} Generating ideas..."
    local ideas=$(query_agent "creative" "Based on this analysis, suggest creative approaches: $analysis")
    echo -e "$ideas"
    echo

    # Step 3: Coder implements (if applicable)
    echo -e "${GREEN}[Step 3: Coder]${RESET} Creating implementation..."
    local code=$(query_agent "coder" "Write code or a solution for: $task. Context: $analysis")
    echo -e "$code"
    echo

    # Step 4: Critic reviews
    echo -e "${YELLOW}[Step 4: Critic]${RESET} Reviewing..."
    local review=$(query_agent "critic" "Review this solution and suggest improvements: $code")
    echo -e "$review"
    echo

    # Step 5: Lucidia summarizes
    echo -e "${VIOLET}[Step 5: Lucidia]${RESET} Summarizing..."
    local summary=$(query_agent "lucidia" "Summarize the final solution for the user: Task: $task, Solution: $code, Review: $review")
    echo -e "$summary"
}

# Debate between agents
debate() {
    local topic="$*"
    local rounds="${2:-2}"

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           ⚔️  AGENT DEBATE ⚔️                                 ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo -e "${YELLOW}Topic: $topic${RESET}"
    echo

    local pro_point=""
    local con_point=""

    for ((i=1; i<=rounds; i++)); do
        echo -e "${GREEN}--- Round $i ---${RESET}"
        echo

        # Creative argues FOR
        echo -e "${AMBER}[Creative - PRO]${RESET}"
        pro_point=$(query_agent "creative" "Argue IN FAVOR of: $topic. Previous counter: $con_point. Be persuasive, 2 sentences.")
        echo "$pro_point"
        echo

        # Critic argues AGAINST
        echo -e "${YELLOW}[Critic - CON]${RESET}"
        con_point=$(query_agent "critic" "Argue AGAINST: $topic. Previous argument: $pro_point. Find flaws, 2 sentences.")
        echo "$con_point"
        echo
    done

    # Lucidia judges
    echo -e "${VIOLET}[Lucidia - JUDGE]${RESET}"
    local verdict=$(query_agent "lucidia" "Judge this debate on '$topic'. Pro said: $pro_point. Con said: $con_point. Who made better points?")
    echo "$verdict"
}

# Parallel query all agents
parallel_query() {
    local prompt="$*"

    echo -e "${PINK}=== PARALLEL AGENT QUERY ===${RESET}"
    echo -e "Prompt: $prompt"
    echo

    for agent in "${!AGENTS[@]}"; do
        (
            local response=$(query_agent "$agent" "$prompt")
            echo -e "${GREEN}[$agent]${RESET} $response"
        ) &
    done
    wait
}

# Agent status
status() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🎭 AGENT ORCHESTRA STATUS 🎭                       ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo

    for agent in "${!AGENTS[@]}"; do
        local node="${AGENT_NODES[$agent]}"
        local model="${AGENT_MODELS[$agent]}"
        local role="${AGENTS[$agent]}"

        echo -n "  $agent ($node/$model): "
        if ssh -o ConnectTimeout=2 "$node" "curl -s http://localhost:11434/api/tags" >/dev/null 2>&1; then
            echo -e "${GREEN}ONLINE${RESET}"
        else
            echo -e "${YELLOW}OFFLINE${RESET}"
        fi
        echo "    Role: $role"
    done
}

# Help
help() {
    echo -e "${PINK}BlackRoad Agent Orchestra${RESET}"
    echo
    echo "Multi-agent AI system with specialized agents"
    echo
    echo "Agents:"
    for agent in "${!AGENTS[@]}"; do
        echo "  $agent: ${AGENTS[$agent]}"
    done
    echo
    echo "Commands:"
    echo "  status              Show agent status"
    echo "  discuss <topic>     Multi-agent discussion"
    echo "  chain <task>        Agent chain for complex task"
    echo "  debate <topic>      Agent debate (pro vs con)"
    echo "  parallel <prompt>   Query all agents in parallel"
    echo "  ask <agent> <q>     Query specific agent"
    echo
    echo "Examples:"
    echo "  $0 discuss 'Should AI be regulated?'"
    echo "  $0 chain 'Build a REST API for user management'"
    echo "  $0 debate 'Python is better than JavaScript'"
    echo "  $0 ask coder 'Write a quicksort function'"
}

case "${1:-help}" in
    status)
        status
        ;;
    discuss)
        shift
        discuss "$@"
        ;;
    chain)
        shift
        chain "$@"
        ;;
    debate)
        shift
        debate "$@"
        ;;
    parallel)
        shift
        parallel_query "$@"
        ;;
    ask)
        query_agent "$2" "$3"
        ;;
    *)
        help
        ;;
esac
