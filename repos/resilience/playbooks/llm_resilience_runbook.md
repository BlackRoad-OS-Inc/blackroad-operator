# Lucidia LLM Resilience Controls

This runbook documents the canary, `/healthz` controller, and circuit
breaker now shipping with Prism.

## Canary probe

- CronJob: `lucidia-llm-canary` (namespace `prism`)
- Schedule: every minute
- Script: `resilience/canary/lucidia_llm_canary.py`
- Alerts: exits with code `2` on latency, token, or HTTP failures. Hook
  the Job failure metric into Alertmanager to page on consecutive misses.

## Healthwatch service

- Deployment: `llm-healthwatch`
- Metrics: `prism_llm_canary_requests_total`,
  `prism_llm_canary_latency_ms`
- `/healthz` returns `green|amber|red` + JSON metrics for dashboards.

## Circuit breaker gateway

- Deployment: `llm-gateway` (port `4010`)
- Reads `/healthz` every 15s and flips between `closed → open → half-open`
- Incident log: `/var/log/llm/incidents.jsonl` (PVC `llm-gateway-incidents`)
- Update Nginx or API clients to call the gateway instead of the raw
  Lucidia service for automatic failover.

## Helm deployment

```
helm upgrade --install llm-resilience ./helm/prism-llm-resilience \
  --namespace prism --create-namespace
```

Override `image.*` values with the published container tags from CI.
