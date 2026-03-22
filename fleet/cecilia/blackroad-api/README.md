# blackroad-api

> REST API server for BlackRoad OS — OpenAPI spec, route handlers, and middleware.

[![CI](https://github.com/BlackRoad-OS-Inc/blackroad-api/actions/workflows/ci.yml/badge.svg)](https://github.com/BlackRoad-OS-Inc/blackroad-api/actions/workflows/ci.yml)

## Overview

The primary REST API for BlackRoad OS. All client applications (web, CLI, mobile) communicate through this API.

## Structure

```
blackroad-api/
├── src/
│   ├── routes/         # API route handlers
│   ├── middleware/     # Auth, rate limiting, logging
│   ├── models/         # Data models & schemas
│   └── services/       # Business logic services
├── openapi.yaml        # OpenAPI 3.1 spec
├── test/               # Tests
└── .env.example
```

## Quick Start

```bash
npm install
npm run dev        # Dev server at http://localhost:3001
npm test           # Run tests
```

## API Docs

OpenAPI spec: `openapi.yaml`
Swagger UI available at `/docs` in development.

## Authentication

Bearer token authentication. All endpoints require `Authorization: Bearer <token>`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

© BlackRoad OS, Inc. — All rights reserved. Proprietary.
