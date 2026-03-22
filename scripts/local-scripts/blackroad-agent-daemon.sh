#!/bin/bash
# BlackRoad Agent Daemon — runs on Alice Pi
# Lightweight HTTP server that accepts commands from chat.blackroad.io
# Handles: shell exec, file read/write/edit, git ops, codebase search
# Uses socat for HTTP — no dependencies needed
# Usage: ./blackroad-agent-daemon.sh [port]

PORT="${1:-8080}"
SANDBOX_ROOT="/home/pi/projects"
MAX_OUTPUT=8000
TIMEOUT=30

mkdir -p "$SANDBOX_ROOT"

log() { echo "[$(date '+%H:%M:%S')] $*" >&2; }

handle_request() {
  local method path body content_length=""

  # Read request line
  read -r method path _
  method=$(echo "$method" | tr -d '\r')
  path=$(echo "$path" | tr -d '\r')

  # Read headers
  while IFS= read -r header; do
    header=$(echo "$header" | tr -d '\r')
    [ -z "$header" ] && break
    case "$header" in
      Content-Length:*|content-length:*) content_length="${header#*: }" ;;
    esac
  done

  # Read body
  body=""
  if [ -n "$content_length" ] && [ "$content_length" -gt 0 ] 2>/dev/null; then
    body=$(head -c "$content_length")
  fi

  log "$method $path"

  # CORS preflight
  if [ "$method" = "OPTIONS" ]; then
    echo "HTTP/1.1 200 OK"
    echo "Access-Control-Allow-Origin: *"
    echo "Access-Control-Allow-Methods: GET,POST,OPTIONS"
    echo "Access-Control-Allow-Headers: Content-Type"
    echo "Content-Length: 0"
    echo ""
    return
  fi

  respond() {
    local status="$1" body="$2"
    local len=${#body}
    echo "HTTP/1.1 $status"
    echo "Content-Type: application/json"
    echo "Access-Control-Allow-Origin: *"
    echo "Content-Length: $len"
    echo ""
    echo -n "$body"
  }

  # Health
  if [ "$path" = "/health" ]; then
    respond "200 OK" '{"status":"ok","node":"alice","pid":'$$'}'
    return
  fi

  # Shell execution
  if [ "$path" = "/exec" ] && [ "$method" = "POST" ]; then
    local cmd lang code timeout_val
    cmd=$(echo "$body" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('command',''))" 2>/dev/null)
    lang=$(echo "$body" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('language','bash'))" 2>/dev/null)
    code=$(echo "$body" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('code',''))" 2>/dev/null)
    timeout_val=$(echo "$body" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('timeout',$TIMEOUT))" 2>/dev/null)

    # Use command if provided, otherwise use code with language
    if [ -n "$cmd" ]; then
      code="$cmd"
      lang="bash"
    fi

    if [ -z "$code" ]; then
      respond "400 Bad Request" '{"error":"No command or code provided"}'
      return
    fi

    local output exit_code
    case "$lang" in
      python|python3)
        output=$(timeout "$timeout_val" python3 -c "$code" 2>&1)
        exit_code=$?
        ;;
      js|javascript|node)
        output=$(timeout "$timeout_val" node -e "$code" 2>&1)
        exit_code=$?
        ;;
      bash|sh)
        output=$(timeout "$timeout_val" bash -c "$code" 2>&1)
        exit_code=$?
        ;;
      *)
        respond "400 Bad Request" "{\"error\":\"Unsupported language: $lang\"}"
        return
        ;;
    esac

    # Truncate output
    if [ ${#output} -gt $MAX_OUTPUT ]; then
      output="${output:0:$MAX_OUTPUT}... (truncated)"
    fi

    # JSON-escape output
    local json_output
    json_output=$(python3 -c "import json,sys;print(json.dumps(sys.stdin.read()))" <<< "$output")

    respond "200 OK" "{\"output\":$json_output,\"exitCode\":$exit_code,\"language\":\"$lang\"}"
    return
  fi

  # File read
  if [ "$path" = "/file/read" ] && [ "$method" = "POST" ]; then
    local filepath
    filepath=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('path',''))" 2>/dev/null)

    if [ -z "$filepath" ] || [ ! -e "$filepath" ]; then
      respond "404 Not Found" "{\"error\":\"File not found: $filepath\"}"
      return
    fi

    if [ -d "$filepath" ]; then
      local listing
      listing=$(ls -la "$filepath" 2>&1 | head -50)
      local json_listing
      json_listing=$(python3 -c "import json,sys;print(json.dumps(sys.stdin.read()))" <<< "$listing")
      respond "200 OK" "{\"type\":\"directory\",\"path\":\"$filepath\",\"listing\":$json_listing}"
      return
    fi

    local content
    content=$(head -c 50000 "$filepath" 2>&1)
    local json_content
    json_content=$(python3 -c "import json,sys;print(json.dumps(sys.stdin.read()))" <<< "$content")
    local lines
    lines=$(wc -l < "$filepath")
    local size
    size=$(stat -c%s "$filepath" 2>/dev/null || stat -f%z "$filepath" 2>/dev/null)

    respond "200 OK" "{\"type\":\"file\",\"path\":\"$filepath\",\"content\":$json_content,\"lines\":$lines,\"size\":$size}"
    return
  fi

  # File write
  if [ "$path" = "/file/write" ] && [ "$method" = "POST" ]; then
    local filepath content
    filepath=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('path',''))" 2>/dev/null)
    content=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('content',''))" 2>/dev/null)

    if [ -z "$filepath" ]; then
      respond "400 Bad Request" '{"error":"No path provided"}'
      return
    fi

    mkdir -p "$(dirname "$filepath")"
    echo "$content" > "$filepath"
    respond "200 OK" "{\"written\":\"$filepath\",\"size\":$(wc -c < "$filepath")}"
    return
  fi

  # File search (grep)
  if [ "$path" = "/search" ] && [ "$method" = "POST" ]; then
    local pattern dir max_results
    pattern=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('pattern',''))" 2>/dev/null)
    dir=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('directory','$SANDBOX_ROOT'))" 2>/dev/null)
    max_results=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('max',20))" 2>/dev/null)

    if [ -z "$pattern" ]; then
      respond "400 Bad Request" '{"error":"No pattern provided"}'
      return
    fi

    local results
    results=$(grep -rn --include="*.{py,js,ts,sh,go,rs,md,json,yaml,yml,toml}" "$pattern" "$dir" 2>/dev/null | head -"$max_results")
    local json_results
    json_results=$(python3 -c "import json,sys;print(json.dumps(sys.stdin.read()))" <<< "$results")
    local count
    count=$(echo "$results" | grep -c . || echo 0)

    respond "200 OK" "{\"pattern\":\"$pattern\",\"directory\":\"$dir\",\"count\":$count,\"results\":$json_results}"
    return
  fi

  # File glob (find)
  if [ "$path" = "/glob" ] && [ "$method" = "POST" ]; then
    local pattern dir
    pattern=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('pattern',''))" 2>/dev/null)
    dir=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('directory','$SANDBOX_ROOT'))" 2>/dev/null)

    local files
    files=$(find "$dir" -name "$pattern" -type f 2>/dev/null | head -30)
    local json_files
    json_files=$(python3 -c "import json,sys;lines=sys.stdin.read().strip().split('\n');print(json.dumps([l for l in lines if l]))" <<< "$files")

    respond "200 OK" "{\"pattern\":\"$pattern\",\"files\":$json_files}"
    return
  fi

  # Git operations
  if [ "$path" = "/git" ] && [ "$method" = "POST" ]; then
    local repo op args_str
    repo=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('repo',''))" 2>/dev/null)
    op=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('op','status'))" 2>/dev/null)
    args_str=$(echo "$body" | python3 -c "import sys,json;print(json.load(sys.stdin).get('args',''))" 2>/dev/null)

    if [ -z "$repo" ] || [ ! -d "$repo/.git" ]; then
      respond "400 Bad Request" "{\"error\":\"Not a git repo: $repo\"}"
      return
    fi

    local output
    case "$op" in
      status) output=$(cd "$repo" && git status --short 2>&1) ;;
      log) output=$(cd "$repo" && git log --oneline -20 2>&1) ;;
      diff) output=$(cd "$repo" && git diff 2>&1 | head -200) ;;
      branch) output=$(cd "$repo" && git branch -a 2>&1) ;;
      add) output=$(cd "$repo" && git add $args_str 2>&1) ;;
      commit) output=$(cd "$repo" && git commit -m "$args_str" 2>&1) ;;
      pull) output=$(cd "$repo" && git pull 2>&1) ;;
      push) output=$(cd "$repo" && git push 2>&1) ;;
      clone) output=$(cd "$SANDBOX_ROOT" && git clone $args_str 2>&1) ;;
      *) output="Unknown git op: $op" ;;
    esac

    local json_output
    json_output=$(python3 -c "import json,sys;print(json.dumps(sys.stdin.read()))" <<< "$output")
    respond "200 OK" "{\"op\":\"$op\",\"repo\":\"$repo\",\"output\":$json_output}"
    return
  fi

  # List projects
  if [ "$path" = "/projects" ]; then
    local projects
    projects=$(find "$SANDBOX_ROOT" -maxdepth 2 -name ".git" -type d 2>/dev/null | sed 's|/.git||' | sort)
    local json_projects
    json_projects=$(python3 -c "import json,sys;lines=sys.stdin.read().strip().split('\n');print(json.dumps([l for l in lines if l]))" <<< "$projects")
    respond "200 OK" "{\"projects\":$json_projects}"
    return
  fi

  respond "404 Not Found" '{"error":"Unknown endpoint"}'
}

log "BlackRoad Agent Daemon starting on port $PORT"
log "Sandbox: $SANDBOX_ROOT"

# Use socat if available, fall back to ncat/nc
if command -v socat &>/dev/null; then
  socat TCP-LISTEN:$PORT,reuseaddr,fork SYSTEM:"bash -c 'handle_request'" &
  # Export the function for socat
  export -f handle_request log
  log "Using socat"
  socat TCP-LISTEN:$PORT,reuseaddr,fork EXEC:"bash -c handle_request"
else
  log "Using while+nc loop"
  while true; do
    echo "" | nc -l -p $PORT -c "bash -c 'handle_request'" 2>/dev/null || \
    { handle_request | nc -l $PORT; } 2>/dev/null
  done
fi
