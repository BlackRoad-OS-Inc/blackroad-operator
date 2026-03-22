# Decisions

- Implemented a minimal `br-fix` CLI under `srv/blackroad-tools/br-fix` handling scan, apply, and test commands.
- Backup during `br-fix apply` only captures `src/routes/json.js` to keep repository footprint small.
- Added ETag generation to `/api/json/health` response for cache friendliness.
- Request the next simulation upgrade to replace the shallow-water fallback with the full PySPH settling column tied to the existing output filenames.
- Adopted the ESLint flat-config workflow (`eslint.config.mjs`) and intentionally pinned the supporting devDependencies (`eslint`, `@eslint/js`, `eslint-config-prettier`) directly in the root `package.json` so that `ops/install.sh` and `node tools/dep-scan.js --dir <api>` continue to hydrate them automatically during installs.
