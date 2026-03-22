# Current Runbook

This runbook reflects the paths verified in the local workspace on 2026-03-17.

## Verified Working Paths

### API

Run from the repo root:

```bash
npm run dev
```

What was verified:

- Starts the root API from `server_full.js`
- Binds successfully on the configured port
- Local probe succeeded with `PORT=4100`

Notes:

- The server warns when `SESSION_SECRET` is left at the default value.
- A deprecation warning from `url.parse()` appears under Node `v25.6.1`, but the server still starts.

### Frontend

Run from the repo root:

```bash
npm run frontend:dev
```

Build from the repo root:

```bash
npm run frontend:build
```

What was verified:

- `npm run frontend:build` completed successfully
- Output was written under `frontend/dist`

Notes:

- The current build reports a large JS chunk warning, but does not fail.

### Site App

Run from the repo root:

```bash
npm run site:dev
```

What was verified:

- `npm run site:dev` starts successfully on `http://127.0.0.1:5173/`

Build from the repo root:

```bash
npm run site:build
```

What was verified:

- `npm run site:build` completed successfully
- The fix was to add the required codex prompt frontmatter fields to:
  - `sites/blackroad/content/codex/phase-13.md`
  - `sites/blackroad/content/codex/phase-14.md`
  - `sites/blackroad/content/codex/phase-15.md`
  - `sites/blackroad/content/codex/phase-16.md`

### `services/api`

Run from the service directory:

```bash
cd /Users/alexa/blackroad-os-prism-enterprise/services/api
npm install
npm run dev
```

What was verified:

- `npm install` completed successfully and regenerated a valid local lockfile state
- A local boot probe succeeded with `PORT=4101`
- The service attached its collab, GitHub webhook, and voice signaling modules before listening

Fixes applied:

- Installed local dependencies under `services/api/node_modules`
- Updated `telemetry.mjs` to tolerate synchronous or promise-returning OpenTelemetry startup
- Converted the module files under `services/api/modules/` to ESM exports so they match the package's `"type": "module"`

## Not Currently Verified

### `srv/blackroad-api`

Treat this as legacy or partial until cleaned up.

Reasons:

- `srv/blackroad-api/package.json` does not define `dev` or `start`
- The root README previously pointed here for development, but that does not match the current package scripts

Historical issue that was fixed in `services/api`:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@opentelemetry/sdk-node'
```

## Recommended Local Workflow

For the lowest-friction setup:

```bash
cd /Users/alexa/blackroad-os-prism-enterprise
npm run dev
```

In a second terminal:

```bash
cd /Users/alexa/blackroad-os-prism-enterprise
npm run frontend:dev
```

If you specifically need the content/site app instead of `frontend`:

```bash
cd /Users/alexa/blackroad-os-prism-enterprise
npm run site:dev
```
