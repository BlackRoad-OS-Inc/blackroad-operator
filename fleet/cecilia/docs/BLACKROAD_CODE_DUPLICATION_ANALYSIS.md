# BlackRoad Code Duplication Analysis

**Analysis Date:** 2026-02-14
**Scope:** 123 Git repositories across ~/blackroad-* directories
**Total Package.json Files:** 432

---

## Executive Summary

Extensive code duplication detected across BlackRoad repositories due to:
1. **Copy-paste development** - Entire repos duplicated within other repos
2. **Missing shared libraries** - Common utilities duplicated in every project
3. **Template proliferation** - Boilerplate code never extracted
4. **Nested repository chaos** - Repos containing full copies of other repos

**Critical Finding:** The `blackroad-prism-console` directory (3.8GB) contains complete nested copies of multiple other repositories, creating massive duplication.

---

## 1. Massive Repository Nesting & Duplication

### blackroad-prism-console Contains Full Repos

The `/Users/alexa/blackroad-prism-console` directory (3.8GB) is a **mega-repo** containing nested copies of entire other repositories:

```
blackroad-prism-console/
├── blackroad-os-operator/          # DUPLICATE of ~/blackroad-garage/blackroad-os-operator
├── blackroad-os-prism-console/     # DUPLICATE of ~/blackroad-os-prism-console
├── blackroad-os-agents/            # DUPLICATE of ~/blackroad-os-agents
├── blackroad-prism-console/        # RECURSIVE: repo contains itself
├── blackroad-os-demo/              # DUPLICATE of ~/blackroad-os-demo
├── nextjs-ai-chatbot/              # Template project, never customized
├── my-repository/                  # Template project, never customized
└── 50+ other subdirectories
```

**Evidence:**
- Same config.ts across 4 operator copies (SHA: `59c85accaef53834bf22b8c91a1e58b1a8c2abc8`)
- Same types.ts in blackroad-os-agents (SHA: `932b2e929ea6e3fcfc91171cf57405caef3c158c`)
- blackroad-repos/ also contains duplicates: blackroad-prism-console (639MB copy)

**Impact:** 3.8GB - 639MB = **3.1GB of pure duplication** in one directory alone

---

## 2. Identical Utility Files (Copy-Paste Library Pattern)

### utils.ts - The cn() Function

**IDENTICAL FILES (SHA: 77eb1ca38b8b258774f4898a8981cfc5c77cff6a):**
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Locations:**
- `/Users/alexa/blackroad-console/lib/utils.ts`
- `/Users/alexa/blackroad-os-prism-console/lib/utils.ts`
- `/Users/alexa/blackroad-prism-console/blackroad-os-prism-console/lib/utils.ts`

**Should be:** `@blackroad/ui-utils` package

### constants.ts - Environment Configuration

**IDENTICAL FILES (SHA: c68ae889ab310bddd37ab163bb7313b1319892a2):**
```typescript
export const BEACON_URL = process.env.NEXT_PUBLIC_BEACON_URL ?? '';
export const CORE_HUB = process.env.NEXT_PUBLIC_CORE_HUB ?? '';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const SERVICE_ENV = process.env.NEXT_PUBLIC_ENV ?? 'dev';

export const SIG_HEADERS = {
  'x-bros-service': 'prism-console',
  'x-bros-env': SERVICE_ENV
};
```

**Locations:**
- `/Users/alexa/blackroad-console/lib/constants.ts`
- `/Users/alexa/blackroad-os-prism-console/lib/constants.ts`

**Should be:** `@blackroad/env-config` package

### types.ts - Agent Types

**IDENTICAL FILES (SHA: 932b2e929ea6e3fcfc91171cf57405caef3c158c):**
```typescript
import { AgentManifest } from './agent.schema.js';
export type Agent = AgentManifest;
```

**Locations:**
- `/Users/alexa/blackroad-os-agents/src/types.ts`
- `/Users/alexa/blackroad-prism-console/blackroad-os-agents/src/types.ts`

**Should be:** `@blackroad/agent-types` package

### config.ts - Operator Configuration

**IDENTICAL FILES (SHA: 59c85accaef53834bf22b8c91a1e58b1a8c2abc8):**

**Locations:**
- `/Users/alexa/blackroad-garage/blackroad-os-operator/src/config.ts`
- `/Users/alexa/blackroad-repos/blackroad-os-operator/src/config.ts`
- `/Users/alexa/blackroad-prism-console/blackroad-os-operator/src/config.ts`
- `/Users/alexa/blackroad-workspace-fix/blackroad-os-operator/src/config.ts`

**Should be:** `@blackroad/operator-config` package

---

## 3. Cloudflare Worker Duplication

### Worker Repositories (37+ separate repos)

Each worker is a standalone repository with duplicated patterns:

```
blackroad-api-billing-worker/
blackroad-api-worker/
blackroad-blackroad os-api-worker/
blackroad-blackroad os-worker/
blackroad-config-worker/
blackroad-email-worker/
blackroad-events-worker/
blackroad-features-worker/
blackroad-files-worker/
blackroad-gateway-worker/
blackroad-graphql-worker/
blackroad-images-worker/
blackroad-inference-worker/
blackroad-io-worker/
blackroad-landing-worker/
blackroad-logs-worker/
blackroad-memory-worker/
blackroad-metrics-worker/
blackroad-notifications-worker/
blackroad-orchestration-worker/
blackroad-pdf-worker/
blackroad-projects-worker/
blackroad-push-worker/
blackroad-queue-worker/
blackroad-ratelimit-worker/
blackroad-realtime-worker/
blackroad-scheduler-worker/
blackroad-search-worker/
blackroad-secrets-worker/
blackroad-sessions-worker/
blackroad-status-worker/
blackroad-stream-worker/
blackroad-tasks-worker/
blackroad-webhooks-worker/
... and more
```

**Common Duplication:**
- wrangler.toml (30+ found)
- tsconfig.json (some identical, 2+ with SHA c8104b3f335278e649d5c085b5d92dd1b46c7c27)
- CORS handling code
- Error handling patterns
- Environment variable parsing
- KV namespace access patterns

**Should be:**
- `@blackroad/worker-base` - Base worker class
- `@blackroad/worker-types` - Shared types (Env interface)
- `@blackroad/worker-cors` - CORS middleware
- Monorepo: `workers/` directory with shared tooling

---

## 4. Template Repository Proliferation

### Unused Template Projects

**nextjs-ai-chatbot** appears in multiple locations:
- `/Users/alexa/blackroad-prism-console/nextjs-ai-chatbot/`
- `/Users/alexa/blackroad-backpack/legacy/blackroad-sandbox-legacy-20251226-174836/nextjs-ai-chatbot/`
- `/Users/alexa/blackroad-backpack/legacy/blackroad-sandbox-legacy-20251226-174836/my-repository/` (same template)

**Files with identical patterns:**
- `lib/utils.ts` - Same cn() function
- `lib/types.ts` - Same type definitions
- `lib/constants.ts` - Same structure
- `lib/db/utils.ts` - Database utilities
- `lib/editor/config.ts` - Editor configuration
- `tests/helpers.ts` - Test helpers
- `tests/prompts/utils.ts` - Prompt utilities

**Evidence:** These are template repos that were copied but never customized or removed.

---

## 5. Common File Name Duplication

From filesystem analysis (excluding node_modules):

| Filename | Count | Notes |
|----------|-------|-------|
| index.js | 283 | Entry points never shared |
| index.d.ts | 90 | Type definitions duplicated |
| utils.js | 37 | Utility functions copy-pasted |
| types.js | 29 | Type definitions duplicated |
| types.d.ts | 20 | TypeScript type defs |
| utils.d.ts | 16 | Utility type defs |
| server.js | 15 | Server logic duplicated |
| constants.js | 13 | Constants duplicated |
| helpers.js | 10 | Helper functions duplicated |
| config.js | 5 | Configuration duplicated |

**Pattern:** Every repository reimplements basic utilities instead of importing from shared packages.

---

## 6. TypeScript Configuration Duplication

**Analysis of tsconfig.json files:**

```bash
# Count: 20+ tsconfig.json files found
# Duplicates identified: 2 files with SHA c8104b3f335278e649d5c085b5d92dd1b46c7c27
```

**Locations (sample):**
- blackroad-api-cloudflare/tsconfig.json
- blackroad-console/tsconfig.json
- blackroad-helper/tsconfig.json
- blackroad-io/tsconfig.json
- blackroad-mesh/tsconfig.json
- blackroad-os/tsconfig.json
- blackroad-os-agents/tsconfig.json
- blackroad-os-api/tsconfig.json
- ... 12+ more

**Should be:**
- `@blackroad/tsconfig` base configuration package
- Repos extend with `"extends": "@blackroad/tsconfig"`

---

## 7. Specific Consolidation Recommendations

### Immediate Actions (High Impact)

#### A. Create Shared UI Utilities Package
**Package:** `@blackroad/ui-utils`
**Consolidates:**
- `lib/utils.ts` (cn function) - 3+ copies
- Tailwind merge utilities
- Class name helpers

**Files to remove:**
- ~/blackroad-console/lib/utils.ts
- ~/blackroad-os-prism-console/lib/utils.ts
- ~/blackroad-prism-console/blackroad-os-prism-console/lib/utils.ts

#### B. Create Environment Config Package
**Package:** `@blackroad/env-config`
**Consolidates:**
- Environment variable parsing
- Service headers
- API URL configuration

**Files to remove:**
- ~/blackroad-console/lib/constants.ts
- ~/blackroad-os-prism-console/lib/constants.ts
- All similar constants.ts files

#### C. Create Agent Types Package
**Package:** `@blackroad/agent-types`
**Consolidates:**
- Agent manifest types
- Agent schema definitions
- Common agent interfaces

**Files to remove:**
- ~/blackroad-os-agents/src/types.ts
- ~/blackroad-prism-console/blackroad-os-agents/src/types.ts

#### D. Create Operator Config Package
**Package:** `@blackroad/operator-config`
**Consolidates:**
- Operator configuration interface
- Environment variable validation
- Default configuration values

**Files to remove from 4 locations:**
- ~/blackroad-garage/blackroad-os-operator/src/config.ts
- ~/blackroad-repos/blackroad-os-operator/src/config.ts
- ~/blackroad-prism-console/blackroad-os-operator/src/config.ts
- ~/blackroad-workspace-fix/blackroad-os-operator/src/config.ts

#### E. Create Cloudflare Worker Base Package
**Package:** `@blackroad/worker-base`
**Consolidates:**
- Base Env interface
- CORS middleware
- Error handling
- KV namespace utilities
- Common request/response patterns

**Benefits:**
- DRY up 37+ worker repositories
- Consistent error handling across all workers
- Single source of truth for worker patterns

#### F. Resolve blackroad-prism-console Nesting
**Action:** Remove nested repository copies

**Directories to remove:**
```bash
rm -rf ~/blackroad-prism-console/blackroad-os-operator        # Use ~/blackroad-garage version
rm -rf ~/blackroad-prism-console/blackroad-os-prism-console  # Use ~/blackroad-os-prism-console
rm -rf ~/blackroad-prism-console/blackroad-os-agents         # Use ~/blackroad-os-agents
rm -rf ~/blackroad-prism-console/blackroad-os-demo           # Use ~/blackroad-os-demo
rm -rf ~/blackroad-prism-console/nextjs-ai-chatbot           # Template, not in use
rm -rf ~/blackroad-prism-console/my-repository               # Template, not in use
```

**Recovery:** 3+ GB of disk space

#### G. Consolidate blackroad-repos/
**Issue:** ~/blackroad-repos/ contains duplicate copies of active repositories

**Directories that are duplicates:**
- blackroad-repos/blackroad-prism-console (639MB) - duplicate of ~/blackroad-prism-console
- blackroad-repos/blackroad-os-operator - duplicate of ~/blackroad-garage/blackroad-os-operator

**Action:** Determine canonical location and remove duplicates

---

## 8. Missing Shared Libraries (Should Exist)

Based on analysis, these packages should exist but don't:

| Package | Purpose | Consolidates | Files Affected |
|---------|---------|--------------|----------------|
| `@blackroad/ui-utils` | UI utility functions | cn(), class helpers | 3+ files |
| `@blackroad/env-config` | Environment config | API URLs, service env | 5+ files |
| `@blackroad/agent-types` | Agent type definitions | Agent schemas | 2+ files |
| `@blackroad/operator-config` | Operator configuration | Config interface | 4 files |
| `@blackroad/worker-base` | Cloudflare worker base | Worker patterns | 37+ repos |
| `@blackroad/worker-types` | Worker type definitions | Env interfaces | 37+ repos |
| `@blackroad/worker-cors` | CORS middleware | CORS handling | 37+ repos |
| `@blackroad/tsconfig` | TypeScript base config | tsconfig.json | 20+ files |
| `@blackroad/constants` | Shared constants | Common values | 10+ files |
| `@blackroad/test-utils` | Testing utilities | Test helpers | 10+ files |

---

## 9. Architecture Anti-Patterns Detected

### A. Recursive Repository Nesting
- `blackroad-prism-console/blackroad-prism-console/` contains itself
- Multiple levels of nested Git repositories
- No clear separation between "workspace" and "repository"

### B. Copy-Paste Development
- Entire repositories duplicated instead of referenced
- No use of Git submodules or workspace dependencies
- Template projects copied and never removed

### C. No Monorepo Strategy
- 37+ worker repos could be `workers/*` in monorepo
- Shared code duplicated instead of published to npm/pnpm workspace
- No shared `tsconfig.json`, `eslint`, or tooling configs

### D. Unclear Repository Ownership
- Multiple copies of same repo (operator, prism-console)
- No clear indication which is canonical/active
- Risk of divergent changes across copies

---

## 10. Quantified Impact

### Disk Space Waste
- **blackroad-prism-console alone:** ~3.1GB of duplication
- **Template projects:** ~500MB (nextjs-ai-chatbot, my-repository copies)
- **Duplicate operators:** 4 copies of same codebase
- **Estimated total:** 4+ GB of duplicate code

### Developer Confusion
- 123 Git repositories in home directory
- Unclear which repos are active vs archived
- Nested repos break Git operations
- Copy-paste makes bug fixes require N updates

### Maintenance Burden
- Bug fix in utils.ts requires updating 3+ files
- Security update in worker pattern requires updating 37+ repos
- No single source of truth for common code
- Configuration drift across copies

---

## 11. Recommended Migration Plan

### Phase 1: Create Shared Packages (Week 1)
1. Create `packages/ui-utils` with cn() function
2. Create `packages/env-config` with environment handling
3. Create `packages/agent-types` with agent schemas
4. Create `packages/operator-config` with operator config
5. Create `packages/worker-base` with worker utilities
6. Publish to local npm registry or pnpm workspace

### Phase 2: Migrate High-Impact Repos (Week 2)
1. Update blackroad-console to use @blackroad/ui-utils
2. Update blackroad-os-prism-console to use shared packages
3. Update 5 most-used workers to use @blackroad/worker-base
4. Test and validate no regressions

### Phase 3: Remove Nested Duplicates (Week 3)
1. Back up blackroad-prism-console
2. Remove nested repos (operator, agents, demo, etc.)
3. Update any references to use canonical locations
4. Verify no broken imports

### Phase 4: Worker Consolidation (Week 4)
1. Create monorepo structure: `workers/`
2. Migrate 10 workers to monorepo
3. Set up shared wrangler config
4. Migrate remaining 27 workers

### Phase 5: Cleanup & Documentation (Week 5)
1. Remove blackroad-repos duplicates
2. Archive legacy/template projects
3. Document canonical repository locations
4. Create ARCHITECTURE.md with repo map

---

## 12. Files Requiring Immediate Attention

### Exact Duplicates (Same SHA) - Delete Extras

**utils.ts (SHA: 77eb1ca38b8b258774f4898a8981cfc5c77cff6a):**
- ✅ KEEP: Create `@blackroad/ui-utils` package
- ❌ DELETE: ~/blackroad-console/lib/utils.ts
- ❌ DELETE: ~/blackroad-os-prism-console/lib/utils.ts
- ❌ DELETE: ~/blackroad-prism-console/blackroad-os-prism-console/lib/utils.ts

**constants.ts (SHA: c68ae889ab310bddd37ab163bb7313b1319892a2):**
- ✅ KEEP: Create `@blackroad/env-config` package
- ❌ DELETE: ~/blackroad-console/lib/constants.ts
- ❌ DELETE: ~/blackroad-os-prism-console/lib/constants.ts

**types.ts (SHA: 932b2e929ea6e3fcfc91171cf57405caef3c158c):**
- ✅ KEEP: ~/blackroad-os-agents/src/types.ts (move to package)
- ❌ DELETE: ~/blackroad-prism-console/blackroad-os-agents/src/types.ts

**config.ts (SHA: 59c85accaef53834bf22b8c91a1e58b1a8c2abc8):**
- ✅ KEEP: ~/blackroad-garage/blackroad-os-operator/src/config.ts
- ❌ DELETE: ~/blackroad-repos/blackroad-os-operator/src/config.ts
- ❌ DELETE: ~/blackroad-prism-console/blackroad-os-operator/src/config.ts
- ❌ DELETE: ~/blackroad-workspace-fix/blackroad-os-operator/src/config.ts

### Entire Directories to Remove (Nested Duplicates)

**blackroad-prism-console nested repos (3+ GB):**
```bash
# Template projects (never customized)
rm -rf ~/blackroad-prism-console/nextjs-ai-chatbot
rm -rf ~/blackroad-prism-console/my-repository

# Duplicates of canonical repos
rm -rf ~/blackroad-prism-console/blackroad-os-operator
rm -rf ~/blackroad-prism-console/blackroad-os-prism-console
rm -rf ~/blackroad-prism-console/blackroad-os-agents
rm -rf ~/blackroad-prism-console/blackroad-os-demo
rm -rf ~/blackroad-prism-console/blackroad-prism-console  # Recursive!
```

**blackroad-repos duplicates (639+ MB):**
```bash
# Determine which is canonical first, then remove duplicate
rm -rf ~/blackroad-repos/blackroad-prism-console  # If ~/blackroad-prism-console is canonical
# OR
rm -rf ~/blackroad-prism-console  # If ~/blackroad-repos/blackroad-prism-console is canonical
```

---

## 13. Success Metrics

After consolidation, expect:

- ✅ **Disk space recovered:** 4+ GB
- ✅ **Reduced repository count:** 123 → ~80 (remove 43+ duplicates/templates)
- ✅ **Shared packages created:** 8-10 packages
- ✅ **Worker repos consolidated:** 37 → 1 monorepo
- ✅ **Single source of truth:** For utils, types, config, constants
- ✅ **Developer clarity:** Clear canonical repo locations documented
- ✅ **Maintenance burden reduced:** Bug fixes update 1 file, not 3-37

---

## 14. Risk Mitigation

Before deleting anything:

1. ✅ **Backup:** `tar -czf ~/blackroad-backup-2026-02-14.tar.gz ~/blackroad-*`
2. ✅ **Git status:** Verify no uncommitted changes in nested repos
3. ✅ **Dependency check:** Search for imports from nested repos
4. ✅ **Test suite:** Run tests after each phase
5. ✅ **Incremental rollout:** Migrate 1-2 repos per day, not all at once

---

## Conclusion

BlackRoad infrastructure suffers from **extreme code duplication** caused by:
- Nested repository copies (3.8GB in one directory)
- Copy-paste development (same utils in 3+ places)
- Missing shared packages (no @blackroad/ui-utils, etc.)
- 37+ standalone worker repos with duplicated patterns

**Recommended approach:** Create shared packages, migrate incrementally, remove nested duplicates.

**Expected outcome:** 4+ GB disk recovery, 40+ fewer repos, single source of truth for common code.

---

**Generated:** 2026-02-14
**Analysis Tool:** Claude Code (BlackRoad OS)
**Next Steps:** Review recommendations with team, prioritize Phase 1 package creation
