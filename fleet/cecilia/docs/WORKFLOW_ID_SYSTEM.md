# 🔢 Workflow ID System

**Scale-first, human + machine readable, never reused**

---

## 📐 Format Specification

```
{PREFIX}-{TIMESTAMP}-{SCOPE}-{SEQ}
```

### Components

**PREFIX** (2-3 chars):
- `WF` = Standard workflow
- `EXP` = Experimental
- `SEC` = Security-related
- `INF` = Infrastructure
- `FIX` = Hotfix/urgent

**TIMESTAMP** (YYYYMMDD):
- Creation date
- Makes IDs sortable by time
- Example: `20260213`

**SCOPE** (3 chars):
- `LOC` = Local (single file/component)
- `SVC` = Service (one service)
- `SYS` = System (multi-service)
- `PUB` = Public (external-facing)
- `EXP` = Experimental

**SEQ** (4 digits):
- Sequential number for that day
- Zero-padded: `0001`, `0042`, `9999`

---

## 🎯 Examples

```
WF-20260213-SYS-0001   → First system workflow today
EXP-20260213-LOC-0005  → 5th experimental local workflow today
SEC-20260212-PUB-0003  → Security workflow from yesterday
FIX-20260213-SVC-0001  → Urgent service fix today
INF-20260210-SYS-0012  → Infrastructure change from 3 days ago
```

---

## 🔍 Properties

### Sortable
IDs naturally sort by:
1. Prefix (alphabetically)
2. Time (chronologically)
3. Scope
4. Sequence

### Searchable
- `WF-*` = All standard workflows
- `*-20260213-*` = All from today
- `*-SYS-*` = All system-scope
- `SEC-*-PUB-*` = All public security workflows

### Never Reused
Even after archival, merge, or deletion, the ID stays unique forever.

### Human Readable
You can guess what it is:
- `SEC-20260213-PUB-0001` = "Security, today, public, first one"

---

## 🛠️ Generator Script

Save as `~/bin/generate-workflow-id` (chmod +x):

```bash
#!/bin/bash
# Generate workflow ID following BlackRoad OS scale-first format

PREFIX="${1:-WF}"
SCOPE="${2:-SYS}"
TIMESTAMP=$(date +%Y%m%d)
SEQ_FILE=~/.blackroad/workflow-id-seq-${TIMESTAMP}

# Create sequence directory if doesn't exist
mkdir -p ~/.blackroad

# Get and increment sequence
if [ -f "$SEQ_FILE" ]; then
    SEQ=$(cat "$SEQ_FILE")
    SEQ=$((SEQ + 1))
else
    SEQ=1
fi

# Save new sequence
echo "$SEQ" > "$SEQ_FILE"

# Format with zero-padding
SEQ_PADDED=$(printf "%04d" $SEQ)

# Generate ID
WORKFLOW_ID="${PREFIX}-${TIMESTAMP}-${SCOPE}-${SEQ_PADDED}"

echo "$WORKFLOW_ID"
```

### Usage

```bash
# Standard workflow, system scope
generate-workflow-id
# → WF-20260213-SYS-0001

# Experimental, local scope
generate-workflow-id EXP LOC
# → EXP-20260213-LOC-0001

# Security, public scope
generate-workflow-id SEC PUB
# → SEC-20260213-PUB-0001

# Infrastructure, system scope
generate-workflow-id INF SYS
# → INF-20260213-SYS-0001
```

---

## 🔗 Integration with GitHub Projects

### Manual Entry
When creating an issue/workflow:
1. Run `generate-workflow-id [PREFIX] [SCOPE]`
2. Paste into "Workflow ID" field
3. System auto-increments for next time

### Automation (Future)
- GitHub Action on issue create
- Auto-populate Workflow ID field
- Derive PREFIX from labels
- Derive SCOPE from "Scope" field

---

## 📊 Registry System

Track all IDs in append-only log:

`~/.blackroad/workflow-id-registry.jsonl`

```jsonl
{"id":"WF-20260213-SYS-0001","created":"2026-02-13T21:30:00Z","state":"Active"}
{"id":"EXP-20260213-LOC-0002","created":"2026-02-13T21:31:00Z","state":"Speculative"}
```

### Benefits
- Audit trail
- Never reuse IDs (check before generating)
- Cross-project uniqueness
- Historical analysis

---

## 🎯 Advanced: Distributed ID Generation

For 100+ agents generating IDs simultaneously:

### Option 1: Include Agent ID
```
WF-20260213-SYS-A01-0001
                 ^^^
                Agent 01
```

### Option 2: Use microseconds
```
WF-20260213-143052-SYS-0001
             ^^^^^^
             HHMMSS (unique per second)
```

### Option 3: UUID suffix (nuclear option)
```
WF-20260213-SYS-a3f4c2e9
                 ^^^^^^^^
                 Short UUID
```

**Recommendation**: Start simple. Add complexity only when collisions occur.

---

## 🔍 Querying Examples

Once IDs exist, powerful queries become possible:

### By Time
```sql
-- All workflows from Q1 2026
WHERE Workflow_ID LIKE 'WF-202601%' OR 
      Workflow_ID LIKE 'WF-202602%' OR 
      Workflow_ID LIKE 'WF-202603%'
```

### By Type
```sql
-- All security workflows
WHERE Workflow_ID LIKE 'SEC-%'

-- All experimental
WHERE Workflow_ID LIKE 'EXP-%'
```

### By Scope
```sql
-- All system-level work
WHERE Workflow_ID LIKE '%-SYS-%'

-- All public-facing
WHERE Workflow_ID LIKE '%-PUB-%'
```

### Combined
```sql
-- System-scope security from last week
WHERE Workflow_ID LIKE 'SEC-202602%-SYS-%'
```

---

## 💾 Persistence Rules

1. **Never change an ID** once assigned
2. **Never reuse an ID** even after workflow deleted
3. **Always log ID generation** to registry
4. **IDs survive merges** - both parent and child IDs preserved

---

## 🎓 Why This Works at Scale

### At 1,000 workflows:
- IDs still human-readable
- Date-based partitioning natural
- Easy to filter/search

### At 100,000 workflows:
- Time-based queries stay fast
- Prefix filtering efficient
- No central coordination needed

### At 1,000,000 workflows:
- IDs compress well (predictable format)
- Indexes work great (sortable)
- Distribution possible (add agent/uuid)

---

## 🚀 Getting Started

```bash
# 1. Create the generator
mkdir -p ~/bin
cat > ~/bin/generate-workflow-id << 'SCRIPT'
#!/bin/bash
PREFIX="${1:-WF}"
SCOPE="${2:-SYS}"
TIMESTAMP=$(date +%Y%m%d)
SEQ_FILE=~/.blackroad/workflow-id-seq-${TIMESTAMP}

mkdir -p ~/.blackroad

if [ -f "$SEQ_FILE" ]; then
    SEQ=$(cat "$SEQ_FILE")
    SEQ=$((SEQ + 1))
else
    SEQ=1
fi

echo "$SEQ" > "$SEQ_FILE"
SEQ_PADDED=$(printf "%04d" $SEQ)
WORKFLOW_ID="${PREFIX}-${TIMESTAMP}-${SCOPE}-${SEQ_PADDED}"

# Log to registry
echo "{\"id\":\"$WORKFLOW_ID\",\"created\":\"$(date -Iseconds)\",\"prefix\":\"$PREFIX\",\"scope\":\"$SCOPE\"}" >> ~/.blackroad/workflow-id-registry.jsonl

echo "$WORKFLOW_ID"
SCRIPT

chmod +x ~/bin/generate-workflow-id

# 2. Add to PATH (if needed)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc  # or ~/.bashrc
source ~/.zshrc

# 3. Generate first ID
generate-workflow-id

# 4. Check registry
cat ~/.blackroad/workflow-id-registry.jsonl | jq
```

---

## 🎯 Next Steps

1. ✅ Create generator script
2. ✅ Test with 10 IDs
3. ✅ Add to project workflow
4. 📋 Create GitHub Action for auto-generation
5. 📋 Build dashboard showing ID usage patterns

---

**Remember**: IDs are forever. Choose the format once, stick with it.

This system scales to 10M+ workflows with zero changes needed.

---

Created: 2026-02-13
Version: 1.0
