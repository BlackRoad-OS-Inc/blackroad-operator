#!/bin/bash
# LinkedIn Scheduled Posting System for BlackRoad OS
# Manages content calendar and automated posting

set -euo pipefail

CALENDAR_DIR="${HOME}/.blackroad/linkedin-calendar"
POSTED_LOG="${HOME}/.blackroad/linkedin-posted.log"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create calendar directory
mkdir -p "$CALENDAR_DIR"
touch "$POSTED_LOG"

# Check for due posts
check_due_posts() {
    echo -e "${BLUE}Checking scheduled posts...${NC}"
    
    TODAY=$(date +%Y-%m-%d)
    NOW=$(date +%H:%M)
    
    for post_file in "$CALENDAR_DIR"/*.json; do
        if [[ ! -f "$post_file" ]]; then
            continue
        fi
        
        POST_DATE=$(jq -r '.date' "$post_file")
        POST_TIME=$(jq -r '.time // "09:00"' "$post_file")
        POST_ID=$(basename "$post_file" .json)
        
        # Check if already posted
        if grep -q "$POST_ID" "$POSTED_LOG"; then
            continue
        fi
        
        # Check if due
        if [[ "$POST_DATE" == "$TODAY" && "$POST_TIME" <= "$NOW" ]]; then
            post_scheduled "$post_file" "$POST_ID"
        fi
    done
}

# Post a scheduled item
post_scheduled() {
    local file="$1"
    local id="$2"
    
    TEXT=$(jq -r '.text' "$file")
    LINK=$(jq -r '.link // ""' "$file")
    
    echo -e "${GREEN}Posting: $id${NC}"
    echo "Text: $TEXT"
    
    if [[ -n "$LINK" && "$LINK" != "null" ]]; then
        ~/linkedin-post.sh link "$TEXT" "$LINK"
    else
        ~/linkedin-post.sh post "$TEXT"
    fi
    
    if [[ $? -eq 0 ]]; then
        echo "$(date +%Y-%m-%d\ %H:%M:%S) $id" >> "$POSTED_LOG"
        echo -e "${GREEN}✓ Posted and logged${NC}"
    fi
}

# Schedule a new post
schedule_post() {
    local date="$1"
    local time="$2"
    local text="$3"
    local link="${4:-}"
    
    ID=$(date +%s)
    FILE="$CALENDAR_DIR/$ID.json"
    
    if [[ -n "$link" ]]; then
        jq -n --arg date "$date" --arg time "$time" --arg text "$text" --arg link "$link" '{
            date: $date,
            time: $time,
            text: $text,
            link: $link
        }' > "$FILE"
    else
        jq -n --arg date "$date" --arg time "$time" --arg text "$text" '{
            date: $date,
            time: $time,
            text: $text
        }' > "$FILE"
    fi
    
    echo -e "${GREEN}✓ Scheduled for $date at $time${NC}"
    echo "ID: $ID"
}

# List scheduled posts
list_scheduled() {
    echo -e "${BLUE}Scheduled Posts:${NC}"
    echo
    
    for post_file in "$CALENDAR_DIR"/*.json; do
        if [[ ! -f "$post_file" ]]; then
            echo "No scheduled posts"
            return
        fi
        
        ID=$(basename "$post_file" .json)
        DATE=$(jq -r '.date' "$post_file")
        TIME=$(jq -r '.time // "09:00"' "$post_file")
        TEXT=$(jq -r '.text' "$post_file" | head -c 50)
        
        # Check if posted
        if grep -q "$ID" "$POSTED_LOG"; then
            STATUS="${GREEN}✓ Posted${NC}"
        else
            STATUS="${YELLOW}⏳ Pending${NC}"
        fi
        
        echo -e "$STATUS $DATE $TIME - $TEXT..."
        echo "    ID: $ID"
        echo
    done
}

# Delete scheduled post
delete_scheduled() {
    local id="$1"
    FILE="$CALENDAR_DIR/$id.json"
    
    if [[ -f "$FILE" ]]; then
        rm "$FILE"
        echo -e "${GREEN}✓ Deleted scheduled post $id${NC}"
    else
        echo "Post $id not found"
        exit 1
    fi
}

# Show help
show_help() {
    cat << EOF
${BLUE}LinkedIn Scheduled Posting${NC}

${GREEN}Commands:${NC}
  schedule <date> <time> <text> [link]  Schedule a post
  check                                  Check and post due items
  list                                   List scheduled posts
  delete <id>                            Delete scheduled post

${GREEN}Date Format:${NC} YYYY-MM-DD
${GREEN}Time Format:${NC} HH:MM (24-hour)

${GREEN}Examples:${NC}
  # Schedule text post
  ./linkedin-schedule.sh schedule 2026-02-01 09:00 "Weekly update"
  
  # Schedule post with link
  ./linkedin-schedule.sh schedule 2026-02-05 14:00 "New blog post" "https://blackroad.io/blog"
  
  # Check for due posts (run via cron)
  ./linkedin-schedule.sh check
  
  # List all scheduled
  ./linkedin-schedule.sh list
  
  # Delete scheduled post
  ./linkedin-schedule.sh delete 1738296000

${GREEN}Automation:${NC}
  # Add to crontab to check every hour
  0 * * * * $HOME/linkedin-schedule.sh check

${GREEN}Files:${NC}
  ~/.blackroad/linkedin-calendar/  Scheduled posts
  ~/.blackroad/linkedin-posted.log Posted history
EOF
}

# Main
case "${1:-}" in
    schedule)
        if [[ $# -lt 4 ]]; then
            echo "Usage: schedule <date> <time> <text> [link]"
            exit 1
        fi
        schedule_post "$2" "$3" "$4" "${5:-}"
        ;;
    check)
        check_due_posts
        ;;
    list)
        list_scheduled
        ;;
    delete)
        if [[ -z "${2:-}" ]]; then
            echo "Usage: delete <id>"
            exit 1
        fi
        delete_scheduled "$2"
        ;;
    *)
        show_help
        exit 1
        ;;
esac
