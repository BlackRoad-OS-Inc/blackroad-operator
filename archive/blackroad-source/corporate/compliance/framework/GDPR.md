# GDPR Compliance Checklist

> BlackRoad OS GDPR Readiness Assessment

## Status: IN PROGRESS

## Article 5 — Principles of Processing

| Principle | Status | Notes |
|-----------|--------|-------|
| Lawfulness, Fairness, Transparency | ✅ | Privacy policy published |
| Purpose Limitation | ✅ | Data used only for stated AI purposes |
| Data Minimisation | ⚠️ | Audit memory storage periodically |
| Accuracy | ✅ | PS-SHA∞ ensures tamper-proof records |
| Storage Limitation | ⚠️ | Implement TTL for memory chain entries |
| Integrity & Confidentiality | ✅ | AES-256-CBC vault encryption |
| Accountability | ✅ | Audit log for all agent actions |

## Article 13/14 — Information to Data Subjects

- [x] Privacy Policy at https://blackroad.systems/privacy
- [x] Cookie Policy at https://blackroad.systems/cookies
- [x] Data Processing Notice on sign-up forms
- [ ] Multi-language support (EN done, others pending)

## Article 17 — Right to Erasure

```python
# Implementation in blackroad-api/src/memory.py
async def erase_user_data(user_id: str):
    """GDPR Article 17 — Right to Erasure"""
    # PS-SHA∞ erasure: marks as [ERASED:hash] not deleted
    keys = await memory.list(prefix=f"user:{user_id}:")
    for key in keys:
        current = await memory.read(key)
        erased_hash = hashlib.sha256(current.encode()).hexdigest()
        await memory.write(key, f"[ERASED:{erased_hash}]")
    return {"erased_count": len(keys)}
```

## Article 20 — Data Portability

```bash
# Export all user data
br cece export --user <user_id> --format json > user_data_export.json
```

## Article 25 — Privacy by Design

- [x] Tokenless gateway — no API keys in agent code
- [x] Memory TTL — automatic expiry for session data  
- [x] Encryption at rest — AES-256-CBC vault
- [x] Encryption in transit — TLS 1.3 required
- [x] Minimal data collection — only what agents need
- [ ] Differential privacy for analytics (planned)

## Data Processing Record (Article 30)

| Processing Activity | Purpose | Lawful Basis | Retention |
|---------------------|---------|--------------|-----------|
| Agent conversations | Service delivery | Contract | 90 days |
| Memory chain entries | AI context | Legitimate interest | 30 days |
| Audit logs | Security | Legal obligation | 1 year |
| User preferences | UX | Consent | Until deletion |
| System logs | Operations | Legitimate interest | 30 days |

## Sub-processors

| Sub-processor | Purpose | DPA Signed | Location |
|---------------|---------|------------|----------|
| Cloudflare | Edge network, Workers KV | ✅ | US/EU |
| Railway | Cloud hosting | ✅ | US |
| Anthropic | AI inference | ✅ | US |
| DigitalOcean | VM hosting | ✅ | US |

## GDPR DPO Contact

Data Protection Officer: blackroad@gmail.com  
Response SLA: 30 days (required by GDPR Article 12)

## Checklist Summary

- [x] Privacy Policy published
- [x] Cookie consent implemented
- [x] Right to access endpoint (/api/user/data)
- [x] Right to erasure endpoint (/api/user/erase)
- [x] Data portability endpoint (/api/user/export)
- [x] Breach notification procedure documented
- [ ] DPA agreements with all sub-processors
- [ ] Annual privacy audit scheduled
- [ ] Staff privacy training completed
