# blackroad-index — Safe Change Boundaries

## SAFE (do freely)
- Read source code
- Query search API
- Edit documentation

## CAUTION (test first, verify after)
- Modify search/indexing logic
- Change D1 schema
- Edit cron schedule

## DANGEROUS (ask before doing)
- Deploy to production
- Run full re-index (slow, hits API limits)
- Change Gitea/GitHub API tokens

## NEVER
- Delete the search index
- Store API tokens in code
- Force push to main
