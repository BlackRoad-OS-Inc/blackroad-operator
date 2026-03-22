#!/bin/bash
# BlackRoad Memory → Slack D1 Sync
# Pushes local memory system data to the Slack Worker's D1 database
# so /collab /todos /codex /til /memory /search work from Slack
# Usage: ./memory-slack-sync.sh [full|tils|codex|projects|journal]

set -e

SLACK_API="https://blackroad-slack.amundsonalexa.workers.dev/memory"
MEMORY_DIR="$HOME/.blackroad/memory"
CODEX_DB="$MEMORY_DIR/codex/codex.db"
COLLAB_DB="$HOME/.blackroad/collaboration.db"
TODO_DIR="$MEMORY_DIR/infinite-todos/projects"
TIL_DIR="$MEMORY_DIR/til"
JOURNAL="$MEMORY_DIR/journals/master-journal.jsonl"

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
CYAN='\033[0;36m'
RESET='\033[0m'

sync_tils() {
    echo -e "${CYAN}Syncing TILs...${RESET}"
    local tils="["
    local first=true
    local count=0

    for f in "$TIL_DIR"/til-*.json; do
        [ -f "$f" ] || continue
        local data
        data=$(cat "$f" 2>/dev/null) || continue
        local til_id category learning broadcaster created_at
        til_id=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('til_id',''))" 2>/dev/null) || continue
        category=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('category','tip'))" 2>/dev/null)
        learning=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('learning','')[:500])" 2>/dev/null)
        broadcaster=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('broadcaster','')[:50])" 2>/dev/null)
        created_at=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('timestamp',d.get('created_at','')))" 2>/dev/null)

        [ -z "$til_id" ] || [ -z "$learning" ] && continue

        if [ "$first" = true ]; then first=false; else tils+=","; fi
        tils+=$(python3 -c "import json; print(json.dumps({'til_id':'$til_id','category':'$category','learning':$(python3 -c "import json; print(json.dumps('$learning'))"),'broadcaster':'$broadcaster','created_at':'$created_at'}))")
        count=$((count + 1))

        # Batch in groups of 50
        if [ $((count % 50)) -eq 0 ]; then
            tils+="]"
            curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",\"tils\":$tils}" > /dev/null
            tils="["
            first=true
            echo -e "  ${GREEN}✓${RESET} Synced $count TILs..."
        fi
    done

    tils+="]"
    if [ "$first" = false ]; then
        curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",\"tils\":$tils}" > /dev/null
    fi
    echo -e "${GREEN}✓${RESET} Synced $count TILs"
}

sync_codex() {
    echo -e "${CYAN}Syncing Codex...${RESET}"
    [ -f "$CODEX_DB" ] || { echo "No codex DB"; return; }

    local codex_json
    codex_json=$(sqlite3 "$CODEX_DB" "SELECT json_group_array(json_object(
        'codex_id', CAST(id AS TEXT),
        'name', name,
        'type', 'solution',
        'category', COALESCE(category,''),
        'description', COALESCE(problem,'') || ' → ' || COALESCE(solution,''),
        'created_at', COALESCE(created_at,'')
    )) FROM solutions LIMIT 200;" 2>/dev/null)

    local patterns_json
    patterns_json=$(sqlite3 "$CODEX_DB" "SELECT json_group_array(json_object(
        'codex_id', 'p-' || CAST(id AS TEXT),
        'name', pattern_name,
        'type', COALESCE(pattern_type,'pattern'),
        'category', COALESCE(tags,''),
        'description', COALESCE(description,''),
        'created_at', COALESCE(first_seen,'')
    )) FROM patterns LIMIT 100;" 2>/dev/null)

    local practices_json
    practices_json=$(sqlite3 "$CODEX_DB" "SELECT json_group_array(json_object(
        'codex_id', 'bp-' || CAST(id AS TEXT),
        'name', practice_name,
        'type', 'best_practice',
        'category', COALESCE(category,''),
        'description', COALESCE(description,''),
        'created_at', COALESCE(created_at,'')
    )) FROM best_practices LIMIT 100;" 2>/dev/null)

    local anti_json
    anti_json=$(sqlite3 "$CODEX_DB" "SELECT json_group_array(json_object(
        'codex_id', 'ap-' || CAST(id AS TEXT),
        'name', name,
        'type', 'anti_pattern',
        'category', COALESCE(severity,''),
        'description', COALESCE(description,''),
        'created_at', COALESCE(first_detected,'')
    )) FROM anti_patterns LIMIT 100;" 2>/dev/null)

    # Merge all arrays
    local all_codex
    all_codex=$(python3 -c "
import json, sys
a = json.loads('''$codex_json''') if '''$codex_json''' != '[]' else []
b = json.loads('''$patterns_json''') if '''$patterns_json''' != '[]' else []
c = json.loads('''$practices_json''') if '''$practices_json''' != '[]' else []
d = json.loads('''$anti_json''') if '''$anti_json''' != '[]' else []
print(json.dumps(a + b + c + d))
")

    local count
    count=$(echo "$all_codex" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")

    curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",\"codex\":$all_codex}" > /dev/null
    echo -e "${GREEN}✓${RESET} Synced $count codex entries"
}

sync_projects() {
    echo -e "${CYAN}Syncing Projects & Todos...${RESET}"
    [ -d "$TODO_DIR" ] || { echo "No projects dir"; return; }

    local projects="[]"
    local todos="[]"
    local count=0

    projects=$(python3 -c "
import json, glob, os
projects = []
todos = []
for f in glob.glob('$TODO_DIR/*.json'):
    try:
        with open(f) as fh:
            d = json.load(fh)
        projects.append({
            'project_id': d.get('project_id',''),
            'title': d.get('title',''),
            'description': d.get('description','')[:200],
            'progress': d.get('progress',0),
            'status': d.get('status','active'),
            'timescale': d.get('timescale','forever'),
            'owner': d.get('owner','')[:50],
        })
        for t in d.get('todos',[]):
            todos.append({
                'todo_id': t.get('id',''),
                'project_id': d.get('project_id',''),
                'text': t.get('text','')[:200],
                'priority': t.get('priority','medium'),
                'status': t.get('status','pending'),
                'created_at': t.get('created_at',''),
            })
    except: pass
print(json.dumps({'projects': projects, 'todos': todos, 'count': len(projects)}))
")

    count=$(echo "$projects" | python3 -c "import sys,json; print(json.load(sys.stdin)['count'])")
    curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",$(echo "$projects" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps({'projects':d['projects'],'todos':d['todos']})[1:-1])")}" > /dev/null
    echo -e "${GREEN}✓${RESET} Synced $count projects"
}

sync_sessions() {
    echo -e "${CYAN}Syncing Sessions...${RESET}"
    [ -f "$COLLAB_DB" ] || { echo "No collab DB"; return; }

    local sessions
    sessions=$(sqlite3 "$COLLAB_DB" "SELECT json_group_array(json_object(
        'session_id', session_id,
        'status', status,
        'focus', COALESCE(focus,''),
        'last_seen', last_seen,
        'agent_id', COALESCE(agent_id,''),
        'created_at', started_at
    )) FROM sessions ORDER BY last_seen DESC LIMIT 50;" 2>/dev/null)

    local count
    count=$(echo "$sessions" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
    curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",\"sessions\":$sessions}" > /dev/null
    echo -e "${GREEN}✓${RESET} Synced $count sessions"
}

sync_journal() {
    echo -e "${CYAN}Syncing Journal (last 100)...${RESET}"
    [ -f "$JOURNAL" ] || { echo "No journal"; return; }

    local entries
    entries=$(tail -100 "$JOURNAL" | python3 -c "
import sys, json
entries = []
for line in sys.stdin:
    try:
        d = json.loads(line.strip())
        entries.append({
            'entry_id': d.get('sha256','')[:32] or str(len(entries)),
            'action': d.get('action','?'),
            'entity': d.get('entity','?'),
            'details': d.get('details','')[:200],
            'source': 'mac',
            'created_at': d.get('timestamp',''),
        })
    except: pass
print(json.dumps(entries))
")

    local count
    count=$(echo "$entries" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
    curl -s -X POST "$SLACK_API" -H 'Content-Type: application/json' -d "{\"type\":\"sync\",\"journal\":$entries}" > /dev/null
    echo -e "${GREEN}✓${RESET} Synced $count journal entries"
}

case "${1:-full}" in
    full)
        echo -e "${PINK}╔════════════════════════════════════════════════╗${RESET}"
        echo -e "${PINK}║    Memory → Slack D1 Full Sync                ║${RESET}"
        echo -e "${PINK}╚════════════════════════════════════════════════╝${RESET}\n"
        sync_sessions
        sync_journal
        sync_tils
        sync_codex
        sync_projects
        echo -e "\n${GREEN}✓ Full sync complete${RESET}"
        echo -e "  Test: curl -s $SLACK_API/stats | python3 -m json.tool"
        ;;
    tils) sync_tils ;;
    codex) sync_codex ;;
    projects) sync_projects ;;
    journal) sync_journal ;;
    sessions) sync_sessions ;;
    *)
        echo "Usage: $0 [full|tils|codex|projects|journal|sessions]"
        ;;
esac
