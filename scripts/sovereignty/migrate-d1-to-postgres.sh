#!/usr/bin/env bash
# D1 → PostgreSQL Migration Script
# Exports all D1 databases to SQL and imports to Alice's PostgreSQL
# Usage: ./migrate-d1-to-postgres.sh [--dry-run] [--db <name>]
set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

ALICE="pi@192.168.4.49"
PG_DB="blackroad"
EXPORT_DIR="$HOME/.blackroad/d1-exports"
DRY_RUN=false
SINGLE_DB=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --db) SINGLE_DB="$2"; shift 2;;
    *) shift;;
  esac
done

mkdir -p "$EXPORT_DIR"

# D1 database list (name only — wrangler resolves by name)
D1_DBS="blackroad-slack-memory tollbooth road-search analytics-blackroad blackroad-database blackroad-auth blackboard index-blackroad blackroad-chat blackroad-verification images-blackroad openapi-template-db"

db_count=$(echo "$D1_DBS" | wc -w | tr -d ' ')
echo -e "${PINK}D1 → PostgreSQL Migration${RESET}"
echo -e "${BLUE}Target: ${ALICE} / ${PG_DB}${RESET}"
echo -e "${BLUE}Databases: ${db_count}${RESET}"
echo ""

migrate_db() {
  local db_name="$1"
  local schema_prefix
  schema_prefix=$(echo "$db_name" | tr '-' '_')

  echo -e "${BLUE}[${db_name}]${RESET} Exporting tables..."

  # Get table list (skip internal _cf_KV and sqlite_*)
  local tables
  tables=$(npx wrangler d1 execute "$db_name" --remote \
    --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_%'" \
    2>/dev/null | python3 -c "
import json,sys
try:
  lines = sys.stdin.read()
  # Find JSON in output
  start = lines.index('[')
  data = json.loads(lines[start:])
  for row in data[0].get('results',[]):
    print(row['name'])
except: pass
" 2>/dev/null)

  if [ -z "$tables" ]; then
    echo -e "  ${RED}No tables found (or empty)${RESET}"
    return
  fi

  local sql_file="${EXPORT_DIR}/${db_name}.sql"
  echo "-- D1 Migration: ${db_name} → PostgreSQL" > "$sql_file"
  echo "-- Exported: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$sql_file"
  echo "-- Schema prefix: ${schema_prefix}" >> "$sql_file"
  echo "" >> "$sql_file"
  echo "CREATE SCHEMA IF NOT EXISTS d1_${schema_prefix};" >> "$sql_file"
  echo "" >> "$sql_file"

  for table in $tables; do
    echo -e "  ${GREEN}Table: ${table}${RESET}"

    # Get CREATE TABLE (convert SQLite → PG syntax)
    local create_sql
    create_sql=$(npx wrangler d1 execute "$db_name" --remote \
      --command "SELECT sql FROM sqlite_master WHERE name='${table}'" \
      2>/dev/null | python3 -c "
import json,sys,re
try:
  lines = sys.stdin.read()
  start = lines.index('[')
  data = json.loads(lines[start:])
  sql = data[0]['results'][0]['sql']
  # SQLite → PostgreSQL conversions
  sql = re.sub(r'INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY', sql)
  sql = re.sub(r'INTEGER PRIMARY KEY', 'SERIAL PRIMARY KEY', sql)
  sql = re.sub(r\"DEFAULT \(datetime\('now'\)\)\", \"DEFAULT NOW()\", sql)
  sql = re.sub(r\"DEFAULT \(unixepoch\(\)\)\", \"DEFAULT EXTRACT(EPOCH FROM NOW())::INTEGER\", sql)
  sql = re.sub(r\"DEFAULT \(hex\(randomblob\(8\)\)\)\", \"DEFAULT encode(gen_random_bytes(8),'hex')\", sql)
  sql = re.sub(r'BLOB', 'BYTEA', sql)
  # Qualify with schema
  sql = sql.replace('CREATE TABLE ', 'CREATE TABLE IF NOT EXISTS d1_${schema_prefix}.', 1)
  print(sql + ';')
except: pass
" 2>/dev/null)

    if [ -n "$create_sql" ]; then
      echo "$create_sql" >> "$sql_file"
      echo "" >> "$sql_file"
    fi

    # Export data as INSERT statements
    local row_count
    row_count=$(npx wrangler d1 execute "$db_name" --remote \
      --command "SELECT COUNT(*) as cnt FROM ${table}" \
      2>/dev/null | python3 -c "
import json,sys
try:
  lines = sys.stdin.read()
  start = lines.index('[')
  data = json.loads(lines[start:])
  print(data[0]['results'][0]['cnt'])
except: print(0)
" 2>/dev/null)

    echo -e "    Rows: ${row_count}"

    if [ "$row_count" -gt 0 ] 2>/dev/null; then
      # Export in batches of 100
      local offset=0
      while [ "$offset" -lt "$row_count" ]; do
        npx wrangler d1 execute "$db_name" --remote \
          --command "SELECT * FROM ${table} LIMIT 100 OFFSET ${offset}" \
          2>/dev/null | python3 -c "
import json,sys
try:
  lines = sys.stdin.read()
  start = lines.index('[')
  data = json.loads(lines[start:])
  rows = data[0].get('results',[])
  if not rows: sys.exit()
  cols = list(rows[0].keys())
  for row in rows:
    vals = []
    for c in cols:
      v = row[c]
      if v is None: vals.append('NULL')
      elif isinstance(v, (int,float)): vals.append(str(v))
      else: vals.append(\"'\" + str(v).replace(\"'\",\"''\") + \"'\")
    print(f\"INSERT INTO d1_${schema_prefix}.${table} ({','.join(cols)}) VALUES ({','.join(vals)});\")
except: pass
" 2>/dev/null >> "$sql_file"
        offset=$((offset + 100))
      done
    fi

    echo "" >> "$sql_file"
  done

  local size
  size=$(wc -c < "$sql_file" | tr -d ' ')
  echo -e "  ${GREEN}Exported: ${sql_file} (${size} bytes)${RESET}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${BLUE}[DRY RUN] Would import to ${ALICE}:${PG_DB}${RESET}"
  else
    echo -e "  ${BLUE}Importing to PostgreSQL...${RESET}"
    cat "$sql_file" | ssh "$ALICE" "sudo -u postgres psql -d ${PG_DB}" 2>&1 | tail -5
    echo -e "  ${GREEN}Imported!${RESET}"
  fi

  echo ""
}

# Migrate
for db_name in $D1_DBS; do
  if [ -n "$SINGLE_DB" ] && [ "$db_name" != "$SINGLE_DB" ]; then
    continue
  fi
  migrate_db "$db_name"
done

echo -e "${PINK}Migration complete!${RESET}"
echo -e "${BLUE}Verify: ssh ${ALICE} \"sudo -u postgres psql -d ${PG_DB} -c '\\dn'\"${RESET}"
