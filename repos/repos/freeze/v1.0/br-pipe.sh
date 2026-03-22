#!/usr/bin/env bash
PIPELINE=$1
PROMPT=$2

if [ -z "$PIPELINE" ] || [ -z "$PROMPT" ]; then
  echo "usage: br-pipe <pipeline> <prompt>"
  exit 1
fi

CTX="$PROMPT"

run_agent () {
  local AGENT=$1
  local INPUT=$2
  ollama run "$AGENT" "$INPUT"
}

case "$PIPELINE" in
  safe-command)
    ROUTE=$(run_agent blackroad-router "$CTX")
    DRAFT=$(run_agent "$ROUTE" "$CTX")
    SAFETY=$(run_agent blackroad-sentinel "$DRAFT")
    ALLOW=$(run_agent blackroad-gatekeeper "$SAFETY")

    if [ "$ALLOW" = "ALLOW" ]; then
      run_agent blackroad-command "$DRAFT"
    else
      run_agent blackroad-explainer "$SAFETY"
    fi
    ;;
  *)
    echo "Unknown pipeline: $PIPELINE"
    exit 1
    ;;
esac
