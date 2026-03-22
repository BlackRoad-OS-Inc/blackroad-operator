#!/bin/bash
# [ANALYTICS] System - Event tracking and funnel analysis for BlackRoad
# Usage: ~/analytics-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
YELLOW='\033[38;5;226m'
RESET='\033[0m'

ANALYTICS_DB="$HOME/.blackroad/analytics.db"

init_analytics() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$ANALYTICS_DB" <<EOF
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT,
    properties TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funnels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    steps TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    user_id TEXT,
    session_id TEXT,
    referrer TEXT,
    duration_ms INTEGER,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_properties (
    user_id TEXT NOT NULL,
    property TEXT NOT NULL,
    value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property)
);

CREATE TABLE IF NOT EXISTS cohorts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    definition TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON page_views(path);
EOF
    echo -e "${GREEN}[ANALYTICS]${RESET} System initialized"
}

# Track event
track() {
    local event_name="$1"
    local user_id="${2:-anonymous}"
    local properties="${3:-{}}"
    local session_id="${4:-}"

    sqlite3 "$ANALYTICS_DB" "INSERT INTO events (event_name, user_id, session_id, properties) VALUES ('$event_name', '$user_id', '$session_id', '$properties');"
    echo -e "${GREEN}[ANALYTICS]${RESET} Tracked: $event_name for $user_id"
}

# Track page view
pageview() {
    local path="$1"
    local user_id="${2:-anonymous}"
    local referrer="${3:-}"
    local duration="${4:-0}"
    local session_id="${5:-}"

    sqlite3 "$ANALYTICS_DB" "INSERT INTO page_views (path, user_id, session_id, referrer, duration_ms) VALUES ('$path', '$user_id', '$session_id', '$referrer', $duration);"
    echo -e "${GREEN}[ANALYTICS]${RESET} Pageview: $path"
}

# Set user property
identify() {
    local user_id="$1"
    local property="$2"
    local value="$3"

    sqlite3 "$ANALYTICS_DB" "INSERT OR REPLACE INTO user_properties (user_id, property, value) VALUES ('$user_id', '$property', '$value');"
    echo -e "${GREEN}[ANALYTICS]${RESET} Identified: $user_id.$property = $value"
}

# Event counts
events() {
    local days="${1:-7}"
    echo -e "${AMBER}[ANALYTICS]${RESET} Events (last $days days)"
    echo ""
    sqlite3 -column -header "$ANALYTICS_DB" "SELECT event_name, COUNT(*) as count, COUNT(DISTINCT user_id) as unique_users FROM events WHERE timestamp > datetime('now', '-$days days') GROUP BY event_name ORDER BY count DESC LIMIT 20;"
}

# Page views
pages() {
    local days="${1:-7}"
    echo -e "${AMBER}[ANALYTICS]${RESET} Page Views (last $days days)"
    echo ""
    sqlite3 -column -header "$ANALYTICS_DB" "SELECT path, COUNT(*) as views, COUNT(DISTINCT user_id) as visitors, AVG(duration_ms) as avg_duration FROM page_views WHERE timestamp > datetime('now', '-$days days') GROUP BY path ORDER BY views DESC LIMIT 20;"
}

# Create funnel
funnel() {
    local id="$1"
    local name="$2"
    local steps="$3"  # comma-separated event names

    sqlite3 "$ANALYTICS_DB" "INSERT OR REPLACE INTO funnels (id, name, steps) VALUES ('$id', '$name', '$steps');"
    echo -e "${GREEN}[ANALYTICS]${RESET} Funnel created: $name"
}

# Analyze funnel
analyze_funnel() {
    local funnel_id="$1"
    local days="${2:-30}"

    local funnel=$(sqlite3 "$ANALYTICS_DB" "SELECT name, steps FROM funnels WHERE id='$funnel_id';")
    IFS='|' read -r name steps <<< "$funnel"

    echo -e "${AMBER}[ANALYTICS]${RESET} Funnel Analysis: $name"
    echo ""

    IFS=',' read -ra step_array <<< "$steps"
    local prev_count=0
    local step_num=1

    for step in "${step_array[@]}"; do
        local count=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(DISTINCT user_id) FROM events WHERE event_name='$step' AND timestamp > datetime('now', '-$days days');")
        local conversion=""
        if [[ $prev_count -gt 0 ]]; then
            local rate=$(echo "scale=1; $count * 100 / $prev_count" | bc)
            conversion="($rate%)"
        fi
        echo -e "  ${GREEN}Step $step_num:${RESET} $step - $count users $conversion"
        prev_count=$count
        ((step_num++))
    done
}

# List funnels
funnels() {
    echo -e "${AMBER}[ANALYTICS]${RESET} Funnels"
    echo ""
    sqlite3 -column -header "$ANALYTICS_DB" "SELECT id, name, steps FROM funnels ORDER BY name;"
}

# User journey
journey() {
    local user_id="$1"
    local limit="${2:-50}"

    echo -e "${AMBER}[ANALYTICS]${RESET} User Journey: $user_id"
    echo ""
    sqlite3 -column -header "$ANALYTICS_DB" "SELECT event_name, properties, timestamp FROM events WHERE user_id='$user_id' ORDER BY timestamp DESC LIMIT $limit;"
}

# Create cohort
cohort() {
    local id="$1"
    local name="$2"
    local definition="$3"

    sqlite3 "$ANALYTICS_DB" "INSERT OR REPLACE INTO cohorts (id, name, definition) VALUES ('$id', '$name', '$definition');"
    echo -e "${GREEN}[ANALYTICS]${RESET} Cohort created: $name"
}

# Daily active users
dau() {
    local days="${1:-14}"
    echo -e "${AMBER}[ANALYTICS]${RESET} Daily Active Users (last $days days)"
    echo ""
    sqlite3 -column -header "$ANALYTICS_DB" "SELECT date(timestamp) as date, COUNT(DISTINCT user_id) as dau FROM events WHERE timestamp > datetime('now', '-$days days') GROUP BY date(timestamp) ORDER BY date DESC;"
}

# Retention
retention() {
    local cohort_date="$1"  # YYYY-MM-DD

    echo -e "${AMBER}[ANALYTICS]${RESET} Retention from $cohort_date"
    echo ""

    local cohort_users=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(DISTINCT user_id) FROM events WHERE date(timestamp)='$cohort_date';")
    echo -e "  ${GREEN}Cohort Size:${RESET} $cohort_users"
    echo ""

    for day in 1 3 7 14 30; do
        local retained=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(DISTINCT e2.user_id) FROM events e1 JOIN events e2 ON e1.user_id=e2.user_id WHERE date(e1.timestamp)='$cohort_date' AND date(e2.timestamp)=date('$cohort_date', '+$day days');")
        local rate=$(echo "scale=1; $retained * 100 / $cohort_users" | bc 2>/dev/null || echo "0")
        echo -e "  ${BLUE}Day $day:${RESET} $retained users ($rate%)"
    done
}

# Stats
stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}     ${AMBER}[ANALYTICS] System Stats${RESET}       ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total_events=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(*) FROM events;")
    local total_pageviews=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(*) FROM page_views;")
    local unique_users=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(DISTINCT user_id) FROM events;")
    local event_types=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(DISTINCT event_name) FROM events;")
    local funnels=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(*) FROM funnels;")
    local today_events=$(sqlite3 "$ANALYTICS_DB" "SELECT COUNT(*) FROM events WHERE date(timestamp)=date('now');")

    echo -e "  ${GREEN}Total Events:${RESET}    $total_events"
    echo -e "  ${GREEN}Today's Events:${RESET}  $today_events"
    echo -e "  ${GREEN}Page Views:${RESET}      $total_pageviews"
    echo -e "  ${GREEN}Unique Users:${RESET}    $unique_users"
    echo -e "  ${GREEN}Event Types:${RESET}     $event_types"
    echo -e "  ${GREEN}Funnels:${RESET}         $funnels"
    echo ""
    echo -e "${BLUE}Top Events Today:${RESET}"
    sqlite3 -column "$ANALYTICS_DB" "SELECT event_name, COUNT(*) as count FROM events WHERE date(timestamp)=date('now') GROUP BY event_name ORDER BY count DESC LIMIT 5;"
}

show_help() {
    echo -e "${PINK}[ANALYTICS]${RESET} - BlackRoad Event Analytics"
    echo ""
    echo "Usage: ~/analytics-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                 Initialize system"
    echo "  track <event> [user] [properties]   Track event"
    echo "  pageview <path> [user] [referrer]   Track page view"
    echo "  identify <user> <property> <value>  Set user property"
    echo "  events [days]                       Event counts"
    echo "  pages [days]                        Page view stats"
    echo "  funnel <id> <name> <steps>          Create funnel"
    echo "  analyze-funnel <id> [days]          Analyze funnel"
    echo "  funnels                             List funnels"
    echo "  journey <user> [limit]              User journey"
    echo "  cohort <id> <name> <definition>     Create cohort"
    echo "  dau [days]                          Daily active users"
    echo "  retention <date>                    Retention analysis"
    echo "  stats                               Show statistics"
}

case "${1:-help}" in
    init)           init_analytics ;;
    track)          track "$2" "$3" "$4" "$5" ;;
    pageview)       pageview "$2" "$3" "$4" "$5" "$6" ;;
    identify)       identify "$2" "$3" "$4" ;;
    events)         events "$2" ;;
    pages)          pages "$2" ;;
    funnel)         funnel "$2" "$3" "$4" ;;
    analyze-funnel) analyze_funnel "$2" "$3" ;;
    funnels)        funnels ;;
    journey)        journey "$2" "$3" ;;
    cohort)         cohort "$2" "$3" "$4" ;;
    dau)            dau "$2" ;;
    retention)      retention "$2" ;;
    stats)          stats ;;
    help|*)         show_help ;;
esac
