# Tutorial 09: Production Patterns

## Overview

Checklist and patterns for running BlackRoad OS in production.

## Security Checklist

```bash
# 1. Rotate all secrets on first deploy
br vault rotate --all

# 2. Verify no tokens in agent code
./blackroad-core/scripts/verify-tokenless-agents.sh

# 3. Enable CIS hardening on all nodes
br security harden --cis-level 1

# 4. Check for exposed secrets in git history
br security scan --history
```

## High Availability Setup

```yaml
# railway.toml — multi-replica with health checks
[deploy]
replicas = 3
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

## Observability Stack

```typescript
// Structured logging
import { logger } from "@blackroad/sdk/logger";

logger.info("Task completed", {
  task_id: "t-001",
  agent: "ALICE",
  duration_ms: 432,
  tokens_used: 1847,
});

// Metrics
import { metrics } from "@blackroad/sdk/metrics";
metrics.histogram("task.duration", 432, { agent: "ALICE", type: "deploy" });
metrics.increment("task.completed", { status: "success" });
```

## Graceful Shutdown

```typescript
process.on("SIGTERM", async () => {
  logger.info("Shutting down...");
  
  // 1. Stop accepting new requests
  server.close();
  
  // 2. Wait for in-flight tasks
  await taskQueue.drain({ timeout: 30_000 });
  
  // 3. Flush memory to disk
  await memory.flush();
  
  // 4. Deregister from agent mesh
  await agentMesh.deregister();
  
  process.exit(0);
});
```

## Zero-Downtime Deploys

```bash
# Railway rolling deploy
railway up --detach  # Start new version
# Railway waits for health check before switching traffic
# Old pods drain existing connections (default: 30s)
```

## Rate Limiting

```typescript
// Protect your gateway
const limiter = createRateLimiter({
  window: 60,        // seconds
  max: 100,          // requests per window per IP
  keyBy: (req) => req.ip,
  onLimit: (req, res) => {
    res.status(429).json({ error: "Slow down", retry_after: 60 });
  },
});
```

## Cost Controls

```typescript
// Budget guard — pause agents when tokens exceed limit
const guard = new BudgetGuard({
  dailyTokenLimit: 1_000_000,
  alertAt: 0.8,   // Alert at 80%
  pauseAt: 0.95,  // Pause at 95%
  onAlert: async (usage) => {
    await notify.slack(`Token budget at ${(usage * 100).toFixed(0)}%`);
  },
});
```

## Production Checklist

- [ ] Secrets in vault, not code
- [ ] Health endpoints returning 200
- [ ] Prometheus metrics exposed at /metrics
- [ ] Alert rules configured
- [ ] Runbook for common failure modes
- [ ] Automated backups verified
- [ ] Load test completed (k6 or hey)
- [ ] Dependency audit clean (npm audit / pip-audit)
- [ ] Disaster recovery tested

## Congrats!

You have completed the BlackRoad OS tutorial series. Explore:
- [API Reference](https://docs.blackroad.io/api)
- [Agents Guide](https://docs.blackroad.io/agents)
- [CLI Reference](https://docs.blackroad.io/cli)
- [GitHub: BlackRoad-OS-Inc](https://github.com/BlackRoad-OS-Inc)
