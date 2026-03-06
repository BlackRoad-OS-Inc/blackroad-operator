# Operator Contract

> Guarantees that the `blackroad-operator` provides to its users and the ecosystem.

## Principles

### 1. Idempotent Operations
Every operator command produces the same result regardless of how many times it runs. Running `br deploy` twice does not create duplicate deployments. Running `br init` on an already-initialized project is a no-op.

### 2. Reversible Changes
Every change the operator makes can be undone. Deployments can be rolled back. Configuration changes are versioned. Database migrations have down paths.

### 3. Auditable Actions
Every action is logged with:
- **Who** triggered it (user, agent, or automation)
- **What** changed (files, configs, deployments)
- **When** it happened (UTC timestamp)
- **Why** it was done (linked issue, PR, or command)

### 4. No Hidden State
All state is stored in known locations:
- `~/.blackroad/` for user-level configuration
- `.blackroad/` for project-level state
- SQLite databases for persistent data
- Git history for code changes

### 5. No Vendor Lock-In
The operator works with any cloud provider, any AI model, any hardware. Switching providers is a configuration change, not a rewrite.

## Guarantees

| Guarantee | Description |
|-----------|-------------|
| **Safe by default** | Destructive operations require explicit confirmation |
| **Offline-capable** | Core functionality works without internet |
| **Transparent** | All network calls are logged and configurable |
| **Minimal** | No unnecessary dependencies or bloat |
| **Composable** | Every command works in scripts and pipelines |

## What the Operator Will Never Do

1. Send data to third parties without explicit configuration
2. Modify files outside the project directory without permission
3. Store credentials in plaintext
4. Require a specific cloud provider
5. Break backward compatibility without a major version bump

---

(c) BlackRoad OS, Inc. All rights reserved.
