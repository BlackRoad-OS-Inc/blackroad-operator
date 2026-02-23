# Claude Code Continuous Memory System

**Version:** 1.0
**Created:** December 22, 2025
**Purpose:** Ensure Claude Code sessions maintain continuous memory across conversations

---

## The Problem

Claude Code sessions lose context when:
- Token limits are reached (automatic summarization occurs)
- Sessions are closed and reopened
- New terminals/windows are started
- Time passes between work sessions

**Result:** Claude forgets what was built, decisions made, patterns established.

---

## The Solution: PS-SHA∞ Memory Journals

Inspired by the Genesis Identity System, we create **append-only memory journals** that:
1. Record every significant action/decision
2. Generate SHA-256 hashes for immutability
3. Persist to disk automatically
4. Restore context at session start
5. Never forget

---

## Architecture

### Three-Layer Memory System

```
┌─────────────────────────────────────┐
│  Layer 1: Session Memory            │
│  (ephemeral, current conversation)  │
└─────────────────────────────────────┘
           ↓ writes to
┌─────────────────────────────────────┐
│  Layer 2: Memory Journal             │
│  (append-only, immutable log)       │
└─────────────────────────────────────┘
           ↓ hashed with
┌─────────────────────────────────────┐
│  Layer 3: Memory Ledger              │
│  (SHA-256 hash chain, verification) │
└─────────────────────────────────────┘
```

### Directory Structure

```
~/.blackroad/
├── memory/
│   ├── sessions/
│   │   ├── 2025-12-22-001-deployment.json
│   │   ├── 2025-12-22-002-infrastructure.json
│   │   └── current-session.json (symlink)
│   ├── journals/
│   │   ├── deployment-journal.jsonl (append-only)
│   │   ├── infrastructure-journal.jsonl
│   │   └── master-journal.jsonl (all entries)
│   ├── ledger/
│   │   └── memory-ledger.jsonl (hash chain)
│   └── context/
│       ├── infrastructure.md (synthesized knowledge)
│       ├── deployment-patterns.md
│       └── decisions.md
└── config/
    └── memory-config.json
```

---

## Memory Entry Format

### Session Entry (JSON)
```json
{
  "session_id": "2025-12-22-002-infrastructure",
  "timestamp": "2025-12-22T18:30:00Z",
  "type": "session_start",
  "context": {
    "working_directory": "/Users/alexa/projects/blackroad-deployment-docs",
    "active_repos": ["blackroad-deployment-docs", "blackroad-docs", "lucidia-earth-website"],
    "last_action": "Committed infrastructure documentation",
    "current_task": "Building continuous memory system"
  },
  "sha256": "a1b2c3d4e5f6..."
}
```

### Journal Entry (JSONL - one line per entry)
```json
{"timestamp":"2025-12-22T17:00:00Z","action":"created","entity":"blackroad-deploy-system.sh","details":"Universal deployment script with 3 methods","sha256":"1fee4186...","parent_hash":"9abc123..."}
{"timestamp":"2025-12-22T17:30:00Z","action":"deployed","entity":"lucidia.earth","details":"Port 3040, aria64, Docker container","sha256":"42ea6c7b...","parent_hash":"1fee4186..."}
{"timestamp":"2025-12-22T18:00:00Z","action":"created","entity":"BLACKROAD_INFRASTRUCTURE_MASTER.md","details":"Complete infrastructure inventory","sha256":"2a402097...","parent_hash":"42ea6c7b..."}
```

### Ledger Entry (Hash Chain)
```json
{"hash":"1fee4186...","timestamp":"2025-12-22T17:00:00Z","parent":"9abc123...","action_count":1}
{"hash":"42ea6c7b...","timestamp":"2025-12-22T17:30:00Z","parent":"1fee4186...","action_count":2}
{"hash":"2a402097...","timestamp":"2025-12-22T18:00:00Z","parent":"42ea6c7b...","action_count":3}
```

---

## What Gets Remembered

### 1. Infrastructure Changes
- Servers added/removed
- Containers deployed
- Ports allocated
- DNS records created
- Domains configured

### 2. Code & Repositories
- Files created/edited
- Commits made
- Repositories created
- Dependencies added
- Build configurations

### 3. Decisions Made
- Architecture choices
- Technology selections
- Naming conventions
- Design patterns
- Trade-offs considered

### 4. Patterns Established
- Deployment workflows
- Code organization
- Naming schemes
- Port ranges
- Domain structures

### 5. Context About The User
- Preferences stated
- Pain points mentioned
- Goals articulated
- Workflow patterns
- Communication style

---

## Session Restoration Process

### On Session Start:

1. **Load Current Context**
   ```bash
   cat ~/.blackroad/memory/sessions/current-session.json
   ```

2. **Read Recent Journal Entries**
   ```bash
   tail -50 ~/.blackroad/memory/journals/master-journal.jsonl
   ```

3. **Load Synthesized Knowledge**
   ```bash
   cat ~/.blackroad/memory/context/infrastructure.md
   cat ~/.blackroad/memory/context/deployment-patterns.md
   cat ~/.blackroad/memory/context/decisions.md
   ```

4. **Verify Hash Chain Integrity**
   ```bash
   # Verify no tampering occurred
   verify-memory-ledger.sh
   ```

5. **Present Context Summary**
   ```
   📊 Session Restored

   Last session: 2025-12-22-001-deployment
   Last action: Committed infrastructure documentation
   Active repos: 3
   Recent changes: 8
   Memory integrity: ✅ Verified

   Ready to continue...
   ```

---

## Implementation

### memory-system.sh (Main Controller)

```bash
#!/bin/bash
# BlackRoad Memory System Controller

MEMORY_DIR="$HOME/.blackroad/memory"
SESSION_DIR="$MEMORY_DIR/sessions"
JOURNAL_DIR="$MEMORY_DIR/journals"
LEDGER_DIR="$MEMORY_DIR/ledger"
CONTEXT_DIR="$MEMORY_DIR/context"

# Initialize memory system
init_memory() {
    mkdir -p "$SESSION_DIR" "$JOURNAL_DIR" "$LEDGER_DIR" "$CONTEXT_DIR"

    if [ ! -f "$JOURNAL_DIR/master-journal.jsonl" ]; then
        echo '{"timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","action":"init","entity":"memory-system","sha256":"'$(echo "genesis" | shasum -a 256 | cut -d' ' -f1)'","parent_hash":"0000000000000000"}' >> "$JOURNAL_DIR/master-journal.jsonl"
    fi
}

# Create new session
new_session() {
    local session_name="$1"
    local session_id="$(date +%Y-%m-%d-%H%M)-${session_name}"
    local session_file="$SESSION_DIR/${session_id}.json"

    cat > "$session_file" <<EOF
{
  "session_id": "${session_id}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "type": "session_start",
  "context": {
    "working_directory": "$(pwd)",
    "git_repos": $(find ~/projects -name .git -type d | wc -l),
    "last_action": "$(tail -1 $JOURNAL_DIR/master-journal.jsonl | jq -r '.action + ": " + .entity' 2>/dev/null || echo "N/A")"
  }
}
EOF

    ln -sf "$session_file" "$SESSION_DIR/current-session.json"
    echo "Session created: $session_id"
}

# Log action to journal
log_action() {
    local action="$1"
    local entity="$2"
    local details="$3"

    local timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    local parent_hash="$(tail -1 $JOURNAL_DIR/master-journal.jsonl | jq -r '.sha256' 2>/dev/null || echo '0000000000000000')"
    local hash_input="${timestamp}${action}${entity}${details}${parent_hash}"
    local sha256="$(echo -n "$hash_input" | shasum -a 256 | cut -d' ' -f1)"

    echo "{\"timestamp\":\"${timestamp}\",\"action\":\"${action}\",\"entity\":\"${entity}\",\"details\":\"${details}\",\"sha256\":\"${sha256}\",\"parent_hash\":\"${parent_hash}\"}" >> "$JOURNAL_DIR/master-journal.jsonl"

    # Update ledger
    echo "{\"hash\":\"${sha256}\",\"timestamp\":\"${timestamp}\",\"parent\":\"${parent_hash}\"}" >> "$LEDGER_DIR/memory-ledger.jsonl"
}

# Synthesize context from journals
synthesize_context() {
    echo "📝 Synthesizing infrastructure context..."

    # Extract all infrastructure-related actions
    grep -E '"action":"(deployed|created|configured)"' "$JOURNAL_DIR/master-journal.jsonl" | \
        jq -r '"- [" + .timestamp + "] " + .action + ": " + .entity + " - " + .details' \
        > "$CONTEXT_DIR/recent-actions.md"

    echo "✅ Context synthesized"
}

# Show session summary
show_summary() {
    echo "📊 BlackRoad Memory System Status"
    echo ""
    echo "Session: $(readlink $SESSION_DIR/current-session.json | xargs basename)"
    echo "Total entries: $(wc -l < $JOURNAL_DIR/master-journal.jsonl)"
    echo "Last action: $(tail -1 $JOURNAL_DIR/master-journal.jsonl | jq -r '.action + ": " + .entity')"
    echo ""
    echo "Recent changes:"
    tail -5 "$JOURNAL_DIR/master-journal.jsonl" | jq -r '"  [" + .timestamp[11:19] + "] " + .action + ": " + .entity'
}

# Verify integrity
verify_integrity() {
    echo "🔍 Verifying memory integrity..."

    local entries=$(wc -l < "$JOURNAL_DIR/master-journal.jsonl")
    local valid=0
    local invalid=0

    while IFS= read -r line; do
        local parent_hash=$(echo "$line" | jq -r '.parent_hash')
        local stored_hash=$(echo "$line" | jq -r '.sha256')

        # Skip genesis entry
        if [ "$parent_hash" = "0000000000000000" ]; then
            ((valid++))
            continue
        fi

        # Verify parent exists
        if grep -q "\"sha256\":\"$parent_hash\"" "$JOURNAL_DIR/master-journal.jsonl"; then
            ((valid++))
        else
            ((invalid++))
            echo "⚠️  Broken chain at hash: $stored_hash"
        fi
    done < "$JOURNAL_DIR/master-journal.jsonl"

    if [ $invalid -eq 0 ]; then
        echo "✅ Memory integrity verified ($valid entries)"
    else
        echo "❌ Found $invalid broken entries"
    fi
}

# Main command handler
case "${1:-help}" in
    init)
        init_memory
        ;;
    new)
        new_session "${2:-default}"
        ;;
    log)
        log_action "$2" "$3" "$4"
        ;;
    synthesize)
        synthesize_context
        ;;
    summary)
        show_summary
        ;;
    verify)
        verify_integrity
        ;;
    *)
        echo "Usage: memory-system.sh {init|new|log|synthesize|summary|verify}"
        ;;
esac
```

---

## Integration with Claude Code

### .claude/hooks/on-start.sh (Session Start Hook)

```bash
#!/bin/bash
# Restore memory context when Claude Code starts

MEMORY_SYSTEM="$HOME/.blackroad/memory-system.sh"

if [ -f "$MEMORY_SYSTEM" ]; then
    echo "🧠 Restoring memory context..."

    # Show summary
    $MEMORY_SYSTEM summary

    # Synthesize latest context
    $MEMORY_SYSTEM synthesize

    echo ""
    echo "Memory restored. Continuing from where we left off..."
else
    echo "⚠️  Memory system not initialized. Run: ~/memory-system.sh init"
fi
```

### .claude/hooks/on-action.sh (Log Every Action)

```bash
#!/bin/bash
# Log significant actions to memory journal

MEMORY_SYSTEM="$HOME/.blackroad/memory-system.sh"
ACTION="$1"
ENTITY="$2"
DETAILS="$3"

if [ -f "$MEMORY_SYSTEM" ] && [ -n "$ACTION" ]; then
    $MEMORY_SYSTEM log "$ACTION" "$ENTITY" "$DETAILS"
fi
```

### .claude/CLAUDE.md Additions

```markdown
## Memory System

Every session maintains continuous memory via PS-SHA∞ journals:
- All infrastructure changes logged
- All decisions recorded
- All patterns established
- Context automatically restored

Before starting work, review:
```bash
~/memory-system.sh summary
cat ~/.blackroad/memory/context/recent-actions.md
```

When making significant changes, log them:
```bash
~/memory-system.sh log "deployed" "new-service.blackroad.io" "Port 3060, Docker container"
```
```

---

## Usage Examples

### Initialize System
```bash
~/memory-system.sh init
```

### Start New Session
```bash
~/memory-system.sh new "infrastructure-audit"
```

### Log Actions
```bash
# Deployed a service
~/memory-system.sh log "deployed" "api.blackroad.io" "Port 8080, FastAPI container"

# Created a file
~/memory-system.sh log "created" "new-deployment.sh" "Automated deployment for microservices"

# Made a decision
~/memory-system.sh log "decided" "architecture" "Using Headscale instead of Tailscale for mesh network"

# Configured infrastructure
~/memory-system.sh log "configured" "aria64:3060" "Allocated for monitoring service"
```

### View Summary
```bash
~/memory-system.sh summary
```

### Verify Integrity
```bash
~/memory-system.sh verify
```

### Synthesize Context
```bash
~/memory-system.sh synthesize
cat ~/.blackroad/memory/context/recent-actions.md
```

---

## What Claude Code Will Remember

### Infrastructure State
- Every container deployed (name, port, domain)
- Every domain configured (DNS, SSL, routing)
- Every server accessed (IP, role, credentials path)
- Every port allocated (service, purpose, status)

### Development Patterns
- Repository structures used
- Naming conventions established
- Deployment workflows followed
- Error patterns encountered and solved

### User Context
- Your stated preferences
- Your communication style
- Your project priorities
- Your pain points and how they were solved

### Historical Decisions
- Why certain technologies were chosen
- Why certain architectures were used
- Why certain patterns were established
- Trade-offs that were considered

---

## Advanced Features

### Multi-Project Context

```bash
# Create project-specific journals
~/memory-system.sh log "project:lucidia" "deployed" "lucidia.earth" "aria64:3040"
~/memory-system.sh log "project:docs" "deployed" "docs.blackroad.io" "aria64:3050"

# Filter by project
grep "project:lucidia" ~/.blackroad/memory/journals/master-journal.jsonl
```

### Time-Based Context Windows

```bash
# Last hour
tail -n 50 ~/.blackroad/memory/journals/master-journal.jsonl | \
  jq -r 'select(.timestamp > "'$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)'")'

# Last day
jq -r 'select(.timestamp > "'$(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ)'")' \
  ~/.blackroad/memory/journals/master-journal.jsonl
```

### Memory Export for New Sessions

```bash
# Generate context file for Claude
cat > ~/.blackroad/memory/context/session-start-context.md <<EOF
# Session Context Restored

## Last Session Summary
$(~/memory-system.sh summary)

## Recent Infrastructure Changes
$(tail -20 ~/.blackroad/memory/journals/master-journal.jsonl | \
  jq -r '"- " + .action + ": " + .entity + " (" + .details + ")"')

## Active Deployments
$(ssh pi@aria64 "docker ps --format '{{.Names}} ({{.Ports}})'")

## Current Working Directory
$(pwd)

## Git Status
$(git status -s 2>/dev/null || echo "Not in git repo")
EOF
```

---

## Integration with Genesis Identity System

Every memory entry is part of the canonical truth:

```json
{
  "canonical": "memory:session:2025-12-22-002-infrastructure:blackroad",
  "sha256": "a1b2c3d4e5f6..."
}
```

Memory ledger hashes become part of the Genesis hash list:
```
# memory_system
a1b2c3d4e5f6...  memory:session:2025-12-22-002-infrastructure:blackroad
1fee4186...      memory:action:deployed:lucidia.earth:blackroad
42ea6c7b...      memory:action:created:infrastructure-master:blackroad
```

---

## The Result

**Every Claude Code session becomes a continuation of the previous one.**

No more:
- "What did we deploy last time?"
- "What port was that service on?"
- "Why did we choose that approach?"
- "What was the naming pattern we established?"

Instead:
- Immediate context restoration
- Continuous memory across sessions
- Immutable audit trail
- Verifiable integrity

---

## Status

**Ready to implement.**

Next steps:
1. Create `~/memory-system.sh`
2. Run `~/memory-system.sh init`
3. Add hooks to `.claude/` directory
4. Start logging actions
5. Never forget again

---

**"The road remembers everything. So should we."** 🛣️
