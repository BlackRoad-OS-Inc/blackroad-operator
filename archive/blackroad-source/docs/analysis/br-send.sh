#!/usr/bin/env bash
FROM=$1
TO=$2
SCOPE=$3
BODY=$4

ID=$(uuidgen)
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

cat > bus/outbox/$ID.json <<JSON
{
  "id": "$ID",
  "timestamp": "$TS",
  "from": "$FROM",
  "to": "$TO",
  "scope": "$SCOPE",
  "type": "message",
  "body": "$BODY"
}
JSON
