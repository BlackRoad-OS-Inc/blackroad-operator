#!/usr/bin/env zsh
# BR AI — Sovereign Ollama AI frontend with RAG, fleet awareness, and search
# br ai ask|file|diff|review|summarize|models|chat|code|search|explain|fleet

AMBER=$'\033[38;5;214m'; PINK=$'\033[38;5;205m'; VIOLET=$'\033[38;5;135m'
CYAN=$'\033[0;36m'; GREEN=$'\033[0;32m'; RED=$'\033[0;31m'
YELLOW=$'\033[1;33m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; NC=$'\033[0m'

OLLAMA_URLS=("${OLLAMA_URL:-http://localhost:11434}" "http://192.168.4.96:11434" "http://192.168.4.101:11434")
DEFAULT_MODEL="${BR_AI_MODEL:-}"
SEARCH_DB="${HOME}/.blackroad/search.db"
CHAT_DB="${HOME}/.blackroad/chat-history.db"
CODEX_DB="${HOME}/.blackroad/memory/codex/codex.db"
OPS_DB="${HOME}/.blackroad/ai-ops-history.db"
BR_AI_TRUST_MODE="${BR_AI_TRUST_MODE:-observe}"

# Find a live Ollama node
find_ollama() {
  for url in "${OLLAMA_URLS[@]}"; do
    if curl -sf --max-time 2 "${url}/api/tags" >/dev/null 2>&1; then
      echo "$url"
      return
    fi
  done
  echo ""
}

# Pick best available model
pick_model() {
  if [[ -n "$DEFAULT_MODEL" ]]; then echo "$DEFAULT_MODEL"; return; fi
  local url=$(find_ollama)
  [[ -z "$url" ]] && return
  local models
  models=$(curl -sf --max-time 3 "${url}/api/tags" | python3 -c \
    "import json,sys; ms=[m['name'] for m in json.load(sys.stdin).get('models',[])]; print('\n'.join(ms))" 2>/dev/null)
  for preferred in "llama3.2:3b" "llama3.2:1b" "qwen2.5:3b" "qwen2.5:1.5b" "tinyllama:latest" "lucidia:latest" "llama3.2"; do
    echo "$models" | grep -q "^${preferred}" && { echo "$preferred"; return; }
  done
  echo "$models" | head -1
}

# Stream a prompt to Ollama (tries all fleet nodes)
ollama_ask() {
  local model="$1" prompt="$2" system="${3:-}" max_tokens="${4:-512}"
  local url=$(find_ollama)
  [[ -z "$url" ]] && { echo "(Ollama offline)"; return 1; }

  # Use temp file + env vars to avoid shell escaping issues with code content
  local tmpfile=$(mktemp)
  printf '%s' "$prompt" > "$tmpfile"
  export _BR_TMPFILE="$tmpfile" _BR_MODEL="$model" _BR_TOKENS="$max_tokens" _BR_SYSTEM="$system"

  local payload
  payload=$(python3 -c "
import json, os
with open(os.environ['_BR_TMPFILE']) as f: prompt = f.read()
d = {'model': os.environ['_BR_MODEL'], 'prompt': prompt, 'stream': False, 'options': {'num_predict': int(os.environ['_BR_TOKENS'])}}
s = os.environ.get('_BR_SYSTEM', '')
if s: d['system'] = s
print(json.dumps(d))
")
  rm -f "$tmpfile"
  unset _BR_TMPFILE _BR_MODEL _BR_TOKENS _BR_SYSTEM

  curl -sf --max-time 120 -X POST "${url}/api/generate" \
    -H "Content-Type: application/json" \
    -d "$payload" \
  | python3 -c "import json,sys; print(json.load(sys.stdin).get('response',''))"
}

# Search local knowledge base for context (RAG)
search_context() {
  local query="$1" limit="${2:-5}"
  python3 -c "
import sqlite3, sys, os
results = []
# Search unified index
db_path = os.path.expanduser('~/.blackroad/search.db')
if os.path.exists(db_path):
    try:
        db = sqlite3.connect(db_path)
        rows = db.execute('SELECT title, snippet, source FROM entries WHERE entries MATCH ? ORDER BY rank LIMIT ?', (sys.argv[1], int(sys.argv[2]))).fetchall()
        for title, snippet, source in rows:
            results.append(f'[{source}] {title}: {(snippet or \"\")[:200]}')
        db.close()
    except: pass
# Search codex
codex_path = os.path.expanduser('~/.blackroad/memory/codex/codex.db')
if os.path.exists(codex_path):
    try:
        db = sqlite3.connect(codex_path)
        for table in ['solutions', 'patterns', 'best_practices']:
            try:
                rows = db.execute(f'SELECT title, description FROM {table} WHERE title LIKE ? OR description LIKE ? LIMIT 3', (f'%{sys.argv[1]}%', f'%{sys.argv[1]}%')).fetchall()
                for title, desc in rows:
                    results.append(f'[codex] {title}: {(desc or \"\")[:150]}')
            except: pass
        db.close()
    except: pass
print('\n'.join(results[:int(sys.argv[2])]))" "$query" "$limit" 2>/dev/null
}

# Save chat to history DB
save_chat() {
  local role="$1" content="$2" model="$3"
  python3 -c "
import sqlite3, os, uuid, datetime
db = sqlite3.connect(os.path.expanduser('~/.blackroad/chat-history.db'))
db.execute('CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, role TEXT, content TEXT, model TEXT, ts TEXT)')
db.execute('INSERT INTO messages VALUES (?,?,?,?,?)', (str(uuid.uuid4()), '$role', '''${content//\'/\'\'}''', '$model', datetime.datetime.now().isoformat()))
db.commit()
db.close()
" 2>/dev/null
}

init_ops_db() {
  python3 - <<'PY'
import os, sqlite3
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
db = sqlite3.connect(db_path)
db.execute('''
CREATE TABLE IF NOT EXISTS ops_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  mode TEXT NOT NULL,
  trust_mode TEXT NOT NULL,
  model TEXT,
  objective TEXT NOT NULL,
  summary TEXT,
  actions_json TEXT,
  status TEXT NOT NULL,
  note TEXT
)
''')
db.commit()
db.close()
PY
}

log_ops_run() {
  local mode="$1" trust_mode="$2" model="$3" objective="$4" summary="$5" actions_json="$6" status="$7" note="${8:-}"
  OPS_MODE="$mode" OPS_TRUST="$trust_mode" OPS_MODEL="$model" OPS_OBJECTIVE="$objective" OPS_SUMMARY="$summary" OPS_ACTIONS="$actions_json" OPS_STATUS="$status" OPS_NOTE="$note" \
  python3 - <<'PY'
import datetime, os, sqlite3
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
db = sqlite3.connect(db_path)
db.execute('''
CREATE TABLE IF NOT EXISTS ops_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  mode TEXT NOT NULL,
  trust_mode TEXT NOT NULL,
  model TEXT,
  objective TEXT NOT NULL,
  summary TEXT,
  actions_json TEXT,
  status TEXT NOT NULL,
  note TEXT
)
''')
db.execute(
  'INSERT INTO ops_runs (ts, mode, trust_mode, model, objective, summary, actions_json, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  (
    datetime.datetime.now().isoformat(),
    os.environ.get('OPS_MODE', ''),
    os.environ.get('OPS_TRUST', ''),
    os.environ.get('OPS_MODEL', ''),
    os.environ.get('OPS_OBJECTIVE', ''),
    os.environ.get('OPS_SUMMARY', ''),
    os.environ.get('OPS_ACTIONS', ''),
    os.environ.get('OPS_STATUS', ''),
    os.environ.get('OPS_NOTE', ''),
  )
)
db.commit()
db.close()
PY
}

header() {
  local model="$1" url=$(find_ollama)
  local node=""
  case "$url" in
    *96*) node="Cecilia" ;;
    *101*) node="Octavia" ;;
    *localhost*) node="local" ;;
    *) node="fleet" ;;
  esac
  echo ""
  echo "  ${BOLD}${VIOLET}BR AI${NC}  ${DIM}${model} on ${node}${NC}"
  echo "  ${DIM}────────────────────────────────────────${NC}"
}

# ── br ai ask "question" — with RAG context ──
cmd_ask() {
  local q="$*"
  [[ -z "$q" ]] && { echo "  Usage: br ai ask <question>"; exit 1; }
  local model=$(pick_model)
  [[ -z "$model" ]] && { echo "  ${RED}Ollama offline on all nodes${NC}"; exit 1; }
  header "$model"
  echo "  ${CYAN}?${NC} $q"

  # RAG: search for context first
  local context
  context=$(search_context "$q" 5)
  local system="You are a BlackRoad OS assistant. Be concise and direct. 2-3 sentences max."
  local full_prompt="$q"
  if [[ -n "$context" ]]; then
    echo "  ${DIM}(found context from knowledge base)${NC}"
    full_prompt="Context from BlackRoad knowledge base:
${context}

Question: ${q}

Answer using the context above if relevant. Be concise."
    system="You are a BlackRoad OS assistant with access to the internal knowledge base. Answer using the provided context when relevant. Be concise and direct."
  fi
  echo ""
  local answer
  answer=$(ollama_ask "$model" "$full_prompt" "$system")
  echo "$answer" | sed 's/^/  /'
  save_chat "user" "$q" "$model"
  save_chat "assistant" "${answer:0:500}" "$model"
  echo ""
}

# ── br ai search "query" — search + AI answer ──
cmd_search() {
  local q="$*"
  [[ -z "$q" ]] && { echo "  Usage: br ai search <query>"; exit 1; }
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}Searching + answering:${NC} $q"
  echo ""

  # Get search results
  local results
  results=$(search_context "$q" 8)
  if [[ -z "$results" ]]; then
    echo "  ${DIM}No results in knowledge base. Asking AI directly...${NC}"
    echo ""
    ollama_ask "$model" "$q" "You are a BlackRoad OS expert." | sed 's/^/  /'
    echo ""
    return
  fi

  # Show results
  echo "  ${BOLD}Results:${NC}"
  echo "$results" | head -5 | sed 's/^/    /'
  echo ""

  # AI synthesis
  echo "  ${BOLD}Answer:${NC}"
  local prompt="Based on these search results from BlackRoad OS:

${results}

Question: ${q}

Give a clear, direct answer synthesized from the results. If the results don't fully answer, say what's missing."
  ollama_ask "$model" "$prompt" "You synthesize search results into clear answers. Be direct." | sed 's/^/    /'
  echo ""
}

# ── br ai explain <file> — explain what code does ──
cmd_explain() {
  local fpath="$1"
  [[ -z "$fpath" || ! -f "$fpath" ]] && { echo "  ${RED}File not found: $fpath${NC}"; exit 1; }
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}Explaining:${NC} $fpath"
  echo ""
  local content
  content=$(head -200 "$fpath")
  local lang="${fpath##*.}"
  ollama_ask "$model" "Explain this ${lang} code clearly. What does it do? What are the key parts? Who would use this?

${content}" "You explain code clearly for developers. Be concise. Use bullet points." "800" | sed 's/^/  /'
  echo ""
}

# ── br ai fleet — fleet status via AI ──
cmd_fleet() {
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}Fleet status:${NC}"
  echo ""

  # Gather real fleet data
  local fleet_data=""
  for node_url in "${OLLAMA_URLS[@]}"; do
    local node_name=""
    case "$node_url" in
      *96*) node_name="Cecilia" ;;
      *101*) node_name="Octavia" ;;
      *localhost*) node_name="Local" ;;
    esac
    local status="offline"
    local model_count="0"
    if curl -sf --max-time 2 "${node_url}/api/tags" >/dev/null 2>&1; then
      status="online"
      model_count=$(curl -sf --max-time 3 "${node_url}/api/tags" | python3 -c "import json,sys; print(len(json.load(sys.stdin).get('models',[])))" 2>/dev/null || echo "?")
    fi
    echo "  ${node_name}: ${status} (${model_count} models)"
    fleet_data="${fleet_data}${node_name}: ${status}, ${model_count} models. "
  done
  echo ""

  # AI analysis
  echo "  ${BOLD}Analysis:${NC}"
  ollama_ask "$model" "Fleet status: ${fleet_data}. Give a one-sentence health assessment and any recommended actions." "You are a fleet operations analyst. Be brief." | sed 's/^/    /'
  echo ""
}

# ── br ai file <path> [prompt] ──
cmd_file() {
  local fpath="$1"; shift
  local prompt="${*:-Summarize this file. What does it do, what are the key parts?}"
  [[ -z "$fpath" || ! -f "$fpath" ]] && { echo "  ${RED}File not found: $fpath${NC}"; exit 1; }
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}File:${NC} $fpath"
  echo "  ${CYAN}Ask:${NC}  $prompt"
  echo ""
  local content
  content=$(head -300 "$fpath")
  ollama_ask "$model" "File: ${fpath}

${content}

---
${prompt}" "You are a code analyst. Be concise and direct." | sed 's/^/  /'
  echo ""
}

# ── br ai diff [since-commit] ──
cmd_diff() {
  local ref="${1:-HEAD}"
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}Reviewing diff${NC} ${DIM}($ref)${NC}"
  echo ""
  local diff
  if [[ "$ref" == "HEAD" ]]; then
    diff=$(git --no-pager diff --staged 2>/dev/null || git --no-pager diff HEAD 2>/dev/null)
  else
    diff=$(git --no-pager diff "${ref}" 2>/dev/null)
  fi
  [[ -z "$diff" ]] && { echo "  ${DIM}No diff found.${NC}"; exit 0; }
  diff="${diff:0:8000}"
  ollama_ask "$model" "Review this git diff. Flag: bugs, security issues, improvements. Be concise.

${diff}" "You are an expert code reviewer. Flag only real issues." | sed 's/^/  /'
  echo ""
}

# ── br ai review <file> ──
cmd_review() {
  local fpath="$1"
  [[ -z "$fpath" || ! -f "$fpath" ]] && { echo "  ${RED}File not found: $fpath${NC}"; exit 1; }
  cmd_file "$fpath" "Review this code. Find bugs, security issues, and suggest improvements. Be specific."
}

# ── br ai commit ──
cmd_commit() {
  local model=$(pick_model)
  header "$model"
  local diff
  diff=$(git --no-pager diff --staged 2>/dev/null | head -200)
  [[ -z "$diff" ]] && { echo "  ${DIM}No staged changes.${NC}"; exit 0; }
  local msg
  msg=$(ollama_ask "$model" "Generate a concise git commit message. Conventional commits format. One line summary. No markdown.

${diff}" "You generate clean git commit messages.")
  echo "  ${GREEN}Suggested:${NC}"
  echo ""
  echo "$msg" | sed 's/^/  /'
  echo ""
}

# ── br ai summarize <path|dir> ──
cmd_summarize() {
  local target="${1:-.}"
  local model=$(pick_model)
  header "$model"
  if [[ -f "$target" ]]; then
    cmd_file "$target" "Give a 3-sentence summary: what this does, who uses it, what's notable."
  elif [[ -d "$target" ]]; then
    echo "  ${CYAN}Summarizing:${NC} $target"
    echo ""
    local files=$(ls "$target" 2>/dev/null | head -30 | tr '\n' ' ')
    local readme=""
    [[ -f "$target/README.md" ]] && readme=$(head -50 "$target/README.md")
    ollama_ask "$model" "Directory: $target
Files: $files
README: $readme

Summarize what this does in 3-5 sentences." | sed 's/^/  /'
    echo ""
  else
    echo "  ${RED}Not found: $target${NC}"
  fi
}

# ── br ai models ──
cmd_models() {
  header "registry"
  echo "  ${CYAN}Fleet Ollama Models:${NC}"
  echo ""
  for url in "${OLLAMA_URLS[@]}"; do
    local node=""
    case "$url" in
      *96*) node="Cecilia" ;;
      *101*) node="Octavia" ;;
      *localhost*) node="Local" ;;
      *) node="$url" ;;
    esac
    echo "  ${BOLD}${node}:${NC}"
    curl -sf --max-time 3 "${url}/api/tags" | python3 -c "
import json,sys
try:
  data = json.load(sys.stdin)
  for m in data.get('models', []):
    size = m.get('size', 0)
    gb = f'{size/1e9:.1f}GB' if size > 1e9 else f'{size/1e6:.0f}MB'
    print(f\"    {m['name']:<30} {gb}\")
except: pass
" 2>/dev/null || echo "    ${DIM}offline${NC}"
  done
  echo ""
  echo "  ${DIM}Active:${NC} ${AMBER}$(pick_model)${NC}"
  echo "  ${DIM}Set:${NC}    export BR_AI_MODEL=<name>"
  echo ""
}

# ── br ai chat [model] — interactive REPL with memory ──
cmd_chat() {
  local model="${1:-$(pick_model)}"
  [[ -z "$model" ]] && { echo "  ${RED}Ollama offline${NC}"; exit 1; }
  header "$model"
  echo "  ${DIM}Chat with memory — type 'exit' to quit, '/search <q>' to search${NC}"
  echo ""
  local history=""
  while true; do
    printf "  ${AMBER}you${NC}  > "
    read -r input
    [[ "$input" == "exit" || "$input" == "quit" ]] && break
    [[ -z "$input" ]] && continue

    # In-chat search
    if [[ "$input" == /search* ]]; then
      local sq="${input#/search }"
      echo ""
      echo "  ${CYAN}Searching:${NC} $sq"
      search_context "$sq" 5 | sed 's/^/    /'
      echo ""
      continue
    fi

    # Build context from conversation history
    local system="You are a BlackRoad OS AI assistant. You have memory of this conversation. Be concise, helpful, and warm."
    local prompt="${input}"
    if [[ -n "$history" ]]; then
      prompt="Previous conversation:
${history}

User: ${input}"
    fi

    echo ""
    printf "  ${VIOLET}ai ${NC}  > "
    local response
    response=$(ollama_ask "$model" "$prompt" "$system")
    echo "$response" | sed 's/^/         /'
    echo ""

    # Append to history (keep last 6 exchanges)
    history="${history}
User: ${input}
AI: ${response:0:200}"
    history=$(echo "$history" | tail -24)

    save_chat "user" "$input" "$model"
    save_chat "assistant" "${response:0:500}" "$model"
  done
  echo "  ${DIM}Session ended.${NC}"
}

# ── br ai code <task> ──
cmd_code() {
  local task="$*"
  [[ -z "$task" ]] && { echo "  Usage: br ai code <task>"; exit 1; }
  local model=$(pick_model)
  header "$model"
  echo "  ${CYAN}Coding:${NC} $task"
  echo ""
  ollama_ask "$model" "$task" "You are an expert programmer for BlackRoad OS. Write clean, working code. Brief explanation." "1024" | sed 's/^/  /'
  echo ""
}

# ── br ai pipe — read from stdin ──
cmd_pipe() {
  local prompt="${*:-Analyze this input. Be concise.}"
  local input
  input=$(cat)
  local model=$(pick_model)
  [[ -z "$model" ]] && { echo "Ollama offline"; exit 1; }
  ollama_ask "$model" "${prompt}

${input:0:6000}" "You are a BlackRoad OS assistant. Be concise."
}

ops_schema() {
  cat <<'EOF'
Return JSON only with this exact schema:
{
  "summary": "short sentence",
  "actions": [
    {
      "command": "health.status|pi.status|pi.models|pi.worlds|pi.read|pi.logs|pi.task|pi.generate|deploy.detect|deploy.status|deploy.watch.github|deploy.rollback.github|cloudflare.zones|cloudflare.dns.list|cloudflare.analytics|cloudflare.cache.purge|workflows.list|workflows.runs|workflows.view|workflows.dispatch|sites.generate",
      "args": ["arg1", "arg2"],
      "why": "short reason"
    }
  ]
}
Rules:
- Use at most 3 actions.
- Prefer read-only actions first.
- Use pi.task only when the request explicitly asks to queue work on a Pi.
- Use pi.generate only for bounded text/content generation on a Pi. Args are [node, prompt].
- For pi.worlds args are [node, count?].
- For pi.read args are [node, name?].
- For pi.logs args are [node, service?].
- For pi.task args are [node, title, description?, agent?].
- For deploy.rollback.github args are [repo?]. Default repo is the current repo.
- For cloudflare.dns.list args are [zone].
- For cloudflare.analytics args are [zone].
- For cloudflare.cache.purge args are [zone].
- For workflows.runs args are [repo?]. Default repo is the current repo.
- For workflows.view args are [run_id, repo?]. Default repo is the current repo.
- For workflows.dispatch args are [workflow, repo?, ref?]. Only use these workflows: Connector: Email Digest, Connector: Stripe, Agent: Workflow Sync, Agent: Repo Improver, Check Dependencies, Scrape & Index All Orgs, Autonomous Websites, Agent GitHub Assets.
- For sites.generate args must be [].
- Never invent commands outside the allowlist.
EOF
}

resolve_ops_command() {
  local action="$1"
  shift
  case "$action" in
    health.status)
      printf '%s\n' "\"${BR_ROOT}/tools/health-check/br-health.sh\""
      ;;
    pi.status)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" status"
      ;;
    pi.models)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" models ${1:-aria64}"
      ;;
    pi.worlds)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" worlds ${1:-aria64} ${2:-10}"
      ;;
    pi.read)
      if [[ -n "$2" ]]; then
        printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" read ${1:-aria64} \"$2\""
      else
        printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" read ${1:-aria64}"
      fi
      ;;
    deploy.detect)
      printf '%s\n' "\"${BR_ROOT}/tools/deploy-manager/br-deploy.sh\" detect"
      ;;
    deploy.status)
      printf '%s\n' "\"${BR_ROOT}/tools/deploy-manager/br-deploy.sh\" status"
      ;;
    pi.logs)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" logs ${1:-aria64} ${2:-world}"
      ;;
    pi.task)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" task ${1:-aria64} \"$2\" \"$3\" ${4:-LUCIDIA}"
      ;;
    pi.generate)
      printf '%s\n' "\"${BR_ROOT}/tools/pi-manager/br-pi.sh\" generate ${1:-aria64} \"$2\""
      ;;
    deploy.watch.github)
      printf '%s\n' "\"${BR_ROOT}/tools/deploy-manager/br-deploy.sh\" watch github"
      ;;
    deploy.rollback.github)
      printf '%s\n' "cd \"${BR_ROOT}\" && gh run rerun \"\$(gh run list --repo \"${1:-BlackRoad-OS-Inc/blackroad-operator}\" --limit 5 --json databaseId,conclusion -q '[.[] | select(.conclusion==\"success\")][1].databaseId')\" --repo \"${1:-BlackRoad-OS-Inc/blackroad-operator}\""
      ;;
    cloudflare.dns.list)
      printf '%s\n' "\"${BR_ROOT}/tools/cloudflare/br-cloudflare.sh\" dns list \"$1\""
      ;;
    cloudflare.zones)
      printf '%s\n' "\"${BR_ROOT}/tools/cloudflare/br-cloudflare.sh\" zones"
      ;;
    cloudflare.analytics)
      printf '%s\n' "\"${BR_ROOT}/tools/cloudflare/br-cloudflare.sh\" analytics \"$1\""
      ;;
    cloudflare.cache.purge)
      printf '%s\n' "\"${BR_ROOT}/tools/cloudflare/br-cloudflare.sh\" cache \"$1\""
      ;;
    workflows.list)
      printf '%s\n' "gh workflow list"
      ;;
    workflows.runs)
      printf '%s\n' "gh run list --repo \"${1:-BlackRoad-OS-Inc/blackroad-operator}\" --limit 10"
      ;;
    workflows.view)
      printf '%s\n' "gh run view \"${1}\" --repo \"${2:-BlackRoad-OS-Inc/blackroad-operator}\""
      ;;
    workflows.dispatch)
      printf '%s\n' "gh workflow run \"${1}\" --repo \"${2:-BlackRoad-OS-Inc/blackroad-operator}\" --ref \"${3:-main}\""
      ;;
    sites.generate)
      printf '%s\n' "python3 \"${BR_ROOT}/scripts/generate_public_sites.py\""
      ;;
    *)
      return 1
      ;;
  esac
}

render_ops_plan() {
  python3 - <<'PY'
import json, sys
raw = sys.stdin.read().strip()
if not raw:
    sys.exit(1)
start = raw.find('{')
end = raw.rfind('}')
if start == -1 or end == -1 or end < start:
    print(raw)
    sys.exit(0)
data = json.loads(raw[start:end+1])
print(f"  Summary: {data.get('summary', 'No summary provided')}")
for idx, action in enumerate(data.get('actions', []), start=1):
    args = action.get('args') or []
    arg_text = " ".join(str(a) for a in args)
    line = f"  {idx}. {action.get('command', 'unknown')}"
    if arg_text:
        line += f" {arg_text}"
    why = action.get('why')
    if why:
        line += f"  [{why}]"
    print(line)
PY
}

run_ops_plan() {
  local raw_plan="$1"
  local execute_mode="$2"
  RAW_PLAN="$raw_plan" EXECUTE_MODE="$execute_mode" BR_ROOT="$BR_ROOT" BR_AI_TRUST_MODE="$BR_AI_TRUST_MODE" python3 - <<'PY'
import json, os, subprocess, sys
raw = os.environ["RAW_PLAN"].strip()
mode = os.environ["EXECUTE_MODE"]
trust_mode = os.environ.get("BR_AI_TRUST_MODE", "observe")
start = raw.find('{')
end = raw.rfind('}')
if start == -1 or end == -1 or end < start:
    print("  Could not parse Ollama plan.")
    sys.exit(1)
data = json.loads(raw[start:end+1])
summary = data.get('summary', 'No summary provided')
print(f"  Summary: {data.get('summary', 'No summary provided')}")
actions = data.get('actions', [])
if not actions:
    print("  No executable actions proposed.")
    print("OPS_RESULT_JSON=" + json.dumps({"summary": summary, "actions": actions, "status": "no_actions", "note": "No executable actions proposed."}))
    sys.exit(0)
read_only = {
    "health.status",
    "pi.status",
    "pi.models",
    "pi.worlds",
    "pi.read",
    "pi.logs",
    "deploy.detect",
    "deploy.status",
    "deploy.watch.github",
    "cloudflare.zones",
    "cloudflare.dns.list",
    "cloudflare.analytics",
    "workflows.list",
    "workflows.runs",
    "workflows.view",
}
mutating = {
    "pi.task",
    "pi.generate",
    "deploy.rollback.github",
    "cloudflare.cache.purge",
    "workflows.dispatch",
    "sites.generate",
}
print(f"  Trust mode: {trust_mode}")
for idx, action in enumerate(actions, start=1):
    cmd = action.get('command', '')
    args = [str(a) for a in (action.get('args') or [])]
    why = action.get('why', '')
    action_class = "mutating" if cmd in mutating else "read-only"
    print(f"  {idx}. {cmd} {' '.join(args)}".rstrip())
    if why:
        print(f"     reason: {why}")
    print(f"     class: {action_class}")
    if mode != "execute":
        continue
    if cmd in mutating and trust_mode != "remediate":
        print(f"     skipped: {cmd} requires BR_AI_TRUST_MODE=remediate")
        continue
    br_root = os.environ["BR_ROOT"]
    table = {
        "health.status": [f"{br_root}/tools/health-check/br-health.sh"],
        "pi.status": [f"{br_root}/tools/pi-manager/br-pi.sh", "status"],
        "pi.models": [f"{br_root}/tools/pi-manager/br-pi.sh", "models", args[0] if args else "aria64"],
        "pi.worlds": [f"{br_root}/tools/pi-manager/br-pi.sh", "worlds", args[0] if args else "aria64", args[1] if len(args) > 1 else "10"],
        "pi.read": [f"{br_root}/tools/pi-manager/br-pi.sh", "read", args[0] if args else "aria64", args[1] if len(args) > 1 else ""],
        "pi.logs": [f"{br_root}/tools/pi-manager/br-pi.sh", "logs", args[0] if args else "aria64", args[1] if len(args) > 1 else "world"],
        "pi.task": [f"{br_root}/tools/pi-manager/br-pi.sh", "task", args[0] if args else "aria64", args[1] if len(args) > 1 else "Untitled task", args[2] if len(args) > 2 else (args[1] if len(args) > 1 else "Untitled task"), args[3] if len(args) > 3 else "LUCIDIA"],
        "pi.generate": [f"{br_root}/tools/pi-manager/br-pi.sh", "generate", args[0] if args else "aria64", args[1] if len(args) > 1 else "Create something useful for BlackRoad."],
        "deploy.detect": [f"{br_root}/tools/deploy-manager/br-deploy.sh", "detect"],
        "deploy.status": [f"{br_root}/tools/deploy-manager/br-deploy.sh", "status"],
        "deploy.watch.github": [f"{br_root}/tools/deploy-manager/br-deploy.sh", "watch", "github"],
        "deploy.rollback.github": [f"{br_root}/tools/deploy-manager/br-deploy.sh", "rollback", "github"],
        "cloudflare.zones": [f"{br_root}/tools/cloudflare/br-cloudflare.sh", "zones"],
        "cloudflare.dns.list": [f"{br_root}/tools/cloudflare/br-cloudflare.sh", "dns", "list", args[0] if args else ""],
        "cloudflare.analytics": [f"{br_root}/tools/cloudflare/br-cloudflare.sh", "analytics", args[0] if args else ""],
        "cloudflare.cache.purge": [f"{br_root}/tools/cloudflare/br-cloudflare.sh", "cache", args[0] if args else ""],
        "workflows.list": ["gh", "workflow", "list"],
        "workflows.runs": ["gh", "run", "list", "--repo", args[0] if args else "BlackRoad-OS-Inc/blackroad-operator", "--limit", "10"],
        "workflows.view": ["gh", "run", "view", args[0] if args else "", "--repo", args[1] if len(args) > 1 else "BlackRoad-OS-Inc/blackroad-operator"],
        "sites.generate": ["python3", f"{br_root}/scripts/generate_public_sites.py"],
    }
    allowed_dispatch = {
        "Connector: Email Digest",
        "Connector: Stripe",
        "Agent: Workflow Sync",
        "Agent: Repo Improver",
        "Check Dependencies",
        "Scrape & Index All Orgs",
        "Autonomous Websites",
        "Agent GitHub Assets",
    }
    if cmd == "workflows.dispatch":
        workflow = args[0] if args else ""
        if workflow not in allowed_dispatch:
            print(f"     skipped: unsupported workflow dispatch {workflow}")
            continue
        repo = args[1] if len(args) > 1 else "BlackRoad-OS-Inc/blackroad-operator"
        ref = args[2] if len(args) > 2 else "main"
        table[cmd] = ["gh", "workflow", "run", workflow, "--repo", repo, "--ref", ref]
    if cmd not in table:
        print(f"     skipped: unsupported action {cmd}")
        continue
    command = [part for part in table[cmd] if part != ""]
    print(f"     running: {' '.join(command)}")
    proc = subprocess.run(command, text=True, capture_output=True)
    output = (proc.stdout or proc.stderr or "").strip()
    if output:
      lines = output.splitlines()
      preview = "\n".join(lines[:20])
      print(preview)
      if len(lines) > 20:
        print("...output truncated...")
    if proc.returncode != 0:
        print(f"     exit: {proc.returncode}")
        print("OPS_RESULT_JSON=" + json.dumps({"summary": summary, "actions": actions, "status": "error", "note": f"{cmd} exited with {proc.returncode}"}))
        sys.exit(proc.returncode)
print("OPS_RESULT_JSON=" + json.dumps({"summary": summary, "actions": actions, "status": "success" if mode == "execute" else "planned", "note": ""}))
PY
}

cmd_history() {
  init_ops_db
  local limit="${1:-15}"
  header "history"
  echo "  ${CYAN}Lucidia ops history:${NC}"
  echo ""
  python3 - "$limit" <<'PY'
import os, sqlite3, sys
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
db = sqlite3.connect(db_path)
rows = db.execute(
  "SELECT id, ts, mode, trust_mode, status, objective FROM ops_runs ORDER BY id DESC LIMIT ?",
  (int(sys.argv[1]),)
).fetchall()
for row in rows:
  id_, ts, mode, trust, status, objective = row
  print(f"  #{id_:<4} {ts[:19]}  {mode:<10} {trust:<10} {status:<10} {objective[:90]}")
db.close()
PY
  echo ""
}

cmd_last() {
  init_ops_db
  header "last"
  echo "  ${CYAN}Most recent Lucidia ops run:${NC}"
  echo ""
  python3 - <<'PY'
import json, os, sqlite3
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
db = sqlite3.connect(db_path)
row = db.execute(
  "SELECT id, ts, mode, trust_mode, model, objective, summary, actions_json, status, note FROM ops_runs ORDER BY id DESC LIMIT 1"
).fetchone()
db.close()
if not row:
    print("  No ops history yet.")
    raise SystemExit(0)
id_, ts, mode, trust, model, objective, summary, actions_json, status, note = row
print(f"  id:       {id_}")
print(f"  ts:       {ts}")
print(f"  mode:     {mode}")
print(f"  trust:    {trust}")
print(f"  model:    {model or 'unknown'}")
print(f"  status:   {status}")
print(f"  objective:{' ' if objective else ''}{objective}")
print(f"  summary:  {summary or ''}")
if note:
    print(f"  note:     {note}")
actions = []
if actions_json:
    try:
        actions = json.loads(actions_json)
    except Exception:
        actions = []
if actions:
    print("  actions:")
    for idx, action in enumerate(actions, start=1):
        args = " ".join(str(a) for a in (action.get("args") or []))
        why = action.get("why", "")
        line = f"    {idx}. {action.get('command','unknown')}"
        if args:
            line += f" {args}"
        if why:
            line += f"  [{why}]"
        print(line)
PY
  echo ""
}

cmd_export() {
  init_ops_db
  local format="${1:-markdown}"
  local limit="${2:-20}"
  header "export"
  echo "  ${CYAN}Exporting Lucidia ops history:${NC} ${format} (${limit})"
  echo ""
  python3 - "$format" "$limit" <<'PY'
import json, os, sqlite3, sys
fmt = sys.argv[1]
limit = int(sys.argv[2])
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
db = sqlite3.connect(db_path)
rows = db.execute(
  "SELECT id, ts, mode, trust_mode, model, objective, summary, actions_json, status, note FROM ops_runs ORDER BY id DESC LIMIT ?",
  (limit,)
).fetchall()
db.close()
items = []
for row in rows:
    id_, ts, mode, trust, model, objective, summary, actions_json, status, note = row
    try:
        actions = json.loads(actions_json) if actions_json else []
    except Exception:
        actions = []
    items.append({
        "id": id_,
        "ts": ts,
        "mode": mode,
        "trust_mode": trust,
        "model": model,
        "objective": objective,
        "summary": summary,
        "actions": actions,
        "status": status,
        "note": note,
    })
if fmt == "json":
    print(json.dumps(items, indent=2))
else:
    print("# Lucidia Ops Export")
    print("")
    for item in items:
      print(f"## Run #{item['id']}")
      print("")
      print(f"- Time: `{item['ts']}`")
      print(f"- Mode: `{item['mode']}`")
      print(f"- Trust: `{item['trust_mode']}`")
      print(f"- Model: `{item['model'] or 'unknown'}`")
      print(f"- Status: `{item['status']}`")
      print(f"- Objective: {item['objective']}")
      if item['summary']:
          print(f"- Summary: {item['summary']}")
      if item['note']:
          print(f"- Note: {item['note']}")
      print("- Actions:")
      if item["actions"]:
          for action in item["actions"]:
              args = " ".join(str(a) for a in (action.get("args") or []))
              why = action.get("why", "")
              text = f"  - `{action.get('command','unknown')}`"
              if args:
                  text += f" `{args}`"
              if why:
                  text += f" — {why}"
              print(text)
      else:
          print("  - none")
      print("")
PY
  echo ""
}

cmd_replay() {
  init_ops_db
  local target="${1:-last}"
  local replay_mode="${2:-auto}"
  local trust="${BR_AI_TRUST_MODE}"
  if [[ "$replay_mode" == "remediate" ]]; then
    trust="remediate"
  fi
  header "replay"
  echo "  ${CYAN}Replaying Lucidia ops run:${NC} ${target}"
  echo "  ${DIM}trust:${NC} ${trust}"
  echo ""
  local replay_payload
  replay_payload=$(REPLAY_TARGET="$target" python3 - <<'PY'
import json, os, sqlite3, sys
db_path = os.path.expanduser('~/.blackroad/ai-ops-history.db')
db = sqlite3.connect(db_path)
target = os.environ.get("REPLAY_TARGET", "last")
if target == "last":
    row = db.execute(
      "SELECT id, objective, summary, actions_json, trust_mode, status FROM ops_runs ORDER BY id DESC LIMIT 1"
    ).fetchone()
else:
    row = db.execute(
      "SELECT id, objective, summary, actions_json, trust_mode, status FROM ops_runs WHERE id = ?",
      (int(target),)
    ).fetchone()
db.close()
if not row:
    print("")
    raise SystemExit(0)
id_, objective, summary, actions_json, trust_mode, status = row
try:
    actions = json.loads(actions_json) if actions_json else []
except Exception:
    actions = []
print(json.dumps({
  "id": id_,
  "objective": objective,
  "summary": summary or "",
  "actions": actions,
  "trust_mode": trust_mode,
  "status": status,
}))
PY
)
  if [[ -z "$replay_payload" ]]; then
    echo "  ${DIM}No matching ops run found.${NC}"
    echo ""
    return 0
  fi
  local replay_id objective summary actions_json saved_trust
  replay_id=$(REPLAY_PAYLOAD="$replay_payload" python3 - <<'PY'
import json, os
print(json.loads(os.environ["REPLAY_PAYLOAD"])["id"])
PY
)
  objective=$(REPLAY_PAYLOAD="$replay_payload" python3 - <<'PY'
import json, os
print(json.loads(os.environ["REPLAY_PAYLOAD"])["objective"])
PY
)
  summary=$(REPLAY_PAYLOAD="$replay_payload" python3 - <<'PY'
import json, os
print(json.loads(os.environ["REPLAY_PAYLOAD"]).get("summary",""))
PY
)
  actions_json=$(REPLAY_PAYLOAD="$replay_payload" python3 - <<'PY'
import json, os
data=json.loads(os.environ["REPLAY_PAYLOAD"])
print(json.dumps(data.get("actions", [])))
PY
)
  saved_trust=$(REPLAY_PAYLOAD="$replay_payload" python3 - <<'PY'
import json, os
print(json.loads(os.environ["REPLAY_PAYLOAD"]).get("trust_mode","observe"))
PY
)
  echo "  Replaying run #${replay_id}"
  echo "  Objective: ${objective}"
  [[ -n "$summary" ]] && echo "  Summary: ${summary}"
  echo "  Recorded trust: ${saved_trust}"
  echo ""
  local raw_plan
  raw_plan=$(REPLAY_SUMMARY="$summary" REPLAY_ACTIONS="$actions_json" python3 - <<'PY'
import json, os
print(json.dumps({
  "summary": os.environ.get("REPLAY_SUMMARY","Replayed Lucidia ops run"),
  "actions": json.loads(os.environ.get("REPLAY_ACTIONS","[]")),
}))
PY
)
  local replay_output
  local replay_status=0
  replay_output=$(BR_AI_TRUST_MODE="$trust" run_ops_plan "$raw_plan" execute) || replay_status=$?
  printf '%s\n' "$replay_output"
  local result_json
  result_json=$(printf '%s\n' "$replay_output" | sed -n 's/^OPS_RESULT_JSON=//p' | tail -1)
  local status_text="replayed"
  local note="replay of run #${replay_id}"
  if [[ -n "$result_json" ]]; then
    status_text=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(data.get('status','replayed'))
PY
)
    local replay_note
    replay_note=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(data.get('note',''))
PY
)
    [[ -n "$replay_note" ]] && note="${note}; ${replay_note}"
  fi
  [[ $replay_status -ne 0 ]] && status_text="error"
  log_ops_run "replay" "$trust" "replay:${saved_trust}" "$objective" "$summary" "$actions_json" "$status_text" "$note"
  echo ""
  [[ $replay_status -ne 0 ]] && return $replay_status
}

cmd_ops() {
  local execute_mode="${1:-plan}"
  shift
  local objective="$*"
  [[ -z "$objective" ]] && {
    echo "  Usage: br ai ops <objective>"
    echo "  Example: br ai ops check Pi fleet health and list models"
    exit 1
  }
  local model=$(pick_model)
  [[ -z "$model" ]] && { echo "  ${RED}Ollama offline on all nodes${NC}"; exit 1; }
  init_ops_db
  header "$model"
  echo "  ${CYAN}Ops objective:${NC} $objective"
  echo "  ${DIM}trust:${NC} ${BR_AI_TRUST_MODE}"
  echo ""
  local prompt
  prompt="You are Lucidia operating the BlackRoad local control plane.
Choose the smallest safe set of actions needed for this objective:
${objective}

Available commands:
- health.status
- pi.status
- pi.models
- pi.worlds
- pi.read
- pi.logs
- pi.task
- pi.generate
- deploy.detect
- deploy.status
- deploy.watch.github
- deploy.rollback.github
- cloudflare.zones
- cloudflare.dns.list
- cloudflare.analytics
- cloudflare.cache.purge
- workflows.list
- workflows.runs
- workflows.view
- workflows.dispatch
- sites.generate

$(ops_schema)"
  local plan
  plan=$(ollama_ask "$model" "$prompt" "You are a precise BlackRoad operations planner. Return valid JSON only." "700")
  if [[ -z "$plan" ]]; then
    echo "  ${RED}No plan returned from Ollama.${NC}"
    log_ops_run "$execute_mode" "$BR_AI_TRUST_MODE" "$model" "$objective" "" "" "error" "No plan returned from Ollama"
    exit 1
  fi
  if [[ "$execute_mode" == "execute" ]]; then
    echo "  ${BOLD}Autonomous execution:${NC}"
  else
    echo "  ${BOLD}Plan:${NC}"
  fi
  local ops_output
  local ops_status=0
  ops_output=$(run_ops_plan "$plan" "$execute_mode") || ops_status=$?
  printf '%s\n' "$ops_output"
  local result_json
  result_json=$(printf '%s\n' "$ops_output" | sed -n 's/^OPS_RESULT_JSON=//p' | tail -1)
  local summary=""
  local actions_json="[]"
  local status_text="planned"
  local note=""
  if [[ -n "$result_json" ]]; then
    summary=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(data.get('summary',''))
PY
)
    actions_json=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(json.dumps(data.get('actions', [])))
PY
)
    status_text=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(data.get('status','planned'))
PY
)
    note=$(RESULT_JSON="$result_json" python3 - <<'PY'
import json, os
data=json.loads(os.environ['RESULT_JSON'])
print(data.get('note',''))
PY
)
  fi
  [[ $ops_status -ne 0 ]] && status_text="error"
  log_ops_run "$execute_mode" "$BR_AI_TRUST_MODE" "$model" "$objective" "$summary" "$actions_json" "$status_text" "$note"
  [[ $ops_status -ne 0 ]] && exit $ops_status
  echo ""
}

cmd_autonomous() {
  cmd_ops execute "$@"
}

cmd_remediate() {
  local objective="$*"
  [[ -z "$objective" ]] && {
    echo "  Usage: br ai remediate <objective>"
    echo "  Example: br ai remediate rerun the previous successful GitHub deploy workflow"
    exit 1
  }
  BR_AI_TRUST_MODE=remediate cmd_ops execute "$objective"
}

show_help() {
  echo ""
  echo "  ${VIOLET}${BOLD}br ai${NC}  — Sovereign AI (Ollama fleet)"
  echo ""
  echo "  ${BOLD}Ask & Search:${NC}"
  echo "    ${CYAN}ask <question>${NC}        Ask with RAG context from knowledge base"
  echo "    ${CYAN}search <query>${NC}        Search + AI-synthesized answer"
  echo "    ${CYAN}explain <file>${NC}        Explain what code does"
  echo ""
  echo "  ${BOLD}Code:${NC}"
  echo "    ${CYAN}file <path> [prompt]${NC}  Ask about a file"
  echo "    ${CYAN}review <path>${NC}         Code review"
  echo "    ${CYAN}diff [ref]${NC}            Review git diff"
  echo "    ${CYAN}commit${NC}                Generate commit message"
  echo "    ${CYAN}code <task>${NC}           Generate code"
  echo ""
  echo "  ${BOLD}System:${NC}"
  echo "    ${CYAN}chat [model]${NC}          Interactive chat with memory"
  echo "    ${CYAN}fleet${NC}                 Fleet Ollama status + analysis"
  echo "    ${CYAN}models${NC}                List all models across fleet"
  echo "    ${CYAN}summarize <path>${NC}      Summarize file or directory"
  echo "    ${CYAN}history [limit]${NC}       Show Lucidia ops history"
  echo "    ${CYAN}last${NC}                  Show the most recent Lucidia ops run"
  echo "    ${CYAN}export [fmt] [limit]${NC} Export Lucidia ops history as markdown or json"
  echo "    ${CYAN}replay [last|id] [mode]${NC} Replay a recorded ops run; mode can be auto or remediate"
  echo "    ${CYAN}ops <objective>${NC}       Plan actions only"
  echo "    ${CYAN}autonomous <objective>${NC} Execute read-only actions; mutating actions require remediation trust"
  echo "    ${CYAN}remediate <objective>${NC} Execute read-only and mutating allowlisted actions"
  echo ""
  echo "  ${BOLD}Pipe:${NC}"
  echo "    ${DIM}cat file.py | br ai pipe 'find bugs'${NC}"
  echo "    ${DIM}git log | br ai pipe 'summarize changes'${NC}"
  echo ""
  echo "  ${BOLD}Config:${NC}"
  echo "    ${DIM}export BR_AI_MODEL=llama3.2:3b${NC}"
  echo "    ${DIM}export OLLAMA_URL=http://192.168.4.96:11434${NC}"
  echo "    ${DIM}export BR_AI_TRUST_MODE=observe|remediate${NC}"
  echo ""
}

case "${1:-help}" in
  ask)           shift; cmd_ask "$@" ;;
  search|s)      shift; cmd_search "$@" ;;
  explain)       shift; cmd_explain "$@" ;;
  file)          shift; cmd_file "$@" ;;
  review)        shift; cmd_review "$@" ;;
  diff)          shift; cmd_diff "$@" ;;
  commit)        cmd_commit ;;
  summarize|sum) shift; cmd_summarize "$@" ;;
  code)          shift; cmd_code "$@" ;;
  chat)          cmd_chat "$2" ;;
  fleet|status)  cmd_fleet ;;
  models|ls)     cmd_models ;;
  history|hist)  shift; cmd_history "$@" ;;
  last)          cmd_last ;;
  export)        shift; cmd_export "$@" ;;
  replay)        shift; cmd_replay "$@" ;;
  ops)           shift; cmd_ops plan "$@" ;;
  autonomous|auto) shift; cmd_autonomous "$@" ;;
  remediate)     shift; cmd_remediate "$@" ;;
  pipe)          shift; cmd_pipe "$@" ;;
  help|*)        show_help ;;
esac
