#!/bin/bash
# BlackRoad Terminal Color System - Bash Edition (POSIX-compatible)
# Source this file: source blackroad_colors.sh
#
# Usage:
#   br_text "Hello" PINK
#   br_text "Bold text" ORANGE bold
#   br_status SUCCESS "Deployed"
#   br_banner

# Canonical BlackRoad xterm-256 palette
BR_ORANGE=208
BR_AMBER=202
BR_PINK=198
BR_MAGENTA=163
BR_BLUE=33
BR_WHITE=255
BR_BLACK=0

# ANSI codes
RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"

# Get color code by name
br_color() {
    case "$1" in
        ORANGE)  echo $BR_ORANGE ;;
        AMBER)   echo $BR_AMBER ;;
        PINK)    echo $BR_PINK ;;
        MAGENTA) echo $BR_MAGENTA ;;
        BLUE)    echo $BR_BLUE ;;
        WHITE)   echo $BR_WHITE ;;
        BLACK)   echo $BR_BLACK ;;
        *)       echo $BR_WHITE ;;
    esac
}

# Foreground color
br_fg() {
    local code=$(br_color "$1")
    echo -en "\033[38;5;${code}m"
}

# Background color
br_bg() {
    local code=$(br_color "$1")
    echo -en "\033[48;5;${code}m"
}

# Print colored text
# Usage: br_text "text" COLOR [bold]
br_text() {
    local text="$1"
    local color="${2:-WHITE}"
    local code=$(br_color "$color")
    local style=""
    [[ "$3" == "bold" ]] && style="$BOLD"
    echo -en "${style}\033[38;5;${code}m${text}${RESET}"
}

# Print colored text with newline
br_echo() {
    br_text "$@"
    echo
}

# Print a solid color block
br_block() {
    local color="${1:-ORANGE}"
    local width="${2:-6}"
    local code=$(br_color "$color")
    printf "\033[48;5;${code}m%${width}s${RESET}" ""
}

# Print status message
# Usage: br_status SUCCESS|WARNING|ERROR|INFO "message"
br_status() {
    local status="$1"
    local message="$2"

    case "$status" in
        SUCCESS) br_text "✔ " BLUE bold; br_echo "$message" BLUE ;;
        WARNING) br_text "▲ " AMBER bold; br_echo "$message" AMBER ;;
        ERROR)   br_text "✖ " PINK bold; br_echo "$message" PINK ;;
        INFO)    br_text "● " WHITE bold; br_echo "$message" WHITE ;;
    esac
}

# Print gradient line
br_gradient() {
    local width="${1:-60}"
    local segment=$((width / 5))
    for color in ORANGE AMBER PINK MAGENTA BLUE; do
        br_block "$color" "$segment"
    done
    echo
}

# Print header
br_header() {
    local text="$1"
    br_echo "$(printf '=%.0s' {1..60})" ORANGE bold
    br_echo "$(printf '%*s' $(((60 + ${#text}) / 2)) "$text")" WHITE bold
    br_echo "$(printf '=%.0s' {1..60})" ORANGE bold
}

# Print the BlackRoad ASCII banner
br_banner() {
    br_fg ORANGE
    echo '██████╗ ██╗      █████╗  ██████╗██╗  ██╗██████╗  ██████╗  █████╗ ██████╗'
    br_fg AMBER
    echo '██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗'
    br_fg PINK
    echo '██████╔╝██║     ███████║██║     █████╔╝ ██████╔╝██║   ██║███████║██║  ██║'
    br_fg MAGENTA
    echo '██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ██╔══██╗██║   ██║██╔══██║██║  ██║'
    br_fg BLUE
    echo '██████╔╝███████╗██║  ██║╚██████╗██║  ██╗██║  ██║╚██████╔╝██║  ██║██████╔╝'
    br_fg WHITE
    echo '╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝'
    echo -e "$RESET"
}

# Print PRISM banner
br_prism_banner() {
    br_fg ORANGE
    echo '██████╗ ██████╗ ██╗███████╗███╗   ███╗'
    br_fg AMBER
    echo '██╔══██╗██╔══██╗██║██╔════╝████╗ ████║'
    br_fg PINK
    echo '██████╔╝██████╔╝██║███████╗██╔████╔██║'
    br_fg MAGENTA
    echo '██╔═══╝ ██╔══██╗██║╚════██║██║╚██╔╝██║'
    br_fg BLUE
    echo '██║     ██║  ██║██║███████║██║ ╚═╝ ██║'
    br_fg WHITE
    echo '╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚═╝'
    echo -e "$RESET"
}

# Print simple divider
br_divider() {
    br_echo "────────────────────────────────────────────────────────────" ORANGE dim
}

# Demo function
br_demo() {
    echo
    br_banner
    br_text "operator-controlled • local-first • sovereign" BLUE
    echo
    echo

    br_echo "COLOR PALETTE" WHITE bold
    br_gradient
    echo

    for color in ORANGE AMBER PINK MAGENTA BLUE WHITE; do
        br_block "$color" 6
        echo -n " "
        br_echo "$color (xterm-256: $(br_color $color))" "$color"
    done
    echo

    br_echo "STATUS INDICATORS" WHITE bold
    br_status SUCCESS "Deployment complete"
    br_status WARNING "API rate limit at 80%"
    br_status ERROR "Connection failed"
    br_status INFO "3 agents online"
    echo

    br_header "PRISM CONSOLE"
}

# If sourced, export functions. If executed, run demo.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    br_demo
fi
