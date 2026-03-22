#!/bin/bash
# [BLUEPRINTS] System - Infrastructure blueprints for BlackRoad
# Usage: ~/blueprints-system.sh <command> [args]

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
CYAN='\033[38;5;51m'
RESET='\033[0m'

BLUEPRINTS_DB="$HOME/.blackroad/blueprints.db"

init_blueprints() {
    mkdir -p "$HOME/.blackroad"
    sqlite3 "$BLUEPRINTS_DB" <<EOSQL
CREATE TABLE IF NOT EXISTS blueprints (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    category TEXT,
    description TEXT,
    spec TEXT NOT NULL,
    variables TEXT DEFAULT '{}',
    version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'draft',
    author TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blueprint_deployments (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    environment TEXT NOT NULL,
    variables TEXT DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    deployed_by TEXT,
    deployed_at TEXT,
    completed_at TEXT,
    output TEXT
);

CREATE TABLE IF NOT EXISTS blueprint_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blueprint_id TEXT NOT NULL,
    version TEXT NOT NULL,
    spec TEXT NOT NULL,
    changelog TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blueprint_id, version)
);

CREATE TABLE IF NOT EXISTS blueprint_components (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT NOT NULL,
    name TEXT NOT NULL,
    component_type TEXT NOT NULL,
    config TEXT DEFAULT '{}',
    depends_on TEXT
);

CREATE INDEX IF NOT EXISTS idx_blueprints_type ON blueprints(type);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_deployments_blueprint ON blueprint_deployments(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_versions_blueprint ON blueprint_versions(blueprint_id);
EOSQL
    echo -e "${GREEN}[BLUEPRINTS]${RESET} System initialized - THE 110TH SYSTEM!"
}

create() {
    local name="$1"
    local type="$2"
    local spec="$3"
    local description="${4:-}"
    local category="${5:-general}"

    local id="bp-$(openssl rand -hex 6)"

    sqlite3 "$BLUEPRINTS_DB" "INSERT INTO blueprints (id, name, type, spec, description, category, author) VALUES ('$id', '$name', '$type', '$spec', '$description', '$category', '$USER');"
    save_version "$id" "1.0.0" "$spec" "Initial version"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Created: $name ($id)"
    echo "$id"
}

update() {
    local blueprint_id="$1"
    local spec="$2"
    local new_version="${3:-}"

    local current=$(sqlite3 "$BLUEPRINTS_DB" "SELECT version FROM blueprints WHERE id='$blueprint_id';")
    
    if [[ -z "$new_version" ]]; then
        # Auto-increment patch version
        IFS='.' read -r major minor patch <<< "$current"
        new_version="$major.$minor.$((patch + 1))"
    fi

    sqlite3 "$BLUEPRINTS_DB" "UPDATE blueprints SET spec='$spec', version='$new_version', updated_at=datetime('now') WHERE id='$blueprint_id';"
    save_version "$blueprint_id" "$new_version" "$spec" "Updated"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Updated: $blueprint_id -> v$new_version"
}

save_version() {
    local blueprint_id="$1"
    local version="$2"
    local spec="$3"
    local changelog="${4:-}"

    sqlite3 "$BLUEPRINTS_DB" "INSERT OR REPLACE INTO blueprint_versions (blueprint_id, version, spec, changelog) VALUES ('$blueprint_id', '$version', '$spec', '$changelog');"
}

publish() {
    local blueprint_id="$1"

    sqlite3 "$BLUEPRINTS_DB" "UPDATE blueprints SET status='published', updated_at=datetime('now') WHERE id='$blueprint_id';"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Published: $blueprint_id"
}

deprecate() {
    local blueprint_id="$1"

    sqlite3 "$BLUEPRINTS_DB" "UPDATE blueprints SET status='deprecated', updated_at=datetime('now') WHERE id='$blueprint_id';"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Deprecated: $blueprint_id"
}

add_component() {
    local blueprint_id="$1"
    local name="$2"
    local component_type="$3"
    local config="${4:-{}}"
    local depends="${5:-}"

    local id="comp-$(openssl rand -hex 4)"
    local depends_sql="NULL"
    [[ -n "$depends" ]] && depends_sql="'$depends'"

    sqlite3 "$BLUEPRINTS_DB" "INSERT INTO blueprint_components (id, blueprint_id, name, component_type, config, depends_on) VALUES ('$id', '$blueprint_id', '$name', '$component_type', '$config', $depends_sql);"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Component added: $name"
}

deploy() {
    local blueprint_id="$1"
    local environment="$2"
    local variables="${3:-{}}"

    local dep_id="dep-$(openssl rand -hex 6)"

    sqlite3 "$BLUEPRINTS_DB" "INSERT INTO blueprint_deployments (id, blueprint_id, environment, variables, status, deployed_by, deployed_at) VALUES ('$dep_id', '$blueprint_id', '$environment', '$variables', 'running', '$USER', datetime('now'));"
    echo -e "${CYAN}[BLUEPRINTS]${RESET} Deploying: $dep_id to $environment"
    echo "$dep_id"
}

complete_deploy() {
    local deployment_id="$1"
    local status="${2:-success}"
    local output="${3:-}"

    sqlite3 "$BLUEPRINTS_DB" "UPDATE blueprint_deployments SET status='$status', completed_at=datetime('now'), output='$output' WHERE id='$deployment_id';"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Deployment $status: $deployment_id"
}

list() {
    local type="${1:-}"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Blueprints"
    echo ""
    if [[ -n "$type" ]]; then
        sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT id, name, type, version, status, category FROM blueprints WHERE type='$type' ORDER BY name;"
    else
        sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT id, name, type, version, status, category FROM blueprints ORDER BY type, name;"
    fi
}

get() {
    local blueprint_id="$1"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Blueprint: $blueprint_id"
    echo ""
    sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT * FROM blueprints WHERE id='$blueprint_id';"
    echo ""
    echo -e "${BLUE}Components:${RESET}"
    sqlite3 -column "$BLUEPRINTS_DB" "SELECT name, component_type, depends_on FROM blueprint_components WHERE blueprint_id='$blueprint_id';"
}

versions() {
    local blueprint_id="$1"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Versions: $blueprint_id"
    echo ""
    sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT version, changelog, created_at FROM blueprint_versions WHERE blueprint_id='$blueprint_id' ORDER BY created_at DESC;"
}

deployments() {
    local blueprint_id="${1:-}"
    local limit="${2:-20}"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Deployments"
    echo ""
    if [[ -n "$blueprint_id" ]]; then
        sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT id, environment, status, deployed_by, deployed_at FROM blueprint_deployments WHERE blueprint_id='$blueprint_id' ORDER BY deployed_at DESC LIMIT $limit;"
    else
        sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT id, blueprint_id, environment, status, deployed_at FROM blueprint_deployments ORDER BY deployed_at DESC LIMIT $limit;"
    fi
}

components() {
    local blueprint_id="$1"
    echo -e "${AMBER}[BLUEPRINTS]${RESET} Components: $blueprint_id"
    echo ""
    sqlite3 -column -header "$BLUEPRINTS_DB" "SELECT id, name, component_type, depends_on FROM blueprint_components WHERE blueprint_id='$blueprint_id';"
}

delete() {
    local blueprint_id="$1"

    sqlite3 "$BLUEPRINTS_DB" "DELETE FROM blueprint_components WHERE blueprint_id='$blueprint_id';"
    sqlite3 "$BLUEPRINTS_DB" "DELETE FROM blueprint_versions WHERE blueprint_id='$blueprint_id';"
    sqlite3 "$BLUEPRINTS_DB" "DELETE FROM blueprint_deployments WHERE blueprint_id='$blueprint_id';"
    sqlite3 "$BLUEPRINTS_DB" "DELETE FROM blueprints WHERE id='$blueprint_id';"
    echo -e "${GREEN}[BLUEPRINTS]${RESET} Deleted: $blueprint_id"
}

stats() {
    echo -e "${PINK}╔══════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║${RESET}      ${AMBER}[BLUEPRINTS] System Stats${RESET}     ${PINK}║${RESET}"
    echo -e "${PINK}║${RESET}        ${CYAN}⚡ THE 110TH SYSTEM ⚡${RESET}        ${PINK}║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════╝${RESET}"
    echo ""

    local total=$(sqlite3 "$BLUEPRINTS_DB" "SELECT COUNT(*) FROM blueprints;")
    local published=$(sqlite3 "$BLUEPRINTS_DB" "SELECT COUNT(*) FROM blueprints WHERE status='published';")
    local deployments=$(sqlite3 "$BLUEPRINTS_DB" "SELECT COUNT(*) FROM blueprint_deployments;")
    local success=$(sqlite3 "$BLUEPRINTS_DB" "SELECT COUNT(*) FROM blueprint_deployments WHERE status='success';")
    local components=$(sqlite3 "$BLUEPRINTS_DB" "SELECT COUNT(*) FROM blueprint_components;")

    echo -e "  ${GREEN}Total Blueprints:${RESET}  $total"
    echo -e "  ${GREEN}Published:${RESET}         $published"
    echo -e "  ${GREEN}Deployments:${RESET}       $deployments"
    echo -e "  ${GREEN}Successful:${RESET}        $success"
    echo -e "  ${GREEN}Components:${RESET}        $components"
    echo ""
    echo -e "${BLUE}By Type:${RESET}"
    sqlite3 -column "$BLUEPRINTS_DB" "SELECT type, COUNT(*) as count FROM blueprints GROUP BY type ORDER BY count DESC;"
}

show_help() {
    echo -e "${PINK}[BLUEPRINTS]${RESET} - BlackRoad Infrastructure Blueprints"
    echo -e "${CYAN}THE 110TH SYSTEM!${RESET}"
    echo ""
    echo "Usage: ~/blueprints-system.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  init                                          Initialize system"
    echo "  create <name> <type> <spec> [desc] [cat]      Create blueprint"
    echo "  update <id> <spec> [version]                  Update blueprint"
    echo "  publish <id>                                  Publish blueprint"
    echo "  deprecate <id>                                Deprecate blueprint"
    echo "  add-component <bp> <name> <type> [config]     Add component"
    echo "  deploy <id> <env> [vars]                      Deploy blueprint"
    echo "  complete-deploy <dep_id> <status> [output]    Complete deployment"
    echo "  list [type]                                   List blueprints"
    echo "  get <id>                                      Get blueprint"
    echo "  versions <id>                                 View versions"
    echo "  deployments [id] [limit]                      View deployments"
    echo "  components <id>                               View components"
    echo "  delete <id>                                   Delete blueprint"
    echo "  stats                                         Show statistics"
}

case "${1:-help}" in
    init)            init_blueprints ;;
    create)          create "$2" "$3" "$4" "$5" "$6" ;;
    update)          update "$2" "$3" "$4" ;;
    publish)         publish "$2" ;;
    deprecate)       deprecate "$2" ;;
    add-component)   add_component "$2" "$3" "$4" "$5" "$6" ;;
    deploy)          deploy "$2" "$3" "$4" ;;
    complete-deploy) complete_deploy "$2" "$3" "$4" ;;
    list)            list "$2" ;;
    get)             get "$2" ;;
    versions)        versions "$2" ;;
    deployments)     deployments "$2" "$3" ;;
    components)      components "$2" ;;
    delete)          delete "$2" ;;
    stats)           stats ;;
    help|*)          show_help ;;
esac
