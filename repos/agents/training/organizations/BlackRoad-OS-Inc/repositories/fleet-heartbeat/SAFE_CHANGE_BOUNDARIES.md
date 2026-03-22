# fleet-heartbeat — Safe Change Boundaries

## SAFE (do freely)
- Read source code
- View the dashboard
- Run tests locally

## CAUTION (test first, verify after)
- Modify health check logic
- Change auto-healing rules
- Edit dashboard UI

## DANGEROUS (ask before doing)
- Deploy to production
- Change SSH connection params
- Modify auto-healing actions (restarts services)

## NEVER
- Store SSH keys in the repo
- Disable auto-healing without alternative
- Force push to main
