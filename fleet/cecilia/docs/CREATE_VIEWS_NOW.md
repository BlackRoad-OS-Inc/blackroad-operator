# 🔭 Create 9 Index Views - Step by Step

**Project**: https://github.com/orgs/BlackRoad-OS/projects/9
**Time**: ~5 minutes total

---

## 🎯 The Process (Same for All)

1. Open project → Click **"+ New view"** (top right)
2. Choose **Table** or **Board** layout
3. Name it (with `IDX:` prefix)
4. Click the **Filter** button
5. Add filters/grouping/sorting
6. Done!

---

## 5 CANONICAL VIEWS (Must Have)

### 1️⃣ IDX: Traffic Control

**Layout**: Table  
**Name**: IDX: Traffic Control

**Filters**:
- Traffic Light | is not | 🟢 Green
- State | is | Active

**Sort**:
- Risk | Descending
- Priority | Descending

**Columns**: Title, Traffic Light, Risk, Priority, Service, Agent, State

**Purpose**: Air traffic control. If empty → system healthy.

---

### 2️⃣ IDX: Intent Explorer

**Layout**: Table  
**Name**: IDX: Intent Explorer

**Filters**:
- State | is not | Archived

**Group by**: Intent

**Sort**: Priority | Descending

**Columns**: Title, Intent, Scope, Service, Priority, Effort

**Purpose**: See why work exists (not what's next).

---

### 3️⃣ IDX: Service Slice

**Layout**: Board  
**Name**: IDX: Service Slice

**Filters**:
- Scope | is any of | Service, System
- State | is | Active

**Group by**: Service

**Columns by**: Status (Todo, In Progress, Done)

**Purpose**: Local reasoning without breaking global scale.

---

### 4️⃣ IDX: Risk Heatmap

**Layout**: Table  
**Name**: IDX: Risk Heatmap

**Filters**:
- Risk | is any of | High, Critical

**Sort**:
- Traffic Light | Ascending (🔴 first)
- Effort | Ascending (XS first)

**Columns**: Title, Risk, Traffic Light, Effort, Priority, Service, Intent

**Purpose**: Find cheap wins (high-risk + low-effort).

---

### 5️⃣ IDX: Merge Gate

**Layout**: Table  
**Name**: IDX: Merge Gate

**Filters**:
- State | is | Merged
  OR
- Merge Target | is not empty

**Sort**: Due Date | Descending

**Columns**: Title, State, Merge Target, Provenance, Status, Priority

**Purpose**: Only place merging is discussed. Rare. Sacred.

---

## 4 OPTIONAL POWER VIEWS

### 6️⃣ IDX: Speculative Futures

**Layout**: Board  
**Name**: IDX: Speculative Futures

**Filters**: State | is | Speculative

**Group by**: Service

**Purpose**: All experiments. Zero commitment.

---

### 7️⃣ IDX: Dormant

**Layout**: Table  
**Name**: IDX: Dormant

**Filters**:
- State | is | Paused
- Risk | is | Low

**Sort**: Priority | Descending

**Columns**: Title, Service, Priority, Effort, Agent

**Purpose**: Safe to resume anytime.

---

### 8️⃣ IDX: Agent Load

**Layout**: Table  
**Name**: IDX: Agent Load

**Filters**: State | is | Active

**Group by**: Agent

**Sort**: Priority | Descending

**Columns**: Title, Agent, Service, Priority, Effort, Status

**Purpose**: See agent workload, balance assignments.

---

### 9️⃣ IDX: Unknowns

**Layout**: Table  
**Name**: IDX: Unknowns

**Filters**: Risk | is | Unknown

**Sort**:
- Effort | Ascending (smallest first)
- Priority | Descending

**Columns**: Title, Risk, Priority, Effort, Service, Intent

**Purpose**: 🔥 Goldmine. These need investigation.

---

## 🎯 Quick Reference Card

```
CANONICAL (must have):
1. Traffic Control  → Traffic Light ≠ Green + Active
2. Intent Explorer  → Group by Intent
3. Service Slice    → Scope=Service/System + Active → Group by Service
4. Risk Heatmap     → Risk=High/Critical
5. Merge Gate       → State=Merged OR Merge Target set

POWER (optional):
6. Speculative      → State=Speculative
7. Dormant          → State=Paused + Risk=Low
8. Agent Load       → Active → Group by Agent
9. Unknowns         → Risk=Unknown
```

---

## ⚡ Speed Run

1. Open: https://github.com/orgs/BlackRoad-OS/projects/9
2. For each view: **+ New view** → Copy settings → Save
3. Total time: **~5 minutes**

---

## ✅ Verification

After creating all 9, you should see:

- Board (default)
- IDX: Traffic Control
- IDX: Intent Explorer
- IDX: Service Slice
- IDX: Risk Heatmap
- IDX: Merge Gate
- IDX: Speculative Futures
- IDX: Dormant
- IDX: Agent Load
- IDX: Unknowns

---

**Pro tip**: Start with just the 5 canonical views. Add power views later.

**Remember**: Views are lenses. Disposable. Delete and recreate anytime.

---

Created: 2026-02-13
