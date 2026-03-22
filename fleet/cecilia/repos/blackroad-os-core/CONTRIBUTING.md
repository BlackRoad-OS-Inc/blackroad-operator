# Contributing to BlackRoad OS Core 🖤💚

Thank you for your interest in contributing to BlackRoad OS Core! This is the cognitive kernel of BlackRoad OS — the Truth Engine that powers fact verification.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Commit Message Standard](#commit-message-standard)
- [Pull Request Process](#pull-request-process)
- [DCO Sign-off](#dco-sign-off)

## Code of Conduct

Be respectful, inclusive, and professional. We're building something meaningful together.

## How to Contribute

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature/fix
4. **Make changes** following our standards
5. **Test** your changes thoroughly
6. **Submit** a pull request

## Development Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run linting
pnpm lint

# Run tests
pnpm test

# Build
pnpm build
```

## Commit Message Standard 🧠

We use semantic commit messages. Every commit must start with one of these prefixes:

| Prefix     | Description                                    |
|------------|------------------------------------------------|
| `feat:`    | New feature                                    |
| `fix:`     | Bug fix                                        |
| `chore:`   | Maintenance tasks                              |
| `docs:`    | Documentation changes                          |
| `refactor:`| Code refactoring without feature changes       |
| `test:`    | Adding or updating tests                       |

### Examples

```
feat: add TruthState aggregation endpoint
fix: correct confidence calculation in truth aggregation
docs: update API documentation for /health endpoint
chore: update dependencies
refactor: simplify verification job lifecycle
test: add unit tests for PS-SHA∞ hashing
```

## Pull Request Process

1. Ensure your code passes all tests (`pnpm test`)
2. Ensure your code passes linting (`pnpm lint`)
3. Update documentation if needed
4. Request review from `@blackroad-core`
5. Wait for CI checks to pass
6. Get at least one approval before merging

## DCO Sign-off 🖊️

All commits must be signed off to indicate you agree to the Developer Certificate of Origin (DCO).

Add `-s` to your commit command:

```bash
git commit -s -m "feat: your commit message"
```

This adds a `Signed-off-by` line to your commit message.

---

## Questions?

Open an issue or reach out to the maintainers. We're here to help! 💚
# Contributing to BlackRoad OS Core

Thank you for your interest in contributing to BlackRoad OS Core! This document outlines our contribution guidelines and requirements.

## Table of Contents

- [Developer Certificate of Origin (DCO)](#developer-certificate-of-origin-dco)
- [Branch Guidelines](#branch-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Guidelines](#commit-guidelines)
- [Code Style](#code-style)

## Developer Certificate of Origin (DCO)

We require all contributors to sign off their commits per the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). This is a lightweight way for contributors to certify that they wrote or have the right to submit the code they are contributing.

### How to Sign Off

Add a `Signed-off-by` line to your commit messages:

```bash
# Option 1: Use the --signoff flag
git commit --signoff -m "Your commit message"

# Option 2: Manually add to commit message
git commit -m "Your commit message

Signed-off-by: Your Name <your.email@example.com>"
```

### Fixing Unsigned Commits

If you have unsigned commits, you can fix them:

```bash
# Fix the last commit
git commit --amend --signoff

# Fix multiple commits
git rebase --signoff HEAD~N
```

### DCO Text

By signing off, you certify the following:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## Branch Guidelines

We maintain a clean branch structure:

- **main**: Production-ready code. Protected branch requiring status checks and reviews.
- **staging**: Pre-production testing environment.
- **dev**: Active development branch.

### Branch Limits

- Maximum of **50 active branches** per repository
- Feature branches should be short-lived and deleted after merging
- Head branches are automatically deleted after PR merge
- Stale branches (inactive > 30 days) will be archived

> **Why 50 branches?** This limit helps maintain repository health by:
> - Keeping the branch list navigable and manageable
> - Encouraging timely completion and merging of features
> - Reducing cognitive overhead for contributors
> - Ensuring CI/CD resources aren't spread across too many branches
>
> When approaching this limit, maintainers will reach out to archive stale branches.

### Naming Conventions

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/modifications
- `chore/` - Maintenance tasks

## Pull Request Process

1. **Create a branch** from `dev` (or `main` for hotfixes)
2. **Make your changes** with signed-off commits
3. **Test locally** using `pnpm test` and `pnpm lint`
4. **Open a PR** against the appropriate base branch
5. **Wait for CI** - All status checks must pass
6. **Address review feedback** - At least one approval required
7. **Merge** - Squash and merge is preferred

### PR Requirements

- [ ] All commits are signed off (DCO)
- [ ] CI checks pass (lint, test, build)
- [ ] Code review approved
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts

## Commit Guidelines

Follow conventional commit format:

```
type(scope): description

[optional body]

Signed-off-by: Your Name <email@example.com>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

### Examples

```bash
git commit --signoff -m "feat(core): add TruthState aggregation"
git commit --signoff -m "fix(api): resolve null pointer in snapshot handler"
git commit --signoff -m "docs: update contributing guidelines"
```

## Code Style

- Use TypeScript for all new code
- Follow existing ESLint configuration
- Format with Prettier before committing
- Write tests for new functionality

### Quick Commands

```bash
# Install dependencies
pnpm install

# Run linter
pnpm lint

# Run tests
pnpm test

# Build
pnpm build

# Development mode
pnpm dev
```

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.

---

*Thank you for contributing to BlackRoad OS Core! 💚✨*
