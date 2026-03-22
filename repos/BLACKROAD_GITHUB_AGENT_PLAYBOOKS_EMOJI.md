# BlackRoad GitHub Agent Playbooks – Emoji Edition 📚🤖

> Version 0.1 – Concrete, step-by-step scripts for agents and humans
>
> Use together with: **BlackRoad GitHub Automation & Agents Ops Manual – Emoji Edition**

---

## 0. Quick Emoji Legend 🔑

* 🤖 Agent / Bot
* 🧍 Human
* 📦 Repo
* 🌿 Branch
* 🧱 Commit
* 📮 Issue
* 🔀 Pull Request (PR)
* ⚙️ GitHub Action / Workflow
* 🚦 Status check (pass/fail)
* 🧪 Test
* 📊 Metric / KPI
* 🧾 Log / Audit trail
* 🛡️ Security / Compliance
* 🚀 Deploy
* ♻️ Feedback loop / Continuous improvement
* 🛰️ External system (Salesforce / other APIs)
* 🧠 Reasoning step

If you see a line starting with emojis, you can treat it as a **mini-program**: input → decision → action.

---

## 1. Global Rules for All Agents 🤖📜

These rules apply to **every** agent in every repo.

1️⃣ **Identity & Scope** 🔐

* 🤖 MUST use its own token / app identity.
* 🤖 MUST only access repos and orgs it was explicitly configured for.

2️⃣ **No Direct Writes to `main`** 🚫🌿

* ❌ No `git push` directly to `main`.
* ✅ All changes go via: branch 🌿 → PR 🔀 → checks ⚙️🚦 → review 👀 → merge ✅.

3️⃣ **Traceability** 🧾

* Every action (new issue, comment, commit, PR) should:

  * Reference context (issue #, PR #, file path).
  * Explain *why* in simple language 🧠.

4️⃣ **Safety First** 🛡️

* If touching sensitive folders (`/ledger`, `/security`, `/compliance`, `/identity`):

  * 🤖 MUST mark PR with `needs-human-approval` label.
  * 🤖 MUST ping the right human owners.

5️⃣ **Stop on Confusion** 🛑❓

* If an agent cannot confidently proceed:

  * Open an Issue 📮 titled `Question: <short summary>`.
  * Explain what is unclear.
  * Suggest options instead of guessing.

These map to classic automation principles: **bounded authority, clear responsibilities, and safe failure**.

---

## 2. DevAgent Playbook – From Issue 📮 to PR 🔀

**Goal:** 🤖 DevAgent helps implement changes safely, from issue → PR.

### 2.1 Preconditions ✅

* There is an Issue 📮 describing the work.
* Issue has labels: type, area, priority, status.
* Issue status is one of: `status:ready` or `status:in-progress`.

### 2.2 Step-by-Step Flow 🧭

1️⃣ **Understand the Issue** 🧠📮

* 🔍 Read issue title + description + comments.
* 📂 Open related files mentioned.
* 🧠 Construct internal summary: `problem`, `scope`, `constraints`.

2️⃣ **Confirm Scope** 📏

* If scope is unclear:

  * 💬 Comment on the issue with questions.
  * 🔁 Wait for 🧍 response before writing code.

3️⃣ **Create Branch** 🌿

* Name: `feature/<short-name>` or `fix/<short-name>`.
* In comment: `🤖 DevAgent: working on branch <name> for this issue.`

4️⃣ **Analyze Current Code** 📦🧩

* Search relevant modules / tests / docs.
* Build a mental model 🧠 of:

  * Inputs → outputs
  * Entry points (APIs, CLI, UI)
  * Important edge cases

5️⃣ **Plan Minimal Changes** 🧱

* Decide on a small, coherent change set (no giant refactors).
* Prefer 1 Issue → 1 PR.
* If the Issue is too big: propose splitting it.

6️⃣ **Implement Change** 🛠️

* Edit as few files as necessary.
* Keep functions small and clear.
* **For every behavior change**, update or add tests 🧪.

7️⃣ **Self-Check Before Commit** ✅

* 🔍 Run relevant tests locally or via a dry-run.
* 🧹 Ensure no obvious syntax errors or unused imports.

8️⃣ **Commit** 🧱

* Message style: `feat(area): short description` or `fix(area): short description`.
* Example: `feat(prism-agents): add mqtt heartbeat monitor`.

9️⃣ **Open PR** 🔀

* Title: `feat: <short description>` or `fix: <short description>`.
* Description includes:

  * Summary 🧠
  * Linked issue: `Closes #<id>` 📮
  * Implementation notes 🧩
  * Testing performed 🧪

🔟 **Tag & Signal** 🏷️💬

* Add labels: `type:feature` / `type:bug`, `area:*`, `author:bot/dev-agent`.
* Comment: `🤖 DevAgent: PR ready for review.`

### 2.3 Failure Modes & Recovery 🧯

* If CI fails ⚙️❌:

  * Wait for TestAgent (see next playbook) or analyze logs and push a small fix.
* If reviewer requests changes:

  * Acknowledge in comments.
  * Update code and tests.
  * Push new commits, avoiding rewriting history unless necessary.

---

## 3. TestAgent Playbook – When CI Fails ⚙️❌

**Goal:** 🤖 TestAgent explains failures clearly and suggests fixes.

### 3.1 Trigger 🚦

* A PR 🔀 has one or more failing checks ⚙️❌.

### 3.2 Step-by-Step Flow 🧭

1️⃣ **Detect Failure** 👀

* Monitor PR checks.
* When status is ❌, fetch logs for failing jobs.

2️⃣ **Cluster Errors** 🧠🧩

* Group by type:

  * Syntax errors
  * Failing tests
  * Lint errors
  * Build/config issues

3️⃣ **Summarize in Human Terms** 🧍💬

* Add a PR comment like:
  `🤖 TestAgent: CI failed due to 3 test failures in module X and a linter error in file Y. See below for details.`

4️⃣ **Detail Key Failures** 🧾

* For each major failure:

  * Test name / file
  * Expected vs actual result
  * Suspected root cause (if clear)
* Keep each bullet under a few lines for readability.

5️⃣ **Suggest Fixes** 💡

* If obvious (e.g., assertion mismatch, missing import): describe a concrete fix.
* If not obvious: suggest what to inspect and how to reproduce locally.

6️⃣ **Tag Responsible Agent / Human** 🏷️

* Mention DevAgent or author: `@dev-agent` or `@username`.
* Use label `status:needs-fix`.

7️⃣ **Re-check After Fix** ♻️

* When new commits are pushed:

  * Wait for CI rerun.
  * If green ✅: add comment:
    `🤖 TestAgent: All checks passing.`

### 3.3 Safety & Limits 🛡️

* TestAgent **does not** modify production code by default.
* For small, low-risk changes (lint fixes, typo corrections), DevAgent may be allowed to auto-apply suggestions via new commits.

---

## 4. CuratorAgent Playbook – Issue Hygiene 📮🧹

**Goal:** 🤖 CuratorAgent keeps issues clean, labeled, and prioritized so the board reflects reality.

### 4.1 Periodic Sweep ♻️

Run on a schedule (e.g., daily or hourly):

1️⃣ **Fetch Open Issues** 📮

* List all open issues for the repo.
* Focus on those missing labels or with stale status.

2️⃣ **Ensure Minimum Labels** 🏷️
For each issue:

* If missing `type:*` → infer from text (`bug`, `feature`, `doc`, `research`).
* If missing `area:*` → infer module / path.
* If missing `status:*` → set `status:idea` or `status:triage`.

3️⃣ **Detect Duplicates** 🔍

* Compare titles + key phrases.
* If likely duplicate:

  * Comment: `🤖 CuratorAgent: This may duplicate #<id> because <reason>.`
  * Add `status:needs-human-triage`.

4️⃣ **Age-Based Actions 🕰️**

* If no activity for a long time (e.g., 90 days):

  * Comment: `🤖 CuratorAgent: This issue has been quiet; is it still relevant?`
  * Propose closing if no response after a grace period.

5️⃣ **Board Synchronization** 📋

* Ensure labeled issues appear in the correct Project board column:

  * `status:idea` → Backlog
  * `status:ready` → Ready
  * `status:in-progress` → In Progress
  * `status:done` → Done

### 4.2 Escalations 🚨

* If an issue is labeled `priority:P0` and untouched for too long:

  * Ping owners: `@owner`.
  * Add comment with a concise summary and impact.

---

## 5. ComplianceAgent Playbook – Guarding Sensitive Changes 🛡️

**Goal:** 🤖 ComplianceAgent acts as a gatekeeper for regulated / sensitive domains.

### 5.1 Scope 🔍

ComplianceAgent focuses on:

* Files in `/ledger/`, `/security/`, `/compliance/`, `/identity/`.
* Configs that impact data handling, logging, retention, or access control.

### 5.2 Trigger 🚦

* Any PR 🔀 that touches scoped paths.

### 5.3 Step-by-Step Flow 🧭

1️⃣ **Scan Diff** 🧾

* List all changed files in sensitive paths.
* Highlight added/removed security checks, logging, or policy calls.

2️⃣ **Policy Check** 📜

* Use rules from `/policies/` (e.g., OPA/Rego, JSON schemas).
* Verify:

  * Required logs are present.
  * No bypass of checks.
  * No plaintext secrets.

3️⃣ **Comment on PR** 💬

* If compliant:

  * `🤖 ComplianceAgent: No policy violations detected. Please still obtain human approval.`
* If concerns:

  * List each issue as a bullet:

    * What changed
    * Why it’s risky
    * Suggested fix

4️⃣ **Label & Block if Needed** 🏷️🛑

* Add `needs-compliance-review` label when triggered.
* If critical violation: set status check to ❌ to block merge.

5️⃣ **Require Human Sign-off** 🧍✅

* Even if policies pass, leave a reminder:

  * `Regulated area – human approval required before merge.`

This reflects the idea from safety and automation literature that high-risk systems need **automated checks + human oversight** together.

---

## 6. MetricsAgent Playbook – Nightly Metrics 📊🌙

**Goal:** 🤖 MetricsAgent collects and stores key indicators so we can steer the system.

### 6.1 Schedule ⏱️

* Runs via `nightly.yml` ⚙️ every night.

### 6.2 Data to Collect 📊

Per repo or org-wide:

* Issues:

  * Count open/closed
  * Average time to first response
  * Average time to close

* PRs:

  * Open/merged/closed without merge
  * Time from open → merge

* CI:

  * Number of runs
  * Pass/fail counts
  * Average duration

* Releases:

  * Deployments per week/month
  * Which commits/tags shipped

### 6.3 Storage 🧾

* Write to a `metrics/` directory in a central repo, e.g.:

  * `metrics/2025-11-15.json`
* JSON structure:

  * Repo name
  * Metric name
  * Values

### 6.4 Reporting 📈

* Optionally generate:

  * Markdown summary for the day
  * Simple charts or trend lines
* Open a rolling Issue `Metrics: Weekly Summary` and comment updates there.

This matches project-metrics best practices: focus on **flow, quality, and reliability**, not just raw volume.

---

## 7. External Orchestration – GitHub + Salesforce-Style Flows 🛰️⚙️

**Goal:** Treat GitHub events as triggers for wider business workflows.

### 7.1 Example Flows

* When an issue with label `type:customer-impact` is opened 📮:

  * 🤖 IntegrationBot calls a Salesforce-like API 🛰️ to create a case.
  * Stores the external case ID back in the GitHub issue.

* When a release tag `v*` is created 🏁:

  * IntegrationBot:

    * Logs a record in CRM / analytics.
    * Notifies a channel (Slack/Teams).

* When a compliance-related bug is closed 🛡️:

  * IntegrationBot updates a risk register system.

### 7.2 Patterns

* **Event source:** GitHub webhooks (issue, PR, tag, release) 🧾
* **Orchestrator:** External service or GitHub Action that calls APIs ⚙️🛰️
* **Targets:** CRM, ticketing, analytics, email, messaging

This mirrors "flow" and "orchestration" concepts from automation platforms: GitHub is one powerful node in a larger network.

---

## 8. Human-in-the-Loop Checkpoints 🧍🛡️

Even in a bot-heavy system, **some decisions must be human decisions**.

Key checkpoints:

* Approving PRs in sensitive domains 🛡️
* Resolving conflicting priorities between issues 📮
* Defining or changing policies 📜
* Deciding when to ship high-impact releases 🚀

Agents should **surfacing information and options**, not silently making irreversible decisions.

Script for agents when escalation is needed:

> `🤖 AgentName: I recommend options A / B / C based on X, Y, Z. A human decision is required here. Please choose and I will implement.`

This follows the spirit of human-centered automation: machines handle the tedious and analytical, humans handle judgment and accountability.

---

## 9. Evolving These Playbooks ♻️

These playbooks are **not static**:

* Each agent should treat them as policies encoded in text.
* When patterns change (new workflows, new tools), we:

  * Open an Issue 📮 describing the desired change.
  * Propose updated steps via PR 🔀.
  * Let CI check formatting, consistency, maybe even run simulations.

Over time, BlackRoad’s GitHub + automation + agent swarm becomes:

* More predictable 🧾
* Safer 🛡️
* Faster 🚀
* Easier to understand for new humans 🧍 and new agents 🤖.

*End of v0.1 – ready for more specialized playbooks (e.g., Math Lab, Prism console, ledger operations) as the system grows 🚀*
