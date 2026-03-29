#!/bin/bash
# IndexNow batch submission — submits all live BlackRoad URLs to Bing/Yandex/Seznam/Naver
# Usage: ./indexnow-submit.sh [--all]
# Without --all: submits core pages only. With --all: submits ALL indexed URLs.

set -e

KEY="f1a7893bd54145a697f112eefdac579b"
LOG="/tmp/indexnow.log"

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
DIM='\033[2m'
RESET='\033[0m'

DOMAINS=(
    "blackroad.io" "blackroad.company" "blackroad.me" "blackroad.network"
    "blackroad.systems" "blackroadai.com" "blackroadinc.us" "blackroadqi.com"
    "blackroadquantum.com" "blackroadquantum.info" "blackroadquantum.net"
    "blackroadquantum.shop" "blackroadquantum.store" "lucidia.earth"
    "lucidia.studio" "lucidiaqi.com" "roadchain.io" "roadcoin.io"
    "blackboxprogramming.io"
)

SUBDOMAINS=(
    "app" "prism" "chat" "search" "docs" "status" "dash" "agents"
    "pay" "tutor" "social" "canvas" "cadence" "roadcode" "video"
    "live" "game" "book" "work" "radio" "hq" "roundtrip" "images" "auth"
)

BLOG_PATHS=(
    "/blogs" "/blog-quit-finance" "/blog-sovereign-os-150"
    "/blog-amundson-sequence" "/blog-wireguard-mesh" "/blog-200-agents"
    "/blog-search-engine-pis" "/blog-zero-to-629"
    "/api-docs" "/demo" "/getting-started" "/status-live"
)

submit_batch() {
    local host="$1"
    shift
    local urls=("$@")

    if [ ${#urls[@]} -eq 0 ]; then
        return
    fi

    # Build JSON array
    local url_json=""
    for url in "${urls[@]}"; do
        if [ -n "$url_json" ]; then
            url_json="$url_json,"
        fi
        url_json="$url_json\"$url\""
    done

    curl -s -X POST "https://api.indexnow.org/indexnow" \
        -H "Content-Type: application/json" \
        -d "{
            \"host\": \"$host\",
            \"key\": \"$KEY\",
            \"keyLocation\": \"https://blackroad.io/$KEY.txt\",
            \"urlList\": [$url_json]
        }" >> "$LOG" 2>&1

    echo -e "  ${GREEN}✓${RESET} $host: ${#urls[@]} URLs submitted"
}

echo -e "\n${PINK}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${PINK}║  IndexNow Batch Submission                       ║${RESET}"
echo -e "${PINK}╚══════════════════════════════════════════════════╝${RESET}\n"

total=0

# Submit root domains
for domain in "${DOMAINS[@]}"; do
    submit_batch "$domain" "https://$domain/"
    total=$((total + 1))
done

# Submit blackroad.io subdomains
sub_urls=()
for sub in "${SUBDOMAINS[@]}"; do
    sub_urls+=("https://${sub}.blackroad.io/")
done
submit_batch "blackroad.io" "${sub_urls[@]}"
total=$((total + ${#sub_urls[@]}))

# Submit blog paths
blog_urls=("https://blackroad.io/")
for path in "${BLOG_PATHS[@]}"; do
    blog_urls+=("https://blackroad.io$path")
done
submit_batch "blackroad.io" "${blog_urls[@]}"
total=$((total + ${#blog_urls[@]}))

# If --all flag, also submit GitHub repo URLs
if [ "$1" = "--all" ]; then
    echo -e "\n  ${DIM}Submitting GitHub repo URLs...${RESET}"
    # Get active repos from the search DB
    DB="$HOME/.blackroad/search-all-orgs.db"
    if [ -f "$DB" ]; then
        repo_urls=$(sqlite3 "$DB" "SELECT url FROM repos WHERE archived = 0 AND url LIKE 'https://github.com/%' LIMIT 200" 2>/dev/null)
        if [ -n "$repo_urls" ]; then
            gh_urls=()
            while IFS= read -r url; do
                gh_urls+=("$url")
            done <<< "$repo_urls"
            # Submit in batches of 50
            for ((i=0; i<${#gh_urls[@]}; i+=50)); do
                batch=("${gh_urls[@]:$i:50}")
                submit_batch "github.com" "${batch[@]}"
                total=$((total + ${#batch[@]}))
            done
        fi
    fi
fi

echo -e "\n  ${GREEN}Total: $total URLs submitted${RESET}"
echo "[$(date -u)] IndexNow submitted $total URLs" >> "$LOG"
echo -e "  ${DIM}Log: $LOG${RESET}\n"
