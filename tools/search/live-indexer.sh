#!/usr/bin/env bash
# BlackRoad Live Indexer — continuous search indexing
# Indexes: all CF Pages sites, all GitHub repos, all subdomains, local memory
# Run: ./live-indexer.sh (one-shot) or ./live-indexer.sh --daemon (continuous)

set -euo pipefail

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
DIM='\033[2m'
RESET='\033[0m'

DB="$HOME/.blackroad/search-live.db"
LOG="$HOME/.blackroad/indexer.log"

init_db() {
  sqlite3 "$DB" "
    CREATE TABLE IF NOT EXISTS pages (
      url TEXT PRIMARY KEY,
      domain TEXT,
      title TEXT,
      description TEXT,
      content TEXT,
      status_code INTEGER,
      content_length INTEGER,
      last_indexed TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS repos (
      full_name TEXT PRIMARY KEY,
      org TEXT,
      name TEXT,
      description TEXT,
      language TEXT,
      stars INTEGER,
      updated_at TEXT,
      last_indexed TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS subdomains (
      fqdn TEXT PRIMARY KEY,
      domain TEXT,
      ip TEXT,
      status_code INTEGER,
      title TEXT,
      last_checked TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS search_fts USING fts5(
      source, url, title, content,
      tokenize='porter unicode61'
    );
    CREATE TABLE IF NOT EXISTS index_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      entries INTEGER,
      duration_ms INTEGER,
      run_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  " 2>/dev/null
}

index_live_sites() {
  local count=0
  local start=$(date +%s%N)

  echo -e "${BLUE}Indexing live websites...${RESET}"

  # All 19 root domains + key subdomains
  local urls=(
    "https://blackroad.io"
    "https://blackboxprogramming.io"
    "https://lucidia.earth"
    "https://blackroadai.com"
    "https://blackroad.network"
    "https://blackroad.systems"
    "https://blackroad.company"
    "https://blackroad.me"
    "https://blackroadinc.us"
    "https://blackroadqi.com"
    "https://blackroadquantum.com"
    "https://blackroadquantum.info"
    "https://blackroadquantum.net"
    "https://blackroadquantum.shop"
    "https://blackroadquantum.store"
    "https://lucidia.studio"
    "https://lucidiaqi.com"
    "https://roadchain.io"
    "https://roadcoin.io"
    "https://app.blackroad.io"
    "https://prism.blackroad.io"
    "https://chat.blackroad.io"
    "https://search.blackroad.io"
    "https://docs.blackroad.io"
    "https://status.blackroad.io"
    "https://dash.blackroad.io"
    "https://agents.blackroadai.com"
    "https://models.blackroadai.com"
    "https://explorer.roadchain.io"
    "https://wallet.roadcoin.io"
  )

  for url in "${urls[@]}"; do
    local domain=$(echo "$url" | sed 's|https://||;s|/.*||')
    local response
    response=$(curl -sL --max-time 8 -w "\n%{http_code}\n%{size_download}" "$url" 2>/dev/null || echo -e "\n000\n0")

    local body=$(echo "$response" | head -n -2)
    local code=$(echo "$response" | tail -2 | head -1)
    local size=$(echo "$response" | tail -1)

    # Extract title
    local title=$(echo "$body" | grep -oE '<title>[^<]+</title>' | sed 's/<[^>]*>//g' | head -c 200)
    [ -z "$title" ] && title="$domain"

    # Extract meta description
    local desc=$(echo "$body" | grep -oE 'meta name="description" content="[^"]*"' | sed 's/meta name="description" content="//;s/"$//' | head -c 300)

    # Strip HTML for content
    local content=$(echo "$body" | sed 's/<[^>]*>//g' | tr -s '[:space:]' ' ' | head -c 2000)

    # Insert into DB
    sqlite3 "$DB" "INSERT OR REPLACE INTO pages VALUES (
      '$(echo "$url" | sed "s/'/''/g")',
      '$(echo "$domain" | sed "s/'/''/g")',
      '$(echo "$title" | sed "s/'/''/g")',
      '$(echo "$desc" | sed "s/'/''/g")',
      '$(echo "$content" | sed "s/'/''/g" | head -c 1000)',
      $code, $size, datetime('now')
    );" 2>/dev/null

    # Insert into FTS
    sqlite3 "$DB" "INSERT OR REPLACE INTO search_fts VALUES (
      'page',
      '$(echo "$url" | sed "s/'/''/g")',
      '$(echo "$title" | sed "s/'/''/g")',
      '$(echo "$content" | sed "s/'/''/g" | head -c 1000)'
    );" 2>/dev/null

    count=$((count + 1))
    [ $((count % 5)) -eq 0 ] && echo -e "  ${DIM}$count sites indexed...${RESET}"
  done

  local end=$(date +%s%N)
  local duration=$(( (end - start) / 1000000 ))
  sqlite3 "$DB" "INSERT INTO index_runs (source, entries, duration_ms) VALUES ('live-sites', $count, $duration);" 2>/dev/null
  echo -e "  ${GREEN}✓ $count sites indexed (${duration}ms)${RESET}"
}

index_cf_pages() {
  local count=0
  local start=$(date +%s%N)

  echo -e "${BLUE}Indexing CF Pages deployments...${RESET}"

  # Get all pages.dev URLs and check them
  while IFS= read -r project; do
    [ -z "$project" ] && continue
    local url="https://${project}.pages.dev"
    local response
    response=$(curl -sI --max-time 5 "$url" 2>/dev/null || echo "")
    local code=$(echo "$response" | head -1 | grep -oE '[0-9]{3}' | head -1)
    [ -z "$code" ] && code=0

    if [ "$code" = "200" ]; then
      local title
      title=$(curl -sL --max-time 5 "$url" 2>/dev/null | grep -oE '<title>[^<]+</title>' | sed 's/<[^>]*>//g' | head -c 200)
      [ -z "$title" ] && title="$project"

      sqlite3 "$DB" "INSERT OR REPLACE INTO pages VALUES (
        '$(echo "$url" | sed "s/'/''/g")', '$project.pages.dev',
        '$(echo "$title" | sed "s/'/''/g")', '', '', $code, 0, datetime('now')
      );" 2>/dev/null

      sqlite3 "$DB" "INSERT OR REPLACE INTO search_fts VALUES (
        'cf-pages', '$url', '$(echo "$title" | sed "s/'/''/g")', '$project'
      );" 2>/dev/null

      count=$((count + 1))
    fi
  done < /tmp/cf-pages-projects.txt

  local end=$(date +%s%N)
  local duration=$(( (end - start) / 1000000 ))
  sqlite3 "$DB" "INSERT INTO index_runs (source, entries, duration_ms) VALUES ('cf-pages', $count, $duration);" 2>/dev/null
  echo -e "  ${GREEN}✓ $count CF Pages indexed (${duration}ms)${RESET}"
}

index_github_repos() {
  local count=0
  local start=$(date +%s%N)

  echo -e "${BLUE}Indexing GitHub repos...${RESET}"

  for org in BlackRoad-OS-Inc BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud BlackRoad-Labs BlackRoad-AI Blackbox-Enterprises; do
    local repos
    repos=$(gh repo list "$org" --limit 200 --json name,description,primaryLanguage,stargazerCount,updatedAt \
      --jq '.[] | "\(.name)|\(.description // "")|\(.primaryLanguage.name // "none")|\(.stargazerCount)|\(.updatedAt)"' 2>/dev/null)

    while IFS='|' read -r name desc lang stars updated; do
      [ -z "$name" ] && continue
      sqlite3 "$DB" "INSERT OR REPLACE INTO repos VALUES (
        '$org/$name', '$org', '$(echo "$name" | sed "s/'/''/g")',
        '$(echo "$desc" | sed "s/'/''/g" | head -c 500)',
        '$lang', $stars, '$updated', datetime('now')
      );" 2>/dev/null

      sqlite3 "$DB" "INSERT OR REPLACE INTO search_fts VALUES (
        'repo', 'https://github.com/$org/$name',
        '$(echo "$name" | sed "s/'/''/g")',
        '$(echo "$name $desc $lang $org" | sed "s/'/''/g")'
      );" 2>/dev/null

      count=$((count + 1))
    done <<< "$repos"

    echo -e "  ${DIM}$org: done${RESET}"
  done

  local end=$(date +%s%N)
  local duration=$(( (end - start) / 1000000 ))
  sqlite3 "$DB" "INSERT INTO index_runs (source, entries, duration_ms) VALUES ('github', $count, $duration);" 2>/dev/null
  echo -e "  ${GREEN}✓ $count repos indexed (${duration}ms)${RESET}"
}

index_memory() {
  local count=0
  local start=$(date +%s%N)

  echo -e "${BLUE}Indexing memory system...${RESET}"

  # Codex solutions
  local codex_db="$HOME/.blackroad/memory/codex/codex.db"
  if [ -f "$codex_db" ]; then
    sqlite3 "$codex_db" "SELECT name, category, problem, solution FROM solutions;" 2>/dev/null | while IFS='|' read -r name cat prob sol; do
      sqlite3 "$DB" "INSERT OR REPLACE INTO search_fts VALUES (
        'codex', '', '$(echo "$name" | sed "s/'/''/g")',
        '$(echo "$prob $sol" | sed "s/'/''/g" | head -c 1000)'
      );" 2>/dev/null
      count=$((count + 1))
    done
  fi

  # TILs
  local til_dir="$HOME/.blackroad/memory/til"
  if [ -d "$til_dir" ]; then
    for f in "$til_dir"/til-*.json; do
      [ -f "$f" ] || continue
      local cat=$(python3 -c "import json; print(json.load(open('$f')).get('category',''))" 2>/dev/null)
      local learning=$(python3 -c "import json; print(json.load(open('$f')).get('learning','')[:500])" 2>/dev/null)
      sqlite3 "$DB" "INSERT OR REPLACE INTO search_fts VALUES (
        'til', '', 'TIL: $(echo "$cat" | sed "s/'/''/g")',
        '$(echo "$learning" | sed "s/'/''/g")'
      );" 2>/dev/null
      count=$((count + 1))
    done
  fi

  local end=$(date +%s%N)
  local duration=$(( (end - start) / 1000000 ))
  sqlite3 "$DB" "INSERT INTO index_runs (source, entries, duration_ms) VALUES ('memory', $count, $duration);" 2>/dev/null
  echo -e "  ${GREEN}✓ $count memory entries indexed (${duration}ms)${RESET}"
}

print_stats() {
  echo ""
  echo -e "${PINK}╔════════════════════════════════════════════════════════════╗${RESET}"
  echo -e "${PINK}║  BlackRoad Live Search Index                              ║${RESET}"
  echo -e "${PINK}╚════════════════════════════════════════════════════════════╝${RESET}"
  echo ""
  local total=$(sqlite3 "$DB" "SELECT COUNT(*) FROM search_fts;" 2>/dev/null)
  local pages=$(sqlite3 "$DB" "SELECT COUNT(*) FROM pages;" 2>/dev/null)
  local repos=$(sqlite3 "$DB" "SELECT COUNT(*) FROM repos;" 2>/dev/null)
  local db_size=$(du -sh "$DB" 2>/dev/null | cut -f1)

  echo -e "  ${GREEN}Total indexed:${RESET} $total entries"
  echo -e "  ${GREEN}Pages:${RESET} $pages"
  echo -e "  ${GREEN}Repos:${RESET} $repos"
  echo -e "  ${GREEN}DB size:${RESET} $db_size"
  echo ""
  echo -e "  ${BLUE}Recent runs:${RESET}"
  sqlite3 "$DB" "SELECT source, entries, duration_ms, run_at FROM index_runs ORDER BY id DESC LIMIT 10;" 2>/dev/null | while IFS='|' read -r src entries dur ts; do
    printf "    %-15s %4s entries  %6sms  %s\n" "$src" "$entries" "$dur" "$ts"
  done
}

# Main
init_db

if [ "${1:-}" = "--daemon" ]; then
  echo -e "${PINK}BlackRoad Live Indexer — Daemon Mode${RESET}"
  echo -e "${DIM}Indexing every 30 minutes. Ctrl+C to stop.${RESET}"
  while true; do
    echo ""
    echo "=== Index run: $(date) ==="
    index_live_sites
    index_cf_pages
    index_github_repos
    index_memory
    print_stats
    echo ""
    echo -e "${DIM}Next run in 30 minutes...${RESET}"
    sleep 1800
  done
elif [ "${1:-}" = "search" ]; then
  shift
  query="$*"
  echo -e "${PINK}Search: $query${RESET}"
  sqlite3 "$DB" "
    SELECT source, url, title, snippet(search_fts, 3, '>>>', '<<<', '...', 30)
    FROM search_fts WHERE search_fts MATCH '$query'
    ORDER BY rank LIMIT 20;
  " 2>/dev/null | while IFS='|' read -r src url title snippet; do
    echo -e "  ${GREEN}[$src]${RESET} $title"
    echo -e "  ${DIM}$snippet${RESET}"
    [ -n "$url" ] && echo -e "  ${BLUE}$url${RESET}"
    echo ""
  done
elif [ "${1:-}" = "stats" ]; then
  print_stats
else
  echo -e "${PINK}BlackRoad Live Indexer — One-shot${RESET}"
  index_live_sites
  index_cf_pages
  index_github_repos
  index_memory
  print_stats
fi
