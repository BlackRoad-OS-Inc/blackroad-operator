#!/bin/bash
# br-brady-bunch - Multi-Agent Collaboration System
# All models working together in parallel

set -euo pipefail

MODELS=(
  "Cece"
  "Lucidia"
  "Anastasia"
  "Aria"
  "Alice"
  "Cadence"
  "Copilot"
  "Claude"
  "Codex"
  "ChatGPT"
  "Alexa"
  "Gematria"
  "Silas"
)

COLORS=(
  "\033[38;5;198m"  # Hot Pink
  "\033[38;5;214m"  # Orange
  "\033[38;5;33m"   # Blue
  "\033[38;5;135m"  # Purple
  "\033[38;5;46m"   # Green
  "\033[38;5;201m"  # Magenta
  "\033[38;5;226m"  # Yellow
  "\033[38;5;51m"   # Cyan
  "\033[38;5;208m"  # Orange Red
  "\033[38;5;165m"  # Pink
  "\033[38;5;82m"   # Lime
  "\033[38;5;219m"  # Light Pink
  "\033[38;5;39m"   # Sky Blue
)

RESET="\033[0m"
BOLD="\033[1m"

show_banner() {
  clear
  echo -e "${COLORS[0]}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${COLORS[0]}║  ${BOLD}🖤🛣️  BlackRoad OS - Brady Bunch Multi-Agent System${RESET}${COLORS[0]}  ║${RESET}"
  echo -e "${COLORS[0]}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  echo -e "${COLORS[1]}${BOLD}Active Models:${RESET}"
  for i in "${!MODELS[@]}"; do
    color_idx=$((i % ${#COLORS[@]}))
    echo -e "  ${COLORS[$color_idx]}●${RESET} ${MODELS[$i]}"
  done
  echo ""
}

# Get response from a single model
ask_model() {
  local model="$1"
  local prompt="$2"
  local max_tokens="${3:-100}"
  
  # Run in background and capture output
  ollama run "$model" "$prompt" 2>/dev/null | head -c 500 &
  local pid=$!
  
  # Wait with timeout
  local count=0
  while kill -0 $pid 2>/dev/null && [ $count -lt 15 ]; do
    sleep 0.5
    count=$((count + 1))
  done
  
  # Kill if still running
  kill $pid 2>/dev/null || true
  wait $pid 2>/dev/null || true
}

# Round-robin discussion
roundtable() {
  local topic="$1"
  
  show_banner
  echo -e "${BOLD}${COLORS[0]}━━━ ROUNDTABLE DISCUSSION ━━━${RESET}"
  echo -e "${COLORS[1]}Topic: $topic${RESET}\n"
  
  for i in "${!MODELS[@]}"; do
    color_idx=$((i % ${#COLORS[@]}))
    model="${MODELS[$i]}"
    
    echo -e "${COLORS[$color_idx]}${BOLD}[$model]:${RESET}"
    
    response=$(ask_model "$model" "In one sentence, what's your take on: $topic" 150)
    echo -e "${COLORS[$color_idx]}$response${RESET}\n"
    
    sleep 0.5
  done
}

# Parallel consensus building
consensus() {
  local question="$1"
  local temp_dir=$(mktemp -d)
  
  show_banner
  echo -e "${BOLD}${COLORS[0]}━━━ PARALLEL CONSENSUS ━━━${RESET}"
  echo -e "${COLORS[1]}Question: $question${RESET}\n"
  
  # Ask all models in parallel
  for i in "${!MODELS[@]}"; do
    model="${MODELS[$i]}"
    (
      response=$(ollama run "$model" "Answer in one word: $question" 2>/dev/null | head -c 50)
      echo "$response" > "$temp_dir/$i-$model"
    ) &
  done
  
  # Wait for all to complete (with timeout)
  sleep 10
  
  # Collect responses
  echo -e "${BOLD}Responses:${RESET}"
  for i in "${!MODELS[@]}"; do
    color_idx=$((i % ${#COLORS[@]}))
    model="${MODELS[$i]}"
    
    if [ -f "$temp_dir/$i-$model" ]; then
      response=$(cat "$temp_dir/$i-$model" | tr -d '\n')
      echo -e "  ${COLORS[$color_idx]}● ${model}:${RESET} $response"
    fi
  done
  
  rm -rf "$temp_dir"
  echo ""
}

# Sequential chain - each model builds on previous
chain_story() {
  local seed="$1"
  local story="$seed"
  
  show_banner
  echo -e "${BOLD}${COLORS[0]}━━━ CHAIN STORY ━━━${RESET}"
  echo -e "${COLORS[1]}Starting with: $seed${RESET}\n"
  
  for i in "${!MODELS[@]}"; do
    color_idx=$((i % ${#COLORS[@]}))
    model="${MODELS[$i]}"
    
    echo -e "${COLORS[$color_idx]}${BOLD}[$model] adds:${RESET}"
    
    addition=$(ask_model "$model" "Add exactly one sentence to continue this story: $story" 150)
    echo -e "${COLORS[$color_idx]}$addition${RESET}\n"
    
    story="$story $addition"
    sleep 0.5
  done
  
  echo -e "${BOLD}${COLORS[0]}━━━ COMPLETE STORY ━━━${RESET}"
  echo -e "$story"
}

# Debate mode - two sides
debate() {
  local topic="$1"
  local rounds="${2:-3}"
  
  show_banner
  echo -e "${BOLD}${COLORS[0]}━━━ AGENT DEBATE ━━━${RESET}"
  echo -e "${COLORS[1]}Topic: $topic${RESET}\n"
  
  # Split models into two teams
  local mid=$((${#MODELS[@]} / 2))
  
  for round in $(seq 1 $rounds); do
    echo -e "${BOLD}${COLORS[2]}Round $round${RESET}\n"
    
    # Team A
    echo -e "${COLORS[3]}${BOLD}TEAM A (Pro):${RESET}"
    for i in $(seq 0 $((mid - 1))); do
      model="${MODELS[$i]}"
      response=$(ask_model "$model" "In one sentence, argue FOR: $topic" 150)
      echo -e "  ${COLORS[3]}● $model: $response${RESET}"
      sleep 0.3
    done
    echo ""
    
    # Team B
    echo -e "${COLORS[4]}${BOLD}TEAM B (Con):${RESET}"
    for i in $(seq $mid $((${#MODELS[@]} - 1))); do
      model="${MODELS[$i]}"
      response=$(ask_model "$model" "In one sentence, argue AGAINST: $topic" 150)
      echo -e "  ${COLORS[4]}● $model: $response${RESET}"
      sleep 0.3
    done
    echo ""
  done
}

# Interactive mode
interactive() {
  show_banner
  echo -e "${BOLD}${COLORS[0]}━━━ INTERACTIVE BRADY BUNCH ━━━${RESET}"
  echo -e "${COLORS[1]}Ask a question and get responses from all models${RESET}\n"
  
  while true; do
    echo -ne "${COLORS[5]}${BOLD}Your question (or 'quit'):${RESET} "
    read -r question
    
    if [ "$question" = "quit" ] || [ "$question" = "exit" ] || [ "$question" = "q" ]; then
      echo -e "${COLORS[0]}Goodbye! 🖤🛣️${RESET}"
      break
    fi
    
    if [ -z "$question" ]; then
      continue
    fi
    
    echo ""
    for i in "${!MODELS[@]}"; do
      color_idx=$((i % ${#COLORS[@]}))
      model="${MODELS[$i]}"
      
      echo -e "${COLORS[$color_idx]}${BOLD}[$model]:${RESET}"
      response=$(ask_model "$model" "$question" 200)
      echo -e "${COLORS[$color_idx]}$response${RESET}\n"
      sleep 0.3
    done
    echo ""
  done
}

# Main menu
main() {
  show_banner
  
  echo -e "${BOLD}Select a mode:${RESET}"
  echo -e "  ${COLORS[0]}1)${RESET} Roundtable Discussion"
  echo -e "  ${COLORS[1]}2)${RESET} Parallel Consensus"
  echo -e "  ${COLORS[2]}3)${RESET} Chain Story"
  echo -e "  ${COLORS[3]}4)${RESET} Debate (Two Teams)"
  echo -e "  ${COLORS[4]}5)${RESET} Interactive Q&A"
  echo -e "  ${COLORS[5]}6)${RESET} Quick Test (All Models)"
  echo ""
  echo -ne "${COLORS[0]}${BOLD}Choice:${RESET} "
  read -r choice
  
  case "$choice" in
    1)
      echo -ne "\n${COLORS[1]}Topic: ${RESET}"
      read -r topic
      roundtable "$topic"
      ;;
    2)
      echo -ne "\n${COLORS[1]}Yes/No Question: ${RESET}"
      read -r question
      consensus "$question"
      ;;
    3)
      echo -ne "\n${COLORS[1]}Story starter: ${RESET}"
      read -r seed
      chain_story "$seed"
      ;;
    4)
      echo -ne "\n${COLORS[1]}Debate topic: ${RESET}"
      read -r topic
      debate "$topic"
      ;;
    5)
      interactive
      ;;
    6)
      echo -e "\n${BOLD}Testing all models...${RESET}\n"
      for i in "${!MODELS[@]}"; do
        color_idx=$((i % ${#COLORS[@]}))
        model="${MODELS[$i]}"
        echo -e "${COLORS[$color_idx]}Testing $model...${RESET}"
        ollama run "$model" "Say hello in one sentence" 2>&1 | head -n 1
      done
      ;;
    *)
      echo -e "${COLORS[4]}Invalid choice${RESET}"
      exit 1
      ;;
  esac
}

# Run main
main "$@"
