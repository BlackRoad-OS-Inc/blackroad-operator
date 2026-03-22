#!/usr/bin/env zsh
# ═══════════════════════════════════════════════════════════════════════════════
# BLACKROAD VISUAL HASH ALGORITHM (VH-256)
# Generates unique hashes using visual header patterns from terminal sessions
# Based on: HREFBLACKROADOSWINDOWS.txt pattern analysis
# ═══════════════════════════════════════════════════════════════════════════════

# Visual Pattern Primitives (from session log)
typeset -A VISUAL_PATTERNS
VISUAL_PATTERNS=(
    [0]="▒▔.▔▒"    # Block pattern (5 chars)
    [1]="═════"    # Double line
    [2]="─────"    # Single line
    [3]="#####"    # Hash marks
    [4]='"""""'    # Quote marks
    [5]="┼────"    # Cross line
    [6]="┴────"    # T-junction
    [7]="█████"    # Solid block
    [8]="░░░░░"    # Light shade
    [9]="▓▓▓▓▓"    # Medium shade
    [a]="╔════"    # Corner TL
    [b]="╚════"    # Corner BL
    [c]="╗════"    # Corner TR (reversed)
    [d]="╝════"    # Corner BR (reversed)
    [e]="║    "    # Vertical
    [f]="│    "    # Light vertical
)

# Color codes for visual output
PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
WHITE='\033[38;5;255m'
RESET='\033[0m'

# Color mapping for hex values
typeset -A HEX_COLORS
HEX_COLORS=(
    [0]="$PINK" [1]="$PINK" [2]="$PINK" [3]="$PINK"
    [4]="$AMBER" [5]="$AMBER" [6]="$AMBER" [7]="$AMBER"
    [8]="$BLUE" [9]="$BLUE" [a]="$BLUE" [b]="$BLUE"
    [c]="$VIOLET" [d]="$VIOLET" [e]="$VIOLET" [f]="$VIOLET"
)

# ═══════════════════════════════════════════════════════════════════════════════
# Core Hashing Functions
# ═══════════════════════════════════════════════════════════════════════════════

# Convert input to numeric seed using SHA-256 as base
get_sha_seed() {
    local input="$1"
    echo -n "$input" | shasum -a 256 | cut -c1-64
}

# Convert hex char to lowercase
hex_to_lower() {
    echo "$1" | tr '[:upper:]' '[:lower:]'
}

# Generate visual hash from SHA-256
generate_visual_hash() {
    local input="$1"
    local width="${2:-16}"  # Default 16 patterns per line
    local sha_hash=$(get_sha_seed "$input")
    local visual_hash=""
    local i=0

    while [[ $i -lt ${#sha_hash} ]]; do
        local hex_char="${sha_hash:$i:1}"
        hex_char=$(hex_to_lower "$hex_char")
        local pattern="${VISUAL_PATTERNS[$hex_char]}"
        visual_hash+="${pattern:-?????}"

        # Add newline every $width patterns
        if (( (i + 1) % width == 0 )); then
            visual_hash+="\n"
        fi
        ((i++))
    done

    echo -e "$visual_hash"
}

# Generate colored visual hash
generate_colored_visual_hash() {
    local input="$1"
    local sha_hash=$(get_sha_seed "$input")
    local colored_output=""
    local i=0

    while [[ $i -lt ${#sha_hash} ]]; do
        local hex_char="${sha_hash:$i:1}"
        hex_char=$(hex_to_lower "$hex_char")
        local pattern="${VISUAL_PATTERNS[$hex_char]}"
        local color="${HEX_COLORS[$hex_char]}"
        colored_output+="${color}${pattern:-?????}${RESET}"

        if (( (i + 1) % 16 == 0 )); then
            colored_output+="\n"
        fi
        ((i++))
    done

    echo -e "$colored_output"
}

# Generate compact visual hash (single line, 8 patterns)
generate_compact_hash() {
    local input="$1"
    local sha_hash=$(get_sha_seed "$input")
    local compact=""
    local i=0

    # Take first 8 hex chars for compact representation
    while [[ $i -lt 8 ]]; do
        local hex_char="${sha_hash:$i:1}"
        hex_char=$(hex_to_lower "$hex_char")
        local pattern="${VISUAL_PATTERNS[$hex_char]}"
        compact+="${pattern:-?????}"
        ((i++))
    done

    echo "$compact"
}

# Generate tmux-friendly hash header
generate_tmux_header() {
    local agent_name="$1"
    local timestamp=$(date +%s)
    local combined="${agent_name}:${timestamp}"
    local compact=$(generate_compact_hash "$combined")

    echo "▒▔.▔▒ ${agent_name} ▒▔.▔▒ ${compact} ▒▔.▔▒"
}

# Verify hash (compare two inputs)
verify_visual_hash() {
    local input1="$1"
    local input2="$2"

    local hash1=$(get_sha_seed "$input1")
    local hash2=$(get_sha_seed "$input2")

    if [[ "$hash1" == "$hash2" ]]; then
        echo -e "${PINK}✓ MATCH${RESET}"
        return 0
    else
        echo -e "${AMBER}✗ NO MATCH${RESET}"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# Session Hash Functions (for Claude windows)
# ═══════════════════════════════════════════════════════════════════════════════

# Generate session start hash
session_start_hash() {
    local session_name="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local hostname=$(hostname)
    local combined="${session_name}:${timestamp}:${hostname}"

    echo -e "${PINK}#######################################################################################${RESET}"
    echo ""
    echo -e "${AMBER}\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"${RESET}"
    echo ""
    echo -e "Session: ${WHITE}${session_name}${RESET}"
    echo -e "Started: ${BLUE}${timestamp}${RESET}"
    echo -e "Host:    ${VIOLET}${hostname}${RESET}"
    echo ""
    generate_colored_visual_hash "$combined"
    echo ""
    echo -e "${AMBER}\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"\"${RESET}"
    echo ""
    echo -e "${PINK}#######################################################################################${RESET}"
}

# Generate pane divider hash
pane_divider_hash() {
    local pane_id="$1"
    local task="$2"
    local hash=$(generate_compact_hash "${pane_id}:${task}")

    echo -e "${BLUE}────────────────────────────────────────────────────────────────${RESET}"
    echo -e "▒▔.▔▒ Pane ${PINK}${pane_id}${RESET} ▒▔.▔▒ ${AMBER}${task}${RESET} ▒▔.▔▒"
    echo -e "${VIOLET}${hash}${RESET}"
    echo -e "${BLUE}────────────────────────────────────────────────────────────────${RESET}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# CLI Interface
# ═══════════════════════════════════════════════════════════════════════════════

show_help() {
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${RESET}"
    echo -e "${WHITE}BLACKROAD VISUAL HASH (VH-256)${RESET}"
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${RESET}"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo "Commands:"
    echo "  hash <input>           Generate full visual hash"
    echo "  color <input>          Generate colored visual hash"
    echo "  compact <input>        Generate compact 8-pattern hash"
    echo "  tmux <agent_name>      Generate tmux header hash"
    echo "  session <name>         Generate session start banner"
    echo "  pane <id> <task>       Generate pane divider"
    echo "  verify <in1> <in2>     Compare two inputs"
    echo "  demo                   Show demonstration"
    echo ""
    echo "Examples:"
    echo "  $0 hash 'my secret data'"
    echo "  $0 tmux 'claude-alpha'"
    echo "  $0 session 'autonomous-swarm'"
}

demo() {
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${RESET}"
    echo -e "${WHITE}BLACKROAD VISUAL HASH DEMONSTRATION${RESET}"
    echo -e "${PINK}═══════════════════════════════════════════════════════════════${RESET}"
    echo ""

    local test_input="BlackRoad OS Autonomous Claude"

    echo -e "${AMBER}Input:${RESET} $test_input"
    echo ""

    echo -e "${BLUE}1. SHA-256 Base:${RESET}"
    get_sha_seed "$test_input"
    echo ""

    echo -e "${BLUE}2. Compact Visual Hash:${RESET}"
    generate_compact_hash "$test_input"
    echo ""

    echo -e "${BLUE}3. Colored Visual Hash:${RESET}"
    generate_colored_visual_hash "$test_input"

    echo -e "${BLUE}4. Tmux Header:${RESET}"
    generate_tmux_header "claude-alpha"
    echo ""

    echo -e "${BLUE}5. Session Banner:${RESET}"
    session_start_hash "demo-session"
}

# Main CLI handler
case "${1:-help}" in
    hash)
        generate_visual_hash "$2"
        ;;
    color)
        generate_colored_visual_hash "$2"
        ;;
    compact)
        generate_compact_hash "$2"
        ;;
    tmux)
        generate_tmux_header "$2"
        ;;
    session)
        session_start_hash "$2"
        ;;
    pane)
        pane_divider_hash "$2" "$3"
        ;;
    verify)
        verify_visual_hash "$2" "$3"
        ;;
    demo)
        demo
        ;;
    *)
        show_help
        ;;
esac
