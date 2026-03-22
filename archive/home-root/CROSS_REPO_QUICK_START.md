# 🚀 Cross-Repo Index - Quick Start

**5-minute setup to enable cross-repo workflow discovery**

---

## 📥 Install to a Repo (90 seconds)

```bash
# Navigate to any repo
cd ~/path/to/your/repo

# Deploy the index system
~/.blackroad/cross-repo-templates/deploy-cross-repo-index.sh

# Commit and push
git add .github/workflows/ .blackroad/
git commit -m "🌐 Add cross-repo index system (Tier 1)"
git push
```

**Done!** The repo now has:
- ✅ Auto-indexing on issue creation/update
- ✅ Dependency tracking
- ✅ Cross-repo query capability

---

## 🧪 Test It (2 minutes)

1. **Create a test issue** in your repo:
   - Title: "Test workflow"
   - Add label: `WF-20260213-SVC-0001` (or generate one with `~/bin/generate-workflow-id`)
   - Add labels: `Service`, `Build`, `🟢`

2. **Wait for GitHub Action** (~30 seconds)
   - Go to: `https://github.com/{owner}/{repo}/actions`
   - Watch "Workflow Index Sync" run

3. **Check the index**:
   ```bash
   cat .blackroad/workflow-index.jsonl
   ```
   
   You should see:
   ```json
   {"id":"WF-20260213-SVC-0001","repo":"owner/repo","title":"Test workflow",...}
   ```

---

## 🔍 Query Examples

### Find all Active workflows
```bash
jq 'select(.state=="Active")' .blackroad/workflow-index.jsonl
```

### Find workflows with dependencies
```bash
jq 'select(.deps | length > 0)' .blackroad/workflow-index.jsonl
```

### Find Red traffic lights (conflicts)
```bash
jq 'select(.traffic_light=="🔴")' .blackroad/workflow-index.jsonl
```

### Count workflows by state
```bash
jq -s 'group_by(.state) | map({state: .[0].state, count: length})' \
  .blackroad/workflow-index.jsonl
```

---

## 🌐 Cross-Repo Dependencies

### Syntax

In your issue body, add:
```
Dependencies: WF-20260212-SYS-0001, BlackRoad-OS/api#SEC-20260213-PUB-0006
```

**Format**:
- `WF-XXXX-XXX-XXXX` = Local dependency (same repo)
- `owner/repo#WF-XXXX-XXX-XXXX` = Cross-repo dependency

### Example Issue

```markdown
# Add health check UI

Depends on API health endpoint being available.

Dependencies: BlackRoad-OS/api#WF-20260213-SYS-0001

## Tasks
- [ ] Add /health status component
- [ ] Display uptime and version
- [ ] Show service dependencies
```

The dependency checker will:
- ✅ Detect the cross-repo dependency
- ✅ Query `BlackRoad-OS/api/.blackroad/workflow-index.jsonl`
- ✅ Check if `WF-20260213-SYS-0001` is Done
- ⚠️ Create alert if blocked

---

## 📊 Org-Wide Queries (Tier 2)

Once 10+ repos have indexes, set up **Tier 2** (organization project):

### Option A: Manual Setup (5 minutes)

1. Create GitHub Project in your org
2. Add these fields (from your Template project):
   - Workflow ID (text)
   - State (select)
   - Scope (select)
   - Traffic Light (select)
   - Dependencies (text)

3. Manually add workflows from each repo

### Option B: Automated Sync (15 minutes)

Create `.github/workflows/sync-to-org-project.yml`:

```yaml
name: Sync to Org Project

on:
  push:
    paths:
      - '.blackroad/workflow-index.jsonl'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Add to org project
        env:
          GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
        run: |
          # Parse new entries from workflow-index.jsonl
          # For each entry, create/update item in org project
          # See: ~/.blackroad/project-automation/auto-generate-workflow-id.yml
```

---

## 🎯 What You Get

### At 10 repos:
- ✅ Cross-repo visibility
- ✅ Dependency tracking
- ✅ <1s local queries

### At 100 repos:
- ✅ Org-wide dashboards
- ✅ Agent coordination
- ✅ <5s org queries

### At 1,000 repos:
- ✅ Global discovery
- ✅ Multi-agent orchestration
- ✅ <30s global queries

---

## 🛠️ Troubleshooting

### Index not updating?

**Check workflow permissions**:
```yaml
# In .github/workflows/workflow-index-sync.yml
permissions:
  contents: write  # Required to commit index
  issues: read     # Required to read issue metadata
```

### Cross-repo queries failing?

**Check repo visibility**:
- Private repos need `repo` scope in GitHub token
- Public repos work with default `GITHUB_TOKEN`

### Dependencies not detected?

**Check format**:
```
✅ Dependencies: WF-20260213-SYS-0001
✅ Dependencies: org/repo#WF-20260213-SYS-0001
❌ Deps: WF-20260213-SYS-0001  (wrong keyword)
❌ Depends on WF-20260213-SYS-0001  (wrong format)
```

Must start with `Dependencies:` (case-insensitive).

---

## 📚 Full Documentation

- **Architecture**: ~/CROSS_REPO_INDEX_STRATEGY.md (14KB)
- **Workflow IDs**: ~/WORKFLOW_ID_SYSTEM.md
- **GitHub Project**: ~/GITHUB_PROJECT_TEMPLATE_README.md

---

## 🚀 Deploy to Multiple Repos (Batch)

```bash
# List of repos to deploy to
REPOS=(
  ~/repos/repo1
  ~/repos/repo2
  ~/repos/repo3
)

for repo in "${REPOS[@]}"; do
  echo "Deploying to $repo..."
  ~/.blackroad/cross-repo-templates/deploy-cross-repo-index.sh "$repo"
  
  cd "$repo"
  git add .github/workflows/ .blackroad/
  git commit -m "🌐 Add cross-repo index system (Tier 1)"
  git push
  
  echo "✅ $repo deployed"
  echo ""
done

echo "🎉 Batch deployment complete!"
```

---

**Time to first index**: <2 minutes  
**Time to 10 repos indexed**: <20 minutes  
**Time to 1,000 repos indexed**: <1 day (automated)

**This is how you coordinate 1M workflows without a monolith.**
