#!/bin/bash
# Ask Cecilia - Voice command bridge
# Usage: ask-cecilia "your question"

CECILIA_API="http://192.168.4.89:8888"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

case "${1:-status}" in
    status)
        echo -e "${PINK}Asking Cecilia for status...${RESET}"
        curl -s "$CECILIA_API/status" | python3 -m json.tool
        ;;
    time)
        echo -e "${PINK}Reading time journal from Cecilia...${RESET}"
        curl -s "$CECILIA_API/time" | python3 -m json.tool
        ;;
    *)
        echo -e "${PINK}Asking Cecilia: $*${RESET}"
        QUERY=$(echo "$*" | sed 's/ /+/g')
        RESPONSE=$(curl -s "$CECILIA_API/ask?q=$QUERY")
        echo -e "${GREEN}Cecilia says:${RESET}"
        echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','No response'))"
        
        # Speak it on Mac
        if command -v say &>/dev/null; then
            echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('response',''))" | say
        fi
        ;;
esac
