# 🔭 Index Views Setup Guide

**Project**: https://github.com/orgs/BlackRoad-OS/projects/9

GitHub Projects v2 doesn't support programmatic view creation yet, but setting these up manually takes ~5 minutes and is worth it.

---

## 🏗️ Quick Setup (Do This Once)

1. Open https://github.com/orgs/BlackRoad-OS/projects/9
2. For each view below, click **➕ New View**
3. Name it with `IDX:` prefix (signals "this is a lens")
4. Apply the filters/groupings shown

---

## 1️⃣ IDX: Traffic Control

**Purpose**: Multi-agent safety. Air traffic control for workflows.

**Type**: Table

**Filters**:
- Traffic Light: `is not` 🟢 Green
- State: `is` Active

**Sort**:
1. Risk ↓ (High → Low)
2. Priority ↓ (Critical → Low)

**Why**: If this view is empty → system is healthy. No collisions.

**Columns to show**: Title, Traffic Light, Risk, Priority, Service, Agent, State

---

## 2️⃣ IDX: Intent Explorer

**Purpose**: See why work exists, not what's next. At 1M workflows, intent matters more than order.

**Type**: Table

**Filters**:
- State: `is not` Archived

**Group by**: Intent

**Sort**: Priority ↓

**Why**: Understand the shape of all work by purpose.

**Columns to show**: Title, Intent, Scope, Service, Priority, Effort

---

## 3️⃣ IDX: Service Slice

**Purpose**: Local reasoning without breaking global scale. Teams can think locally.

**Type**: Board (or Table)

**Filters**:
- Scope: `is` Service OR System
- State: `is` Active

**Group by**: Service

**Columns** (if Board):
- Status: Todo → In Progress → Done

**Why**: Each service team gets their view without pretending the rest doesn't exist.

---

## 4️⃣ IDX: Risk Heatmap

**Purpose**: Decision pressure. Find where thinking is required before failure.

**Type**: Table

**Filters**:
- Risk: `is` High OR Critical

**Sort**:
1. Traffic Light (🔴 → 🟡 → 🟢)
2. Effort ↑ (XS → XXL)

**Why**: 
- High-risk + low-effort = **cheap wins**
- High-risk + high-effort = **decision points**

**Columns to show**: Title, Risk, Traffic Light, Effort, Priority, Service, Intent

---

## 5️⃣ IDX: Merge Gate 🛑

**Purpose**: The ONLY place merging is discussed. Rare. Sacred. Auditable.

**Type**: Table

**Filters**:
- State: `is` Merged
- OR Merge Target: `is not empty`

**Sort**: Due Date ↓

**Why**: Merging is opt-in. This view keeps it that way.

**Columns to show**: Title, State, Merge Target, Provenance, Status, Priority

---

## 🧩 OPTIONAL POWER VIEWS

### IDX: Speculative Futures

**Filters**: State = Speculative

**Why**: See all experiments and possibilities. Zero commitment.

---

### IDX: Dormant

**Filters**: 
- State = Paused
- Risk = Low

**Why**: Work that's paused but safe. Can be resumed anytime.

---

### IDX: Agent Load

**Group by**: Agent

**Filters**: State = Active

**Why**: See which agents are overloaded. Balance work.

---

### IDX: Unknowns (🔥 Goldmine)

**Filters**: Risk = Unknown

**Sort**: Priority ↓

**Why**: These need investigation. Unknown risks are where learning happens.

---

### IDX: By Scope

**Group by**: Scope

**Filters**: State ≠ Archived

**Why**: See blast radius distribution. Are we local or system-heavy?

---

### IDX: Blocked Work

**Filters**: Blocked ≠ No

**Sort**: Priority ↓

**Why**: What needs unblocking right now?

---

## 🎯 The Pattern You'll Notice

Each view is:
- ✅ **Disposable** - Delete it, nothing breaks
- ✅ **Overlapping** - Same workflow appears in multiple views
- ✅ **Query-based** - Not structure, just filters
- ✅ **Purpose-driven** - Answers a specific question

---

## 💡 Advanced: Custom Views You Might Want

```
# Sprint Planning
Filter: Sprint = "2026-Q1-S3", State = Active
Group by: Status

# Agent Handoff
Filter: Traffic Light = Yellow, Agent = not empty
Sort: Priority ↓

# Tech Debt Queue
Filter: Type = Refactor, Intent = Optimize
Sort: Effort ↑

# Security Surface
Filter: Type = Security, State = Active
Group by: Risk

# Public-Facing Work
Filter: Scope = Public
Group by: Service

# Cross-Service Coordination
Filter: (computed - would need multiple services, requires manual tagging)

# Ready to Ship
Filter: Status = Done, Merge Target = not empty

# Abandoned (Maybe)
Filter: State = Paused, Priority = Low
Sort by: Last updated (oldest first)
```

---

## 🧠 Mental Models

### Bad (Traditional)
"Where should I put this task?"
→ Assumes single container

### Good (Index-first)
"What queries should surface this workflow?"
→ Assumes multiple perspectives

---

## 🚀 Next Level: Automation Ideas

Once views exist, you can:

1. **Auto-assign to Index** based on rules
2. **Traffic light notifications** when view becomes non-empty
3. **Agent load balancing** based on Agent Load view
4. **Risk tracking** - alert when Risk Heatmap grows
5. **Merge auditing** - require approval for Merge Gate entries

---

## 📊 What Success Looks Like

After 1 week:
- ✅ 5 canonical views exist
- ✅ Team uses them daily
- ✅ No one asks "where does this go?"
- ✅ Views are thrown away and recreated freely

After 1 month:
- ✅ Custom views emerge for specific needs
- ✅ No "main board" exists
- ✅ Scale is comfortable, not scary
- ✅ Decisions are explicit (Merge Gate usage)

After 3 months:
- ✅ 1000+ workflows, still navigable
- ✅ Views are teaching tool for new team members
- ✅ Index-first is default thinking
- ✅ Other teams copying the pattern

---

**Remember**: Views are lenses, not boxes. You're navigating, not organizing.

**We don't merge reality. We index it.**

---

Created: 2026-02-13
Version: 1.0
