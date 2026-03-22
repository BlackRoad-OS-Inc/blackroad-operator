# blackroad-images — Safe Change Boundaries

## SAFE (do freely)
- Read source code and migration files
- Fetch images from CDN for testing
- Edit documentation
- Read upload.sh and generate.sh scripts

## CAUTION (test first, verify after)
- Modify CDN routing logic
- Change cache headers
- Add new asset routes
- Modify the D1 metadata schema

## DANGEROUS (ask before doing)
- Deploy to production (serves assets to all BlackRoad sites)
- Run bulk uploads to R2 (`upload.sh`)
- Trigger AI generation (`generate.sh` — costs money)
- Change R2 bucket bindings
- Modify brand asset routes (all sites reference these URLs)

## NEVER
- Delete brand assets from R2 (other sites depend on them)
- Change existing asset URLs (breaks all references)
- Upload non-brand-compliant assets to brand routes
- Force push to main
