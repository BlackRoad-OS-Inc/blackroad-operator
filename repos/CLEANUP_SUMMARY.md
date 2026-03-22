# Repository Cleanup Summary

## ✅ Completed

### 1. Removed 100 Automation-Task Workflows
- **Deleted**: `.github/workflows/automation-task-201.yml` through `automation-task-300.yml`
- **Space saved**: ~762KB
- **Reason**: These were placeholder workflows that only emitted metadata

### 2. Created Branch Cleanup Script
- **Location**: `scripts/cleanup-merged-branches.sh`
- **Purpose**: Batch deletion of merged bot branches
- **Status**: Ready to use (requires proper permissions)

## ⚠️ Action Required: Branch Cleanup

### Current State
- **Total remote branches**: 2,552
- **Bot branches (claude/codex/copilot/dependabot)**: 2,463
- **Repository size**: 517MB

### Permission Issue
Branch deletion failed with **HTTP 403 error**. This means you need to delete branches through:

#### Option 1: GitHub UI (Recommended for Safety)
1. Go to: https://github.com/blackboxprogramming/blackroad-prism-console/branches
2. Filter by "Merged" or search for `claude/` or `codex/`
3. Click the trash icon to delete merged branches
4. GitHub will only show merged branches that are safe to delete

#### Option 2: GitHub CLI (Batch Delete)
```bash
# Install gh if needed: https://cli.github.com/

# Delete merged claude branches
gh pr list --state merged --search "head:claude/" --limit 100 --json headRefName \
  | jq -r '.[].headRefName' \
  | xargs -I {} gh api -X DELETE repos/blackboxprogramming/blackroad-prism-console/git/refs/heads/{}

# Delete merged codex branches
gh pr list --state merged --search "head:codex/" --limit 100 --json headRefName \
  | jq -r '.[].headRefName' \
  | xargs -I {} gh api -X DELETE repos/blackboxprogramming/blackroad-prism-console/git/refs/heads/{}
```

#### Option 3: Manual Git (With Proper Auth)
```bash
# Use the cleanup script (requires push permissions)
./scripts/cleanup-merged-branches.sh
```

## 📋 Best Practices Going Forward

### When to Press Merge
1. ✅ **DO merge** when:
   - All CI checks pass (green checkmarks)
   - Bots have completed their reviews
   - You've reviewed the changes yourself
   - No conflicts exist

2. ❌ **DON'T merge** when:
   - Any checks are failing (red X)
   - Bots are still processing (yellow circle)
   - You haven't reviewed the changes
   - Merge conflicts exist

### Bot Comment Strategy
- **Comment bots ONCE** per PR: `@copilot @dependabot @claude @codex`
- **Wait for responses** (usually < 5 minutes)
- **Review their feedback** before merging
- **DON'T spam mentions** hoping for auto-merge

### Auto-Merge Settings
To enable auto-merge safely:
1. Go to PR → Enable auto-merge
2. Select "Squash and merge"
3. Set requirement: "All checks must pass"
4. This waits for bots automatically

### Review Permissions
To ensure everyone can review:
1. Settings → Collaborators & teams
2. Add reviewers with at least "Read" access
3. Settings → Branches → Branch protection
4. Enable "Require review from Code Owners" (optional)

## 🎯 Summary
- ✅ Removed 100 unnecessary workflow files
- ✅ Committed and pushed cleanup
- ⚠️ 2,463 merged branches remain (requires manual cleanup via GitHub UI or CLI)
- 📚 Best practices documented for future merges

## Next Steps
1. Review open PRs and merge only when ready
2. Clean up merged branches via GitHub UI
3. Consider setting up auto-merge with proper requirements
4. Stop spamming bot mentions 😊
