# BlackRoad OS Compliance Framework

## Overview

BlackRoad OS operates under the following regulatory frameworks across all deployments.
This document covers requirements, implementation controls, and audit procedures.

---

## GDPR (EU General Data Protection Regulation)

### Applicability
Any processing of personal data for EU residents, regardless of where BlackRoad OS operates.

### Implemented Controls

| Requirement | Control | Status |
|-------------|---------|--------|
| Lawful basis | Consent + Legitimate Interest documented per data class | ✅ |
| Privacy by design | PS-SHA∞ uses pseudonymous agent IDs, not PII | ✅ |
| Data minimization | Memory chain only stores AI inference outputs, not raw user data | ✅ |
| Right to erasure | `br memory purge --agent <id>` marks entries `truth_state=-1` (quarantine) | ✅ |
| Data portability | `br cece export` exports full identity JSON | ✅ |
| Data breach notification | CIPHER agent triggers alert within 72h window | ✅ |
| DPA agreements | Required for all Cloudflare, Railway, DigitalOcean integrations | ⚠️ Review |
| DPO appointment | Not required — <250 employees, non-systematic processing | N/A |

### Data Retention Policy

```
Memory chain entries:     7 years (financial/audit entries)
                          1 year  (operational observations)
                          90 days (debugging/testing entries)

Audit logs:               7 years (append-only, cannot be shortened)
Session data:             24 hours (working memory, auto-purge)
Agent communication logs: 30 days
```

### GDPR Article 17 — Right to Erasure

Erasure in a hash-chain system uses **cryptographic quarantine** (not deletion):

1. Entry is updated with `truth_state: -1` and `erased: true` flag
2. `content` field is replaced with `[ERASED:SHA256(original)]` — hash only
3. Chain hash integrity is preserved
4. Erased entries are excluded from all queries and exports
5. Audit log records the erasure event (required for compliance)

---

## CCPA (California Consumer Privacy Act)

### Applicability
Consumers whose personal information is collected in California.

### Rights Implemented

| Right | Implementation |
|-------|---------------|
| Right to Know | `GET /api/v1/memory?agent=<id>` — full data inventory |
| Right to Delete | `DELETE /api/v1/memory?agent=<id>` — cryptographic quarantine |
| Right to Opt-Out | `BLACKROAD_TELEMETRY=false` disables all analytics |
| Right to Non-Discrimination | Service levels do not depend on privacy choices |

### Sale of Personal Information
BlackRoad OS does **not** sell personal information to third parties.
AI provider calls (Anthropic, OpenAI, Ollama) transmit only the minimum context required.

---

## SOC 2 Type II Readiness

### Trust Service Criteria

#### Security (CC6-CC9)
- [x] CC6.1 — Logical access controls via gateway token authentication
- [x] CC6.2 — MFA enforced for all GitHub organization members
- [x] CC6.3 — Principle of least privilege — agents receive only required gateway scopes
- [x] CC7.1 — Anomaly detection via CIPHER agent audit scanning
- [x] CC8.1 — Change management via GitHub branch protection + required reviews
- [x] CC9.1 — Risk assessment documented in `SECURITY.md`

#### Availability (A1)
- [x] A1.1 — Uptime monitoring via Uptime Kuma on Pi fleet
- [x] A1.2 — Disaster recovery documented in `BACKUP.md`
- [x] A1.3 — Capacity planning via `br metrics dashboard`

#### Confidentiality (C1)
- [x] C1.1 — AES-256-CBC vault encryption (`~/.blackroad/vault/`)
- [x] C1.2 — Secrets never embedded in agent code (tokenless gateway)
- [x] C1.3 — TLS enforced on all external endpoints (Cloudflare proxy)

#### Processing Integrity (PI1)
- [x] PI1.1 — PS-SHA∞ hash chain ensures memory integrity
- [x] PI1.2 — Chain verification endpoint `/memory/verify`
- [x] PI1.3 — Trinary truth states flag uncertain/disproven data

---

## HIPAA (Healthcare) — Not Applicable

BlackRoad OS does not process Protected Health Information (PHI).
If deployed in a healthcare context, a BAA must be executed with all providers.

---

## Security Certifications Roadmap

| Certification | Target | Owner |
|---------------|--------|-------|
| SOC 2 Type I | Q3 2026 | CIPHER |
| SOC 2 Type II | Q4 2026 | CIPHER |
| ISO 27001 | Q1 2027 | OCTAVIA |
| GDPR DPA audit | Q2 2026 | PRISM |

---

## Compliance Checker Tool

```bash
# Run automated compliance scan
br security compliance-check

# Or directly
python3 governance/audit_tools/compliance_checker.py --framework gdpr
python3 governance/audit_tools/compliance_checker.py --framework soc2
python3 governance/audit_tools/compliance_checker.py --all
```

Output includes:
- Pass/Fail/Warning per control
- Evidence location (file path or API endpoint)
- Remediation guidance for failures

---

*Last reviewed: 2026 — Owner: BlackRoad OS, Inc. Legal & Compliance*
