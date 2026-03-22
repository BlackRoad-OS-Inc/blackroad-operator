# Repository Guidelines

## Session Start (required)
- Run `./scripts/memory.sh start` when `.blackroad os/memory.enabled` exists to capture a session brief.

## Project Structure & Module Organization
- `infra/blackroad_registry.json` is the canonical registry for the 24 services and their domains.
- `templates/web-service/` holds the standard Next.js 14 + TypeScript template used to create new services.
- `services/<service>/` contains each deployed app; UI routes live in `app/` and API handlers in `app/api/`.
- `DEPLOYMENT_GUIDE.md` documents Railway/Cloudflare deployment and DNS wiring.

## Build, Test, and Development Commands
Use Node.js 20+ and run commands from the service you are working on.

```bash
cd services/web
npm install
npm run dev
```

- `npm run dev` starts the local Next.js server (web: 3000, prism: 3001, operator: 3002).
- `npm run build` generates a production build.
- `npm run start` runs the built Next.js server.
- `npm run lint` runs ESLint using `eslint.config.mjs`.
- `npm run type-check` runs TypeScript checks.
- `npm start` at repo root runs `blackroad-dashboard-server.js` when you need the dashboard.

## Coding Style & Naming Conventions
- Follow existing service code style: 2-space indentation, single quotes, and no semicolons in `services/*/app`.
- Keep services lowercase and short (for example, `services/prism`), and package names use `blackroad-os-<service>`.
- Prefer environment configuration via `.env` copied from `.env.example` in each service.

## Testing Guidelines
- No dedicated test runner is configured; rely on `npm run lint` and `npm run type-check`.
- If you add tests, use `*.test.ts(x)` near the module or in `app/__tests__/`.

## Commit & Pull Request Guidelines
- No `.git` history is available in this workspace, so no commit convention is enforced; use concise, imperative messages (example: `services(web): add status banner`).
- PRs should describe the service affected, include run instructions, list config/env changes, and add screenshots for UI updates.

## Deployment & Configuration Tips
- Each service ships with `Dockerfile` and `railway.json`; keep them aligned with service changes.
- Use `DEPLOYMENT_GUIDE.md` for Cloudflare Pages and Railway deployment specifics.
