#!/bin/bash
# BLACKROAD TERMINAL PROMPT
# Beautiful PS1 prompt with BlackRoad colors

# Source this file to use: source ~/blackroad-prompt.sh

AMBER='\[\033[38;5;208m\]'
ORANGE='\[\033[38;5;202m\]'
PINK='\[\033[38;5;198m\]'
MAGENTA='\[\033[38;5;163m\]'
BLUE='\[\033[38;5;33m\]'
WHITE='\[\033[1;37m\]'
DIM='\[\033[2m\]'
RESET='\[\033[0m\]'

# Function to get git branch
br_git_branch() {
    git branch 2>/dev/null | grep '^*' | sed 's/* //'
}

# Set the prompt
export PS1="${AMBER}█${ORANGE}█${PINK}█${MAGENTA}█${BLUE}█${RESET} ${WHITE}\u${RESET}@${PINK}\h${RESET} ${AMBER}\w${RESET} ${MAGENTA}\$(br_git_branch)${RESET}
${PINK}φ${RESET}${WHITE}▸${RESET} "

# Alternative minimal version:
# export PS1="${PINK}█▸${RESET} "

echo "BlackRoad prompt activated! φ▸"
