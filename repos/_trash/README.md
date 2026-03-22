<!-- FILE: _trash/README.md -->
These files were moved here during cleanup to preserve history.
Restore by moving each file back to its original path if needed.

### Root-Level Files

- `index.html` – legacy portal shell, now superseded by `var/www/blackroad/index.html`.
- `interesting.html` – experimental page without references.
- `.env.aider` – local environment template for Aider; not used in production.

### Logs

- `logs/runtime/` – runtime audit and synchronization logs that were previously stored at the repository root. They contain
  agent action history (`agent_actions.log`), authentication traces (`auth_activity.log`), deployment records
  (`deployment.log`), data sync events (`sync_events.log`), learning telemetry (`learning_events.jsonl`,
  `learning_audit.jsonl`, `learning_state.json`), block export data (`blocks.csv`), and performance snapshots under
  `perf/`. Restore by moving the directory back to `logs/` if historical debugging context is required.
