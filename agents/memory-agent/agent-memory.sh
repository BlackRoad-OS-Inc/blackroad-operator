#!/bin/bash
# Per-agent persistent memory system
# Usage: agent-memory.sh <agent> <command> [args]
# Commands: remember, recall, forget, list, context, clear

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

MEMORY_DIR="$HOME/agent-memory/data"
mkdir -p "$MEMORY_DIR"

AGENT="${1:-}"
CMD="${2:-}"

if [ -z "$AGENT" ] || [ -z "$CMD" ]; then
  echo -e "${PINK}Agent Memory System${RESET}"
  echo "Usage: agent-memory.sh <agent> <command> [args]"
  echo ""
  echo "Commands:"
  echo "  remember <key> <value>  - Store a memory"
  echo "  recall <key>            - Retrieve a memory"
  echo "  forget <key>            - Delete a memory"
  echo "  list                    - List all memories"
  echo "  context                 - Get full context for prompt injection"
  echo "  search <query>          - Search memories"
  echo "  clear                   - Clear all memories"
  echo "  log <message>           - Add to conversation log"
  echo "  history [n]             - Show last n conversation entries"
  exit 0
fi

AGENT_FILE="$MEMORY_DIR/${AGENT}.json"
AGENT_LOG="$MEMORY_DIR/${AGENT}.log"

# Initialize agent file if needed
if [ ! -f "$AGENT_FILE" ]; then
  cat > "$AGENT_FILE" << EOF
{
  "agent": "$AGENT",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "memories": {},
  "facts": [],
  "personality_notes": [],
  "interactions": 0
}
EOF
fi

case "$CMD" in
  remember)
    KEY="${3:-}"
    shift 3 2>/dev/null || true
    VALUE="$*"
    if [ -z "$KEY" ] || [ -z "$VALUE" ]; then
      echo "Usage: agent-memory.sh $AGENT remember <key> <value>"
      exit 1
    fi
    # Use python3 for safe JSON manipulation
    python3 -c "
import json, sys
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
data['memories']['$KEY'] = {
    'value': '''$VALUE''',
    'stored': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'accessed': 0
}
data['interactions'] = data.get('interactions', 0) + 1
with open('$AGENT_FILE', 'w') as f:
    json.dump(data, f, indent=2)
print('Stored: $KEY')
"
    echo -e "${GREEN}$AGENT remembered: $KEY${RESET}"
    ;;

  recall)
    KEY="${3:-}"
    if [ -z "$KEY" ]; then
      echo "Usage: agent-memory.sh $AGENT recall <key>"
      exit 1
    fi
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
mem = data.get('memories', {}).get('$KEY')
if mem:
    # Increment access count
    mem['accessed'] = mem.get('accessed', 0) + 1
    with open('$AGENT_FILE', 'w') as f:
        json.dump(data, f, indent=2)
    print(mem['value'])
else:
    print('No memory found for: $KEY')
"
    ;;

  forget)
    KEY="${3:-}"
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
if '$KEY' in data.get('memories', {}):
    del data['memories']['$KEY']
    with open('$AGENT_FILE', 'w') as f:
        json.dump(data, f, indent=2)
    print('Forgotten: $KEY')
else:
    print('No memory found for: $KEY')
"
    ;;

  list)
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
memories = data.get('memories', {})
if not memories:
    print('No memories stored for $AGENT')
else:
    for k, v in memories.items():
        accessed = v.get('accessed', 0)
        print(f'  {k}: {v[\"value\"][:80]}... (accessed {accessed}x)')
"
    ;;

  context)
    # Generate context string for prompt injection
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
memories = data.get('memories', {})
facts = data.get('facts', [])
interactions = data.get('interactions', 0)

parts = []
parts.append(f'[AGENT MEMORY: {data[\"agent\"]}]')
parts.append(f'Interactions: {interactions}')

if memories:
    parts.append('Known facts:')
    for k, v in memories.items():
        parts.append(f'  - {k}: {v[\"value\"]}')

if facts:
    parts.append('Notes:')
    for f_item in facts:
        parts.append(f'  - {f_item}')

print('\n'.join(parts))
"
    ;;

  search)
    QUERY="${3:-}"
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
query = '$QUERY'.lower()
found = False
for k, v in data.get('memories', {}).items():
    if query in k.lower() or query in v.get('value', '').lower():
        print(f'  {k}: {v[\"value\"]}')
        found = True
if not found:
    print('No matches found')
"
    ;;

  log)
    shift 2
    MSG="$*"
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $MSG" >> "$AGENT_LOG"
    # Increment interaction count
    python3 -c "
import json
with open('$AGENT_FILE', 'r') as f:
    data = json.load(f)
data['interactions'] = data.get('interactions', 0) + 1
with open('$AGENT_FILE', 'w') as f:
    json.dump(data, f, indent=2)
"
    echo -e "${BLUE}Logged for $AGENT${RESET}"
    ;;

  history)
    N="${3:-10}"
    if [ -f "$AGENT_LOG" ]; then
      tail -n "$N" "$AGENT_LOG"
    else
      echo "No conversation history for $AGENT"
    fi
    ;;

  clear)
    rm -f "$AGENT_FILE" "$AGENT_LOG"
    echo -e "${GREEN}Cleared all memories for $AGENT${RESET}"
    ;;

  *)
    echo "Unknown command: $CMD"
    echo "Commands: remember, recall, forget, list, context, search, log, history, clear"
    exit 1
    ;;
esac
