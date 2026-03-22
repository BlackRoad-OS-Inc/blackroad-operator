#!/usr/bin/env bash
# Generate AI images via images.blackroad.io
# Usage: ./generate.sh "prompt" [provider] [model] [size]
# Example: ./generate.sh "neon cyberpunk city at night" together flux-schnell 1024x1024

set -e

ENDPOINT="https://images.blackroad.io"
PROMPT="${1:?Usage: $0 \"prompt\" [provider] [model] [size]}"
PROVIDER="${2:-together}"
MODEL="${3:-flux-schnell}"
SIZE="${4:-1024x1024}"
NODE=$(hostname)

echo "Generating: \"$PROMPT\""
echo "Provider: $PROVIDER | Model: $MODEL | Size: $SIZE"

RESULT=$(curl -s -X POST "$ENDPOINT/api/generate" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"$PROMPT\",\"provider\":\"$PROVIDER\",\"model\":\"$MODEL\",\"size\":\"$SIZE\",\"source_node\":\"$NODE\"}")

ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")
ERROR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null || echo "")

if [ -n "$ID" ]; then
  URL="$ENDPOINT/img/$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])" 2>/dev/null)"
  SIZE_B=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('size',0))" 2>/dev/null)
  echo "Done: $URL ($(echo "scale=1; $SIZE_B/1024" | bc)KB)"
elif [ -n "$ERROR" ]; then
  echo "Error: $ERROR"
  exit 1
else
  echo "Error: $RESULT"
  exit 1
fi
