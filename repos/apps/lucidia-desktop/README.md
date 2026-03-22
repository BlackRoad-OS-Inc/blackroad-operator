# Lucidia Desktop

Lucidia Desktop is a local-first Tauri application that brings the
Lucidia agent stack, codex memory, and task orchestration tools to the
desktop. Shared types and IPC schemas live under `src/shared`, React UI
components under `src/ui`, and the Tauri backend under `src/tauri/`.

## Getting Started

```bash
pnpm install
pnpm dev
```

The development server runs Vite alongside the Tauri shell so that UI
updates hot-reload while native commands are available.

To launch the full Tauri shell during development run:

```bash
pnpm tauri dev
```

## Scripts

- `pnpm dev` – start Vite with the Tauri shell in development mode.
- `pnpm build` – build the React frontend assets.
- `pnpm tauri build` – produce platform installers.
- `pnpm test` – run Vitest unit tests.
- `pnpm lint` – run ESLint across the project.
- `pnpm build-storybook` – build the Storybook component catalogue.

## Testing

```bash
pnpm test       # Vitest unit tests
pnpm lint       # ESLint
pnpm build-storybook
pnpm tauri build
```

## Project Structure

- `src/shared` – shared TypeScript types, constants, and IPC schemas.
- `src/ui` – React application code, hooks, and component primitives.
- `src/tauri` – Rust source for the Tauri process and command handlers.
- `tests` – unit and end-to-end suites.
- `.storybook` – Storybook configuration.

## Security & Privacy

Lucidia Desktop favours local-first defaults. IPC payloads are validated
with shared Zod schemas, markdown rendering is sanitised, and secure
storage routes through the OS keychain (with Stronghold-compatible
fallbacks). Secrets never touch plaintext files.

## Contributing

1. Fork the repository and create a feature branch.
2. Install dependencies with `pnpm install` from the monorepo root.
3. Make changes covered by tests.
4. Run `pnpm lint` and `pnpm test` before submitting a pull request.
5. Update [`CHANGELOG.md`](./CHANGELOG.md) with user-visible changes.
