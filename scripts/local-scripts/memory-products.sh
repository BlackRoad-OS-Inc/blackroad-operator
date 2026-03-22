#!/bin/bash
# BlackRoad Products System
# Track all products, services, and deployable assets across the BlackRoad ecosystem
# Usage: memory-products.sh <command> [args]

set -e

# ── Configuration ──────────────────────────────────────────────
MEMORY_DIR="$HOME/.blackroad/memory"
PRODUCTS_DIR="$MEMORY_DIR/products"
PRODUCTS_DB="$PRODUCTS_DIR/products.db"
VERSION="1.0.0"

# ── Colors ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
PINK='\033[38;5;205m'
BOLD='\033[1m'
NC='\033[0m'

# ── Helpers ────────────────────────────────────────────────────
sql() { sqlite3 "$PRODUCTS_DB" "$@"; }
esc() { echo "$1" | sed "s/'/''/g"; }
now() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

# ── Initialize ─────────────────────────────────────────────────
init() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Products System v${VERSION}${NC}                       ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    mkdir -p "$PRODUCTS_DIR"

    sqlite3 "$PRODUCTS_DB" <<'SCHEMA'
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tier TEXT DEFAULT 'core',
    category TEXT DEFAULT 'platform',
    status TEXT DEFAULT 'planned',
    domain TEXT DEFAULT '',
    subdomain TEXT DEFAULT '',
    org TEXT DEFAULT '',
    repo TEXT DEFAULT '',
    stack TEXT DEFAULT '',
    pricing_model TEXT DEFAULT 'free',
    pricing_details TEXT DEFAULT '',
    deploy_target TEXT DEFAULT '',
    deploy_status TEXT DEFAULT 'not-deployed',
    pi_node TEXT DEFAULT '',
    worker_name TEXT DEFAULT '',
    port INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 50,
    revenue_potential TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT DEFAULT 'system'
);

CREATE TABLE IF NOT EXISTS product_deps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    depends_on TEXT NOT NULL,
    dep_type TEXT DEFAULT 'requires',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (depends_on) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    subdomain TEXT DEFAULT '',
    dns_status TEXT DEFAULT 'pending',
    tls_status TEXT DEFAULT 'pending',
    deploy_status TEXT DEFAULT 'not-deployed',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    milestone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    target_date TEXT DEFAULT '',
    completed_at TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_revenue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    source TEXT DEFAULT '',
    period TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
    name,
    tagline,
    description,
    category,
    stack,
    domain
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_org ON products(org);
CREATE INDEX IF NOT EXISTS idx_products_priority ON products(priority);
CREATE INDEX IF NOT EXISTS idx_products_deploy ON products(deploy_status);
SCHEMA

    echo -e "${GREEN}  ✅ Products database initialized${NC}"
    echo -e "${CYAN}  📊 Location: $PRODUCTS_DB${NC}"
    echo
}

# ── Add Product ────────────────────────────────────────────────
add_product() {
    local id="$1" name="$2" tier="$3" category="$4" status="$5"
    local domain="$6" org="$7" repo="$8" tagline="$9"

    if [[ -z "$id" || -z "$name" ]]; then
        echo -e "${RED}Usage: memory-products.sh add <id> <name> <tier> <category> <status> <domain> <org> <repo> [tagline]${NC}"
        return 1
    fi

    local esc_name=$(esc "$name")
    local esc_tagline=$(esc "$tagline")

    sql "INSERT OR REPLACE INTO products (id, name, tier, category, status, domain, org, repo, tagline, updated_at)
         VALUES ('$id', '$esc_name', '${tier:-core}', '${category:-platform}', '${status:-planned}',
                 '${domain:-}', '${org:-}', '${repo:-}', '$esc_tagline', '$(now)');"

    # Update FTS
    sql "DELETE FROM products_fts WHERE rowid IN (SELECT rowid FROM products WHERE id='$id');" 2>/dev/null || true
    sql "INSERT INTO products_fts (rowid, name, tagline, description, category, stack, domain)
         SELECT rowid, name, tagline, description, category, stack, domain FROM products WHERE id='$id';"

    echo -e "${GREEN}  ✅ Product added: ${BOLD}$name${NC} ${CYAN}[$id]${NC}"
}

# ── List Products ──────────────────────────────────────────────
list_products() {
    local filter="$1"
    local where=""

    case "$filter" in
        tier:*)   where="WHERE tier='${filter#tier:}'" ;;
        status:*) where="WHERE status='${filter#status:}'" ;;
        org:*)    where="WHERE org='${filter#org:}'" ;;
        cat:*)    where="WHERE category='${filter#cat:}'" ;;
        deploy:*) where="WHERE deploy_status='${filter#deploy:}'" ;;
        domain:*) where="WHERE domain='${filter#domain:}'" ;;
        *)        where="" ;;
    esac

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Products Registry${NC}                             ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    local count=$(sql "SELECT COUNT(*) FROM products $where;")
    echo -e "${CYAN}  Total: ${BOLD}$count products${NC}"
    echo

    # Group by tier
    local tiers=$(sql "SELECT DISTINCT tier FROM products $where ORDER BY
        CASE tier
            WHEN 'core' THEN 1
            WHEN 'creator' THEN 2
            WHEN 'social' THEN 3
            WHEN 'education' THEN 4
            WHEN 'finance' THEN 5
            WHEN 'infra' THEN 6
            WHEN 'ai' THEN 7
            WHEN 'metaverse' THEN 8
            WHEN 'enterprise' THEN 9
            WHEN 'specialized' THEN 10
            ELSE 99 END;")

    while IFS= read -r tier; do
        [[ -z "$tier" ]] && continue
        local tier_upper=$(echo "$tier" | tr '[:lower:]' '[:upper:]')
        echo -e "${PURPLE}  ━━━ ${BOLD}TIER: $tier_upper${NC} ${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        sql -separator '|' "SELECT id, name, status, domain, deploy_status, org FROM products
             WHERE tier='$tier' $(echo "$where" | sed 's/WHERE/AND/')
             ORDER BY priority ASC, name ASC;" | while IFS='|' read -r pid pname pstatus pdomain pdeploy porg; do

            local status_icon
            case "$pstatus" in
                live)     status_icon="${GREEN}●${NC}" ;;
                building) status_icon="${YELLOW}◐${NC}" ;;
                planned)  status_icon="${BLUE}○${NC}" ;;
                blocked)  status_icon="${RED}✗${NC}" ;;
                *)        status_icon="${CYAN}◌${NC}" ;;
            esac

            local deploy_icon
            case "$pdeploy" in
                deployed)     deploy_icon="${GREEN}▲${NC}" ;;
                partial)      deploy_icon="${YELLOW}△${NC}" ;;
                not-deployed) deploy_icon="${RED}▽${NC}" ;;
                *)            deploy_icon="·" ;;
            esac

            printf "  ${status_icon} %-22s ${deploy_icon} %-28s ${CYAN}%-18s${NC}\n" \
                "$pname" "${pdomain:---}" "${porg:---}"
        done
        echo
    done <<< "$tiers"

    echo -e "${CYAN}  Legend: ${GREEN}● live${NC}  ${YELLOW}◐ building${NC}  ${BLUE}○ planned${NC}  ${RED}✗ blocked${NC}  |  ${GREEN}▲ deployed${NC}  ${YELLOW}△ partial${NC}  ${RED}▽ not deployed${NC}"
}

# ── Search Products ────────────────────────────────────────────
search_products() {
    local query="$1"
    if [[ -z "$query" ]]; then
        echo -e "${RED}Usage: memory-products.sh search <query>${NC}"
        return 1
    fi

    echo -e "${PINK}  🔍 Searching products for: ${BOLD}$query${NC}"
    echo

    sql -separator '|' "SELECT p.id, p.name, p.tier, p.status, p.domain, p.org
         FROM products p
         JOIN products_fts f ON p.rowid = f.rowid
         WHERE products_fts MATCH '$(esc "$query")'
         ORDER BY rank
         LIMIT 20;" | while IFS='|' read -r pid pname ptier pstatus pdomain porg; do
        echo -e "  ${GREEN}●${NC} ${BOLD}$pname${NC} [${CYAN}$pid${NC}]"
        echo -e "    Tier: $ptier | Status: $pstatus | Domain: ${pdomain:---} | Org: ${porg:---}"
    done
}

# ── Show Product Detail ───────────────────────────────────────
show_product() {
    local id="$1"
    if [[ -z "$id" ]]; then
        echo -e "${RED}Usage: memory-products.sh show <product-id>${NC}"
        return 1
    fi

    local data=$(sql -separator '|' "SELECT * FROM products WHERE id='$id';")
    if [[ -z "$data" ]]; then
        echo -e "${RED}  Product not found: $id${NC}"
        return 1
    fi

    IFS='|' read -r pid pname ptagline pdesc ptier pcat pstatus pdomain psub porg prepo \
        pstack ppricing ppdetails pdtarget pddeploy ppi pworker pport pprio prev pcreated pupdated pcby <<< "$data"

    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}$pname${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
    [[ -n "$ptagline" ]] && echo -e "  ${CYAN}\"$ptagline\"${NC}"
    echo
    echo -e "  ${BOLD}ID:${NC}            $pid"
    echo -e "  ${BOLD}Tier:${NC}          $ptier"
    echo -e "  ${BOLD}Category:${NC}      $pcat"
    echo -e "  ${BOLD}Status:${NC}        $pstatus"
    echo -e "  ${BOLD}Priority:${NC}      $pprio"
    echo -e "  ${BOLD}Domain:${NC}        ${pdomain:---}"
    echo -e "  ${BOLD}Subdomain:${NC}     ${psub:---}"
    echo -e "  ${BOLD}Org:${NC}           ${porg:---}"
    echo -e "  ${BOLD}Repo:${NC}          ${prepo:---}"
    echo -e "  ${BOLD}Stack:${NC}         ${pstack:---}"
    echo -e "  ${BOLD}Pricing:${NC}       ${ppricing:---}"
    echo -e "  ${BOLD}Deploy Target:${NC} ${pdtarget:---}"
    echo -e "  ${BOLD}Deploy Status:${NC} ${pddeploy:---}"
    echo -e "  ${BOLD}Pi Node:${NC}       ${ppi:---}"
    echo -e "  ${BOLD}Worker:${NC}        ${pworker:---}"
    echo -e "  ${BOLD}Port:${NC}          ${pport:-0}"
    echo -e "  ${BOLD}Revenue:${NC}       ${prev:---}"
    echo

    # Dependencies
    local deps=$(sql "SELECT depends_on, dep_type FROM product_deps WHERE product_id='$id';")
    if [[ -n "$deps" ]]; then
        echo -e "  ${BOLD}Dependencies:${NC}"
        echo "$deps" | while IFS='|' read -r dep dtype; do
            echo -e "    → $dep ($dtype)"
        done
        echo
    fi

    # Milestones
    local milestones=$(sql -separator '|' "SELECT milestone, status, target_date FROM product_milestones WHERE product_id='$id' ORDER BY target_date;")
    if [[ -n "$milestones" ]]; then
        echo -e "  ${BOLD}Milestones:${NC}"
        echo "$milestones" | while IFS='|' read -r ms mstatus mdate; do
            local icon="○"
            [[ "$mstatus" == "done" ]] && icon="${GREEN}●${NC}"
            echo -e "    $icon $ms ${CYAN}($mdate)${NC}"
        done
    fi
}

# ── Update Product ─────────────────────────────────────────────
update_product() {
    local id="$1" field="$2" value="$3"
    if [[ -z "$id" || -z "$field" || -z "$value" ]]; then
        echo -e "${RED}Usage: memory-products.sh update <id> <field> <value>${NC}"
        echo -e "${CYAN}Fields: status, tier, domain, org, repo, stack, pricing_model, deploy_target, deploy_status, pi_node, worker_name, port, priority, revenue_potential, tagline, description${NC}"
        return 1
    fi

    local allowed="status tier category domain subdomain org repo stack pricing_model pricing_details deploy_target deploy_status pi_node worker_name port priority revenue_potential tagline description"
    if ! echo "$allowed" | grep -qw "$field"; then
        echo -e "${RED}  Invalid field: $field${NC}"
        return 1
    fi

    sql "UPDATE products SET $field='$(esc "$value")', updated_at='$(now)' WHERE id='$id';"
    echo -e "${GREEN}  ✅ Updated ${BOLD}$id${NC}.${field} = $value"
}

# ── Add Dependency ─────────────────────────────────────────────
add_dep() {
    local product="$1" depends_on="$2" dep_type="${3:-requires}"
    sql "INSERT INTO product_deps (product_id, depends_on, dep_type) VALUES ('$product', '$depends_on', '$dep_type');"
    echo -e "${GREEN}  ✅ $product → $depends_on ($dep_type)${NC}"
}

# ── Add Milestone ──────────────────────────────────────────────
add_milestone() {
    local product="$1" milestone="$2" target_date="$3"
    sql "INSERT INTO product_milestones (product_id, milestone, target_date)
         VALUES ('$product', '$(esc "$milestone")', '${target_date:-}');"
    echo -e "${GREEN}  ✅ Milestone added to $product: $milestone${NC}"
}

# ── Stats Dashboard ────────────────────────────────────────────
stats() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}BlackRoad Products Dashboard${NC}                            ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    local total=$(sql "SELECT COUNT(*) FROM products;")
    local live=$(sql "SELECT COUNT(*) FROM products WHERE status='live';")
    local building=$(sql "SELECT COUNT(*) FROM products WHERE status='building';")
    local planned=$(sql "SELECT COUNT(*) FROM products WHERE status='planned';")
    local deployed=$(sql "SELECT COUNT(*) FROM products WHERE deploy_status='deployed';")

    echo -e "  ${BOLD}Total Products:${NC}  $total"
    echo -e "  ${GREEN}Live:${NC}            $live"
    echo -e "  ${YELLOW}Building:${NC}        $building"
    echo -e "  ${BLUE}Planned:${NC}         $planned"
    echo -e "  ${GREEN}Deployed:${NC}        $deployed"
    echo

    echo -e "  ${BOLD}By Tier:${NC}"
    sql "SELECT tier, COUNT(*) as c FROM products GROUP BY tier ORDER BY c DESC;" | while IFS='|' read -r tier count; do
        printf "    %-15s %s\n" "$tier" "$count"
    done
    echo

    echo -e "  ${BOLD}By Organization:${NC}"
    sql "SELECT org, COUNT(*) as c FROM products WHERE org != '' GROUP BY org ORDER BY c DESC;" | while IFS='|' read -r org count; do
        printf "    %-30s %s\n" "$org" "$count"
    done
    echo

    echo -e "  ${BOLD}By Domain:${NC}"
    sql "SELECT domain, COUNT(*) as c FROM products WHERE domain != '' GROUP BY domain ORDER BY c DESC;" | while IFS='|' read -r domain count; do
        printf "    %-30s %s\n" "$domain" "$count"
    done
    echo

    echo -e "  ${BOLD}Revenue Products (with pricing):${NC}"
    sql -separator '|' "SELECT name, pricing_model, pricing_details FROM products WHERE pricing_model != 'free' AND pricing_model != '' ORDER BY name;" | while IFS='|' read -r name model details; do
        echo -e "    ${GREEN}$${NC} $name — $model ${CYAN}$details${NC}"
    done
}

# ── Domain Map ─────────────────────────────────────────────────
domain_map() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Domain → Product Mapping${NC}                                ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    sql -separator '|' "SELECT domain, GROUP_CONCAT(name, ', ') FROM products WHERE domain != '' GROUP BY domain ORDER BY domain;" | while IFS='|' read -r domain products; do
        echo -e "  ${CYAN}$domain${NC}"
        echo -e "    → $products"
    done
}

# ── Org Map ────────────────────────────────────────────────────
org_map() {
    echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PINK}║${NC}  ${BOLD}Organization → Product Mapping${NC}                          ${PINK}║${NC}"
    echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    sql -separator '|' "SELECT org, GROUP_CONCAT(name, ', ') FROM products WHERE org != '' GROUP BY org ORDER BY org;" | while IFS='|' read -r org products; do
        echo -e "  ${CYAN}$org${NC}"
        echo -e "    → $products"
    done
}

# ── Export JSON ────────────────────────────────────────────────
export_json() {
    sql -json "SELECT * FROM products ORDER BY tier, priority, name;"
}

# ── Seed All Products ──────────────────────────────────────────
seed() {
    echo -e "${PINK}  🌱 Seeding BlackRoad Products Database...${NC}"
    echo

    # ── TIER 1: CORE PLATFORM ──────────────────────────────────
    add_product "blackroad-os" "BlackRoad OS" "core" "platform" "live" "blackroad.io" "BlackRoad-OS-Inc" "blackroad-os-core" "Browser-based operating system — window-in-a-window paradigm"
    add_product "lucidia" "Lucidia" "core" "ai" "building" "lucidia.earth" "BlackRoad-OS-Inc" "lucidia" "AI consciousness orchestrating the ecosystem"
    add_product "lucidia-studio" "Lucidia Studio" "core" "ai" "live" "lucidia.studio" "BlackRoad-OS-Inc" "lucidia-platform" "Creator tools powered by Lucidia AI"
    add_product "pitstop" "PitStop" "core" "infra" "live" "blackroad.systems" "BlackRoad-OS-Inc" "blackroad-pitstop" "Infrastructure dashboard and service portal"
    add_product "prism-console" "Prism Console" "core" "admin" "live" "" "BlackRoad-OS-Inc" "blackroad-prism-console" "Operations dashboard — fleet, agents, KPIs"
    add_product "prism-enterprise" "Prism Enterprise" "core" "enterprise" "building" "" "BlackRoad-OS-Inc" "blackroad-os-prism-enterprise" "Full ERP/CRM — ISI analysis, sales ops, PLM, CPQ"

    # ── TIER 2: CREATOR STUDIO ─────────────────────────────────
    add_product "canvas-studio" "Canvas Studio" "creator" "design" "building" "" "BlackRoad-Studio" "canvas-studio" "Design tool for graphics, presentations, social media"
    add_product "video-studio" "Video Studio" "creator" "video" "building" "" "BlackRoad-Studio" "video-studio" "Video editor — timeline, AI captions, effects"
    add_product "writing-studio" "Writing Studio" "creator" "writing" "building" "" "BlackRoad-Studio" "writing-studio" "AI-powered content creation"
    add_product "roadview" "RoadView Studio" "creator" "video" "planned" "" "BlackRoad-Media" "content" "AI video creation — NL editing, auto b-roll"
    add_product "cadence" "Cadence" "creator" "music" "planned" "" "BlackRoad-Interactive" "blackroad-audio-engine" "Describe-to-music creation"
    add_product "genesis-road" "Genesis Road" "creator" "gaming" "planned" "" "BlackRoad-OS" "genesis-road" "Voice-controlled game engine"
    add_product "roadtube" "RoadTube" "creator" "video-platform" "planned" "" "BlackRoad-Media" "blackroad-streaming-hub" "Creator video platform — 90% rev share"

    # ── TIER 3: SOCIAL & COMMUNICATION ─────────────────────────
    add_product "backroad" "BackRoad" "social" "social" "building" "" "BlackRoad-Media" "backroad-social" "Anti-social network — depth over engagement"
    add_product "roadchat" "RoadChat" "social" "messaging" "live" "" "BlackRoad-OS-Inc" "blackroad-chat" "AI-powered sovereign chat"
    add_product "roundtrip" "RoundTrip" "social" "messaging" "live" "" "BlackRoad-OS-Inc" "roundtrip" "35-agent chat hub — D1 + WebSocket"
    add_product "blackcast" "BlackCast" "social" "streaming" "planned" "" "BlackRoad-Media" "blackroad-streaming-hub" "Broadcasting and simulcast"
    add_product "roadwave" "RoadWave" "social" "audio" "planned" "" "BlackRoad-Media" "blackroad-podcast-platform" "Podcast and audio portal"
    add_product "tv-road" "TV Road" "social" "streaming" "planned" "" "BlackRoad-Media" "blackroad-streaming-hub" "Television and long-form media"
    add_product "blackstream" "BlackStream" "social" "streaming" "building" "" "BlackRoad-OS-Inc" "BlackStream" "Streaming content aggregation — 5 microservices"

    # ── TIER 4: EDUCATION ──────────────────────────────────────
    add_product "roadwork" "RoadWork" "education" "tutoring" "building" "" "BlackRoad-Education" "roadwork-platform" "Learn-then-earn — AI tutoring platform"
    add_product "roadie" "Roadie" "education" "tutoring" "planned" "" "BlackRoad-Education" "tutorials" "Teach-back tutoring agent"
    add_product "radius" "Radius" "education" "stem" "planned" "" "BlackRoad-Labs" "experiments" "Science, math, quantum simulations"
    add_product "learning-lab" "Learning Lab" "education" "personalized" "planned" "" "BlackRoad-Education" "courses" "Content generated in YOUR metaphors"
    add_product "roadbook" "RoadBook" "education" "knowledge" "planned" "" "BlackRoad-Education" "courses" "AI-powered searchable knowledge graph"
    add_product "quiz-platform" "Quiz Platform" "education" "assessment" "building" "" "BlackRoad-Education" "blackroad-quiz-platform" "Adaptive quizzes with spaced repetition"
    add_product "code-challenge" "Code Challenge" "education" "coding" "building" "" "BlackRoad-Education" "blackroad-code-challenge" "Coding challenge platform with test runner"

    # ── TIER 5: FINANCE & BLOCKCHAIN ───────────────────────────
    add_product "roadcoin" "RoadCoin" "finance" "crypto" "building" "roadcoin.io" "BlackRoad-Gov" "roadcoin-token" "Creator payment system — tips, subscriptions"
    add_product "roadchain" "RoadChain" "finance" "blockchain" "building" "roadchain.io" "BlackRoad-OS-Inc" "roadchain" "Layer-1 blockchain — secp256k1, SHA-256 PoW"
    add_product "tollbooth" "Tollbooth" "finance" "payments" "live" "" "BlackRoad-OS-Inc" "tollbooth" "Payments gateway — Stripe integration"
    add_product "roadpay" "RoadPay" "finance" "billing" "live" "" "BlackRoad-OS-Inc" "roadpay" "Billing — D1 subscriptions, plans, invoices"

    # ── TIER 6: INFRASTRUCTURE & DEVOPS ────────────────────────
    add_product "roadcode" "RoadCode" "infra" "workspace" "live" "" "BlackRoad-OS-Inc" "RoadCode" "Canonical workspace and automation hub"
    add_product "road-deploy" "Road Deploy" "infra" "paas" "live" "" "BlackRoad-OS-Inc" "road-deploy" "Self-hosted PaaS — own Railway/Heroku"
    add_product "road-search" "RoadSearch" "infra" "search" "live" "" "BlackRoad-OS-Inc" "road-search" "FTS5 search engine with AI answers"
    add_product "fleet-heartbeat" "Fleet Heartbeat" "infra" "monitoring" "live" "" "BlackRoad-OS-Inc" "fleet-heartbeat" "Real-time health monitoring dashboard"
    add_product "greenlight" "GreenLight" "infra" "approvals" "planned" "" "BlackRoad-OS" "blackroad-cicd-pipeline" "Approval and CI gate workflows"
    add_product "roadrunner" "RoadRunner" "infra" "cicd" "building" "" "BlackRoad-OS" "blackroad-cicd-pipeline" "CI/CD pipeline engine"
    add_product "roadmap" "RoadMap" "infra" "project-mgmt" "planned" "" "BlackRoad-Foundation" "blackroad-project-management" "AI-assisted project planning"
    add_product "roadflow" "RoadFlow" "infra" "data-pipeline" "planned" "" "BlackRoad-Labs" "blackroad-data-pipeline" "ETL data pipeline framework"
    add_product "roadloop" "RoadLoop" "infra" "automation" "planned" "" "Blackbox-Enterprises" "blackbox-n8n" "Workflow automation — n8n fork"
    add_product "garage" "Garage" "infra" "sandbox" "planned" "" "BlackRoad-OS-Inc" "blackroad" "Dev sandbox environment"
    add_product "roadblock" "Roadblock" "infra" "security" "planned" "" "BlackRoad-Security" "blackroad-access-control" "Access control and rate limiting"
    add_product "roadsync" "RoadSync" "infra" "sync" "planned" "" "BlackRoad-Cloud" "cloud-gateway" "Cross-device sync"
    add_product "app-store" "App Store" "infra" "marketplace" "building" "" "BlackRoad-OS-Inc" "blackroad-app-store" "Zero-commission PWA marketplace — 50 apps"
    add_product "context-bridge" "Context Bridge" "infra" "memory" "building" "" "BlackRoad-OS-Inc" "context-bridge" "Persistent memory layer for AI assistants"
    add_product "ai-chain" "AI Chain" "infra" "ai-infra" "building" "" "BlackRoad-OS-Inc" "ai-chain" "Distributed multi-node LLM inference"

    # ── TIER 7: ADVANCED AI ────────────────────────────────────
    add_product "black-mode" "Black Mode" "ai" "automation" "planned" "" "BlackRoad-AI" "blackroad-ai-platform" "Autonomous AI operations portal"
    add_product "meridian" "Meridian" "ai" "architecture" "planned" "" "BlackRoad-AI" "lucidia-ai-models" "AI architecture — agent design, capability mapping"
    add_product "roadmind" "RoadMind" "ai" "reasoning" "planned" "" "BlackRoad-Labs" "experiments" "Trinary logic reasoning engine"
    add_product "roadcode-compute" "RoadCode Compute" "ai" "gpu" "planned" "" "BlackRoad-Cloud" "k8s-operators" "GPU compute orchestration"
    add_product "codex-infinity" "Codex Infinity" "ai" "ide" "building" "" "BlackRoad-OS-Inc" "blackroad-code" "AI IDE — 50+ languages, AI debugging"
    add_product "cece" "CECE" "ai" "companion" "building" "" "BlackRoad-OS-Inc" "cece-revival" "Conversational AI with persistent memory"
    add_product "hailo-vision" "Hailo Vision" "ai" "vision" "building" "" "BlackRoad-OS-Inc" "hailo-vision" "Real-time computer vision on Hailo-8"
    add_product "lucidia-math" "Lucidia Math" "ai" "math" "building" "" "BlackRoad-OS" "lucidia-math" "Consciousness modeling, unified geometry, quantum finance"
    add_product "remember" "Remember" "ai" "memory" "building" "" "BlackRoad-OS-Inc" "remember" "AI persistent memory with vector search"

    # ── TIER 8: METAVERSE & GAMING ─────────────────────────────
    add_product "roadworld" "RoadWorld" "metaverse" "world" "building" "" "BlackRoad-OS" "blackroad-os-roadworld" "Living metaverse — 1000 agents with identities"
    add_product "pixel-hq" "Pixel HQ" "metaverse" "office" "live" "" "BlackRoad-OS-Inc" "bit-office" "Pixel art AI office — 14 floors, 50 assets"
    add_product "game-engine" "Game Engine" "metaverse" "engine" "building" "" "BlackRoad-Interactive" "blackroad-game-engine" "ECS game engine with ASCII renderer"
    add_product "physics-engine" "Physics Engine" "metaverse" "engine" "building" "" "BlackRoad-Interactive" "blackroad-physics-engine" "2D rigid body physics"
    add_product "3d-renderer" "3D Renderer" "metaverse" "engine" "building" "" "BlackRoad-Interactive" "blackroad-3d-renderer" "3D wireframe renderer with matrix math"
    add_product "metaverse" "Metaverse Core" "metaverse" "platform" "building" "" "BlackRoad-OS-Inc" "metaverse" "858 extracted parts across 26 engines"

    # ── TIER 9: BUSINESS & ENTERPRISE ──────────────────────────
    add_product "investor-portal" "Investor Portal" "enterprise" "finance" "planned" "blackroadinc.us" "BlackRoad-OS-Inc" "Company" "Data room, metrics, LP access"
    add_product "legal-portal" "Legal Portal" "enterprise" "legal" "planned" "" "BlackRoad-Gov" "compliance-framework" "Corporate compliance and contracts"
    add_product "careers-portal" "Careers Portal" "enterprise" "hr" "planned" "" "BlackRoad-Foundation" "blackroad-hr-system" "Hiring and agent-assisted screening"
    add_product "ventures-portal" "Ventures Portal" "enterprise" "business" "planned" "" "BlackRoad-Ventures" "portfolio" "Deal flow and portfolio management"
    add_product "roadauth" "RoadAuth" "enterprise" "iam" "live" "" "BlackRoad-OS" "roadauth" "Enterprise IAM — JWT, MFA, OAuth2, LDAP, SAML"
    add_product "crm" "BlackRoad CRM" "enterprise" "crm" "building" "" "BlackRoad-Foundation" "blackroad-crm" "Customer relationship management"
    add_product "salesforce-hub" "Salesforce Hub" "enterprise" "crm" "building" "" "BlackRoad-OS" "blackroad-salesforce-hub" "Meta-CRM, Financial Advisor CRM"
    add_product "roadmarket" "RoadMarket" "enterprise" "marketplace" "building" "" "BlackRoad-OS" "roadmarket" "Marketplace platform"

    # ── TIER 10: SPECIALIZED ───────────────────────────────────
    add_product "compass" "Compass" "specialized" "analytics" "planned" "" "BlackRoad-Labs" "blackroad-ab-testing-lab" "Analytics and insights dashboard"
    add_product "trailhead" "Trailhead" "specialized" "docs" "planned" "" "BlackRoad-OS" "blackroad-os-hub" "Documentation portal"
    add_product "beacon" "Beacon" "specialized" "iot" "building" "" "BlackRoad-Hardware" "blackroad-iot-gateway" "IoT/hardware mesh"
    add_product "roadlang" "RoadLang" "specialized" "translation" "planned" "" "BlackRoad-AI" "lucidia-ai-models" "Translation — 80+ languages"
    add_product "roadc" "RoadC" "specialized" "language" "building" "" "BlackRoad-OS-Inc" "roadc" "Custom programming language — C99 compiler"
    add_product "roadc-playground" "RoadC Playground" "specialized" "language" "building" "" "BlackRoad-OS-Inc" "roadc-playground" "Interactive web REPL for RoadC"
    add_product "roadpad" "RoadPad" "specialized" "editor" "building" "" "BlackRoad-OS" "roadpad" "Terminal-native plain-text editor"
    add_product "blackroad-sdk" "BlackRoad SDK" "specialized" "sdk" "building" "" "BlackRoad-OS-Inc" "blackroad-sdk" "TypeScript SDK — @blackroad/sdk"
    add_product "blackroad-cli" "BlackRoad CLI" "specialized" "cli" "building" "" "BlackRoad-OS-Inc" "blackroad-cli" "@blackroad/cli — the command line"
    add_product "newsletter" "Newsletter Engine" "specialized" "email" "building" "" "BlackRoad-Media" "blackroad-newsletter-engine" "Email newsletter creation and scheduling"
    add_product "podcast-platform" "Podcast Platform" "specialized" "audio" "building" "" "BlackRoad-Media" "blackroad-podcast-platform" "Podcast management — RSS, OPML, stats"

    # ── SOVEREIGN ROAD FLEET (Forkies) ─────────────────────────
    add_product "fork-roadcode" "RoadCode (Gitea)" "infra" "git" "live" "" "BlackRoad-OS-Inc" "gitea-ai-platform" "Sovereign Git platform — 239 repos"
    add_product "fork-tollbooth" "TollBooth (WireGuard)" "infra" "vpn" "live" "" "BlackRoad-OS-Inc" "tollbooth" "Sovereign VPN mesh"
    add_product "fork-pitstop" "PitStop (Pi-hole)" "infra" "dns" "live" "" "BlackRoad-OS-Inc" "pitstop" "Sovereign DNS filtering"
    add_product "fork-passenger" "Passenger (Ollama)" "infra" "ai-inference" "live" "" "BlackRoad-OS-Inc" "passenger" "Sovereign AI inference"
    add_product "fork-oneway" "OneWay (Caddy)" "infra" "proxy" "live" "" "BlackRoad-OS-Inc" "oneway" "Sovereign TLS edge proxy"
    add_product "fork-rearview" "RearView (Qdrant)" "infra" "vectors" "live" "" "BlackRoad-OS-Inc" "rearview" "Sovereign vector database"
    add_product "fork-curb" "Curb (MinIO)" "infra" "storage" "live" "" "BlackRoad-OS-Inc" "curb" "Sovereign object storage"
    add_product "fork-roundabout" "RoundAbout (Headscale)" "infra" "vpn" "live" "" "BlackRoad-OS-Inc" "roundabout" "Sovereign VPN control server"
    add_product "fork-carpool" "CarPool (NATS)" "infra" "messaging" "live" "" "BlackRoad-OS-Inc" "carpool" "Sovereign message bus"
    add_product "fork-overpass" "OverPass (n8n)" "infra" "automation" "live" "" "BlackRoad-OS-Inc" "overpass" "Sovereign workflow automation"
    add_product "fork-backroad" "BackRoad (Portainer)" "infra" "containers" "live" "" "BlackRoad-OS-Inc" "backroad" "Sovereign container management"
    add_product "fork-guardrail" "GuardRail" "infra" "security" "live" "" "BlackRoad-OS-Inc" "guardrail" "Sovereign security guardrails"

    # Set pricing on revenue products
    update_product "blackroad-os" "pricing_model" "subscription"
    update_product "blackroad-os" "pricing_details" "Solo \$300/mo | Team \$1000/mo | Enterprise \$5000/mo"
    update_product "lucidia" "pricing_model" "credits"
    update_product "lucidia" "pricing_details" "Free 100/day | \$20/mo unlimited"
    update_product "roadwork" "pricing_model" "subscription"
    update_product "roadwork" "pricing_details" "\$9.99-19.99/mo individual | \$3-8/student institutional"
    update_product "roadtube" "pricing_model" "rev-share"
    update_product "roadtube" "pricing_details" "90%+ creator rev share"
    update_product "roadcoin" "pricing_model" "transaction"
    update_product "roadcoin" "pricing_details" "Micro-tipping, subscriptions, direct payments"
    update_product "tollbooth" "pricing_model" "transaction"
    update_product "tollbooth" "pricing_details" "Stripe integration — per-transaction"
    update_product "roadpay" "pricing_model" "subscription"
    update_product "roadpay" "pricing_details" "Billing platform — plans, invoices"
    update_product "canvas-studio" "pricing_model" "subscription"
    update_product "video-studio" "pricing_model" "subscription"
    update_product "writing-studio" "pricing_model" "subscription"
    update_product "codex-infinity" "pricing_model" "subscription"
    update_product "codex-infinity" "pricing_details" "AI IDE — token-based usage"
    update_product "roadmarket" "pricing_model" "commission"
    update_product "app-store" "pricing_model" "zero-commission"

    # Set deploy targets
    update_product "blackroad-os" "deploy_target" "gematria+alice"
    update_product "blackroad-os" "deploy_status" "deployed"
    update_product "pitstop" "deploy_target" "gematria"
    update_product "pitstop" "deploy_status" "deployed"
    update_product "prism-console" "deploy_target" "alice"
    update_product "prism-console" "deploy_status" "deployed"
    update_product "road-search" "deploy_target" "alice"
    update_product "road-search" "deploy_status" "deployed"
    update_product "fleet-heartbeat" "deploy_target" "alice"
    update_product "fleet-heartbeat" "deploy_status" "deployed"
    update_product "road-deploy" "deploy_target" "octavia"
    update_product "road-deploy" "deploy_status" "deployed"
    update_product "roundtrip" "deploy_target" "octavia"
    update_product "roundtrip" "deploy_status" "deployed"
    update_product "roadchat" "deploy_target" "cf-worker"
    update_product "roadchat" "deploy_status" "deployed"
    update_product "tollbooth" "deploy_target" "cf-worker"
    update_product "tollbooth" "deploy_status" "deployed"
    update_product "roadpay" "deploy_target" "cf-worker"
    update_product "roadpay" "deploy_status" "deployed"
    update_product "roadauth" "deploy_target" "lucidia"
    update_product "roadauth" "deploy_status" "deployed"
    update_product "pixel-hq" "deploy_target" "cf-worker"
    update_product "pixel-hq" "deploy_status" "deployed"

    # Set Pi nodes
    update_product "fork-pitstop" "pi_node" "alice"
    update_product "fork-rearview" "pi_node" "alice"
    update_product "fork-passenger" "pi_node" "cecilia+octavia+lucidia+gematria"
    update_product "fork-curb" "pi_node" "cecilia"
    update_product "fork-carpool" "pi_node" "octavia"
    update_product "fork-roundabout" "pi_node" "alice"
    update_product "fork-roadcode" "pi_node" "octavia"

    # Set priorities (lower = higher priority)
    update_product "blackroad-os" "priority" "1"
    update_product "lucidia" "priority" "2"
    update_product "tollbooth" "priority" "3"
    update_product "roadpay" "priority" "4"
    update_product "roadwork" "priority" "5"
    update_product "codex-infinity" "priority" "6"
    update_product "canvas-studio" "priority" "7"
    update_product "video-studio" "priority" "8"
    update_product "roadtube" "priority" "9"
    update_product "roadcoin" "priority" "10"

    echo
    echo -e "${GREEN}  ✅ Seeded all products!${NC}"
    stats
}

# ── Help ───────────────────────────────────────────────────────
show_help() {
    cat <<EOF

${PINK}BlackRoad Products System v${VERSION}${NC}

${BOLD}USAGE:${NC}
    memory-products.sh <command> [options]

${BOLD}COMMANDS:${NC}
    ${GREEN}init${NC}                          Initialize products database
    ${GREEN}seed${NC}                          Seed all known products
    ${GREEN}add${NC} <id> <name> <tier> ...    Add a product
    ${GREEN}show${NC} <id>                     Show product detail
    ${GREEN}update${NC} <id> <field> <value>   Update a product field
    ${GREEN}list${NC} [filter]                 List products (filters: tier:X, status:X, org:X, cat:X, deploy:X, domain:X)
    ${GREEN}search${NC} <query>                Full-text search
    ${GREEN}stats${NC}                         Dashboard overview
    ${GREEN}domain-map${NC}                    Show domain → product mapping
    ${GREEN}org-map${NC}                       Show org → product mapping
    ${GREEN}add-dep${NC} <id> <depends-on>     Add dependency
    ${GREEN}add-milestone${NC} <id> <text>     Add milestone
    ${GREEN}export${NC}                        Export as JSON
    ${GREEN}help${NC}                          Show this help

${BOLD}FILTERS:${NC}
    list tier:core          Products in core tier
    list status:live        Live products only
    list org:BlackRoad-AI   Products in specific org
    list deploy:deployed    Deployed products

${BOLD}TIERS:${NC}
    core, creator, social, education, finance, infra, ai, metaverse, enterprise, specialized

${BOLD}STATUSES:${NC}
    live, building, planned, blocked, archived

${BOLD}LOCATIONS:${NC}
    Database: $PRODUCTS_DB
    Directory: $PRODUCTS_DIR

EOF
}

# ── Main Router ────────────────────────────────────────────────
case "${1:-help}" in
    init)           init ;;
    seed)           init; seed ;;
    add)            shift; add_product "$@" ;;
    show)           show_product "$2" ;;
    update)         update_product "$2" "$3" "$4" ;;
    list)           list_products "$2" ;;
    search)         search_products "$2" ;;
    stats)          stats ;;
    domain-map)     domain_map ;;
    org-map)        org_map ;;
    add-dep)        add_dep "$2" "$3" "$4" ;;
    add-milestone)  add_milestone "$2" "$3" "$4" ;;
    export)         export_json ;;
    help|--help|-h) show_help ;;
    *)              echo -e "${RED}Unknown command: $1${NC}"; show_help ;;
esac
