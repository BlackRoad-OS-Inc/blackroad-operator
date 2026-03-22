#!/usr/bin/env bash
# BlackRoad Semantic Search — enhanced with vector search
# Uses Qdrant vector search when available, falls back to keyword grep.
#
# Usage:
#   semantic-search.sh "how does authentication work"
#   semantic-search.sh "deploy" --repo blackroad-operator

set -e

QUERY="$1"
RAG_DIR="$HOME/.blackroad-rag"
RAG_ENGINE="$RAG_DIR/rag-engine.py"
QDRANT_HOST="${QDRANT_HOST:-http://192.168.4.49:6333}"
COLLECTION="${RAG_COLLECTION:-blackroad-code}"

if [ -z "$QUERY" ]; then
    echo "Usage: $0 <search query> [--repo NAME] [--type TYPE] [--top N]"
    exit 1
fi

# Try vector search first
if curl -s --connect-timeout 2 "$QDRANT_HOST/collections/$COLLECTION" 2>/dev/null | \
   python3 -c 'import sys,json; r=json.load(sys.stdin); exit(0 if r.get("result",{}).get("points_count",0)>0 else 1)' 2>/dev/null; then
    python3 "$RAG_ENGINE" search "$@"
else
    echo "⚡ Vector index not ready — using keyword search"
    echo ""

    echo "=== Code Matches ==="
    grep -i "$QUERY" "$RAG_DIR/code-chunks.jsonl" 2>/dev/null | \
        jq -r '"\(.repo)/\(.file):\(.line) - \(.content[:120])"' 2>/dev/null | head -20

    echo ""
    echo "=== Repository Matches ==="
    jq -r ".repos[] | select(.name | ascii_downcase | contains(\"$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')\")) | \"[\(.name)] \(.path)\"" \
        "$RAG_DIR/code-index.json" 2>/dev/null

    echo ""
    echo "💡 Run 'python3 ~/.blackroad-rag/rag-engine.py index' to enable vector search"
fi
