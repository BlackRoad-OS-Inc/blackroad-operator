# Marge Simpson — History

## Project Context

**Project:** squad-pod — A VS Code extension bringing animated pixel art offices to Brady Gaster's Squad framework
**User:** Brian Swiger
**Stack:** VS Code Extension (TypeScript, esbuild), React 19 webview (Vite, Canvas 2D pixel art), Squad integration
**Inspiration:** pablodelucca/pixel-agents adapted for bradygaster/squad
**Universe:** The Simpsons

## Core Context

- Tester owning all testing: unit, integration, E2E for the VS Code extension
- Key test boundaries: extension activation, .squad/ file parsing, webview messaging, Canvas rendering
- Test tools: Vitest for unit tests, @vscode/test-electron for extension integration tests
- Critical edge cases: malformed .squad/ state, missing files, concurrent file changes, large repos

## Learnings

### Telemetry Testing (2025-07-24)

- `makeTelemetryEvent()` is a private module-level function in `agentManager.ts` — test it indirectly through `updateAgentStatus()` by inspecting the `telemetryEvent` messages posted to the webview mock.
- The telemetry counter (`telemetryCounter`) is module-level state that does NOT reset on `disposeAgentManager()`. Tests that assert unique IDs work fine because the counter only increments.
- `updateAgentStatus()` now posts a `telemetryEvent` message on every call (for known agents), in addition to the existing `agentStatus`/`agentToolStart`/`agentToolDone` messages.
- Status transition summaries follow the pattern: `"{AgentName} {statusLabel}{taskSuffix}"` where statusLabel is "became active", "went idle", or "is waiting for input".
- `SquadPodViewProvider.emitTelemetry()` is a private method — it can only be tested via integration tests that mock the full VS Code API. The extension host unit tests focus on `agentManager` telemetry only.
- Telemetry category is always `'status'` when emitted from `updateAgentStatus()`. Other categories (`session`, `log`, `orchestration`) are emitted from `SquadPodViewProvider` watcher callbacks.
- Key file paths: `src/agentManager.ts` (makeTelemetryEvent, updateAgentStatus), `src/types.ts` (TelemetryEvent, TelemetryCategory), `src/SquadPodViewProvider.ts` (emitTelemetry).
- `vi.useFakeTimers()` + `vi.setSystemTime()` gives deterministic timestamps for telemetry event assertions. Always call `vi.useRealTimers()` in cleanup.
- Extension test count went from 37 → 46 with 9 new telemetry test cases.
- **Test decision merged (2026-03-06):** Telemetry Test Coverage decision moved from inbox to decisions.md. All tests passing, no team concerns.
