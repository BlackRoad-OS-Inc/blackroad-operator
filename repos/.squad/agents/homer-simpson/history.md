# Homer Simpson — History

## Project Context

**Project:** squad-pod — A VS Code extension bringing animated pixel art offices to Brady Gaster's Squad framework
**User:** Brian Swiger
**Stack:** VS Code Extension (TypeScript, esbuild), React 19 webview (Vite, Canvas 2D pixel art), Squad integration
**Inspiration:** pablodelucca/pixel-agents adapted for bradygaster/squad
**Universe:** The Simpsons

## Core Context

- Lead and architect for the squad-pod project
- Key architectural boundary: extension host (Node.js) ↔ webview (React/Canvas) communication via VS Code messaging API
- The extension reads .squad/ directory state to visualize agent activity as pixel art characters

## Learnings

(New learnings will be appended here as work progresses)

### Telemetry Architecture
- **Event Bus:** We use `postMessage` as a simple event bus. Extension emits, webview renders.
- **Bounded Buffers:** Always cap UI lists (like the telemetry log) to prevent memory leaks in long-running sessions. 200 items is plenty.
- **Type Duplication:** It's okay to duplicate TS interfaces between the extension and webview to keep the build pipelines (esbuild vs Vite) independent. Separation of concerns beats DRY here.

### Telemetry Drawer Review (2026-03-06)
- **Status:** APPROVED
- Reviewed the telemetry drawer feature (event structure, testing approach, architecture).
- Clean protocol with justified type duplication between host and webview.
- Marge's test coverage is solid (9 test cases, 46 total tests passing).
- Bounded buffer approach (200 items) prevents UI memory leaks in long sessions.
- No architectural concerns. Ready to ship.
