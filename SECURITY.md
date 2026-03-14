# Security Policy

## Reporting a Vulnerability

**Do not** open a public GitHub issue for security vulnerabilities.

Email **security@blackroad.io** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

### Response Timeline

| Phase | Timeline |
|-------|----------|
| Initial response | 24 hours |
| Triage and assessment | 72 hours |
| Fix development | 7-14 days |
| Coordinated disclosure | 90 days |

## Supported Versions

| Version | Status |
|---------|--------|
| Latest on `main` | Active support |
| Previous releases | Security fixes only |

## Architecture

All LLM provider communication flows through the tokenless gateway. Agents never embed API keys.

```
Agent --> Gateway (localhost:8787) --> Provider (Ollama / Claude / OpenAI)
```

### Authentication

| Component | Method |
|-----------|--------|
| API | JWT via auth.blackroad.io |
| CLI | Token-based |
| Fleet SSH | Public key authentication |
| Cloudflare Workers | Wrangler auth |
| MCP Bridge | Bearer token |

### Infrastructure Security

- **Cloudflare Tunnel** terminates TLS for all public endpoints
- **WireGuard** encrypts all inter-node traffic (10.8.0.x mesh)
- **Pi-hole** filters DNS on the fleet
- **UFW** on Lucidia (INPUT DROP policy)
- **NOPASSWD sudo** limited to operational users on each node
- **Secrets** stored in `~/.blackroad/` with 600 permissions, never in code

### Automated Scanning

| Scan | Tool | Frequency |
|------|------|-----------|
| Static analysis | CodeQL | Every PR |
| Dependencies | Dependabot | Daily |
| Secret detection | GitHub Secret Scanning | Every commit |
| Shell linting | ShellCheck | CI on every push |

## For Contributors

1. Never commit secrets, tokens, or credentials
2. Use environment variables or `.env` files (gitignored)
3. Use parameterized queries for all database access
4. Validate input at system boundaries
5. Keep dependencies updated (`npm audit`, `pip-audit`)

## Scope

| In Scope | Out of Scope |
|----------|--------------|
| *.blackroad.io | Third-party services |
| API endpoints | Social engineering |
| Agent infrastructure | Physical access attacks |
| Authentication and authorization | Denial of service |

## Contact

| Role | Contact |
|------|---------|
| Security Lead | security@blackroad.io |
| Backup | blackroad.systems@gmail.com |

---

BlackRoad OS, Inc. -- Pave Tomorrow.
