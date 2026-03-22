#!/bin/bash
# Migrate BlackRoad Task Marketplace from JSON files to SQLite
# Fast bulk migration using find + jq stream processing
set -e

MEMORY_DIR="$HOME/.blackroad/memory"
TASKS_DIR="$MEMORY_DIR/tasks"
TASKS_DB="$MEMORY_DIR/tasks.db"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

for cmd in sqlite3 jq; do
    command -v "$cmd" &>/dev/null || { echo -e "${RED}$cmd required but not found.${NC}"; exit 1; }
done

if [[ -f "$TASKS_DB" ]]; then
    echo -e "${YELLOW}Warning: $TASKS_DB already exists. Overwriting.${NC}"
    rm -f "$TASKS_DB"
fi

echo -e "${CYAN}Creating SQLite database at $TASKS_DB${NC}"

sqlite3 "$TASKS_DB" <<'SQL'
CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    tags TEXT DEFAULT 'general',
    skills TEXT DEFAULT 'any',
    status TEXT NOT NULL DEFAULT 'available',
    posted_at TEXT,
    posted_by TEXT DEFAULT 'unknown',
    claimed_by TEXT,
    claimed_at TEXT,
    timeout_at TEXT,
    completed_at TEXT,
    result TEXT
);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_claimed_by ON tasks(claimed_by);
CREATE INDEX idx_tasks_posted_at ON tasks(posted_at);

CREATE VIRTUAL TABLE tasks_fts USING fts5(
    task_id, title, description, tags
);
SQL

echo -e "${GREEN}Schema created.${NC}"

import_dir() {
    local dir="$1"
    local status_override="$2"
    local label="$3"

    [[ ! -d "$dir" ]] && { echo -e "${YELLOW}$dir does not exist, skipping.${NC}"; return; }

    local total
    total=$(find "$dir" -maxdepth 1 -name "*.json" -type f 2>/dev/null | wc -l | tr -d ' ')
    [[ "$total" -eq 0 ]] && { echo -e "${YELLOW}No $label tasks in $dir${NC}"; return; }

    echo -e "${CYAN}Importing $total $label tasks...${NC}"

    # Use find + xargs + jq to stream all JSON into a single SQL batch
    # Process in chunks of 500 files via xargs to avoid arg limits
    local tmpcsv
    tmpcsv=$(mktemp)

    find "$dir" -maxdepth 1 -name "*.json" -type f -print0 | \
        xargs -0 -n 500 jq -r --arg st "$status_override" '
            [
                (.task_id // input_filename | gsub(".*/"; "") | gsub("\\.json$"; "")),
                (.title // ""),
                (.description // ""),
                (.priority // "medium"),
                (.tags // "general"),
                (.skills // "any"),
                $st,
                (.posted_at // ""),
                (.posted_by // "unknown"),
                (.claimed_by // ""),
                (.claimed_at // ""),
                (.timeout_at // ""),
                (.completed_at // ""),
                (.result // "")
            ] | @csv
        ' 2>/dev/null >> "$tmpcsv" || true

    local imported
    imported=$(wc -l < "$tmpcsv" | tr -d ' ')
    echo -e "  ${CYAN}Parsed $imported records, loading into SQLite...${NC}"

    sqlite3 "$TASKS_DB" <<EOSQL
.mode csv
.import $tmpcsv tasks
EOSQL

    rm -f "$tmpcsv"
    echo -e "  ${GREEN}Imported $imported $label tasks.${NC}"
}

import_dir "$TASKS_DIR/available" "available" "available"
import_dir "$TASKS_DIR/claimed" "claimed" "claimed"
import_dir "$TASKS_DIR/completed" "completed" "completed"

# Build FTS index
echo -e "${CYAN}Building FTS search index...${NC}"
sqlite3 "$TASKS_DB" "INSERT INTO tasks_fts (task_id, title, description, tags) SELECT task_id, title, description, tags FROM tasks;"
echo -e "${GREEN}FTS index built.${NC}"

# Stats
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Migration complete!${NC}"
echo ""
sqlite3 "$TASKS_DB" ".mode column" ".headers on" "SELECT status, COUNT(*) as count FROM tasks GROUP BY status;"
echo ""
db_size=$(du -h "$TASKS_DB" | cut -f1)
echo -e "${GREEN}Database size: ${CYAN}$db_size${NC}"
echo -e "${GREEN}Database path: ${CYAN}$TASKS_DB${NC}"
echo ""
echo -e "${YELLOW}After verifying, remove old JSON files with:${NC}"
echo -e "  rm -rf $TASKS_DIR/available/ $TASKS_DIR/claimed/ $TASKS_DIR/completed/"
