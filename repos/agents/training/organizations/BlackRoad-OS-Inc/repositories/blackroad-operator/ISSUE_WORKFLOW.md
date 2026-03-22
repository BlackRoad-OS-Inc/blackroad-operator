# blackroad-operator — Issue Workflow

## Opening an Issue
1. Search existing issues first
2. Use templates: `bug-report.yml` or `feature-request.yml`
3. Label with: `agent`, `worker`, `fleet`, `memory`, `orchestrator`, `brand`, `security`
4. Assign to yourself if you'll work on it
5. Link to milestone if applicable

## Working an Issue
1. Comment with your plan before starting
2. Create a branch: `fix/issue-number-short-desc` or `feat/issue-number-short-desc`
3. Reference the issue in commit messages: `Fixes #123`
4. Update the issue with progress

## Closing an Issue
1. Close via PR merge (auto-close with `Fixes #N`)
2. If closed without PR, explain why
3. Log to [JOURNAL]: `memory-system.sh log fix <entity> "<details>"`
