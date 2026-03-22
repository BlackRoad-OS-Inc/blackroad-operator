#!/usr/bin/env bash
QUESTION="$1"

jq -r --arg q "$QUESTION" '
  select(.question == $q)
  | .vote
  | ascii_downcase
  | select(. == "yes" or . == "no" or . == "abstain")
' votes/*.json 2>/dev/null | sort | uniq -c
