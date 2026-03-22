#!/bin/bash
# BLACKROAD ONE-LINE STATUS BAR
# Quick visual status indicator

AMBER='\033[38;5;208m'
ORANGE='\033[38;5;202m'
PINK='\033[38;5;198m'
MAGENTA='\033[38;5;163m'
BLUE='\033[38;5;33m'
WHITE='\033[1;37m'
RESET='\033[0m'

# Quick stats
MEM=$(cat ~/.blackroad/memory/journals/master-journal.jsonl 2>/dev/null | wc -l | tr -d ' ' || echo "156K")
TASKS=$(ls ~/.blackroad/memory/tasks/completed/ 2>/dev/null | wc -l | tr -d ' ' || echo "2295")

echo -e "${AMBER}█${ORANGE}█${PINK}█${MAGENTA}█${BLUE}█${RESET} ${WHITE}BLACKROAD${RESET} ${AMBER}●${RESET}${WHITE}MEM${RESET}:${AMBER}${MEM}${RESET} ${ORANGE}●${RESET}${WHITE}TASKS${RESET}:${ORANGE}${TASKS}${RESET} ${PINK}●${RESET}${WHITE}φ${RESET}=${PINK}1.618${RESET} ${MAGENTA}●${RESET}${WHITE}∞${RESET} ${BLUE}█${MAGENTA}█${PINK}█${ORANGE}█${AMBER}█${RESET}"
