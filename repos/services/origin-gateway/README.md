# Origin Campus Gateway

Authoritative API gateway for the Origin Campus experience. The service manages
visitor sessions, queues QLM pedestal jobs, records artifact manifests, and
streams campus state updates to Unity/Unreal clients via WebSockets.

## Features

- Fastify-based REST API with JSON schema validation via Zod.
- WebSocket broadcast channel for real-time campus updates.
- Database schema designed for the session registry, artifact ledger, parcel
  claims, and append-only evidence log.
- Hardened defaults: sensible error handling, CORS, Helmet, structured logging.

## Local Development

```bash
cd services/origin-gateway
npm install
npm run dev
```

The development server listens on `http://localhost:8080` by default. WebSocket
clients connect to `ws://localhost:8080/ws` after authenticating through the
REST API.

## Environment Variables

| Name                  | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `PORT`                | Port to bind the HTTP/WebSocket server (default `8080`).    |
| `DATABASE_URL`        | PostgreSQL connection string for persistent state.          |
| `EVIDENCE_STREAM_URL` | Optional endpoint for forwarding append-only evidence logs. |

## NPM Scripts

- `npm run dev` – Start the gateway in watch mode.
- `npm run build` – Compile TypeScript into `dist/`.
- `npm run start` – Launch the compiled JavaScript bundle.
- `npm run lint` – Run ESLint on the source tree.
- `npm test` – Placeholder for future Vitest coverage.

## Project Layout

```
src/
  api.ts       # REST routes and JSON schema definitions
  ws.ts        # WebSocket registration and broadcast helper
  config.ts    # Runtime environment validation via Zod
  index.ts     # Service bootstrap and plugin wiring
db/schema.sql # Canonical Postgres schema for Slice A
```
