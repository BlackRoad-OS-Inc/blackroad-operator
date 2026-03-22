#!/bin/bash
# [API] System - API endpoint registry for BlackRoad
# Usage: ~/api-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

API_DB="$HOME/.blackroad/api.db"

init_api() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$API_DB" <<EOF
CREATE TABLE IF NOT EXISTS endpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    method TEXT DEFAULT 'GET',
    path TEXT NOT NULL,
    base_url TEXT,
    description TEXT,
    auth_type TEXT,
    rate_limit INTEGER,
    version TEXT DEFAULT 'v1',
    deprecated INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    key_hash TEXT NOT NULL,
    service TEXT,
    scopes TEXT,
    expires_at TEXT,
    last_used TEXT,
    usage_count INTEGER DEFAULT 0,
    enabled INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id INTEGER,
    method TEXT,
    path TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size INTEGER,
    response_size INTEGER,
    api_key_id INTEGER,
    called_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_services (
    name TEXT PRIMARY KEY,
    base_url TEXT NOT NULL,
    description TEXT,
    auth_header TEXT,
    status TEXT DEFAULT 'active',
    last_check TEXT
);
EOF
    echo -e "${GREEN}[API]${RESET} System initialized"
}

# Register endpoint
register() {
    local name="$1"
    local method="$2"
    local path="$3"
    local base_url="${4:-}"
    local desc="${5:-}"

    sqlite3 "$API_DB" "INSERT OR REPLACE INTO endpoints (name, method, path, base_url, description) VALUES ('$name', '$method', '$path', '$base_url', '$desc');"
    echo -e "${GREEN}[API]${RESET} Registered: $method $path ($name)"
}

# List endpoints
list() {
    local filter="${1:-}"
    echo -e "${AMBER}[API]${RESET} API Endpoints"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$API_DB" "SELECT name, method, path, version, deprecated FROM endpoints WHERE name LIKE '%$filter%' OR path LIKE '%$filter%' ORDER BY name;"
    else
        sqlite3 -column -header "$API_DB" "SELECT name, method, path, version, deprecated FROM endpoints ORDER BY name LIMIT 30;"
    fi
}

# Add API key
add_key() {
    local name="$1"
    local key="$2"
    local service="${3:-}"
    local scopes="${4:-*}"

    # Hash the key for storage
    local key_hash=$(echo -n "$key" | shasum -a 256 | cut -d' ' -f1)

    sqlite3 "$API_DB" "INSERT OR REPLACE INTO api_keys (name, key_hash, service, scopes) VALUES ('$name', '$key_hash', '$service', '$scopes');"
    echo -e "${GREEN}[API]${RESET} Key added: $name"
}

# List keys
keys() {
    echo -e "${AMBER}[API]${RESET} API Keys"
    echo ""
    sqlite3 -column -header "$API_DB" "SELECT name, service, scopes, enabled, usage_count, last_used FROM api_keys ORDER BY name;"
}

# Record API call
call() {
    local method="$1"
    local path="$2"
    local status="${3:-200}"
    local time_ms="${4:-0}"

    local endpoint_id=$(sqlite3 "$API_DB" "SELECT id FROM endpoints WHERE method='$method' AND path='$path' LIMIT 1;")

    sqlite3 "$API_DB" "INSERT INTO api_calls (endpoint_id, method, path, status_code, response_time_ms) VALUES (${endpoint_id:-NULL}, '$method', '$path', $status, $time_ms);"
    echo -e "${GREEN}[API]${RESET} Logged: $method $path ($status, ${time_ms}ms)"
}

# Test endpoint
test_endpoint() {
    local name="$1"
    local row=$(sqlite3 "$API_DB" "SELECT method, path, base_url FROM endpoints WHERE name='$name';")

    if [[ -z "$row" ]]; then
        echo -e "${RED}[API]${RESET} Endpoint not found: $name"
        return 1
    fi

    IFS='|' read -r method path base_url <<< "$row"
    local url="${base_url}${path}"

    echo -e "${BLUE}[API]${RESET} Testing: $method $url"

    local start=$(date +%s%3N 2>/dev/null || echo $(($(date +%s) * 1000)))
    local status=$(curl -s -o /dev/null -w '%{http_code}' -X "$method" "$url" --max-time 10 2>/dev/null || echo "000")
    local end=$(date +%s%3N 2>/dev/null || echo $(($(date +%s) * 1000)))
    local duration=$((end - start))

    # Log the call
    call "$method" "$path" "$status" "$duration"

    if [[ "$status" -ge 200 && "$status" -lt 300 ]]; then
        echo -e "${GREEN}[API]${RESET} Success: HTTP $status (${duration}ms)"
    elif [[ "$status" == "000" ]]; then
        echo -e "${RED}[API]${RESET} Failed: Connection error"
    else
        echo -e "${RED}[API]${RESET} Failed: HTTP $status (${duration}ms)"
    fi
}

# Add service
service() {
    local name="$1"
    local base_url="$2"
    local desc="${3:-}"

    sqlite3 "$API_DB" "INSERT OR REPLACE INTO api_services (name, base_url, description) VALUES ('$name', '$base_url', '$desc');"
    echo -e "${GREEN}[API]${RESET} Service added: $name -> $base_url"
}

# List services
services() {
    echo -e "${AMBER}[API]${RESET} API Services"
    echo ""
    sqlite3 -column -header "$API_DB" "SELECT name, base_url, status, last_check FROM api_services ORDER BY name;"
}

# Check service health
check() {
    local name="$1"
    local base_url=$(sqlite3 "$API_DB" "SELECT base_url FROM api_services WHERE name='$name';")

    if [[ -z "$base_url" ]]; then
        echo -e "${RED}[API]${RESET} Service not found: $name"
        return 1
    fi

    echo -e "${BLUE}[API]${RESET} Checking: $name"
    local status=$(curl -s -o /dev/null -w '%{http_code}' "$base_url" --max-time 10 2>/dev/null || echo "000")

    if [[ "$status" -ge 200 && "$status" -lt 400 ]]; then
        sqlite3 "$API_DB" "UPDATE api_services SET status='active', last_check=datetime('now') WHERE name='$name';"
        echo -e "${GREEN}[API]${RESET} $name: active (HTTP $status)"
    else
        sqlite3 "$API_DB" "UPDATE api_services SET status='down', last_check=datetime('now') WHERE name='$name';"
        echo -e "${RED}[API]${RESET} $name: down (HTTP $status)"
    fi
}

# Show call history
history() {
    local filter="${1:-}"
    echo -e "${AMBER}[API]${RESET} API Call History"
    echo ""
    if [[ -n "$filter" ]]; then
        sqlite3 -column -header "$API_DB" "SELECT id, method, path, status_code, response_time_ms, called_at FROM api_calls WHERE path LIKE '%$filter%' ORDER BY called_at DESC LIMIT 30;"
    else
        sqlite3 -column -header "$API_DB" "SELECT id, method, path, status_code, response_time_ms, called_at FROM api_calls ORDER BY called_at DESC LIMIT 30;"
    fi
}

# Deprecate endpoint
deprecate() {
    local name="$1"
    sqlite3 "$API_DB" "UPDATE endpoints SET deprecated=1 WHERE name='$name';"
    echo -e "${YELLOW}[API]${RESET} Deprecated: $name"
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}         ${AMBER}[API] System Stats${RESET}         ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local endpoints=$(sqlite3 "$API_DB" "SELECT COUNT(*) FROM endpoints;")
    local deprecated=$(sqlite3 "$API_DB" "SELECT COUNT(*) FROM endpoints WHERE deprecated=1;")
    local keys=$(sqlite3 "$API_DB" "SELECT COUNT(*) FROM api_keys WHERE enabled=1;")
    local calls=$(sqlite3 "$API_DB" "SELECT COUNT(*) FROM api_calls;")
    local services=$(sqlite3 "$API_DB" "SELECT COUNT(*) FROM api_services;")
    local avg_time=$(sqlite3 "$API_DB" "SELECT ROUND(AVG(response_time_ms)) FROM api_calls;" 2>/dev/null || echo "0")

    echo -e "  ${GREEN}Endpoints:${RESET}      $endpoints"
    echo -e "  ${YELLOW}Deprecated:${RESET}     $deprecated"
    echo -e "  ${GREEN}API Keys:${RESET}       $keys"
    echo -e "  ${GREEN}Total Calls:${RESET}    $calls"
    echo -e "  ${GREEN}Services:${RESET}       $services"
    echo -e "  ${BLUE}Avg Response:${RESET}   ${avg_time:-0}ms"
    echo ""
    echo -e "${BLUE}By Status Code:${RESET}"
    sqlite3 -column "$API_DB" "SELECT status_code, COUNT(*) as count FROM api_calls GROUP BY status_code ORDER BY count DESC LIMIT 5;"
    echo ""
    echo -e "${BLUE}Top Endpoints:${RESET}"
    sqlite3 -column "$API_DB" "SELECT path, COUNT(*) as count FROM api_calls GROUP BY path ORDER BY count DESC LIMIT 5;"
}

show_help() {
    echo -e "${PINK}[API]${RESET} - BlackRoad API Registry"
    echo ""
    echo "Usage: ~/api-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                   Initialize system"
    echo "  register <name> <method> <path> [url]  Register endpoint"
    echo "  list [filter]                          List endpoints"
    echo "  add-key <name> <key> [service]         Add API key"
    echo "  keys                                   List API keys"
    echo "  call <method> <path> [status] [ms]     Log API call"
    echo "  test <name>                            Test endpoint"
    echo "  service <name> <url> [desc]            Add service"
    echo "  services                               List services"
    echo "  check <name>                           Check service health"
    echo "  history [filter]                       Show call history"
    echo "  deprecate <name>                       Mark deprecated"
    echo "  stats                                  Show statistics"
}

case "${1:-help}" in
    init)      init_api ;;
    register)  register "$2" "$3" "$4" "$5" "$6" ;;
    list)      list "$2" ;;
    add-key)   add_key "$2" "$3" "$4" "$5" ;;
    keys)      keys ;;
    call)      call "$2" "$3" "$4" "$5" ;;
    test)      test_endpoint "$2" ;;
    service)   service "$2" "$3" "$4" ;;
    services)  services ;;
    check)     check "$2" ;;
    history)   history "$2" ;;
    deprecate) deprecate "$2" ;;
    stats)     stats ;;
    help|*)    show_help ;;
esac
