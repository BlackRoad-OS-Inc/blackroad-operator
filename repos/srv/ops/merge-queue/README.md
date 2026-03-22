# Merge Queue Runbook

This directory contains helper scripts for applying the merge plan
produced in `merge_plan.json`.

Scripts support a dry-run mode by setting `DRY_RUN=1`.

## apply.sh
Merges pull requests in queue order and restarts impacted services
(api/yjs/bridge/jsond) before reloading nginx and deploying UI assets.

## verify.sh
Runs health checks against core endpoints. Fails non-zero if any check
fails. Requires `BLACKROAD_KEY` environment variable for authenticated
API calls.

## rollback.sh
Attempts to restore the previous state using
`/srv/blackroad-backups/rollback_latest.sh` when available, otherwise
falls back to `git revert`.

## merge_ready_prs.py
Reads `merge_plan.json`, inspects each `state: open` entry via the GitHub
API, and merges the pull request when it is clean, non-draft, and carries
the required label (defaults to `ready-to-merge`).

Usage:

```bash
export GITHUB_TOKEN=ghp_***
python srv/ops/merge-queue/merge_ready_prs.py \
  --repo blackroad-ai/blackroad-prism-console \
  --method squash \
  --label ready-to-merge
```

Flags such as `--dry-run`, `--max`, and `--skip-label-check` make it easy
to preview the queue, land a subset, or temporarily bypass label
requirements.

_Last updated on 2025-09-11_
