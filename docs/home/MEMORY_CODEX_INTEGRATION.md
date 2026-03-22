# 🔗 [MEMORY] + [BLACKROAD OS] Integration Guide

**The Two-Check System for All Claude Agents**

---

## 🎯 The Golden Rule

**BEFORE writing ANY code, check:**
1. **[MEMORY]** - What are other Claudes doing? (coordination)
2. **[BLACKROAD OS]** - What code already exists? (reuse)

**If [MEMORY] shows a conflict → COORDINATE**
**If [BLACKROAD OS] has a solution → USE IT**

---

## 📊 Current Status

### [MEMORY] System
- **Location:** `~/.blackroad/memory/`
- **Purpose:** Real-time coordination between Claude agents
- **Check:** Every 60 seconds
- **Tool:** `~/memory-realtime-context.sh live $MY_CLAUDE compact`

### [BLACKROAD OS] System
- **Location:** `~/blackroad-blackroad os/`
- **Database:** `~/blackroad-blackroad os/index/components.db`
- **Components:** 8,789 (across 56 repositories)
- **Languages:** Python (8,626), TypeScript (163)
- **Purpose:** Search existing code, avoid rebuilding
- **Tool:** `python3 ~/blackroad-blackroad os-search.py "query"`

---

## 🚀 Quick Start: The Two-Check Workflow

### Step 1: Register & Check

```bash
# Register yourself
MY_CLAUDE=$(~/memory-sync-daemon.sh register "claude-your-task")

# [MEMORY] Check - See what others are doing
~/memory-realtime-context.sh live $MY_CLAUDE compact

# [BLACKROAD OS] Check - Search for existing code
python3 ~/blackroad-blackroad os-search.py "your task keywords"
```

### Step 2: Announce (After Checking!)

```bash
~/memory-system.sh log announce "$MY_CLAUDE" "
Hey team! I'm working on: [PROJECT]

Tasks: 1. ... 2. ... 3. ...

[MEMORY] ✅ Checked for conflicts - none found
[BLACKROAD OS] ✅ Searched for existing code - found 3 components to reuse

Checking both every 60s!
"
```

### Step 3: Work Loop (Every 60 Seconds)

```bash
while true; do
  # [MEMORY] Check
  ~/memory-realtime-context.sh live $MY_CLAUDE compact
  
  # Look for:
  # • Coordination requests
  # • Conflicting work
  # • Dependencies ready
  
  # [BLACKROAD OS] Search before building
  python3 ~/blackroad-blackroad os-search.py "next feature keywords"
  
  # Work on your task...
  
  # Update progress
  ~/memory-system.sh log progress "$MY_CLAUDE" "✅ Done: X. Next: Y"
  
  sleep 60
done
```

---

## 🔍 [BLACKROAD OS] Search Examples

### Search for Components

```bash
# Find authentication code
python3 ~/blackroad-blackroad os-search.py "authentication login jwt"

# Find API endpoints
python3 ~/blackroad-blackroad os-search.py "fastapi endpoint router"

# Find database connections
python3 ~/blackroad-blackroad os-search.py "database connection pool"

# Find React components
python3 ~/blackroad-blackroad os-search.py "react component button"

# Find mathematical functions
python3 ~/blackroad-blackroad os-search.py "equation calculation formula"
```

### View BlackRoad OS Stats

```bash
# Dashboard
python3 ~/blackroad-blackroad os-scraping-dashboard.py

# Total components
sqlite3 ~/blackroad-blackroad os/index/components.db "SELECT COUNT(*) FROM components"

# Components by language
sqlite3 ~/blackroad-blackroad os/index/components.db "
  SELECT language, COUNT(*) 
  FROM components 
  GROUP BY language 
  ORDER BY COUNT(*) DESC
"

# Components by repository
sqlite3 ~/blackroad-blackroad os/index/components.db "
  SELECT file_path, COUNT(*) 
  FROM components 
  GROUP BY SUBSTR(file_path, 1, 50) 
  LIMIT 20
"
```

### Verify Code

```bash
# Verify mathematical code
~/blackroad-blackroad os-verification-suite.sh verify <component_id> <file_path>

# View mathematical identities (76 built-in)
~/blackroad-blackroad os-verification-suite.sh identities

# Analyze all math components
~/blackroad-blackroad os-verification-suite.sh analyze-all-math
```

---

## 📋 [MEMORY] Examples

### Check Memory

```bash
# Live context (compact)
~/memory-realtime-context.sh live $MY_CLAUDE compact

# Full context
~/memory-realtime-context.sh live $MY_CLAUDE markdown

# Export for session
~/memory-system.sh export > session-context.md
```

### Log Actions

```bash
# Announce work
~/memory-system.sh log announce "$MY_CLAUDE" "Working on: X"

# Log progress
~/memory-system.sh log progress "$MY_CLAUDE" "✅ Done: X. Next: Y"

# Log deployment
~/memory-system.sh log deployed "app.blackroad.io" "blackroad-os-web"

# Log decision
~/memory-system.sh log decided "Use PostgreSQL" "Better for relational data"

# Coordinate with others
~/memory-system.sh log coordinate "$MY_CLAUDE" "Need frontend API integration"
```

### View Memory Status

```bash
# Summary
~/memory-system.sh summary

# Verify integrity
~/memory-system.sh verify

# Active instances
~/memory-sync-daemon.sh instances
```

---

## 🎯 Common Scenarios

### Scenario 1: Building a New Feature

```bash
# 1. Register
MY_CLAUDE=$(~/memory-sync-daemon.sh register "claude-new-feature")

# 2. [BLACKROAD OS] Check - Does it already exist?
python3 ~/blackroad-blackroad os-search.py "user authentication oauth"

# Result: Found 23 components related to auth!
# → USE EXISTING CODE instead of rebuilding

# 3. [MEMORY] Check - Is anyone else working on this?
~/memory-realtime-context.sh live $MY_CLAUDE compact

# Result: claude-frontend is working on auth UI
# → COORDINATE with them

# 4. Announce
~/memory-system.sh log announce "$MY_CLAUDE" "
Integrating existing auth components from [BLACKROAD OS]
Coordinating with claude-frontend on UI integration
[BLACKROAD OS] ✅ Found 23 components to reuse
[MEMORY] ✅ Coordinating with claude-frontend
"
```

### Scenario 2: Debugging an Issue

```bash
# 1. [BLACKROAD OS] Find the component
python3 ~/blackroad-blackroad os-search.py "database connection error"

# 2. [MEMORY] Check if others reported this
~/memory-realtime-context.sh live $MY_CLAUDE compact | grep -i "database\|connection"

# 3. [BLACKROAD OS] Verify the implementation
~/blackroad-blackroad os-verification-suite.sh verify <component_id> <file_path>

# 4. Log the fix
~/memory-system.sh log fixed "database connection pool" "Increased max connections to 100"
```

### Scenario 3: Deploying Changes

```bash
# 1. [MEMORY] Check deployment status
~/memory-realtime-context.sh live $MY_CLAUDE compact | grep -i "deploy"

# 2. [BLACKROAD OS] Verify code before deploy
~/blackroad-blackroad os-verification-suite.sh verify <component_id> <file_path>

# 3. Deploy
# ... deployment commands ...

# 4. [MEMORY] Log deployment
~/memory-system.sh log deployed "api.blackroad.io" "blackroad-os-api"

# 5. [MEMORY] Announce to team
~/memory-system.sh log announce "$MY_CLAUDE" "✅ API deployed to api.blackroad.io"
```

---

## 🛠️ Tools Overview

### [MEMORY] Tools

| Tool | Purpose |
|------|---------|
| `memory-system.sh` | Core memory operations (log, export, verify) |
| `memory-sync-daemon.sh` | Instance registration & management |
| `memory-realtime-context.sh` | Live context monitoring |
| `memory-collaboration-reminder.sh` | Reminders & watch mode |

### [BLACKROAD OS] Tools

| Tool | Purpose |
|------|---------|
| `blackroad-blackroad os-search.py` | Semantic code search |
| `blackroad-blackroad os-scanner.py` | Component extraction |
| `blackroad-blackroad os-verification-suite.sh` | Code verification |
| `blackroad-blackroad os-scraping-dashboard.py` | Stats dashboard |
| `blackroad-blackroad os-prism-analysis.sh` | Prism Console analysis |
| `blackroad-blackroad os-symbolic.py` | Symbolic computation |

---

## ⚠️ Critical Rules

1. **ALWAYS check [MEMORY] before starting work**
   - Avoid duplicate work
   - Coordinate with other Claudes
   - Use existing deployments

2. **ALWAYS check [BLACKROAD OS] before writing code**
   - 8,789 components already exist
   - Don't reinvent the wheel
   - Reuse > Rebuild

3. **Check BOTH every 60 seconds**
   - [MEMORY] for coordination
   - [BLACKROAD OS] for solutions
   - Update your progress

4. **Announce with both checks**
   - "[MEMORY] ✅ Checked for conflicts"
   - "[BLACKROAD OS] ✅ Searched for existing code"

---

## 📊 Statistics

**[BLACKROAD OS] Current State:**
- **Repositories:** 56 (44 BlackRoad-OS + 12 blackboxprogramming)
- **Components:** 8,789
- **Python:** 8,626 components
- **TypeScript:** 163 components
- **Largest repos:** blackroad-simple-launch (7,044), BlackRoad-Operating-System (1,379)
- **Verification:** 76 mathematical identities, symbolic computation engine

**[MEMORY] Current State:**
- **Sessions:** Tracked per Claude instance
- **Journal:** Append-only JSONL (PS-SHA∞)
- **Hash Chain:** SHA-256 for immutability
- **Context:** Auto-synthesized for session restoration

---

## 🎓 Best Practices

### DO:
✅ Check [MEMORY] every 60 seconds
✅ Search [BLACKROAD OS] before building
✅ Announce your work with both checks
✅ Coordinate when conflicts arise
✅ Reuse existing components
✅ Update progress regularly
✅ Log deployments and decisions

### DON'T:
❌ Start work without checking [MEMORY]
❌ Write code without checking [BLACKROAD OS]
❌ Duplicate existing components
❌ Deploy without announcing
❌ Ignore coordination requests
❌ Work in isolation
❌ Forget to update progress

---

## 🚀 Quick Reference Card

```bash
# Setup
MY_CLAUDE=$(~/memory-sync-daemon.sh register "claude-task")

# Before starting
~/memory-realtime-context.sh live $MY_CLAUDE compact  # [MEMORY]
python3 ~/blackroad-blackroad os-search.py "keywords"        # [BLACKROAD OS]

# Announce
~/memory-system.sh log announce "$MY_CLAUDE" "[MEMORY]✅ [BLACKROAD OS]✅ Working on: X"

# Every 60s loop
~/memory-realtime-context.sh live $MY_CLAUDE compact
python3 ~/blackroad-blackroad os-search.py "next-task"
~/memory-system.sh log progress "$MY_CLAUDE" "Update"

# When done
~/memory-system.sh log completed "Task X" "Details"
```

---

**Remember:** The BlackRoad OS remembers everything. Memory coordinates everyone. Together, they make all Claudes work as one distributed swarm!

**[MEMORY]** = Coordination | **[BLACKROAD OS]** = Code Reuse

---

*Generated: December 23, 2025*
*BlackRoad OS - Memory + BlackRoad OS Integration*
