#!/bin/bash
# BlackRoad Search Cron — schedules all search/indexing jobs
# Usage: ./search-cron.sh install   # Install crontab entries
#        ./search-cron.sh remove    # Remove crontab entries
#        ./search-cron.sh status    # Show current search cron jobs
#        ./search-cron.sh run-all   # Run all indexers now (one-shot)

set -e

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
AMBER='\033[38;5;214m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

BR_ROOT="$HOME/blackroad-operator"
SEARCH_DIR="$BR_ROOT/tools/search"
LOG_DIR="/tmp/blackroad-search-logs"
mkdir -p "$LOG_DIR"

CRON_TAG="# BLACKROAD-SEARCH-CRON"

install_crons() {
    echo -e "\n${PINK}Installing search cron jobs...${RESET}\n"

    # Remove old entries first
    crontab -l 2>/dev/null | grep -v "$CRON_TAG" > /tmp/cron-clean.tmp || true

    cat >> /tmp/cron-clean.tmp << EOF
# Rebuild full cross-org index every 6 hours $CRON_TAG
0 */6 * * * cd $HOME && python3 $SEARCH_DIR/index-all-orgs.py >> $LOG_DIR/index-all-orgs.log 2>&1 $CRON_TAG

# Rebuild local unified index every 4 hours $CRON_TAG
0 2,6,10,14,18,22 * * * cd $HOME && python3 $SEARCH_DIR/index-all.py --rebuild >> $LOG_DIR/index-all.log 2>&1 $CRON_TAG

# Live website indexer every 2 hours $CRON_TAG
30 */2 * * * cd $HOME && bash $SEARCH_DIR/live-indexer.sh >> $LOG_DIR/live-indexer.log 2>&1 $CRON_TAG

# IndexNow submission every Sunday at 3am $CRON_TAG
0 3 * * 0 cd $HOME && bash $BR_ROOT/tools/indexnow-submit.sh --all >> $LOG_DIR/indexnow.log 2>&1 $CRON_TAG

# Generate sitemaps every Monday at 4am $CRON_TAG
0 4 * * 1 cd $HOME && python3 $SEARCH_DIR/index-all-orgs.py sitemap >> $LOG_DIR/sitemap.log 2>&1 $CRON_TAG
EOF

    crontab /tmp/cron-clean.tmp
    rm /tmp/cron-clean.tmp

    echo -e "  ${GREEN}✓${RESET} Full cross-org index: every 6 hours"
    echo -e "  ${GREEN}✓${RESET} Local unified index: every 4 hours"
    echo -e "  ${GREEN}✓${RESET} Live website indexer: every 2 hours"
    echo -e "  ${GREEN}✓${RESET} IndexNow submission: weekly (Sunday 3am)"
    echo -e "  ${GREEN}✓${RESET} Sitemap generation: weekly (Monday 4am)"
    echo -e "\n  ${BOLD}${GREEN}5 cron jobs installed${RESET}\n"
}

remove_crons() {
    echo -e "\n${PINK}Removing search cron jobs...${RESET}\n"
    crontab -l 2>/dev/null | grep -v "$CRON_TAG" > /tmp/cron-clean.tmp || true
    crontab /tmp/cron-clean.tmp
    rm /tmp/cron-clean.tmp
    echo -e "  ${GREEN}✓${RESET} All BLACKROAD-SEARCH-CRON entries removed\n"
}

show_status() {
    echo -e "\n${PINK}Search cron status:${RESET}\n"
    local jobs=$(crontab -l 2>/dev/null | grep "$CRON_TAG" | grep -v "^#" || true)
    if [ -z "$jobs" ]; then
        echo -e "  ${AMBER}No search cron jobs installed${RESET}"
        echo -e "  ${DIM}Run: ./search-cron.sh install${RESET}\n"
        return
    fi

    local count=0
    while IFS= read -r line; do
        # Strip the cron tag for display
        local clean=$(echo "$line" | sed "s/ $CRON_TAG//")
        local schedule=$(echo "$clean" | awk '{print $1, $2, $3, $4, $5}')
        local cmd=$(echo "$clean" | awk '{for(i=6;i<=NF;i++) printf "%s ", $i; print ""}' | sed 's/ *$//')
        echo -e "  ${GREEN}●${RESET} ${BOLD}$schedule${RESET}"
        echo -e "    ${DIM}$cmd${RESET}"
        count=$((count + 1))
    done <<< "$jobs"

    echo -e "\n  ${BOLD}$count jobs active${RESET}"

    # Show log sizes
    echo -e "\n  ${AMBER}Log files:${RESET}"
    for log in "$LOG_DIR"/*.log; do
        if [ -f "$log" ]; then
            local size=$(du -sh "$log" 2>/dev/null | awk '{print $1}')
            local lines=$(wc -l < "$log" 2>/dev/null || echo 0)
            echo -e "    ${DIM}$(basename "$log"): $size ($lines lines)${RESET}"
        fi
    done
    echo ""
}

run_all() {
    echo -e "\n${PINK}╔══════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║  Running all search indexers now                  ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n"

    local t0=$(date +%s)

    echo -e "  ${AMBER}[1/5]${RESET} Cross-org index (16 orgs + domains + memory)..."
    python3 "$SEARCH_DIR/index-all-orgs.py" 2>&1 | tail -5

    echo -e "\n  ${AMBER}[2/5]${RESET} Local unified index (codex/TIL/docs/agents)..."
    python3 "$SEARCH_DIR/index-all.py" --rebuild 2>&1 | tail -3

    echo -e "\n  ${AMBER}[3/5]${RESET} Live website indexer..."
    bash "$SEARCH_DIR/live-indexer.sh" 2>&1 | tail -3

    echo -e "\n  ${AMBER}[4/5]${RESET} IndexNow submission..."
    bash "$BR_ROOT/tools/indexnow-submit.sh" 2>&1 | tail -3

    echo -e "\n  ${AMBER}[5/5]${RESET} Sitemap generation..."
    python3 "$SEARCH_DIR/index-all-orgs.py" sitemap 2>&1 | tail -5

    local elapsed=$(( $(date +%s) - t0 ))
    echo -e "\n  ${BOLD}${GREEN}All indexers complete in ${elapsed}s${RESET}\n"

    # Show combined stats
    echo -e "  ${AMBER}Database sizes:${RESET}"
    for db in ~/.blackroad/search.db ~/.blackroad/search-all-orgs.db ~/.blackroad/search-live.db; do
        if [ -f "$db" ]; then
            local size=$(du -sh "$db" 2>/dev/null | awk '{print $1}')
            echo -e "    ${DIM}$(basename "$db"): $size${RESET}"
        fi
    done
    echo ""
}

case "${1:-}" in
    install) install_crons ;;
    remove) remove_crons ;;
    status) show_status ;;
    run-all) run_all ;;
    *)
        echo -e "\n${PINK}BlackRoad Search Cron Manager${RESET}"
        echo -e "${DIM}Manages scheduled search indexing and sitemap generation${RESET}\n"
        echo -e "  ${BOLD}Usage:${RESET}"
        echo -e "    $0 install    Install crontab entries"
        echo -e "    $0 remove     Remove crontab entries"
        echo -e "    $0 status     Show current search cron jobs"
        echo -e "    $0 run-all    Run all indexers now\n"
        ;;
esac
