#!/usr/bin/env bash

while IFS="|" read -r NAME PURPOSE; do
  MF="Modelfile.$NAME"

  cat > "$MF" <<EOM
FROM blackroad-proprietary

SYSTEM """
$NAME Node.

Purpose:
- $PURPOSE

Rules:
- domain-specific only
- no execution
- deterministic output
- terminal-safe
"""
EOM

  ollama create "$NAME" -f "$MF"
done < agents-tier5.txt
