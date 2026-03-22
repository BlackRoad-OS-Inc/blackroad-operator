# Zero Trust Security Policy

> "Never trust, always verify" — CIPHER agent philosophy

## Principles

1. **Verify Explicitly** — Authenticate and authorize every request, every time
2. **Least Privilege** — Agents get minimum permissions needed for current task
3. **Assume Breach** — Design as if the perimeter is already compromised

## Network Segmentation

```
[Public Internet]
      │
      ▼
[Cloudflare WAF + DDoS]
      │
      ▼
[Gateway Worker — Token Boundary]
      │
      ▼
[Agent Mesh — mTLS between nodes]
      │
   ┌──┴──┐
[Ollama] [Qdrant] [SQLite]  ← localhost only
```

## Identity Verification

Every agent request must include:
- Short-lived JWT (15-minute expiry)
- Agent ID from registry
- Request signature (HMAC-SHA256)

## Gateway Policy Enforcement

```json
{
  "agents": {
    "octavia": {"allowed_models": ["qwen2.5:*","llama*"], "rate_limit": 1000},
    "lucidia": {"allowed_models": ["*"], "rate_limit": 500},
    "cipher":  {"allowed_models": ["*"], "rate_limit": 2000, "security_tools": true}
  },
  "forbidden_in_agent_env": ["OPENAI_API_KEY","ANTHROPIC_API_KEY","HF_TOKEN"]
}
```

## Incident Response Playbook

| Severity | Response Time | Actions |
|----------|--------------|---------|
| Critical | 15 min | Isolate node, rotate all secrets, notify |
| High | 1 hour | Revoke tokens, audit logs, patch |
| Medium | 4 hours | Monitor, document, schedule fix |
| Low | 48 hours | Track in audit log |

## CIPHER Agent Automated Checks

- Token expiry enforcement (every request)
- Anomaly detection (>3x normal request rate → alert)
- Secret scanning (every push via TruffleHog)
- Dependency CVE scan (daily via Trivy)
- mTLS certificate rotation (every 90 days)
