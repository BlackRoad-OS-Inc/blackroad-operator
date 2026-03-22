#!/usr/bin/env bash

MODEL="qwen2.5:0.5b"
SYSTEM_PROMPT="$(cat lucidia.system)"

while true; do
  echo
  read -rp "lucidia> " USER_INPUT || exit 0

  PROMPT="$SYSTEM_PROMPT

User:
$USER_INPUT

Lucidia:"

  RESPONSE=$(ollama run "$MODEL" "$PROMPT")
  echo "$RESPONSE"
done
