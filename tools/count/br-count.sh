#!/usr/bin/env bash
# BlackRoad Ecosystem Counter — accurate numbers for everything
# Usage: br-count [section] or br-count all
# Sections: repos, dns, scripts, memory, sites, fleet, code, all

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
DIM='\033[2m'
BOLD='\033[1m'
R='\033[0m'

CF_TOKEN=$(cat ~/.cloudflare_dns_token 2>/dev/null)
HOME_DIR="$HOME"
OP="$HOME/blackroad-operator"
MEM="$HOME/.blackroad/memory"

ORGS="BlackRoad-OS-Inc BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud BlackRoad-Labs BlackRoad-AI Blackbox-Enterprises"

ZONES="d6566eba4500b460ffec6650d3b4baf6 f654e077612d3d240f96300b7c0c6cae 622395674d479bad0a7d3790722c14be fae5a76a78154e0509bede2e3eba8124 13293825c2b0491085cbece9fc02e401 590afe2b9b2ae222e77d89c10b7412d3 decb1bf816ff29197d88751228ad0017 e24dbdfd8868183e4093b8cdba709240 1c93ece77e64728f506d635f5b58c60a 9855ce5bf6602150ea9195f3cd975d3e 7d606471c0feab151c8ad493fd8a5c8e b842746ff2e811c1be959e5a843b25e6 498fef62d7a9812e69413e7451edf3b1 a91af33930bb9b9ddfa0cf12c0232460 43edda4c64475e5d81934ec7f64f6801 8a787536b6dd285bdf06dde65e96e8c0 86d82685f669fe45d0ee6d24ef21b255 111d9214d54a282b1e889fa3d1e2faa8 6e27d41cb2d27cd8f2f26e95608d3899"

count_repos() {
  echo -e "${BLUE}GitHub Repositories${R}"
  local total=0
  for org in $ORGS; do
    local c
    c=$(gh api "orgs/$org" --jq '.public_repos' 2>/dev/null || echo 0)
    total=$((total + c))
    printf "  %-28s %s\n" "$org" "$c"
  done
  echo -e "  ${GREEN}TOTAL: $total repos${R}"
  echo ""
}

count_dns() {
  echo -e "${BLUE}DNS Records (Cloudflare)${R}"
  local total=0
  local domains=(blackroad.io blackroad.company blackroad.me blackroad.network blackroad.systems blackroadai.com blackroadinc.us blackroadqi.com blackroadquantum.com blackroadquantum.info blackroadquantum.net blackroadquantum.shop blackroadquantum.store lucidia.earth lucidia.studio lucidiaqi.com roadchain.io roadcoin.io blackboxprogramming.io)
  local i=0
  for zid in $ZONES; do
    local c
    c=$(curl -s "https://api.cloudflare.com/client/v4/zones/$zid/dns_records?per_page=1" \
      -H "Authorization: Bearer $CF_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)['result_info']['total_count'])" 2>/dev/null)
    total=$((total + c))
    printf "  %-28s %3s/200\n" "${domains[$i]}" "$c"
    i=$((i + 1))
  done
  echo -e "  ${GREEN}TOTAL: $total DNS records across 19 domains${R}"
  echo ""
}

count_scripts() {
  echo -e "${BLUE}Shell Scripts${R}"
  local home_sh op_scripts op_tools op_root prism_sh total

  home_sh=$(find "$HOME_DIR" -maxdepth 1 -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
  op_scripts=$(find "$OP/scripts" -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
  op_tools=$(find "$OP/tools" -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
  op_root=$(find "$OP" -maxdepth 1 -name "*.sh" -type f 2>/dev/null | wc -l | tr -d ' ')
  prism_sh=$(find "$HOME_DIR/blackroad-os-prism-enterprise" -name "*.sh" -type f -not -path "*/node_modules/*" 2>/dev/null | wc -l | tr -d ' ')
  total=$((home_sh + op_scripts + op_tools + op_root + prism_sh))

  printf "  %-28s %s\n" "~/                           " "$home_sh"
  printf "  %-28s %s\n" "operator/scripts/            " "$op_scripts"
  printf "  %-28s %s\n" "operator/tools/              " "$op_tools"
  printf "  %-28s %s\n" "operator/ (root)             " "$op_root"
  printf "  %-28s %s\n" "prism-enterprise/            " "$prism_sh"
  echo -e "  ${GREEN}TOTAL: $total shell scripts${R}"

  # Syntax check pass rate
  local pass=0 fail=0
  for dir in "$HOME_DIR"/*.sh "$OP/scripts"/**/*.sh "$OP/tools"/**/*.sh; do
    [ -f "$dir" ] || continue
    if bash -n "$dir" 2>/dev/null; then
      pass=$((pass + 1))
    else
      fail=$((fail + 1))
    fi
  done
  local rate=0
  [ $((pass + fail)) -gt 0 ] && rate=$(( (pass * 100) / (pass + fail) ))
  echo -e "  ${DIM}Syntax check: $pass pass, $fail fail ($rate%)${R}"
  echo ""
}

count_memory() {
  echo -e "${BLUE}Memory System${R}"

  local journal tils codex_sol codex_pat codex_bp codex_ap codex_ll collab_sess collab_msg
  local mem_files ledger_size search_entries tasks

  journal=$(wc -l < "$MEM/journals/master-journal.jsonl" 2>/dev/null | tr -d ' ')
  tils=$(find "$MEM/til" -name "til-*.json" 2>/dev/null | wc -l | tr -d ' ')
  codex_sol=$(sqlite3 "$MEM/codex/codex.db" "SELECT COUNT(*) FROM solutions;" 2>/dev/null || echo 0)
  codex_pat=$(sqlite3 "$MEM/codex/codex.db" "SELECT COUNT(*) FROM patterns;" 2>/dev/null || echo 0)
  codex_bp=$(sqlite3 "$MEM/codex/codex.db" "SELECT COUNT(*) FROM best_practices;" 2>/dev/null || echo 0)
  codex_ap=$(sqlite3 "$MEM/codex/codex.db" "SELECT COUNT(*) FROM anti_patterns;" 2>/dev/null || echo 0)
  codex_ll=$(sqlite3 "$MEM/codex/codex.db" "SELECT COUNT(*) FROM lessons_learned;" 2>/dev/null || echo 0)
  collab_sess=$(sqlite3 "$MEM/collaboration/collab.db" "SELECT COUNT(DISTINCT session_id) FROM sessions;" 2>/dev/null || echo 0)
  collab_msg=$(sqlite3 "$MEM/collaboration/collab.db" "SELECT COUNT(*) FROM messages;" 2>/dev/null || echo 0)
  mem_files=$(find ~/.claude/projects/-Users-alexa/memory -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  ledger_size=$(du -sh "$MEM/journals/master-journal.jsonl" 2>/dev/null | awk '{print $1}')
  search_entries=$(sqlite3 ~/.blackroad/search-live.db "SELECT COUNT(*) FROM idx;" 2>/dev/null || echo 0)
  tasks=$(sqlite3 "$MEM/tasks.db" "SELECT COUNT(*) FROM tasks;" 2>/dev/null || echo 0)
  local db_count
  db_count=$(find ~/.blackroad -name "*.db" -type f 2>/dev/null | wc -l | tr -d ' ')

  printf "  %-28s %s\n" "Journal entries" "$journal"
  printf "  %-28s %s\n" "TIL broadcasts" "$tils"
  printf "  %-28s %s\n" "Codex solutions" "$codex_sol"
  printf "  %-28s %s\n" "Codex patterns" "$codex_pat"
  printf "  %-28s %s\n" "Codex best practices" "$codex_bp"
  printf "  %-28s %s\n" "Codex anti-patterns" "$codex_ap"
  printf "  %-28s %s\n" "Codex lessons learned" "$codex_ll"
  printf "  %-28s %s\n" "Collaboration sessions" "$collab_sess"
  printf "  %-28s %s\n" "Collaboration messages" "$collab_msg"
  printf "  %-28s %s\n" "Memory files (.md)" "$mem_files"
  printf "  %-28s %s\n" "Ledger size" "$ledger_size"
  printf "  %-28s %s\n" "Search index entries" "$search_entries"
  printf "  %-28s %s\n" "Task marketplace" "$tasks"
  printf "  %-28s %s\n" "SQLite databases" "$db_count"
  echo ""
}

count_sites() {
  echo -e "${BLUE}Websites & Apps${R}"

  local pages websites_dir live_200=0

  pages=$(npx wrangler pages project list 2>/dev/null | grep -c "pages.dev" || echo 0)
  websites_dir=$(ls -d "$OP/websites"/*/index.html 2>/dev/null | wc -l | tr -d ' ')

  # Test root domains
  for domain in blackroad.io blackboxprogramming.io lucidia.earth blackroadai.com blackroad.network blackroad.systems blackroad.company blackroad.me blackroadinc.us blackroadqi.com blackroadquantum.com blackroadquantum.info blackroadquantum.net blackroadquantum.shop blackroadquantum.store lucidia.studio lucidiaqi.com roadchain.io roadcoin.io; do
    local code
    code=$(curl -sI -o /dev/null -w "%{http_code}" --max-time 4 "https://$domain" 2>/dev/null)
    [ "$code" = "200" ] && live_200=$((live_200 + 1))
  done

  printf "  %-28s %s\n" "CF Pages projects" "$pages"
  printf "  %-28s %s\n" "Website app directories" "$websites_dir"
  printf "  %-28s %s\n" "Root domains returning 200" "$live_200/19"
  echo ""
}

count_fleet() {
  echo -e "${BLUE}Fleet & Infrastructure${R}"

  local online=0

  for entry in "Alice|192.168.4.49" "Cecilia|192.168.4.96" "Octavia|192.168.4.101" "Aria|192.168.4.98" "Lucidia|192.168.4.38"; do
    IFS='|' read -r name ip <<< "$entry"
    if ping -c1 -W1 "$ip" > /dev/null 2>&1; then
      printf "  %-12s %-16s ${GREEN}ONLINE${R}\n" "$name" "$ip"
      online=$((online + 1))
    else
      printf "  %-12s %-16s ${AMBER}OFFLINE${R}\n" "$name" "$ip"
    fi
  done

  for entry in "Gematria|159.65.43.12" "Anastasia|174.138.44.45"; do
    IFS='|' read -r name ip <<< "$entry"
    if ping -c1 -W2 "$ip" > /dev/null 2>&1; then
      printf "  %-12s %-16s ${GREEN}ONLINE${R}\n" "$name" "$ip"
      online=$((online + 1))
    else
      printf "  %-12s %-16s ${AMBER}OFFLINE${R}\n" "$name" "$ip"
    fi
  done

  echo -e "  ${GREEN}$online/7 nodes online${R}"
  echo ""
}

count_code() {
  echo -e "${BLUE}Code Metrics${R}"

  # Count lines by language across key directories
  local bash_loc=0 py_loc=0 js_loc=0 ts_loc=0 html_loc=0 css_loc=0 jsx_loc=0

  bash_loc=$(find "$HOME_DIR" -maxdepth 1 -name "*.sh" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')
  bash_loc=$((bash_loc + $(find "$OP" -name "*.sh" -not -path "*/node_modules/*" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')))

  py_loc=$(find "$OP" -name "*.py" -not -path "*/node_modules/*" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')

  js_loc=$(find "$OP/workers" -name "*.js" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')
  js_loc=$((js_loc + $(find "$OP/websites" -name "*.js" -maxdepth 2 -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')))

  ts_loc=$(find "$OP/src" -name "*.ts" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')

  html_loc=$(find "$OP/websites" -name "*.html" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')

  jsx_loc=$(find ~/Desktop/templates -name "*.jsx" -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')

  local total=$((bash_loc + py_loc + js_loc + ts_loc + html_loc + jsx_loc))

  printf "  %-28s %s lines\n" "Bash" "$bash_loc"
  printf "  %-28s %s lines\n" "Python" "$py_loc"
  printf "  %-28s %s lines\n" "JavaScript" "$js_loc"
  printf "  %-28s %s lines\n" "TypeScript" "$ts_loc"
  printf "  %-28s %s lines\n" "HTML" "$html_loc"
  printf "  %-28s %s lines\n" "JSX" "$jsx_loc"
  echo -e "  ${GREEN}TOTAL: $total lines of code (operator + templates + scripts)${R}"
  echo ""
}

count_disk() {
  echo -e "${BLUE}Disk Usage${R}"
  local used free pct
  read -r used free pct <<< $(df -h / | tail -1 | awk '{print $3, $4, $5}')
  printf "  %-28s %s\n" "Used" "$used"
  printf "  %-28s %s\n" "Free" "$free"
  printf "  %-28s %s\n" "Capacity" "$pct"
  echo ""

  echo -e "  ${DIM}Top directories:${R}"
  du -sh ~/blackroad-operator ~/blackroad-os-prism-enterprise ~/Downloads ~/.blackroad ~/.ollama 2>/dev/null | sort -rh | while read -r size dir; do
    dir=$(echo "$dir" | sed "s|$HOME/||")
    printf "    %-24s %s\n" "$dir" "$size"
  done
  echo ""
}

# ─── MAIN ───

section="${1:-all}"

echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${R}"
echo -e "${PINK}║  BlackRoad Ecosystem Counter — $(date '+%Y-%m-%d %H:%M')              ║${R}"
echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${R}"
echo ""

case "$section" in
  repos)   count_repos ;;
  dns)     count_dns ;;
  scripts) count_scripts ;;
  memory)  count_memory ;;
  sites)   count_sites ;;
  fleet)   count_fleet ;;
  code)    count_code ;;
  disk)    count_disk ;;
  all)
    count_repos
    count_dns
    count_scripts
    count_memory
    count_sites
    count_fleet
    count_code
    count_disk
    echo -e "${PINK}━━━ SUMMARY ━━━${R}"
    echo -e "  ${BOLD}Repos:${R} $(gh api 'orgs/BlackRoad-OS-Inc' --jq '.public_repos' 2>/dev/null) (OS-Inc) + more across 16 orgs"
    echo -e "  ${BOLD}DNS:${R} 3,625+ records across 19 domains"
    echo -e "  ${BOLD}Orgs:${R} 16 | ${BOLD}Domains:${R} 19 | ${BOLD}Nodes:${R} 7"
    echo -e "  ${BOLD}Codex:${R} $codex_sol solutions, $codex_pat patterns"
    echo ""
    ;;
  *)
    echo "Usage: br-count [repos|dns|scripts|memory|sites|fleet|code|disk|all]"
    ;;
esac
