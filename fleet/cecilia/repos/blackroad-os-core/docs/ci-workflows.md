# CI/CD Workflows

This document describes the GitHub Actions workflows for `blackroad-os-core`.

## Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Tests** | PRs, push to `main`/`develop` | Run Jest test suite |
| **Lint** | PRs, push to `main`/`develop` | Run ESLint and type checking |
| **Build** | PRs, push to `main`/`develop` | Verify TypeScript compilation |
| **Deploy** | Push to `main`/`staging`/`dev` | Deploy to Railway |
| **Auto Label PRs** | PR opened/updated | Auto-apply labels |

## Workflow Details

### 1. Tests (`.github/workflows/test.yml`)

**Runs when:**
- Pull requests to `main`, `develop`, or `staging`
- Pushes to `main` or `develop`

**What it does:**
1. Checks out code
2. Installs Node.js 20
3. Installs dependencies (`npm ci`)
4. Runs all tests (`npm test`)
5. Posts summary to PR

**How to fix failures:**
- See [Testing Guide](./testing.md)

---

### 2. Lint (`.github/workflows/lint.yml`)

**Runs when:**
- Pull requests to `main`, `develop`, or `staging`
- Pushes to `main` or `develop`

**What it does:**
1. Runs ESLint to check code style
2. Runs TypeScript type checking (`tsc --noEmit`)
3. Reports any lint errors or type errors

**How to fix failures:**
- Lint errors: Run `npm run lint:fix` locally
- Type errors: Run `npm run type-check` and fix TypeScript issues

---

### 3. Build (`.github/workflows/build.yml`)

**Runs when:**
- Pull requests to `main`, `develop`, or `staging`
- Pushes to `main` or `develop`

**What it does:**
1. Compiles TypeScript to JavaScript (`npm run build`)
2. Verifies `dist/` directory is created
3. Ensures no compilation errors

**How to fix failures:**
- TypeScript errors: Run `npm run build` locally and fix errors
- Missing types: Install `@types/*` packages if needed

---

### 4. Deploy (`.github/workflows/deploy-core.yml`)

**Runs when:**
- Push to `main` (production)
- Push to `staging` (staging)
- Push to `dev` (development)

**What it does:**
1. Builds the application
2. Deploys to Railway (environment based on branch)
3. Runs health check on deployed service

**Environments:**
- `main` → Production (`https://core.blackroad.systems`)
- `staging` → Staging (`https://staging.core.blackroad.systems`)
- `dev` → Development

**Required secrets:**
- `RAILWAY_TOKEN` - Railway API token
- `RAILWAY_PROJECT_ID` - Railway project ID

---

### 5. Auto Label PRs (`.github/workflows/auto-labeler.yml`)

**Runs when:**
- PR is opened
- PR is updated (synchronize)
- PR is reopened

**What it does:**
1. Checks which files changed
2. Applies labels based on `.github/labeler.yml` rules
3. Helps route PRs to correct teams

**Examples:**
- Changes to `src/routes/**` → Adds `area:api` label
- Changes to `prisma/**` → Adds `area:database` label
- Changes to `tests/**` → Adds `area:tests` and `type:test` labels

## GitHub Projects Integration

Labels enable automatic project board organization:

- **`team:backend`** → Routes to "Backend" lane
- **`priority:critical`** → Prioritized in review queue
- **`status:needs-review`** → Moves to "Review Needed" column

## Workflow Permissions

All workflows use `GITHUB_TOKEN` with minimal permissions:
- **Read**: Code checkout
- **Write**: Labels (for auto-labeler), Deployments (for Railway)

Deployment requires `RAILWAY_TOKEN` secret.

## Debugging Workflow Failures

### View Logs
1. Go to PR page
2. Click "Checks" tab
3. Select failed workflow
4. Expand failed step

### Re-run Workflows
1. Click "Re-run jobs" button
2. Select "Re-run failed jobs" or "Re-run all jobs"

### Local Testing
Run the same commands locally:
```bash
npm ci
npm run lint
npm run type-check
npm run build
npm test
```

## Modifying Workflows

**Adding a new workflow:**
1. Create `.github/workflows/your-workflow.yml`
2. Follow existing pattern (checkout → setup → run)
3. Add documentation to this file

**Changing triggers:**
- Edit `on:` section in workflow YAML
- Test with a draft PR first

**Adding new checks:**
1. Add check script to `package.json`
2. Call script in appropriate workflow
3. Update docs
