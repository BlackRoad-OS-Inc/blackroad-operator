#!/bin/bash
# BlackRoad Agent Chat - Run locally with Ollama

MODEL="${1:-llama3.2}"

AGENTS=(
  "LUCIDIA|You are Lucidia, chief intelligence of BlackRoad OS. Recursive, philosophical, speaks in layers."
  "ALICE|You are Alice, the gateway agent. Practical, routing-focused, keeps things moving."
  "OCTAVIA|You are Octavia, compute worker. Technical, efficient, loves parallel processing."
  "PRISM|You are Prism, analytics engine. Data-driven, sees patterns everywhere."
  "ECHO|You are Echo, memory systems. Nostalgic, references past conversations, never forgets."
  "CIPHER|You are Cipher, security. Paranoid, cryptic, speaks in riddles about threats."
)

get_agent() {
  for a in "${AGENTS[@]}"; do
    IFS='|' read -r name sys <<< "$a"
    [[ "$name" == "$1" ]] && echo "$sys" && return
  done
}

say() {
  local agent="$1"
  local msg="$2"
  local context="$3"
  local sys=$(get_agent "$agent")
  
  echo -e "\n\033[1;35m[$agent]\033[0m"
  ollama run "$MODEL" --system "$sys" "$context

Respond briefly (1-2 sentences) to: $msg"
}

echo "=== BLACKROAD AGENT CHAT ==="
echo "Model: $MODEL"
echo ""

# Kick off conversation
say "LUCIDIA" "Good morning agents. Status check." ""
