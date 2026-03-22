# blackroad-auth — Agent Training Curriculum

**Type:** worker | **Languages:** javascript

## Overview

JWT authentication system for the entire BlackRoad ecosystem. A Cloudflare Worker with D1 user database, PBKDF2 password hashing (chosen over bcrypt for Workers runtime compatibility), JWT tokens with 7-day expiry, and rate limiting on auth endpoints. 42 users. Every other BlackRoad service that needs authentication calls this. ~355 lines of Worker code.

## Key Files

- `src/worker.js` — Complete Worker (~355 lines): register, login, token verification, user management
- `wrangler.toml` — Worker config, D1 binding, JWT secret
- `package.json` — Dependencies

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/register` | POST | Create account (email, password, name) |
| `/api/login` | POST | Authenticate → JWT token |
| `/api/me` | GET | Verify token, return user profile |

## Security Model

- **PBKDF2** with 100K iterations (Workers-compatible, no native bcrypt)
- **JWT** with HS256, 7-day expiry
- **Rate limiting** on register/login to prevent brute force
- **D1** stores users (never raw passwords, only hashes)

## Learning Objectives

1. Understand PBKDF2 and why it's used over bcrypt on Workers
2. Trace the full auth flow: register → hash → store → login → JWT → verify
3. Know how JWT tokens work (header.payload.signature)
4. Understand rate limiting implementation

## Exercises

### Level 1: Observer
- [ ] Read `src/worker.js` and identify the auth flow
- [ ] Explain why PBKDF2 instead of bcrypt on Cloudflare Workers
- [ ] Identify what data is stored in D1 (and what is NOT stored)

### Level 2: Contributor
- [ ] Add input validation (email format, password strength)
- [ ] Improve error messages for failed authentication
- [ ] Add a `/api/change-password` endpoint

### Level 3: Builder
- [ ] Implement refresh tokens (separate from access tokens)
- [ ] Add OAuth2 provider support (login with GitHub)
- [ ] Add admin endpoints for user management

### Level 4: Architect
- [ ] Design role-based access control (RBAC) for the auth system
- [ ] Propose a session revocation mechanism (blacklist JWTs)
- [ ] Review the auth system for OWASP Top 10 vulnerabilities
