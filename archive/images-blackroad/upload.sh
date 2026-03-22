#!/usr/bin/env bash
# Upload images to images.blackroad.io from any node
# Usage: ./upload.sh <file> [prompt] [provider] [model]
# Example: ./upload.sh render.png "cyberpunk city" "comfyui" "sdxl"
# Batch: for f in *.png; do ./upload.sh "$f" "" "local"; done

set -e

ENDPOINT="https://images.blackroad.io"
FILE="${1:?Usage: $0 <file> [prompt] [provider] [model]}"
PROMPT="${2:-}"
PROVIDER="${3:-upload}"
MODEL="${4:-}"
NODE=$(hostname)

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

echo "Uploading: $FILE ($(du -h "$FILE" | cut -f1)) from $NODE..."

RESULT=$(curl -s -X POST "$ENDPOINT/api/upload" \
  -F "file=@$FILE" \
  -F "filename=$(basename "$FILE")" \
  -F "prompt=$PROMPT" \
  -F "provider=$PROVIDER" \
  -F "model=$MODEL" \
  -F "source_node=$NODE")

ID=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null || echo "")

if [ -n "$ID" ]; then
  echo "OK: $ENDPOINT/img/$ID.${FILE##*.}"
else
  echo "Error: $RESULT"
  exit 1
fi
