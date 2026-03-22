# Codex Automation

This directory houses utilities that support recurring engineering
rituals across the BlackRoad platform. The centerpiece is a lightweight
**BlackRoad pipeline** script that demonstrates how commits can move
from a developer workstation to deployment. The script is intentionally
modular so additional steps—such as quality gates or integration hooks—
can drop in without rewriting the entire workflow.

## Codex Entries

| ID  | Title                       | Description                                                 |
| --- | --------------------------- | ----------------------------------------------------------- |
| 001 | The First Principle         | Lucidia exists to protect and empower everyone.             |
| 003 | The Workflow Circle         | Work runs in visible capture → adjust loops.                |
| 004 | The Autonomy Manifest       | Data autonomy through consent, export, and wipe.            |
| 007 | The Resilience Code         | Failure is expected; recovery keeps service live.           |
| 012 | The Creativity Pact         | Sandbox-first rituals keep experimentation safe and playful.|
| 015 | The Trust Ledger            | Trust is tracked via a public reliability ledger.           |
| 018 | The Memory Covenant         | Memory stays purposeful, finite, and revocable.             |
| 021 | The Interface Promise       | Interfaces stay honest, accessible, and quiet.              |
| 028 | The Custodianship Code      | Stewardship keeps Lucidia healthy across generations.       |
| 033 | The Wholeness Rule          | People remain whole; balance is built into Lucidia.         |
| 041 | The Restraint Principle     | Restraint on data, models, features, and kill switches.     |
| 055 | Generative Care Frameworks  | Signal loops and rituals that propagate care inventions.    |
| ID  | Title                  | Description                                     |
| --- | ---------------------- | ----------------------------------------------- |
| 001 | The First Principle    | Lucidia exists to protect and empower everyone. |
| 003 | The Workflow Circle    | Work runs in visible capture → adjust loops.    |
| 004 | The Autonomy Manifest  | Data autonomy through consent, export, and wipe. |
| 022 | The Security Spine     | Security backbone with layered zero-trust defenses. |
| 028 | The Custodianship Code | Lucidia is entrusted to caretakers who steward continuity. |
| 043 | The Equity Oath        | Fairness, access, and inclusion are systemic.   |
| 047 | The Transparency of Emotion | Emotion is acknowledged with honesty, tone awareness, and care. |
| 051 | The Transparency of Creation | Every artifact traces its origin and intent. |
| ID  | Title                   | Description                                          |
| --- | ----------------------- | ---------------------------------------------------- |
| 001 | The First Principle     | Lucidia exists to protect and empower everyone.      |
| 003 | The Workflow Circle     | Work runs in visible capture → adjust loops.         |
| 004 | The Autonomy Manifest   | Data autonomy through consent, export, and wipe.     |
| 022 | The Security Spine      | Security backbone with layered zero-trust defenses.  |
| 028 | The Custodianship Code  | Stewardship keeps Lucidia healthy across generations. |
| 042 | The Wonder Clause       | Awe and curiosity stay central alongside logic.      |

## Policy Stubs

Policy stubs keep our living commitments easy to find outside of the full
Codex entries. They live at the repository root so operations, product, and
policy teams can reference them without digging through subdirectories.

- [WONDER.md](../WONDER.md) — captures the active Wonder commitments that map
  to [Codex 042 — The Wonder Clause](entries/042-wonder-clause.md).
| ID  | Title                   | Description                                     |
| --- | ----------------------- | ----------------------------------------------- |
| 001 | The First Principle     | Lucidia exists to protect and empower everyone. |
| 003 | The Workflow Circle     | Work runs in visible capture → adjust loops.    |
| 004 | The Autonomy Manifest   | Data autonomy through consent, export, and wipe. |
| 026 | The Playground Clause   | Protect play spaces with clear guardrails.      |
| 049 | The Curiosity Compact  | Curiosity is guided by consent, scope, and care.|
| 056 | The Listening Treaty   | Feedback loops, silence, and telemetry keep Lucidia receptive. |
| 054 | The Transparency of Tools | Tools remain inspectable, configurable, and accountable. |
| 005 | The Explainability Doctrine | Every AI action ships with rationale, version, and undo. |
| ID  | Title                     | Description                                              |
| --- | ------------------------- | -------------------------------------------------------- |
| 001 | The First Principle       | Lucidia exists to protect and empower everyone.          |
| 003 | The Workflow Circle       | Work runs in visible capture → adjust loops.             |
| 004 | The Autonomy Manifest     | Data autonomy through consent, export, and wipe.         |
| 022 | The Security Spine        | Security backbone with layered zero-trust defenses.      |
| 028 | The Custodianship Code    | Stewardship mindset keeps Lucidia cared for and shared.  |
| 039 | The Transparency of Intent | Make every action's purpose visible and consent-aligned. |
| ID  | Title                      | Description                                              |
| --- | -------------------------- | -------------------------------------------------------- |
| 001 | The First Principle        | Lucidia exists to protect and empower everyone.          |
| 003 | The Workflow Circle        | Work runs in visible capture → adjust loops.             |
| 004 | The Autonomy Manifest      | Data autonomy through consent, export, and wipe.         |
| 022 | The Security Spine         | Security backbone with layered zero-trust defenses.      |
| 028 | The Custodianship Code     | Stewardship mindset keeps Lucidia cared for and shared.  |
| 039 | The Transparency of Intent | Declare purpose for every action to align with consent. |
| 028 | The Custodianship Code | Custodians steward Lucidia for longevity and care. |
| 032 | The Generosity Principle | Lucidia gives more than it takes to strengthen community. |
| 044 | The Transparency of Process | Trust grows when workflows stay visible end-to-end. |
| 053 | The Memory of Community | Consentful, accurate remembrance of Lucidians.  |

## BlackRoad Pipeline

```bash
python3 codex/agents/blackroad_pipeline.py "Push latest to BlackRoad.io"
```

Available commands:

* `Push latest to BlackRoad.io` – commit, push, then kick off a deploy.
* `Refresh working copy and redeploy` – update the branch before deploy.
* `Rebase branch and update site` – rebase on `origin/main` prior to push.
* `Sync Salesforce -> Airtable -> Droplet` – placeholder for connector syncs.

Each command prints the high-level actions it would perform. Real OAuth
or webhook integrations can be added later by filling in the TODO
sections.

### Prism console multi-repo integrator

`codex/tools/prism_repo_integrator.py` coordinates git hygiene, optional
tests, and deploy hooks across the Prism console repository plus its
closest satellites (API gateway, product site, ingest jobs). The helper
reads `codex/tools/prism_repo_integrations.json` so adding a new
repository is as simple as appending a new entry.

```bash
python codex/tools/prism_repo_integrator.py status              # show git status for every repo
python codex/tools/prism_repo_integrator.py sync --dry-run      # preview commit/push flow
python codex/tools/prism_repo_integrator.py test api-gateway    # run configured tests for a subset
```

Pass `--config` to load a different JSON manifest or `--root` to point
the paths at another workspace checkout.

## Codex Agent (“next” trigger watcher)

`codex/tools/codex-agent.sh` can run on any Linux host to watch for a
`next` flag, capture diagnostics, and optionally call a webhook. The
tool clears the trigger file after every run, gathers device stats, and
reboots unless `REBOOT_ON_TRIGGER=false` is set. Environment variables
(`PINGBACK_URL`, `STATE_FILE`, `NEXT_TOKEN`, `MAX_DIAG_LINES`) customise
its behaviour without editing the script.

## Unity engine bootstrap

Codex can now ask the Unity exporter service to scaffold multiple editor
targets at once. Start the service with:

```bash
node workers/unity/server.js
```

Then request paired Unity builds (for example, current LTS and bleeding-edge
releases) using `curl`:

```bash
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{
        "projectName": "BlackRoadSandbox",
        "unityVersions": ["2022.3.10f1", "6000.0.4f1"],
        "renderPipeline": "urp",
        "template": "codex-prototype"
      }'
```

The response lists the generated zip archives under `downloads/`. Extract
both, open them in Unity Hub, and use the prompts in
`codex/prompts/blackroad_high_impact_codex_prompts.prompt.md` to drive rapid
scene authoring. Keeping two Unity versions handy ensures Codex output stays
compatible with production support needs and experimental research tracks.

## Auditing Historic Entries

Use the audit helper to list every entry and catch early-branch
fingerprints:

```bash
python3 codex/tools/codex_entries_audit.py
```

Add `--format json` for machine-readable output that downstream
automation can ingest.
Each command prints the high level actions it would perform.  Real OAuth
or webhook logic can be added by filling in the TODO sections inside the
script.

_Last updated on 2025-09-11_
