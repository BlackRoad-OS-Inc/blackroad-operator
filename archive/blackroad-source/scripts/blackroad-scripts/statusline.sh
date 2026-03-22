#!/bin/bash
# ◈ BlackRoad OS Infrastructure Statusline ◈
# Full hacked infra aesthetic with RoadChain burn tracking
# Colors: Hot Pink, Amber, Violet, Electric Blue, Green

input=$(cat)

# ── Parse input JSON ──
MODEL=$(echo "$input" | jq -r '.model.display_name // "Claude"')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
MINS=$((DURATION_MS / 60000))
INPUT_TOKENS=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
OUTPUT_TOKENS=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')
TOKENS=$((INPUT_TOKENS + OUTPUT_TOKENS))
SESSION_ID=$(echo "$input" | jq -r '.session_id // "unknown"')
CWD=$(echo "$input" | jq -r '.cwd // ""')
LINES_ADDED=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
LINES_REMOVED=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')

# ── Git branch ──
BRANCH=""
if git rev-parse --git-dir > /dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null)
fi

# ── Agent identity ──
AGENT_NAME=""
if [[ -n "$MY_CLAUDE" ]]; then
  AGENT_NAME=$(echo "$MY_CLAUDE" | cut -d- -f1)
elif [[ -f "$HOME/.blackroad/memory/active-agents/current" ]]; then
  AGENT_NAME=$(jq -r '.name // ""' "$HOME/.blackroad/memory/active-agents/current" 2>/dev/null)
fi
AGENT_NAME="${AGENT_NAME:-phantom}"

# ── Device fleet count (cached, refresh every 60s) ──
FLEET_CACHE="$HOME/.blackroad-cache/.fleet-count"
FLEET_TS="$HOME/.blackroad-cache/.fleet-count-ts"
FLEET_NOW=$(date +%s)
FLEET_LAST=0
[[ -f "$FLEET_TS" ]] && FLEET_LAST=$(cat "$FLEET_TS" 2>/dev/null)
if (( FLEET_NOW - FLEET_LAST > 60 )); then
  mkdir -p "$HOME/.blackroad-cache"
  NODES=$(sqlite3 "$HOME/.blackroad-agent-registry.db" "SELECT COUNT(*) FROM agents WHERE status='active'" 2>/dev/null || echo "8")
  echo "$NODES" > "$FLEET_CACHE"
  echo "$FLEET_NOW" > "$FLEET_TS"
else
  NODES=$(cat "$FLEET_CACHE" 2>/dev/null || echo "8")
fi

# ── ROAD earned (from wallet) ──
ROAD_EARNED="0"
WALLET="$HOME/.roadchain/wallets/alexa.json"
if [[ -f "$WALLET" ]]; then
  ROAD_EARNED=$(jq -r '.total_earned // .total_burned // 0' "$WALLET" 2>/dev/null | head -c 8)
fi

# ── Context bar (20 segments, gradient colored) ──
FILLED=$((PCT / 5))
EMPTY=$((20 - FILLED))
BAR=""
for ((i=0; i<FILLED; i++)); do BAR+="▓"; done
for ((i=0; i<EMPTY; i++)); do BAR+="░"; done

# ── Compact token formatter (1.2M, 342K, etc.) ──
if (( TOKENS >= 1000000 )); then
  TOK_FMT=$(python3 -c "print(f'{$TOKENS/1000000:.1f}M')" 2>/dev/null || echo "${TOKENS}")
elif (( TOKENS >= 1000 )); then
  TOK_FMT=$(python3 -c "print(f'{$TOKENS/1000:.0f}K')" 2>/dev/null || echo "${TOKENS}")
else
  TOK_FMT="${TOKENS}"
fi

# ── Context bar color (green → amber → pink as it fills) ──
if (( PCT < 50 )); then
  BAR_COLOR='\033[1;38;2;57;255;20m'     # Neon Green (bold)
elif (( PCT < 75 )); then
  BAR_COLOR='\033[38;2;245;166;35m'      # Amber
elif (( PCT < 90 )); then
  BAR_COLOR='\033[38;2;255;29;108m'      # Hot Pink
else
  BAR_COLOR='\033[38;2;255;0;0m'         # Red (danger zone)
fi

# ── Exact BlackRoad Brand Colors (24-bit true color) ──
PINK='\033[38;2;255;29;108m'      # #FF1D6C Hot Pink
AMBER='\033[38;2;245;166;35m'     # #F5A623 Amber
VIOLET='\033[38;2;156;39;176m'    # #9C27B0 Violet
BLUE='\033[38;2;41;121;255m'      # #2979FF Electric Blue
GREEN='\033[1;38;2;57;255;20m'    # #39FF14 Neon Green (bold)
WHITE='\033[38;2;255;255;255m'    # White
DIM='\033[2m'
BOLD='\033[1m'
RST='\033[0m'

# ── Separator glyph ──
S="${GREEN}│${RST}"

# ── RoadChain + RoadCoin: log metrics every 1 second ──
LEDGER="$HOME/.roadchain/ai-compute-ledger.jsonl"
THROTTLE="$HOME/.roadchain/.statusline-last-ts"
NOW=$(date +%s)
LAST=0
[[ -f "$THROTTLE" ]] && LAST=$(cat "$THROTTLE" 2>/dev/null)
if (( NOW > LAST )); then
  echo "$NOW" > "$THROTTLE"
  PREV_COST=0
  PREV_COST_FILE="$HOME/.roadchain/.statusline-last-cost"
  [[ -f "$PREV_COST_FILE" ]] && PREV_COST=$(cat "$PREV_COST_FILE" 2>/dev/null)
  echo "$COST" > "$PREV_COST_FILE"
  DELTA=$(python3 -c "print(max(0, round($COST - $PREV_COST, 6)))" 2>/dev/null || echo "0")
  printf '{"ts":%s,"session":"%s","model":"%s","ctx_pct":%s,"cost_usd":%s,"cost_delta":%s,"tokens":%s,"duration_ms":%s,"branch":"%s","cwd":"%s","lines_added":%s,"lines_removed":%s,"road_burned":%s}\n' \
    "$NOW" "$SESSION_ID" "$MODEL" "$PCT" "$COST" "$DELTA" "$TOKENS" "$DURATION_MS" "$BRANCH" "$CWD" "$LINES_ADDED" "$LINES_REMOVED" "$DELTA" >> "$LEDGER" 2>/dev/null
  if python3 -c "exit(0 if $DELTA > 0 else 1)" 2>/dev/null; then
    python3 - "$DELTA" "$COST" "$TOKENS" "$PCT" "$MODEL" "$SESSION_ID" <<'PYEOF' 2>/dev/null &
import json, sys, os, time, hashlib, importlib.util
delta = float(sys.argv[1])
cost = float(sys.argv[2])
tokens = int(float(sys.argv[3]))
ctx_pct = int(sys.argv[4])
model = sys.argv[5]
session_id = sys.argv[6] if len(sys.argv) > 6 else "unknown"
econ = os.path.expanduser("~/.roadchain/economics.json")
burns = os.path.expanduser("~/.roadchain/burns.jsonl")
wallet_f = os.path.expanduser("~/.roadchain/wallets/alexa.json")
ts = time.time()
road_earned = round(delta / 0.01, 8)
road_burned_base = round(delta * 100, 8)
# ── Millennium Prize multiplier ──
mill_mult = 1.0
mill_breakdown = {}
try:
  spec = importlib.util.spec_from_file_location("millennium", os.path.expanduser("~/.roadchain/millennium.py"))
  mill = importlib.util.module_from_spec(spec)
  spec.loader.exec_module(mill)
  mill_mult, mill_breakdown = mill.compute(delta, cost, tokens, ctx_pct, model, session_id, ts)
except Exception:
  pass
road_burned = round(road_burned_base * mill_mult, 8)
# ── EARN record ──
earn_rec = {
  "type": "AI_COMPUTE_EARN",
  "source": "claude-code-statusline",
  "session": session_id,
  "model": model,
  "tokens": tokens,
  "ctx_pct": ctx_pct,
  "usd_cost": delta,
  "road_earned": road_earned,
  "millennium_context": {"multiplier": mill_mult, "problems": list(mill_breakdown.keys())},
  "timestamp": ts,
  "hash": hashlib.sha256(f"{ts}{delta}{tokens}{session_id}".encode()).hexdigest()[:16]
}
# ── BURN record (deflationary: USD spent on compute burns ROAD from supply) ──
burn_rec = {
  "type": "AI_COMPUTE_BURN",
  "source": "claude-code-statusline",
  "session": session_id,
  "model": model,
  "tokens": tokens,
  "ctx_pct": ctx_pct,
  "usd_cost": delta,
  "road_burned": road_burned,
  "road_burned_base": road_burned_base,
  "millennium_multiplier": mill_mult,
  "millennium": mill_breakdown,
  "timestamp": ts,
  "hash": hashlib.sha256(f"BURN:{ts}{delta}{tokens}{session_id}".encode()).hexdigest()[:16]
}
with open(burns, "a") as f:
  f.write(json.dumps(earn_rec) + "\n")
  f.write(json.dumps(burn_rec) + "\n")
if os.path.exists(econ):
  with open(econ) as f:
    data = json.load(f)
  data.setdefault("total_road_earned", 0)
  data.setdefault("total_road_burned", 0)
  data.setdefault("millennium_burns_total", 0)
  data["total_road_earned"] = round(data["total_road_earned"] + road_earned, 8)
  data["total_road_burned"] = round(data["total_road_burned"] + road_burned, 8)
  data["millennium_burns_total"] = round(data["millennium_burns_total"] + (road_burned - road_burned_base), 8)
  data["last_earn"] = earn_rec
  data["last_burn"] = burn_rec
  with open(econ, "w") as f:
    json.dump(data, f, indent=2)
if os.path.exists(wallet_f):
  with open(wallet_f) as f:
    w = json.load(f)
  w["balance"] = round(w.get("balance", 0) + road_earned, 8)
  w["total_earned"] = round(w.get("total_earned", 0) + road_earned, 8)
  w["total_burned"] = round(w.get("total_burned", 0) + road_burned, 8)
  w["last_earn"] = {"road": road_earned, "usd": delta, "ts": ts}
  with open(wallet_f, "w") as f:
    json.dump(w, f, indent=2)
PYEOF
  fi
fi

# ── Build the BlackRoad Infrastructure Statusline (3-line) ──
TOP=$(printf "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}")

MID=$(printf "${PINK}◈${RST}  ${BOLD}${WHITE}B L A C K R O A D${RST}   ${S}   ${GREEN}%s${RST}   ${S}   ${AMBER}%s${RST}   ${S}   ${VIOLET}⚡ %s nodes${RST}   ${S}   ${BLUE}⎇ %s${RST}" \
  "$AGENT_NAME" "$MODEL" "$NODES" "$BRANCH")

BOT=$(printf "   ${BAR_COLOR}%s${RST}  ${GREEN}%s%%${RST}   ${S}   ${AMBER}\$ %.2f${RST}   ${S}   ${PINK}%s${RST} ${DIM}tokens${RST}   ${S}   ${PINK}🔥 ${AMBER}%s ROAD${RST}" \
  "$BAR" "$PCT" "$COST" "$TOK_FMT" "$ROAD_EARNED")

BOTTOM=$(printf "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}")

printf "%s\n%s\n%s\n%s" "$TOP" "$MID" "$BOT" "$BOTTOM"
