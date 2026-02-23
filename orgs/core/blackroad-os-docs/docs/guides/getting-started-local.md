---
id: guides-getting-started-local
title: "Getting Started - Local Development"
slug: /guides/getting-started-local
description: "Set up BlackRoad OS for local development"
tags: ["guides", "getting-started", "local"]
status: stable
---

# Getting Started - Local Development

This guide walks you through setting up BlackRoad OS services for local development.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ installed ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Git** for cloning repositories
- **Docker** (optional, for Redis/PostgreSQL)
- **PostgreSQL** 14+ (local or Docker)
- **Redis** 6+ (local or Docker)

## Quick Start

### 1. Clone Repositories

Start with the core services:

```bash
# Create a workspace directory
mkdir blackroad-os && cd blackroad-os

# Clone core repositories
git clone https://github.com/BlackRoad-OS/blackroad-os-core.git
git clone https://github.com/BlackRoad-OS/blackroad-os-api.git
git clone https://github.com/BlackRoad-OS/blackroad-os-operator.git
git clone https://github.com/BlackRoad-OS/blackroad-os-web.git
```

### 2. Set Up Database

Using Docker:

```bash
# Start PostgreSQL
docker run -d \
  --name blackroad-postgres \
  -e POSTGRES_PASSWORD=devpassword \
  -e POSTGRES_DB=blackroad_dev \
  -p 5432:5432 \
  postgres:14

# Start Redis
docker run -d \
  --name blackroad-redis \
  -p 6379:6379 \
  redis:latest
```

Or install locally per your OS instructions.

### 3. Configure Services

#### API Service

```bash
cd blackroad-os-api
npm install
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL=postgresql://postgres:devpassword@localhost:5432/blackroad_dev
REDIS_URL=redis://localhost:6379
API_PORT=3000
JWT_SECRET=local-dev-secret-change-me
OPERATOR_URL=http://localhost:3001
```

Run migrations:
```bash
npm run migrate
```

#### Operator Service

```bash
cd ../blackroad-os-operator
npm install
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL=postgresql://postgres:devpassword@localhost:5432/blackroad_dev
REDIS_URL=redis://localhost:6379
OPERATOR_PORT=3001
WORKER_CONCURRENCY=2
```

#### Web Service

```bash
cd ../blackroad-os-web
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 4. Start Services

Open separate terminal windows for each service:

**Terminal 1 - API:**
```bash
cd blackroad-os-api
npm run dev
```

**Terminal 2 - Operator:**
```bash
cd blackroad-os-operator
npm run dev
```

**Terminal 3 - Web:**
```bash
cd blackroad-os-web
npm run dev
```

### 5. Verify Setup

- **API:** http://localhost:3000/health
- **Operator:** http://localhost:3001/health
- **Web:** http://localhost:3030 (or configured port)

## Development Workflow

### Making Changes

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Build: `npm run build`
6. Commit and push

### Running Tests

```bash
# In any service directory
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Database Migrations

When schema changes are needed:

```bash
# Create migration
npm run migrate:create my-migration-name

# Run migrations
npm run migrate

# Rollback
npm run migrate:rollback
```

## Troubleshooting

### Database Connection Failed

- Verify PostgreSQL is running: `docker ps | grep postgres`
- Check connection string in `.env`
- Test connection: `psql postgresql://postgres:devpassword@localhost:5432/blackroad_dev`

### Redis Connection Failed

- Verify Redis is running: `docker ps | grep redis`
- Test connection: `redis-cli ping` (should return `PONG`)

### Port Already in Use

Change ports in `.env` files:
```bash
API_PORT=3010
OPERATOR_PORT=3011
# etc.
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- [Extending Agents](dev/extending-agents.md) - Create custom agents
- [API Overview](dev/API_OVERVIEW.md) - Understand API structure
- [Contributing Guide](guides/contributing.md)
- [Coding Standards](guides/coding-standards.md) _(planned)_

## See Also

- [Repositories and Services](dev/repos-and-services.md) - Complete repo map
- [Local Development](dev/local-development.md) - Additional dev info
- [Stack Map](../overview/STACK_MAP.md) - Architecture overview
