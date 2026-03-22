# 🔴 RedLight — Failed Deployment Template

**Status:** DEPLOYMENT FAILURE — Rollback may be required

---

## 🧾 Header
- **Release ID:** (v X.Y.Z or train name)
- **Deploy started:** (Timestamp)
- **Deploy failed:** (Timestamp)
- **Owner:** @__ | On-call: @__
- **Status Meter:** 🔴🔴🔴🔴⚪️
- **Incident Channel:** #__

---

## 🚨 Failure Summary

### What Failed?
(Clear description of what went wrong)

### Impact Assessment
- [ ] Production down
- [ ] Partial outage
- [ ] Feature unavailable
- [ ] Data integrity issue
- [ ] Performance degraded
- [ ] Security vulnerability exposed

### User Impact
- **Affected users:** (count/percentage)
- **Affected regions:** (list)
- **Services impacted:** (list)

---

## 🔍 Failure Details

### Stage Failed
- [ ] Pre-flight checks
- [ ] Build/compilation
- [ ] Database migration
- [ ] Service deployment
- [ ] Health checks
- [ ] Smoke tests
- [ ] Post-deploy validation

### Error Messages
```
(Paste relevant error logs/traces)
```

### Pipeline/CI Status
- **Job ID:** (link)
- **Exit code:** 
- **Failed step:**

---

## 🛠 Immediate Response

### Rollback Decision
- [ ] **Rollback required** — execute immediately
- [ ] **Hotfix possible** — attempt fix first
- [ ] **Monitor only** — degraded but stable

### Rollback Steps
1. [ ] Trigger rollback script/pipeline
2. [ ] Verify rollback completion
3. [ ] Confirm services restored
4. [ ] Validate critical paths
5. [ ] Update status page

### Rollback Command
```bash
# (Insert rollback command or link to runbook)
```

---

## 🔄 Live Status Updates

### Update 1 — (Timestamp)
- **Status:**
- **Action taken:**
- **Current state:**

### Update 2 — (Timestamp)
- **Status:**
- **Action taken:**
- **Current state:**

---

## 🧩 Diagnostics Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Infrastructure healthy | ☐ / 🔴 | |
| Database accessible | ☐ / 🔴 | |
| External deps available | ☐ / 🔴 | |
| Config valid | ☐ / 🔴 | |
| Secrets accessible | ☐ / 🔴 | |
| Resource limits OK | ☐ / 🔴 | |
| Network connectivity | ☐ / 🔴 | |

---

## 🧭 Recovery Plan

### Phase 1: Stabilize (< 30 min)
- [ ] Rollback deployed
- [ ] Services responding
- [ ] Monitoring active

### Phase 2: Investigate (< 2 hours)
- [ ] Root cause identified
- [ ] Fix approach determined
- [ ] Timeline estimated

### Phase 3: Re-deploy (< 1 day)
- [ ] Fix implemented
- [ ] Tests passing
- [ ] Staged deployment validated
- [ ] Production re-deploy successful

---

## ✅ Resolution Criteria

**Move to 🟡 YellowLight when:**
- [ ] Service restored (rollback or hotfix)
- [ ] User impact mitigated
- [ ] Root cause identified

**Move to 🟢 GreenLight when:**
- [ ] Full fix deployed
- [ ] All tests passing
- [ ] Monitoring stable for 2+ hours
- [ ] Post-mortem scheduled

---

## 📊 Incident Metrics

- **Time to detect:** (duration)
- **Time to rollback:** (duration)
- **Total downtime:** (duration)
- **Users affected:** (count)
- **Revenue impact:** (if applicable)

---

## 🧠 Post-Incident

### Root Cause Analysis
- **Primary cause:**
- **Contributing factors:**
- **Detection method:**

### Preventive Measures
1. [ ] Add pre-deploy validation for X
2. [ ] Improve monitoring for Y
3. [ ] Update runbook with Z
4. [ ] Add automated rollback trigger

### Follow-up Tasks
- [ ] Schedule post-mortem (within 48 hrs)
- [ ] Update deployment checklist
- [ ] File bug reports
- [ ] Communicate to stakeholders

---

**Automation Hook:** Deploy failure triggers this template + pages on-call
