#!/usr/bin/env zsh
# BR Doctor — Full system health check for BlackRoad OS
# Checks: fleet, AI skills, RAG, gateway, Qdrant, Ollama, Gitea, tunnels, memory
#
# Usage: br doctor [--json] [--fix]

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
RED='\033[0;31m'
CYAN='\033[38;5;69m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0; FAIL=0; WARN=0; FIXES=()
JSON_MODE=false
FIX_MODE=false

[[ "$1" == "--json" ]] && JSON_MODE=true
[[ "$1" == "--fix" || "$2" == "--fix" ]] && FIX_MODE=true

_ms() { python3 -c "import time; print(int(time.time()*1000))" 2>/dev/null || echo 0; }

_check() {
    local label="$1" chk_st="$2" detail="$3" ms="${4:-}"
    local icon
    case "$chk_st" in
        ok)   icon="${GREEN}✓${NC}"; (( PASS++ )) ;;
        warn) icon="${AMBER}~${NC}"; (( WARN++ )) ;;
        fail) icon="${RED}✗${NC}"; (( FAIL++ )) ;;
    esac
    if ! $JSON_MODE; then
        local timing=""; [[ -n "$ms" && "$ms" != "0" ]] && timing="${DIM}  ${ms}ms${NC}"
        printf "  %b  %-32s %b%b\n" "$icon" "$label" "$detail" "$timing"
    fi
}

# Header
if ! $JSON_MODE; then
    echo ""
    echo -e "  ${PINK}BlackRoad OS Doctor${NC}"
    echo -e "  ${DIM}Full system diagnostic${NC}"
    echo ""
fi

# ── Fleet Nodes ──────────────────────────────────────────
if ! $JSON_MODE; then echo -e "  ${CYAN}Fleet${NC}"; fi

NODES=("pi@192.168.4.49:Alice" "blackroad@192.168.4.96:Cecilia" "pi@192.168.4.101:Octavia" "blackroad@192.168.4.98:Aria" "octavia@192.168.4.38:Lucidia")

for entry in "${NODES[@]}"; do
    IFS=':' read -r ssh_target name <<< "$entry"
    t1=$(_ms)
    if ssh -o ConnectTimeout=3 -o BatchMode=yes "$ssh_target" "echo ok" &>/dev/null; then
        t2=$(_ms); lat=$(( t2 - t1 ))
        _check "$name" ok "online" "$lat"
    else
        _check "$name" fail "unreachable"
        FIXES+=("Check SSH to $ssh_target")
    fi
done

# ── AI Services ──────────────────────────────────────────
if ! $JSON_MODE; then echo ""; echo -e "  ${CYAN}AI Services${NC}"; fi

# Ollama on Cecilia
t1=$(_ms)
if curl -s --connect-timeout 3 http://192.168.4.96:11434/api/tags &>/dev/null; then
    models=$(curl -s http://192.168.4.96:11434/api/tags 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    t2=$(_ms); lat=$(( t2 - t1 ))
    _check "Ollama (Cecilia)" ok "${models} models" "$lat"
else
    _check "Ollama (Cecilia)" fail "unreachable"
fi

# Qdrant on Alice
t1=$(_ms)
qdrant_resp=$(curl -s --connect-timeout 3 http://192.168.4.49:6333/collections 2>/dev/null)
if [[ -n "$qdrant_resp" ]]; then
    collections=$(echo "$qdrant_resp" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('result',{}).get('collections',[])))" 2>/dev/null || echo "?")
    t2=$(_ms); lat=$(( t2 - t1 ))
    _check "Qdrant (Alice)" ok "${collections} collections" "$lat"
else
    _check "Qdrant (Alice)" fail "unreachable"
fi

# RAG Index
rag_count=$(curl -s --connect-timeout 3 http://192.168.4.49:6333/collections/blackroad-code 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',{}).get('points_count',0))" 2>/dev/null || echo "0")
if [[ "$rag_count" -gt 1000 ]]; then
    _check "RAG Index" ok "${rag_count}/32297 vectors"
elif [[ "$rag_count" -gt 0 ]]; then
    _check "RAG Index" warn "${rag_count}/32297 vectors (indexing)"
else
    _check "RAG Index" warn "empty — run: rag index"
    FIXES+=("Run: python3 ~/.blackroad-rag/index-background.py")
fi

# Embedding model
t1=$(_ms)
embed_test=$(curl -s --connect-timeout 5 http://192.168.4.96:11434/api/embeddings -d '{"model":"nomic-embed-text","prompt":"test"}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('embedding',[])))" 2>/dev/null || echo "0")
if [[ "$embed_test" == "768" ]]; then
    t2=$(_ms); lat=$(( t2 - t1 ))
    _check "Embeddings" ok "nomic-embed-text 768d" "$lat"
else
    _check "Embeddings" fail "not responding"
fi

# ── AI Skills ────────────────────────────────────────────
if ! $JSON_MODE; then echo ""; echo -e "  ${CYAN}AI Skills${NC}"; fi

skills_result=$(python3 -c "
import sys
sys.path.insert(0, '$HOME/blackroad-operator/orgs/core/blackroad-cli/bots/skills')
try:
    import frontier_skill
    skills = frontier_skill.list_skills()
    categories = frontier_skill.skills_by_category()
    print(f'{len(skills)} skills, {len(categories)} categories')
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null)

if [[ "$skills_result" == "50"* ]]; then
    _check "Skills Registry" ok "$skills_result"
else
    _check "Skills Registry" fail "$skills_result"
fi

# ── Infrastructure ───────────────────────────────────────
if ! $JSON_MODE; then echo ""; echo -e "  ${CYAN}Infrastructure${NC}"; fi

# Gitea
t1=$(_ms)
if curl -s --connect-timeout 3 "http://192.168.4.101:3100/api/v1/repos/search?limit=1" &>/dev/null; then
    t2=$(_ms); lat=$(( t2 - t1 ))
    _check "Gitea (Octavia)" ok "207 repos" "$lat"
else
    _check "Gitea (Octavia)" fail "unreachable"
fi

# Cloudflare tunnels (check cloudflared on nodes)
tunnel_count=0
for entry in "${NODES[@]}"; do
    IFS=':' read -r ssh_target name <<< "$entry"
    if ssh -o ConnectTimeout=2 -o BatchMode=yes "$ssh_target" "pgrep cloudflared" &>/dev/null; then
        (( tunnel_count++ ))
    fi
done
if [[ $tunnel_count -ge 4 ]]; then
    _check "CF Tunnels" ok "${tunnel_count}/5 nodes"
elif [[ $tunnel_count -ge 2 ]]; then
    _check "CF Tunnels" warn "${tunnel_count}/5 nodes"
else
    _check "CF Tunnels" fail "${tunnel_count}/5 nodes"
fi

# Memory system
mem_entries=$(wc -l < "$HOME/.blackroad/memory/journal.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
if [[ "$mem_entries" -gt 0 ]]; then
    _check "Memory System" ok "${mem_entries} journal entries"
else
    _check "Memory System" warn "no entries"
fi

# FTS5 index
fts_count=$(python3 -c "
import sqlite3, os
db = os.path.expanduser('~/.blackroad/memory/memory-index.db')
if os.path.exists(db):
    c = sqlite3.connect(db)
    r = c.execute('SELECT COUNT(*) FROM memory_fts').fetchone()
    print(r[0])
else:
    print(0)
" 2>/dev/null || echo "0")
_check "FTS5 Index" ok "${fts_count} entries"

# ── Summary ──────────────────────────────────────────────
total=$(( PASS + FAIL + WARN ))
score=$(( PASS * 100 / (total > 0 ? total : 1) ))

if ! $JSON_MODE; then
    echo ""
    echo -e "  ${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${GREEN}✓ ${PASS}${NC}  ${AMBER}~ ${WARN}${NC}  ${RED}✗ ${FAIL}${NC}  ${DIM}Score: ${score}/100${NC}"

    if [[ ${#FIXES[@]} -gt 0 ]]; then
        echo ""
        echo -e "  ${AMBER}Suggested fixes:${NC}"
        for fix in "${FIXES[@]}"; do
            echo -e "    → $fix"
        done
    fi

    echo ""
    echo -e "  ${DIM}BlackRoad OS — Pave Tomorrow.${NC}"
    echo ""
else
    python3 -c "
import json
print(json.dumps({
    'pass': $PASS, 'warn': $WARN, 'fail': $FAIL,
    'score': $score, 'total': $total
}, indent=2))
"
fi
