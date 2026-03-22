# Git Branch Hygiene Report - BlackRoad Infrastructure

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Analyzer:** Erebus (BlackRoad OS)
**Scope:** BlackRoad-OS GitHub Organization

## Executive Summary


### Key Metrics

| Metric | Value |
|--------|-------|
| Repositories Analyzed | 6 major repos |
| Total Branches | 334 |
| Stale Branches (>30 days) | 326 |
| Long-lived Branches (>90 days) | 1 |
| Protected Repositories | 0 |
| Unprotected Repositories | 6 |

### Default Branch Naming

| Branch Name | Count |
|-------------|-------|
| main | 5 |
| master | 1 |
| other | 0 |

**Status:** ✅ Majority using 'main'

---

## 1. Branch Protection Analysis

### Protected Repositories
❌ No repositories have branch protection

### Unprotected Repositories
⚠️ **6 repositories** lack branch protection:

- `blackroad-os-infra`
- `blackroad-os-core`
- `blackroad-os-brand`
- `blackroad-io`
- `blackroad-dashboard`
- `blackroad-api-worker`

**Recommendation:** Enable branch protection on all production repositories

---

## 2. Branch Naming Patterns

| Pattern | Count | Usage |
|---------|-------|-------|
| feature/* | 0 | Feature development |
| fix/*, bugfix/* | 0 | Bug fixes |
| release/* | 0 | Release preparation |
| hotfix/* | 0 | Emergency fixes |
| develop | 0 | Development branch |
| staging | 0 | Staging environment |

**Analysis:**
- ℹ️ Minimal branch naming conventions in use
- ℹ️ No dedicated hotfix branches observed

---

## 3. Stale Branch Analysis

### Summary
- **Total stale branches:** 326 (older than 30 days)
- **Long-lived branches:** 1 (older than 90 days)

### Long-lived Branches Requiring Review

These branches are older than 90 days and should be reviewed for merge or deletion:

- `blackroad-os-infra/blackroad os/fix-blackroad os-review-issues-for-terraform-pr-#2 (20498d old)`

**Recommendation:**
- Review all branches older than 30 days
- Merge completed work
- Delete abandoned branches
- Document long-lived feature branches

---

## 4. Git Flow Assessment

### Current State
ℹ️ **GitHub Flow (simplified)** - Direct feature branch workflow

**Workflow:**
```
main ← feature/*, fix/*
```

### Recommended Workflow for BlackRoad

Given the multi-environment infrastructure (development → staging → production), we recommend:

```
main (production)
  ↑
staging (pre-production testing)
  ↑
develop (integration)
  ↑
feature/*, fix/*, enhancement/*
```

**Branch Lifecycle:**
1. Create feature branch from `develop`
2. Develop and test locally
3. PR to `develop` (automated tests)
4. Merge to `staging` (integration testing)
5. Deploy to production via `main`
6. Use `hotfix/*` branches for emergency production fixes

---

## 5. Cleanup Recommendations

### Immediate Actions (High Priority)

1. **Enable Branch Protection** on all production repositories:
   ```bash
   # For each unprotected repo:
   gh api -X PUT "/repos/BlackRoad-OS/{repo}/branches/main/protection" \
     -f required_status_checks='{"strict":true,"contexts":["ci/test"]}' \
     -f enforce_admins=true \
     -f required_pull_request_reviews='{"required_approving_review_count":1}' \
     -f restrictions=null
   ```

2. **Standardize Default Branch Naming** to `main`:
   ```bash
   # For repos still using 'master':
   gh api -X PATCH "/repos/BlackRoad-OS/{repo}" -f default_branch=main
   ```

3. **Review and Merge/Delete Stale Branches**:
   - Schedule weekly branch hygiene review
   - Automate stale branch detection (GitHub Actions)
   - Set branch deletion policy (auto-delete after merge)

### Medium Priority

4. **Implement Git Flow** across key repositories:
   - Create `develop` branch for integration
   - Create `staging` branch for pre-production
   - Document workflow in CONTRIBUTING.md

5. **Add Branch Naming Conventions** to templates:
   ```
   feature/ISSUE-123-description
   fix/ISSUE-456-bug-description
   hotfix/critical-production-issue
   release/v1.2.3
   ```

6. **Automate Branch Protection**:
   - Create reusable GitHub Action
   - Apply protection rules org-wide
   - Require status checks before merge

### Low Priority

7. **Set up CODEOWNERS** files for automatic review assignment

8. **Configure branch cleanup automation**:
   - Auto-delete merged branches
   - Notify on stale branches (>30 days)
   - Archive long-lived branches (>90 days)

---

## 6. Orphan Branch Detection

**Note:** Full orphan branch detection requires cloning repositories and analyzing commit graphs.

**Recommended Script:**
```bash
# Run for each major repository
for repo in blackroad-os-infra blackroad-os-core; do
  git clone https://github.com/BlackRoad-OS/$repo
  cd $repo

  # Find branches with no common ancestor to main
  git branch -r | while read branch; do
    if ! git merge-base main $branch &>/dev/null; then
      echo "Orphan: $branch"
    fi
  done

  cd ..
  rm -rf $repo
done
```

---

## 7. Implementation Roadmap

### Week 1: Critical Security
- [ ] Enable branch protection on all 10 major repositories
- [ ] Audit and document current branching strategy
- [ ] Set up required status checks

### Week 2: Standardization
- [ ] Migrate all default branches to `main`
- [ ] Create branch naming convention guide
- [ ] Update repository templates

### Week 3: Automation
- [ ] Deploy stale branch detection workflow
- [ ] Set up automated branch cleanup
- [ ] Configure CODEOWNERS

### Week 4: Documentation
- [ ] Update CONTRIBUTING.md in all repos
- [ ] Create Git Flow diagram
- [ ] Training documentation for team

---

## 8. Monitoring & Maintenance

### Automated Checks (GitHub Actions)

**Stale Branch Detector** (`.github/workflows/stale-branches.yml`):
```yaml
name: Stale Branch Detector
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:

jobs:
  detect-stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v8
        with:
          days-before-stale: 30
          days-before-close: 7
          stale-branch-message: 'This branch has been inactive for 30 days. Consider merging or closing.'
```

### Weekly Review Checklist
- [ ] Review stale branches report
- [ ] Check for unmerged long-lived branches
- [ ] Verify branch protection rules are active
- [ ] Update documentation if workflow changes

---

## Appendix A: Quick Commands

```bash
# List all branches in a repo
gh api /repos/BlackRoad-OS/{repo}/branches --jq '.[].name'

# Check branch protection
gh api /repos/BlackRoad-OS/{repo}/branches/main/protection

# Enable branch protection
gh api -X PUT /repos/BlackRoad-OS/{repo}/branches/main/protection \
  -f required_pull_request_reviews='{"required_approving_review_count":1}'

# Delete remote branch
gh api -X DELETE /repos/BlackRoad-OS/{repo}/git/refs/heads/{branch}

# Get branch last commit date
gh api /repos/BlackRoad-OS/{repo}/commits/{branch} --jq '.commit.committer.date'
```

---

## Appendix B: Branch Protection Best Practices

### Recommended Settings for `main` branch:

- ✅ Require pull request reviews (1+ approvers)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution before merging
- ✅ Include administrators in restrictions
- ✅ Restrict who can push to matching branches
- ⚠️ Allow force pushes: **NO**
- ⚠️ Allow deletions: **NO**

### For `develop` branch:
- ✅ Require pull request reviews (1+ approver)
- ✅ Require status checks to pass
- ⚠️ Allow force pushes: **NO**

### For feature branches:
- ℹ️ No protection needed (ephemeral)

---

**Report Generated by:** Erebus (BlackRoad OS)
**Next Review:** 7 days from generation date
**Automation Status:** Manual (recommend GitHub Actions integration)

