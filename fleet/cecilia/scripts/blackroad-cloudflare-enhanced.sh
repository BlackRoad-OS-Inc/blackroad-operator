#!/bin/bash
# ============================================================================
# BLACKROAD CLOUDFLARE ENHANCED
# Complete management for 200+ Pages projects, KV namespaces, Workers, D1
# ============================================================================

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"
CACHE_DIR="$HOME/.blackroad/cloudflare-cache"
mkdir -p "$CACHE_DIR"

# ============================================================================
# DASHBOARD
# ============================================================================

dashboard() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║         BLACKROAD CLOUDFLARE COMMAND CENTER                  ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo ""

    # Quick stats
    local pages_count=$(wrangler pages project list 2>/dev/null | grep -c "pages.dev" || echo "?")
    local kv_count=$(wrangler kv namespace list 2>/dev/null | grep -c '"title"' || echo "?")

    echo -e "${AMBER}INFRASTRUCTURE${RESET}"
    echo -e "  Pages Projects: ${GREEN}$pages_count${RESET}"
    echo -e "  KV Namespaces:  ${GREEN}$kv_count${RESET}"
    echo -e "  Account ID:     ${BLUE}$ACCOUNT_ID${RESET}"
    echo ""

    # Recent deployments
    echo -e "${AMBER}RECENT DEPLOYMENTS${RESET}"
    wrangler pages project list 2>/dev/null | head -15 | tail -10
    echo ""
}

# ============================================================================
# PAGES MANAGEMENT
# ============================================================================

pages_list() {
    echo -e "${PINK}ALL PAGES PROJECTS${RESET}"
    wrangler pages project list 2>/dev/null
}

pages_deploy() {
    local project="$1"
    local dir="${2:-.}"

    if [[ -z "$project" ]]; then
        echo "Usage: $0 pages-deploy <project-name> [directory]"
        return 1
    fi

    echo -e "${AMBER}Deploying to ${PINK}$project${RESET}..."
    wrangler pages deploy "$dir" --project-name="$project"
}

pages_create() {
    local project="$1"

    if [[ -z "$project" ]]; then
        echo "Usage: $0 pages-create <project-name>"
        return 1
    fi

    echo -e "${AMBER}Creating project ${PINK}$project${RESET}..."
    wrangler pages project create "$project" --production-branch=main
}

pages_delete() {
    local project="$1"

    if [[ -z "$project" ]]; then
        echo "Usage: $0 pages-delete <project-name>"
        return 1
    fi

    echo -e "${RED}Deleting project ${PINK}$project${RESET}..."
    read -p "Are you sure? (y/N) " confirm
    [[ "$confirm" == "y" ]] && wrangler pages project delete "$project"
}

pages_domains() {
    local project="$1"

    if [[ -z "$project" ]]; then
        echo "Usage: $0 pages-domains <project-name>"
        return 1
    fi

    echo -e "${AMBER}Domains for ${PINK}$project${RESET}:"
    wrangler pages deployment list --project-name="$project" 2>/dev/null | head -10
}

# ============================================================================
# KV MANAGEMENT
# ============================================================================

kv_list() {
    echo -e "${PINK}KV NAMESPACES${RESET}"
    wrangler kv namespace list 2>/dev/null | jq -r '.[] | "\(.title): \(.id)"'
}

kv_create() {
    local name="$1"

    if [[ -z "$name" ]]; then
        echo "Usage: $0 kv-create <namespace-name>"
        return 1
    fi

    echo -e "${AMBER}Creating KV namespace ${PINK}$name${RESET}..."
    wrangler kv namespace create "$name"
}

kv_get() {
    local ns_id="$1"
    local key="$2"

    if [[ -z "$ns_id" || -z "$key" ]]; then
        echo "Usage: $0 kv-get <namespace-id> <key>"
        return 1
    fi

    wrangler kv key get --namespace-id="$ns_id" "$key"
}

kv_put() {
    local ns_id="$1"
    local key="$2"
    local value="$3"

    if [[ -z "$ns_id" || -z "$key" || -z "$value" ]]; then
        echo "Usage: $0 kv-put <namespace-id> <key> <value>"
        return 1
    fi

    wrangler kv key put --namespace-id="$ns_id" "$key" "$value"
}

kv_keys() {
    local ns_id="$1"

    if [[ -z "$ns_id" ]]; then
        echo "Usage: $0 kv-keys <namespace-id>"
        return 1
    fi

    wrangler kv key list --namespace-id="$ns_id" | jq -r '.[].name'
}

# ============================================================================
# BATCH OPERATIONS
# ============================================================================

batch_deploy() {
    local dir="$1"
    local pattern="${2:-blackroad-*}"

    echo -e "${PINK}BATCH DEPLOY${RESET}"
    echo -e "Directory: $dir"
    echo -e "Pattern: $pattern"
    echo ""

    wrangler pages project list 2>/dev/null | grep "$pattern" | while read -r line; do
        project=$(echo "$line" | awk '{print $2}')
        if [[ -n "$project" && "$project" != "│" ]]; then
            echo -e "${AMBER}→ $project${RESET}"
            wrangler pages deploy "$dir" --project-name="$project" 2>/dev/null &
        fi
    done
    wait
    echo -e "${GREEN}Batch deploy complete${RESET}"
}

batch_status() {
    echo -e "${PINK}DEPLOYMENT STATUS${RESET}"

    wrangler pages project list 2>/dev/null | grep "blackroad" | head -20 | while read -r line; do
        project=$(echo "$line" | awk '{print $2}')
        if [[ -n "$project" && "$project" != "│" ]]; then
            status=$(curl -s "https://$project.pages.dev" -o /dev/null -w "%{http_code}" 2>/dev/null)
            if [[ "$status" == "200" ]]; then
                echo -e "  ${GREEN}●${RESET} $project (200)"
            else
                echo -e "  ${RED}●${RESET} $project ($status)"
            fi
        fi
    done
}

# ============================================================================
# ANALYTICS
# ============================================================================

analytics() {
    echo -e "${PINK}CLOUDFLARE ANALYTICS${RESET}"
    echo ""

    # Get analytics via API
    local token=$(wrangler whoami 2>&1 | grep -o 'OAuth Token')
    if [[ -n "$token" ]]; then
        echo -e "${AMBER}Note: Full analytics require Cloudflare Dashboard${RESET}"
        echo -e "Visit: https://dash.cloudflare.com/$ACCOUNT_ID/pages"
    fi
}

# ============================================================================
# QUICK ACTIONS
# ============================================================================

quick_blackroad_io() {
    echo -e "${PINK}Deploying blackroad.io...${RESET}"
    # Find the blackroad-io repo
    local repo="$HOME/blackroad-io"
    if [[ -d "$repo" ]]; then
        wrangler pages deploy "$repo" --project-name="blackroad-io"
    else
        echo "Repo not found: $repo"
    fi
}

quick_sync_all() {
    echo -e "${PINK}Syncing all BlackRoad projects...${RESET}"
    ~/blackroad-project-sync.sh sync
}

# ============================================================================
# HELP
# ============================================================================

show_help() {
    echo -e "${PINK}BLACKROAD CLOUDFLARE ENHANCED${RESET}"
    echo ""
    echo "Usage: $0 <command> [args]"
    echo ""
    echo -e "${AMBER}DASHBOARD${RESET}"
    echo "  dashboard, status      Show overview"
    echo ""
    echo -e "${AMBER}PAGES${RESET}"
    echo "  pages-list             List all Pages projects"
    echo "  pages-deploy <p> [d]   Deploy directory to project"
    echo "  pages-create <name>    Create new project"
    echo "  pages-delete <name>    Delete project"
    echo "  pages-domains <name>   Show project domains"
    echo ""
    echo -e "${AMBER}KV STORAGE${RESET}"
    echo "  kv-list                List all KV namespaces"
    echo "  kv-create <name>       Create namespace"
    echo "  kv-get <id> <key>      Get value"
    echo "  kv-put <id> <k> <v>    Set value"
    echo "  kv-keys <id>           List keys"
    echo ""
    echo -e "${AMBER}BATCH OPS${RESET}"
    echo "  batch-deploy <dir>     Deploy to all matching projects"
    echo "  batch-status           Check health of all projects"
    echo ""
    echo -e "${AMBER}QUICK${RESET}"
    echo "  blackroad-io           Deploy blackroad.io"
    echo "  sync                   Sync all projects"
}

# ============================================================================
# MAIN
# ============================================================================

case "${1:-dashboard}" in
    dashboard|status|d)
        dashboard
        ;;
    pages-list|pages|p)
        pages_list
        ;;
    pages-deploy|deploy)
        pages_deploy "$2" "$3"
        ;;
    pages-create|create)
        pages_create "$2"
        ;;
    pages-delete|delete)
        pages_delete "$2"
        ;;
    pages-domains|domains)
        pages_domains "$2"
        ;;
    kv-list|kv)
        kv_list
        ;;
    kv-create)
        kv_create "$2"
        ;;
    kv-get|get)
        kv_get "$2" "$3"
        ;;
    kv-put|put)
        kv_put "$2" "$3" "$4"
        ;;
    kv-keys|keys)
        kv_keys "$2"
        ;;
    batch-deploy)
        batch_deploy "$2" "$3"
        ;;
    batch-status|health)
        batch_status
        ;;
    analytics)
        analytics
        ;;
    blackroad-io|io)
        quick_blackroad_io
        ;;
    sync)
        quick_sync_all
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        show_help
        ;;
esac
