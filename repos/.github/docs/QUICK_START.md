# 🚀 Quick Start Guide - Automated PR System

## For Developers

### 1. Setup Commit Signing (One-time)

**Option A: SSH Signing (Recommended - Easiest)**

```bash
# Use your existing SSH key
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true

# Add SSH key to GitHub if not already done
cat ~/.ssh/id_ed25519.pub
# Go to GitHub → Settings → SSH and GPG keys → New SSH key
```

**Option B: GPG Signing**

```bash
# Generate GPG key
gpg --full-generate-key

# Get your key ID
gpg --list-secret-keys --keyid-format=long

# Configure Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# Export public key and add to GitHub
gpg --armor --export YOUR_KEY_ID
# Go to GitHub → Settings → SSH and GPG keys → New GPG key
```

### 2. Create a PR

```bash
# Create your feature branch
git checkout -b feature/my-awesome-feature

# Make changes, commit (will be auto-signed)
git add .
git commit -m "feat: add awesome feature"

# Push to GitHub
git push -u origin feature/my-awesome-feature

# Create PR
gh pr create --title "Add awesome feature" --body "Description here"
```

### 3. Watch the Magic Happen

The system will automatically:
- ✅ Verify all commits cryptographically (SHA-256 + SHA-512)
- ✅ Check commit signatures
- ✅ Run linting, tests, and build
- ✅ Fix formatting issues automatically
- ✅ Sync your branch with main if needed
- ✅ Add `automerge` label when ready
- ✅ Merge your PR automatically

### 4. Check Progress

View your PR status:
```bash
gh pr view
```

All results are posted as comments on your PR!

---

## For Repository Admins

### Initial Setup (One-time)

**1. Configure Secrets**

Go to GitHub → Settings → Secrets and variables → Actions:

```bash
BOT_TOKEN=ghp_xxxxxxxxxxxxx  # Personal access token for automation
BOT_USER=blackroad-bot        # Bot username (optional)
GITHUB_PAT=ghp_xxxxxxxxxxxxx  # PAT with repo permissions
```

**2. Setup Branch Protection**

```bash
# Clone repo
git clone <repo-url>
cd <repo-name>

# Run setup script
npx tsx scripts/setup-branch-protection.ts
```

This configures:
- Required status checks
- Required PR reviews
- Signed commit enforcement
- Protection from force pushes
- CODEOWNERS file

**3. Consolidate Existing PRs**

```bash
# Clean up and organize all open PRs
npx tsx scripts/consolidate-prs.ts
```

This will:
- Auto-approve ready PRs
- Sync conflicting PRs
- Archive stale PRs (>90 days)
- Process bot PRs automatically

### Daily Operations

**Check System Health**

```bash
# View recent workflow runs
gh run list --workflow=pr-orchestrator.yml

# Check for failed workflows
gh run list --status=failure
```

**Manual Operations**

```bash
# Manually sync a PR
gh workflow run pr-branch-sync.yml -f pr_number=123

# Manually trigger remediation
gh workflow run pr-auto-remediate.yml -f pr_number=123

# Re-run orchestrator
gh workflow run pr-orchestrator.yml -f pr_number=123
```

**Verify Commit Attestations**

```bash
# Verify a specific commit
./.github/tools/verify-commit-attestation.sh abc123 verify

# Generate attestation tokens
./.github/tools/verify-commit-attestation.sh abc123 attest

# Full verification + attestation
./.github/tools/verify-commit-attestation.sh abc123 both
```

---

## Common Scenarios

### ❓ My PR has conflicts

**Automatic**: The system will try to sync automatically
**Manual**:
```bash
git fetch origin main
git merge origin/main
# Resolve conflicts
git commit
git push
```

### ❓ Tests are failing

**Automatic**: Auto-remediation will try to fix
**Manual**:
```bash
npm run test
# Fix tests
git add .
git commit -m "fix: resolve test failures"
git push
```

### ❓ My commits aren't signed

```bash
# Sign existing commits
git rebase --exec 'git commit --amend --no-edit -n -S' -i origin/main
git push --force-with-lease
```

### ❓ PR not auto-merging

Check:
1. ✅ All status checks pass
2. ✅ Has `automerge` label
3. ✅ Not a draft PR
4. ✅ No conflicts with base branch
5. ✅ All commits signed

Manually trigger:
```bash
gh pr merge <number> --auto --squash
```

### ❓ Want to skip CI for a commit

Add `[skip ci]` to commit message:
```bash
git commit -m "docs: update README [skip ci]"
```

### ❓ Need to force-push

**⚠️ Caution**: Only on your feature branches!

```bash
# Safer force push
git push --force-with-lease

# This protects against overwriting others' work
```

---

## Workflow Cheat Sheet

| Task | Command |
|------|---------|
| Create PR | `gh pr create` |
| View PR status | `gh pr view [number]` |
| List open PRs | `gh pr list` |
| Check PR checks | `gh pr checks [number]` |
| Merge PR | `gh pr merge [number]` |
| Close PR | `gh pr close [number]` |
| Reopen PR | `gh pr reopen [number]` |
| Add reviewer | `gh pr edit [number] --add-reviewer @user` |
| Add label | `gh pr edit [number] --add-label label-name` |

---

## Labels Reference

| Label | What It Means | Action Required |
|-------|---------------|-----------------|
| `automerge` | Will auto-merge when checks pass | None - automatic |
| `automated-pr-flow` | Being tracked by orchestrator | None - informational |
| `conflicts-detected` | Has merge conflicts | Check for auto-sync |
| `conflicts` | Manual resolution needed | Merge main into branch |
| `unsigned-commits` | Contains unsigned commits | Sign commits |
| `requires-signature` | Blocked due to signing | Setup GPG/SSH signing |
| `ready-for-review` | All checks passing | Request reviewers |

---

## Get Help

- 📚 Full documentation: `.github/docs/PR_AUTOMATION_SYSTEM.md`
- 🐛 Issues: Create an issue with `automation` label
- 💬 Questions: Tag `@blackroad-bot` in PR comments

---

**Happy automating! 🤖**
