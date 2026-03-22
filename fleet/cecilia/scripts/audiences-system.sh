#!/bin/bash
# [AUDIENCES] System - Audience segmentation for BlackRoad
set -e
PINK='\033[38;5;205m'; AMBER='\033[38;5;214m'; GREEN='\033[38;5;82m'; RESET='\033[0m'
AUDIENCES_DB="$HOME/.blackroad/audiences.db"

init_audiences() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$AUDIENCES_DB" <<EOSQL
CREATE TABLE IF NOT EXISTS audiences (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, type TEXT DEFAULT 'dynamic', rules TEXT, member_count INTEGER DEFAULT 0, status TEXT DEFAULT 'active', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audience_members (audience_id TEXT NOT NULL, user_id TEXT NOT NULL, added_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(audience_id, user_id));
EOSQL
    echo -e "${GREEN}[AUDIENCES]${RESET} System initialized"
}

create() { local id="aud-$(openssl rand -hex 6)"; sqlite3 "$AUDIENCES_DB" "INSERT INTO audiences (id, name, description, type) VALUES ('$id', '$1', '$2', '${3:-dynamic}');"; echo -e "${GREEN}[AUDIENCES]${RESET} Created: $1"; }
add_member() { sqlite3 "$AUDIENCES_DB" "INSERT OR IGNORE INTO audience_members (audience_id, user_id) VALUES ('$1', '$2');"; sqlite3 "$AUDIENCES_DB" "UPDATE audiences SET member_count=(SELECT COUNT(*) FROM audience_members WHERE audience_id='$1') WHERE id='$1';"; echo -e "${GREEN}[AUDIENCES]${RESET} Member added"; }
remove_member() { sqlite3 "$AUDIENCES_DB" "DELETE FROM audience_members WHERE audience_id='$1' AND user_id='$2';"; sqlite3 "$AUDIENCES_DB" "UPDATE audiences SET member_count=(SELECT COUNT(*) FROM audience_members WHERE audience_id='$1') WHERE id='$1';"; echo -e "${GREEN}[AUDIENCES]${RESET} Member removed"; }
list() { echo -e "${AMBER}[AUDIENCES]${RESET} Audiences"; sqlite3 -column -header "$AUDIENCES_DB" "SELECT id, name, type, member_count, status FROM audiences ORDER BY name;"; }
members() { echo -e "${AMBER}[AUDIENCES]${RESET} Members"; sqlite3 -column -header "$AUDIENCES_DB" "SELECT user_id, added_at FROM audience_members WHERE audience_id='$1';"; }
stats() { echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"; echo -e "${PINK}║${RESET}      ${AMBER}[AUDIENCES] System Stats${RESET}      ${PINK}║${RESET}"; echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"; local t=$(sqlite3 "$AUDIENCES_DB" "SELECT COUNT(*) FROM audiences;"); local m=$(sqlite3 "$AUDIENCES_DB" "SELECT COUNT(*) FROM audience_members;"); echo -e "  ${GREEN}Audiences:${RESET} $t"; echo -e "  ${GREEN}Members:${RESET}   $m"; }
show_help() { echo -e "${PINK}[AUDIENCES]${RESET} - Audience System"; echo "Commands: init, create, add-member, remove-member, list, members, stats"; }
case "${1:-help}" in init) init_audiences ;; create) create "$2" "$3" "$4" ;; add-member) add_member "$2" "$3" ;; remove-member) remove_member "$2" "$3" ;; list) list ;; members) members "$2" ;; stats) stats ;; *) show_help ;; esac
