# Integration Vault

Sensitive integration endpoints, IPs, and credentials that must **never** be
committed to version control live here as references only.

The actual values are stored in `~/.blackroad/vault/` (AES-256-CBC encrypted,
chmod 400 key) and injected at runtime via environment variables.

---

## Sensitive Endpoints (moved from integration configs)

| Integration | Secret Type | Env Var | Notes |
|---|---|---|---|
| shellfish | Pi host (LAN) | `SHELLFISH_HOST_BLACKROAD_PI` | Primary Raspberry Pi |
| shellfish | Pi host (LAN) | `SHELLFISH_HOST_ARIA64` | Aria agent node |
| shellfish | Pi host (LAN) | `SHELLFISH_HOST_ALICE_PI` | Alice agent node |
| shellfish | Droplet host (public) | `SHELLFISH_HOST_INFINITY_DROPLET` | DigitalOcean public IP |
| enclave | Org ID | `ENCLAVE_ORG_ID` | Zero-trust network org |
| tailscale | Tailnet name | `TAILSCALE_TAILNET` | Tailscale network slug |

---

## Rules

1. **Single login**: Each provider must be configured once in the vault.
   After that, agents and CLI tools read env vars — no interactive login
   prompts are ever shown again.
2. **Relative paths**: All integration configs reference hosts via env vars
   so they work correctly regardless of where the repo is checked out.
3. **No hardcoded IPs or tokens** in any config file committed to git.
4. **Branches as paths**: Branches are treated as filesystem-like paths
   for feature isolation, not deleted after merging.

## Vault CLI

```bash
# Store a secret
br vault set SHELLFISH_HOST_INFINITY_DROPLET 'your-ip-here'

# Read a secret
br vault get SHELLFISH_HOST_INFINITY_DROPLET

# List all secrets
br vault list
```

---

_All content here is proprietary to BlackRoad OS, Inc. (c) 2024-2026._
