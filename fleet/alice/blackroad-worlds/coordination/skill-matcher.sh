#!/bin/zsh
# BlackRoad Skill Matcher — Route tasks to agents by capability

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

DB="$HOME/.blackroad/skill-matcher.db"

init_db() {
  sqlite3 "$DB" <<SQL
CREATE TABLE IF NOT EXISTS agent_profiles (
  agent_id TEXT PRIMARY KEY,
  name TEXT,
  skills TEXT,
  task_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS task_routes (
  task_id TEXT PRIMARY KEY,
  description TEXT,
  matched_agent TEXT,
  confidence REAL,
  routed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL
}

SKILL_MAP=(
  "backend:api server fastapi express django flask node"
  "frontend:react vue ui component css html nextjs"
  "database:postgres mysql sql redis mongodb sqlite"
  "devops:docker k8s deploy ci/cd terraform ansible"
  "ml:machine learning tensorflow pytorch model inference"
  "security:auth oauth encryption vulnerability pentest"
  "testing:test pytest jest unit coverage"
  "documentation:docs readme guide tutorial"
)

match_task() {
  local description="$1"
  local top_n="${2:-3}"
  local desc_lower="${description:l}"

  echo -e "${CYAN}Matching: ${description}${NC}\n"

  declare -A scores
  for entry in $SKILL_MAP; do
    local category="${entry%%:*}"
    local keywords="${entry#*:}"
    local score=0
    for kw in ${(s: :)keywords}; do
      [[ "$desc_lower" == *"$kw"* ]] && ((score++))
    done
    scores[$category]=$score
  done

  echo -e "${GREEN}Top skill categories:${NC}"
  for cat in ${(k)scores}; do
    [[ ${scores[$cat]} -gt 0 ]] && echo "  ${scores[$cat]} — $cat"
  done | sort -rn | head -$top_n
}

case "$1" in
  match) match_task "${2:-}" "${3:-3}" ;;
  init)  init_db; echo -e "${GREEN}Skill matcher initialized${NC}" ;;
  *)     echo "Usage: $0 [match <description>|init]" ;;
esac
