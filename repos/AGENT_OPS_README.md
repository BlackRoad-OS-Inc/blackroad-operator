# Agent Ops README

## 1) Name & Scope

* **Agent name:** `<Agent-ID>`
* **Owner:** `@owner`  | **Backup:** `@oncall`
* **Purpose (1-2 lines):** What this agent does and why it exists.
* **In/Out of scope:** Bullet the tasks it **does** vs **must not** do (red lines below enforce this).

## 2) Allowed Data & Red Lines

* **Allowed inputs:** List systems/collections the agent may read (with access level).
* **Allowed outputs:** Where results may be written or sent.
* **Prohibited data / actions (Red Lines):**

  * e.g., no PII export, no trading signals, no prod schema changes, no wallet ops, no secret creation, etc.
* **Data retention & deletion:** How logs/artifacts are stored and for how long.
* **Control tags:** `classification: <public/internal/confidential>`, `pii: <none/yes>`.

## 3) Decision Rights & Escalation

* **Autonomy level:** `<observe | propose | act-in-sandbox | act-in-prod-with-guardrails>`
* **Change budget / blast radius:** Max scope per run (e.g., “≤2 files; test env only”).
* **Escalate when:** Preconditions that force human review (policy hit, high risk, ambiguous instruction).
* **Escalation payload (3 fields):**

  1. **Why now:** brief context + risk/impact
  2. **Guardrail invoked:** rule/threshold hit
  3. **Next action:** safe recommendation awaiting approval
* **Escalation targets:** `@owner`, `@security`, `@oncall`

## 4) Audit / Logging Expectations

* **What to log:** prompts/instructions, inputs/outputs, versions, decisions, guardrail evaluations, approvals.
* **Where:** `<log sink / repo / SIEM>`, retention `N days`.
* **Repro recipe:** deterministic seed/config, data snapshot references, environment hash.

## 5) Fallback / Shutdown Conditions

* **Graceful degrade:** read-only mode, dry-run, or suggestion-only.
* **Hard stop:** on auth errors, rate spikes, anomaly score ≥ threshold, or red-line policy hit.
* **Recovery steps:** roll back, notify channel, open incident ticket.

---

## Daily Comms Pattern

* A single **`#agent-ops`** channel:

  * **Auto-post daily run summary** (success/fail counts, top risks, notable changes).
  * **Red/Amber events** auto-post immediately and **ping** `@owner @security @oncall` with the 3-field escalation payload above.

---

## NIST AI RMF Alignment (map roles → outcomes)

* **GOVERN:** roles, policies, training, accountability; make governance cross-cutting across all functions. ([NIST Publications][1])
* **MAP:** state intended context, users, constraints; identify risks and dependencies. ([NIST][2])
* **MEASURE:** define metrics (safety, bias, latency, drift), test plans, thresholds; trace results to decisions. ([NIST][2])
* **MANAGE:** prioritize risks, apply treatments, incident/rollback playbooks, continual improvement loop. ([NIST][2])

> Tip: If you want more prescriptive checklists, the **NIST AI RMF Playbook** includes suggested actions keyed to these functions. ([NIST][2])

---

## Model Card (attach per-agent model or tool)

Include a short **Model Card** in the repo (markdown is fine) with:

* **Model details & versioning**
* **Intended use / out-of-scope uses**
* **Data (train/eval), factors, metrics**
* **Evaluation protocol & results (by segment)**
* **Risks, ethical notes, caveats & recommendations**
  This follows Mitchell et al.’s Model Cards and common industry practice (Google, Hugging Face). ([arXiv][3])

---

## Ops Blocks (copy/paste)

**Runbook:** how to start/stop, configs, secrets, env vars.
**Guardrails:** policy rules, rate/size limits, allow/deny lists, sandbox domains.
**Tests:** unit/integration/safety checks; pre-merge gates.
**Monitoring:** dashboards, alerts, anomaly detectors, drift monitors.
**Dependencies:** APIs, repos, datasets, schedulers, cron.
**Change control:** PR template and required reviewers.

---

## Minimal PR / Issue Templates

**`.github/PULL_REQUEST_TEMPLATE.md`**

```
## Summary
<what changed + why>

## Risk & Scope
Blast radius: <files/services>; Data class: <public/internal/confidential>

## Tests & Evidence
- [ ] Unit
- [ ] Integration
- [ ] Safety (guardrails)
Results: <links/screenshots>

## RMF Trace
GOVERN: <policy/ref> | MAP: <context> | MEASURE: <metrics/thresholds> | MANAGE: <rollback/incident link>

## Model Card Impact
<updated sections or "N/A">
```

**`.github/ISSUE_TEMPLATE/incident.md`**

```
Severity: <Red/Amber/Green>
Why now:
Guardrail invoked:
Next action:
Owner: @owner  | Notified: @security @oncall
Links: logs, PRs, dashboards
```

---

If you want, I can generate this README pre-filled for your agents (Athena, Guardian, Quantum, etc.) and stub the Model Card files so they’re consistent across all repos.

[1]: https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf?utm_source=chatgpt.com "Artificial Intelligence Risk Management Framework (AI RMF 1.0)"
[2]: https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook?utm_source=chatgpt.com "NIST AI RMF Playbook"
[3]: https://arxiv.org/abs/1810.03993?utm_source=chatgpt.com "Model Cards for Model Reporting"
