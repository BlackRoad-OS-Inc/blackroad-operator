#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# ═══════════════════════════════════════════════════════════════════════════════
#  BLACKROAD DEPLOY MODULE v1.0
#  Unified deployment to Cloudflare Pages, Workers, Railway, and more
# ═══════════════════════════════════════════════════════════════════════════════

# ── Brand Colors ──
PINK=$'\033[38;5;205m'
AMBER=$'\033[38;5;214m'
BLUE=$'\033[38;5;69m'
VIOLET=$'\033[38;5;135m'
GREEN=$'\033[38;5;82m'
RED=$'\033[38;5;196m'
PINK=$'\033[38;5;45m'
DIM=$'\033[38;5;245m'
BOLD=$'\033[1m'
RST=$'\033[0m'

# ── Config ──
DEPLOY_LOG="$HOME/.blackroad/deploy-history.jsonl"
DEPLOY_STATE="$HOME/.blackroad/deploy-state.json"
mkdir -p "$(dirname "$DEPLOY_LOG")"
touch "$DEPLOY_LOG"

# ── Helper Functions ──

timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.000Z"
}

log_deploy() {
    local target="$1"
    local project="$2"
    local status="$3"
    local url="${4:-}"
    local details="${5:-}"
    echo "{\"timestamp\":\"$(timestamp)\",\"target\":\"$target\",\"project\":\"$project\",\"status\":\"$status\",\"url\":\"$url\",\"details\":\"$details\"}" >> "$DEPLOY_LOG"
}

progress_bar() {
    local current=$1
    local total=$2
    local width=30
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    printf "[${GREEN}"
    printf "%${filled}s" | tr ' ' '█'
    printf "${DIM}"
    printf "%${empty}s" | tr ' ' '░'
    printf "${RST}] %3d%%" "$percent"
}

spinner() {
    local pid=$1
    local msg="$2"
    local spinchars='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0
    while kill -0 "$pid" 2>/dev/null; do
        printf "\r  ${PINK}${spinchars:i++%10:1}${RST} $msg"
        sleep 0.1
    done
    printf "\r"
}

# ── Status Command ──

cmd_status() {
    echo -e "${PINK}─── ${AMBER}DEPLOYMENT STATUS${RST} ${PINK}───${RST}"
    echo ""

    # Cloudflare status
    echo -ne "  ${BLUE}Cloudflare:${RST} "
    if wrangler whoami &>/dev/null; then
        local cf_account=$(wrangler whoami 2>/dev/null | grep -o 'Account:.*' | head -1 || echo "connected")
        echo -e "${GREEN}●${RST} authenticated"
    else
        echo -e "${RED}○${RST} not authenticated"
    fi

    # Pages count
    local pages_count=$(wrangler pages project list 2>/dev/null | grep -c "│" || echo "0")
    echo -e "  ${VIOLET}Pages:${RST}      ${AMBER}$pages_count${RST} projects"

    # Railway status
    echo -ne "  ${PINK}Railway:${RST}    "
    if railway whoami &>/dev/null; then
        echo -e "${GREEN}●${RST} authenticated"
    else
        echo -e "${RED}○${RST} not authenticated"
    fi

    # Recent deploys
    local deploy_count=$(wc -l < "$DEPLOY_LOG" 2>/dev/null | tr -d ' ')
    local today_deploys=$(grep "$(date +%Y-%m-%d)" "$DEPLOY_LOG" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  ${GREEN}History:${RST}    ${AMBER}$deploy_count${RST} total, ${GREEN}$today_deploys${RST} today"
    echo ""
}

# ── Cloudflare Pages Commands ──

cmd_pages() {
    local subcmd="${1:-list}"
    shift 2>/dev/null || true

    case "$subcmd" in
        list|ls)
            echo -e "${PINK}─── ${AMBER}CLOUDFLARE PAGES${RST} ${PINK}───${RST}"
            echo ""
            wrangler pages project list 2>/dev/null | while IFS= read -r line; do
                if [[ "$line" == *"│"* && "$line" != *"Project Name"* ]]; then
                    local name=$(echo "$line" | awk -F'│' '{print $2}' | xargs)
                    local domain=$(echo "$line" | awk -F'│' '{print $3}' | xargs)
                    local modified=$(echo "$line" | awk -F'│' '{print $5}' | xargs)
                    echo -e "  ${GREEN}●${RST} ${BOLD}$name${RST}"
                    echo -e "    ${DIM}$domain${RST}"
                fi
            done
            echo ""
            ;;
        deploy|d)
            local dir="${1:-.}"
            local project="$2"

            if [[ -z "$project" ]]; then
                # Try to detect project from directory
                project=$(basename "$dir" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
            fi

            echo -e "${PINK}─── ${AMBER}DEPLOYING TO PAGES${RST} ${PINK}───${RST}"
            echo -e "  Directory: ${PINK}$dir${RST}"
            echo -e "  Project:   ${AMBER}$project${RST}"
            echo ""

            log_deploy "cloudflare-pages" "$project" "started"

            if wrangler pages deploy "$dir" --project-name="$project" 2>&1; then
                echo ""
                echo -e "  ${GREEN}✓${RST} Deployed successfully!"
                local url="https://${project}.pages.dev"
                echo -e "  ${BLUE}→${RST} $url"
                log_deploy "cloudflare-pages" "$project" "success" "$url"
            else
                echo -e "  ${RED}✗${RST} Deployment failed"
                log_deploy "cloudflare-pages" "$project" "failed"
                return 1
            fi
            ;;
        create)
            local project="$1"
            if [[ -z "$project" ]]; then
                echo -e "${RED}Usage:${RST} br deploy pages create <project-name>"
                return 1
            fi

            echo -e "${PINK}Creating Pages project:${RST} $project"
            wrangler pages project create "$project" --production-branch main
            ;;
        delete)
            local project="$1"
            if [[ -z "$project" ]]; then
                echo -e "${RED}Usage:${RST} br deploy pages delete <project-name>"
                return 1
            fi

            echo -ne "Delete project ${AMBER}$project${RST}? [y/N] "
            read -r confirm
            if [[ "$confirm" == "y" || "$confirm" == "Y" ]]; then
                wrangler pages project delete "$project"
            fi
            ;;
        *)
            echo -e "${AMBER}pages${RST} - Cloudflare Pages commands"
            echo "  list        - List all Pages projects"
            echo "  deploy <dir> [project] - Deploy directory to Pages"
            echo "  create <name> - Create new Pages project"
            echo "  delete <name> - Delete Pages project"
            ;;
    esac
}

# ── Cloudflare Workers Commands ──

cmd_workers() {
    local subcmd="${1:-list}"
    shift 2>/dev/null || true

    case "$subcmd" in
        list|ls)
            echo -e "${PINK}─── ${AMBER}CLOUDFLARE WORKERS${RST} ${PINK}───${RST}"
            echo ""
            # Workers don't have a simple list command, use API
            local workers=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts" \
                -H "Authorization: Bearer ${CF_API_TOKEN}" 2>/dev/null | jq -r '.result[].id' 2>/dev/null)

            if [[ -n "$workers" ]]; then
                echo "$workers" | while read -r worker; do
                    echo -e "  ${GREEN}●${RST} $worker"
                done
            else
                echo -e "  ${DIM}Run 'wrangler whoami' to check authentication${RST}"
                echo -e "  ${DIM}Or use 'wrangler deploy' in a worker project${RST}"
            fi
            echo ""
            ;;
        deploy|d)
            local dir="${1:-.}"
            echo -e "${PINK}─── ${AMBER}DEPLOYING WORKER${RST} ${PINK}───${RST}"

            if [[ ! -f "$dir/wrangler.toml" ]]; then
                echo -e "  ${RED}No wrangler.toml found in $dir${RST}"
                return 1
            fi

            local name=$(grep "^name" "$dir/wrangler.toml" | cut -d'"' -f2)
            echo -e "  Worker: ${AMBER}$name${RST}"

            log_deploy "cloudflare-worker" "$name" "started"

            (cd "$dir" && wrangler deploy)

            if [[ $? -eq 0 ]]; then
                echo -e "  ${GREEN}✓${RST} Worker deployed!"
                log_deploy "cloudflare-worker" "$name" "success"
            else
                log_deploy "cloudflare-worker" "$name" "failed"
            fi
            ;;
        *)
            echo -e "${AMBER}workers${RST} - Cloudflare Workers commands"
            echo "  list        - List workers (requires API token)"
            echo "  deploy [dir] - Deploy worker from directory"
            ;;
    esac
}

# ── Railway Commands ──

cmd_railway() {
    local subcmd="${1:-status}"
    shift 2>/dev/null || true

    case "$subcmd" in
        status|s)
            echo -e "${PINK}─── ${AMBER}RAILWAY STATUS${RST} ${PINK}───${RST}"
            echo ""
            railway whoami 2>/dev/null || echo -e "  ${RED}Not authenticated. Run: railway login${RST}"
            echo ""
            railway list 2>/dev/null | head -20
            ;;
        deploy|d)
            echo -e "${PINK}─── ${AMBER}DEPLOYING TO RAILWAY${RST} ${PINK}───${RST}"
            log_deploy "railway" "$(basename "$(pwd)")" "started"

            if railway up "$@"; then
                log_deploy "railway" "$(basename "$(pwd)")" "success"
            else
                log_deploy "railway" "$(basename "$(pwd)")" "failed"
            fi
            ;;
        logs|l)
            railway logs "$@"
            ;;
        *)
            echo -e "${AMBER}railway${RST} - Railway commands"
            echo "  status      - Show Railway status and projects"
            echo "  deploy      - Deploy current directory to Railway"
            echo "  logs        - View deployment logs"
            ;;
    esac
}

# ── Quick Deploy Presets ──

cmd_quick() {
    local preset="${1:-help}"

    case "$preset" in
        landing)
            echo -e "${PINK}Deploying landing page...${RST}"
            wrangler pages deploy ~/blackroad-landing --project-name=blackroad-io
            ;;
        dashboard)
            echo -e "${PINK}Deploying dashboard...${RST}"
            wrangler pages deploy ~/blackroad-dashboard/dist --project-name=blackroad-dashboard
            ;;
        docs)
            echo -e "${PINK}Deploying docs...${RST}"
            wrangler pages deploy ~/blackroad-docs/build --project-name=blackroad-docs
            ;;
        all)
            echo -e "${PINK}─── ${AMBER}DEPLOYING ALL${RST} ${PINK}───${RST}"
            echo ""
            local targets=("landing" "dashboard" "docs")
            local i=0
            for target in "${targets[@]}"; do
                ((i++))
                echo -ne "  $(progress_bar $i ${#targets[@]}) $target"
                cmd_quick "$target" >/dev/null 2>&1 && echo -e " ${GREEN}✓${RST}" || echo -e " ${RED}✗${RST}"
            done
            echo ""
            ;;
        help|*)
            echo -e "${AMBER}Quick deploy presets:${RST}"
            echo "  landing     - Deploy blackroad.io landing page"
            echo "  dashboard   - Deploy dashboard"
            echo "  docs        - Deploy documentation"
            echo "  all         - Deploy all presets"
            ;;
    esac
}

# ── Multi-Deploy ──

cmd_multi() {
    local targets="$@"

    if [[ -z "$targets" ]]; then
        echo -e "${RED}Usage:${RST} br deploy multi <project1> <project2> ..."
        return 1
    fi

    echo -e "${PINK}─── ${AMBER}MULTI-DEPLOY${RST} ${PINK}───${RST}"
    echo ""

    local count=0
    local success=0
    local failed=0

    for project in $targets; do
        ((count++))
        echo -ne "  Deploying ${AMBER}$project${RST}... "

        if wrangler pages deploy . --project-name="$project" >/dev/null 2>&1; then
            echo -e "${GREEN}✓${RST}"
            ((success++))
            log_deploy "cloudflare-pages" "$project" "success"
        else
            echo -e "${RED}✗${RST}"
            ((failed++))
            log_deploy "cloudflare-pages" "$project" "failed"
        fi
    done

    echo ""
    echo -e "  Results: ${GREEN}$success succeeded${RST}, ${RED}$failed failed${RST}"
}

# ── History ──

cmd_history() {
    local limit="${1:-20}"

    echo -e "${PINK}─── ${AMBER}DEPLOY HISTORY${RST} ${PINK}───${RST}"
    echo ""

    if [[ ! -f "$DEPLOY_LOG" ]] || [[ ! -s "$DEPLOY_LOG" ]]; then
        echo -e "  ${DIM}No deployment history yet${RST}"
        return
    fi

    tail -n "$limit" "$DEPLOY_LOG" | while read -r line; do
        local ts=$(echo "$line" | jq -r '.timestamp' 2>/dev/null | cut -d'T' -f1,2 | tr 'T' ' ' | cut -c1-16)
        local target=$(echo "$line" | jq -r '.target' 2>/dev/null)
        local project=$(echo "$line" | jq -r '.project' 2>/dev/null)
        local status=$(echo "$line" | jq -r '.status' 2>/dev/null)

        local status_icon="${DIM}○${RST}"
        case "$status" in
            success) status_icon="${GREEN}●${RST}" ;;
            failed)  status_icon="${RED}●${RST}" ;;
            started) status_icon="${AMBER}◐${RST}" ;;
        esac

        printf "  %s %s ${DIM}%s${RST} → ${BOLD}%s${RST}\n" "$status_icon" "$ts" "$target" "$project"
    done
    echo ""
}

# ── Rollback ──

cmd_rollback() {
    local project="$1"

    if [[ -z "$project" ]]; then
        echo -e "${RED}Usage:${RST} br deploy rollback <project>"
        return 1
    fi

    echo -e "${PINK}─── ${AMBER}ROLLBACK${RST} ${PINK}───${RST}"
    echo -e "  Project: ${AMBER}$project${RST}"
    echo ""

    # List recent deployments
    echo -e "${DIM}Recent deployments:${RST}"
    wrangler pages deployment list --project-name="$project" 2>/dev/null | head -15

    echo ""
    echo -e "${AMBER}To rollback, copy a deployment ID and run:${RST}"
    echo -e "  wrangler pages deployment rollback --project-name=$project --deployment-id=<id>"
}

# ── Watch Mode ──

cmd_watch() {
    local dir="${1:-.}"
    local project="$2"

    if [[ -z "$project" ]]; then
        project=$(basename "$dir" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    fi

    echo -e "${PINK}─── ${AMBER}WATCH MODE${RST} ${PINK}───${RST}"
    echo -e "  Directory: ${PINK}$dir${RST}"
    echo -e "  Project:   ${AMBER}$project${RST}"
    echo -e "${DIM}  Press Ctrl+C to stop${RST}"
    echo ""

    # Use fswatch if available, otherwise poll
    if command -v fswatch &>/dev/null; then
        fswatch -o "$dir" | while read -r; do
            echo -e "  ${PINK}Change detected...${RST}"
            wrangler pages deploy "$dir" --project-name="$project" >/dev/null 2>&1 \
                && echo -e "  ${GREEN}✓${RST} Deployed $(date +%H:%M:%S)" \
                || echo -e "  ${RED}✗${RST} Deploy failed"
        done
    else
        echo -e "${DIM}  (Install fswatch for better file watching: brew install fswatch)${RST}"
        echo -e "${DIM}  Using poll mode (10s interval)${RST}"
        echo ""

        local last_hash=""
        while true; do
            local current_hash=$(find "$dir" -type f -name "*.html" -o -name "*.js" -o -name "*.css" 2>/dev/null | xargs md5 2>/dev/null | md5)

            if [[ "$current_hash" != "$last_hash" && -n "$last_hash" ]]; then
                echo -e "  ${PINK}Change detected...${RST}"
                wrangler pages deploy "$dir" --project-name="$project" >/dev/null 2>&1 \
                    && echo -e "  ${GREEN}✓${RST} Deployed $(date +%H:%M:%S)" \
                    || echo -e "  ${RED}✗${RST} Deploy failed"
            fi

            last_hash="$current_hash"
            sleep 10
        done
    fi
}

# ── Init/Create ──

cmd_init() {
    local name="${1:-my-project}"
    local template="${2:-basic}"

    echo -e "${PINK}─── ${AMBER}INIT PROJECT${RST} ${PINK}───${RST}"
    echo -e "  Name:     ${AMBER}$name${RST}"
    echo -e "  Template: ${PINK}$template${RST}"
    echo ""

    mkdir -p "$name"

    # Create basic HTML
    cat > "$name/index.html" << 'HTMLEND'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlackRoad Project</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'SF Mono', 'Monaco', monospace;
            background: #000;
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 {
            background: linear-gradient(135deg, #F5A623, #FF1D6C, #9C27B0, #2979FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p { color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <h1>BlackRoad OS</h1>
        <p>Ready to deploy</p>
    </div>
</body>
</html>
HTMLEND

    echo -e "  ${GREEN}✓${RST} Created $name/index.html"
    echo ""
    echo -e "Deploy with: ${PINK}br deploy pages deploy $name${RST}"
}

# ── Help ──

cmd_help() {
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════════════╗${RST}"
    echo -e "${PINK}║${RST}  ${AMBER}🚀 BLACKROAD DEPLOY${RST}                                                 ${PINK}║${RST}"
    echo -e "${PINK}║${RST}  ${DIM}Unified deployment to Cloudflare, Railway, and more${RST}                ${PINK}║${RST}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════════════╝${RST}"
    echo ""
    echo -e "  ${BOLD}${BLUE}CLOUDFLARE${RST}"
    echo -e "    ${GREEN}pages${RST} [cmd]     Cloudflare Pages (list/deploy/create)"
    echo -e "    ${GREEN}workers${RST} [cmd]   Cloudflare Workers (list/deploy)"
    echo ""
    echo -e "  ${BOLD}${PINK}RAILWAY${RST}"
    echo -e "    ${GREEN}railway${RST} [cmd]   Railway (status/deploy/logs)"
    echo ""
    echo -e "  ${BOLD}${VIOLET}QUICK${RST}"
    echo -e "    ${GREEN}quick${RST} <preset>  Quick deploy (landing/dashboard/docs/all)"
    echo -e "    ${GREEN}multi${RST} <p1> ...  Deploy to multiple projects"
    echo -e "    ${GREEN}watch${RST} <dir>     Watch & auto-deploy on changes"
    echo ""
    echo -e "  ${BOLD}${AMBER}MANAGE${RST}"
    echo -e "    ${GREEN}status${RST}          Show deployment status"
    echo -e "    ${GREEN}history${RST} [n]     Show deploy history (default: 20)"
    echo -e "    ${GREEN}rollback${RST} <p>    Rollback a Pages project"
    echo -e "    ${GREEN}init${RST} <name>     Create new project from template"
    echo ""
}

# ── Main ──

case "${1:-help}" in
    # Cloudflare
    pages|p)         shift; cmd_pages "$@" ;;
    workers|w)       shift; cmd_workers "$@" ;;

    # Railway
    railway|r)       shift; cmd_railway "$@" ;;

    # Quick
    quick|q)         shift; cmd_quick "$@" ;;
    multi|m)         shift; cmd_multi "$@" ;;
    watch)           shift; cmd_watch "$@" ;;

    # Manage
    status|s)        cmd_status ;;
    history|h)       shift; cmd_history "$@" ;;
    rollback)        shift; cmd_rollback "$@" ;;
    init|new)        shift; cmd_init "$@" ;;

    help|--help)     cmd_help ;;

    # Default: treat first arg as Pages deploy
    *)
        if [[ -d "$1" ]]; then
            cmd_pages deploy "$1" "$2"
        else
            cmd_help
        fi
        ;;
esac
