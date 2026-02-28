// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { serve } from '@hono/node-server'
import { createApp } from './app.js'

const port = Number(process.env['PORT'] ?? 8080)
const hostname = process.env['HOST'] ?? '0.0.0.0'

const app = createApp()

console.log(`BlackRoad Operator API v0.1.0`)
console.log(`  Listening: http://${hostname}:${port}`)
console.log(`  Env:       ${process.env['NODE_ENV'] ?? 'development'}`)
console.log(`  Endpoints:`)
console.log(`    GET  /healthz               — liveness probe`)
console.log(`    GET  /readyz                — readiness probe`)
console.log(`    POST /v1/auth/token         — issue BRAT token`)
console.log(`    POST /v1/auth/verify        — verify token`)
console.log(`    GET  /v1/auth/me            — current identity`)
console.log(`    GET  /v1/agents             — list agents`)
console.log(`    POST /v1/agents/:name/invoke — invoke agent`)
console.log(`    GET  /v1/billing/plans      — pricing plans`)
console.log(`    GET  /v1/billing/usage      — usage metrics`)
console.log(`    POST /v1/gateway/invoke     — gateway proxy`)
console.log(`    GET  /v1/metrics            — request metrics`)

serve({ fetch: app.fetch, port, hostname })
