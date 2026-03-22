# Quick Pulse Checklist

Use this checklist to coordinate last-mile verification for changes that touch `AutoNovelAgent`
and `CleanupBot`. It captures the steps highlighted in the pull request discussion so reviewers,
release managers, and operators can quickly confirm the state of the branch before merging or
shipping.

## 1. Context snapshot
- Summarize what the branch changes (features, bug fixes, or clean-up tasks).
- Call out any risky areas (auth, permissions, or infrastructure interactions).

## 2. Security sanity check
- Confirm that no new credentials, API keys, or tokens were added to configs or logs.
- Run the automated heuristic scan: `python scripts/quick_pulse.py` (it scans for common key
  prefixes such as `sk-`, `AKIA`, and `AIza` in the touched files).
- If any finding appears, validate whether it is a false positive before proceeding.

## 3. Test verification
- Execute the focused checks via `python scripts/quick_pulse.py`. The helper script runs:
  - `python -m py_compile agents/auto_novel_agent.py agents/cleanup_bot.py`
  - `python agents/auto_novel_agent.py`
  - `pytest tests/test_auto_novel_agent.py tests/test_cleanup_bot.py`
- Optionally, extend the run with `npm test` / `npm run lint` or any scenario-specific suites.

## 4. Merge plan and deployment readiness
- Confirm the branch still merges cleanly with the target and document any required rebase.
- Validate CI/CD status. If rate limits or external deployment blockers occur, note the follow-up
  plan (e.g., retry window, escalation contact).
- Capture a one-line merge plan so everyone knows when to expect the change to land.

Keeping this checklist lightweight—but documented—makes it easier for the team to respond to
"quick pulse" pings without losing important release hygiene.
