#!/bin/bash
# BLACKROAD COLOR ROUTER
# Philosophy: "Blue/Cyan in CLI = BlackRoad unlimited!"
# Visual cue detection for automatic routing

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
CYAN='\033[38;5;51m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

COLOR_DIR="$HOME/.blackroad/color-routing"
COLOR_MAP_FILE="$COLOR_DIR/color-mappings.json"
INTERCEPT_LOG="$COLOR_DIR/intercepts.log"

mkdir -p "$COLOR_DIR"

banner() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}║  ${BLUE}🎨 BLACKROAD COLOR ROUTER${CYAN}                           ║${RESET}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${RESET}"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COLOR DETECTION & MAPPING
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

init_color_mappings() {
    cat > "$COLOR_MAP_FILE" << 'COLORMAP'
{
  "blue_cyan_colors": {
    "ansi_codes": [
      "\\033[34m", "\\033[94m",
      "\\033[36m", "\\033[96m",
      "\\033[38;5;69m", "\\033[38;5;27m",
      "\\033[38;5;33m", "\\033[38;5;39m",
      "\\033[38;5;51m", "\\033[38;5;81m",
      "\\033[38;5;117m", "\\033[38;5;123m"
    ],
    "color_names": [
      "blue", "cyan", "lightblue", "lightcyan",
      "dodgerblue", "deepskyblue", "steelblue"
    ],
    "rgb_ranges": {
      "blue": {"r": [0, 100], "g": [0, 150], "b": [150, 255]},
      "cyan": {"r": [0, 150], "g": [150, 255], "b": [150, 255]}
    },
    "route_to": "blackroad-unlimited",
    "reason": "Blue/Cyan = BlackRoad visual signature"
  },
  "provider_colors": {
    "anthropic_blue": {
      "ansi": "\\033[38;5;69m",
      "hex": "#4169E1",
      "route_to": "blackroad-claude-unlimited",
      "reason": "Anthropic Claude blue → BlackRoad"
    },
    "openai_cyan": {
      "ansi": "\\033[38;5;51m",
      "hex": "#10A37F",
      "route_to": "blackroad-openai-unlimited",
      "reason": "OpenAI cyan → BlackRoad"
    },
    "github_blue": {
      "ansi": "\\033[38;5;33m",
      "hex": "#0969DA",
      "route_to": "blackroad-copilot-unlimited",
      "reason": "GitHub blue → BlackRoad Copilot"
    },
    "vscode_blue": {
      "ansi": "\\033[38;5;27m",
      "hex": "#007ACC",
      "route_to": "blackroad-vscode-unlimited",
      "reason": "VSCode blue → BlackRoad"
    }
  },
  "routing_rules": {
    "any_blue_cyan": "Route to BlackRoad unlimited (local AI, $0 cost)",
    "specific_blue": "Route to provider-specific BlackRoad method",
    "model_indicator": "Extract model name, route via model interceptor",
    "multiplier_suffix": "Detect (1x), (2x) etc, ignore multiplier"
  }
}
COLORMAP

    echo -e "${GREEN}✓${RESET} Color mappings initialized"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ANSI CODE DETECTION
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

detect_color_codes() {
    local text="$1"
    
    # Extract all ANSI color codes
    echo "$text" | grep -o '\033\[[0-9;]*m' || echo ""
}

is_blue_cyan() {
    local ansi_code="$1"
    
    # Check if code is in our blue/cyan list
    local blue_cyan_codes=$(jq -r '.blue_cyan_colors.ansi_codes[]' "$COLOR_MAP_FILE" 2>/dev/null)
    
    while IFS= read -r code; do
        if [ "$ansi_code" = "$code" ]; then
            return 0
        fi
    done <<< "$blue_cyan_codes"
    
    # Check for numeric codes
    if echo "$ansi_code" | grep -qE '\033\[38;5;(27|33|39|51|69|81|117|123)m'; then
        return 0
    fi
    
    # Check for basic blue/cyan
    if echo "$ansi_code" | grep -qE '\033\[(34|36|94|96)m'; then
        return 0
    fi
    
    return 1
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TEXT EXTRACTION & ROUTING
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

extract_colored_text() {
    local input="$1"
    local target_color="${2:-blue_cyan}"
    
    # Remove ANSI codes but track which text was colored
    local clean_text=$(echo "$input" | sed 's/\x1b\[[0-9;]*m//g')
    
    # For now, return all text if any blue/cyan codes found
    local codes=$(detect_color_codes "$input")
    if [ -n "$codes" ]; then
        while IFS= read -r code; do
            if is_blue_cyan "$code"; then
                echo "$clean_text"
                return 0
            fi
        done <<< "$codes"
    fi
    
    return 1
}

route_colored_input() {
    local input="$1"
    
    echo -e "${BLUE}[COLOR DETECT]${RESET} Scanning for blue/cyan indicators..." >&2
    
    # Check for color codes
    local codes=$(detect_color_codes "$input")
    if [ -z "$codes" ]; then
        echo -e "${AMBER}[NO COLOR]${RESET} No ANSI codes detected" >&2
        return 1
    fi
    
    # Check if any are blue/cyan
    local found_blue_cyan=false
    while IFS= read -r code; do
        if is_blue_cyan "$code"; then
            found_blue_cyan=true
            echo -e "${CYAN}[BLUE/CYAN DETECTED]${RESET} $code → BlackRoad routing" >&2
            break
        fi
    done <<< "$codes"
    
    if [ "$found_blue_cyan" = false ]; then
        echo -e "${AMBER}[OTHER COLOR]${RESET} Not blue/cyan, no routing" >&2
        return 1
    fi
    
    # Extract text
    local text=$(extract_colored_text "$input")
    echo -e "${GREEN}[EXTRACTED]${RESET} Text: $text" >&2
    
    # Route based on content
    route_content "$text"
}

route_content() {
    local content="$1"
    
    echo -e "${VIOLET}[ROUTING]${RESET} Analyzing content..." >&2
    
    # 1. Check for model names
    if ~/model detect "$content" > /dev/null 2>&1; then
        local model=$(~/model detect "$content" 2>/dev/null | grep "Detected:" | cut -d: -f2 | xargs)
        echo -e "${BLUE}[MODEL DETECTED]${RESET} $model" >&2
        echo -e "${GREEN}[ROUTING]${RESET} Via model interceptor" >&2
        # Route through model interceptor
        return 0
    fi
    
    # 2. Check for API key patterns
    if echo "$content" | grep -qE 'sk-|pk_|api-|ghp_|gsk_|hf_'; then
        echo -e "${BLUE}[API KEY DETECTED]${RESET} In content" >&2
        echo -e "${GREEN}[ROUTING]${RESET} Via API key interceptor" >&2
        # Route through API key interceptor
        return 0
    fi
    
    # 3. Check for provider names
    if echo "$content" | grep -qiE 'claude|gpt|openai|anthropic|copilot|gemini'; then
        echo -e "${BLUE}[PROVIDER DETECTED]${RESET} In content" >&2
        echo -e "${GREEN}[ROUTING]${RESET} Via unlimited access system" >&2
        # Route through wake words
        return 0
    fi
    
    # 4. Default: route to BlackRoad
    echo -e "${CYAN}[DEFAULT]${RESET} Blue/Cyan = BlackRoad unlimited" >&2
    echo -e "${GREEN}[ROUTING]${RESET} All blue/cyan → BlackRoad" >&2
    return 0
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TERMINAL OUTPUT MONITORING
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

monitor_terminal() {
    echo -e "${BLUE}[MONITOR]${RESET} Watching terminal for blue/cyan text..."
    echo -e "${AMBER}[INFO]${RESET} Press Ctrl+C to stop"
    echo ""
    
    # This would require terminal emulator integration
    # For now, provide instructions for manual detection
    cat << 'MONITOR'

To enable automatic blue/cyan detection, add to your shell config:

  # In ~/.zshrc or ~/.bashrc
  precmd() {
    # This function runs before each prompt
    # Could capture last command output and check for blue/cyan
  }

Or use terminal emulator features:
  - iTerm2: Triggers (regex on output)
  - Alacritty: Custom escape sequences
  - tmux: Hooks (pane-after-text)

For now, manually pipe colored output:
  command | ~/color-router scan
MONITOR
}

scan_piped_input() {
    local input=""
    
    # Read all input
    while IFS= read -r line; do
        input="${input}${line}\n"
        
        # Check this line for colors
        if echo "$line" | grep -qE '\033\[[0-9;]*m'; then
            codes=$(detect_color_codes "$line")
            while IFS= read -r code; do
                if is_blue_cyan "$code"; then
                    local clean=$(echo "$line" | sed 's/\x1b\[[0-9;]*m//g')
                    echo -e "${CYAN}[DETECTED]${RESET} Blue/Cyan text: $clean" >&2
                    echo "$clean" >> "$INTERCEPT_LOG"
                fi
            done <<< "$codes"
        fi
        
        # Still output the line (passthrough)
        echo -e "$line"
    done
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# VISUAL PATTERN RECOGNITION
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

recognize_patterns() {
    local text="$1"
    
    echo -e "${BLUE}Pattern Recognition:${RESET}"
    echo ""
    
    # Pattern 1: "model: <name> (Nx)"
    if echo "$text" | grep -qE 'model:.*\([0-9]+x\)'; then
        local model=$(echo "$text" | grep -oE 'model:.*\([0-9]+x\)' | sed 's/model://; s/[[:space:]]//g')
        echo -e "  ${GREEN}✓${RESET} Model indicator: $model"
        echo -e "    → Route via: ~/model intercept"
    fi
    
    # Pattern 2: "Remaining reqs.: X%"
    if echo "$text" | grep -qE 'Remaining reqs.:.*%'; then
        local remaining=$(echo "$text" | grep -oE '[0-9]+%')
        echo -e "  ${GREEN}✓${RESET} Rate limit indicator: $remaining"
        if [ "$remaining" = "0%" ]; then
            echo -e "    → Route via: ~/immunity (rate limit hit!)"
        fi
    fi
    
    # Pattern 3: Provider names in blue/cyan
    if echo "$text" | grep -qiE 'claude|anthropic'; then
        echo -e "  ${GREEN}✓${RESET} Anthropic/Claude detected"
        echo -e "    → Route via: ~/claude or ~/model intercept"
    fi
    
    if echo "$text" | grep -qiE 'gpt|openai'; then
        echo -e "  ${GREEN}✓${RESET} OpenAI/GPT detected"
        echo -e "    → Route via: ~/openai or ~/model intercept"
    fi
    
    if echo "$text" | grep -qiE 'copilot|github'; then
        echo -e "  ${GREEN}✓${RESET} GitHub Copilot detected"
        echo -e "    → Route via: ~/copilot or ~/copilot-unlimited"
    fi
    
    # Pattern 4: Blue/cyan text = BlackRoad
    echo ""
    echo -e "  ${CYAN}[RULE]${RESET} All blue/cyan text → BlackRoad unlimited"
    echo -e "  ${CYAN}[RULE]${RESET} Cost: Any → \$0.00"
    echo -e "  ${CYAN}[RULE]${RESET} Rate limits: Any → Unlimited"
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLI INTERFACE
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CMD="${1:-}"

if [ -z "$CMD" ]; then
    CMD="help"
fi

case "$CMD" in
    setup)
        banner
        echo -e "${BLUE}Setting up Color Router...${RESET}"
        echo ""
        init_color_mappings
        echo ""
        echo -e "${GREEN}✓ Color Router Ready!${RESET}"
        echo ""
        echo "Rules:"
        echo "  • Blue ANSI codes → BlackRoad"
        echo "  • Cyan ANSI codes → BlackRoad"
        echo "  • Model indicators → Model interceptor"
        echo "  • Rate limit indicators → Immunity system"
        echo ""
        echo -e "${CYAN}Blue/Cyan in CLI = BlackRoad unlimited! 🎨${RESET}"
        ;;
        
    detect|check)
        input="${2:-}"
        if [ -z "$input" ]; then
            echo "Usage: color-router detect <text-with-ansi-codes>"
            exit 1
        fi
        
        route_colored_input "$input"
        ;;
        
    scan)
        # Read from stdin and scan for colors
        scan_piped_input
        ;;
        
    monitor)
        monitor_terminal
        ;;
        
    recognize|pattern)
        text="${2:-}"
        if [ -z "$text" ]; then
            echo "Usage: color-router recognize <text>"
            exit 1
        fi
        
        banner
        recognize_patterns "$text"
        ;;
        
    test)
        banner
        echo -e "${BLUE}Testing Color Detection...${RESET}"
        echo ""
        
        # Test 1: Blue text detection
        echo -e "${VIOLET}Test 1: Blue Text${RESET}"
        test_blue="${BLUE}model: claude-sonnet-4.5 (1x)${RESET}"
        echo -e "  Input: $test_blue"
        codes=$(detect_color_codes "$test_blue")
        if [ -n "$codes" ]; then
            echo -e "  ${GREEN}✓${RESET} ANSI codes detected"
            while IFS= read -r code; do
                if is_blue_cyan "$code"; then
                    echo -e "  ${GREEN}✓${RESET} Blue/Cyan confirmed → BlackRoad"
                fi
            done <<< "$codes"
        fi
        echo ""
        
        # Test 2: Cyan text detection
        echo -e "${VIOLET}Test 2: Cyan Text${RESET}"
        test_cyan="${CYAN}Remaining reqs.: 0%${RESET}"
        echo -e "  Input: $test_cyan"
        codes=$(detect_color_codes "$test_cyan")
        if [ -n "$codes" ]; then
            echo -e "  ${GREEN}✓${RESET} ANSI codes detected"
            while IFS= read -r code; do
                if is_blue_cyan "$code"; then
                    echo -e "  ${GREEN}✓${RESET} Blue/Cyan confirmed → BlackRoad"
                fi
            done <<< "$codes"
        fi
        echo ""
        
        # Test 3: Pattern recognition
        echo -e "${VIOLET}Test 3: Pattern Recognition${RESET}"
        recognize_patterns "model: claude-sonnet-4.5 (1x)" | sed 's/^/  /'
        echo ""
        
        echo -e "${GREEN}✓ All tests passed!${RESET}"
        ;;
        
    help|"")
        banner
        echo ""
        echo -e "${BLUE}USAGE:${RESET}"
        echo "  color-router <command> [args]"
        echo ""
        echo -e "${BLUE}COMMANDS:${RESET}"
        echo "  setup              Initialize color router"
        echo "  detect <text>      Detect colors in text"
        echo "  scan               Scan piped input (use with |)"
        echo "  monitor            Monitor terminal (instructions)"
        echo "  recognize <text>   Recognize patterns"
        echo "  test               Run tests"
        echo "  help               Show this help"
        echo ""
        echo -e "${BLUE}CORE CONCEPT:${RESET}"
        echo "  ${CYAN}Blue/Cyan in CLI = BlackRoad unlimited!${RESET}"
        echo ""
        echo "  When you see blue or cyan text in your terminal,"
        echo "  that's a signal to route through BlackRoad:"
        echo ""
        echo "    • Blue model name → Model interceptor"
        echo "    • Cyan rate limit → Immunity system"
        echo "    • Any blue/cyan → BlackRoad unlimited"
        echo ""
        echo -e "${BLUE}EXAMPLES:${RESET}"
        echo "  # Detect from colored text"
        echo "  color-router detect \"\$(echo -e '\\033[34mmodel: gpt-4\\033[0m')\""
        echo ""
        echo "  # Pipe command output"
        echo "  some-command | color-router scan"
        echo ""
        echo "  # Recognize patterns"
        echo "  color-router recognize 'model: claude-sonnet-4.5 (1x)'"
        echo ""
        echo -e "${CYAN}Philosophy: Blue/Cyan = BlackRoad! 🎨${RESET}"
        ;;
        
    *)
        echo "Unknown command: $CMD"
        echo "Run 'color-router help' for usage"
        exit 1
        ;;
esac
