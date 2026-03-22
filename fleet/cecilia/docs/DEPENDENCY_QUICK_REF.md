# BlackRoad Dependency Quick Reference

## 🎯 At a Glance

```
87 total packages | 16 @blackroad/* scoped | 2 core | 10 leaf | 55 version conflicts
```

## 🏗️ Architecture

```
@blackroad/shared (CORE) ━━━┳━━━ @blackroad/api
                            ┣━━━ @blackroad/auth
                            ┣━━━ @blackroad/billing
                            ┣━━━ @blackroad/analytics
                            ┣━━━ @blackroad/web
                            ┣━━━ @blackroad/ai-dashboard
                            ┣━━━ @blackroad/metaverse
                            ┣━━━ @blackroad/desktop-app
                            ┣━━━ @blackroad/vscode-extension
                            ┣━━━ @blackroad/agent-sdk
                            ╰━━━ @blackroad/shared (⚠️ CIRCULAR)

@blackroad/types (CORE)  ━━━┳━━━ @blackroad/agent-sdk
                            ╰━━━ @blackroad/web
```

## ⚠️ Critical Issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Self-reference in @blackroad/shared | 🔴 High | Remove `"@blackroad/shared": "workspace:*"` from deps |
| Missing package.json for @blackroad/types | 🔴 High | Create `/packages/types/package.json` |
| 55 version inconsistencies | 🟡 Medium | Use pnpm workspace catalog |
| 5% test coverage | 🟡 Medium | Add vitest to all packages |

## 📦 Package Inventory

### Monorepo (`blackroad-os-monorepo/`)
```
packages/
├── shared/          ⭐ Core (11 dependents)
├── types/           ⭐ Core (2 dependents) ⚠️ No package.json
├── agent-sdk/       🍃 Leaf
├── api-sdks/        📦 Standalone
├── config/          📦 Standalone
├── templates/       📦 Standalone
└── ui/              📦 Standalone

apps/
├── web/             🍃 Leaf
├── ai-dashboard/    🍃 Leaf
├── metaverse/       🍃 Leaf
├── app-store/       📦 Standalone
└── apps/            📦 Standalone (roadmap, roadside, roadview, roadwork)

services/
├── api/             🍃 Leaf
├── auth/            🍃 Leaf
├── billing/         🍃 Leaf
└── analytics/       🍃 Leaf

tooling/
├── desktop-app/     🍃 Leaf
└── vscode-extension/ 🍃 Leaf
```

### Standalone Repos (69)
- `blackroad-sdk/` (@blackroad/sdk)
- `blackroad-react-components/` (@blackroad/react-components)
- `blackroad-io/`
- `blackroad-api-cloudflare/`
- ... 65 more

## 🔧 Common Commands

```bash
# Find all package.json files
find ~/blackroad-* ~/blackroad-os-* -name "package.json" -maxdepth 2

# Check for @blackroad dependencies
grep -r "@blackroad" ~/blackroad-*/package.json ~/blackroad-os-*/package.json

# List monorepo workspace packages
ls -d ~/blackroad-os-monorepo/{apps,services,packages,tooling}/*

# Check version of a dependency across all packages
for pkg in ~/blackroad-*/package.json; do
  echo "$pkg: $(jq -r '.dependencies.typescript // .devDependencies.typescript // "none"' "$pkg")"
done
```

## 📊 Version Standards (Recommended)

| Package | Version | Usage |
|---------|---------|-------|
| typescript | `^5.3.3` | 57 repos |
| @types/node | `^20.12.12` | 45 repos |
| @types/react | `^18.3.12` | 22 repos |
| react | `^18.3.1` | 27 repos |
| react-dom | `^18.3.1` | 26 repos |
| next | `^14.2.0` | 20 repos |
| vitest | `^1.3.1` | 16 repos |
| prettier | `^3.2.5` | 28 repos |
| eslint | `^8.57.0` | 31 repos |
| tailwindcss | `^3.4.14` | 15 repos |

## 🚀 Quick Fixes

### Fix Circular Dependency
```bash
cd ~/blackroad-os-monorepo/packages/shared
# Edit package.json and remove "@blackroad/shared": "workspace:*"
```

### Create Missing package.json
```bash
cat > ~/blackroad-os-monorepo/packages/types/package.json << 'EOF'
{
  "name": "@blackroad/types",
  "version": "1.0.0",
  "description": "Shared TypeScript type definitions",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
EOF
```

### Create Workspace Catalog
```bash
cat >> ~/blackroad-os-monorepo/pnpm-workspace.yaml << 'EOF'

catalog:
  typescript: ^5.3.3
  '@types/node': ^20.12.12
  '@types/react': ^18.3.12
  react: ^18.3.1
  next: ^14.2.0
  vitest: ^1.3.1
EOF
```

## 📈 Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Circular Dependencies | 1 | 0 |
| Version Conflicts | 55 | <10 |
| Test Coverage | 5% | 80% |
| Packages with Build | 66% | 100% |
| Packages with Tests | 5% | 100% |

## 🎯 Priority Order

1. ✅ **Fix circular dependency** (5 min)
2. ✅ **Create @blackroad/types package.json** (5 min)
3. 🔄 **Set up workspace catalog** (30 min)
4. 🔄 **Standardize core dependencies** (2 hours)
5. 🔄 **Add tests to all packages** (1 week)
6. 🔄 **Set up Renovate** (1 day)

## 📝 Notes

- No true circular dependencies beyond the self-reference
- Hub-and-spoke pattern is healthy
- @blackroad/shared is the most critical package
- Most packages are TypeScript-based
- Monorepo uses pnpm workspaces with Turbo

## 🔗 Related Docs

- Full analysis: `~/BLACKROAD_DEPENDENCY_MAP.md`
- Monorepo: `~/blackroad-os-monorepo/`
- Package governance: `~/blackroad-os-monorepo/docs/PACKAGE_GOVERNANCE.md` (TODO)

---

**Last Updated:** 2026-02-14
