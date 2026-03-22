# Repository Settings Configuration

This document describes the required GitHub repository settings for BlackRoad OS Core. These settings must be configured by repository administrators via GitHub's web interface.

## 🎯 Default Branch

**Setting**: Repository → Settings → General → Default branch

- Set default branch to `main`
- Ensure no legacy `master` branch exists

## 🔒 Release Immutability (Tag Protection)

**Setting**: Repository → Settings → Rules → Tag protection rules

Create a tag protection rule:
- **Tag name pattern**: `v*`
- This protects all version tags (e.g., `v1.0.0`, `v2.1.3`) from being modified or deleted

## 🛡️ Branch Protection Rules

**Setting**: Repository → Settings → Branches → Branch protection rules

### Main Branch Protection

Create a rule for `main`:

- [x] **Require a pull request before merging**
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Required checks:
    - `build` (from ci.yml)
    - `dco-check` (from dco-check.yml)
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings**
- [x] **Restrict who can push to matching branches**

### Staging Branch Protection (Optional)

Create a rule for `staging`:

- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**

### Dev Branch Protection (Optional)

Create a rule for `dev`:

- [x] **Require status checks to pass before merging**

## 🧹 Auto-Delete Head Branches

**Setting**: Repository → Settings → General → Pull Requests

- [x] **Automatically delete head branches**

This keeps the branch list clean by automatically deleting feature branches after their PRs are merged.

## 🌿 Branch Limit Policy

**Policy**: Maximum 50 active branches per repository

While GitHub doesn't have a built-in setting for this, we enforce this through:

1. **Automatic deletion** of head branches after merge
2. **Regular cleanup** of stale branches
3. **Branch naming conventions** in CONTRIBUTING.md
4. **Team awareness** and periodic audits

### Cleanup Script (for administrators)

```bash
# List branches older than 30 days
git fetch --prune
git for-each-ref --sort=committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)' | head -20

# Delete stale remote branches (use with caution)
# git push origin --delete branch-name
```

## ✍️ DCO Sign-Off Enforcement

**Implementation**: GitHub Actions workflow (`dco-check.yml`)

The DCO check runs automatically on:
- Pull requests to `main`, `dev`, `staging`
- Pushes to `main`

### For Web-Based Commits

When making commits through GitHub's web interface, add the sign-off line manually:

```
Your commit message

Signed-off-by: Your Name <your.email@example.com>
```

## 🗄️ Git LFS Configuration

**Implementation**: `.gitattributes` file

Git LFS is configured to track:
- Schema definitions (`*.schema.json`)
- Binary configurations (`*.bin`, `*.dat`, `*.db`)
- Archives (`*.zip`, `*.tar.gz`)
- Documents (`*.pdf`)
- Images (`*.png`, `*.jpg`, `*.gif`, `*.svg`)
- Fonts (`*.ttf`, `*.woff`, `*.woff2`)
- Binary executables
- Tauri application bundles

### Enabling Git LFS

For new contributors:

```bash
# Install Git LFS
git lfs install

# Clone with LFS
git lfs clone https://github.com/BlackRoad-OS/blackroad-os-core.git

# Or pull LFS files in existing repo
git lfs pull
```

## 📋 Summary Checklist

For administrators setting up the repository:

- [ ] Default branch set to `main`
- [ ] Tag protection rule for `v*` created
- [ ] Branch protection rule for `main` with:
  - [ ] Required pull requests
  - [ ] Required status checks (`build`, `dco-check`)
  - [ ] Required approvals
- [ ] Auto-delete head branches enabled
- [ ] DCO workflow active and required
- [ ] Git LFS enabled for repository

## 🔗 Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [Developer Certificate of Origin](https://developercertificate.org/)
- [Git LFS Documentation](https://git-lfs.github.com/)

---

*Last updated: Repository Upgrade Initiative 💚✨*
