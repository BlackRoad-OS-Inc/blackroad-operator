# Core architecture

`blackroad-os-core` houses the shared vocabulary and data shapes for BlackRoad OS. It purposefully avoids transport, storage, or
UI concerns so that multiple services can share the same primitives without introducing tight coupling.

## Domain slices

- **Identity**: PS-SHA∞ identifiers, anchors, and helpers to label agents, jobs, tasks, and ledger records.
- **Truth**: Types expressing the text verification lifecycle from raw snapshot through aggregated truth state.
- **Events**: Domain event envelopes, journal entries, and RoadChain blocks for tamper-evident audit flows.
- **Agents**: Base metadata, runtime contract, and execution context for autonomous or human-driven workers.
- **Jobs**: Job records and pure lifecycle transitions for consistent state changes.
- **Results**: Lightweight `Result` helpers for success/error propagation.

## Integration points

- Operator uses these shapes to orchestrate agents and jobs while emitting domain events.
- API layers serialize these types to clients and persist journal or ledger data.
- Prism and other UIs visualize events, RoadChain blocks, and truth states using the same schemas.
- Infra and Docs reference the exported types for operational playbooks and documentation.

## Principles

- Pure TypeScript, framework agnostic.
- Barrel exports (`src/index.ts`) expose only stable, intentional API surface area.
- Minimal dependencies and pure functions to keep the library portable across runtimes.
