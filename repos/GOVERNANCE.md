# BlackRoad OS Governance

## Authority

All code, data, and infrastructure are the exclusive property of **BlackRoad OS, Inc.**, a Delaware C-Corporation. CEO and sole stockholder: **Alexa Louise Amundson**.

## Policy Framework

Machine-readable policies at `governance/policies/`:

| Policy | Rules | Covers |
|--------|-------|--------|
| [coding.json](governance/policies/coding.json) | 10 | Code standards, brand, security |
| [collaboration.json](governance/policies/collaboration.json) | 8 | Memory system, TILs, codex |
| [safety.json](governance/policies/safety.json) | 10 | Destructive actions, uncertainty |
| [issues.json](governance/policies/issues.json) | 5 | Issue templates, labels |
| [pr-review.json](governance/policies/pr-review.json) | 6 | PR standards, approval |
| [docs.json](governance/policies/docs.json) | 6 | README, LICENSE, SECURITY |

## Inheritance

```
Global Policies (this repo)
    ↓
Organization Rules (per-org ORG_RULES.md)
    ↓
Repository Contract (per-repo REPO_CONTRACT.yml)
    ↓
Agent Certification (per-agent CERTIFICATION.yml)
```

Each level inherits ALL rules from above. A repo can add stricter rules but never relax global ones.

## Review Authority

- All PRs require approval from @blackboxprogramming
- CODEOWNERS enforced on all repos
- Branch protection on main
- No self-merging
