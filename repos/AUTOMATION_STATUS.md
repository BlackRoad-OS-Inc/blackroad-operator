| Workflow | File | Triggers | Owners | Permissions | Compliance |
| --- | --- | --- | --- | --- | --- |
| Deploy to Droplet | `.github/workflows/00deploy.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Access Lifecycle | `.github/workflows/access-lifecycle.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Access Review (Quarterly) | `.github/workflows/access-review-quarterly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| access-review | `.github/workflows/access-review.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Accessibility + SEO (advisory) | `.github/workflows/accessibility.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Address Digests | `.github/workflows/addresses-digests.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Agent Commenter | `.github/workflows/agent-commenter.yml` | repository_dispatch, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, issues:write, pull-requests:write | Needs concurrency |
| Agent Issue Creator | `.github/workflows/agent-issue-creator.yml` | repository_dispatch, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, issues:write | Needs concurrency |
| Agent PR Creator | `.github/workflows/agent-pr-creator.yml` | repository_dispatch, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, issues:write | Needs concurrency |
| Agent PR Autopilot | `.github/workflows/agent-pr.yml` | issue_comment, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Agent Queue | `.github/workflows/agent-queue.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Agents Conformance | `.github/workflows/agents-conformance.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AI Evaluations (Nightly) | `.github/workflows/ai-evals.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AI Experiments Runner | `.github/workflows/ai-experiments.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AI RAG Refresh | `.github/workflows/ai-rag-refresh.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AIOps Daily (Monitor + Alerts + Report) | `.github/workflows/aiops-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AIOps Release (Canary → Promote) | `.github/workflows/aiops-release.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AIOps Train (Train + Evaluate) | `.github/workflows/aiops-train.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ambr-ci | `.github/workflows/ambr-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Amundson-BlackRoad Validation | `.github/workflows/amundson-blackroad.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| AR Monthly (Aging + Leakage + Dunning) | `.github/workflows/ar-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ATS Monthly (Time-to-Fill + Offers) | `.github/workflows/ats-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ATS Weekly (Pipeline + DEI) | `.github/workflows/ats-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| attest-tests | `.github/workflows/attest-tests.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Weekly Audit | `.github/workflows/audit.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| auto-fix | `.github/workflows/auto-fix.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write | Needs concurrency |
| Auto-Heal (create/fix & push) | `.github/workflows/auto-heal.yml` | pull_request, workflow_dispatch, workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write | Needs concurrency |
| Auto mention on PRs | `.github/workflows/auto-mention.yml` | pull_request_target, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| 🤖 Auto-merge | `.github/workflows/auto-merge.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| auto-queue-ready | `.github/workflows/auto-queue-ready.yml` | workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, checks:read | Needs concurrency |
| Auto Remediate | `.github/workflows/auto-remediate.yml` | workflow_dispatch, repository_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| 🔁 Auto Re-run Failed Jobs (max 3) | `.github/workflows/auto-rerun-failed.yml` | workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, contents:read, pull-requests:write | Needs concurrency |
| 🔁 Auto rerun | `.github/workflows/auto-rerun.yml` | workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, pull-requests:read | Needs permissions |
| autobuilder | `.github/workflows/autobuilder.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write | Needs concurrency |
| automation-drift-detection | `.github/workflows/automation-drift-detection.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| AutoPal Smoke | `.github/workflows/autopal-smoke.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Backups | `.github/workflows/backups.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| BCDR Daily (Backup Status) | `.github/workflows/bcdr-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| BCDR Monthly (Restore Audit + Drills + Resilience Report) | `.github/workflows/bcdr-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| BI Dashboards Publish | `.github/workflows/bi-publish.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Billing Close (Monthly Overages) | `.github/workflows/billing-close.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| blackroad-api Docker | `.github/workflows/blackroad-api-docker.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| BlackRoad • Deploy | `.github/workflows/blackroad-deploy.yml` | push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Board Pack (Monthly) | `.github/workflows/board-pack.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| br-infra-iac | `.github/workflows/br-infra-iac.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Branch Hygiene | `.github/workflows/branch-hygiene.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write | Needs concurrency |
| budget-gate | `.github/workflows/budget-gate.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Build on Merge | `.github/workflows/build-on-merge.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| buildx | `.github/workflows/buildx-multiarch.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Calm ChatOps v2 | `.github/workflows/calm-chatops.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, issues:write, actions:read | Needs concurrency |
| collatz-ci | `.github/workflows/campaign.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Canary Deploy | `.github/workflows/canary.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Captions CI | `.github/workflows/captions-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| care-gate | `.github/workflows/care-gate.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Change Approval Gate | `.github/workflows/change-approve.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Change Weekly (CAB Digest) | `.github/workflows/change-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ChatOps Command Router | `.github/workflows/chatops.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, contents:write, issues:write, pull-requests:write | Needs concurrency |
| Checks CI | `.github/workflows/checks-ci.yml` | push, pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Autopal Express CI | `.github/workflows/ci-autopal-express.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Autopal FastAPI CI | `.github/workflows/ci-autopal-fastapi.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CI | `.github/workflows/ci.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| sim-ci | `.github/workflows/ci_sim.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| prism-cli-validation | `.github/workflows/cli-validation.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| CLM Monthly (Repository Report) | `.github/workflows/clm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CLM Obligations Check | `.github/workflows/clm-obligations-check.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CLM Renewal Reminders | `.github/workflows/clm-renewal-reminders.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CLM Signature Ingest | `.github/workflows/clm-signature-ingest.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CLM Weekly (Obligations + Renewals) | `.github/workflows/clm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Consolidation Monthly (TB → FX → IC → Consolidate → Pack) | `.github/workflows/close-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Consolidation Quarterly (Disclosures) | `.github/workflows/close-quarterly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CMDB Nightly (Discovery + Drift + Graph) | `.github/workflows/cmdb-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CodeQL | `.github/workflows/codeql.yml` | push, pull_request, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, security-events:write | Compliant |
| Codex Bridge | `.github/workflows/codex-bridge.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, issues:write | Needs concurrency |
| codex-commands | `.github/workflows/codex-commands.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, checks:write, contents:read, issues:write, pull-requests:write | Needs concurrency |
| Codex Watchdog | `.github/workflows/codex_watchdog.yml` | push, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| collaboration-presence-enforcement | `.github/workflows/collab-presence-check.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| comment-web-editor | `.github/workflows/comment-web-editor.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | pull-requests:write | Needs permissions |
| 🔐 Commit Cryptographic Verification | `.github/workflows/commit-verification.yml` | pull_request, push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, attestations:write, id-token:write, checks:write | Needs concurrency |
| CommsBot Automation | `.github/workflows/commsbot.yml` | pull_request_target | @blackboxprogramming/comms, @blackboxprogramming/maintainers | (default) | Needs permissions |
| Control Plane CI | `.github/workflows/control-plane-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Copilot Config Check | `.github/workflows/copilot-config-check.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Supply Chain • Cosign keyless signing | `.github/workflows/cosign-sign-attest.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write, packages:write | Needs concurrency |
| Cost Monthly (Std Roll → Variance → GL Export) | `.github/workflows/cost-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CPM Monthly (Forecast + Variance + Pack) | `.github/workflows/cpm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CPM Weekly (Drivers Refresh) | `.github/workflows/cpm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CPQ Approval Digest | `.github/workflows/cpq-approval-digest.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CPQ Quote Expiry | `.github/workflows/cpq-quote-expiry.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CRM Weekly (Pipeline Health + Forecast) | `.github/workflows/crm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CS Monthly (NPS + QBR Digest) | `.github/workflows/cs-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| CS Weekly (Health + Alerts) | `.github/workflows/cs-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Data Ingest | `.github/workflows/data-ingest.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Data Retention | `.github/workflows/data-retention.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Security • Dependency Review Gate | `.github/workflows/dependency-review.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| Deploy AutoPal (Helm) | `.github/workflows/deploy-autopal.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| deploy-canary-ladder | `.github/workflows/deploy-canary-ladder.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| deploy-canary | `.github/workflows/deploy-canary.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| Deploy Preview | `.github/workflows/deploy-preview.yml` | workflow_dispatch, workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| Deploy Prod | `.github/workflows/deploy-prod.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy & Self-Heal | `.github/workflows/deploy-self-heal.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy BlackRoad Site to GitHub Pages | `.github/workflows/deploy-site.yml` | push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy Staging | `.github/workflows/deploy-staging.yml` | push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy to Shellfish Droplet | `.github/workflows/deploy-to-droplet.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy AI Console | `.github/workflows/deploy.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Dependency Auto Merge | `.github/workflows/deps-automerge.yml` | pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, checks:read, statuses:read | Needs concurrency |
| Dev Platform Daily (Usage + Webhook Redelivery) | `.github/workflows/dev-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Dev Platform Monthly (Billing Export) | `.github/workflows/dev-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Diffusion CI | `.github/workflows/diffusion-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Docker Scout | `.github/workflows/docker-scout.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| docker | `.github/workflows/docker.yml` | push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| build-docs | `.github/workflows/docs.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Data Quality Nightly | `.github/workflows/dq-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Data Contracts Lint (PR) | `.github/workflows/dq-pr.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| DR Drill | `.github/workflows/dr-drill.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Dunning Cycle (Daily) | `.github/workflows/dunning.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| E2E (Playwright) | `.github/workflows/e2e.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Economy CI | `.github/workflows/economy-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ELT Daily (Run DAGs + Quality Log) | `.github/workflows/elt-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ELT Nightly (Lineage & Costs Reports) | `.github/workflows/elt-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Emoji to Label Mapper | `.github/workflows/emoji-to-label.yml` | issues, pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, issues:write, pull-requests:write | Needs concurrency |
| 🔏 Enforce Commit Signing | `.github/workflows/enforce-commit-signing.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write, statuses:write, checks:write | Needs concurrency |
| env-guard | `.github/workflows/env-guard.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Escalate stale PRs | `.github/workflows/escalate-no-review.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | issues:write, pull-requests:write, contents:read | Compliant |
| ESG Audit Trail | `.github/workflows/esg-audit.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ESG Monthly (Carbon + Reports) | `.github/workflows/esg-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| evidence-pack | `.github/workflows/evidence-pack.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Exec Weekly Digest | `.github/workflows/exec-digest.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Experimentation Daily (Analyze + Guardrails) | `.github/workflows/exp-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Experimentation Weekly (Ramp Scheduler + Report) | `.github/workflows/exp-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Experiments Report | `.github/workflows/experiments.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| FA Monthly (Depreciation → GL Export) | `.github/workflows/fa-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Facilities Daily (Occupancy + Visitor Digest) | `.github/workflows/fac-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Facilities Monthly (EHS Summary) | `.github/workflows/fac-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Facilities Weekly (Maintenance Backlog) | `.github/workflows/fac-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| FinanceBot Automation | `.github/workflows/financebot.yml` | pull_request_target | @blackboxprogramming/finance, @blackboxprogramming/maintainers | (default) | Needs permissions |
| FinOps Daily (Ingest + Anomaly) | `.github/workflows/finops-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| FinOps Monthly (Allocation + Budgets + Recs + Report) | `.github/workflows/finops-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| FinOps Guardrails | `.github/workflows/finops.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Flaky Test Triage | `.github/workflows/flaky-triage.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Gate and Promote | `.github/workflows/gate-and-promote.yml` | workflow_dispatch, workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| gated-release | `.github/workflows/gated-release.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Security • gitleaks | `.github/workflows/gitleaks.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| graph-labs | `.github/workflows/graph-labs-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| GRCBot Automation | `.github/workflows/grcbot.yml` | pull_request_target | @blackboxprogramming/grc, @blackboxprogramming/maintainers | (default) | Needs permissions |
| GTM Sync | `.github/workflows/gtm-sync.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| GTMBot Automation | `.github/workflows/gtmbot.yml` | pull_request_target | @blackboxprogramming/gtm, @blackboxprogramming/maintainers | (default) | Needs permissions |
| Customer Health Weekly | `.github/workflows/health.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| HJB Lab CI | `.github/workflows/hjb-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Hotfix • Static Deploy | `.github/workflows/hotfix-static-deploy.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| HTML Validate | `.github/workflows/html-validate.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| i18n Keys Check | `.github/workflows/i18n-check.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| IAM Weekly (Access Digest) | `.github/workflows/iam-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ICM Monthly (Commissions) | `.github/workflows/icm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Incident Drill | `.github/workflows/incident-drill.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| IndustryBot Automation | `.github/workflows/industrybot.yml` | pull_request_target | @blackboxprogramming/industry, @blackboxprogramming/maintainers | (default) | Needs permissions |
| Inventory Daily (Stock Snapshot) | `.github/workflows/inv-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Invoicing (Monthly) | `.github/workflows/invoicing.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| iOS • BlackRoad Mobile | `.github/workflows/ios-mobile.yml` | push, pull_request, workflow_dispatch, release | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ITBot Automation | `.github/workflows/itbot.yml` | pull_request_target | @blackboxprogramming/it, @blackboxprogramming/maintainers | (default) | Needs permissions |
| k6-nightly | `.github/workflows/k6-nightly.yml` | schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| KMS Rotation (Dry Run) | `.github/workflows/kms-rotate.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Knowledge Nightly (Index + RAG Report) | `.github/workflows/kn-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Knowledge Weekly (KG Build + Report) | `.github/workflows/kn-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| kpi-pulse | `.github/workflows/kpi-pulse.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| .NET 8 • Test | `.github/workflows/language-dotnet8-test.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Go 1.22 • Test | `.github/workflows/language-go122-test.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Java 17 • Gradle | `.github/workflows/language-java17-gradle.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Java 17 • Maven | `.github/workflows/language-java17-maven.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Node 20 • Jest | `.github/workflows/language-node20-jest.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| PHP 8.3 • PHPUnit | `.github/workflows/language-php83-phpunit.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Python 3.12 • Pytest | `.github/workflows/language-python312-pytest.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Ruby 3.3 • RSpec | `.github/workflows/language-ruby33-rspec.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Rust Stable • Cargo Test | `.github/workflows/language-rust-stable.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Refresh Leaderboards | `.github/workflows/leaderboard-refresh.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Leases Monthly (Schedules → Journals) | `.github/workflows/leases-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Lighthouse CI | `.github/workflows/lighthouse.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Broken Links | `.github/workflows/links.yml` | pull_request, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| 🧪 Commitlint | `.github/workflows/lint-pr.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| lint-suite | `.github/workflows/lint.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| LMS Monthly (Training & Policy Reports) | `.github/workflows/lms-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| LMS Weekly (Reminders + Compliance) | `.github/workflows/lms-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Load Test (k6) | `.github/workflows/load.yml` | workflow_dispatch, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| local-ci | `.github/workflows/local-ci.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Lucidia Lineage & Fitness | `.github/workflows/lucidia-lineage-fitness.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| main-automation-orchestrator | `.github/workflows/main-orchestrator.yml` | push, pull_request, workflow_dispatch, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Compliant |
| Mainline Auto-Heal | `.github/workflows/mainline-autoheal.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write | Needs concurrency |
| Manual-Merge-Mode | `.github/workflows/manual-merge-mode.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Addresses • Masked Digest Notifier | `.github/workflows/masked-digests-notify.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| math-and-ambr-ci | `.github/workflows/math-and-ambr-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| MDM Nightly (Match → Merge → Publish) | `.github/workflows/mdm-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| MDM Weekly (Survivorship & Dedupe Audit) | `.github/workflows/mdm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| merge-queue | `.github/workflows/merge-queue.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Metrics | `.github/workflows/metrics.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Miners • Telemetry CI | `.github/workflows/miners-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Marketing Campaign Runner | `.github/workflows/mkt-campaigns.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Marketing Daily (Journeys + Attribution) | `.github/workflows/mkt-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Marketing Journeys Tick | `.github/workflows/mkt-journeys.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Marketing Monthly (ROAS & Campaign Report) | `.github/workflows/mkt-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Marketing Monthly Report | `.github/workflows/mkt-report.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Marketing Segments Recompute | `.github/workflows/mkt-segments.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ML Shadow Deploy | `.github/workflows/ml-shadow.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ML Train & Register | `.github/workflows/ml-train.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Multi-agent chorus | `.github/workflows/multi-agent-chorus.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, contents:read, issues:write, pull-requests:write | Needs concurrency |
| Mutation Testing | `.github/workflows/mutation.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| render-notebooks | `.github/workflows/nb_render.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Codex Nexus Dashboard QA | `.github/workflows/nexus-dashboard.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| no-binary-ci | `.github/workflows/no-binary-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| 🧪 Node CI | `.github/workflows/node-ci.yml` | pull_request, push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, checks:write, pull-requests:read | Compliant |
| Reusable Node Tests | `.github/workflows/node-tests.yml` | workflow_call, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, checks:write, pull-requests:read | Needs concurrency |
| Notify Dispatch | `.github/workflows/notify-dispatch.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Observability Mesh CI | `.github/workflows/obs-mesh-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Observability Daily (SLO Evaluate + Alerts) | `.github/workflows/observability-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Observability Smoke | `.github/workflows/observability-smoke.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Observability Weekly (Reliability Report) | `.github/workflows/observability-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| OKR Weekly (Check-in Digest) | `.github/workflows/okr-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy Ollama Bridge | `.github/workflows/ollama-bridge-deploy.yml` | push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| On-Call Rotation | `.github/workflows/oncall-rotation.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| OpsBot Automation | `.github/workflows/opsbot.yml` | pull_request_target | @blackboxprogramming/ops, @blackboxprogramming/maintainers | (default) | Needs permissions |
| Org/Membership Sanity Audit | `.github/workflows/org-audit.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| org_audit_weekly | `.github/workflows/org_audit.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Security • OSV Scanner | `.github/workflows/osv-scanner.yml` | pull_request, schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, security-events:write | Needs concurrency |
| OT Engine CI | `.github/workflows/ot-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| P2P Monthly (AP Aging + Spend) | `.github/workflows/p2p-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Product Analytics Daily (Rollup + Alerts) | `.github/workflows/pa-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Product Analytics Monthly (Retention + Report) | `.github/workflows/pa-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Product Analytics Weekly (Funnels + Cohorts) | `.github/workflows/pa-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Contract Tests (Pact) | `.github/workflows/pact.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Deploy Landing Pages + Proof + Circuit Breaker | `.github/workflows/pages-landing.yml` | push, workflow_dispatch, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pages:write, id-token:write | Compliant |
| Stage Proof Artifact | `.github/workflows/pages-stage.yml` | push, workflow_dispatch, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write | Compliant |
| Deploy Pages + Daily Proof | `.github/workflows/pages.yml` | push, workflow_dispatch, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pages:write, id-token:write | Needs concurrency |
| Partner App Review | `.github/workflows/partner-review.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Patch Monthly (Rollup) | `.github/workflows/patch-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Payroll Export (Monthly) | `.github/workflows/payroll-export.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Payroll Quarterly (941) | `.github/workflows/payroll-quarterly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Payroll Semi-Monthly (Calc → Approve → ACH/GL) | `.github/workflows/payroll-semi.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| PD+Jira Smoke (Sandbox) | `.github/workflows/pd-jira-smoke.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| PeopleBot Automation | `.github/workflows/peoplebot.yml` | pull_request_target | @blackboxprogramming/people, @blackboxprogramming/maintainers | (default) | Needs permissions |
| perms-assert | `.github/workflows/perms-assert.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, issues:write | Needs concurrency |
| Pi Agent Crypto Secrets | `.github/workflows/pi-agent-crypto-secrets.yml` | workflow_call, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Procurement PO Export (Monthly) | `.github/workflows/po-export.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| policy-guard | `.github/workflows/policy-guard.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Portal Daily (Digest + Ack Gaps) | `.github/workflows/portal-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Portal Weekly (Engagement Report) | `.github/workflows/portal-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Postmortem Publish | `.github/workflows/postmortem-publish.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| PPM Monthly (Roadmap) | `.github/workflows/ppm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| PPM Weekly (Status + Capacity) | `.github/workflows/ppm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| 🏷️ Auto-label PRs for merge | `.github/workflows/pr-auto-label.yml` | pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| 🔧 PR Auto-Remediation | `.github/workflows/pr-auto-remediate.yml` | workflow_dispatch, workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, checks:write | Needs concurrency |
| PR Auto-Fill | `.github/workflows/pr-autofill.yml` | pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| PR Automation | `.github/workflows/pr-automation.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, issues:write, pull-requests:write | Needs concurrency |
| 🔄 PR Branch Sync | `.github/workflows/pr-branch-sync.yml` | schedule, workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, issues:write | Needs concurrency |
| pr-lightshow-on-comment | `.github/workflows/pr-lightshow-on-comment.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| 🎯 PR Master Orchestrator | `.github/workflows/pr-orchestrator.yml` | pull_request, pull_request_target, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, pull-requests:write, checks:write, statuses:write, issues:write, actions:write | Needs concurrency |
| PR Preview — Vercel | `.github/workflows/pr-preview-vercel.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write | Needs concurrency |
| PR Title Guard | `.github/workflows/pr-title-guard.yml` | pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| PR Triage | `.github/workflows/pr-triage.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | issues:write, pull-requests:write | Needs permissions |
| Quick Pulse PR Welcome | `.github/workflows/pr-welcome-comment.yml` | pull_request_target | @blackboxprogramming/maintainers, @blackboxprogramming/agents | pull-requests:write | Needs permissions |
| Cleanup Preview Containers | `.github/workflows/preview-containers-cleanup.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, packages:write | Needs concurrency |
| PR Preview Containers | `.github/workflows/preview-containers.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, packages:write, pull-requests:write, security-events:write | Needs concurrency |
| preview-environment | `.github/workflows/preview-env.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write, pull-requests:write | Needs concurrency |
| preview-frontend-host | `.github/workflows/preview-frontend-host.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| preview-env | `.github/workflows/preview.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| prism-ci | `.github/workflows/prism-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, checks:write | Compliant |
| prism-containers | `.github/workflows/prism-containers.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| prism-service | `.github/workflows/prism.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Privacy Daily (DSAR + DLP) | `.github/workflows/privacy-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Privacy Monthly (Retention Sweep + Reports) | `.github/workflows/privacy-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Privacy Monthly Report | `.github/workflows/privacy-reports.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Privacy Retention Purge | `.github/workflows/privacy-retention.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Privacy Weekly (Consent & ROPA Audit) | `.github/workflows/privacy-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ProductEngDataBot Automation | `.github/workflows/productengdatabot.yml` | pull_request_target | @blackboxprogramming/product-eng-data, @blackboxprogramming/maintainers | (default) | Needs permissions |
| protect-branch-config | `.github/workflows/protect-branch-config.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| PSA Monthly (Utilization & Margin) | `.github/workflows/psa-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Public API CI | `.github/workflows/public-api-ci.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Publish model to Hugging Face | `.github/workflows/publish-to-hf.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| QBR (Quarterly) | `.github/workflows/qbr.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| QLM Lab Quality Gates | `.github/workflows/qlm_lab.yml` | push, pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write, attestations:write, actions:read | Needs concurrency |
| quality-gates | `.github/workflows/quality-gates.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:read | Needs concurrency |
| Quarter Close | `.github/workflows/quarter-close.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Quick Eval | `.github/workflows/quick-eval.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Quick Quality Gates | `.github/workflows/quick-gates.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| RegionalBot Automation | `.github/workflows/regionalbot.yml` | pull_request_target | @blackboxprogramming/regional, @blackboxprogramming/maintainers | (default) | Needs permissions |
| Register Matomo Webhook | `.github/workflows/register-webhook.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Rego Policy Checks | `.github/workflows/rego-lint.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Product Release Train | `.github/workflows/release-train.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| release | `.github/workflows/release.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:write, packages:write, issues:write | Needs concurrency |
| ReLock-Protections | `.github/workflows/relock-protections.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Renewals Monthly | `.github/workflows/renewals-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Renewals Forecast (Weekly) | `.github/workflows/renewals.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Required Status Checks | `.github/workflows/required-checks.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, pull-requests:write, statuses:write | Needs concurrency |
| Re-run Tests on All Merged PRs | `.github/workflows/rerun-all-merged-tests.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| 🔁 Auto Re-run Failed Jobs (max 3) | `.github/workflows/rerun-failed-jobs.yml` | workflow_run | @blackboxprogramming/maintainers, @blackboxprogramming/agents | actions:write, contents:read, pull-requests:write | Needs concurrency |
| ♻️ Fully Automated Task Runner | `.github/workflows/reusable-automation-task.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Reusable AWS ECS Deploy | `.github/workflows/reusable-aws-ecs-deploy.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Reusable Blue/Green Promotion | `.github/workflows/reusable-bluegreen.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Reusable Canary Promotion | `.github/workflows/reusable-canary.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Reusable Docker Preview Build | `.github/workflows/reusable-docker-preview-build.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, packages:write | Needs concurrency |
| Reusable Fly Deploy | `.github/workflows/reusable-fly-deploy.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Reusable Node 20 Runner | `.github/workflows/reusable-node20.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| RevRec Monthly (Allocate → Schedule → Journal → Pack) | `.github/workflows/revrec-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| RevRec Quarterly (Variance & Disclosures) | `.github/workflows/revrec-quarterly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Partner RevShare (Monthly) | `.github/workflows/revshare.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Ricci CI | `.github/workflows/ricci-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| RoadWork CI | `.github/workflows/roadwork-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| RoadWorld CI | `.github/workflows/roadworld.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Rollback Tests | `.github/workflows/rollback-tests.yml` | pull_request, schedule | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Rotate Secrets | `.github/workflows/rotate-secrets.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Route on comment | `.github/workflows/route-on-comment.yml` | issue_comment | @blackboxprogramming/maintainers, @blackboxprogramming/agents | issues:write, pull-requests:write, contents:read | Needs concurrency |
| Run Job | `.github/workflows/run-job.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Docs & Runbooks | `.github/workflows/runbooks.yml` | pull_request, push, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| sb-ci | `.github/workflows/sb-ci.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Supply Chain • SBOM generator | `.github/workflows/sbom-generate.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, packages:read | Needs concurrency |
| SBOM | `.github/workflows/sbom.yml` | push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| SCIM Reconcile | `.github/workflows/scim-sync.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Publish Public API JS SDK | `.github/workflows/sdk-js-publish.yml` | workflow_dispatch, release | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Publish Public API Python SDK | `.github/workflows/sdk-py-publish.yml` | workflow_dispatch, release | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| secret-scan | `.github/workflows/secret-scan.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Secret Scanning Guardrail | `.github/workflows/secret-scanning.yml` | workflow_dispatch, schedule, push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, security-events:read | Needs concurrency |
| Secrets Monthly (Rotate) | `.github/workflows/secrets-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Secret Scan | `.github/workflows/secrets.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Security Sweep | `.github/workflows/security-sweep.yml` | workflow_dispatch, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| seed-nightly | `.github/workflows/seed-nightly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| 🧠 Semantic PR Title | `.github/workflows/semantic-pr.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | pull-requests:read, checks:write | Needs permissions |
| SLO Nightly | `.github/workflows/slo.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Supply Chain • SLSA container provenance | `.github/workflows/slsa-provenance-container.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write, packages:read | Needs concurrency |
| Supply Chain • SLSA generic provenance | `.github/workflows/slsa-provenance-generic.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write | Needs concurrency |
| Daily PD↔Jira Smoke | `.github/workflows/smoke-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | id-token:write, contents:read | Needs concurrency |
| SOC Detections Lint | `.github/workflows/soc-lint.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| SOC Weekly Posture | `.github/workflows/soc-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| SOC2 Evidence Pack | `.github/workflows/soc2-evidence.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| SOX Annual (Mgmt Assessment + Pack) | `.github/workflows/sox-annual.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| SOX Quarterly (TOD/TOE + SoD) | `.github/workflows/sox-quarterly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Stage Stress (safe) | `.github/workflows/stage-stress.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Compliant |
| stripe-seed | `.github/workflows/stripe-seed.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Super-Linter | `.github/workflows/super-linter.yml` | pull_request, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| Supply Chain Verify | `.github/workflows/supply-chain-verify.yml` | workflow_dispatch, push | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support Daily (SLA + Volume) | `.github/workflows/support-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support KB Publish | `.github/workflows/support-kb-publish.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support Monthly Report | `.github/workflows/support-report.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support SLA Check | `.github/workflows/support-sla.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support Sync | `.github/workflows/support-sync.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Support Weekly (CSAT + KB) | `.github/workflows/support-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| tag-and-release | `.github/workflows/tag-and-release.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Tax Annual (1099/1042-S) | `.github/workflows/tax-annual.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Tax Monthly (Returns + E-Invoices) | `.github/workflows/tax-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Test CI | `.github/workflows/test-ci.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Compliant |
| reusable-test-harness | `.github/workflows/test-reusable.yml` | workflow_call | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, checks:write | Compliant |
| Tests | `.github/workflows/test.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Compliant |
| tests | `.github/workflows/tests.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| time-machine-index | `.github/workflows/time-machine-index.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| timekeys-smoke | `.github/workflows/timekeys-smoke.yml` | push, pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Tokens Daily (Expire) | `.github/workflows/tokens-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Tor • Onion Export (Pi) | `.github/workflows/tor-onion-export.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read | Needs concurrency |
| TPRM Monthly (Risk & Scorecards) | `.github/workflows/tprm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| TPRM Weekly (Issues + Questionnaires) | `.github/workflows/tprm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Treasury Daily (Position + Payments Export) | `.github/workflows/tre-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Treasury Monthly (Interest + Forecast) | `.github/workflows/tre-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Treasury Weekly (Recon + FX) | `.github/workflows/tre-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Treasury Daily (Snapshot + VaR + Policy) | `.github/workflows/treasury-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Treasury Weekly (ALM + Hedges) | `.github/workflows/treasury-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Trivy Image Scan | `.github/workflows/trivy.yml` | pull_request | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| UI Display & Chat CI | `.github/workflows/ui-display-chat-ci.yml` | pull_request, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Uptime Export | `.github/workflows/uptime-export.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Vault OIDC Example (digests only) | `.github/workflows/vault-oidc-example.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | contents:read, id-token:write | Needs concurrency |
| Vendor Attestation (Monthly) | `.github/workflows/vendor-attest.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| vendor-renewal-reminders | `.github/workflows/vendor-renewal-reminders.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Warehouse ELT (Nightly) | `.github/workflows/warehouse-elt.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Warehouse Lineage Refresh | `.github/workflows/warehouse-lineage.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Warehouse Sync | `.github/workflows/warehouse.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| Webhook Delivery Worker | `.github/workflows/webhooks-delivery.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| WFM Daily (Attendance Exceptions) | `.github/workflows/wfm-daily.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| WFM Monthly (Labor Cost) | `.github/workflows/wfm-monthly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| WFM Weekly (Coverage) | `.github/workflows/wfm-weekly.yml` | schedule, workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |
| ZAP Baseline DAST | `.github/workflows/zap-dast.yml` | workflow_dispatch | @blackboxprogramming/maintainers, @blackboxprogramming/agents | (default) | Needs permissions |

> _Last updated by automation. Recent run insights require GitHub API access._