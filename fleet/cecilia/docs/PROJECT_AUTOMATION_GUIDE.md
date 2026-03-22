# 🤖 Project Automation Deployment Guide

**Scale-first automation for GitHub Projects**

Created: 2026-02-13

---

## 📦 What's Included

Three GitHub Actions workflows for automated project management at scale:

1. **Auto-Generate Workflow IDs** - Automatic ID assignment on issue creation
2. **Traffic Light Monitor** - Conflict detection for multi-agent coordination
3. **Agent Load Balancer** - Workload monitoring and balancing

---

## 🎯 Workflow 1: Auto-Generate Workflow IDs

**File**: `auto-generate-workflow-id.yml`

### What It Does

- Triggers when new issue is created
- Generates unique Workflow ID using the format: `{PREFIX}-{TIMESTAMP}-{SCOPE}-{SEQ}`
- Detects prefix from labels (security, infrastructure, experiment, etc.)
- Comments on issue with generated ID
- Suggests next steps for adding to project

### Features

- ✅ Automatic sequence management
- ✅ Label-based prefix detection
- ✅ Human-readable format
- ✅ No collisions (date + sequence)
- ✅ Helpful comment with instructions

### Trigger

```yaml
on:
  issues:
    types: [opened]
```

### Example Output

```
🤖 Workflow ID Generated

`WF-20260213-SYS-0008`

Next steps:
1. Add this issue to Project #9
2. Set the Workflow ID field to: `WF-20260213-SYS-0008`
3. Fill in other required fields...
```

---

## 🚦 Workflow 2: Traffic Light Monitor

**File**: `traffic-light-monitor.yml`

### What It Does

- Runs every 15 minutes (configurable)
- Queries project for Red/Yellow traffic lights
- Detects conflicts (multiple workflows on same service)
- Creates/updates alert issue with conflicts
- Enables coordination between agents/teams

### Features

- ✅ Conflict detection by service
- ✅ Severity levels (HIGH for Red lights)
- ✅ Auto-creates alert issues
- ✅ Links to Traffic Control view
- ✅ Agent attribution

### Trigger

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:         # Manual trigger
```

### Example Alert

```
🚨 Traffic Light Conflicts Detected

Found 2 potential conflicts in active workflows.

## 🔴 platform

**Severity**: HIGH

**Conflicting workflows**:
- 🔴 Red #42 Patch XSS vulnerability (Agent: Claude-Security)
- 🟡 Yellow #43 Add caching layer (Agent: Claude-Build-01)

**Action needed**: Coordinate between agents/teams before proceeding.
```

---

## 📊 Workflow 3: Agent Load Balancer

**File**: `agent-load-balancer.yml`

### What It Does

- Runs hourly (configurable)
- Queries project for active workflows per agent
- Calculates workload (count + effort points)
- Detects overloaded agents
- Generates load report issue
- Enables workload balancing

### Features

- ✅ Effort-based load calculation
- ✅ Overload detection (thresholds)
- ✅ Priority tracking
- ✅ Summary table
- ✅ Recommendations

### Trigger

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:      # Manual trigger
```

### Thresholds

```javascript
const LOAD_THRESHOLD = 5;      // Max 5 active workflows
const EFFORT_THRESHOLD = 30;   // Max 30 effort points
```

### Effort Points

- XS (< 1h) = 1 point
- S (1-4h) = 2 points
- M (1-2d) = 5 points
- L (3-5d) = 10 points
- XL (1-2w) = 20 points
- XXL (> 2w) = 40 points

### Example Report

```
📊 Agent Load Balancing Report

Total Active Agents: 3

| Agent | Active Workflows | Total Effort | High Priority |
|-------|------------------|--------------|---------------|
| ✅ Claude-Build-01 | 3 | 17 | 1 |
| ⚠️ Claude-Security | 6 | 35 | 4 |
| ✅ Claude-Research | 2 | 12 | 0 |

## 🚨 Overloaded Agents

### Claude-Security
- Active workflows: 6
- Total effort: 35
- Reason: High effort total

💡 Recommendation: Consider redistributing work
```

---

## 🚀 Deployment Steps

### 1. Copy to Repository

```bash
# Create GitHub Actions directory
mkdir -p .github/workflows

# Copy automation workflows
cp ~/.blackroad/project-automation/auto-generate-workflow-id.yml .github/workflows/
cp ~/.blackroad/project-automation/traffic-light-monitor.yml .github/workflows/
cp ~/.blackroad/project-automation/agent-load-balancer.yml .github/workflows/
```

### 2. Configure Permissions

The workflows need project permissions. Two options:

#### Option A: Personal Access Token (PAT)

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes:
   - `repo` (full control)
   - `project` (full control)
   - `read:org`
4. Copy token
5. Add to repo secrets as `PROJECT_TOKEN`
6. Update workflows to use `${{ secrets.PROJECT_TOKEN }}`

#### Option B: GitHub App (Recommended for Production)

1. Create GitHub App with project permissions
2. Install on organization
3. Use app authentication in workflows

### 3. Test Workflows

```bash
# Trigger manually via GitHub UI
# Actions → Select workflow → Run workflow

# Or via CLI
gh workflow run auto-generate-workflow-id.yml
gh workflow run traffic-light-monitor.yml
gh workflow run agent-load-balancer.yml
```

### 4. Monitor First Runs

Check:
- ✅ Workflow ID generation working
- ✅ Traffic light queries returning data
- ✅ Agent load calculations correct
- ✅ Issues being created/updated

---

## ⚙️ Configuration Options

### Adjust Schedule Frequency

```yaml
# More frequent (every 5 minutes)
cron: '*/5 * * * *'

# Less frequent (every 4 hours)
cron: '0 */4 * * *'

# Daily at 9 AM
cron: '0 9 * * *'
```

### Adjust Load Thresholds

Edit `agent-load-balancer.yml`:

```javascript
const LOAD_THRESHOLD = 10;     // Allow 10 active workflows
const EFFORT_THRESHOLD = 50;   // Allow 50 effort points
```

### Customize Prefix Detection

Edit `auto-generate-workflow-id.yml`:

```bash
if echo "$LABELS" | grep -qi "your-label"; then
  PREFIX="YOUR"
fi
```

---

## 🔍 Troubleshooting

### Workflow ID Not Generated

**Problem**: No comment appears on issue
**Solution**: Check Actions tab for errors. Ensure `issues: write` permission.

### Traffic Light Monitor Not Finding Workflows

**Problem**: Alert says 0 conflicts but you see them
**Solution**: Verify GraphQL query has project permissions. May need PAT with `project` scope.

### Agent Load Report Empty

**Problem**: Report shows 0 agents
**Solution**: Ensure workflows have "Agent" field populated. Check project number is correct (9).

### Permission Errors

**Problem**: `Resource not accessible by integration`
**Solution**: Add PAT with project scope as repository secret.

---

## 🎯 Integration with Views

### Traffic Control View

Monitor shows workflows that will appear in:
- IDX: Traffic Control (Red/Yellow + Active)

### Agent Load View

Balancer analyzes workflows from:
- IDX: Agent Load (grouped by Agent)

---

## 📊 Metrics & Insights

After 1 week of running:

**Workflow ID Generator**:
- Total IDs generated
- Most common prefixes
- Daily generation rate

**Traffic Light Monitor**:
- Average conflicts per day
- Services with most conflicts
- Time to resolution

**Agent Load Balancer**:
- Agent utilization patterns
- Overload frequency
- Effort distribution

Export these from GitHub Actions runs for analysis.

---

## 🔄 Future Enhancements

### Phase 2 (Next)
- [ ] Auto-populate Workflow ID field (requires project write API)
- [ ] Slack/Discord notifications for conflicts
- [ ] Predictive conflict detection
- [ ] Auto-suggest agent reassignment

### Phase 3 (Later)
- [ ] ML-based effort estimation
- [ ] Workflow health scoring
- [ ] Cross-project coordination
- [ ] Provenance graph visualization

---

## 💡 Best Practices

### For ID Generation
- Always use labels to help detect prefix
- Don't manually create IDs (use automation)
- Check registry for uniqueness

### For Traffic Lights
- Set Red light BEFORE starting risky work
- Check Traffic Control view daily
- Coordinate when Yellow appears

### For Agent Load
- Review report weekly
- Rebalance when > 30 effort points
- Pause low-priority when overloaded

---

## 🎓 Why This Scales

### At 100 workflows
- Automation saves ~2 hours/week
- Conflicts detected in real-time
- Load visible at a glance

### At 1,000 workflows
- Automation saves ~1 day/week
- Prevents coordination failures
- Enables parallel work safely

### At 10,000+ workflows
- **Required for operation**
- Human coordination impossible
- System runs itself

---

## 📚 Additional Resources

- GitHub Actions Docs: https://docs.github.com/actions
- GraphQL API Docs: https://docs.github.com/graphql
- Projects API Docs: https://docs.github.com/graphql/reference/objects#projectv2

---

## ✅ Checklist

Before deploying:
- [ ] Workflows copied to `.github/workflows/`
- [ ] PAT created with project scope
- [ ] PAT added to repository secrets
- [ ] Test run of each workflow
- [ ] First IDs generated successfully
- [ ] First conflict/load reports created
- [ ] Team notified of automation

---

**Status**: Ready to deploy
**Maintenance**: Minimal (runs automatically)
**Next**: Deploy to production repository

---

Created: 2026-02-13
Version: 1.0
