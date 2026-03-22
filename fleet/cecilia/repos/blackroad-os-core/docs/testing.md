# Testing Guide

This document explains the test suite for `blackroad-os-core`.

## Test Overview

The core service includes automated tests using Vitest to validate:
- Shared types and utilities stay consistent
- Integration layers (identity, permissions, jobs, etc.) behave as expected
- Desktop and SDK shims keep their contracts stable
- Regression coverage for critical workflows remains intact

## Running Tests Locally

### Install Dependencies
```bash
pnpm install
```

### Run All Tests
```bash
pnpm test
```

### Run Tests in Watch Mode
```bash
pnpm test:watch
```

### Generate Coverage Report (V8)
```bash
pnpm test:coverage
```

Coverage reports are generated in the `coverage/` directory using the V8 provider configured in `vitest.config.ts`.

## Test Structure

Tests live under `tests/` (with shared fixtures in `tests/fixtures/`). A few examples:

- **constants.test.ts** - Validates core constant maps stay in sync
- **domainEvents.test.ts** - Covers event typing and emitters
- **window.test.tsx** - Guards desktop window helper behaviour
- **truthAggregation.test.ts** - Verifies truth resolver aggregation logic

## Writing New Tests

### Basic Test Example

```typescript
import { describe, expect, it, vi } from "vitest";

const fetchAgentName = async (id: string, load: (id: string) => Promise<string>) => {
  return load(id).then((name) => name.toUpperCase());
};

describe("agent loader", () => {
  it("uppercases the agent name", async () => {
    const load = vi.fn().mockResolvedValue("apollo");
    await expect(fetchAgentName("123", load)).resolves.toBe("APOLLO");
    expect(load).toHaveBeenCalledWith("123");
  });
});
```

## CI/CD Integration

Tests run automatically on:
- **Pull Requests**: All tests must pass before merge
- **Push to `main` or `develop`**: Validates branch integrity

See [CI/CD Workflows](./ci-workflows.md) for details.

## Debugging Test Failures

### Local Testing
```bash
# Run tests with verbose output
pnpm test -- --reporter=verbose

# Run specific test file
pnpm test -- health.test.ts

# Run tests matching a pattern
pnpm test -- --test-name-pattern="health"
```

### CI Failures
1. Click "Details" next to the failing check in your PR
2. Expand the failed test step in GitHub Actions
3. Look for test failure messages and stack traces
4. Fix the issue locally and push

## Common Issues

**"Cannot find module"**
- Fix: Ensure dependencies are installed with `pnpm install` and Node is using the workspace version

**"Test timeout"**
- Fix: Increase timeout in the specific test or suite using `test.setTimeout(10000)`, `describe('...', () => { ... }, { timeout: 10000 })`, or by passing the `timeout` option to individual tests: `it('...', async () => { ... }, { timeout: 10000 })`. You can also set a global timeout in your `vitest.config.ts` with the `timeout` option.

**"Database connection error"**
- Fix: Prefer mocking Prisma clients or setting `DATABASE_URL` for integration-style tests

**"Type errors in tests"**
- Fix: Run `pnpm lint` or `pnpm test -- --typecheck` to surface TypeScript issues
