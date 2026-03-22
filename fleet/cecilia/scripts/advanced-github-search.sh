#!/bin/bash
# Advanced GitHub Search Tool for BlackRoad Ecosystem

SEARCH_HELPER="github-search-helper.json"
ANALYSIS="blackroad-os-analysis.json"

function show_help() {
    cat << 'HELP'
🔍 Advanced GitHub Search Tool

USAGE:
    ./advanced-github-search.sh [command] [arguments]

COMMANDS:
    search <keyword>          - Search repos by keyword
    category <name>           - Show repos in category
    org <name>                - List all repos in organization
    stats                     - Show statistics
    top [N]                   - Show top N recent/starred repos
    tech <technology>         - Find repos using specific tech
    private                   - List all private repos
    public                    - List all public repos
    recent [days]             - Show repos updated in last N days
    describe                  - Show what BlackRoad OS is
    
EXAMPLES:
    ./advanced-github-search.sh search quantum
    ./advanced-github-search.sh category "AI & Machine Learning"
    ./advanced-github-search.sh org BlackRoad-AI
    ./advanced-github-search.sh tech kubernetes
    ./advanced-github-search.sh recent 7
    ./advanced-github-search.sh describe

HELP
}

function search() {
    local term="$1"
    echo "🔍 Searching for: $term"
    echo ""
    jq -r --arg term "$term" '
      .[] | 
      select(
        (.name | ascii_downcase | contains($term | ascii_downcase)) or 
        (.description | ascii_downcase | contains($term | ascii_downcase))
      ) | 
      "[\(.org)] \(.name)\n  📝 \(.description // "No description")\n  🔗 \(.url)\n  ⭐ \(.stars) | 🕒 \(.updated[:10])\n"
    ' "$SEARCH_HELPER" | head -50
}

function show_category() {
    local cat="$1"
    echo "📂 Category: $cat"
    echo ""
    
    case "$cat" in
        "ai"|"AI") cat="AI & Machine Learning" ;;
        "infra"|"infrastructure") cat="Infrastructure & DevOps" ;;
        "cloud") cat="Cloud & Distributed" ;;
        "security"|"auth") cat="Security & Auth" ;;
        "monitor"|"observability") cat="Monitoring & Observability" ;;
        "data"|"database") cat="Data & Storage" ;;
        "api") cat="API & Services" ;;
        "quantum") cat="Quantum & Research" ;;
        "hardware"|"iot") cat="Hardware & IoT" ;;
        "web"|"frontend") cat="Web & Frontend" ;;
        "automation"|"workflow") cat="Automation & Workflow" ;;
        "blockchain"|"crypto") cat="Blockchain & Crypto" ;;
        "media") cat="Media & Content" ;;
        "tools"|"dev") cat="Developer Tools" ;;
        "network"|"networking") cat="Networking" ;;
    esac
    
    search "$(echo "$cat" | tr '[:upper:]' '[:lower:]')"
}

function show_org() {
    local org="$1"
    echo "🏢 Organization: $org"
    echo ""
    jq -r --arg org "$org" '
      .[] | 
      select(.org == $org) | 
      "• \(.name)\n  \(.description // "No description")\n  \(.url)\n"
    ' "$SEARCH_HELPER"
}

function show_stats() {
    ./github-stats.sh
}

function show_top() {
    local n="${1:-10}"
    echo "📊 Top $n repositories"
    echo ""
    echo "Most Recently Updated:"
    jq -r '.[] | "\(.updated[:10]) - [\(.org)] \(.name)"' "$SEARCH_HELPER" | sort -r | head -$n
    echo ""
    echo "Most Starred:"
    jq -r 'sort_by(.stars) | reverse | .[:'"$n"'] | .[] | "⭐ \(.stars) - [\(.org)] \(.name)"' "$SEARCH_HELPER"
}

function find_by_tech() {
    local tech="$1"
    echo "🔧 Repositories using: $tech"
    echo ""
    search "$tech"
}

function list_private() {
    echo "🔒 Private Repositories"
    echo ""
    jq -r '.[] | select(.private == true) | "[\(.org)] \(.name) - \(.url)"' "$SEARCH_HELPER"
}

function list_public() {
    echo "🌐 Public Repositories"
    echo ""
    jq -r '.[] | select(.private == false) | "[\(.org)] \(.name)"' "$SEARCH_HELPER" | wc -l
    echo "repos are public. Use 'search' to find specific ones."
}

function recent_updates() {
    local days="${1:-7}"
    local date=$(date -v -${days}d +%Y-%m-%d 2>/dev/null || date -d "$days days ago" +%Y-%m-%d)
    echo "📅 Repositories updated in last $days days (since $date)"
    echo ""
    jq -r --arg date "$date" '
      .[] | 
      select(.updated >= $date) | 
      "\(.updated[:10]) - [\(.org)] \(.name)"
    ' "$SEARCH_HELPER" | sort -r
}

function describe_blackroad() {
    if [ -f "BLACKROAD_OS_50_VERIFIED_POINTS.md" ]; then
        head -100 BLACKROAD_OS_50_VERIFIED_POINTS.md
        echo ""
        echo "📄 See full document: BLACKROAD_OS_50_VERIFIED_POINTS.md"
    else
        echo "ℹ️  BlackRoad OS is a comprehensive AI sovereignty platform with 1,225 repositories."
        echo "Run the analysis script to generate detailed documentation."
    fi
}

# Main command router
case "$1" in
    search) search "$2" ;;
    category|cat) show_category "$2" ;;
    org|organization) show_org "$2" ;;
    stats) show_stats ;;
    top) show_top "$2" ;;
    tech|technology) find_by_tech "$2" ;;
    private) list_private ;;
    public) list_public ;;
    recent) recent_updates "$2" ;;
    describe|what|about) describe_blackroad ;;
    help|--help|-h|"") show_help ;;
    *) echo "Unknown command: $1"; echo ""; show_help ;;
esac

