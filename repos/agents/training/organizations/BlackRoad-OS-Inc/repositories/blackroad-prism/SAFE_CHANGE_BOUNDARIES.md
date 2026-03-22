# blackroad-prism — Safe Change Boundaries

## SAFE (do freely)
- Read any source file
- Call any `/api/*` endpoint for testing
- Edit dashboard HTML/CSS
- Add new read-only API endpoints
- Update documentation

## CAUTION (test first, verify after)
- Modify existing API response shapes (consumers depend on them)
- Change KV key patterns (breaks data reads)
- Edit fleet data aggregation logic
- Modify the public stats endpoint (external consumers)

## DANGEROUS (ask before doing)
- Deploy to production (`npx wrangler deploy`)
- Change KV namespace bindings in wrangler.toml
- Modify authentication on endpoints
- Change the `/api/fleet` contract (Slack Hub and other services depend on it)

## NEVER
- Expose internal Pi IP addresses in public endpoints
- Hardcode fleet data instead of reading from KV
- Remove the health check endpoint
- Force push to main
