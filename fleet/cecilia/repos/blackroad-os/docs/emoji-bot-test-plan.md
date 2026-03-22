# Emoji-Bot Dry Run Plan

## Target Repository
- **Selected repo:** `blackroad-os-demo`
- Rationale: the demo repo is safe for smoke testing bot flows without impacting production-facing services.

## Test Scenario
Create a sample pull request and have Emoji-Bot report status using the existing `in-progress.md` template.

### Prerequisites
- Emoji-Bot is installed on `blackroad-os-demo` with access to PR comments and reactions.
- The repository contains the committed files:
  - `.github/workflows/emoji-bot.yml`
  - `emoji-bot-config.yml`
  - `bot/comments/in-progress.md`
- Ensure the bot’s secret/token is configured for the workflow.

### Steps
1. Open a new branch in `blackroad-os-demo` and create a trivial change (e.g., update README copy) to keep the diff safe.
2. Open a PR titled **"Emoji-Bot: initial smoke test"**.
3. As soon as the PR is open, add a bot comment using the contents of `bot/comments/in-progress.md`:
   > 🤖 "emoji-bot" reporting in  
   > Status: 🟡 In Progress  
   > Assigned to: 🤖 `@scribe-agent`  
   > Please react with: ✅ to confirm • ❌ to block • 🛟 to escalate • 🤔 to review
4. Monitor the workflow run in GitHub Actions and capture Emoji-Bot console output to verify it processes the PR and posts logs.
5. React to the comment with ✅, ❌, 🛟, and 🤔 to confirm reaction handling.
6. Note any follow-up actions (status changes, additional comments, or labels) the bot triggers.

### Expected Outcomes
- Emoji-Bot posts the in-progress status comment without errors.
- Reaction events are received and logged by the bot.
- No unintended side effects (labels, assignments, or merges) occur during the smoke test.

### Follow-Up
- If reactions or posts fail, gather the workflow logs and adjust `emoji-bot-config.yml` or webhook permissions in `blackroad-os-demo` before retrying.
- Once the in-progress flow is validated, repeat the test in `blackroad-os-api` for closer-to-production behavior.
