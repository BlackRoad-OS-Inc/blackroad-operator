#!/bin/zsh
# BR Backgrounds — Google Drive Photo Backgrounds Manager
#
# Usage:
#   br backgrounds list                    - list available backgrounds from Google Drive
#   br backgrounds set <file-id>           - set active background
#   br backgrounds random                  - pick a random background
#   br backgrounds config                  - show current background config
#   br backgrounds set-folder <folder-id>  - set Google Drive folder ID
#   br backgrounds set-key <api-key>       - set Google API key
#   br backgrounds status                  - check worker status
#   br backgrounds clear                   - remove active background
#   br backgrounds preview <file-id>       - open background image in browser

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

DB_FILE="$HOME/.blackroad/backgrounds.db"
WORKER_URL="${BLACKROAD_BACKGROUNDS_URL:-https://blackroad-backgrounds.blackroad.workers.dev}"

init_db() {
  sqlite3 "$DB_FILE" "
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    INSERT OR IGNORE INTO config (key, value) VALUES ('worker_url', '$WORKER_URL');
    INSERT OR IGNORE INTO config (key, value) VALUES ('mode', 'none');
    INSERT OR IGNORE INTO config (key, value) VALUES ('opacity', '0.15');
    INSERT OR IGNORE INTO config (key, value) VALUES ('blur', '0');
    INSERT OR IGNORE INTO config (key, value) VALUES ('fit', 'cover');
  "
}

get_config() {
  sqlite3 "$DB_FILE" "SELECT value FROM config WHERE key='$1';" 2>/dev/null
}

set_config() {
  sqlite3 "$DB_FILE" "INSERT OR REPLACE INTO config (key, value) VALUES ('$1', '$2');"
}

show_help() {
  echo ""
  echo -e "${PURPLE}${BOLD}  ▙▟ BR Backgrounds${NC} — Google Drive Photo Backgrounds"
  echo ""
  echo -e "  ${CYAN}USAGE${NC}"
  echo "    br backgrounds <command> [args]"
  echo ""
  echo -e "  ${CYAN}COMMANDS${NC}"
  echo -e "    ${GREEN}list${NC}                     List available backgrounds from Google Drive"
  echo -e "    ${GREEN}set${NC} <file-id>            Set active background by Drive file ID"
  echo -e "    ${GREEN}random${NC}                   Pick a random background"
  echo -e "    ${GREEN}config${NC}                   Show current background config"
  echo -e "    ${GREEN}set-folder${NC} <folder-id>   Configure Google Drive folder ID"
  echo -e "    ${GREEN}set-key${NC} <api-key>        Configure Google API key"
  echo -e "    ${GREEN}set-opacity${NC} <0.0-1.0>    Set background opacity"
  echo -e "    ${GREEN}set-blur${NC} <0-20>          Set background blur (px)"
  echo -e "    ${GREEN}set-fit${NC} <cover|contain|tile>  Set background fit mode"
  echo -e "    ${GREEN}status${NC}                   Check worker health"
  echo -e "    ${GREEN}clear${NC}                    Remove active background"
  echo -e "    ${GREEN}preview${NC} <file-id>        Open background in browser"
  echo ""
  echo -e "  ${CYAN}SETUP${NC}"
  echo "    1. Create a Google Drive folder with your sprite/photo backgrounds"
  echo "    2. Share the folder as 'Anyone with the link can view'"
  echo "    3. Get a Google Cloud API key with Drive API enabled"
  echo "    4. Run: br backgrounds set-folder <folder-id>"
  echo "    5. Run: br backgrounds set-key <api-key>"
  echo "    6. Deploy: cd workers/backgrounds && wrangler secret put GOOGLE_API_KEY"
  echo ""
  echo -e "  ${CYAN}ENV${NC}"
  echo "    BLACKROAD_BACKGROUNDS_URL  Worker endpoint (default: https://blackroad-backgrounds.blackroad.workers.dev)"
  echo "    GOOGLE_DRIVE_FOLDER_ID     Drive folder ID"
  echo "    GOOGLE_API_KEY             Google API key"
  echo ""
}

cmd_list() {
  local url
  url="$(get_config 'worker_url')"
  echo -e "${CYAN}Fetching backgrounds from Google Drive...${NC}"

  local response
  response=$(curl -sS "$url/backgrounds" 2>&1)
  local exit_code=$?

  if [ $exit_code -ne 0 ]; then
    echo -e "${RED}✗ Failed to reach worker at $url${NC}"
    echo "  Error: $response"
    echo -e "  ${YELLOW}Is the worker deployed? Run: br backgrounds status${NC}"
    return 1
  fi

  local count
  count=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count',0))" 2>/dev/null)

  if [ "$count" = "0" ] || [ -z "$count" ]; then
    echo -e "${YELLOW}No backgrounds found in folder.${NC}"
    echo "  Check your Google Drive folder ID with: br backgrounds config"
    return 0
  fi

  echo -e "${GREEN}Found $count backgrounds:${NC}\n"
  echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
active_id = data.get('active', {}).get('fileId')
for bg in data.get('backgrounds', []):
    marker = ' ← active' if bg['id'] == active_id else ''
    dims = f\"{bg.get('width', '?')}x{bg.get('height', '?')}\"
    size_kb = bg.get('size', 0) // 1024
    print(f\"  {bg['id'][:12]}…  {bg['name']:<30s}  {dims:<12s}  {size_kb:>5d}KB{marker}\")
" 2>/dev/null
}

cmd_set() {
  local file_id="$1"
  if [ -z "$file_id" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set <file-id>${NC}"
    return 1
  fi

  local url
  url="$(get_config 'worker_url')"
  local opacity blur fit
  opacity="$(get_config 'opacity')"
  blur="$(get_config 'blur')"
  fit="$(get_config 'fit')"

  # Build JSON payload safely using Python's json encoder
  local payload
  payload=$(python3 - "$file_id" "$opacity" "$blur" "$fit" << 'PY'
import json
import sys

file_id, opacity_str, blur_str, fit = sys.argv[1:5]

def parse_float(value, default):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

payload = {
    "mode": "image",
    "fileId": file_id,
    "opacity": parse_float(opacity_str, 0.15),
    "blur": parse_float(blur_str, 0.0),
    "fit": fit,
}

print(json.dumps(payload))
PY
)

  local response
  response=$(curl -sS -X POST "$url/backgrounds/config" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>&1)

  set_config "mode" "image"
  set_config "active_file_id" "$file_id"

  echo -e "${GREEN}✓ Background set to ${CYAN}$file_id${NC}"
  echo -e "  Opacity: $opacity | Blur: ${blur}px | Fit: $fit"
}

cmd_random() {
  local url
  url="$(get_config 'worker_url')"

  echo -e "${CYAN}Picking a random background...${NC}"
  local response
  response=$(curl -sS "$url/backgrounds" 2>&1)

  local file_id
  file_id=$(echo "$response" | python3 -c "
import sys, json, random
data = json.load(sys.stdin)
bgs = data.get('backgrounds', [])
if bgs:
    pick = random.choice(bgs)
    print(pick['id'])
" 2>/dev/null)

  if [ -z "$file_id" ]; then
    echo -e "${RED}✗ No backgrounds available${NC}"
    return 1
  fi

  cmd_set "$file_id"
}

cmd_config() {
  echo -e "${PURPLE}${BOLD}Background Configuration${NC}\n"
  echo -e "  ${CYAN}Worker URL:${NC}     $(get_config 'worker_url')"
  echo -e "  ${CYAN}Mode:${NC}           $(get_config 'mode')"
  echo -e "  ${CYAN}Active File:${NC}    $(get_config 'active_file_id')"
  echo -e "  ${CYAN}Opacity:${NC}        $(get_config 'opacity')"
  echo -e "  ${CYAN}Blur:${NC}           $(get_config 'blur')px"
  echo -e "  ${CYAN}Fit:${NC}            $(get_config 'fit')"
  echo ""
  echo -e "  ${CYAN}Folder ID:${NC}      $(get_config 'folder_id')"
  echo -e "  ${CYAN}API Key:${NC}        $(get_config 'api_key' | sed 's/./*/g')"
}

cmd_set_folder() {
  local folder_id="$1"
  if [ -z "$folder_id" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set-folder <folder-id>${NC}"
    echo "  Extract from URL: https://drive.google.com/drive/folders/<folder-id>"
    return 1
  fi
  set_config "folder_id" "$folder_id"
  echo -e "${GREEN}✓ Google Drive folder ID set${NC}"
  echo -e "  Folder: ${CYAN}$folder_id${NC}"
  echo -e "  ${YELLOW}Remember to also set this in wrangler.toml or via wrangler secret${NC}"
}

cmd_set_key() {
  local api_key="$1"
  if [ -z "$api_key" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set-key <api-key>${NC}"
    return 1
  fi
  set_config "api_key" "$api_key"
  echo -e "${GREEN}✓ Google API key set${NC}"
  echo -e "  ${YELLOW}Deploy secret: cd workers/backgrounds && wrangler secret put GOOGLE_API_KEY${NC}"
}

cmd_status() {
  local url
  url="$(get_config 'worker_url')"
  echo -e "${CYAN}Checking worker at $url ...${NC}"

  local response
  response=$(curl -sS --max-time 5 "$url/backgrounds/status" 2>&1)
  local exit_code=$?

  if [ $exit_code -ne 0 ]; then
    echo -e "${RED}✗ Worker unreachable${NC}"
    echo "  $response"
    return 1
  fi

  echo "$response" | python3 -c "
import sys, json
d = json.load(sys.stdin)
status = d.get('status', 'unknown')
color = '\033[0;32m' if status == 'ready' else '\033[1;33m'
print(f\"  Status:     {color}{status}\033[0m\")
print(f\"  Folder ID:  {'configured' if d.get('hasFolderId') else 'missing'}\")
print(f\"  API Key:    {'configured' if d.get('hasApiKey') else 'missing'}\")
print(f\"  Timestamp:  {d.get('timestamp', 'n/a')}\")
" 2>/dev/null || echo -e "${YELLOW}$response${NC}"
}

cmd_clear() {
  local url
  url="$(get_config 'worker_url')"

  curl -sS -X POST "$url/backgrounds/config" \
    -H "Content-Type: application/json" \
    -d '{"mode":"none","fileId":null}' >/dev/null 2>&1

  set_config "mode" "none"
  set_config "active_file_id" ""
  echo -e "${GREEN}✓ Background cleared${NC}"
}

cmd_preview() {
  local file_id="$1"
  if [ -z "$file_id" ]; then
    echo -e "${RED}✗ Usage: br backgrounds preview <file-id>${NC}"
    return 1
  fi

  local url
  url="$(get_config 'worker_url')"
  local image_url="$url/backgrounds/$file_id"
  echo -e "${CYAN}Opening: $image_url${NC}"

  if command -v open >/dev/null 2>&1; then
    open "$image_url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$image_url"
  else
    echo -e "  ${YELLOW}Open in browser: $image_url${NC}"
  fi
}

cmd_set_opacity() {
  local val="$1"
  if [ -z "$val" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set-opacity <0.0-1.0>${NC}"
    return 1
  fi
  set_config "opacity" "$val"
  echo -e "${GREEN}✓ Opacity set to $val${NC}"
}

cmd_set_blur() {
  local val="$1"
  if [ -z "$val" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set-blur <0-20>${NC}"
    return 1
  fi
  set_config "blur" "$val"
  echo -e "${GREEN}✓ Blur set to ${val}px${NC}"
}

cmd_set_fit() {
  local val="$1"
  if [ -z "$val" ]; then
    echo -e "${RED}✗ Usage: br backgrounds set-fit <cover|contain|tile>${NC}"
    return 1
  fi
  set_config "fit" "$val"
  echo -e "${GREEN}✓ Fit mode set to $val${NC}"
}

# ─── INIT & ROUTE ────────────────────────────────────────────────────────────
init_db

case "${1:-help}" in
  list)         cmd_list ;;
  set)          cmd_set "$2" ;;
  random)       cmd_random ;;
  config)       cmd_config ;;
  set-folder)   cmd_set_folder "$2" ;;
  set-key)      cmd_set_key "$2" ;;
  set-opacity)  cmd_set_opacity "$2" ;;
  set-blur)     cmd_set_blur "$2" ;;
  set-fit)      cmd_set_fit "$2" ;;
  status)       cmd_status ;;
  clear)        cmd_clear ;;
  preview)      cmd_preview "$2" ;;
  help|--help|-h|*) show_help ;;
esac
