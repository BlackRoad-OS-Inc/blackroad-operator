# blackroad-auth — Safe Change Boundaries

## SAFE (do freely)
- Read source code
- Read wrangler.toml (secrets are referenced, not stored)
- Edit documentation
- Test auth endpoints with test accounts

## CAUTION (test first, verify after)
- Modify input validation logic
- Change error message text
- Add new read-only endpoints
- Modify rate limiting thresholds

## DANGEROUS (ask before doing)
- Deploy to production (every BlackRoad service depends on this)
- Modify PBKDF2 parameters (changes password compatibility)
- Change JWT signing or expiry (invalidates all existing tokens)
- Modify the D1 user schema
- Change the register or login flow
- Add or modify middleware

## NEVER
- Store raw passwords in D1 or logs
- Log JWT tokens or passwords
- Put JWT secret in source code
- Disable rate limiting
- Disable PBKDF2 (store plaintext passwords)
- Force push to main
- Deploy without testing the full auth flow
