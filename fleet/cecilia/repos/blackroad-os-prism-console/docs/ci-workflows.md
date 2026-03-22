# CI/CD Workflows

This document describes the continuous integration and deployment workflows for the Prism Console application.

## Overview

The project uses **GitHub Actions** for automated testing, linting, building, and deployment. All workflows are defined in `.github/workflows/`.

## Workflows

### 1. Test Workflow (`test.yml`)

**Trigger**: Push to `main`/`develop`, pull requests

**Purpose**: Run Jest tests across multiple Node.js versions

**Jobs**:
- Install dependencies
- Run tests with coverage
- Upload coverage to Codecov
- Archive test results

**Node.js versions tested**: 20.x, 22.x

```bash
# Run locally
npm test
```

**Configuration**:
- Tests run with `--ci` flag for cleaner output
- Coverage reports uploaded for Node 20.x only
- Test results archived for 7 days

### 2. Lint Workflow (`lint.yml`)

**Trigger**: Push to `main`/`develop`, pull requests

**Purpose**: Enforce code quality standards

**Checks**:
1. **ESLint** - JavaScript/TypeScript linting
2. **TypeScript** - Type checking
3. **Prettier** - Code formatting (if configured)

```bash
# Run locally
npm run lint
npm run type-check
```

**Failure conditions**:
- ESLint errors (warnings allowed)
- TypeScript type errors
- Prettier formatting issues (if enabled)

### 3. Build Workflow (`build.yml`)

**Trigger**: Push to `main`/`develop`, pull requests

**Purpose**: Verify Next.js build succeeds

**Steps**:
1. Install dependencies
2. Run `next build`
3. Verify `.next` directory created
4. Check for standalone output
5. Archive build artifacts

```bash
# Run locally
npm run build
```

**Artifacts**:
- Build output stored for 7 days
- Excludes cache directory for size reduction

### 4. Auto Labeler Workflow (`auto-labeler.yml`)

**Trigger**: PR opened/updated, issue opened/edited

**Purpose**: Automatically label PRs and issues

**Features**:
- **File-based labeling** - Labels PRs based on changed files
- **Size labeling** - Adds size labels (xs/s/m/l/xl) based on lines changed
- **Issue labeling** - Labels issues based on title/body keywords

**Label categories**:
- `component` - Component file changes
- `pages` - Page/route changes
- `api` - API route changes
- `testing` - Test file changes
- `documentation` - Docs changes
- `ci/cd` - Workflow changes
- `dependencies` - Package.json changes
- Size labels: `size/xs`, `size/s`, `size/m`, `size/l`, `size/xl`

## Configuration Files

### `.github/labels.yml`

Defines keyword-based labeling for issues:

```yaml
- label: "bug"
  keywords:
    - bug
    - error
    - crash
```

### `.github/labeler.yml`

Defines file path-based labeling for PRs:

```yaml
component:
  - changed-files:
    - any-glob-to-any-file: 'src/components/**/*.{ts,tsx}'
```

## Branch Protection

Recommended branch protection rules for `main`:

- [x] Require pull request reviews (1+ approver)
- [x] Require status checks to pass:
  - `test` workflow
  - `lint` workflow
  - `build` workflow
- [x] Require branches to be up to date
- [x] Require conversation resolution
- [ ] Require signed commits (optional)

## Secrets Configuration

Required secrets (if using all features):

| Secret | Purpose | Required |
|--------|---------|----------|
| `CODECOV_TOKEN` | Upload coverage reports | Optional |
| `GITHUB_TOKEN` | Automatic (provided by GitHub) | Yes |

Add secrets in: **Settings → Secrets and variables → Actions**

## Local Testing of Workflows

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act

# Run test workflow
act push -j test

# Run all workflows for PR
act pull_request
```

## Workflow Status Badges

Add to README.md:

```markdown
![Tests](https://github.com/your-org/blackroad-os-prism-console/workflows/Tests/badge.svg)
![Lint](https://github.com/your-org/blackroad-os-prism-console/workflows/Lint/badge.svg)
![Build](https://github.com/your-org/blackroad-os-prism-console/workflows/Build/badge.svg)
```

## Troubleshooting

### Workflow fails on `npm ci`

**Cause**: Lock file out of sync with package.json

**Solution**:
```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
```

### Tests pass locally but fail in CI

**Cause**: Environment differences or missing mocks

**Solutions**:
- Check Node.js version match
- Verify environment variables
- Review test isolation (tests may depend on each other)

### Build succeeds locally but fails in CI

**Cause**: TypeScript errors ignored locally

**Solution**:
```bash
# Run same checks as CI
npm run type-check
npm run build
```

### Labeler not working

**Cause**: Invalid glob patterns or missing permissions

**Solutions**:
- Verify glob patterns in `.github/labeler.yml`
- Check workflow has `pull-requests: write` permission
- Test patterns locally with glob tools

## Performance Optimization

### Cache Dependencies

All workflows use npm cache:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### Parallel Jobs

Tests run in parallel across Node versions using matrix strategy:

```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]
```

### Limit Test Workers

CI uses fewer workers for stability:

```bash
npm test -- --maxWorkers=2
```

## Monitoring

View workflow runs:
- **GitHub**: Actions tab → Select workflow
- **Notifications**: Enable in Settings → Notifications

Check average workflow duration:
- **Target**: < 5 minutes for test workflow
- **Target**: < 3 minutes for lint workflow
- **Target**: < 5 minutes for build workflow

## Future Enhancements

- [ ] Add E2E testing with Playwright/Cypress
- [ ] Deploy preview environments for PRs
- [ ] Add performance benchmarking
- [ ] Integrate security scanning (Snyk, Dependabot)
- [ ] Add bundle size tracking
- [ ] Implement canary deployments

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [Actions Labeler](https://github.com/actions/labeler)
- [Codecov Documentation](https://docs.codecov.com/docs)
