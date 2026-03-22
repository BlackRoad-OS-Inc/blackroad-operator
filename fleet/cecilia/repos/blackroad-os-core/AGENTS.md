# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with pnpm/turbo. Apps live in `apps/` (`web` Next.js, `desktop` Tauri shell, `prism-portal`); shared packages in `packages/` (`ui`, `sdk-ts`, `sdk-py`, `config`); backend/api + orchestration in `src/` (Hono API under `src/api`, agent services under `src/agent-orchestration`, `src/agents`), plus common helpers in `lib/`.
- Tooling/scripts in `scripts/`, infra/config in `prisma/`, and ops docs in `docs/`, `domains/`, `policy/`. Use `pnpm --filter <target>` to scope work.

## Build, Test, and Development Commands
- Install deps: `pnpm install` (pnpm 8). Run targets: `pnpm dev --filter web|desktop|prism-portal` or all via `pnpm turbo dev`.
- API server: `pnpm dev:api` (port 4000; smoke with `curl http://localhost:4000/health`).
- Quality gates: `pnpm lint`, `pnpm test` (Vitest), `pnpm build`; coverage via `pnpm test -- --coverage`.
- Prisma/data: `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`. Python SDK: `pip install -e packages/sdk-py` and run its tests when touching `blackroad_core`.

## Coding Style & Naming Conventions
- TypeScript/JavaScript: ES2022, aliases from `packages/config/tsconfig.base.json` (`@blackroad/*`, `@/trpc/*`); prefer `async/await` and typed responses. ESLint recommended + Prettier defaults; keep imports ordered and avoid stray logging.
- Python: type hints, Pydantic for IO, snake_case modules, PascalCase classes, SCREAMING_SNAKE env keys.
- Naming: `camelCase` vars/functions, `PascalCase` components/classes, hyphenated branch names (`feat/`, `fix/`). Use `.env.*` for config; never hardcode secrets.

## Testing Guidelines
- Vitest looks for `tests/**/*.test.ts`; mirror source paths (e.g., `tests/apps/web/auth.test.ts`, `tests/packages/ui/button.test.ts`). Mock external calls (Stripe, Redis, Cloudflare) and fixture Prisma data.
- For API changes, cover health + error paths; for UI, add snapshot/interaction tests when behavior shifts.
- Python SDK tests live in `packages/sdk-py/tests`; mirror new modules and avoid hitting live endpoints.

## Commit & Pull Request Guidelines
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`); short scope, emojis optional.
- PRs: summary of behavior, linked issue/ticket, test commands executed, screenshots for UI changes (web/desktop/prism-portal), and explicit notes for new env vars, Prisma migrations, or breaking API changes. Respect `CODEOWNERS`.

## Security & Configuration Tips
- Use `.env.template` as the baseline; never commit real tokens (`.env.*`, `.wrangler`, Stripe/Clerk keys). Rotate via platform secrets (Railway/Cloudflare) instead of embedding.
- Validate and sanitize all inputs at API edges; avoid logging PII or full payloads. For agent/orchestrator code, gate external calls with allowlists/timeouts and prefer idempotent handlers.
- Before requesting review, run `pnpm lint && pnpm test` (plus `pnpm build` when touching shared packages) and a quick API smoke (`pnpm dev:api`, then `curl /health`).
