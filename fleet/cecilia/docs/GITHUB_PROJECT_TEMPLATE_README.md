# BlackRoad OS Master Project Template

**Scale-First Architecture**: This template is designed to manage up to 1,000,000 concurrent workflows.

## 🧠 Core Philosophy: Index, Don't Merge

```
We don't merge reality. We index it.
```

### Mental Model
- A **workflow** is an addressable unit, not a task
- A **project** is an index over workflows, not a container
- A **milestone** is a query, not a deadline
- A **status** is a tag, not a phase

### Core Constraints (Non-Negotiable)
- ❌ Do NOT assume a single backlog, board, or queue
- ❌ Do NOT merge workflows by default
- ✅ Treat every workflow as potentially long-lived, parallel, and independent
- ✅ Index > aggregate > merge (merge is last and optional)

---

## 🏗️ Four-Layer Architecture

### 1. Identity Layer
Every workflow has a stable ID (never reused). IDs are sortable, searchable, and prefix-typed.

**Field**: `Workflow ID`
- Format: `{prefix}-{timestamp}-{scope}-{seq}`
- Example: `WF-20260213-SYS-0042`
- Never reused, even after archival

### 2. Index Layer
Multiple indexes over the same workflows. Indexes are cheap to create and cheap to discard.

**Field**: `Index`
- Which view/index does this belong to
- Examples: "Q1-Sprint", "Security-Audit", "AI-Coordination"
- No "primary" index - workflows can appear in multiple

### 3. Execution Layer
Workflows may be active, paused, speculative, or archived. Execution state must not determine visibility.

**Field**: `State`
- **Active**: Currently being worked on
- **Paused**: Temporarily halted
- **Speculative**: Exploring possibility
- **Archived**: Preserved for history
- **Merged**: Combined into another workflow

### 4. Decision Layer
Decisions are logged separately from execution. Decisions reference workflows; workflows do not embed decisions.

**Field**: `Provenance`
- Where did this workflow come from?
- Examples: "Split from WF-123", "User request", "Auto-generated"

---

## 📋 Field System

### Required Orthogonal Dimensions

#### Type (What kind)
- Feature, Bug, Enhancement, Docs, Refactor, Infrastructure, Security, Testing

#### Intent (Why it exists)
- **Explore**: Discovery and research
- **Build**: Creating new functionality
- **Fix**: Resolving issues
- **Optimize**: Improving performance/efficiency
- **Research**: Deep investigation
- **Integrate**: Connecting systems
- **Deploy**: Shipping to production
- **Document**: Recording knowledge

#### State (Current posture, not progress)
- Active, Paused, Speculative, Archived, Merged

#### Scope (Blast radius)
- **Local**: Single file/component
- **Service**: One service/domain
- **System**: Multiple services
- **Public**: External-facing
- **Experimental**: Sandbox/prototype

#### Risk (Uncertainty level)
- Unknown, Low, Medium, High, Critical

### BlackRoad Specific

#### Traffic Light (Multi-agent coordination)
- 🟢 **Green**: Safe to work on, no conflicts
- 🟡 **Yellow**: Proceed with caution, coordinate first
- 🔴 **Red**: Blocked or high-conflict zone

#### Service (Which domain)
Maps to BlackRoad registry: web, prism, operator, api, auth, billing, blackroad os, memory, platform, infrastructure, other

#### Agent (AI assignment)
Which AI agent is responsible for this workflow

### Project Management

#### Priority
- 🔴 **Critical**: System down, security issue, blocking release
- 🟠 **High**: Important feature, significant bug
- 🟡 **Medium**: Standard work
- 🟢 **Low**: Nice-to-have

#### Effort
- **XS** (< 1h): Quick fixes
- **S** (1-4h): Small features
- **M** (1-2d): Medium features
- **L** (3-5d): Large features
- **XL** (1-2w): Major features
- **XXL** (> 2w): Break into smaller workflows

#### Status (Kanban)
- Todo → In Progress → Done

#### Others
- Sprint, Due Date, Blocked, Dependencies, Milestone, Repository

### Merging System

#### Merge Target
Only populate when merging. References the workflow this will merge into.

**Merging Policy**:
- Workflows are NEVER merged by default
- Merging allowed only when:
  - Shipping an artifact
  - Stabilizing an interface
  - Publishing a release
- When merging:
  - Original workflows remain intact
  - Merge result is a NEW workflow
  - Provenance MUST be preserved

---

## 🎯 Scaling Rules

### Assume Humans Never View All Workflows

Optimize for:
- **Filtering**: Show subset by criteria
- **Slicing**: Group by dimension
- **Sampling**: Representative examples
- **Summarization**: Patterns, not items

### Dashboards Show Patterns, Not Items

❌ Bad: "127 issues in backlog"
✅ Good: "Spike in Security/High/Active workflows"

### Lists Are Generated Views

Never treat a view as authoritative. Views are queries, not containers.

---

## 📊 Recommended Views

### By Intent
- **Exploration Board**: Intent=Explore, State=Active
- **Build Pipeline**: Intent=Build, Status=In Progress
- **Fix Queue**: Intent=Fix, Priority>=High

### By Scope
- **Local Changes**: Scope=Local, State=Active
- **System Impact**: Scope=System OR Scope=Public
- **Experiments**: Scope=Experimental

### By Risk
- **High Risk**: Risk>=High, State=Active
- **Unknown Territory**: Risk=Unknown

### By Service
- **Service Roadmap**: Group by Service, filter State=Active
- **Cross-Service**: Workflows touching 2+ services

### Multi-Agent Coordination
- **Traffic Light Dashboard**: Group by Traffic Light
- **Agent Assignment**: Group by Agent
- **Blocked Work**: Blocked != "No"

### Merge Pipeline
- **Ready to Merge**: Merge Target populated, Status=Done
- **Merge Provenance**: Show parent-child relationships

---

## 🚀 Usage Patterns

### Creating New Workflows

Always set:
1. **Workflow ID**: Generate stable ID
2. **Intent**: Why does this exist?
3. **Scope**: What's the blast radius?
4. **Risk**: What's unknown?
5. **State**: Start with Active or Speculative
6. **Index**: Which view(s) should show this?

Optional but recommended:
- Priority, Effort, Service, Agent

### Indexing Workflows

Create new indexes freely:
```
# Sprint-based index
Index: "2026-Q1-Sprint-3"

# Feature-based index
Index: "Auth-Redesign"

# Agent-based index
Index: "Claude-AI-Tasks"

# Cross-cutting index
Index: "Tech-Debt"
```

One workflow can be in multiple indexes.

### Querying, Not Managing

Don't think: "I need to organize these workflows"
Think: "I need to query for workflows matching X"

Examples:
- `Intent=Build AND Scope=System AND State=Active`
- `Service=api AND Risk>=High`
- `Traffic Light=Red OR Blocked!=No`

### When to Merge

Only when shipping:
1. Set `Merge Target` to destination workflow ID
2. Mark `State=Merged`
3. Record `Provenance` in new merged workflow
4. Keep original workflows intact (for history)

---

## 💡 Operating Principles

### Index-First
Create indexes/views, not structure. Query, don't organize.

### Scale Default
Design assuming 1M workflows. If it breaks at scale, reject it.

### Preserve Provenance
Never delete history. Always record where things came from.

### Metadata > Structure
Tag and query instead of moving and grouping.

### Orthogonal Labels
Each dimension should be independent. No overlap in meaning.

---

## 🔹 MASTER PROMPT FOR AI AGENTS

Use this when instructing AI agents to work in this template:

```
You are operating in a system designed to manage up to 1,000,000 concurrent workflows.

Core constraints (non-negotiable):
• Do NOT assume a single backlog, board, or queue
• Do NOT merge workflows by default
• Treat every workflow as potentially long-lived, parallel, and independent
• Index > aggregate > merge (merge is last and optional)

Mental Model:
• A workflow is an addressable unit, not a task
• A project is an index over workflows, not a container
• A milestone is a query, not a deadline
• A status is a tag, not a phase

Required dimensions:
• type: what kind of workflow
• intent: why it exists
• state: current posture, not progress
• scope: blast radius (local/service/system/public/experimental)
• risk: uncertainty level (low/medium/high/unknown)

Operate index-first.
Assume massive scale.
Do not merge unless explicitly instructed.
Prefer metadata, queries, and views over structure changes.
Preserve provenance.
```

### Daily Use (Short Version)

```
Operate index-first.
Assume massive scale.
Do not merge unless explicitly instructed.
Prefer metadata, queries, and views.
Preserve provenance.
```

---

## 🎓 Why This Works

This template forces thinking at scale:
- Stop assuming human-scale cognition
- Treat workflows like data, not tasks
- Treat decisions as overlays, not mutations
- Prevent collapse (no giant boards)
- Bias toward indexing, not merging

**We don't merge reality. We index it.**

---

## 📦 Field Summary

**27 Total Fields**:
- 10 GitHub defaults (Title, Assignees, Status, Labels, etc.)
- 17 custom fields for scale-first architecture

**Orthogonal Dimensions**:
- Type, Intent, State, Scope, Risk
- Priority, Effort, Service, Agent
- Traffic Light, Workflow ID, Index, Provenance, Merge Target

---

Created: 2026-02-13 | Version: 2.0 (Scale-First)
Architecture: Index > Aggregate > Merge
