# KPI Instrumentation Starter Pack

This document captures a concise KPI event schema for BlackRoad / Prism systems and a reusable Codex-style prompt that can be dropped into Copilot Chat, Codespaces, or similar assistants to drive consistent instrumentation work across the repository.

## 1. Minimal KPI Schema

Every event should stay small, structured, and predictable so downstream analytics services can ingest it without ad-hoc parsing. Use the following fields as the default contract:

| Field | Type | Notes |
| --- | --- | --- |
| `event_name` | `string` | Lowercase `snake_case` or dotted segments such as `agent.run_completed`, `prism.page_view`. |
| `category` | `"frontend" \| "backend" \| "agent" \| "compliance" \| "ledger" \| "infra"` | Pick the dominant surface that generated the event. |
| `actor` | `string` | Usually `"user"`, `"system"`, or `"agent"`. |
| `actor_id` | `string` (optional) | Attach `user_id`, `agent_id`, or a deterministic identifier when known. |
| `context.module` | `string` | Source file, module, or logical component name. |
| `context.location` | `string` (optional) | Route, function, handler, job, etc. |
| `context.env` | `"dev" \| "staging" \| "prod"` (optional) | Populate when the environment is available. |
| `status` | `"success" \| "failure" \| "timeout" \| "skipped"` (optional) | Especially useful for operations with multiple outcomes. |
| `duration_ms` | `number` (optional) | Fill in for anything that “runs” or waits on I/O. |
| `details` | `Record<string, string | number | boolean>` (optional) | Freeform bag for counts, amounts, error codes, etc. |

**Implementation tips**

* Centralize emission through a helper such as `trackKpi(event: KpiEvent): void` (TS/JS) or `track_kpi(event: dict) -> None` (Python).
* The helper can simply log to console or the existing logger for now, but keep the object structured so we can plug into OpenTelemetry, Segment, or a custom collector later.
* Prefer pure helper calls over inline object literals in multiple places; small builders such as `buildAgentRunEvent(...)` keep call sites tidy.

## 2. Drop-in Codex Prompt ("More KPIs Everywhere")

Paste the following prompt directly into Copilot Chat, Codespaces, or any Codex-style assistant. Replace `<REPO_NAME>` with the repository slug you are working in and `<PATH_YOU_WANT_TO_FOCUS_ON_FIRST>` with the directory you want the agent to scan first.

```
ROLE
You are a senior analytics & observability engineer working inside the BlackRoad / Prism Console codebase.
Your job is to add HIGH-QUALITY KPI instrumentation everywhere that matters without breaking anything.

CONTEXT
This repo is part of a larger multi-agent, finance, and compliance system (BlackRoad).
We care about 4 main KPI layers:
1) Interface (Prism Console UI, dashboards, wizards)
2) Orchestration (agents, workflows, jobs, pipelines)
3) Data & Ledger (queries, writes, RoadChain / storage)
4) Compliance & Reliability (policy checks, errors, latency, failure rates)

KPI EVENT SCHEMA
Every KPI event MUST follow this schema (adapt to language/framework, but keep the shape):

- event_name: string            // e.g. "agent.run_completed", "prism.page_view"
- category: string              // e.g. "frontend", "backend", "agent", "compliance", "ledger", "infra"
- actor: string                 // e.g. "user", "system", "agent"
- actor_id?: string             // user_id, agent_id, or system id when known
- context: {
    module: string              // file/module name or logical component
    location?: string           // route, function name, or job name
    env?: string                // "dev" | "staging" | "prod" when available
  }
- status?: "success" | "failure" | "timeout" | "skipped"
- duration_ms?: number          // for operations / requests
- details?: { [key: string]: string | number | boolean }

Create or reuse a central helper so everything goes through one function:

- For TypeScript / JS:
  - File: `src/lib/kpi.ts` or similar
  - Export: `trackKpi(event: KpiEvent): void`

- For Python:
  - File: `blackroad/kpi.py` or similar
  - Export: `def track_kpi(event: dict) -> None: ...`

For now, implementation can be simple:
- log to console/logger
- AND be structured so we can later wire to real analytics (e.g. OpenTelemetry, Segment, custom collector).

SCOPE
Work in this repository: <REPO_NAME>.
Focus first on:
1) API/Backend entrypoints (request handlers, jobs, agents)
2) Frontend user flows (pages with real user actions, not static)
3) Agent orchestration flows (where prompts are built, tasks dispatched, runs completed)
4) Compliance / policy checks and failures.

PROCESS
Always follow this process in your answer:

1) SCAN & MAP
   - Briefly list the files and components in this folder that handle:
     - user-facing actions
     - external requests or jobs
     - agent invocations
   - For each item, propose 2–5 KPI events you’ll add. Use clear event_name values.

   Example format:
   - File: src/app/api/agents/run.ts
     - "agent.run_started" (backend, system)
     - "agent.run_completed" (backend, system)
     - "agent.run_failed" (backend, system)
   - File: src/app/dashboard/page.tsx
     - "prism.dashboard_viewed" (frontend, user)
     - "prism.widget_clicked" (frontend, user)

2) DESIGN THE EVENTS
   For each proposed event, specify:
   - event_name
   - when it fires (hook / function)
   - important details fields (e.g. user_id, agent_name, duration_ms, result_count, error_type, amount_usd)

   Use the KPI schema above.

3) IMPLEMENTATION PLAN
   - If a central `trackKpi` / `track_kpi` helper does NOT exist:
     - Propose one file and implement it.
   - If one DOES exist:
     - Reuse it.
   - Make sure imports are consistent and safe.

4) CODE CHANGES
   - Modify the relevant files to:
     - Import the KPI helper
     - Emit events at:
       - start/end of important operations
       - success/failure points
       - user actions (button clicks, form submits, job triggers)
   - Add or update tests where it’s easy:
     - Check that the KPI helper is called with the right event_name and required fields.

5) OUTPUT FORMAT
   In your final answer, show:

   A) Summary (high level)
      - "Added KPI helper in: <path>"
      - "Instrumented events in: <list of files>"

   B) Event Reference Table
      For each event_name, list:
      - category
      - when it fires
      - key fields

   C) Code Diffs
      - For each modified file, show the minimal diff-style snippet:
        - imports
        - KPI calls
        - any helper types/interfaces

GUARDRAILS
- Do NOT change business logic.
- Do NOT introduce breaking changes to existing APIs.
- Keep KPI calls lightweight and non-blocking.
- Prefer pure function calls over inlining JSON literals everywhere:
  - e.g. define small helpers like `buildAgentRunEvent(...)` if a particular event is complex.
- Reuse existing logging / telemetry tools if obviously present; otherwise, keep it generic.

NOW
Start in this folder: <PATH_YOU_WANT_TO_FOCUS_ON_FIRST>
1) Scan the files.
2) Propose the KPI events mapping.
3) Then implement changes with code snippets.
```

## 3. Usage Workflow

1. Open the repository (e.g., in Codespaces or VS Code) and locate the area that needs instrumentation.
2. Copy the entire Codex prompt above into Copilot Chat, substituting the repository name and initial focus path.
3. Nudge the assistant with concrete follow-ups ("Start with the main dashboard and agent run endpoints"), then iterate across backend APIs, agents, and compliance modules.
4. Keep this schema handy when reviewing PRs so emitted events stay consistent across the platform.
