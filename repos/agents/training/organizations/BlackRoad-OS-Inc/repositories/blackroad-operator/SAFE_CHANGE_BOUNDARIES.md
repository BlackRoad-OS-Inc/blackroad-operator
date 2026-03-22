# blackroad-operator — Safe Change Boundaries

## SAFE (do freely)
- Read any file
- Search codex
- Run `br status`, `br fh`, `br orch status`
- Run tests locally
- Edit files in `tools/` (CLI scripts)
- Add new tool scripts
- Update documentation

## CAUTION (test first, verify after)
- Edit `br` dispatcher (routes all commands)
- Modify memory scripts (`scripts/memory/`)
- Change orchestrator code (`agents/orchestrator/`)
- Deploy Workers (`npx wrangler deploy`)
- Push to GitHub

## DANGEROUS (ask before doing)
- SSH commands on Pi nodes
- Modify cron jobs
- Change tunnel configs
- Edit systemd services
- Delete files or branches
- Force push anything
- Modify `.github/workflows/`

## NEVER
- Commit .env files or secrets
- Force push to main
- Delete the `agents/spawn.db`
- Modify Pi node `/etc/` without backup
- Run `rm -rf` on any production path
