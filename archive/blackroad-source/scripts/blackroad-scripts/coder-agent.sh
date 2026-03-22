#!/usr/bin/env bash

PROJECT_DIR="$HOME/sites"
MEMORY="$HOME/.coder_agent_memory.md"

mkdir -p "$PROJECT_DIR"
touch "$MEMORY"

echo "---- CONTEXT ----"
cat "$MEMORY"

echo "---- TASK ----"
cat

ollama run llama3.1:70b <<PROMPT
You are a senior software engineer.

Rules:
- Only modify files inside $PROJECT_DIR
- Always explain what files you will change
- Output a unified diff ONLY
- Assume git is initialized
- Remember decisions by appending to $MEMORY

Task:
$(cat)
PROMPT
