#!/bin/bash
# [ASSETS] System - File/media asset management for BlackRoad
# Usage: ~/assets-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

ASSETS_DB="$HOME/.blackroad/assets.db"
ASSETS_DIR="$HOME/.blackroad/assets"

init_assets() {
    mkdir -p "$HOME/.blackroad" "$ASSETS_DIR"
    sqlite3 "$ASSETS_DB" <<EOF
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER,
    path TEXT,
    url TEXT,
    checksum TEXT,
    metadata TEXT DEFAULT '{}',
    folder TEXT DEFAULT '/',
    tags TEXT,
    uploaded_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folders (
    path TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    path TEXT,
    size_bytes INTEGER,
    checksum TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO folders (path, name) VALUES ('/', 'root');
EOF
    echo -e "${GREEN}[ASSETS]${RESET} System initialized"
}

# Upload asset
upload() {
    local file="$1"
    local folder="${2:-/}"
    local tags="${3:-}"

    if [[ ! -f "$file" ]]; then
        echo -e "${RED}[ASSETS]${RESET} File not found: $file"
        return 1
    fi

    local asset_id="asset-$(openssl rand -hex 8)"
    local name=$(basename "$file")
    local ext="${name##*.}"
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    local checksum=$(shasum -a 256 "$file" | cut -d' ' -f1 | head -c 16)
    local mime=$(file -b --mime-type "$file" 2>/dev/null || echo "application/octet-stream")

    # Determine type
    local type="file"
    case "$mime" in
        image/*) type="image" ;;
        video/*) type="video" ;;
        audio/*) type="audio" ;;
        application/pdf) type="document" ;;
        text/*) type="text" ;;
    esac

    # Copy to assets directory
    local dest="$ASSETS_DIR/$asset_id-$name"
    cp "$file" "$dest"

    sqlite3 "$ASSETS_DB" "INSERT INTO assets (id, name, type, mime_type, size_bytes, path, checksum, folder, tags, uploaded_by) VALUES ('$asset_id', '$name', '$type', '$mime', $size, '$dest', '$checksum', '$folder', '$tags', '$USER');"

    echo -e "${GREEN}[ASSETS]${RESET} Uploaded: $name ($asset_id)"
    echo "$asset_id"
}

# List assets
list() {
    local folder="${1:-/}"
    echo -e "${AMBER}[ASSETS]${RESET} Assets in $folder"
    echo ""
    sqlite3 -column -header "$ASSETS_DB" "SELECT id, name, type, size_bytes, created_at FROM assets WHERE folder='$folder' ORDER BY name;"
}

# Get asset
get() {
    local asset_id="$1"
    sqlite3 -column -header "$ASSETS_DB" "SELECT * FROM assets WHERE id='$asset_id';"
}

# Delete asset
delete() {
    local asset_id="$1"
    local path=$(sqlite3 "$ASSETS_DB" "SELECT path FROM assets WHERE id='$asset_id';")
    [[ -f "$path" ]] && rm -f "$path"
    sqlite3 "$ASSETS_DB" "DELETE FROM assets WHERE id='$asset_id';"
    echo -e "${GREEN}[ASSETS]${RESET} Deleted: $asset_id"
}

# Create folder
folder() {
    local path="$1"
    local name=$(basename "$path")
    local parent=$(dirname "$path")
    [[ "$parent" == "." ]] && parent="/"

    sqlite3 "$ASSETS_DB" "INSERT OR IGNORE INTO folders (path, name, parent) VALUES ('$path', '$name', '$parent');"
    echo -e "${GREEN}[ASSETS]${RESET} Folder created: $path"
}

# List folders
folders() {
    echo -e "${AMBER}[ASSETS]${RESET} Folders"
    echo ""
    sqlite3 -column -header "$ASSETS_DB" "SELECT path, name, parent FROM folders ORDER BY path;"
}

# Move asset
move() {
    local asset_id="$1"
    local new_folder="$2"

    sqlite3 "$ASSETS_DB" "UPDATE assets SET folder='$new_folder', updated_at=datetime('now') WHERE id='$asset_id';"
    echo -e "${GREEN}[ASSETS]${RESET} Moved: $asset_id -> $new_folder"
}

# Search assets
search() {
    local query="$1"
    echo -e "${AMBER}[ASSETS]${RESET} Search: $query"
    echo ""
    sqlite3 -column -header "$ASSETS_DB" "SELECT id, name, type, folder FROM assets WHERE name LIKE '%$query%' OR tags LIKE '%$query%' ORDER BY name LIMIT 30;"
}

# Tag asset
tag() {
    local asset_id="$1"
    local tags="$2"

    sqlite3 "$ASSETS_DB" "UPDATE assets SET tags='$tags', updated_at=datetime('now') WHERE id='$asset_id';"
    echo -e "${GREEN}[ASSETS]${RESET} Tagged: $asset_id"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}        ${AMBER}[ASSETS] System Stats${RESET}       ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$ASSETS_DB" "SELECT COUNT(*) FROM assets;")
    local folders=$(sqlite3 "$ASSETS_DB" "SELECT COUNT(*) FROM folders;")
    local total_size=$(sqlite3 "$ASSETS_DB" "SELECT COALESCE(SUM(size_bytes), 0) FROM assets;")

    echo -e "  ${GREEN}Total Assets:${RESET} $total"
    echo -e "  ${GREEN}Folders:${RESET}      $folders"
    echo -e "  ${GREEN}Total Size:${RESET}   $(numfmt --to=iec $total_size 2>/dev/null || echo "${total_size}B")"
    echo ""
    echo -e "${BLUE}By Type:${RESET}"
    sqlite3 -column "$ASSETS_DB" "SELECT type, COUNT(*) as count FROM assets GROUP BY type ORDER BY count DESC;"
}

show_help() {
    echo -e "${PINK}[ASSETS]${RESET} - BlackRoad Asset System"
    echo ""
    echo "Usage: ~/assets-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                          Initialize system"
    echo "  upload <file> [folder] [tags] Upload asset"
    echo "  list [folder]                 List assets"
    echo "  get <id>                      Get asset details"
    echo "  delete <id>                   Delete asset"
    echo "  folder <path>                 Create folder"
    echo "  folders                       List folders"
    echo "  move <id> <folder>            Move asset"
    echo "  search <query>                Search assets"
    echo "  tag <id> <tags>               Tag asset"
    echo "  stats                         Show statistics"
}

case "${1:-help}" in
    init)    init_assets ;;
    upload)  upload "$2" "$3" "$4" ;;
    list)    list "$2" ;;
    get)     get "$2" ;;
    delete)  delete "$2" ;;
    folder)  folder "$2" ;;
    folders) folders ;;
    move)    move "$2" "$3" ;;
    search)  search "$2" ;;
    tag)     tag "$2" "$3" ;;
    stats)   stats ;;
    help|*)  show_help ;;
esac
