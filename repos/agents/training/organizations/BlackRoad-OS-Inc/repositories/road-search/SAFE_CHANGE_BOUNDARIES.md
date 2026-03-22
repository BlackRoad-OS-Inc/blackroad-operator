# road-search — Safe Change Boundaries

## SAFE (do freely)
- Read source code
- Call search/suggest/stats endpoints
- Edit documentation
- Modify result formatting

## CAUTION (test first, verify after)
- Change FTS5 query syntax
- Modify ranking/scoring logic
- Change AI answer prompt template
- Add new API endpoints

## DANGEROUS (ask before doing)
- Deploy to production
- Run D1 migrations (FTS5 schema changes)
- Modify the index endpoint (affects crawl pipeline)
- Change Ollama integration (AI answer generation)

## NEVER
- Delete the search index
- Disable authentication on index mutation endpoints
- Force push to main
