#!/bin/bash
# Enhanced RAG search — uses vector search via Qdrant when available,
# falls back to keyword search on JSONL.
#
# Usage:
#   rag-search "how does the gateway route requests"
#   rag-search "authentication" --repo blackroad-operator --type python
#   rag-search "deploy cloudflare" --top 20

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
CYAN='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

RAG_DIR="$HOME/.blackroad-rag"
RAG_ENGINE="$RAG_DIR/rag-engine.py"
QDRANT_HOST="${QDRANT_HOST:-http://192.168.4.49:6333}"
COLLECTION="${RAG_COLLECTION:-blackroad-code}"

# Check if Qdrant collection has data
qdrant_available() {
    local resp
    resp=$(curl -s --connect-timeout 2 "$QDRANT_HOST/collections/$COLLECTION" 2>/dev/null)
    local points
    points=$(echo "$resp" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("result",{}).get("points_count",0))' 2>/dev/null)
    [[ "$points" -gt 0 ]]
}

if [[ -z "$1" ]]; then
    echo -e "${PINK}BlackRoad RAG Search${RESET}"
    echo ""
    echo "Usage: rag-search <query> [--repo NAME] [--type python|javascript|...] [--top N]"
    echo ""
    echo "Examples:"
    echo "  rag-search 'gateway routing logic'"
    echo "  rag-search 'authentication' --repo blackroad-operator"
    echo "  rag-search 'deploy' --type shell --top 20"
    exit 0
fi

if qdrant_available; then
    # Vector search via RAG engine
    python3 "$RAG_ENGINE" search "$@"
else
    # Fallback: keyword search on JSONL
    echo -e "${AMBER}Qdrant unavailable — falling back to keyword search${RESET}"
    echo ""
    QUERY="$1"
    echo -e "${PINK}Keyword Search: ${CYAN}${QUERY}${RESET}"
    echo ""

    grep -i "$QUERY" "$RAG_DIR/code-chunks.jsonl" 2>/dev/null | \
        python3 -c "
import sys, json
results = []
for line in sys.stdin:
    try:
        chunk = json.loads(line.strip())
        results.append(chunk)
    except:
        pass

for i, r in enumerate(results[:10], 1):
    content_lines = r.get('content','').strip().split('\n')[:3]
    print(f\"  {i}. {r.get('repo','')}/{r.get('file','')}:{r.get('line',0)}\")
    for l in content_lines:
        print(f'     {l}')
    print()
" 2>/dev/null || echo "No results found."
fi
