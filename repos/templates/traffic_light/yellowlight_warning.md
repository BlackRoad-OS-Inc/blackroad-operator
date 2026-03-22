# 🟡 YellowLight — Warning State Template

**Status:** WARNING — Attention needed

---

## 🧾 Header
- **HASH ID:** (Issue/PR/Task reference)
- **Warning detected:** (Timestamp)
- **Owner:** @__
- **Severity:** 🟡 Warning
- **Status Meter:** 🟡🟡⚪️⚪️⚪️

---

## ⚠️ Warning Summary

### What's the Warning?
(Clear description of the warning condition)

### Warning Type
- [ ] Performance degradation
- [ ] Resource approaching limits
- [ ] Non-critical error rate increase
- [ ] Configuration drift
- [ ] Security advisory (non-critical)
- [ ] Dependency vulnerability (low/medium)
- [ ] Technical debt threshold reached

### Impact Level
- **Current impact:** Minimal / Moderate
- **Potential impact:** Could escalate to critical
- **Users affected:** (if any)

---

## 🔍 Details

### Metrics
- **Current value:** __
- **Threshold:** __
- **Normal range:** __
- **Trend:** ↗️ Increasing / ↘️ Decreasing / ➡️ Stable

### Timeline
- **First detected:** (Timestamp)
- **Duration:** (How long has this been present?)
- **Pattern:** Intermittent / Continuous / Trending

### Related Systems
- (List affected systems/services)

---

## 📊 Monitoring

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| CPU usage | __%  | 80% | 🟡 |
| Memory | __%  | 85% | 🟡 |
| Disk space | __%  | 90% | 🟡 |
| Error rate | __/min | 10/min | 🟡 |
| Response time | __ms | 500ms | 🟡 |

---

## 🛠 Actions

### Immediate (< 1 hour)
- [ ] Confirm warning is valid
- [ ] Check recent changes
- [ ] Review related metrics
- [ ] Notify team if needed

### Short-term (< 1 day)
- [ ] Investigate root cause
- [ ] Plan remediation
- [ ] Schedule fix

### Long-term (< 1 week)
- [ ] Implement permanent solution
- [ ] Add better monitoring
- [ ] Update thresholds if needed
- [ ] Document lessons learned

---

## 🧭 Investigation

### Hypothesis
(What do you think is causing this?)

### Evidence
- Observation 1:
- Observation 2:
- Observation 3:

### Root Cause (if known)
(Description)

---

## ⚠️ Escalation Thresholds

**Escalate to 🔴 RedLight if:**
- [ ] Warning persists for > X hours
- [ ] Metric exceeds critical threshold
- [ ] User impact detected
- [ ] Error rate doubles
- [ ] Related warnings appear

**Auto-escalation criteria:**
- CPU > 90%
- Memory > 95%
- Error rate > 50/min
- Response time > 2000ms

---

## ✅ Resolution Criteria

**Move to 🟢 GreenLight when:**
- [ ] Metrics return to normal range
- [ ] Root cause addressed
- [ ] Monitoring shows stable for 2+ hours
- [ ] Documentation updated

**Acceptable to close when:**
- [ ] False positive confirmed
- [ ] Expected behavior (document why)
- [ ] Risk accepted (with sign-off)

---

## 🔄 Status Updates

### Update 1 (Timestamp)
- **Status:**
- **Investigation progress:**
- **Next steps:**

### Update 2 (Timestamp)
- **Status:**
- **Actions taken:**
- **Results:**

---

## 📊 Impact Analysis

### Current Impact
- **Performance:** __% degradation
- **Availability:** __% uptime
- **Users:** __ affected

### Potential Impact (if escalates)
- **Worst case:**
- **Likelihood:**
- **Mitigation:**

---

## 🧠 Context

### Recent Changes
- [ ] Code deployment
- [ ] Config change
- [ ] Infrastructure change
- [ ] Traffic pattern change
- [ ] External dependency change

### Related Incidents
- (Links to related issues/incidents)

---

## 📋 Follow-up

### Prevention
- [ ] Add alerting for early detection
- [ ] Improve capacity planning
- [ ] Update monitoring dashboards
- [ ] Document runbook procedure

### Review
- [ ] Schedule review with team
- [ ] Update thresholds if needed
- [ ] Improve documentation

---

**Automation Hook:** Monitoring threshold triggers this template
