# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router source. The homepage lives at `app/page.tsx`, with shared layout in `app/layout.tsx`. API routes follow `app/api/<route>/route.ts` (for example `app/api/health/route.ts`, `app/api/ready/route.ts`, and `app/api/version/route.ts`). Root config files include `next.config.mjs`, `tsconfig.json`, `railway.json`, and `Dockerfile`. Local environment settings use `.env`, with `.env.example` as the template.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the Next.js dev server at `http://localhost:3000`.
- `npm run build` creates a production build; `npm start` serves it.
- `npm run lint` runs Next.js lint with the default rules.
- `npm run type-check` runs `tsc --noEmit` for strict TypeScript checks.

## Coding Style & Naming Conventions
This repo uses TypeScript + React with strict compiler settings in `tsconfig.json`. Keep formatting consistent with existing files (2-space indentation in JSON). Follow App Router naming (`page.tsx`, `layout.tsx`, `route.ts` inside route folders). The `@/` path alias maps to the repository root.

## Testing Guidelines
No test framework or test scripts are configured. If you add tests, introduce a `test` script in `package.json`, document the runner, and keep file naming consistent with that framework.

## Commit & Pull Request Guidelines
Use Conventional Commits for all changes (for example, `feat: add readiness endpoint` or `fix: correct health payload`). PRs must link to the relevant issue, include a changelog entry describing user-visible changes in `CHANGELOG.md`, a `changes/` entry, or release notes tooling, and attach screenshots for UI updates. Keep PR descriptions short and focused on intent and impact.

## Configuration & Deployment Notes
Copy `.env.example` to `.env` and set `SERVICE_NAME`, `SERVICE_ENV`, and `NEXT_PUBLIC_APP_NAME` before running locally. Standard health and readiness endpoints live at `/api/health`, `/api/ready`, and `/api/version`; deployment configs in `railway.json` and `Dockerfile` rely on them.
