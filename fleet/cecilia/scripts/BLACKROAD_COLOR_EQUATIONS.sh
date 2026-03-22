#!/bin/bash
# ============================================================================
# BLACKROAD COLOR EQUATIONS
# The fundamental constants of BlackRoad visual identity
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# 
# These are MATHEMATICAL CONSTANTS, not preferences.
# Like π or e, these values are fixed and immutable.
# 
# DO NOT modify these values.
# DO NOT add cyan, teal, light blue, or any off-brand colors.
# ============================================================================

# === PRIMARY BRAND EQUATIONS ===
readonly PINK='38;5;205'     # Hot Pink    #FF1D6C
readonly AMBER='38;5;214'    # Amber       #F5A623
readonly BLUE='38;5;69'      # Electric    #2979FF
readonly VIOLET='38;5;135'   # Violet      #9C27B0

# === MONOCHROME EQUATIONS ===
readonly WHITE='1;37'        # Pure White  #FFFFFF
readonly BLACK='0;30'        # Pure Black  #000000
readonly GRAY='38;5;244'     # Gray        #808080

# === STATUS EQUATIONS ===
readonly SUCCESS='38;5;82'   # Green       #5FD700
readonly ERROR='38;5;196'    # Red         #FF0000
readonly WARNING='38;5;214'  # Amber (reuse)

# === COMPUTED FOREGROUND COLORS ===
# These apply the ESC[ prefix and 'm' suffix
readonly BR_PINK="\033[${PINK}m"
readonly BR_AMBER="\033[${AMBER}m"
readonly BR_BLUE="\033[${BLUE}m"
readonly BR_VIOLET="\033[${VIOLET}m"
readonly BR_WHITE="\033[${WHITE}m"
readonly BR_BLACK="\033[${BLACK}m"
readonly BR_GRAY="\033[${GRAY}m"
readonly BR_SUCCESS="\033[${SUCCESS}m"
readonly BR_ERROR="\033[${ERROR}m"
readonly BR_WARNING="\033[${WARNING}m"

# === RESET EQUATION ===
readonly BR_RESET="\033[0m"
readonly NC="\033[0m"

# === EXPORT ALL EQUATIONS ===
export PINK AMBER BLUE VIOLET WHITE BLACK GRAY SUCCESS ERROR WARNING
export BR_PINK BR_AMBER BR_BLUE BR_VIOLET BR_WHITE BR_BLACK BR_GRAY
export BR_SUCCESS BR_ERROR BR_WARNING BR_RESET NC

# === VALIDATION FUNCTION ===
validate_color() {
    local code="$1"
    case "$code" in
        "$PINK"|"$AMBER"|"$BLUE"|"$VIOLET"|"$WHITE"|"$BLACK"|"$GRAY"|"$SUCCESS"|"$ERROR"|"$WARNING")
            return 0
            ;;
        *)
            echo "ERROR: Invalid color code '$code'" >&2
            echo "Must be one of: PINK, AMBER, BLUE, VIOLET, WHITE, BLACK, GRAY" >&2
            return 1
            ;;
    esac
}

# === HELPER FUNCTIONS ===
br_print() {
    local color="$1"
    local text="$2"
    echo -e "\033[${color}m${text}${BR_RESET}"
}

br_line() {
    local color="$1"
    local text="$2"
    echo -e "\033[${color}m████${BR_RESET} ${BR_WHITE}${text}${BR_RESET}"
}

# === USAGE EXAMPLES ===
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    echo ""
    echo -e "${BR_WHITE}🖤 BLACKROAD COLOR EQUATIONS${BR_RESET}"
    echo -e "${BR_WHITE}═════════════════════════════${BR_RESET}"
    echo ""
    br_line "$PINK" "PINK   = $PINK   (#FF1D6C)"
    br_line "$AMBER" "AMBER  = $AMBER  (#F5A623)"
    br_line "$BLUE" "BLUE   = $BLUE   (#2979FF)"
    br_line "$VIOLET" "VIOLET = $VIOLET (#9C27B0)"
    echo ""
    echo -e "${BR_GRAY}GRAY   = $GRAY   (#808080)${BR_RESET}"
    echo ""
    echo -e "${BR_SUCCESS}SUCCESS = $SUCCESS (Green)${BR_RESET}"
    echo -e "${BR_ERROR}ERROR   = $ERROR (Red)${BR_RESET}"
    echo ""
    echo -e "${BR_WHITE}Usage in scripts:${BR_RESET}"
    echo -e "${BR_GRAY}  source ~/BLACKROAD_COLOR_EQUATIONS.sh${BR_RESET}"
    echo -e "${BR_GRAY}  echo -e \"\${BR_PINK}Text in pink\${BR_RESET}\"${BR_RESET}"
    echo -e "${BR_GRAY}  br_line \"\$PINK\" \"Pink line with white text\"${BR_RESET}"
    echo ""
fi
