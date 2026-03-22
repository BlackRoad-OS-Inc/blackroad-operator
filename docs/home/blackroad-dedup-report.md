# BlackRoad Monorepo Deduplication Report
# Generated 2026-03-09

## The Duplication Problem

The codebase exists in multiple overlapping copies:

1. **~/blackroad/** — the monorepo (149K code files, 78 subdirs)
2. **~/blackroad-operator/** — standalone clone (31K code files)
3. **~/blackroad/orgs/** — every org cloned as subdirectories
4. **~20 standalone repos** cloned separately that also exist inside the monorepo

## Key Findings

### 1. Broken Submodules
The monorepo has `.gitmodules` declarations but the submodule directories contain **full independent .git/ repos** — they were cloned manually inside the monorepo rather than initialized as proper submodules. Each directory is a complete duplicate with its own git object store.

### 2. Confirmed Duplicates (same GitHub remote, two locations)

| Repo | Standalone | Monorepo Copy | Which is Newer |
|------|-----------|---------------|----------------|
| blackroad-operator | ~/blackroad-operator/ | ~/blackroad/blackroad-operator/ | **Standalone** (commander ^14 vs ^13, ora ^9 vs ^8, has wrangler + Gitea remote) |
| blackroad-agents | ~/blackroad-agents/ | ~/blackroad/blackroad-agents/ | Standalone |
| blackroad-infra | ~/blackroad-infra/ | ~/blackroad/blackroad-infra/ | Standalone |
| blackroad-docs | ~/blackroad-docs/ | ~/blackroad/blackroad-docs/ | Standalone |
| blackroad-web | ~/blackroad-web/ | ~/blackroad/blackroad-web/ | **Standalone** (full Next.js project; monorepo copy missing package.json) |
| blackroad-core | ~/blackroad-core/ | ~/blackroad/blackroad-core/ | Standalone |
| blackroad-sdk | ~/blackroad-sdk/ | ~/blackroad/blackroad-sdk/ | Standalone |
| blackroad-gateway | ~/blackroad-gateway/ | ~/blackroad/blackroad-gateway/ | Standalone |

### 3. Org Mirrors Inside Monorepo
`~/blackroad/orgs/` contains full clones organized as:
- `orgs/blackroad-os/` — 1,234 subdirs (every BlackRoad-OS repo)
- `orgs/core/` — core repos (blackroad-hardware, etc.)
- `orgs/ai/` — AI repos
- `orgs/enterprise/` — enterprise forks
- `orgs/personal/` — personal repos

### 4. SECURITY: Credential Exposure
**7+ git configs contain plaintext Gitea password (`BlackRoad2026OS`) in remote URLs** pointing to the old IP .97 (now .100). These are in `.git/config` files inside the monorepo submodule directories.

**Action needed:** Rotate the Gitea password and update all remotes.

## Deduplication Plan

### Step 1: Establish Source of Truth
The **standalone clones** (~/blackroad-web, ~/blackroad-infra, etc.) are the canonical copies — they have more recent commits and complete project files.

### Step 2: Clean Monorepo Stale Copies
Remove the stale submodule directories from ~/blackroad/ that duplicate standalone repos:
```
~/blackroad/blackroad-operator/  (stale copy of ~/blackroad-operator/)
~/blackroad/blackroad-agents/    (stale copy of ~/blackroad-agents/)
~/blackroad/blackroad-infra/     (stale copy of ~/blackroad-infra/)
~/blackroad/blackroad-docs/      (stale copy of ~/blackroad-docs/)
~/blackroad/blackroad-web/       (stale copy of ~/blackroad-web/)
~/blackroad/blackroad-core/      (stale copy of ~/blackroad-core/)
~/blackroad/blackroad-sdk/       (stale copy of ~/blackroad-sdk/)
~/blackroad/blackroad-gateway/   (stale copy of ~/blackroad-gateway/)
```

### Step 3: Symlink Back (optional)
If the monorepo structure needs to reference these, replace deleted dirs with symlinks:
```bash
ln -s ~/blackroad-web ~/blackroad/blackroad-web
ln -s ~/blackroad-infra ~/blackroad/blackroad-infra
# etc.
```

### Step 4: Create REPO-MAP.md
A single file at ~/blackroad/REPO-MAP.md that maps every component to its canonical location, preventing re-fragmentation.

### Step 5: Rotate Credentials
1. Change Gitea password on Octavia
2. Update all git remotes fleet-wide
3. Grep for the old password and purge

## DO NOT Execute Without Confirmation
This report is analysis only. No deletions have been performed.
