# 🎯 Example Workflows

**Demonstrates the scale-first template in action**

These examples show how to use the template at different scales and scenarios.

---

## 🎓 Learning Examples (Start Here)

### Example 1: Simple Feature
```yaml
Workflow ID: WF-20260213-SVC-0010
Title: Add user profile avatar upload
Type: Feature
Intent: Build
State: Active
Scope: Service
Risk: Low
Priority: Medium
Effort: S (1-4h)
Service: web
Traffic Light: Green
Status: In Progress
```

**Why this setup**:
- `WF` prefix = standard workflow
- `SVC` scope = affects one service (web)
- `Low` risk = straightforward implementation
- `Green` traffic light = safe for anyone to work on

---

### Example 2: Experimental Research
```yaml
Workflow ID: EXP-20260213-SYS-0001
Title: Evaluate quantum-resistant crypto for PS-SHA∞
Type: Research
Intent: Explore
State: Speculative
Scope: System
Risk: Unknown
Priority: Low
Effort: XL (1-2w)
Service: infrastructure
Traffic Light: Yellow
Agent: Claude-Research
Index: "Quantum-Investigation"
```

**Why this setup**:
- `EXP` prefix = experiment, might not ship
- `Speculative` state = exploring possibility
- `Unknown` risk = need to investigate
- `Yellow` traffic light = needs coordination
- `Index` = groups related experiments

---

### Example 3: Critical Security Fix
```yaml
Workflow ID: SEC-20260213-PUB-0001
Title: Patch XSS vulnerability in user-generated content
Type: Security
Intent: Fix
State: Active
Scope: Public
Risk: Critical
Priority: Critical
Effort: M (1-2d)
Service: web
Traffic Light: Red
Blocked: No
Due Date: 2026-02-15
Agent: Claude-Security
Status: In Progress
```

**Why this setup**:
- `SEC` prefix = security-related
- `PUB` scope = public-facing, external impact
- `Critical` risk + priority = urgent
- `Red` traffic light = high-conflict zone, coordinate!
- Due date set = time pressure

---

### Example 4: Cross-Service Integration
```yaml
Workflow ID: WF-20260213-SYS-0015
Title: Integrate payment system with user accounts
Type: Integration
Intent: Integrate
State: Active
Scope: System
Risk: High
Priority: High
Effort: L (3-5d)
Service: platform
Traffic Light: Yellow
Blocked: Yes - Dependencies
Dependencies: "WF-20260210-SVC-0042 (payment API), WF-20260211-SVC-0018 (auth refactor)"
Agent: Claude-Platform
Index: "Q1-Payment-Launch"
```

**Why this setup**:
- `SYS` scope = multiple services affected
- `High` risk = integration complexity
- `Yellow` + dependencies = needs coordination
- References other workflow IDs = provenance

---

### Example 5: Paused Technical Debt
```yaml
Workflow ID: WF-20260210-LOC-0033
Title: Refactor UserService to use new validation library
Type: Refactor
Intent: Optimize
State: Paused
Scope: Local
Risk: Low
Priority: Low
Effort: M (1-2d)
Service: api
Traffic Light: Green
```

**Why this setup**:
- `Paused` state = can resume anytime
- `Low` risk + priority = safe to defer
- `Local` scope = contained change
- Still appears in "IDX: Dormant" view

---

## 🚀 Real-World Scenarios

### Scenario 1: Sprint Planning

Create workflows for Q1 Sprint 3:

```bash
# Feature 1
WF-20260215-SVC-0001
Index: "2026-Q1-Sprint-3"
Sprint: "Q1-S3"
Status: Todo

# Feature 2
WF-20260215-SVC-0002
Index: "2026-Q1-Sprint-3"
Sprint: "Q1-S3"
Status: Todo
```

Query in "IDX: Intent Explorer":
- Filter: `Sprint = "Q1-S3"`
- Group by: Service

---

### Scenario 2: Multi-Agent Coordination

Multiple Claude agents working simultaneously:

```yaml
# Agent 1: Build
WF-20260213-SVC-0020
Agent: Claude-Build-01
Traffic Light: Green
State: Active

# Agent 2: Build (different service)
WF-20260213-SVC-0021
Agent: Claude-Build-02
Traffic Light: Green
State: Active

# Agent 3: Research (same area as Agent 1)
EXP-20260213-SVC-0022
Agent: Claude-Research
Traffic Light: Yellow
Dependencies: "WF-20260213-SVC-0020"
```

Check "IDX: Traffic Control" before starting work.

---

### Scenario 3: Feature Merge

Merging experimental work into production:

```yaml
# Original experiment
EXP-20260201-LOC-0005
Title: Test new caching strategy
State: Merged
Merge Target: WF-20260213-SYS-0025

# Production implementation
WF-20260213-SYS-0025
Title: Deploy proven caching strategy to production
Provenance: "Merged from EXP-20260201-LOC-0005"
Type: Feature
Intent: Deploy
State: Active
```

Both workflows remain in system. Provenance preserved.

---

### Scenario 4: High-Risk Coordination

System-wide architecture change:

```yaml
# Parent workflow
INF-20260213-SYS-0001
Title: Migrate from REST to GraphQL
Risk: High
Priority: High
Effort: XXL (> 2w)
Traffic Light: Red
Index: "GraphQL-Migration"

# Child workflows (break it down)
WF-20260213-SVC-0030
Title: Add GraphQL schema to API service
Parent issue: INF-20260213-SYS-0001
Scope: Service
Effort: M (1-2d)
Index: "GraphQL-Migration"

WF-20260213-SVC-0031
Title: Update web client to use GraphQL
Parent issue: INF-20260213-SYS-0001
Scope: Service
Effort: M (1-2d)
Index: "GraphQL-Migration"
```

Use "IDX: Risk Heatmap" to track progress.

---

## 🎯 Index Strategies

### By Epic/Feature
```
Index: "Auth-Redesign"
Index: "Payment-Integration"
Index: "Mobile-App-Launch"
```

### By Time
```
Index: "2026-Q1-Sprint-3"
Index: "2026-February"
Index: "Week-of-2026-02-10"
```

### By Team/Agent
```
Index: "Web-Team"
Index: "Claude-AI-Tasks"
Index: "Infrastructure-Team"
```

### By Theme
```
Index: "Tech-Debt"
Index: "Security-Hardening"
Index: "Performance-Optimization"
```

**Key**: One workflow can have MULTIPLE indexes!

```yaml
WF-20260213-SVC-0040
Index: "2026-Q1-Sprint-3, Auth-Redesign, Web-Team"
```

---

## 📊 Query Patterns

### Find Urgent Work
```
Priority = Critical
State = Active
Sort by: Due Date
```

### Agent Load Check
```
Agent = "Claude-Build-01"
State = Active OR Paused
```

### Blocked Items
```
Blocked ≠ No
State = Active
Sort by: Priority
```

### Ready to Merge
```
Status = Done
Merge Target ≠ empty
```

### Unknowns (Learning Opportunities)
```
Risk = Unknown
Sort by: Effort (smallest first)
```

---

## 🧠 Anti-Patterns (Don't Do This)

### ❌ Merging by Default
```yaml
# BAD: Merging everything into one "master" workflow
WF-20260213-SYS-0001
Title: "All web features Q1"
Sub-issues: 127 workflows
```

**Why bad**: Creates bottleneck, loses granularity, breaks at scale.

**Do instead**: Keep workflows separate, use Index to group.

---

### ❌ Missing Workflow IDs
```yaml
# BAD: No stable identifier
Title: "Fix login bug"
# (GitHub auto-generates issue #, but that's per-repo)
```

**Why bad**: Can't reference across systems, not sortable/searchable.

**Do instead**: Always assign Workflow ID first.

---

### ❌ Ignoring Traffic Lights
```yaml
# BAD: Two agents modifying same service simultaneously
WF-20260213-SVC-0050
Service: api
Agent: Claude-Build-01
Traffic Light: Green  # ← Still green!

WF-20260213-SVC-0051
Service: api
Agent: Claude-Build-02
Traffic Light: Green  # ← Collision incoming
```

**Why bad**: Merge conflicts, wasted work, coordination failure.

**Do instead**: First agent sets Yellow, second checks before starting.

---

### ❌ Creating "Organizing" Workflows
```yaml
# BAD: Meta-workflow that just groups others
WF-20260213-SYS-0100
Title: "Container for all payment workflows"
Type: ???
Intent: ???
```

**Why bad**: Treating workflows as structure, not data.

**Do instead**: Use Index field: `Index: "Payment-System"`

---

## 🎓 Progression Path

### Week 1: Learning
- Create 5-10 workflows
- Practice setting fields
- Use "IDX: Traffic Control" view
- Generate Workflow IDs

### Week 2: Operating
- Create workflows for real work
- Use multiple indexes
- Check traffic lights before starting
- Update State as work progresses

### Month 1: Scaling
- 50-100 workflows active
- Custom views for team needs
- Traffic light coordination working
- Provenance tracking working

### Quarter 1: Mastery
- 500+ workflows total
- Views thrown away and recreated easily
- Index-first thinking natural
- Teaching others the system

---

## 🚀 Next: Start Your First Workflow

```bash
# 1. Generate ID
WORKFLOW_ID=$(~/bin/generate-workflow-id)
echo "New workflow: $WORKFLOW_ID"

# 2. Create issue in GitHub
gh issue create \
  --title "Your workflow title" \
  --body "Description here" \
  --repo BlackRoad-OS/your-repo

# 3. Add to Project
gh project item-add 9 --owner BlackRoad-OS --url <issue-url>

# 4. Set Workflow ID field via UI
# (Automation coming soon)
```

---

**Remember**: Start simple. Add complexity only when needed.

The system scales. You don't need to optimize for 1M workflows on day 1.

But you DO need to avoid patterns that break at scale.

**Index-first. Always.**

---

Created: 2026-02-13
Version: 1.0
