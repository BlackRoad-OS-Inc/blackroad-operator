# blackroad-stats — Safe Change Boundaries

## SAFE (do freely)
- Read source code and collector script
- Call the `/fleet` API endpoint
- Edit documentation
- Add read-only endpoints

## CAUTION (test first, verify after)
- Modify `collect.sh` (runs on cron, SSHes into fleet)
- Change KV key structure (breaks Worker reads)
- Add new metrics to collection
- Change API response shape (Prism and Slack Hub depend on it)

## DANGEROUS (ask before doing)
- Deploy Worker to production
- Modify cron schedule for collector
- Change SSH connection parameters in collect.sh
- Modify KV namespace binding

## NEVER
- Store SSH keys in the repo
- Expose internal Pi IP addresses in public API responses
- Delete KV fleet data
- Force push to main
