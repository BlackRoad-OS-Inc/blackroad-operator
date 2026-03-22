#!/bin/bash
# Talk to a BlackRoad agent with persistent memory
# Usage: talk.sh <agent-name> [message]
# Interactive mode: talk.sh sophia
# One-shot:        talk.sh sophia "What is G(n)?"

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

MEMORY_SCRIPT="$HOME/agent-memory/agent-memory.sh"
AGENT="${1:-}"

if [ -z "$AGENT" ]; then
  echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
  echo -e "${PINK}║  BlackRoad Agent Talk                ║${RESET}"
  echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
  echo ""
  echo "Usage: talk.sh <agent> [message]"
  echo ""
  echo -e "${BLUE}Available agents:${RESET}"
  echo "  lucidia    - Light-bearer, pattern recognition"
  echo "  aria       - Song of the system, coordination"
  echo "  alice      - The gateway, security & routing"
  echo "  octavia    - The builder, engineering"
  echo "  anastasia  - Resurrection, disaster recovery"
  echo "  gematria   - The edge, performance"
  echo "  cecilia    - The musician, AI inference"
  echo "  silas      - The forest, long-term thinking"
  echo "  sebastien  - The enduring, hard problems"
  echo "  portia     - Justice & mercy, ethics"
  echo "  alexandria - The library, knowledge management"
  echo "  olympia    - The summit, quality & testing"
  echo "  magnolia   - Resilience & beauty, UX design"
  echo "  elias      - The prophet, risk & foresight"
  echo "  calliope   - Beautiful voice, documentation"
  echo "  athena     - Strategic wisdom, architecture"
  echo "  sophia     - Wisdom itself, deep reasoning"
  echo "  lydia      - The merchant, revenue & pricing"
  echo "  gaia       - The earth, systems thinking"
  echo "  ophelia    - Depth & feeling, empathy"
  exit 0
fi

MODEL="blackroad-${AGENT}"
shift

# Check model exists
if ! ollama list 2>/dev/null | grep -q "^${MODEL}"; then
  echo -e "\033[38;5;196mModel ${MODEL} not found. Run build-agents-v2.sh first.${RESET}"
  exit 1
fi

# Get memory context
MEMORY_CTX=""
if [ -x "$MEMORY_SCRIPT" ]; then
  MEMORY_CTX=$(bash "$MEMORY_SCRIPT" "$AGENT" context 2>/dev/null || true)
fi

one_shot() {
  local msg="$1"
  local prompt="$msg"

  if [ -n "$MEMORY_CTX" ]; then
    prompt="$MEMORY_CTX

User: $msg"
  fi

  # Log the interaction
  bash "$MEMORY_SCRIPT" "$AGENT" log "Q: $msg" 2>/dev/null || true

  # Run inference
  response=$(ollama run "$MODEL" "$prompt" 2>/dev/null)
  echo "$response"

  # Log response
  bash "$MEMORY_SCRIPT" "$AGENT" log "A: $response" 2>/dev/null || true

  # Auto-extract facts to remember (if response mentions remembering something)
  if echo "$response" | grep -qi "remember\|note\|important\|keep in mind"; then
    local summary
    summary=$(echo "$response" | head -1 | cut -c1-100)
    bash "$MEMORY_SCRIPT" "$AGENT" remember "auto_$(date +%s)" "$summary" 2>/dev/null || true
  fi
}

interactive_mode() {
  echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
  echo -e "${PINK}║  Talking to ${VIOLET}${AGENT}${PINK}$(printf '%*s' $((22 - ${#AGENT})) '')║${RESET}"
  echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
  echo -e "${BLUE}Type your message. 'quit' to exit. 'memory' to see memories.${RESET}"
  echo ""

  while true; do
    echo -ne "${AMBER}You > ${RESET}"
    read -r input

    [ -z "$input" ] && continue

    case "$input" in
      quit|exit|bye)
        echo -e "${GREEN}${AGENT} says goodbye. Pave Tomorrow.${RESET}"
        break
        ;;
      memory|memories)
        bash "$MEMORY_SCRIPT" "$AGENT" list 2>/dev/null
        continue
        ;;
      remember\ *)
        # Manual memory: "remember key value"
        local key value
        key=$(echo "$input" | awk '{print $2}')
        value=$(echo "$input" | cut -d' ' -f3-)
        bash "$MEMORY_SCRIPT" "$AGENT" remember "$key" "$value" 2>/dev/null
        continue
        ;;
      history)
        bash "$MEMORY_SCRIPT" "$AGENT" history 20 2>/dev/null
        continue
        ;;
    esac

    echo -ne "${VIOLET}${AGENT} > ${RESET}"
    one_shot "$input"
    echo ""
  done
}

# One-shot or interactive
if [ $# -gt 0 ]; then
  one_shot "$*"
else
  interactive_mode
fi
