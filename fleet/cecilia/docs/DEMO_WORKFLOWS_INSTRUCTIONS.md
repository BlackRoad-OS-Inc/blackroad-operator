# 🎯 3 Demo Workflows - Add to Project

**Project**: https://github.com/orgs/BlackRoad-OS/projects/9

These 3 workflows demonstrate the scale-first template in action.

---

## ✅ Workflow IDs Generated

```
WF-20260213-SVC-0005   → Standard Feature
SEC-20260213-SYS-0006  → Security Fix
EXP-20260213-LOC-0007  → Experimental Research
```

---

## 📋 Workflow 1: Standard Feature (Safe to Work)

**Create as Issue/Draft Item**:

```
Title: Add user profile avatar upload

Body:
Workflow ID: WF-20260213-SVC-0005

Allow users to upload custom avatars for their profiles.
Simple S3 integration, resize on upload, store URL in user table.
Safe to implement, no dependencies.

Fields to set:
- Workflow ID: WF-20260213-SVC-0005
- Status: In Progress
- Priority: Medium
- Intent: Build
- State: Active
- Scope: Service
- Risk: Low
- Effort: S (1-4h)
- Service: web
- Traffic Light: 🟢 Green
- Agent: Claude-Build-01
```

**What it demonstrates**:
- ✅ Green light = safe to work on
- ✅ Service scope = contained change
- ✅ Low risk = predictable work
- ✅ Build intent = creating new functionality

**Which views will show it**:
- IDX: Intent Explorer (under "Build")
- IDX: Service Slice (under "web")
- (NOT in Traffic Control - green light)

---

## 📋 Workflow 2: Security Fix (Needs Coordination)

**Create as Issue/Draft Item**:

```
Title: Patch XSS vulnerability in user content rendering

Body:
Workflow ID: SEC-20260213-SYS-0006

⚠️ CRITICAL SECURITY ISSUE

Critical XSS vulnerability discovered in user-generated content.
Affects multiple services. Needs immediate attention.
Coordinate with other agents before making changes.

Fields to set:
- Workflow ID: SEC-20260213-SYS-0006
- Status: In Progress
- Priority: 🔴 Critical
- Intent: Fix
- State: Active
- Scope: System
- Risk: Critical
- Effort: M (1-2d)
- Service: platform
- Traffic Light: 🔴 Red
- Blocked: No
- Due Date: 2026-02-15
- Agent: Claude-Security
```

**What it demonstrates**:
- 🔴 Red light = coordinate before touching
- ✅ System scope = affects multiple services
- ✅ Critical risk = high stakes
- ✅ Fix intent = resolving urgent problem
- ✅ Due date = time pressure

**Which views will show it**:
- IDX: Traffic Control ⚠️ (Red + Active)
- IDX: Intent Explorer (under "Fix")
- IDX: Risk Heatmap (Critical risk)
- IDX: Service Slice (under "platform")

---

## 📋 Workflow 3: Experimental Research (Speculative)

**Create as Issue/Draft Item**:

```
Title: Evaluate WebAssembly for client-side validation

Body:
Workflow ID: EXP-20260213-LOC-0007

🔬 EXPERIMENTAL RESEARCH

Investigating whether WASM could improve client-side validation performance.
Pure research - may not ship. Zero commitment.

Fields to set:
- Workflow ID: EXP-20260213-LOC-0007
- Status: Todo
- Priority: Low
- Intent: Explore
- State: Speculative
- Scope: Local
- Risk: Unknown
- Effort: L (3-5d)
- Service: web
- Traffic Light: 🟡 Yellow
- Agent: Claude-Research
- Index: Experimental-WASM
```

**What it demonstrates**:
- 🟡 Yellow light = proceed with caution
- ✅ Speculative state = might not ship
- ✅ Unknown risk = need to investigate
- ✅ Explore intent = discovery work
- ✅ Index field = groups related experiments

**Which views will show it**:
- IDX: Intent Explorer (under "Explore")
- IDX: Speculative Futures (State=Speculative)
- IDX: Unknowns (Risk=Unknown)
- (NOT in Traffic Control - only shows Red/Yellow + Active)

---

## 🚀 How to Add to Project

### Option A: Via GitHub UI (Recommended)

1. Go to: https://github.com/orgs/BlackRoad-OS/projects/9
2. Click **"Add item"** at bottom
3. Choose **"Create new issue"** or **"+ Add draft"**
4. Fill in title and description from above
5. Set all custom fields using the dropdown/select options
6. Repeat for all 3 workflows

### Option B: Via gh CLI (Advanced)

```bash
# Note: gh CLI doesn't support setting custom fields easily yet
# So we'll create draft items and you can fill fields in UI

# Create in any BlackRoad-OS repo or as draft items
gh project item-add 9 --owner BlackRoad-OS --url <issue-url>

# Or create draft directly in project UI
```

---

## ✅ Verification

After adding all 3, check these views:

### IDX: Traffic Control
Should show:
- ✅ SEC-20260213-SYS-0006 (Red light + Active)

### IDX: Intent Explorer
Should show 3 groups:
- ✅ Build: WF-20260213-SVC-0005
- ✅ Fix: SEC-20260213-SYS-0006
- ✅ Explore: EXP-20260213-LOC-0007

### IDX: Risk Heatmap
Should show:
- ✅ SEC-20260213-SYS-0006 (Critical risk)

### IDX: Speculative Futures
Should show:
- ✅ EXP-20260213-LOC-0007 (State=Speculative)

### IDX: Unknowns
Should show:
- ✅ EXP-20260213-LOC-0007 (Risk=Unknown)

---

## 🎓 What You've Demonstrated

Once these 3 workflows are in the project, you'll have proven:

1. **Index-first works**: Same workflows appear in multiple views
2. **Traffic lights work**: Red shows in Traffic Control, Green doesn't
3. **Orthogonal dimensions**: Type, Intent, State, Scope, Risk all independent
4. **Scale-ready**: Easy to add more without breaking structure
5. **Query-based**: Views automatically populate from filters

---

## 🔄 Next Steps

After adding these 3:

1. ✅ Click through all 9 views to see them populate
2. ✅ Try creating your own workflow
3. ✅ Use generate-workflow-id for the next ID
4. ✅ Watch the system scale naturally

---

**Remember**: These are real workflows demonstrating real patterns. Keep them or delete them - the system scales either way.

---

Created: 2026-02-13
Status: Ready to add to project
