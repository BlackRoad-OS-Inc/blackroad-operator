# Prism Console Hardening Ship List

The following tickets focus on error states, empty-data handling, and edge-case tests so the current console features can ship safely to staging.

1. **Graceful data loading on the Prism dashboard** — `prism/apps/web/src/pages/Prism.tsx`
   * Add loading and failure states around the initial `fetch` calls and guard against SSE disconnects so the UI doesn’t sit empty on network errors. 【F:prism/apps/web/src/pages/Prism.tsx†L1-L32】
   * Backstop with tests that mock rejected fetches and verify fallback messaging.

2. **Stabilize SSE clients under network churn** — `prism/apps/web/src/clients/sse.ts`
   * Introduce error listeners + retry/backoff, and ensure we unsubscribe listeners when Fastify closes the stream to avoid memory leaks during reconnect storms. 【F:prism/apps/web/src/clients/sse.ts†L1-L19】
   * Cover reconnect flows with unit tests that stub `EventSource` errors.

3. **Handle empty and long diff lists** — `apps/prism/apps/web/src/components/prism/Diffs.tsx`
   * Protect against `diffs` swapping from populated → empty (selected file becomes `undefined`) and add virtualization or chunking for very large patches before rendering every line. 【F:apps/prism/apps/web/src/components/prism/Diffs.tsx†L8-L52】
   * Add tests for zero diffs, changing selections after data refresh, and oversized patches.

4. **Env panel empty states** — `apps/prism/apps/web/src/components/prism/Env.tsx`
   * Render an explicit “no variables” and “no matches” message when the environment map or filtered results are empty; add formatting for non-string values instead of falling back to `[object Object]`. 【F:apps/prism/apps/web/src/components/prism/Env.tsx†L13-L35】
   * Extend panel tests to cover empty payloads and mixed value types.

5. **Timeline filtering edge cases** — `apps/prism/apps/web/src/components/prism/Timeline.tsx`
   * When a new actor filter is added, the active filter can reference a value that disappears on refresh, leaving the list blank; add guards plus an explicit empty timeline message. 【F:apps/prism/apps/web/src/components/prism/Timeline.tsx†L11-L44】
   * Create tests for actor filters, unknown topics, and zero-event snapshots.

6. **Trace tree resilience** — `apps/prism/apps/web/src/components/prism/Traces.tsx`
   * Guard against deep or cyclic span graphs so recursion cannot blow the stack, and add a collapsed-by-default view for very large traces. 【F:apps/prism/apps/web/src/components/prism/Traces.tsx†L10-L36】
   * Write tests for empty trees, thousands of spans, and orphaned children.

7. **Run lifecycle cleanup on failures** — `apps/prism/server/api/run.ts`
   * The `/runs/:runId/fail` path never deletes the run from `runIndex`, so subsequent events keep landing in memory even after a failure; clear the index entry and add regression coverage. 【F:apps/prism/server/api/run.ts†L114-L152】
   * Add tests to ensure cancelling/failing runs frees the lifecycle and stops accepting new events.

8. **Event cursor integrity** — `apps/prism/server/api/events.ts`
   * If a client supplies a stale `since` cursor that fell out of the in-memory history window, we silently return the full backlog; respond with a 410 or explicit reset signal instead. 【F:apps/prism/server/api/events.ts†L10-L38】
   * Extend API tests to cover cursor misses and very large histories.

9. **Trace exporter bounds** — `apps/prism/server/store/traceExporter.ts`
   * Enforce retention/limit policies and drop spans that reference missing parents before cloning to avoid runaway memory usage. 【F:apps/prism/server/store/traceExporter.ts†L16-L73】
   * Add stress tests that ingest tens of thousands of spans with orphan edges and verify pruning.

10. **Diff applier edge coverage** — `apps/prism/packages/agents/src/runners/coder.ts`
    * `applyUnifiedDiff` lacks tests for files without trailing newlines, multi-hunk additions, or mismatched context; add fixtures and ensure we propagate detailed mismatch errors. 【F:apps/prism/packages/agents/src/runners/coder.ts†L14-L98】
    * Backstop the CLI runner with integration tests that apply patches touching new and deleted files.
