#!/usr/bin/env bash
QUESTION=$1
AGENT=$2
VOTE=$3        # yes | no | abstain
REASON=$4

ID=$(uuidgen)
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p votes

cat > votes/$ID.json <<JSON
{
  "id": "$ID",
  "timestamp": "$TS",
  "question": "$QUESTION",
  "agent": "$AGENT",
  "vote": "$VOTE",
  "reason": "$REASON"
}
JSON
