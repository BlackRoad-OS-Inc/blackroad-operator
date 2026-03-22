#!/usr/bin/env bash
FUNC_NAME="$1"
RAG_DIR="$HOME/.blackroad-rag"

echo "🔍 Finding function: $FUNC_NAME"
echo ""

grep -i "def $FUNC_NAME\|function $FUNC_NAME\|const $FUNC_NAME" "$RAG_DIR/code-chunks.jsonl" | \
    jq -r '"\(.repo)/\(.file):\(.line)\n\(.content)\n"'
