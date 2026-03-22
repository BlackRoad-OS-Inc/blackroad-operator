#!/bin/bash
MODEL="${1:-qwen2.5:0.5b}"
MEMORY="$HOME/.ollama/memory.txt"

echo "🟢 Ollama loop — $MODEL (system memory)"
echo "exit to quit"
echo

while true; do
  printf "you> "
  read -r INPUT || exit 0
  [[ "$INPUT" == "exit" ]] && break
  [[ -z "$INPUT" ]] && continue

  ollama run "$MODEL" \
    --system "$(cat "$MEMORY")" \
    "$INPUT"

  echo
done
