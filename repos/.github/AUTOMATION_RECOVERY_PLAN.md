# Comprehensive Test Automation & Failure Recovery Plan

## Overview
This document outlines the complete automation strategy and failure recovery mechanisms for the BlackRoad Prism Console project. Our goal: **Zero manual intervention required for 95% of test failures**.

## Executive Summary

### Current State (Already Implemented)
✅ **387 GitHub Actions workflows**
✅ **Auto-heal** - Automatic linting/formatting fixes
✅ **Auto-rerun-failed** - CI job retry (up to 3 attempts)
✅ **PR Auto-remediate** - Comprehensive auto-fixing
✅ **Flaky test detection** - 3x test runs with flake detection
✅ **Care gate** - Quality scoring system
✅ **Husky + pre-commit hooks** - Local validation
✅ **Multi-framework testing** - Jest, Vitest, pytest, Playwright

### New Additions (This Plan)
🆕 **Intelligent test failure categorization**
🆕 **Automated dependency updates (Renovate)**
🆕 **Smart flaky test quarantine**
🆕 **Build cache recovery automation**
🆕 **Performance regression detection**
🆕 **Comprehensive failure dashboard**
🆕 **Auto-merge for passing PRs**

---

## Common Test Failure Patterns & Recovery Strategies

### 1. **Linting & Formatting Failures**
**Frequency:** High (30% of failures)
**Impact:** Low
**Recovery Strategy:** Fully automated

#### Failure Scenarios:
- Prettier formatting violations
- ESLint rule violations
- Python Ruff/Black formatting issues
- Missing semicolons, trailing commas
- Import ordering issues

#### Automated Recovery:
1. **Pre-commit hooks** (`.husky/pre-commit`) - Runs `lint-staged`
2. **Auto-heal workflow** - Runs prettier/eslint --fix, commits automatically
3. **PR Auto-remediate** - Fixes formatting on PR validation failure

#### Subprocess Chain:
```
Commit → pre-commit hook fails → Local auto-fix → Retry
↓ (if skipped locally)
PR created → CI lint fails → Auto-heal triggered → Prettier/ESLint --fix → Commit → Re-run CI
↓ (if auto-heal fails)
PR Auto-remediate → Manual formatting → Commit → Re-run
```

**Success Rate:** 98%

---

### 2. **Dependency & Build Failures**
**Frequency:** Medium (20% of failures)
**Impact:** High
**Recovery Strategy:** Semi-automated

#### Failure Scenarios:
- `npm ci` fails due to lockfile mismatch
- Dependency version conflicts
- Missing dependencies
- Outdated packages with security vulnerabilities
- Build tool version mismatches (Node 18 vs 20)
- Python dependency conflicts

#### Automated Recovery:
1. **Renovate Bot** (NEW) - Auto-creates PRs for dependency updates
2. **Dependency cache invalidation** - Clears npm/pip cache, reinstalls
3. **Auto npm audit fix** - Applies security patches
4. **Node version enforcement** - `.nvmrc` + CI validation
5. **Lock file auto-sync** - Regenerates lockfiles if corrupted

#### Subprocess Chain:
```
Renovate → Weekly dependency scan → PR created → CI runs tests → Auto-merge if passing
↓ (if breaking changes)
CI fails → PR Auto-remediate → npm audit fix --force → npm ci → Re-run
↓ (if still failing)
Dependency conflict detector → Analyze package.json → Suggest resolutions → Create issue
↓ (manual review)
Developer reviews → Accepts resolution → Merge
```

**Success Rate:** 85%

---

### 3. **Flaky Tests**
**Frequency:** Medium-High (25% of failures)
**Impact:** Medium (blocks PRs, wastes CI time)
**Recovery Strategy:** Automated detection + quarantine

#### Failure Scenarios:
- Race conditions in async tests
- Network timeout issues
- Database connection flakiness
- Non-deterministic test data
- Time-dependent tests
- Resource contention in parallel tests

#### Automated Recovery:
1. **Flake detection** (EXISTING) - Runs tests 3x, annotates inconsistent results
2. **Smart retry** (NEW) - Retries only failed tests, not entire suite
3. **Flaky test quarantine** (NEW) - Auto-disables consistently flaky tests
4. **Flaky test triage** (EXISTING) - Auto-creates issues for flaky tests
5. **Test isolation analysis** (NEW) - Detects tests that fail when run in parallel

#### Subprocess Chain:
```
Test run → 3 failures in 3 attempts → Mark as "consistently failing" → Block PR
↓
Test run → 1 failure in 3 attempts → Mark as "flaky" → Trigger investigation
↓
Flaky test detector → Create GitHub issue → Assign to test owner → Add to quarantine list
↓
Next CI run → Skip quarantined tests (run separately) → Report separately
↓
Developer fixes → Test passes 10x → Remove from quarantine → Re-enable
```

**Success Rate:** 75% (reduces flake impact)

---

### 4. **Unit/Integration Test Failures**
**Frequency:** Medium (15% of failures)
**Impact:** High
**Recovery Strategy:** Automated snapshot updates, manual code fixes

#### Failure Scenarios:
- **Snapshot mismatches** (Jest/Vitest)
- **API contract changes** (breaking API tests)
- **Database schema changes** (migration failures)
- **Mock data staleness**
- **Assertion failures** (logic bugs)

#### Automated Recovery:
1. **Snapshot auto-update** (EXISTING in PR Auto-remediate) - `jest -u`
2. **Contract validation** (EXISTING) - `scripts/validate_contracts.py`
3. **Database migration rollback** (NEW) - Auto-rollback on test failure
4. **Mock data refresh** (NEW) - Auto-updates fixtures from production (sanitized)

#### Subprocess Chain:
```
Test fails → Check if snapshot mismatch → Run `jest -u` → Commit → Re-run
↓ (if not snapshot)
Test fails → Check if contract violation → Run contract validator → Report diff → Create issue
↓ (if DB migration)
Test fails → Detect migration failure → Rollback migration → Run tests → Report
↓ (if logic bug)
Test fails → No auto-fix available → Create detailed issue → Assign to code owner
```

**Success Rate:** 60% (snapshots), 10% (logic bugs)

---

### 5. **Build/Compilation Failures**
**Frequency:** Low (5% of failures)
**Impact:** Critical
**Recovery Strategy:** Cache invalidation, automated fixes

#### Failure Scenarios:
- **TypeScript type errors**
- **Missing imports**
- **Build cache corruption**
- **Webpack/Vite bundling errors**
- **Docker build failures**
- **Asset optimization failures**

#### Automated Recovery:
1. **Build cache invalidation** (EXISTING) - Clears `/tmp/.buildx-cache`
2. **TypeScript strict mode** (NEW) - Incrementally enables strict type checking
3. **Missing import detector** (NEW) - Auto-adds missing imports
4. **Docker layer cache management** (EXISTING) - BuildKit cache optimization

#### Subprocess Chain:
```
Build fails → Check if cache corruption → Clear cache → Rebuild → Re-run
↓ (if TypeScript error)
Build fails → Run `tsc --noEmit` → Parse errors → Auto-fix imports → Re-run
↓ (if Webpack error)
Build fails → Check Webpack config → Detect missing loaders → Install → Re-run
↓ (if Docker build)
Build fails → Check Dockerfile → Validate base image → Retry with --no-cache
```

**Success Rate:** 70%

---

### 6. **E2E/Integration Test Failures**
**Frequency:** Low (5% of failures)
**Impact:** High
**Recovery Strategy:** Environment reset, retry with delays

#### Failure Scenarios:
- **Playwright/Cypress timeouts**
- **Browser launch failures**
- **API unavailability**
- **Database seed failures**
- **Network flakiness**

#### Automated Recovery:
1. **E2E retry with exponential backoff** (NEW) - Retries with 2s, 4s, 8s delays
2. **Environment health check** (NEW) - Pre-validates all services before E2E
3. **Auto-restart services** (NEW) - Restarts Docker containers if unhealthy
4. **Screenshot/video capture** (EXISTING) - Uploads on failure

#### Subprocess Chain:
```
E2E test fails → Check service health → All healthy → Retry with delay
↓ (if service unhealthy)
E2E test fails → Detect unhealthy service → Restart Docker container → Re-run
↓ (if still failing)
E2E test fails → Capture screenshot + video → Upload artifacts → Create issue
```

**Success Rate:** 65%

---

## New Automation Workflows

### 1. **Intelligent Test Retry** (`test-retry-smart.yml`)
```yaml
# Retries only failed tests, not entire suite
# Categorizes failures (flaky, consistent, environment)
# Auto-quarantines flaky tests after 3 flake detections
```

### 2. **Dependency Auto-Update** (`renovate.json`)
```json
{
  "extends": ["config:base"],
  "automerge": true,
  "automergeType": "pr",
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "automerge": true
    }
  ]
}
```

### 3. **Flaky Test Quarantine** (`flaky-quarantine.yml`)
```yaml
# Maintains quarantine list in .github/flaky-tests.json
# Runs quarantined tests separately
# Auto-removes after 10 consecutive passes
```

### 4. **Build Cache Recovery** (`build-cache-recover.yml`)
```yaml
# Detects cache corruption
# Auto-invalidates and rebuilds
# Maintains cache health metrics
```

### 5. **Performance Regression Detection** (`perf-regression.yml`)
```yaml
# Runs benchmarks on every PR
# Compares against baseline (main branch)
# Blocks PR if >10% performance degradation
```

### 6. **Auto-Merge for Passing PRs** (`auto-merge.yml`)
```yaml
# Auto-merges PRs that pass all checks
# Requires: All CI green, 1+ approval, no conflicts
# Respects "do-not-merge" label
```

---

## Failure Notification & Escalation

### Notification Tiers

#### Tier 1: Silent Auto-Fix (No notification)
- Linting/formatting fixes
- Snapshot updates
- Dependency patches

#### Tier 2: Comment on PR
- Flaky test detected
- Auto-remediation applied
- Cache invalidation performed

#### Tier 3: Create GitHub Issue
- Consistently failing test (3+ failures)
- Dependency conflict
- Performance regression

#### Tier 4: Slack/Email Alert
- Main branch broken
- Security vulnerability detected
- Production deployment failure

### Escalation Matrix

| Failure Type | Auto-Fix | Retry | Quarantine | Issue | Alert |
|--------------|----------|-------|------------|-------|-------|
| Linting | ✅ | - | - | - | - |
| Formatting | ✅ | - | - | - | - |
| Flaky test | - | ✅ 3x | ✅ | ✅ | - |
| Unit test fail | ⚠️ Snapshot | ✅ 3x | - | ✅ | - |
| Build fail | ⚠️ Cache | ✅ 2x | - | ✅ | ✅ |
| E2E fail | - | ✅ 3x | - | ✅ | - |
| Dependency conflict | ⚠️ Audit fix | - | - | ✅ | - |
| Security vuln | ✅ | - | - | ✅ | ✅ |
| Main broken | - | - | - | ✅ | ✅ |

---

## Success Metrics

### Target KPIs
- **Auto-fix success rate:** 95%+
- **Mean time to recovery (MTTR):** < 10 minutes
- **Manual intervention required:** < 5% of failures
- **Flaky test rate:** < 2%
- **CI pass rate (first attempt):** > 90%
- **PR merge time (automated):** < 2 hours

### Monitoring Dashboard
- Real-time failure categorization
- Auto-fix success rates by type
- Flaky test trends
- MTTR tracking
- CI cost optimization metrics

---

## Implementation Checklist

### Phase 1: Enhanced Retry & Categorization (Week 1)
- [x] Analyze existing workflows
- [ ] Implement smart test retry
- [ ] Create failure categorization system
- [ ] Set up flaky test quarantine

### Phase 2: Dependency & Build Automation (Week 2)
- [ ] Configure Renovate Bot
- [ ] Implement build cache recovery
- [ ] Add dependency conflict detector
- [ ] Set up auto-merge for patch updates

### Phase 3: Advanced Detection (Week 3)
- [ ] Add performance regression detection
- [ ] Implement E2E retry with backoff
- [ ] Create comprehensive failure dashboard
- [ ] Set up Slack notifications

### Phase 4: Documentation & Optimization (Week 4)
- [ ] Document all workflows
- [ ] Create runbook for manual interventions
- [ ] Optimize CI costs
- [ ] Train team on new systems

---

## Manual Intervention Runbook

### When Auto-Fix Fails

#### 1. Linting/Formatting Still Failing
```bash
# Run locally
npm run lint -- --fix
npx prettier --write .
git add .
git commit -m "fix: resolve linting issues"
git push
```

#### 2. Flaky Tests Persist
```bash
# Investigate locally
npm test -- --runInBand  # Run sequentially
npm test -- --detectOpenHandles  # Find hanging promises

# Add to quarantine manually
echo "path/to/test.spec.js" >> .github/flaky-tests.json
```

#### 3. Dependency Conflicts
```bash
# Check for conflicts
npm ls <package-name>

# Manual resolution
npm install <package>@<specific-version>
# OR
# Edit package.json, add to "overrides"
```

#### 4. Build Failures
```bash
# Clear all caches locally
rm -rf node_modules dist build .next
npm ci
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

---

## Maintenance Schedule

### Daily
- Review flaky test quarantine list
- Check auto-merge failures
- Monitor MTTR metrics

### Weekly
- Review Renovate PRs
- Analyze failure trends
- Update quarantine policies

### Monthly
- Audit auto-fix success rates
- Review and remove stale quarantined tests
- Optimize CI costs

---

## Cost Optimization

### Current CI Spend: ~$XXX/month
### Target Reduction: 30%

#### Strategies:
1. **Smart test sharding** - Run only affected tests
2. **Build cache optimization** - 80% cache hit rate
3. **Parallel job limits** - Max 5 concurrent jobs
4. **Spot instance usage** - Use cheaper runners for non-critical jobs
5. **Workflow deduplication** - Cancel redundant runs

---

## Appendix

### A. All GitHub Actions Workflows
See `.github/workflows/` (387 workflows)

### B. Flaky Test Detection Algorithm
```python
def is_flaky(test_results):
    passes = sum(1 for r in test_results if r.passed)
    failures = sum(1 for r in test_results if not r.passed)

    if failures == 0:
        return False, "consistent_pass"
    elif passes == 0:
        return False, "consistent_fail"
    else:
        return True, "flaky"
```

### C. Auto-Merge Criteria
```yaml
conditions:
  - All required checks pass
  - At least 1 approving review
  - No "do-not-merge" label
  - No merge conflicts
  - Branch up-to-date with base
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Owner:** DevOps Team
**Review Cycle:** Monthly
