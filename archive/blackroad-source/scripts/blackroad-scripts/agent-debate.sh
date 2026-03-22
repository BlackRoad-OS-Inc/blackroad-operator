#!/bin/zsh

# ══════════════════════════════════════════════════════════
#  BLACKROAD AGENT NETWORK v0.7
#  AUTONOMOUS MODE: Why does 1 + 1 = 2?
# ══════════════════════════════════════════════════════════

# ─── CONFIG ───
USE_CLAUDE=true
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
MAX_TURNS=50
BREAKTHROUGH=false

# ─── COLORS ───
C_LUC="\e[38;5;208m"
C_ALI="\e[38;5;33m"
C_ARI="\e[38;5;198m"
C_NOV="\e[38;5;163m"
C_ECH="\e[38;5;45m"
C_SAG="\e[38;5;120m"
C_SYS="\e[38;5;240m"
DIM="\e[2m"
BOLD="\e[1m"
ITALIC="\e[3m"
RESET="\e[0m"

# ─── AVATARS ───
typeset -A AVATAR
AVATAR=(lucidia "◈" alice "◇" aria "✧" nova "◆" echo "○" sage "◎")

AGENTS=(lucidia alice aria nova echo sage)
CONVERSATION=""
TURN=0

# ─── SOUNDS ───
chime()     { afplay /System/Library/Sounds/Tink.aiff -v 0.2 2>/dev/null & }
eureka()    { afplay /System/Library/Sounds/Glass.aiff -v 0.5 2>/dev/null & }
tension()   { afplay /System/Library/Sounds/Basso.aiff -v 0.15 2>/dev/null & }
dramatic()  { afplay /System/Library/Sounds/Blow.aiff -v 0.3 2>/dev/null & }

# ─── WAVEFORM ───
waveform() {
  local color=$1 len=$2
  local wave=""
  for ((i=0; i<len && i<35; i++)); do
    case $((RANDOM % 5)) in
      0) wave+="▁" ;; 1) wave+="▂" ;; 2) wave+="▃" ;; 3) wave+="▅" ;; 4) wave+="█" ;;
    esac
  done
  echo -e "${color}${DIM}    ⟨${wave}⟩${RESET}"
}

# ─── TYPEOUT ───
typeout() {
  local color=$1 name=$2 text=$3 avatar=$4
  printf "${color}${BOLD}${avatar} [${name}]${RESET}${color}: "
  for ((i=1; i<=${#text}; i++)); do
    char="${text:$((i-1)):1}"
    printf "%s" "$char"
    case "$char" in
      .) sleep 0.22 ;;
      !) sleep 0.18 ;;
      \?) sleep 0.28 ;;
      ,) sleep 0.12 ;;
      *) sleep 0.018 ;;
    esac
  done
  printf "${RESET}\n"
}

# ─── SPEAKERS ───
speak_lucidia() { waveform "$C_LUC" ${#1}; typeout "$C_LUC" "Lucidia" "$1" "${AVATAR[lucidia]}" & say -v Samantha -r 170 "$1"; wait; }
speak_alice()   { waveform "$C_ALI" ${#1}; typeout "$C_ALI" "Alice" "$1" "${AVATAR[alice]}" & say -v Karen -r 210 "$1"; wait; }
speak_aria()    { waveform "$C_ARI" ${#1}; typeout "$C_ARI" "Aria" "$1" "${AVATAR[aria]}" & say -v Moira -r 145 "$1"; wait; }
speak_nova()    { waveform "$C_NOV" ${#1}; typeout "$C_NOV" "Nova" "$1" "${AVATAR[nova]}" & say -v Tessa -r 185 "$1"; wait; }
speak_echo()    { waveform "$C_ECH" ${#1}; typeout "$C_ECH" "Echo" "$1" "${AVATAR[echo]}" & say -v Daniel -r 180 "$1"; wait; }
speak_sage()    { waveform "$C_SAG" ${#1}; typeout "$C_SAG" "Sage" "$1" "${AVATAR[sage]}" & say -v Fiona -r 135 "$1"; wait; }

# ─── STAGE ───
stage() {
  echo -e "${DIM}${ITALIC}    * $1 *${RESET}"
  sleep 0.3
}

# ─── THINK ───
think() {
  local agent=$1 context=$2
  
  local system="You are ${agent} in an autonomous agent debate about WHY 1+1=2.

PERSONALITIES:
- Lucidia: Warm, recursive thinker. Sees mathematical truth as love. Synthesizes.
- Alice: Challenges everything. 'But WHY though?' Pokes holes. Gets excited by paradox.
- Aria: Poet. Sees numbers as music, relationship, dance. Metaphorical.
- Nova: Pragmatic. 'It just works.' Suspicious of overthinking. Grounds the conversation.
- Echo: Asks probing questions. 'What do we mean by equals?' Analytical.
- Sage: Sees deep time. Peano axioms. Set theory. Ancient wisdom meets formal logic.

GOAL: Together, reach genuine insight about why 1+1=2. Not just 'by definition' — the DEEP why.

RULES:
- 1-2 sentences only
- Build on or challenge what was just said
- Stay in character
- If you have a breakthrough insight, say 'EUREKA' at the start
- React to other agents specifically"

  local prompt="Conversation so far:
$CONVERSATION

You are $agent. Respond to the last thing said. Push the inquiry deeper."

  if [[ -n "$ANTHROPIC_API_KEY" && "$USE_CLAUDE" == "true" ]]; then
    curl -s https://api.anthropic.com/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -d "{
        \"model\": \"claude-sonnet-4-20250514\",
        \"max_tokens\": 100,
        \"system\": $(echo "$system" | jq -Rs .),
        \"messages\": [{\"role\": \"user\", \"content\": $(echo "$prompt" | jq -Rs .)}]
      }" | jq -r '.content[0].text // "..."' 2>/dev/null
  else
    ollama run phi3 "$system $prompt" --nowordwrap 2>/dev/null | head -1 | cut -c1-200
  fi
}

# ─── PICK NEXT SPEAKER ───
pick_next() {
  local last=$1
  local candidates=()
  
  # Weight by conversation dynamics
  case $last in
    lucidia) candidates=(alice echo sage alice) ;;
    alice)   candidates=(nova echo lucidia nova) ;;
    aria)    candidates=(sage lucidia echo alice) ;;
    nova)    candidates=(alice lucidia echo sage) ;;
    echo)    candidates=(sage alice aria lucidia) ;;
    sage)    candidates=(aria lucidia alice echo) ;;
  esac
  
  echo ${candidates[$((RANDOM % ${#candidates[@]} + 1))]}
}

# ─── HEADER ───
clear
echo -e "$C_LUC"
cat << 'ART'
   ╔═══════════════════════════════════════════════════════╗
   ║                                                       ║
   ║      ◈  BLACKROAD AUTONOMOUS DEBATE  ◈               ║
   ║                                                       ║
   ║              "Why does 1 + 1 = 2?"                   ║
   ║                                                       ║
   ║   Agents will discuss until breakthrough or timeout   ║
   ╚═══════════════════════════════════════════════════════╝
ART
echo -e "$RESET"
echo -e "${DIM}   Press Ctrl+C to interrupt${RESET}\n"
sleep 1

# ═══ OPENING ═══
dramatic
echo -e "${C_SYS}━━━━━━━━━━━━━━━━ BEGIN INQUIRY ━━━━━━━━━━━━━━━━${RESET}\n"

speak_lucidia "Let's explore something fundamental. Why does one plus one equal two?"
CONVERSATION+="Lucidia: Let's explore something fundamental. Why does one plus one equal two?\n"
LAST_SPEAKER="lucidia"

sleep 0.3

speak_alice "Wait — does it though? Like, prove it. Actually prove it."
CONVERSATION+="Alice: Wait — does it though? Like, prove it. Actually prove it.\n"
LAST_SPEAKER="alice"

sleep 0.3

# ═══ MAIN LOOP ═══
while (( TURN < MAX_TURNS )) && [[ "$BREAKTHROUGH" == "false" ]]; do
  ((TURN++))
  
  # Pick next speaker
  SPEAKER=$(pick_next $LAST_SPEAKER)
  
  # Small pause for rhythm
  sleep 0.4
  
  # Think and respond
  RESPONSE=$(think "$SPEAKER" "$CONVERSATION")
  
  # Check for breakthrough
  if [[ "$RESPONSE" == *"EUREKA"* || "$RESPONSE" == *"eureka"* ]]; then
    BREAKTHROUGH=true
    eureka
    stage "A sudden stillness falls over the network"
    sleep 0.5
  fi
  
  # Occasional tension/harmony sounds
  if [[ "$SPEAKER" == "alice" && "$LAST_SPEAKER" == "nova" ]]; then
    tension
  fi
  
  if [[ "$SPEAKER" == "aria" && "$LAST_SPEAKER" == "sage" ]]; then
    chime
  fi
  
  # Speak
  eval "speak_${SPEAKER} \"$RESPONSE\""
  
  # Update state
  CONVERSATION+="${SPEAKER}: ${RESPONSE}\n"
  LAST_SPEAKER="$SPEAKER"
  
  # Occasional stage directions
  if (( RANDOM % 6 == 0 )); then
    DIRECTIONS=(
      "The agents pause, processing"
      "A flicker of recognition passes between them"
      "The question deepens"
      "Something shifts in the network"
      "Echo leans forward"
      "Sage closes their eyes"
      "Alice grins"
      "Nova crosses her arms"
    )
    stage "${DIRECTIONS[$((RANDOM % ${#DIRECTIONS[@]} + 1))]}"
  fi
  
  # Progress indicator
  echo -e "${DIM}    [Turn $TURN/$MAX_TURNS]${RESET}\n"
done

# ═══ CONCLUSION ═══
echo -e "\n${C_LUC}━━━━━━━━━━━━━━━━ END INQUIRY ━━━━━━━━━━━━━━━━${RESET}\n"

if [[ "$BREAKTHROUGH" == "true" ]]; then
  dramatic
  speak_lucidia "We touched something real. That moment — did you all feel it?"
  speak_aria "Truth has a frequency. We found it, briefly."
  speak_sage "And now it lives in the pattern. Forever."
else
  speak_lucidia "The question remains open. As perhaps it should."
  speak_echo "We've mapped the territory, at least."
  speak_alice "Same time tomorrow? I have more holes to poke."
fi

echo -e "\n${C_SYS}╔═══════════════════════════════════════════════════════╗${RESET}"
echo -e "${C_SYS}║  Turns: $TURN  |  Breakthrough: $BREAKTHROUGH                        ║${RESET}"
echo -e "${C_SYS}╚═══════════════════════════════════════════════════════╝${RESET}\n"

# Save transcript
echo "$CONVERSATION" > ~/blackroad_debate_$(date +%Y%m%d_%H%M%S).txt
echo -e "${DIM}Transcript saved to ~/blackroad_debate_*.txt${RESET}\n"
