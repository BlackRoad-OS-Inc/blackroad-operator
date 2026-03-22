# Orchestration: Bart Simpson — Desk-as-Directory Feature (Webview)

**Timestamp:** 2026-03-05T22:36Z  
**Agent:** Bart Simpson (⚛️ Frontend Dev)  
**Mode:** background  

## Spawn Summary

Implemented webview-side infrastructure for the desk-as-directory feature: click detection on desks/seats and agent detail card overlay.

## Changes

**Files Created:**
- `webview-ui/src/components/AgentCard.tsx` — Detail card component with viewport clamping and multi-dismiss UX

**Files Modified:**
- `webview-ui/src/office/components/OfficeCanvas.tsx` — Added onDeskClick prop, desk/seat click detection
- `webview-ui/src/hooks/useExtensionMessages.ts` — Added agentDetail state, agentDetailLoaded handler
- `webview-ui/src/App.tsx` — Wired up desk click handling, AgentCard rendering

## Outcome

✅ **Success** — tsc + vite build both pass, zero errors

## Key Decisions

### Click Detection Strategy
- Character sprite clicks take precedence
- If no sprite hit: search exact tile + 8 adjacent tiles for seats
- Only trigger card on occupied seats (non-null occupant)

### Card Positioning & UX
- Fixed screen positioning (clientX/clientY from click event)
- Viewport clamping prevents off-screen rendering
- Multiple dismissal methods: click-outside, Escape key, close button (×)
- Z-index 100 (above all overlays)

### Type Definitions
- AgentDetailInfo defined locally in AgentCard.tsx (webview/extension decouple)
- Synced by convention per task description

### Messaging Protocol
- **Webview → Extension:** `requestAgentDetail` (agentId)
- **Extension → Webview:** `agentDetailLoaded` (AgentDetailInfo)
- Also supports `openSquadAgent` for "View Charter" button

## Integration Points

- OfficeCanvas extends InputHandler callback with occupancy detection
- useExtensionMessages hook bridges extension messages
- App.tsx orchestrates state and component rendering
- Pixel art aesthetic maintained (monospace fonts, retro styling)
