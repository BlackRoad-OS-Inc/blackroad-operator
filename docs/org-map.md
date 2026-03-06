# Organization Topology

> The "Turtles Model" -- nested organizations with clear ownership boundaries.

## Structure

```
BlackRoad OS, Inc. (Legal Entity)
  |
  +-- BlackRoad-OS-Inc (GitHub Enterprise - Source of Truth)
  |     |-- blackroad-operator    <-- YOU ARE HERE
  |     |-- blackroad-core
  |     |-- blackroad-agents
  |     |-- blackroad-web
  |     |-- blackroad-infra
  |     |-- blackroad-docs
  |     +-- demo-repository
  |
  +-- BlackRoad-OS (Coordination Org - 1,332+ repos)
  |     |-- Core platform repos (blackroad-os-*)
  |     |-- Pi projects (pi-*)
  |     |-- Lucidia AI (lucidia-*)
  |     +-- 64 curated forks
  |
  +-- Fan-Out Organizations
        |-- BlackRoad-AI          (52 repos)  - AI/ML models & inference
        |-- BlackRoad-Cloud       (30 repos)  - Cloud infrastructure
        |-- BlackRoad-Security    (30 repos)  - Security tools
        |-- BlackRoad-Foundation  (30 repos)  - CRM & project management
        |-- BlackRoad-Hardware    (30 repos)  - IoT & Raspberry Pi
        |-- BlackRoad-Media       (29 repos)  - Social & content
        |-- BlackRoad-Interactive (29 repos)  - Gaming & graphics
        |-- BlackRoad-Education   (24 repos)  - Learning & LMS
        |-- BlackRoad-Gov         (23 repos)  - Governance & compliance
        |-- Blackbox-Enterprises  (21 repos)  - Enterprise automation
        |-- BlackRoad-Archive     (21 repos)  - Archival & IPFS
        |-- BlackRoad-Labs        (20 repos)  - Research & experiments
        |-- BlackRoad-Studio      (19 repos)  - Creative tools
        |-- BlackRoad-Ventures    (17 repos)  - Business & finance
        +-- blackboxprogramming   (68 repos)  - Primary development
```

## Principles

1. **BlackRoad-OS-Inc** is the nucleus -- corporate core, proprietary repos only
2. **BlackRoad-OS** is the coordination hub -- platform repos and curated forks
3. **Fan-out orgs** are specialized divisions with domain-specific repos
4. **All 17 orgs** are proprietary property of BlackRoad OS, Inc.

## Totals

| Metric | Count |
|--------|-------|
| Organizations | 17 |
| Total Repositories | 1,825+ |
| Public Repos | ~1,800+ |
| Private Repos | ~104+ |
| Curated Forks | ~235 |

---

(c) BlackRoad OS, Inc. All rights reserved.
