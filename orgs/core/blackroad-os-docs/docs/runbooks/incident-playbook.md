---
id: runbooks-incident-playbook
title: "Incident Response Playbook"
slug: /runbooks/incident-playbook
description: "Step-by-step incident response procedures"
tags: ["runbooks", "incidents", "operations"]
status: stable
---

# Incident Response Playbook

This playbook provides step-by-step procedures for responding to incidents in BlackRoad OS.

## Severity Levels

| **Level** | **Description** | **Response Time** | **Examples** |
|-----------|-----------------|-------------------|--------------|
| **SEV1** | Critical - System down | < 15 min | Complete outage, data loss |
| **SEV2** | High - Major degradation | < 1 hour | API errors >50%, slow response |
| **SEV3** | Medium - Partial impact | < 4 hours | Single service degraded |
| **SEV4** | Low - Minor issue | < 24 hours | UI glitch, non-critical bug |

## Incident Response Process

### 1. Detection and Alert

**When an incident is detected:**

1. ✅ Acknowledge the alert
2. ✅ Create incident tracking issue/ticket
3. ✅ Determine severity level
4. ✅ Notify relevant stakeholders

**Communication Channels:**
- GitHub Issues: For tracking
- Slack/Discord: For real-time coordination (if available)
- Status page: For user communication

### 2. Initial Assessment

**Gather information (5-10 minutes):**

1. What is broken?
2. Since when?
3. What changed recently?
4. What is the user impact?
5. What services are affected?

**Check:**
- [Prism Console](../ops/PRISM_CONSOLE.md) - System health
- Railway logs - Service logs
- GitHub Actions - Recent deployments

### 3. Containment

**For SEV1/SEV2 incidents:**

**Option A: Rollback (if recent deployment)**
```bash
# Via Railway dashboard or CLI
railway rollback --service=api
```

**Option B: Disable Failing Component**
```bash
# Scale down problematic service temporarily
railway scale --service=operator --replicas=0
```

**Option C: Enable Maintenance Mode**
- Return 503 status from API
- Display maintenance page on Web

### 4. Investigation

**Common investigation steps:**

**Check Logs:**
```bash
# Via Railway CLI
railway logs --service=api --tail=100

# Check for errors
railway logs --service=api | grep ERROR
```

**Check Database:**
```sql
-- Check database connection
SELECT 1;

-- Check recent errors
SELECT * FROM error_logs 
ORDER BY created_at DESC 
LIMIT 100;
```

**Check Job Queue:**
```bash
# Connect to Redis
redis-cli

# Check queue depth
LLEN bullmq:jobs:waiting
LLEN bullmq:jobs:active
LLEN bullmq:jobs:failed
```

**Check Service Health:**
```bash
# Test health endpoints
curl https://api.blackroad.dev/health
curl https://api.blackroad.dev/ready
```

### 5. Resolution

**Apply fix based on investigation:**

**Code Fix:**
1. Create hotfix branch
2. Make minimal fix
3. Test locally
4. Deploy to staging
5. Deploy to production
6. Verify fix

**Configuration Fix:**
```bash
# Update environment variable via Railway
railway variables set KEY=value --service=api

# Restart service
railway restart --service=api
```

**Database Fix:**
```sql
-- Apply migration or data fix
-- Always backup first!
```

**Infrastructure Fix:**
- Adjust scaling
- Modify resource limits
- Update networking config

### 6. Verification

**Confirm resolution:**

1. ✅ Service health checks passing
2. ✅ Error rates back to normal
3. ✅ User reports confirm fix
4. ✅ Metrics show recovery
5. ✅ No new errors in logs

**Monitor for 30+ minutes** to ensure stability.

### 7. Communication

**Update stakeholders:**

1. ✅ Post resolution update
2. ✅ Close incident ticket
3. ✅ Update status page
4. ✅ Thank responders

### 8. Post-Incident Review

**Within 48 hours, document:**

1. **Timeline:** When things happened
2. **Root Cause:** Why it happened
3. **Impact:** Who was affected
4. **Resolution:** How it was fixed
5. **Action Items:** How to prevent recurrence

**Template:**
```md
# Incident Post-Mortem: [YYYY-MM-DD] [Brief Title]

## Summary
Brief overview of what happened.

## Timeline (UTC)
- HH:MM - Incident began
- HH:MM - Alert triggered
- HH:MM - Investigation started
- HH:MM - Fix deployed
- HH:MM - Verified resolved

## Root Cause
Technical explanation of why it happened.

## Impact
- Users affected: X
- Duration: X minutes
- Services impacted: API, Operator

## Resolution
What we did to fix it.

## Action Items
- [ ] Add monitoring for X
- [ ] Improve Y process
- [ ] Document Z
```

## Common Incident Scenarios

### API Service Down

**Symptoms:**
- Health checks failing
- 500 errors
- Connection timeouts

**Quick Checks:**
1. Database connectivity
2. Environment variables
3. Recent deployments
4. Resource limits

**Common Fixes:**
- Restart service
- Rollback deployment
- Scale up resources
- Fix database connection

See [Service: API](../services/service-api.md) for details.

---

### Operator Jobs Stuck

**Symptoms:**
- Jobs not processing
- Queue growing
- Workers idle

**Quick Checks:**
1. Redis connectivity
2. Worker processes running
3. Job errors in logs
4. Queue depths

**Common Fixes:**
- Restart Operator service
- Clear failed jobs
- Scale up workers
- Fix job timeouts

See [Service: Operator](../services/service-operator.md) for details.

---

### Database Issues

**Symptoms:**
- Query timeouts
- Connection pool exhausted
- Slow responses

**Quick Checks:**
1. Active connections
2. Slow queries
3. Database size
4. Resource usage

**Common Fixes:**
- Restart service connections
- Kill long-running queries
- Increase connection pool
- Optimize slow queries

---

### High Error Rates

**Symptoms:**
- Errors >5% of requests
- Multiple error types
- Degraded performance

**Quick Checks:**
1. Error logs
2. Recent changes
3. External dependencies
4. Resource usage

**Common Fixes:**
- Identify error source
- Fix or rollback code
- Add error handling
- Scale resources

## Escalation

**When to escalate:**
- Incident not resolved in expected time
- Need additional expertise
- SEV1 lasting >1 hour
- Unclear root cause

**Escalation Path:**
1. Team lead / Senior engineer
2. Infrastructure team
3. External support (Railway, etc.)

## Tools and Resources

**Monitoring:**
- [Prism Console](../ops/PRISM_CONSOLE.md)
- Railway Dashboard
- Cloudflare Analytics

**Logs:**
- Railway Logs
- Application logs
- Database logs

**Runbooks:**
- [Deploy API](runbooks/deploy-api.md) _(planned)_
- [Debug Operator](runbooks/debug-operator.md) _(planned)_
- [Rollback Procedures](runbooks/rollback-procedures.md) _(planned)_

**Documentation:**
- [Service: API](../services/service-api.md)
- [Service: Operator](../services/service-operator.md)
- [Infra Guide](../ops/INFRA_GUIDE.md)

## See Also

- [Incidents and Incident Response](../ops/incidents-and-incident-response.md)
- [Operator Runtime](../ops/OPERATOR_RUNTIME.md)
- [Prism Console](../ops/PRISM_CONSOLE.md)
