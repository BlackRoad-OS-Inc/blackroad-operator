# 🤖 Automated PR Workflow System

## Overview

This repository implements a comprehensive, fully-automated PR workflow system that handles the entire lifecycle from PR creation to merge, with built-in cryptographic verification, dual attestation, automatic remediation, and conflict resolution.

## 🎯 Features

### 1. **PR Master Orchestrator** (`pr-orchestrator.yml`)

The central workflow that coordinates all PR automation:

- ✅ **Automatic Setup**: Initializes every new PR with proper labels and tracking
- 🔍 **Conflict Detection**: Identifies merge conflicts immediately
- 🔄 **Auto-Sync**: Triggers branch synchronization when needed
- ✅ **Comprehensive Validation**: Runs linting, tests, and builds
- 🤖 **Auto-Remediation**: Triggers fixes when validation fails
- 📊 **Status Reporting**: Posts detailed comments with results
- 🏷️ **Smart Labeling**: Adds `automerge` label when all checks pass

**Triggers**: Automatically runs when PRs are opened, synchronized, or reopened

### 2. **Cryptographic Verification** (`commit-verification.yml`)

Ensures all commits are cryptographically secure:

- 🔐 **SHA-256 Hashing**: Generates SHA-256 hash of every commit
- 🔒 **SHA-512 Hashing**: Additional SHA-512 hash for enhanced security
- 🛡️ **Integrity Verification**: Validates commit object integrity
- ⚖️ **Dual Attestation**: Two independent verification tokens
- 📋 **Consensus Verification**: Ensures both attestation tokens agree
- 💾 **Attestation Storage**: Saves verification results for audit trail

**How it works**:
1. Primary attestation agent verifies all commits
2. Secondary attestation agent independently re-verifies
3. Both attestations are reconciled for consensus
4. Final attestation is stored with cryptographic proof

### 3. **Commit Signature Enforcement** (`enforce-commit-signing.yml`)

Blocks unsigned commits from being merged:

- 🔏 **Signature Verification**: Checks GPG/SSH signatures on all commits
- ❌ **Blocks Unsigned**: Fails if any commit is unsigned
- 📚 **Helpful Instructions**: Provides setup guide for developers
- 🏷️ **Auto-Labeling**: Tags PRs with `unsigned-commits` label
- ✅ **Status Checks**: Creates commit status for branch protection

**Setup for developers**:

```bash
# GPG signing
gpg --full-generate-key
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# OR SSH signing (easier!)
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

### 4. **Auto-Remediation** (`pr-auto-remediate.yml`)

Automatically fixes common issues:

- 🎨 **Code Formatting**: Runs Prettier and formatters
- 🔧 **Lint Fixes**: Applies ESLint auto-fixes
- 📦 **Dependency Updates**: Fixes package-lock issues
- 🧪 **Test Updates**: Updates test snapshots
- 🔄 **Re-validation**: Runs checks again after fixes
- 📤 **Auto-Push**: Commits and pushes fixes automatically

**Triggered by**: PR orchestrator when validation fails, or manually

### 5. **Branch Sync** (`pr-branch-sync.yml`)

Keeps all PR branches up-to-date:

- 🔄 **Daily Sync**: Runs automatically every day at 2 AM UTC
- 📋 **Batch Processing**: Handles up to 50 PRs at once
- 🤖 **Auto-Merge**: Attempts automatic merge with base branch
- ⚡ **Conflict Resolution**: Uses auto-resolution strategies
- 📊 **Smart Labeling**: Adds `conflicts` label when manual fix needed
- 👥 **Re-review Requests**: Notifies reviewers after sync

**Sync strategies**:
- Clean merge when possible
- Auto-resolution using "theirs" strategy for conflicts
- Manual intervention request for complex conflicts

### 6. **Auto-Merge** (`auto-merge.yml`)

Automatically merges approved PRs:

- 🏷️ **Label-Triggered**: Activates when `automerge` label added
- ✅ **Check Verification**: Only merges if all checks pass
- 🔀 **Squash Merge**: Uses squash merge method
- 📝 **Draft Protection**: Skips draft PRs automatically

## 🛠️ Tools & Scripts

### PR Consolidation Script

Handles mass PR cleanup and consolidation:

```bash
npx tsx scripts/consolidate-prs.ts
```

**What it does**:
- 📊 Analyzes all open PRs (up to 1000)
- ✅ Auto-approves PRs ready to merge
- 🔄 Triggers sync for conflicting PRs
- 🗄️ Archives stale PRs (>90 days)
- 🤖 Auto-processes bot PRs
- 📋 Provides detailed categorization

**Categories**:
- **Ready to merge**: Adds `automerge` label
- **Has conflicts**: Triggers branch sync
- **Stale**: Archives changes and closes
- **Bot PRs**: Auto-approves if checks pass
- **Needs review**: Flags for manual attention

### Branch Protection Setup

Configures comprehensive branch protection:

```bash
npx tsx scripts/setup-branch-protection.ts
```

**Protection rules applied**:
- ✅ Required status checks (cryptographic verification, commit signing)
- 👥 Required PR reviews (minimum 1 approval)
- 🔏 Signed commits enforced
- ❌ Force pushes disabled
- ❌ Branch deletion disabled
- 💬 Required conversation resolution

### Commit Attestation Tool

Manual verification tool for commits:

```bash
# Verify commit integrity
.github/tools/verify-commit-attestation.sh <commit> verify

# Generate attestation tokens
.github/tools/verify-commit-attestation.sh <commit> attest

# Both verify and attest
.github/tools/verify-commit-attestation.sh <commit> both
```

**Output**:
- SHA-256 and SHA-512 hashes
- Dual attestation tokens (primary + secondary)
- Consensus verification
- Attestation storage in `.git/attestations/`

## 🔐 Security Features

### Dual Attestation System

Every commit gets two independent verification tokens:

1. **Primary Attestation**:
   - Generated by primary verification workflow
   - Creates SHA-256/SHA-512 hashes
   - Stores attestation artifact

2. **Secondary Attestation**:
   - Independent re-verification
   - Cross-checks primary results
   - Generates second attestation token

3. **Consensus Reconciliation**:
   - Compares both attestations
   - Blocks if mismatch detected
   - Creates final attestation on consensus

### Cryptographic Chain of Trust

```
Commit → SHA-256 Hash → Primary Attestation
           ↓
       SHA-512 Hash → Secondary Attestation
           ↓
      Consensus Check → Final Attestation
           ↓
      Stored Artifact (365 days retention)
```

## 📊 Workflow Interactions

```
PR Opened/Updated
    ↓
[PR Master Orchestrator]
    ↓
    ├─→ [Commit Verification] ──→ Dual Attestation
    ├─→ [Signature Enforcement] ──→ Block if unsigned
    ├─→ [Conflict Check] ──→ [Branch Sync] if needed
    ├─→ [Validation] ──→ [Auto-Remediation] if failed
    └─→ [Status Update] ──→ Add automerge label if passed
              ↓
         [Auto-Merge] ──→ Merge when ready
```

## 🚀 Getting Started

### For New Contributors

1. **Setup commit signing**:
   ```bash
   # Use SSH signing (easiest)
   git config --global gpg.format ssh
   git config --global user.signingkey ~/.ssh/id_ed25519.pub
   git config --global commit.gpgsign true
   ```

2. **Create a PR**:
   - PR Orchestrator automatically activates
   - All checks run automatically
   - Auto-remediation fixes common issues
   - Automerge label added when ready

3. **If checks fail**:
   - Auto-remediation attempts fixes
   - Check PR comments for instructions
   - Push additional fixes if needed

### For Repository Admins

1. **Initial Setup**:
   ```bash
   # Setup branch protection
   npx tsx scripts/setup-branch-protection.ts

   # Consolidate existing PRs
   npx tsx scripts/consolidate-prs.ts
   ```

2. **Configure Secrets** (in GitHub Settings):
   - `BOT_TOKEN`: Personal access token for bot operations
   - `BOT_USER`: Bot username (optional, defaults to `blackroad-bot`)
   - `GITHUB_PAT`: GitHub PAT with repo permissions

3. **Enable Workflows**:
   - All workflows are enabled by default
   - Check `.github/workflows/` for full list

## 📋 Workflow Reference

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `pr-orchestrator.yml` | PR open/sync | Master coordinator |
| `commit-verification.yml` | PR/Push | Cryptographic verification |
| `enforce-commit-signing.yml` | PR/Push | Block unsigned commits |
| `pr-auto-remediate.yml` | On failure | Auto-fix issues |
| `pr-branch-sync.yml` | Daily/manual | Keep branches updated |
| `auto-merge.yml` | Label added | Auto-merge approved PRs |

## 🏷️ Label System

| Label | Meaning | Auto-Applied |
|-------|---------|--------------|
| `automerge` | PR ready to auto-merge | ✅ Yes |
| `automated-pr-flow` | Tracked by orchestrator | ✅ Yes |
| `conflicts-detected` | Has merge conflicts | ✅ Yes |
| `conflicts` | Manual conflict resolution needed | ✅ Yes |
| `unsigned-commits` | Contains unsigned commits | ✅ Yes |
| `requires-signature` | Needs commit signing | ✅ Yes |
| `ready-for-review` | All checks passing | ✅ Yes |

## 🔧 Customization

### Modify Validation Checks

Edit `.github/workflows/pr-orchestrator.yml`:

```yaml
- name: Run linting
  run: npm run lint

- name: Run tests
  run: npm run test

- name: Run build
  run: npm run build
```

### Adjust Stale PR Threshold

Edit `scripts/consolidate-prs.ts`:

```typescript
const STALE_DAYS = 90; // Change to your preference
```

### Configure Status Checks

Edit `scripts/setup-branch-protection.ts`:

```typescript
required_status_checks: {
  contexts: [
    'Cryptographic Verification',
    'Commit Signature Enforcement',
    // Add your custom checks here
  ],
}
```

## 📈 Monitoring

### View Attestations

```bash
# Check workflow runs
gh run list --workflow=commit-verification.yml

# Download attestation artifacts
gh run download <run-id> -n final-dual-attestation
```

### Check PR Status

```bash
# View all open PRs
gh pr list

# Check PR status
gh pr view <number>

# View PR checks
gh pr checks <number>
```

## 🆘 Troubleshooting

### PR stuck with conflicts

```bash
# Trigger manual sync
gh workflow run pr-branch-sync.yml -f pr_number=<number>
```

### Auto-remediation failed

```bash
# Trigger manual remediation
gh workflow run pr-auto-remediate.yml -f pr_number=<number>
```

### Unsigned commits blocking PR

```bash
# Sign existing commits
git rebase --exec 'git commit --amend --no-edit -n -S' -i <base-sha>
git push --force-with-lease
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Commit Signing Guide](https://docs.github.com/en/authentication/managing-commit-signature-verification)
- [Artifact Attestations](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds)

## 🤝 Contributing

This automation system is designed to be self-maintaining. When contributing:

1. All commits must be signed
2. Let the orchestrator run its checks
3. Auto-remediation will fix formatting/linting
4. Review attestation comments for security verification
5. PRs auto-merge when all checks pass

---

**Built with ❤️ for developer productivity and security**
