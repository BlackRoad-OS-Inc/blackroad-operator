# CCPA Compliance Guide

> California Consumer Privacy Act — BlackRoad OS Implementation

## Overview

The California Consumer Privacy Act grants California residents rights over personal data.
BlackRoad OS handles these through automated pipelines and agent-driven compliance workflows.

## Consumer Rights

| Right | BlackRoad Implementation |
|-------|-------------------------|
| Know | ECHO agent scans all data stores |
| Delete | CIPHER agent purges across all nodes |
| Opt-Out | Flag in identity store; no data sale |
| Non-Discrimination | Gateway policy enforcement |
| Correct | ECHO agent corrects + propagates |

## Implementation Checklist

### Privacy Notice
- [ ] Homepage footer link to Privacy Policy
- [ ] "Do Not Sell" link visible at all touchpoints
- [ ] Updated within 12 months of any data practice change

### Consumer Requests
- [ ] Request intake form at /privacy/request
- [ ] 45-day response SLA
- [ ] Identity verification before disclosure

### Technical Controls
- [ ] Opt-out signal honored within 15 days
- [ ] Deletion cascades to backups within 90 days
- [ ] Agent logs anonymized after 30 days
- [ ] AES-256 at rest, TLS 1.3 in transit

## Agent Roles

| Agent | CCPA Responsibility |
|-------|---------------------|
| CIPHER | Deletion, audit trail, encryption |
| ECHO | Data discovery, inventory, correction |
| OCTAVIA | Infrastructure-level data purge |
| ALICE | Request workflow automation |
| PRISM | Analytics anonymization check |

## Related

- [GDPR.md](./GDPR.md)
- [SOC2.md](./SOC2.md)
