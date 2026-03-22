# BlackRoad Dependency Ecosystem Map

**Generated:** 2026-02-14
**Analysis Date:** 2026-02-14
**Scope:** 87 package units (69 standalone + 18 monorepo packages)

---

## Executive Summary

The BlackRoad ecosystem consists of **87 package units** across standalone repositories and a unified monorepo. The architecture follows a clean **hub-and-spoke pattern** with `@blackroad/shared` as the central dependency used by 11 packages.

**Architecture Grade: B+**

### Key Findings

✅ **Strengths:**
- Clean separation between core utilities and applications
- Well-defined monorepo workspace structure
- TypeScript adoption across all packages
- Minimal circular dependencies (1 fixable issue)

❌ **Issues:**
- Self-referencing dependency in `@blackroad/shared`
- 55 packages with version inconsistencies
- Missing `package.json` for `@blackroad/types`
- Low test coverage (5% in monorepo)

---

## Ecosystem Overview

```
BlackRoad Ecosystem (87 packages)
├── Standalone Repositories (69)
│   ├── @blackroad/sdk
│   ├── @blackroad/react-components
│   ├── blackroad-io
│   ├── blackroad-api-cloudflare
│   └── ... 65 more
│
└── Monorepo Workspace (18)
    ├── Core Packages (2)
    │   ├── @blackroad/shared ⭐ (11 dependents)
    │   └── @blackroad/types ⭐ (2 dependents)
    │
    ├── Services (5)
    │   ├── @blackroad/api
    │   ├── @blackroad/auth
    │   ├── @blackroad/billing
    │   └── @blackroad/analytics
    │
    ├── Apps (5)
    │   ├── @blackroad/web
    │   ├── @blackroad/ai-dashboard
    │   ├── @blackroad/metaverse
    │   └── @blackroad/app-store-web
    │
    └── Tooling (2)
        ├── @blackroad/desktop-app
        └── @blackroad/vscode-extension
```

---

## Dependency Graph

### Architecture Pattern: Hub-and-Spoke

```
                    ┌─────────────────────┐
                    │  @blackroad/shared  │ ⭐ CORE
                    │   (11 dependents)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  @blackroad/ │  │  @blackroad/ │  │  @blackroad/ │
    │     api      │  │     auth     │  │   billing    │ 🍃 LEAF
    └──────────────┘  └──────────────┘  └──────────────┘

              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  @blackroad/ │  │  @blackroad/ │  │  @blackroad/ │
    │  analytics   │  │     web      │  │ai-dashboard  │ 🍃 LEAF
    └──────────────┘  └──────────────┘  └──────────────┘

              │                │                │
              ▼                ▼                ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  @blackroad/ │  │  @blackroad/ │  │  @blackroad/ │
    │ desktop-app  │  │  metaverse   │  │vscode-ext... │ 🍃 LEAF
    └──────────────┘  └──────────────┘  └──────────────┘

              └────────────────┬────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   @blackroad/types  │ ⭐ CORE
                    │   (2 dependents)    │
                    └─────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
          ┌──────────────┐      ┌──────────────┐
          │  @blackroad/ │      │  @blackroad/ │
          │  agent-sdk   │      │     web      │ 🍃 LEAF
          └──────────────┘      └──────────────┘
```

### Legend

- ⭐ **CORE** - Depended on by multiple packages (foundation)
- 🍃 **LEAF** - Depends on others but not depended upon (applications)
- 📦 **STANDALONE** - No internal dependencies

---

## Internal Dependencies Detail

### Core Packages (Foundation Layer)

#### `@blackroad/shared` ⭐
**Role:** Central utility library
**Dependents:** 11 packages
**Location:** `/packages/shared/`
**Status:** ⚠️ Has self-reference (needs fix)

Used by:
- @blackroad/agent-sdk
- @blackroad/ai-dashboard
- @blackroad/analytics
- @blackroad/api
- @blackroad/auth
- @blackroad/billing
- @blackroad/desktop-app
- @blackroad/metaverse
- @blackroad/shared (⚠️ CIRCULAR)
- @blackroad/vscode-extension
- @blackroad/web

#### `@blackroad/types` ⭐
**Role:** Shared TypeScript type definitions
**Dependents:** 2 packages
**Location:** `/packages/types/`
**Status:** ⚠️ Missing package.json

Used by:
- @blackroad/agent-sdk
- @blackroad/web

---

### Leaf Packages (Application Layer)

All leaf packages depend on `@blackroad/shared` and have no dependents.

| Package | Dependencies | Purpose |
|---------|-------------|---------|
| `@blackroad/agent-sdk` | shared, types | SDK for agent development |
| `@blackroad/ai-dashboard` | shared | AI monitoring dashboard |
| `@blackroad/analytics` | shared | Analytics service |
| `@blackroad/api` | shared | API gateway |
| `@blackroad/auth` | shared | Authentication service |
| `@blackroad/billing` | shared | Billing service |
| `@blackroad/desktop-app` | shared | Desktop application |
| `@blackroad/metaverse` | shared | Metaverse application |
| `@blackroad/vscode-extension` | shared | VSCode extension |
| `@blackroad/web` | shared, types | Main web application |

---

### Standalone Packages (No Internal Dependencies)

These packages exist in the monorepo but have no `@blackroad/*` dependencies:

- `@blackroad/app-store-web`
- `blackroad-os-web`
- `blackroad-platform-hub`
- `roadmap`
- `roadside`
- `roadview`
- `roadwork`

---

## Circular Dependencies

### ⚠️ Critical Issue: Self-Reference

**Package:** `@blackroad/shared`
**Issue:** Depends on itself via `"@blackroad/shared": "workspace:*"`
**File:** `/Users/alexa/blackroad-os-monorepo/packages/shared/package.json`

**Fix:**
```diff
{
  "name": "@blackroad/shared",
  "dependencies": {
-   "@blackroad/shared": "workspace:*"
  }
}
```

**Impact:** Low (likely a configuration mistake, not causing runtime issues)

---

## External Dependency Analysis

### Version Consistency Issues

**Total Unique Dependencies:** 181
**Packages with Version Drift:** 55

#### Critical Dependencies with Multiple Versions

| Package | Versions | Most Used |
|---------|----------|-----------|
| `typescript` | 13 different | ^5.3.3 (9 repos) |
| `@types/node` | 17 different | ^20 (5 repos) |
| `@types/react` | 12 different | ^18.3.12 (4 repos) |
| `react` | 6 different | 18.3.1 (8 repos) |
| `next` | 9 different | 14.2.0 (6 repos) |

#### Most Popular Dependencies

| Dependency | Usage Count | Purpose |
|------------|------------|---------|
| `typescript` | 57 repos | Type system |
| `@types/node` | 45 repos | Node.js types |
| `eslint` | 31 repos | Linting |
| `prettier` | 28 repos | Code formatting |
| `react` | 27 repos | UI framework |
| `react-dom` | 26 repos | React DOM |
| `@types/react` | 22 repos | React types |
| `tsx` | 22 repos | TypeScript execution |
| `next` | 20 repos | React framework |
| `vitest` | 16 repos | Testing |
| `tailwindcss` | 15 repos | CSS framework |

---

## Scoped Packages (`@blackroad/*`)

**Total:** 16 scoped packages across ecosystem

### In Monorepo (13)
- @blackroad/agent-sdk
- @blackroad/ai-dashboard
- @blackroad/analytics
- @blackroad/api
- @blackroad/app-store-web
- @blackroad/auth
- @blackroad/billing
- @blackroad/desktop-app
- @blackroad/metaverse
- @blackroad/shared
- @blackroad/types (no package.json)
- @blackroad/vscode-extension
- @blackroad/web

### Standalone (3)
- @blackroad/sdk (in `/blackroad-sdk/`)
- @blackroad/react-components (in `/blackroad-react-components/`)
- @blackroad-os/pack-finance (in `/blackroad-os-pack-finance/`)

---

## Package Health Metrics

### Monorepo Packages (18 total)

| Metric | Count | Percentage |
|--------|-------|------------|
| Have build scripts | 12/18 | 66% |
| Have test scripts | 1/18 | 5% ⚠️ |
| Have type definitions | 2/18 | 11% |
| Have dependencies | 11/18 | 61% |

**Concern:** Very low test coverage (5%)

---

## Recommendations

### 🔴 Immediate Actions (Critical)

#### 1. Fix Circular Dependency
**File:** `/Users/alexa/blackroad-os-monorepo/packages/shared/package.json`

Remove the self-reference:
```bash
# Edit the file and remove "@blackroad/shared": "workspace:*" from dependencies
```

#### 2. Create Missing package.json for @blackroad/types
**Location:** `/Users/alexa/blackroad-os-monorepo/packages/types/`

Create package.json:
```json
{
  "name": "@blackroad/types",
  "version": "1.0.0",
  "description": "Shared TypeScript type definitions for BlackRoad OS",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

#### 3. Standardize Critical Dependencies
Create a pnpm workspace catalog in the monorepo root:

**File:** `/Users/alexa/blackroad-os-monorepo/pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
  - 'agents/*'
  - 'infrastructure/*'
  - 'tooling/*'

catalog:
  typescript: ^5.3.3
  '@types/node': ^20.12.12
  '@types/react': ^18.3.12
  react: ^18.3.1
  react-dom: ^18.3.1
  next: ^14.2.0
  vitest: ^1.3.1
  prettier: ^3.2.5
  eslint: ^8.57.0
  tailwindcss: ^3.4.14
```

Then update packages to use `catalog:` references.

### 🟡 Short-term Improvements (High Priority)

#### 4. Increase Test Coverage
**Current:** 5% of packages have tests
**Target:** 80%+

Add test infrastructure to all packages:
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "catalog:",
    "@testing-library/react": "catalog:",
    "@testing-library/jest-dom": "catalog:"
  }
}
```

#### 5. Implement Dependency Management
Set up Renovate for automated dependency updates:

**File:** `/Users/alexa/blackroad-os-monorepo/renovate.json`
```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPackagePatterns": ["^@blackroad/"],
      "groupName": "BlackRoad internal packages",
      "automerge": true
    }
  ],
  "rangeStrategy": "bump"
}
```

#### 6. Document Package Governance
Create guidelines for when to create new `@blackroad/*` packages:

**File:** `/Users/alexa/blackroad-os-monorepo/docs/PACKAGE_GOVERNANCE.md`

### 🟢 Long-term Strategic Improvements

#### 7. Monorepo Migration Strategy
Consider migrating standalone `@blackroad/*` packages to monorepo:

**Candidates for migration:**
- `/blackroad-sdk/` → `/Users/alexa/blackroad-os-monorepo/packages/sdk/`
- `/blackroad-react-components/` → `/Users/alexa/blackroad-os-monorepo/packages/react-components/`

**Benefits:**
- Centralized dependency management
- Easier cross-package refactoring
- Consistent build/test infrastructure

#### 8. Create Dependency Dashboard
Build a visual dashboard showing:
- Package dependency graph
- Version consistency status
- Test coverage by package
- Build health

#### 9. Establish Release Process
Implement Changesets for coordinated releases:
```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

---

## Dependency Metrics

| Metric | Value |
|--------|-------|
| Total Package Units | 87 |
| Monorepo Packages | 18 |
| Standalone Repos | 69 |
| @blackroad/* Scoped | 16 |
| Core Packages | 2 |
| Leaf Packages | 10 |
| Standalone (no deps) | 7 |
| Circular Dependencies | 1 (fixable) |
| Average Dependencies per Package | 0.7 |
| Version Inconsistencies | 55 |
| Unique External Dependencies | 181 |

---

## Version Drift Details

### TypeScript (13 versions)
- `^5.3.3` - 9 repos ✅ (recommended)
- `^5.6.2` - 6 repos
- `^5.6.3` - 6 repos
- `^5.4.0` - 6 repos
- `^5.9.3` - 4 repos
- `^5.5.4` - 4 repos
- ... 7 more versions

### @types/node (17 versions)
- `^20` - 5 repos ✅ (recommended)
- `^20.12.12` - 6 repos
- `^22.0.0` - 6 repos
- `20.14.9` - 4 repos
- `^20.11.30` - 4 repos
- ... 12 more versions

### React (6 versions)
- `18.3.1` - 8 repos ✅ (recommended)
- `^18.3.0` - 6 repos
- `^18.3.1` - 6 repos
- `^18.2.0` - 4 repos
- `^19.2.3` - 2 repos
- `^19.2.4` - 1 repo

---

## Migration Checklist

### Phase 1: Fix Critical Issues (Week 1)
- [ ] Remove self-reference from @blackroad/shared
- [ ] Create package.json for @blackroad/types
- [ ] Verify no other circular dependencies exist
- [ ] Document the fix in memory system

### Phase 2: Standardize Versions (Week 2)
- [ ] Create pnpm workspace catalog
- [ ] Update all packages to use catalog versions
- [ ] Run full test suite to verify compatibility
- [ ] Update documentation

### Phase 3: Improve Quality (Week 3-4)
- [ ] Add tests to packages missing them
- [ ] Set up Renovate for dependency updates
- [ ] Create dependency dashboard
- [ ] Document package governance

### Phase 4: Strategic Improvements (Month 2)
- [ ] Migrate standalone @blackroad packages to monorepo
- [ ] Implement Changesets for releases
- [ ] Set up CI/CD for monorepo
- [ ] Create package templates

---

## Related Files

- Monorepo root: `/Users/alexa/blackroad-os-monorepo/`
- Core package: `/Users/alexa/blackroad-os-monorepo/packages/shared/`
- Types package: `/Users/alexa/blackroad-os-monorepo/packages/types/`
- Package list: All `blackroad-*` and `blackroad-os-*` directories in `/Users/alexa/`

---

## Generated Insights

This analysis was performed by scanning 87 package.json files across the BlackRoad ecosystem. The dependency graph reveals a healthy hub-and-spoke architecture with `@blackroad/shared` serving as the foundation for 11 packages. The main issues are configuration-related rather than architectural, making them straightforward to fix.

The ecosystem would benefit from:
1. **Immediate fixes** to the self-reference and missing package.json
2. **Version standardization** using pnpm workspace catalogs
3. **Increased test coverage** from 5% to 80%+
4. **Automated dependency management** via Renovate

With these improvements, the architecture grade could move from **B+ to A**.

---

**Last Updated:** 2026-02-14
**Maintained by:** BlackRoad Infrastructure Team
**Next Review:** When adding new packages or major dependency updates
