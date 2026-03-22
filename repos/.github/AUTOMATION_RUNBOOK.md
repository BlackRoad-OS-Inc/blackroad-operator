# Automation System Runbook

## Quick Reference Guide for Manual Interventions

This runbook provides step-by-step instructions for handling situations where automation fails or requires manual intervention.

---

## Table of Contents

1. [Emergency Contacts](#emergency-contacts)
2. [Common Failure Scenarios](#common-failure-scenarios)
3. [Manual Intervention Procedures](#manual-intervention-procedures)
4. [Troubleshooting Workflows](#troubleshooting-workflows)
5. [Workflow Management](#workflow-management)
6. [Maintenance Tasks](#maintenance-tasks)

---

## Emergency Contacts

**DevOps Team:** @blackboxprogramming
**Automation Owner:** See CODEOWNERS
**Slack Channel:** #devops-alerts (if configured)

---

## Common Failure Scenarios

### Scenario 1: All CI Checks Failing

**Symptoms:**
- Every PR fails CI
- Main branch CI is red
- Multiple test failures across different test suites

**Auto-Recovery:**
- ✅ Auto-rerun (up to 3 attempts)
- ✅ Cache recovery workflow triggers
- ✅ Auto-heal attempts formatting fixes

**Manual Intervention Required When:**
- Auto-recovery fails after 3 attempts
- System-wide dependency issue
- Breaking change in main branch

**Resolution Steps:**

1. **Check the Automation Dashboard:**
   ```bash
   # Navigate to Issues tab and find "Automation Health Dashboard" issue
   # Review metrics and identify pattern
   ```

2. **Identify Root Cause:**
   ```bash
   # Clone repo and check out main
   git checkout main
   git pull

   # Run tests locally
   npm test
   pytest -q

   # Check for recent breaking commits
   git log --oneline -10
   ```

3. **Common Fixes:**

   **If dependency issue:**
   ```bash
   # Clear all caches
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install

   # For Python
   pip cache purge
   pip install -r requirements.txt --force-reinstall
   ```

   **If recent breaking change:**
   ```bash
   # Identify breaking commit
   git log --oneline -20
   git bisect start
   git bisect bad HEAD
   git bisect good <last-known-good-commit>
   # Test at each step until culprit found

   # Revert if necessary
   git revert <breaking-commit-sha>
   git push origin main
   ```

   **If environment issue:**
   ```bash
   # Check .env files match .env.example
   diff .env .env.example

   # Verify Node/Python versions
   cat .nvmrc        # Should be 20
   cat .python-version  # Should be 3.11.12
   ```

---

### Scenario 2: Flaky Tests Not Auto-Quarantining

**Symptoms:**
- Same test fails intermittently
- Flaky Test Quarantine workflow not triggering
- Test blocks PR even though it's known to be flaky

**Manual Quarantine:**

1. **Add test to quarantine manually:**
   ```bash
   # Navigate to GitHub Actions
   # Go to "Flaky Test Quarantine System" workflow
   # Click "Run workflow"
   # Select "add" action
   # Enter test path: e.g., "tests/api/users.test.js"
   # Click "Run workflow"
   ```

2. **Verify quarantine:**
   ```bash
   # Check quarantine database
   cat .github/quarantine/flaky-tests.json
   ```

3. **Remove from quarantine when fixed:**
   ```bash
   # Navigate to GitHub Actions
   # Go to "Flaky Test Quarantine System" workflow
   # Click "Run workflow"
   # Select "remove" action
   # Enter same test path
   # Click "Run workflow"
   ```

---

### Scenario 3: Auto-Merge Not Working

**Symptoms:**
- PR has all checks passing
- PR has approvals
- PR has "automerge" label
- PR is not auto-merging

**Diagnosis:**

1. **Check Auto-Merge Eligibility:**
   ```bash
   # Navigate to PR
   # Look for "Auto-Merge Eligibility Check" comment from bot
   # Review which criteria are failing
   ```

2. **Common Issues:**

   **Has merge conflicts:**
   ```bash
   # Pull latest main
   git checkout main
   git pull

   # Checkout PR branch
   git checkout <pr-branch>

   # Rebase on main
   git rebase main

   # Resolve conflicts
   # After resolving:
   git add .
   git rebase --continue
   git push --force-with-lease
   ```

   **Missing "automerge" label:**
   ```bash
   # Add label via GitHub UI or:
   gh pr edit <pr-number> --add-label automerge
   ```

   **Has "do-not-merge" label:**
   ```bash
   # Remove label:
   gh pr edit <pr-number> --remove-label do-not-merge
   ```

   **PR is draft:**
   ```bash
   # Mark as ready for review:
   gh pr ready <pr-number>
   ```

3. **Manual Merge (Last Resort):**
   ```bash
   # If auto-merge continues failing:
   gh pr merge <pr-number> --squash --auto
   ```

---

### Scenario 4: Renovate Not Creating PRs

**Symptoms:**
- No dependency update PRs in 7+ days
- Known outdated packages
- Renovate bot not commenting

**Diagnosis:**

1. **Check Renovate Dashboard:**
   ```bash
   # Navigate to Issues tab
   # Look for "Dependency Updates Dashboard" issue
   # Review pending updates and errors
   ```

2. **Common Fixes:**

   **Renovate config error:**
   ```bash
   # Validate renovate.json locally
   npx renovate-config-validator
   ```

   **Rate limit hit:**
   ```bash
   # Check Renovate logs in GitHub Actions
   # If rate limited, wait 1 hour and it will auto-resume
   ```

   **Dependency conflicts:**
   ```bash
   # Review Renovate dashboard for conflict messages
   # Manually update conflicting dependencies:
   npm install <package>@latest
   git add package.json package-lock.json
   git commit -m "chore: manually update <package>"
   git push
   ```

3. **Manual Dependency Update:**
   ```bash
   # Check outdated packages
   npm outdated

   # Update all patch and minor versions
   npm update

   # Update major versions manually
   npm install <package>@latest

   # For Python
   pip list --outdated
   pip install -U <package>
   ```

---

### Scenario 5: Build Cache Constantly Corrupting

**Symptoms:**
- Build Cache Recovery workflow runs frequently
- Builds fail with cache errors
- Intermittent "module not found" errors

**Permanent Fix:**

1. **Force invalidate all caches:**
   ```bash
   # Navigate to "Build Cache Recovery" workflow
   # Click "Run workflow"
   # Check "force_invalidate" option
   # Click "Run workflow"
   ```

2. **Disable cache temporarily:**
   ```yaml
   # Edit .github/workflows/ci.yml
   # Comment out cache sections:
   # - uses: actions/cache@v4
   #   with:
   #     path: /tmp/.buildx-cache
   #     key: ...
   ```

3. **Investigate root cause:**
   ```bash
   # Check for:
   # - Lockfile inconsistencies
   git diff package-lock.json

   # - Multiple package managers
   ls -la | grep -E "(package-lock|yarn.lock|pnpm-lock)"
   # Should only have one

   # - Cache key collisions
   # Review cache keys in workflow files
   grep -r "cache:" .github/workflows/
   ```

4. **Clear local caches too:**
   ```bash
   # Docker
   docker system prune -af

   # NPM
   npm cache clean --force

   # Pip
   pip cache purge

   # GitHub CLI
   gh cache delete --all
   ```

---

## Manual Intervention Procedures

### Procedure 1: Emergency Main Branch Fix

**When:** Main branch is broken and blocking all development

**Steps:**

1. **Create hotfix branch:**
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/fix-main-$(date +%Y%m%d)
   ```

2. **Identify and fix issue:**
   ```bash
   # Run tests to reproduce
   npm test

   # Fix the issue
   # ...

   # Verify fix
   npm test
   npm run build
   ```

3. **Push directly to main (skip CI):**
   ```bash
   git add .
   git commit -m "fix: emergency fix for main branch [skip ci]"
   git push origin hotfix/fix-main-$(date +%Y%m%d)

   # Create PR with emergency label
   gh pr create --title "🚨 Emergency Fix" \
                --body "Emergency fix for broken main branch" \
                --label "emergency" \
                --label "skip-review"

   # Get approval and merge immediately
   gh pr merge --squash --admin
   ```

4. **Verify fix:**
   ```bash
   # Check CI on main
   gh run list --branch main --limit 1
   ```

---

### Procedure 2: Disable Misbehaving Automation

**When:** An automation workflow is causing issues

**Steps:**

1. **Disable workflow via GitHub UI:**
   - Navigate to Actions tab
   - Click on misbehaving workflow
   - Click "..." menu → "Disable workflow"

2. **Or disable via workflow file:**
   ```yaml
   # Edit .github/workflows/<workflow>.yml
   # Add at top:
   on:
     workflow_dispatch:  # Manual only
   ```

3. **Create issue to track:**
   ```bash
   gh issue create --title "🔧 Workflow Disabled: <workflow-name>" \
                   --body "Disabled due to: <reason>\nNeeds investigation" \
                   --label "automation" --label "needs-fix"
   ```

4. **Re-enable after fix:**
   ```bash
   # Remove manual-only restriction
   # Or use GitHub UI to re-enable
   ```

---

### Procedure 3: Mass PR Auto-Merge

**When:** Multiple PRs need to be merged quickly (e.g., Renovate batch)

**Steps:**

1. **Bulk add automerge label:**
   ```bash
   # Get all open Renovate PRs
   gh pr list --author "renovate[bot]" --json number --jq '.[].number' | \
   while read pr; do
     gh pr edit $pr --add-label automerge
   done
   ```

2. **Trigger auto-merge workflow:**
   ```bash
   # For each PR
   gh pr list --label automerge --json number --jq '.[].number' | \
   while read pr; do
     gh workflow run auto-merge-pr.yml -f pr_number=$pr
   done
   ```

3. **Monitor progress:**
   ```bash
   # Watch PR status
   watch -n 30 'gh pr list --label automerge'
   ```

---

## Troubleshooting Workflows

### Debug Workflow Run

```bash
# Get recent workflow runs
gh run list --limit 10

# Get specific run details
gh run view <run-id>

# Download logs
gh run download <run-id>

# Rerun failed jobs
gh run rerun <run-id> --failed
```

### Check Workflow Permissions

```bash
# View workflow file
cat .github/workflows/<workflow>.yml | grep -A 10 "permissions:"

# Common permission issues:
# - contents: write  # Needed to push commits
# - pull-requests: write  # Needed to comment on PRs
# - actions: write  # Needed to trigger workflows
# - issues: write  # Needed to create issues
```

### Test Workflow Locally

```bash
# Install act (https://github.com/nektos/act)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act -l  # List workflows
act -j <job-name>  # Run specific job
act -j <job-name> --secret-file .secrets  # With secrets
```

---

## Workflow Management

### List All Active Workflows

```bash
gh workflow list
```

### Manually Trigger Workflow

```bash
# Simple workflow
gh workflow run <workflow-name>

# With inputs
gh workflow run test-retry-smart.yml \
  -f workflow_run_id=12345

# With specific branch
gh workflow run ci.yml --ref feature-branch
```

### View Workflow Status

```bash
# Recent runs
gh run list --workflow=<workflow-name>

# Watch run in progress
gh run watch <run-id>

# Cancel run
gh run cancel <run-id>
```

### Bulk Cancel Workflow Runs

```bash
# Cancel all runs for a workflow
gh run list --workflow=<workflow-name> --json databaseId --jq '.[].databaseId' | \
while read id; do
  gh run cancel $id
done
```

---

## Maintenance Tasks

### Daily Checks

1. **Review Automation Dashboard:**
   - Check overall health score
   - Review any degradation alerts
   - Verify auto-merge rate

2. **Check Quarantined Tests:**
   - Review flaky test count
   - Investigate tests with 10+ failures
   - Remove tests with 10+ consecutive passes

3. **Monitor Renovate:**
   - Review dependency update PRs
   - Merge patch/minor updates
   - Schedule review for major updates

### Weekly Tasks

1. **Review Failed Automations:**
   ```bash
   # Get automation failures from last week
   gh run list --workflow=auto-heal.yml --status=failure --limit 50
   gh run list --workflow=auto-rerun-failed.yml --status=failure --limit 50
   ```

2. **Clear Stale Caches:**
   ```bash
   # Delete caches older than 7 days
   gh cache delete --all
   ```

3. **Update Quarantine Database:**
   ```bash
   # Trigger quarantine review
   gh workflow run flaky-quarantine.yml -f action=validate
   ```

### Monthly Tasks

1. **Audit Auto-Fix Success Rates:**
   - Review dashboard metrics
   - Identify automation improvements
   - Update thresholds if needed

2. **Review and Update Automation Policies:**
   - Adjust auto-merge criteria
   - Update flaky test thresholds
   - Review cache invalidation triggers

3. **Optimize CI Costs:**
   ```bash
   # Review workflow run times
   gh run list --json databaseId,workflowName,startedAt,updatedAt | \
   jq -r '.[] | [.workflowName, (.updatedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)] | @csv'
   ```

---

## Escalation Path

### Level 1: Auto-Recovery (No human intervention)
- Linting/formatting fixes
- Cache invalidation
- Test retries (up to 3x)
- Snapshot updates

### Level 2: Automated Alert + Self-Service Fix
- Flaky test quarantine
- Dependency conflict PR
- Build cache corruption

### Level 3: Team Notification
- Main branch broken
- Auto-merge stuck for 24+ hours
- Security vulnerability

### Level 4: Emergency Response
- Production deployment failure
- Data loss risk
- Security breach

---

## Common Commands Quick Reference

```bash
# === PR Management ===
gh pr list                          # List PRs
gh pr view <number>                 # View PR
gh pr checks <number>               # Check PR status
gh pr merge <number> --squash       # Merge PR

# === Workflow Management ===
gh workflow list                    # List workflows
gh workflow run <name>              # Run workflow
gh run list --limit 10              # Recent runs
gh run view <id>                    # View run details
gh run rerun <id>                   # Rerun workflow

# === Cache Management ===
gh cache list                       # List caches
gh cache delete <cache-id>          # Delete specific cache
gh cache delete --all               # Delete all caches

# === Issue Management ===
gh issue list --label automated     # List automated issues
gh issue view <number>              # View issue
gh issue close <number>             # Close issue

# === Repository ===
git checkout main && git pull       # Update main
git clean -fdx                      # Clean workspace
npm ci && npm test                  # Fresh install + test
```

---

## FAQ

**Q: Why isn't my PR auto-merging?**
A: Check the "Auto-Merge Eligibility Check" comment on your PR. Common issues: merge conflicts, missing approval, failing checks, missing "automerge" label.

**Q: How do I disable auto-merge for a specific PR?**
A: Add the "do-not-merge" label to the PR.

**Q: Can I force merge a PR without approvals?**
A: Yes, but only for emergencies. Use `gh pr merge <number> --admin --squash`.

**Q: How do I add a test to the flaky quarantine?**
A: Run the "Flaky Test Quarantine System" workflow with action="add" and the test path.

**Q: Why do I have so many Renovate PRs?**
A: Renovate creates separate PRs for each dependency. You can batch them by adding the "automerge" label to merge automatically.

**Q: How do I invalidate all caches?**
A: Run the "Build Cache Recovery" workflow with "force_invalidate" checked.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Maintained By:** DevOps Team
