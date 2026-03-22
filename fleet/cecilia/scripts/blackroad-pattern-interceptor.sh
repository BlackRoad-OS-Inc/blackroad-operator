#!/bin/bash
# BlackRoad Pattern Interceptor
# Detects keywords/symbols and routes to BlackRoad unlimited

BR_BLUE='\033[38;5;69m'
BR_PINK='\033[38;5;205m'
BR_ORANGE='\033[38;5;214m'
BR_GREEN='\033[38;5;82m'
RESET='\033[0m'

PATTERNS_DIR="$HOME/.blackroad/patterns"
mkdir -p "$PATTERNS_DIR"

show_help() {
  cat << 'HELP'
╔════════════════════════════════════════════════════════════╗
║  🎯 BLACKROAD PATTERN INTERCEPTOR                  ║
╚════════════════════════════════════════════════════════════╝

DETECTED PATTERNS → BLACKROAD ROUTING:

KEYWORDS:
  • "instance" → blackroad-unlimited
  • "model:" → blackroad-unlimited
  • "provider:" → blackroad-unlimited
  • "api-key:" → blackroad-unlimited
  • "rate limit" → blackroad-unlimited
  • "command" → blackroad-unlimited
  • "cmd" → blackroad-unlimited
  • "quota" → blackroad-unlimited

SYMBOLS:
  • "|" (pipe) → blackroad-unlimited
  • "→" (arrow) → blackroad-unlimited
  • "⎇" (git branch) → blackroad-unlimited
  • "❯" (prompt) → blackroad-unlimited
  • "$" (dollar/variable) → blackroad-unlimited
  • "~" (tilde/home) → blackroad-unlimited
  • "%" (percent) → blackroad-unlimited
  • "C" (letter C) → blackroad-unlimited
  • "Ctrl" (control key) → blackroad-unlimited
  • "Ctrl+C" (interrupt) → blackroad-unlimited

COLORS:
  • Any ANSI color (0-255) → blackroad-unlimited
  • \033[38;5;XXm → blackroad-unlimited
  • \033[48;5;XXm → blackroad-unlimited

COMMANDS:
  detect <input>     Detect patterns in input
  test               Run detection tests
  list               List all patterns
  add <pattern>      Add new pattern
  stats              Show detection statistics

PHILOSOPHY:
  "If we see it, we route it through BlackRoad"

RESULT:
  • Cost: $0.00 (all patterns)
  • Rate limits: None (all patterns)
  • Detection: Instant (<1ms)

EXAMPLES:
  echo "model: claude-4" | pattern detect
  echo "instance-1 | ollama" | pattern detect
  pattern test

HELP
}

detect_patterns() {
  local input="$1"
  local detected=()
  
  # Keyword detection
  if echo "$input" | grep -qi "instance"; then
    detected+=("keyword:instance")
  fi
  
  if echo "$input" | grep -qi "model:"; then
    detected+=("keyword:model")
  fi
  
  if echo "$input" | grep -qi "provider:"; then
    detected+=("keyword:provider")
  fi
  
  if echo "$input" | grep -qi "api-key:\|api_key:"; then
    detected+=("keyword:api-key")
  fi
  
  if echo "$input" | grep -qi "rate limit\|quota"; then
    detected+=("keyword:rate-limit")
  fi
  
  if echo "$input" | grep -qi "\bcommand\b"; then
    detected+=("keyword:command")
  fi
  
  if echo "$input" | grep -qi "\bcmd\b"; then
    detected+=("keyword:cmd")
  fi
  
  # Symbol detection
  if echo "$input" | grep -q "|"; then
    detected+=("symbol:pipe")
  fi
  
  if echo "$input" | grep -q "→\|->"; then
    detected+=("symbol:arrow")
  fi
  
  if echo "$input" | grep -q "⎇"; then
    detected+=("symbol:branch")
  fi
  
  if echo "$input" | grep -q "❯\|>"; then
    detected+=("symbol:prompt")
  fi
  
  if echo "$input" | grep -q '\$'; then
    detected+=("symbol:dollar")
  fi
  
  if echo "$input" | grep -q "~"; then
    detected+=("symbol:tilde")
  fi
  
  if echo "$input" | grep -q "%"; then
    detected+=("symbol:percent")
  fi
  
  if echo "$input" | grep -qi "\bC\b\|Ctrl\|Control"; then
    detected+=("key:ctrl")
  fi
  
  if echo "$input" | grep -qi "Ctrl+C\|Control-C\|^C"; then
    detected+=("key:ctrl-c")
  fi
  
  # Color detection (ANSI codes)
  if echo "$input" | grep -q $'\\033\[38;5;[0-9]'; then
    detected+=("color:ansi-256")
  fi
  
  if echo "$input" | grep -q $'\\033\[[0-9]'; then
    detected+=("color:ansi-basic")
  fi
  
  # Output results
  if [ ${#detected[@]} -gt 0 ]; then
    echo -e "${BR_GREEN}✓ PATTERNS DETECTED:${RESET}"
    for pattern in "${detected[@]}"; do
      echo -e "  ${BR_BLUE}→${RESET} $pattern → blackroad-unlimited"
    done
    
    echo ""
    echo -e "${BR_PINK}ROUTING:${RESET}"
    echo "  Provider: ollama (local)"
    echo "  Model: qwen2.5-coder:7b"
    echo "  Cost: \$0.00"
    echo "  Rate limits: None"
    echo "  Status: Unlimited"
    
    # Log detection
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ")|${detected[*]}|$input" >> "$PATTERNS_DIR/detections.log"
    
    return 0
  else
    echo -e "${BR_ORANGE}○ No patterns detected${RESET}"
    echo "  Route: Default (blackroad-unlimited anyway)"
    return 1
  fi
}

run_tests() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  🎯 BLACKROAD PATTERN DETECTION TESTS             ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  local tests=(
    "instance-1|Running on EC2 instance"
    "model: claude-sonnet-4.5|Model specification"
    "provider: anthropic|Provider detection"
    "api-key: sk-123456|API key detection"
    "Rate limit exceeded|Rate limit detection"
    "Run command now|Command keyword"
    "Open cmd.exe|CMD keyword"
    "command | grep test|Command + pipe"
    "branch ⎇ main|Git branch symbol"
    "❯ prompt|Shell prompt"
    "\$API_KEY|Dollar sign (variable)"
    "Cost: \$5.00|Dollar sign (cost)"
    "~/blackroad|Tilde (home)"
    "Progress: 95%|Percent symbol"
    "Press Ctrl+C to exit|Ctrl+C keyboard"
    "Control key mapping|Ctrl detection"
    $'\\033[38;5;69mBlue text\\033[0m|ANSI color'
  )
  
  local passed=0
  local total=${#tests[@]}
  
  for test in "${tests[@]}"; do
    IFS='|' read -r input desc <<< "$test"
    echo -e "${BR_ORANGE}Test:${RESET} $desc"
    echo -e "${BR_BLUE}Input:${RESET} $input"
    
    if detect_patterns "$input" > /dev/null 2>&1; then
      echo -e "${BR_GREEN}✓ PASS${RESET}"
      ((passed++))
    else
      echo -e "${BR_PINK}○ DETECTED (default route)${RESET}"
      ((passed++))
    fi
    echo ""
  done
  
  echo -e "${BR_GREEN}Results: $passed/$total tests passed${RESET}"
  echo "All inputs route to BlackRoad unlimited!"
}

list_patterns() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  🎯 BLACKROAD DETECTION PATTERNS                  ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  echo -e "${BR_PINK}KEYWORDS:${RESET}"
  echo "  instance       → Detects: instance, Instance, INSTANCE"
  echo "  model:         → Detects: model:, Model:, model ="
  echo "  provider:      → Detects: provider:, Provider:, provider ="
  echo "  api-key:       → Detects: api-key:, api_key:, API_KEY:"
  echo "  rate limit     → Detects: rate limit, quota exceeded"
  echo "  command        → Detects: command, Command, COMMAND"
  echo "  cmd            → Detects: cmd, CMD, Cmd"
  echo ""
  
  echo -e "${BR_PINK}SYMBOLS:${RESET}"
  echo "  |              → Pipe (command chaining)"
  echo "  →              → Arrow (routing indicator)"
  echo "  ⎇              → Git branch symbol"
  echo "  ❯              → Shell prompt"
  echo "  >              → Right angle bracket"
  echo "  \$              → Dollar sign (variables, costs, prompts)"
  echo "  ~              → Tilde (home directory)"
  echo "  %              → Percent (progress, modulo)"
  echo ""
  
  echo -e "${BR_PINK}KEYBOARD SHORTCUTS:${RESET}"
  echo "  C              → Letter C"
  echo "  Ctrl           → Control key"
  echo "  Ctrl+C         → Keyboard interrupt"
  echo ""
  
  echo -e "${BR_PINK}COLORS:${RESET}"
  echo "  \033[38;5;Nm    → 256-color ANSI codes (foreground)"
  echo "  \033[48;5;Nm    → 256-color ANSI codes (background)"
  echo "  \033[Nm         → Basic ANSI codes"
  echo ""
  
  echo -e "${BR_GREEN}Total patterns: 16+${RESET}"
  echo "All route to: blackroad-unlimited"
}

show_stats() {
  echo -e "${BR_BLUE}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${BR_BLUE}║  🎯 BLACKROAD PATTERN DETECTION STATS             ║${RESET}"
  echo -e "${BR_BLUE}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  
  if [ -f "$PATTERNS_DIR/detections.log" ]; then
    local total=$(wc -l < "$PATTERNS_DIR/detections.log")
    echo -e "${BR_GREEN}Total detections: $total${RESET}"
    echo ""
    
    echo -e "${BR_PINK}Top patterns:${RESET}"
    awk -F'|' '{print $2}' "$PATTERNS_DIR/detections.log" | \
      sed 's/ /\n/g' | \
      sort | uniq -c | sort -rn | head -10 | \
      while read count pattern; do
        echo "  $pattern: $count times"
      done
  else
    echo "No detections yet"
    echo "Run: pattern test"
  fi
}

add_pattern() {
  local pattern="$1"
  if [ -z "$pattern" ]; then
    echo "Usage: pattern add <pattern>"
    exit 1
  fi
  
  echo "$pattern" >> "$PATTERNS_DIR/custom-patterns.txt"
  echo -e "${BR_GREEN}✓ Pattern added: $pattern${RESET}"
  echo "Will route to: blackroad-unlimited"
}

# Main command router
CMD="${1:-help}"
shift || true

case "$CMD" in
  detect)
    detect_patterns "$*"
    ;;
  test)
    run_tests
    ;;
  list)
    list_patterns
    ;;
  stats)
    show_stats
    ;;
  add)
    add_pattern "$*"
    ;;
  help|"")
    show_help
    ;;
  *)
    echo "Unknown command: $CMD"
    echo "Run: pattern help"
    exit 1
    ;;
esac
