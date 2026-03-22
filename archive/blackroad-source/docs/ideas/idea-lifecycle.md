# Idea Lifecycle

## 1. Raw Ideas
- Anything goes: discord-like fragments, screenshots (linked), voice transcripts, and rough sketches.
- Capture quickly without worrying about polish.
- Stored in `/ideas/raw/`.

## 2. Concept Cards
- Refine promising raw ideas into a single structured page.
- Stored in `/ideas/concepts/`.

## 3. Proposals
- Expand concepts into richer specs detailing:
  - goals
  - non-goals
  - user flows
  - agent flows
  - risks
- Stored in `/ideas/proposals/`.

## 4. RFC (Optional but recommended)
- Formalize cross-system changes when they impact:
  - operator
  - core
  - infra
  - schemas
  - financial/compliance-sensitive surfaces
- Stored in `/rfc/`.

## 5. Implementation
- Work is assigned to `blackroad-os-operator` and any supporting repos.
- Track progress via linked issues, PRs, and registry updates.

## 6. Release
- Shipped functionality recorded in `/roadmap/` by quarter or half.
- Link back to concepts, proposals, and RFCs that motivated the release.
