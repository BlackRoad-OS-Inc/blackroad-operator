# blackroad-gateway — Safe Change Boundaries

## SAFE (do freely)
- Read any source file
- Read wrangler.toml (secrets are not stored here, only bindings)
- Run tests locally (`npm test`)
- Edit documentation and CHANGELOG
- Read audit.ts and ratelimit.ts logic

## CAUTION (test first, verify after)
- Modify provider routing in routes.ts (affects all agent inference)
- Change rate limiting thresholds
- Edit JWT validation logic
- Add new provider integrations
- Modify audit log format (downstream consumers depend on it)
- Run `wrangler dev` for local testing

## DANGEROUS (ask before doing)
- Deploy to production (`npx wrangler deploy`)
- Add or rotate Worker secrets (`wrangler secret put`)
- Change KV namespace bindings
- Modify CORS or auth headers
- Change the OpenAI-compatible API contract (all agents depend on it)

## NEVER
- Put API keys in source code, environment files, or logs
- Log user prompts or completions (privacy)
- Disable JWT validation
- Disable rate limiting
- Force push to main
- Deploy without testing against at least one provider
