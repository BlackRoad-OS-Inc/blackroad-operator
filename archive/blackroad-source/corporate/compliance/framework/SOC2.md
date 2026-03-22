# SOC 2 Type II Compliance Guide

> BlackRoad OS Security, Availability, and Confidentiality Controls

## Trust Service Criteria

### CC1 — Control Environment

**CC1.1 — COSO Principle 1: Commitment to Integrity**
- All agents operate under tokenless architecture — zero API key embedding
- Audit trails for all agent actions via PS-SHA∞ hash-chain journals
- Security policies enforced at gateway level (not individual agents)

**CC1.2 — Board Oversight**
- Architecture Decision Records (ADRs) maintained in governance repo
- RFC process for all protocol changes (RFC-0001 through RFC-NNNN)

### CC6 — Logical and Physical Access

**CC6.1 — Access Controls**
```yaml
controls:
  - gateway_auth: Bearer token required for all API calls
  - agent_isolation: Agents cannot access provider keys directly
  - vault_encryption: AES-256-CBC for all secrets at rest
  - ssh_keys: 600 permissions required, password auth disabled
```

**CC6.6 — Threat and Vulnerability Management**
- Automated scanning: Trivy + Grype + TruffleHog in CI/CD
- Dependency alerts: GitHub Dependabot enabled across all repos
- Secret scanning: GitHub Advanced Security enabled

### CC7 — System Operations

**CC7.1 — Change Management**
- All deployments via GitHub Actions with required reviews
- Rollback capability on all Railway and Cloudflare deployments
- Canary deployments for agent model updates

**CC7.2 — Monitoring and Anomaly Detection**
```
Monitoring Stack:
├── Status API: /health endpoint on all services
├── Alerting: Cloudflare Workers + webhooks
├── Memory: PS-SHA∞ tamper-evident logs
└── Uptime: Uptime Kuma dashboard
```

### A1 — Availability

**A1.1 — Availability Commitments**
| Service | Target SLA |
|---------|-----------|
| Gateway | 99.9% |
| Agent Mesh | 99.5% |
| World Engine (Pi) | 95.0% (best-effort edge) |

**A1.2 — Redundancy Architecture**
```
[Primary: aria64 — 192.168.4.38]  ← main agent cluster
[Failover: Cloudflare Workers]     ← gateway always available
[Backup: DigitalOcean Droplet]    ← cold standby
```

## Audit Readiness

### Evidence Collection
```bash
# Generate compliance evidence
br security audit --format soc2

# Check tokenless compliance
./scripts/verify-tokenless.sh

# Export memory audit trail
br cece export --format audit-log
```

### Third-Party Auditor Access
- Read-only GitHub audit access via Fine-Grained PAT
- Log exports available in JSONL format (PS-SHA∞ signed)
- Incident response runbook: `BlackRoad-Gov/incidents/runbook.md`

## Annual Review Checklist
- [ ] Rotate all API keys and update vault
- [ ] Review agent permissions in `policies/agent-permissions.json`
- [ ] Run full Trivy + Grype scan across all container images
- [ ] Audit GitHub Actions secrets and remove stale tokens
- [ ] Review and update RFC backlog
- [ ] Test disaster recovery runbook

---
*Last updated: 2026 | Maintained by: BlackRoad-Security*
