#!/bin/bash
# [BOOKMARKS] System - Favorites and bookmarks for BlackRoad
# Usage: ~/bookmarks-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

BOOKMARKS_DB="$HOME/.blackroad/bookmarks.db"

init_bookmarks() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$BOOKMARKS_DB" <<EOF
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT,
    notes TEXT,
    folder TEXT DEFAULT 'default',
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_id TEXT,
    icon TEXT,
    position INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name, parent_id)
);

CREATE TABLE IF NOT EXISTS recent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT,
    accessed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_folder ON bookmarks(folder);
EOF
    echo -e "${GREEN}[BOOKMARKS]${RESET} System initialized"
}

# Add bookmark
add() {
    local entity_type="$1"
    local entity_id="$2"
    local title="${3:-}"
    local folder="${4:-default}"
    local notes="${5:-}"

    local bookmark_id="bm-$(openssl rand -hex 8)"

    sqlite3 "$BOOKMARKS_DB" "INSERT OR REPLACE INTO bookmarks (id, user_id, entity_type, entity_id, title, folder, notes) VALUES ('$bookmark_id', '$USER', '$entity_type', '$entity_id', '$title', '$folder', '$notes');"
    echo -e "${GREEN}[BOOKMARKS]${RESET} Added: $entity_type:$entity_id"
}

# Remove bookmark
remove() {
    local entity_type="$1"
    local entity_id="$2"

    sqlite3 "$BOOKMARKS_DB" "DELETE FROM bookmarks WHERE user_id='$USER' AND entity_type='$entity_type' AND entity_id='$entity_id';"
    echo -e "${GREEN}[BOOKMARKS]${RESET} Removed: $entity_type:$entity_id"
}

# List bookmarks
list() {
    local folder="${1:-}"
    echo -e "${AMBER}[BOOKMARKS]${RESET} Bookmarks"
    echo ""
    if [[ -n "$folder" ]]; then
        sqlite3 -column -header "$BOOKMARKS_DB" "SELECT id, entity_type, entity_id, title FROM bookmarks WHERE user_id='$USER' AND folder='$folder' ORDER BY position, created_at DESC;"
    else
        sqlite3 -column -header "$BOOKMARKS_DB" "SELECT id, entity_type, entity_id, title, folder FROM bookmarks WHERE user_id='$USER' ORDER BY folder, position;"
    fi
}

# Check if bookmarked
is_bookmarked() {
    local entity_type="$1"
    local entity_id="$2"

    local exists=$(sqlite3 "$BOOKMARKS_DB" "SELECT 1 FROM bookmarks WHERE user_id='$USER' AND entity_type='$entity_type' AND entity_id='$entity_id';")
    if [[ -n "$exists" ]]; then
        echo -e "${GREEN}[BOOKMARKS]${RESET} Yes - bookmarked"
        return 0
    else
        echo -e "${AMBER}[BOOKMARKS]${RESET} No - not bookmarked"
        return 1
    fi
}

# Create folder
folder() {
    local name="$1"
    local parent="${2:-}"
    local icon="${3:-📁}"

    local folder_id="fld-$(openssl rand -hex 6)"

    local parent_sql="NULL"
    [[ -n "$parent" ]] && parent_sql="'$parent'"

    sqlite3 "$BOOKMARKS_DB" "INSERT OR IGNORE INTO folders (id, user_id, name, parent_id, icon) VALUES ('$folder_id', '$USER', '$name', $parent_sql, '$icon');"
    echo -e "${GREEN}[BOOKMARKS]${RESET} Folder created: $name"
}

# List folders
folders() {
    echo -e "${AMBER}[BOOKMARKS]${RESET} Folders"
    echo ""
    sqlite3 -column -header "$BOOKMARKS_DB" "SELECT name, icon, (SELECT COUNT(*) FROM bookmarks WHERE folder=f.name AND user_id='$USER') as count FROM folders f WHERE user_id='$USER' ORDER BY position, name;"
}

# Move bookmark
move() {
    local bookmark_id="$1"
    local new_folder="$2"

    sqlite3 "$BOOKMARKS_DB" "UPDATE bookmarks SET folder='$new_folder' WHERE id='$bookmark_id' AND user_id='$USER';"
    echo -e "${GREEN}[BOOKMARKS]${RESET} Moved to: $new_folder"
}

# Add to recent
recent_add() {
    local entity_type="$1"
    local entity_id="$2"
    local title="${3:-}"

    sqlite3 "$BOOKMARKS_DB" "INSERT INTO recent (user_id, entity_type, entity_id, title) VALUES ('$USER', '$entity_type', '$entity_id', '$title');"
    # Keep only last 100
    sqlite3 "$BOOKMARKS_DB" "DELETE FROM recent WHERE user_id='$USER' AND id NOT IN (SELECT id FROM recent WHERE user_id='$USER' ORDER BY accessed_at DESC LIMIT 100);"
}

# List recent
recent() {
    local limit="${1:-20}"
    echo -e "${AMBER}[BOOKMARKS]${RESET} Recent"
    echo ""
    sqlite3 -column -header "$BOOKMARKS_DB" "SELECT DISTINCT entity_type, entity_id, title, accessed_at FROM recent WHERE user_id='$USER' ORDER BY accessed_at DESC LIMIT $limit;"
}

# Search bookmarks
search() {
    local query="$1"
    echo -e "${AMBER}[BOOKMARKS]${RESET} Search: $query"
    echo ""
    sqlite3 -column -header "$BOOKMARKS_DB" "SELECT entity_type, entity_id, title, folder FROM bookmarks WHERE user_id='$USER' AND (title LIKE '%$query%' OR notes LIKE '%$query%') ORDER BY created_at DESC LIMIT 20;"
}

# Export bookmarks
export_bm() {
    echo -e "${AMBER}[BOOKMARKS]${RESET} Exporting..."
    sqlite3 -json "$BOOKMARKS_DB" "SELECT * FROM bookmarks WHERE user_id='$USER';"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}      ${AMBER}[BOOKMARKS] System Stats${RESET}      ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$BOOKMARKS_DB" "SELECT COUNT(*) FROM bookmarks WHERE user_id='$USER';")
    local folders=$(sqlite3 "$BOOKMARKS_DB" "SELECT COUNT(*) FROM folders WHERE user_id='$USER';")
    local recent=$(sqlite3 "$BOOKMARKS_DB" "SELECT COUNT(*) FROM recent WHERE user_id='$USER';")

    echo -e "  ${GREEN}Total Bookmarks:${RESET} $total"
    echo -e "  ${GREEN}Folders:${RESET}         $folders"
    echo -e "  ${GREEN}Recent Items:${RESET}    $recent"
    echo ""
    echo -e "${BLUE}By Type:${RESET}"
    sqlite3 -column "$BOOKMARKS_DB" "SELECT entity_type, COUNT(*) as count FROM bookmarks WHERE user_id='$USER' GROUP BY entity_type ORDER BY count DESC;"
}

show_help() {
    echo -e "${PINK}[BOOKMARKS]${RESET} - BlackRoad Favorites System"
    echo ""
    echo "Usage: ~/bookmarks-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                  Initialize system"
    echo "  add <type> <id> [title] [folder]      Add bookmark"
    echo "  remove <type> <id>                    Remove bookmark"
    echo "  list [folder]                         List bookmarks"
    echo "  is-bookmarked <type> <id>             Check if bookmarked"
    echo "  folder <name> [parent] [icon]         Create folder"
    echo "  folders                               List folders"
    echo "  move <bookmark_id> <folder>           Move bookmark"
    echo "  recent [limit]                        Show recent"
    echo "  search <query>                        Search bookmarks"
    echo "  export                                Export as JSON"
    echo "  stats                                 Show statistics"
}

case "${1:-help}" in
    init)         init_bookmarks ;;
    add)          add "$2" "$3" "$4" "$5" "$6" ;;
    remove)       remove "$2" "$3" ;;
    list)         list "$2" ;;
    is-bookmarked) is_bookmarked "$2" "$3" ;;
    folder)       folder "$2" "$3" "$4" ;;
    folders)      folders ;;
    move)         move "$2" "$3" ;;
    recent-add)   recent_add "$2" "$3" "$4" ;;
    recent)       recent "$2" ;;
    search)       search "$2" ;;
    export)       export_bm ;;
    stats)        stats ;;
    help|*)       show_help ;;
esac
