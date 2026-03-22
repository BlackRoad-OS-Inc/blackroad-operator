#!/bin/bash
# ============================================================================
# BLACKROAD OFFICIAL COLORS
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# RULE: Colored blocks/borders, WHITE text always
# ============================================================================

# === BLOCK COLORS (for ████, ━━━, borders) ===
BR_AMBER='\033[38;5;208m'
BR_ORANGE='\033[38;5;202m'
BR_PINK='\033[38;5;198m'
BR_MAGENTA='\033[38;5;163m'
BR_BLUE='\033[38;5;33m'

# === TEXT COLOR (always white) ===
BR_TEXT='\033[1;37m'
BR_WHITE='\033[1;37m'

# === RESET ===
BR_RESET='\033[0m'
NC='\033[0m'

# === HELPER FUNCTIONS ===

# Print colored block with white text
br_line() {
    local color="$1"
    local text="$2"
    echo -e "${color}████${BR_RESET} ${BR_TEXT}${text}${BR_RESET}"
}

# Print colored border box
br_box() {
    local color="$1"
    local text="$2"
    local width=${3:-50}
    local border=$(printf '─%.0s' $(seq 1 $width))
    echo -e "${color}┌${border}┐${BR_RESET}"
    echo -e "${color}│${BR_RESET} ${BR_TEXT}${text}${BR_RESET}"
    echo -e "${color}└${border}┘${BR_RESET}"
}

# Print gradient bar
br_gradient() {
    echo -e "${BR_AMBER}██${BR_ORANGE}██${BR_PINK}██${BR_MAGENTA}██${BR_BLUE}██${BR_MAGENTA}██${BR_PINK}██${BR_ORANGE}██${BR_AMBER}██${BR_RESET}"
}

# Print header with gradient
br_header() {
    local text="$1"
    echo ""
    br_gradient
    echo -e "${BR_TEXT}  ${text}${BR_RESET}"
    br_gradient
    echo ""
}

export BR_AMBER BR_ORANGE BR_PINK BR_MAGENTA BR_BLUE BR_TEXT BR_WHITE BR_RESET NC
