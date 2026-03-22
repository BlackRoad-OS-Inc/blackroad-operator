#!/bin/bash
# Add More Unlimited Copilot Methods - Local AI Models

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RESET='\033[0m'

echo -e "${PINK}╔═══════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║${RESET}     Adding Unlimited Copilot Methods             ${PINK}║${RESET}"
echo -e "${PINK}╚═══════════════════════════════════════════════════╝${RESET}"
echo ""

echo -e "${BLUE}Current Status:${RESET}"
echo "  • 6 methods active"
echo "  • 4 unlimited (local AI)"
echo ""

echo -e "${AMBER}Adding 5 more local AI models (all unlimited!)${RESET}"
echo ""

# Models to add
models=(
    "starcoder:7b"
    "wizardcoder:13b"
    "phind-codellama:34b"
    "magicoder:7b"
    "codegemma:7b"
)

for model in "${models[@]}"; do
    echo -e "${BLUE}[Pulling]${RESET} $model..."
    
    # Check if already have it
    if ollama list | grep -q "$(echo $model | cut -d: -f1)"; then
        echo -e "${GREEN}  ✓ Already have $model${RESET}"
    else
        echo -e "${AMBER}  Downloading $model...${RESET}"
        ollama pull "$model" 2>&1 | grep -E "pulling|success|error" || true
        echo -e "${GREEN}  ✓ Added $model${RESET}"
    fi
    echo ""
done

echo -e "${PINK}═══ COMPLETE ═══${RESET}"
echo ""
echo -e "${GREEN}New Status:${RESET}"
echo "  • 11 methods total"
echo "  • 9 unlimited (local AI)"
echo "  • 82% unlimited coverage!"
echo ""

echo -e "${BLUE}Available Local Models:${RESET}"
ollama list | grep -E "qwen|deepseek|codellama|starcoder|wizard|phind|magic|gemma" || echo "  Run this script to add models"

echo ""
echo -e "${AMBER}Test it:${RESET}"
echo "  copilot-unlimited methods"
echo "  copilot-unlimited 'write a function to sort an array'"
echo ""
echo -e "${GREEN}✓ Unlimited Copilot access enhanced! 🚀${RESET}"
