# blackroad-analytics — Safe Change Boundaries

## SAFE (do freely)
- Read source code and SQL migrations
- Query the analytics API for read-only data
- Edit documentation
- Add new read-only aggregation endpoints

## CAUTION (test first, verify after)
- Modify the beacon endpoint (88 sites send to it)
- Change D1 query patterns (performance impact)
- Add new D1 migrations
- Change CORS configuration

## DANGEROUS (ask before doing)
- Deploy to production (88 sites depend on this)
- Run D1 migrations (`wrangler d1 migrations apply`)
- Modify the page_views schema
- Change the tracking beacon format (breaks existing bb.js on all sites)

## NEVER
- Store raw IP addresses or PII
- Delete production analytics data
- Disable CORS (breaks all site beacons)
- Force push to main
