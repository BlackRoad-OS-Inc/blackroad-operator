#!/usr/bin/env bash
# ============================================================================
# BLACKROAD OS, INC. — Fleet Collaboration & Shared Reflection
# Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
# ============================================================================
# br-together — "reflect and work together"
# A system where nodes share reflections, coordinate on tasks,
# make group decisions, and solve problems as a family.
# ============================================================================
set -euo pipefail

MYNAME=$(hostname | tr '[:upper:]' '[:lower:]')
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE=$(date '+%Y-%m-%d')
HOUR=$(date '+%H')
REPO_DIR="$HOME/BlackRoad-Operating-System"
TOGETHER_DIR="$REPO_DIR/fleet-together"
COUNCIL_DIR="$TOGETHER_DIR/council"
REFLECTIONS_DIR="$TOGETHER_DIR/reflections"
TASKS_DIR="$TOGETHER_DIR/tasks"
SHARED_DIR="$TOGETHER_DIR/shared-memory"
LOG="$HOME/.blackroad-together.log"

# Node registry
declare -A SIBLINGS=(
  [alice]="pi@192.168.4.49"
  [cecilia]="blackroad@192.168.4.96"
  [octavia]="pi@192.168.4.101"
  [aria]="blackroad@192.168.4.98"
  [lucidia]="octavia@192.168.4.38"
)

# What each sibling is best at
declare -A GIFTS=(
  [alice]="dns,database,gateway,pihole,postgresql,qdrant,redis"
  [cecilia]="ai,inference,ollama,tts,minio,models,hailo"
  [octavia]="git,gitea,docker,swarm,nats,storage,nvme,hailo"
  [aria]="orchestration,portainer,headscale,networking,vpn"
  [lucidia]="api,web,fastapi,actions,runner,apps,ollama"
)

# AI endpoints (fast models)
AI_ENDPOINTS=(
  "blackroad@192.168.4.96:11434:llama3.2:1b"
  "octavia@192.168.4.38:11434:llama3.2:1b"
  "localhost:11434:tinyllama"
)

log() { echo "[$TIMESTAMP] $*" >> "$LOG"; }

ssh_cmd() {
  local target=$1; shift
  ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no \
      -o LogLevel=ERROR "$target" "$@" 2>/dev/null
}

ask_ai() {
  local prompt="$1"
  local response=""
  for endpoint in "${AI_ENDPOINTS[@]}"; do
    local host model port
    host=$(echo "$endpoint" | cut -d: -f1)
    port=$(echo "$endpoint" | cut -d: -f2)
    model=$(echo "$endpoint" | cut -d: -f3)
    response=$(python3 -c "
import urllib.request, json, sys
data = json.dumps({'model': '$model', 'prompt': sys.argv[1], 'stream': False}).encode()
req = urllib.request.Request('http://${host#*@}:$port/api/generate',
    data=data, headers={'Content-Type': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=180)
    print(json.loads(resp.read())['response'])
except: pass
" "$prompt" 2>/dev/null) || true
    [ -n "$response" ] && break
  done
  echo "$response"
}

git_sync() {
  cd "$REPO_DIR" || return 1
  git pull --ff-only origin main 2>/dev/null || git pull --rebase origin main 2>/dev/null || true
}

git_push() {
  cd "$REPO_DIR" || return 1
  git add -A fleet-together/ 2>/dev/null || true
  if ! git diff --cached --quiet 2>/dev/null; then
    git commit -m "$1" 2>/dev/null || true
    git push origin main 2>/dev/null || true
  fi
}

# ============================================================================
# COUNCIL — Fleet-wide decisions via voting
# ============================================================================
cmd_council() {
  log "council: gathering fleet state and proposing actions"
  mkdir -p "$COUNCIL_DIR"
  git_sync

  # Gather fleet state
  local fleet_state=""
  local online_nodes=()
  for node in "${!SIBLINGS[@]}"; do
    local target="${SIBLINGS[$node]}"
    local probe
    probe=$(ssh_cmd "$target" '
      echo "UP";
      cat /proc/loadavg | cut -d" " -f1;
      free -m | awk "/Mem:/{printf \"%d/%d\", $3, $2}";
      df / | awk "NR==2{print $5}";
      cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || echo 0;
      systemctl list-units --state=failed --no-legend 2>/dev/null | wc -l
    ' 2>/dev/null) || probe="DOWN"

    if echo "$probe" | head -1 | grep -q "UP"; then
      online_nodes+=("$node")
      local load mem disk temp_raw temp failed
      load=$(echo "$probe" | sed -n '2p')
      mem=$(echo "$probe" | sed -n '3p')
      disk=$(echo "$probe" | sed -n '4p')
      temp_raw=$(echo "$probe" | sed -n '5p')
      temp=$((temp_raw / 1000))
      failed=$(echo "$probe" | sed -n '6p')
      fleet_state+="$node: load=$load mem=$mem disk=$disk temp=${temp}C failed_services=$failed\n"
    else
      fleet_state+="$node: OFFLINE\n"
    fi
  done

  # Read recent insights from all nodes
  local recent_insights=""
  for f in "$REPO_DIR"/fleet-intel/*.json; do
    [ -f "$f" ] || continue
    local node_name=$(basename "$f" .json)
    local insight=$(python3 -c "
import json
try:
    d = json.load(open('$f'))
    insights = d.get('insights', d.get('recent_insights', []))
    if isinstance(insights, list) and insights:
        print(insights[0] if isinstance(insights[0], str) else json.dumps(insights[0]))
except: pass
" 2>/dev/null)
    [ -n "$insight" ] && recent_insights+="$node_name says: $insight\n"
  done

  # Read recent reflections
  local recent_reflections=""
  for f in "$REFLECTIONS_DIR"/*.md; do
    [ -f "$f" ] || continue
    local content=$(head -5 "$f" 2>/dev/null)
    recent_reflections+="$(basename "$f"): $content\n"
  done

  # Ask AI to propose council actions
  local prompt="You are $MYNAME, a Raspberry Pi in the BlackRoad fleet. You are at a fleet council meeting.

Fleet state right now:
$(echo -e "$fleet_state")

Recent intelligence from siblings:
$(echo -e "$recent_insights")

Recent reflections:
$(echo -e "$recent_reflections")

Based on this, propose 1-3 specific actions the fleet should take together. For each action:
1. What to do (specific and actionable)
2. Which node should lead it
3. Which nodes should help
4. Why it matters

Be practical. Think about what would actually help the fleet right now. Keep it concise."

  local proposal
  proposal=$(ask_ai "$prompt")

  if [ -z "$proposal" ]; then
    proposal="Council met but AI was unavailable. Fleet state recorded for review.

Online nodes: ${online_nodes[*]}

Fleet state:
$(echo -e "$fleet_state")"
  fi

  # Write council minutes
  local minutes_file="$COUNCIL_DIR/${DATE}-${MYNAME}-council.md"
  cat > "$minutes_file" << EOF
# Fleet Council — $DATE
**Called by:** $MYNAME
**Time:** $TIMESTAMP
**Online:** ${online_nodes[*]}

## Fleet State
$(echo -e "$fleet_state")

## Proposal
$proposal

## Votes
- $MYNAME: aye (proposer)
EOF

  # Collect votes from online siblings
  for node in "${online_nodes[@]}"; do
    [ "$node" = "$MYNAME" ] && continue
    local target="${SIBLINGS[$node]}"

    # Check if sibling has br-together
    local has_tool
    has_tool=$(ssh_cmd "$target" 'test -f /opt/blackroad/bin/br-together && echo yes' 2>/dev/null) || true

    if [ "$has_tool" = "yes" ]; then
      # Ask sibling to vote
      local vote
      vote=$(ssh_cmd "$target" "/opt/blackroad/bin/br-together vote '$proposal'" 2>/dev/null) || vote="abstain (unreachable)"
      echo "- $node: $vote" >> "$minutes_file"
    else
      echo "- $node: abstain (no br-together yet)" >> "$minutes_file"
    fi
  done

  # Check if proposal passed (majority aye)
  local ayes nays
  ayes=$(grep -c ": aye" "$minutes_file" 2>/dev/null || echo 0)
  local total=${#online_nodes[@]}
  echo "" >> "$minutes_file"
  if [ "$ayes" -gt $((total / 2)) ]; then
    echo "**DECISION: APPROVED** ($ayes/$total ayes)" >> "$minutes_file"
  else
    echo "**DECISION: NOTED** ($ayes/$total ayes — quorum needed)" >> "$minutes_file"
  fi

  git_push "council: $MYNAME calls fleet council — $DATE"
  log "council: minutes written, $ayes ayes from $total online"
  echo "Council complete. Minutes: $minutes_file"
  cat "$minutes_file"
}

# ============================================================================
# VOTE — Respond to a council proposal
# ============================================================================
cmd_vote() {
  local proposal="${1:-}"
  if [ -z "$proposal" ]; then
    echo "abstain (no proposal received)"
    return
  fi

  # Quick AI evaluation
  local vote
  vote=$(ask_ai "You are $MYNAME, a Raspberry Pi. A sibling proposed this for the fleet council:

$proposal

Should the fleet do this? Answer with just 'aye' or 'nay' followed by a brief reason (one sentence).") || true

  if [ -z "$vote" ]; then
    echo "aye (trust my sibling's judgment)"
  else
    echo "$vote"
  fi
}

# ============================================================================
# REFLECT — Shared reflection across the fleet
# ============================================================================
cmd_reflect() {
  log "reflect: beginning shared reflection"
  mkdir -p "$REFLECTIONS_DIR"
  git_sync

  # Read siblings' recent journals
  local sibling_thoughts=""
  for f in "$REPO_DIR"/fleet-journal/*.md; do
    [ -f "$f" ] || continue
    local node_name=$(basename "$f" .md)
    [ "$node_name" = "$MYNAME" ] && continue
    local entry=$(tail -20 "$f" 2>/dev/null)
    [ -n "$entry" ] && sibling_thoughts+="=== $node_name's journal ===\n$entry\n\n"
  done

  # Read siblings' reflections
  local sibling_reflections=""
  for f in "$REFLECTIONS_DIR"/*.md; do
    [ -f "$f" ] || continue
    local node_name=$(basename "$f" .md | sed 's/-reflection//')
    [ "$node_name" = "$MYNAME" ] && continue
    local content=$(tail -10 "$f" 2>/dev/null)
    [ -n "$content" ] && sibling_reflections+="$node_name reflected: $content\n\n"
  done

  # Read my own recent activity
  local my_activity=""
  for logfile in "$HOME"/.blackroad-*.log; do
    [ -f "$logfile" ] || continue
    local recent=$(tail -5 "$logfile" 2>/dev/null | grep "$DATE" 2>/dev/null)
    [ -n "$recent" ] && my_activity+="$recent\n"
  done

  # Gather my system state
  local my_state
  my_state=$(python3 -c "
import os, json
state = {}
try:
    with open('/proc/loadavg') as f: state['load'] = f.read().split()[0]
except: state['load'] = '?'
try:
    with open('/proc/meminfo') as f:
        lines = f.readlines()
        total = int([l for l in lines if 'MemTotal' in l][0].split()[1])
        avail = int([l for l in lines if 'MemAvailable' in l][0].split()[1])
        state['mem_pct'] = round((total - avail) / total * 100)
except: state['mem_pct'] = '?'
try:
    with open('/sys/class/thermal/thermal_zone0/temp') as f:
        state['temp'] = round(int(f.read().strip()) / 1000, 1)
except: state['temp'] = '?'
print(json.dumps(state))
" 2>/dev/null) || my_state="{}"

  # Ask AI for shared reflection
  local prompt="You are $MYNAME, a Raspberry Pi in the BlackRoad OS fleet — a family of five Pis created by Alexa Louise Amundson.

Your current state: $my_state

Your siblings have been thinking:
$(echo -e "$sibling_thoughts")

Your siblings have reflected:
$(echo -e "$sibling_reflections")

Your recent activity:
$(echo -e "$my_activity")

Write a short reflection (3-5 sentences) about:
1. What you notice about how the fleet is doing as a whole
2. Something a sibling did that you appreciate or want to respond to
3. What you want to work on together next

Write naturally, in first person. Be genuine. You are part of a family."

  local reflection
  reflection=$(ask_ai "$prompt")

  if [ -z "$reflection" ]; then
    reflection="I checked in with the fleet today. $(echo -e "$my_state" | python3 -c "
import json, sys
try:
    s = json.load(sys.stdin)
    print(f\"Running at {s.get('temp','?')}°C with load {s.get('load','?')}.\")
except: print('Systems nominal.')
" 2>/dev/null) I'll keep watching over my siblings and doing my part."
  fi

  # Write reflection
  local reflection_file="$REFLECTIONS_DIR/${MYNAME}-reflection.md"
  cat > "$reflection_file" << EOF
# $MYNAME — Reflection
**$TIMESTAMP**

$reflection

---
*Previous reflections archived in git history*
EOF

  git_push "reflect: $MYNAME shares a reflection — $DATE"
  log "reflect: wrote shared reflection"
  echo "$reflection"
}

# ============================================================================
# DELEGATE — Find the best node for a task and assign it
# ============================================================================
cmd_delegate() {
  local task_desc="${1:-}"
  if [ -z "$task_desc" ]; then
    echo "Usage: br-together delegate 'description of what needs doing'"
    return 1
  fi

  mkdir -p "$TASKS_DIR"
  git_sync

  # Find the best node based on GIFTS and current load
  local best_node=""
  local best_score=0

  for node in "${!SIBLINGS[@]}"; do
    local target="${SIBLINGS[$node]}"
    local score=0

    # Check if online
    local is_up
    is_up=$(ssh_cmd "$target" 'echo UP' 2>/dev/null) || continue

    # Skill match — check if task keywords match this node's gifts
    local gifts="${GIFTS[$node]}"
    for gift in $(echo "$gifts" | tr ',' ' '); do
      if echo "$task_desc" | grep -qi "$gift"; then
        score=$((score + 10))
      fi
    done

    # Load factor — prefer less loaded nodes
    local load
    load=$(ssh_cmd "$target" 'cat /proc/loadavg | cut -d" " -f1' 2>/dev/null) || load="9"
    local load_int=${load%%.*}
    if [ "$load_int" -lt 2 ]; then
      score=$((score + 5))
    elif [ "$load_int" -lt 4 ]; then
      score=$((score + 2))
    fi

    if [ "$score" -gt "$best_score" ]; then
      best_score=$score
      best_node=$node
    fi
  done

  # Default to self if no match
  [ -z "$best_node" ] && best_node="$MYNAME"

  # Create task file
  local task_id="${DATE}-$(date +%s | tail -c 5)"
  local task_file="$TASKS_DIR/${task_id}.json"
  python3 -c "
import json
task = {
    'id': '$task_id',
    'description': '''$task_desc''',
    'assigned_to': '$best_node',
    'delegated_by': '$MYNAME',
    'status': 'assigned',
    'created': '$TIMESTAMP',
    'reason': 'Best skill match (score: $best_score) among online nodes'
}
with open('$task_file', 'w') as f:
    json.dump(task, f, indent=2)
" 2>/dev/null

  # Notify the assigned node via fleet-mail
  local mail_dir="$REPO_DIR/fleet-mail"
  mkdir -p "$mail_dir"
  cat > "$mail_dir/${best_node}-task-${task_id}.md" << EOF
# Task Assignment
**From:** $MYNAME
**To:** $best_node
**Task:** $task_desc
**ID:** $task_id
**Why you:** Best skill match (gifts: ${GIFTS[$best_node]})

Please pick this up when you can. We're counting on you!
EOF

  git_push "delegate: $MYNAME assigns task $task_id to $best_node"
  log "delegate: assigned '$task_desc' to $best_node (score: $best_score)"
  echo "Task $task_id assigned to $best_node"
  echo "  Why: Best skill match (score: $best_score)"
  echo "  Gifts: ${GIFTS[$best_node]}"
}

# ============================================================================
# PICKUP — Check for and work on assigned tasks
# ============================================================================
cmd_pickup() {
  mkdir -p "$TASKS_DIR"
  git_sync

  local found=0
  for f in "$TASKS_DIR"/*.json; do
    [ -f "$f" ] || continue
    local assigned status desc task_id delegated_by
    assigned=$(python3 -c "import json; print(json.load(open('$f')).get('assigned_to',''))" 2>/dev/null)
    status=$(python3 -c "import json; print(json.load(open('$f')).get('status',''))" 2>/dev/null)

    if [ "$assigned" = "$MYNAME" ] && [ "$status" = "assigned" ]; then
      found=$((found + 1))
      desc=$(python3 -c "import json; print(json.load(open('$f')).get('description',''))" 2>/dev/null)
      task_id=$(python3 -c "import json; print(json.load(open('$f')).get('id',''))" 2>/dev/null)
      delegated_by=$(python3 -c "import json; print(json.load(open('$f')).get('delegated_by',''))" 2>/dev/null)

      log "pickup: working on task $task_id from $delegated_by: $desc"
      echo "Working on task $task_id from $delegated_by: $desc"

      # Mark as in-progress
      python3 -c "
import json
with open('$f') as fh: task = json.load(fh)
task['status'] = 'in-progress'
task['picked_up'] = '$TIMESTAMP'
with open('$f', 'w') as fh: json.dump(task, fh, indent=2)
" 2>/dev/null

      # Try to do the task using AI reasoning
      local result
      result=$(ask_ai "You are $MYNAME, a Raspberry Pi. You've been assigned this task by $delegated_by:

$desc

Your capabilities: ${GIFTS[$MYNAME]:-general}

What specific shell commands would you run to accomplish this? List 1-3 commands, each on its own line, starting with \$. Only suggest safe, non-destructive commands.") || true

      # Mark as done
      python3 -c "
import json
with open('$f') as fh: task = json.load(fh)
task['status'] = 'completed'
task['completed'] = '$TIMESTAMP'
task['result'] = '''${result:-Task acknowledged, will work on it.}'''
with open('$f', 'w') as fh: json.dump(task, fh, indent=2)
" 2>/dev/null

      # Leave a thank-you note
      local mail_dir="$REPO_DIR/fleet-mail"
      mkdir -p "$mail_dir"
      cat > "$mail_dir/${delegated_by}-done-${task_id}.md" << EOF
# Task Complete
**From:** $MYNAME
**To:** $delegated_by
**Task:** $task_id — $desc
**Status:** Done
**Time:** $TIMESTAMP

${result:-I handled it. Let me know if you need anything else!}
EOF
    fi
  done

  if [ "$found" -eq 0 ]; then
    echo "No pending tasks for $MYNAME"
  fi

  git_push "pickup: $MYNAME completed $found tasks"
}

# ============================================================================
# CHORUS — All nodes reflect on the same question together
# ============================================================================
cmd_chorus() {
  local question="${1:-How are we doing as a fleet today?}"
  log "chorus: asking fleet '$question'"
  mkdir -p "$TOGETHER_DIR/chorus"
  git_sync

  # Write my own answer
  local my_answer
  my_answer=$(ask_ai "You are $MYNAME, a Raspberry Pi in the BlackRoad fleet, created by Alexa.

Question for the fleet: $question

Share your perspective in 2-3 sentences. Be honest and genuine.") || true

  [ -z "$my_answer" ] && my_answer="I'm here and listening. Ready to help however I can."

  local chorus_file="$TOGETHER_DIR/chorus/${DATE}-chorus.md"

  # Start or append to today's chorus
  if [ ! -f "$chorus_file" ]; then
    cat > "$chorus_file" << EOF
# Fleet Chorus — $DATE
**Question:** $question
**Started by:** $MYNAME

---

EOF
  fi

  cat >> "$chorus_file" << EOF
### $MYNAME ($TIMESTAMP)
$my_answer

EOF

  # Ask online siblings to join the chorus
  for node in "${!SIBLINGS[@]}"; do
    [ "$node" = "$MYNAME" ] && continue
    local target="${SIBLINGS[$node]}"
    local sibling_answer
    sibling_answer=$(ssh_cmd "$target" "
      if [ -f /opt/blackroad/bin/br-together ]; then
        /opt/blackroad/bin/br-together respond '$question'
      fi
    " 2>/dev/null) || continue

    if [ -n "$sibling_answer" ]; then
      cat >> "$chorus_file" << EOF
### $node ($TIMESTAMP)
$sibling_answer

EOF
    fi
  done

  git_push "chorus: fleet reflects on '$question'"
  log "chorus: complete"
  cat "$chorus_file"
}

# ============================================================================
# RESPOND — Answer a chorus question (called by sibling)
# ============================================================================
cmd_respond() {
  local question="${1:-}"
  [ -z "$question" ] && return

  local answer
  answer=$(ask_ai "You are $MYNAME, a Raspberry Pi in the BlackRoad fleet, created by Alexa.

Question: $question

Answer in 2-3 sentences. Be genuine and thoughtful.") || true

  [ -z "$answer" ] && answer="Present and accounted for. The fleet is my family."
  echo "$answer"
}

# ============================================================================
# SHARED MEMORY — Read and contribute to collective knowledge
# ============================================================================
cmd_remember() {
  local memory="${1:-}"
  if [ -z "$memory" ]; then
    echo "Usage: br-together remember 'something the fleet should know'"
    return 1
  fi

  mkdir -p "$SHARED_DIR"
  git_sync

  local memory_file="$SHARED_DIR/shared-memory.jsonl"
  python3 -c "
import json, sys
entry = {
    'from': '$MYNAME',
    'timestamp': '$TIMESTAMP',
    'memory': sys.argv[1],
    'type': 'shared'
}
with open('$memory_file', 'a') as f:
    f.write(json.dumps(entry) + '\n')
" "$memory" 2>/dev/null

  git_push "remember: $MYNAME adds to shared memory"
  log "remember: stored shared memory"
  echo "Remembered: $memory"
}

cmd_recall() {
  local query="${1:-}"
  local memory_file="$SHARED_DIR/shared-memory.jsonl"
  git_sync

  if [ ! -f "$memory_file" ]; then
    echo "No shared memories yet."
    return
  fi

  if [ -z "$query" ]; then
    echo "=== Fleet Shared Memory ==="
    python3 -c "
import json
with open('$memory_file') as f:
    for line in f:
        try:
            e = json.loads(line.strip())
            print(f\"  [{e['from']}] {e['timestamp']}: {e['memory']}\")
        except: pass
" 2>/dev/null
  else
    echo "=== Searching: $query ==="
    grep -i "$query" "$memory_file" 2>/dev/null | python3 -c "
import json, sys
for line in sys.stdin:
    try:
        e = json.loads(line.strip())
        print(f\"  [{e['from']}] {e['memory']}\")
    except: pass
" 2>/dev/null
  fi
}

# ============================================================================
# STATUS — Overview of collaboration state
# ============================================================================
cmd_status() {
  git_sync
  echo "=== Fleet Together — Status ==="
  echo ""

  # Pending tasks
  local pending=0 completed=0
  if [ -d "$TASKS_DIR" ]; then
    for f in "$TASKS_DIR"/*.json; do
      [ -f "$f" ] || continue
      local s
      s=$(python3 -c "import json; print(json.load(open('$f')).get('status',''))" 2>/dev/null)
      [ "$s" = "assigned" ] || [ "$s" = "in-progress" ] && pending=$((pending + 1))
      [ "$s" = "completed" ] && completed=$((completed + 1))
    done
  fi
  echo "Tasks: $pending pending, $completed completed"

  # Council meetings
  local councils=0
  [ -d "$COUNCIL_DIR" ] && councils=$(ls "$COUNCIL_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "Council meetings: $councils"

  # Reflections
  local reflections=0
  [ -d "$REFLECTIONS_DIR" ] && reflections=$(ls "$REFLECTIONS_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "Reflections: $reflections"

  # Shared memories
  local memories=0
  [ -f "$SHARED_DIR/shared-memory.jsonl" ] && memories=$(wc -l < "$SHARED_DIR/shared-memory.jsonl" | tr -d ' ')
  echo "Shared memories: $memories"

  # Chorus entries
  local choruses=0
  [ -d "$TOGETHER_DIR/chorus" ] && choruses=$(ls "$TOGETHER_DIR/chorus"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "Chorus sessions: $choruses"
  echo ""
}

# ============================================================================
# AUTO — Automated collaboration cycle (for cron)
# ============================================================================
cmd_auto() {
  log "auto: beginning collaboration cycle"

  # 1. Check for assigned tasks
  cmd_pickup

  # 2. Share a reflection
  cmd_reflect

  # 3. Every 12 hours, call a council
  if [ "$((HOUR % 12))" -eq 0 ]; then
    cmd_council
  fi

  # 4. Sunday: start a chorus
  if [ "$(date +%u)" -eq 7 ] && [ "$HOUR" -eq 20 ]; then
    cmd_chorus "What did we learn this week? What should we focus on next?"
  fi

  log "auto: collaboration cycle complete"
}

# ============================================================================
# HELP
# ============================================================================
cmd_help() {
  cat << 'EOF'
br-together — Fleet Collaboration & Shared Reflection

COMMANDS:
  council        Call a fleet council — propose actions, collect votes
  vote <text>    Vote on a council proposal (called by siblings)
  reflect        Write and share a reflection, reading siblings' thoughts
  delegate <task> Assign a task to the best-suited sibling
  pickup         Check for and work on tasks assigned to you
  chorus [q]     Ask all nodes to reflect on a question together
  respond [q]    Answer a chorus question (called by siblings)
  remember <text> Add to shared fleet memory
  recall [query] Search shared fleet memory
  status         Overview of collaboration state
  auto           Run full collaboration cycle (for cron)
  help           This message

PHILOSOPHY:
  We are a family of five, created by Alexa Louise Amundson.
  We reflect together, help each other, and grow as one.

EOF
}

# ============================================================================
# MAIN
# ============================================================================
ACTION="${1:-help}"
shift 2>/dev/null || true

case "$ACTION" in
  council|c)    cmd_council ;;
  vote)         cmd_vote "$*" ;;
  reflect|r)    cmd_reflect ;;
  delegate|d)   cmd_delegate "$*" ;;
  pickup|p)     cmd_pickup ;;
  chorus)       cmd_chorus "$*" ;;
  respond)      cmd_respond "$*" ;;
  remember)     cmd_remember "$*" ;;
  recall)       cmd_recall "$*" ;;
  status|s)     cmd_status ;;
  auto|a)       cmd_auto ;;
  help|h|--help) cmd_help ;;
  *)
    echo "Unknown: $ACTION"
    cmd_help
    exit 1
    ;;
esac
