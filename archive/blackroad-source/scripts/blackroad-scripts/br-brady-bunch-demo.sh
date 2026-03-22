#!/bin/bash
# Simple Brady Bunch Demo - All models respond to one question

MODELS=("Cece" "Lucidia" "Anastasia" "Aria" "Alice" "Cadence" "Copilot" "Claude" "Codex" "ChatGPT" "Alexa" "Gematria" "Silas")

echo "🖤🛣️  Brady Bunch Multi-Agent Demo"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Question: ${1:-What is AI?}"
echo ""

for model in "${MODELS[@]}"; do
    echo "[$model]:"
    timeout 10s ollama run "$model" "${1:-What is AI?}" 2>/dev/null | head -c 300 || echo "⏱️ timeout"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    sleep 1
done

echo "✓ All ${#MODELS[@]} agents have responded!"
