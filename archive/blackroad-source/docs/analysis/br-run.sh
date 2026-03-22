#!/usr/bin/env bash

BRAIN=${1:-blackroad-core}
PROMPT=${2:-}

MODEL=$(yq ".brains.${BRAIN}.model" brains.yaml)

if [ "$MODEL" = "null" ]; then
  echo "Unknown brain: $BRAIN"
  exit 1
fi

ollama run "$MODEL" "$PROMPT"
