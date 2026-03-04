# Test Coverage Analysis — blackroad-operator

**Date:** 2026-03-04
**Repository:** BlackRoad-OS-Inc/blackroad-operator
**Analysis scope:** Original code only (excludes forked repos in orgs/enterprise/ and orgs/ai/blackroad-vllm)

---

## Executive Summary

The blackroad-operator repository has **minimal test coverage for its original code**. Of the 21 TypeScript source files in `src/`, only 4 have corresponding tests (19%). Critical subsystems — the gateway server, auth library, MCP bridge, Ollama wrapper, CLI commands, and 57+ shell scripts — are either untested or have only basic coverage. The CI pipeline itself uses `continue-on-error: true` on test steps, meaning test failures don't block merges.

---

## Current Test Inventory

### TypeScript CLI (`src/` — Vitest)

| Source File | Test File | Status |
|---|---|---|
| `src/core/client.ts` | `test/core/client.test.ts` | **Tested** (4 tests) |
| `src/core/config.ts` | `test/core/config.test.ts` | **Tested** (1 test) |
| `src/formatters/brand.ts` | `test/formatters/brand.test.ts` | **Tested** (3 tests) |
| `src/formatters/table.ts` | `test/formatters/table.test.ts` | **Tested** (3 tests) |
| `src/core/logger.ts` | — | **No tests** |
| `src/core/spinner.ts` | — | **No tests** |
| `src/formatters/json.ts` | — | **No tests** |
| `src/cli/commands/agents.ts` | — | **No tests** |
| `src/cli/commands/config.ts` | — | **No tests** |
| `src/cli/commands/deploy.ts` | — | **No tests** |
| `src/cli/commands/gateway.ts` | — | **No tests** |
| `src/cli/commands/init.ts` | — | **No tests** |
| `src/cli/commands/invoke.ts` | — | **No tests** |
| `src/cli/commands/logs.ts` | — | **No tests** |
| `src/cli/commands/status.ts` | — | **No tests** |
| `src/cli/commands/index.ts` | — | **No tests** |
| `src/bootstrap/preflight.ts` | — | **No tests** |
| `src/bootstrap/setup.ts` | — | **No tests** |
| `src/bootstrap/templates.ts` | — | **No tests** |
| `src/bin/br.ts` | — | **No tests** |
| `src/index.ts` | — | **No tests** |

**Coverage: 4/21 files (19%), ~11 total test assertions**

### Gateway Server (`blackroad-core/` — Custom runner)

| Tested Function | Coverage Quality |
|---|---|
| `validateRequest()` | Good — 7 assertions covering all validation branches |
| `pickProvider()` | Good — 5 assertions covering priority, routes, fallback |
| `buildSystemPrompt()` | Good — 6 assertions covering composition |
| `RateLimiter` | Good — 7 assertions covering check/record/limit |
| `mergeConfig()` | Adequate — 3 assertions |
| `metrics` | Good — 7 assertions |
| Provider registry | Basic — existence checks only |
| Policy structure | Basic — schema validation |
| System prompts structure | Basic — schema validation |

**Not tested:**
- `invokeWithFallback()` — fallback chain logic, error aggregation
- `readBody()` — body size limits, stream errors
- `isLoopback()` — IP address matching
- `loadJson()` — file loading, error handling
- `readEnvConfig()` — environment variable parsing
- `appendLog()` — log file writing
- HTTP server routing and integration (healthz, metrics, /v1/agent, /v1/agents, /v1/worlds)
- Full request lifecycle (auth check → validation → rate limit → provider invocation → logging)

### Auth Library (`lib/auth/brat.js`)

**No tests at all.** This is a security-critical module containing:
- `mint()` — HMAC-SHA256 token generation
- `verify()` — Token signature verification with timing-safe comparison
- `verifyAsync()` — Cloudflare Workers Web Crypto verification
- `hasScope()` — Scope/wildcard matching
- `decode()` — Token inspection
- `generateKey()` — Key generation
- Base64url encoding/decoding helpers

### MCP Bridge (`mcp-bridge/server.py`)

**No tests.** This FastAPI server exposes:
- `/exec` — Arbitrary command execution (security-critical)
- `/file/read` and `/file/write` — File system access
- `/memory/write` and `/memory/read` — Persistent memory store
- Token-based authentication (`verify_token`)

### Ollama Wrapper (`ollama-wrapper/server.py`)

**No tests.** This FastAPI server includes:
- `/chat` — Chat endpoint with memory integration
- `/models` — Model listing
- `/health` — Health check
- `enhance_with_emojis()` — Text processing function

### Metaverse Modules (`orgs/core/blackroad-os-metaverse/tests/`)

4 test files using Node.js built-in test runner:
- `truth-contracts.test.js` — 6 tests (good coverage of the module)
- `dialogue-story.test.js` — tests present
- `module-loader.test.js` — tests present
- `quest-system.test.js` — tests present

**Not tested:** 20+ other metaverse modules (physics-engine, celestial-mechanics, particle-effects, etc.)

### Shell Scripts (57+ scripts)

**No unit/integration tests.** CI runs ShellCheck for syntax only (`continue-on-error: true`).

### Other Untested Code

| Component | Location | Risk |
|---|---|---|
| RoadChain blockchain | `carpool/treasury/roadchain/` (8 Python files) | Medium — financial logic |
| Conductor (MIDI orchestrator) | `conductor.py`, `conductor-ml.py` | Low |
| Dashboard hooks | `blackroad-os/apps/blackroad-dashboard/src/hooks/` | Medium |
| Cloudflare Workers | `blackroad-os/workers/`, `workers/` | Medium |
| Browser Extension | `extensions/road-wallet/` | Medium |
| CLI tools (Node.js) | `orgs/core/blackroad-cli/` | Medium |
| Deploy Orchestrator | `orgs/core/blackroad-os-deploy/orchestrator/` | High |
| BlackRoad OS game | `blackroad-os/game.js`, `blackroad-os/lib/` | Low |

---

## CI Pipeline Gaps

The current CI configuration (`.github/workflows/ci.yml`) has several issues:

1. **`continue-on-error: true`** on both shellcheck and test jobs — test failures never block PRs
2. **No coverage thresholds** — no minimum coverage enforcement
3. **No gateway tests in CI** — `blackroad-core/tests/gateway.test.js` is not executed
4. **No Python tests in CI** — MCP bridge and Ollama wrapper are not tested
5. **Node version mismatch** — CI uses Node 20, but `package.json` requires `>=22`

---

## Prioritized Recommendations

### Priority 1 — Security-Critical (BRAT Auth Library)

**File:** `lib/auth/brat.js`
**Effort:** ~2 hours
**Impact:** High — auth token handling must be correct

Tests to add:
- `mint()` produces valid token format (`BRAT_v1.<b64>.<b64>`)
- `verify()` accepts tokens minted with same key
- `verify()` rejects tokens with wrong key
- `verify()` rejects expired tokens
- `verify()` rejects malformed tokens (missing parts, bad header)
- `hasScope()` wildcard matching (`*`, `mesh:*`, exact match)
- `decode()` returns payload without verification
- `generateKey()` produces 64-char hex string
- Round-trip: mint → verify → check scope
- Timing-safe comparison actually prevents timing attacks

### Priority 2 — Gateway Server Integration Tests

**File:** `blackroad-core/tests/gateway.test.js`
**Effort:** ~3 hours
**Impact:** High — core request routing

Tests to add:
- `invokeWithFallback()` — primary success, primary fail + fallback success, all fail
- `isLoopback()` — IPv4, IPv6, IPv4-mapped IPv6
- `readBody()` — normal body, oversized body rejection
- HTTP integration: POST /v1/agent full lifecycle
- HTTP integration: GET /healthz, GET /metrics, GET /v1/agents
- Rate limiting end-to-end: requests beyond limit return 429
- Agent/intent validation returns appropriate 403s

### Priority 3 — CLI Command Tests

**Files:** `src/cli/commands/*.ts`
**Effort:** ~3 hours
**Impact:** Medium — user-facing CLI behavior

Tests to add (mock `GatewayClient`):
- `status` command outputs health + agent count
- `agents` command formats table output
- `agents --json` outputs raw JSON
- `invoke` command sends correct POST payload
- `config` command reads/writes config values
- `gateway url` outputs base URL
- `init` command handles name argument

### Priority 4 — Untested Core Modules

**Files:** `src/core/logger.ts`, `src/formatters/json.ts`
**Effort:** ~1 hour
**Impact:** Low-Medium

Tests to add:
- `logger.debug()` only outputs when `DEBUG` env is set
- `formatJson()` colorizes keys, strings, numbers, booleans, nulls correctly
- `GatewayClient.post()` sends correct headers and body (currently only `get()` is tested)

### Priority 5 — MCP Bridge Tests

**File:** `mcp-bridge/server.py`
**Effort:** ~2 hours
**Impact:** High — exposes command execution endpoint

Tests to add (using `httpx` + `pytest` + FastAPI TestClient):
- Authentication: valid token passes, invalid token returns 403
- `/exec` — runs command, returns stdout/stderr/returncode
- `/exec` — respects timeout
- `/file/read` — reads existing file, returns 404 for missing
- `/file/write` — writes file, returns SHA256
- `/memory/write` + `/memory/read` round-trip
- `/memory/list` returns stored keys

### Priority 6 — Ollama Wrapper Tests

**File:** `ollama-wrapper/server.py`
**Effort:** ~1.5 hours
**Impact:** Medium

Tests to add:
- `enhance_with_emojis()` — unit test the text processing
- `/health` — returns healthy/unhealthy based on Ollama availability
- `/chat` — mocked Ollama call returns expected response shape
- `/models` — proxies Ollama response

### Priority 7 — CI Pipeline Hardening

**File:** `.github/workflows/ci.yml`
**Effort:** ~1 hour
**Impact:** High — currently no test enforcement

Changes:
- Remove `continue-on-error: true` from test job
- Add gateway test step: `cd blackroad-core && node tests/gateway.test.js`
- Fix Node version to `22` (matching `package.json` engines)
- Add coverage reporting step with minimum threshold (e.g., 50%)
- Add BRAT auth test step when tests are created

### Priority 8 — Bootstrap Module Tests

**Files:** `src/bootstrap/preflight.ts`, `src/bootstrap/setup.ts`, `src/bootstrap/templates.ts`
**Effort:** ~1.5 hours
**Impact:** Medium

Tests to add:
- `runPreflight()` returns false for Node < 22
- `runPreflight()` warns when gateway unreachable
- `runSetup()` persists gateway URL to config
- `templates` array has expected structure

---

## Coverage Target Roadmap

| Milestone | Coverage | Key Additions |
|---|---|---|
| **Current** | ~19% of src/ (4/21 files) | — |
| **Phase 1** | ~60% of src/ | BRAT auth, gateway integration, CLI commands |
| **Phase 2** | ~80% of src/ | Logger, JSON formatter, bootstrap modules |
| **Phase 3** | Cross-project | MCP bridge, Ollama wrapper (Python pytest) |
| **Phase 4** | CI enforcement | Remove continue-on-error, add coverage gates |

---

## File Quick Reference

| Test Framework | Config Location | Command |
|---|---|---|
| Vitest (TypeScript) | `vitest.config.ts` | `npm test` |
| Custom (Gateway) | — | `node blackroad-core/tests/gateway.test.js` |
| Node test runner (Metaverse) | — | `node --test orgs/core/blackroad-os-metaverse/tests/` |
| pytest (Python, future) | — | `cd mcp-bridge && pytest` |
