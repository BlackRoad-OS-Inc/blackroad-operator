#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# ASCII Banner Generator - BlackRoad Style
# Usage: ./banner-gen.sh "Title" "Subtitle" "Footer" [color]
# Colors: pink, amber, blue, violet (default: pink)

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
RESET='\033[0m'

# Get terminal width or default to 100
WIDTH=${COLUMNS:-100}

# Select color
COLOR_NAME="${4:-pink}"
case $COLOR_NAME in
    amber) COLOR=$AMBER ;;
    blue) COLOR=$BLUE ;;
    violet) COLOR=$VIOLET ;;
    *) COLOR=$PINK ;;
esac

# Function to center text
center_text() {
    local text="$1"
    local width="$2"
    local text_len=${#text}
    local padding=$(( (width - text_len - 4) / 2 ))  # -4 for border chars
    printf "│%*s%s%*s│\n" $padding "" "$text" $((width - text_len - padding - 4)) ""
}

# Function to create empty line
empty_line() {
    local width="$1"
    printf "│%*s│\n" $((width - 2)) ""
}

# Function to create border
border() {
    local char="$1"
    local width="$2"
    printf "%s" "$char"
    printf "%.0s─" $(seq 1 $((width - 2)))
    printf "%s\n" "${char//╭/╮}"
}

# Default values
TITLE="${1:-BlackRoad OS}"
SUBTITLE="${2:-Autonomous Infrastructure}"
FOOTER="${3:-Powered by AI. Check for mistakes.}"

# ASCII art (optional, can be customized)
ART1="    ╭─╮╭─╮    "
ART2="    ╰─╯╰─╯    "
ART3="    █ ▘▝ █    "
ART4="     ▔▔▔▔     "

# Generate banner
echo ""
echo -ne "${COLOR}"
border "╭" "$WIDTH"
empty_line "$WIDTH"
center_text "$ART1" "$WIDTH"
center_text "$ART2" "$WIDTH"
center_text "$ART3" "$WIDTH"
center_text "$ART4" "$WIDTH"
center_text "$TITLE" "$WIDTH"
center_text "$SUBTITLE" "$WIDTH"
empty_line "$WIDTH"
border "╰" "$WIDTH"
echo -e "${RESET}"
echo ""
