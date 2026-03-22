# source — Safe Change Boundaries

## SAFE (do freely)
- Read any file or directory
- Run fleet health checks
- Read brand design rules
- Add documentation to existing components

## CAUTION (test first, verify after)
- Add new component directories (must follow taxonomy)
- Modify orchestrator code (controller, supervisor, worker)
- Edit upstream-sync.sh
- Change brand/DESIGN-RULES.md (affects all sites)

## DANGEROUS (ask before doing)
- Rename or restructure top-level directories
- Modify the orchestrator's NATS protocol (breaks agent messaging)
- Change the spawn logic (affects agent lifecycle)
- Push changes that affect the canonical directory structure

## NEVER
- Delete established directories without migrating dependents
- Contradict brand/DESIGN-RULES.md in other repos
- Force push to main
