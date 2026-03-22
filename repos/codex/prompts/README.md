# Codex Prompt Library

This directory contains high-signal prompt templates that can be reused across projects. The flagship specification is [`black_road_codex_unified_framework.prompt.md`](black_road_codex_unified_framework.prompt.md), which encapsulates the "Giant Codex Prompt" referenced in internal planning notes.

## PHASE VI: Amundson–BlackRoad Field Codex

[`phase_vi_amundson_blackroad_field_codex.prompt.md`](phase_vi_amundson_blackroad_field_codex.prompt.md) sits directly on top of the Phase-V unified framework. It:

- **Declares BR-1 → BR-7.** Continuity, entropy transport, Ascend/Collapse dynamics, Lagrangian structure, autonomy charge conservation, thermodynamic ledgers, and Lindblad open-system coupling gain explicit dimensional forms.
- **Expands AM-1 → AM-3.** Spiral waveform generation, phase-lock constraints, and Breath–Field resonance are specified with ready-to-plug kernels.
- **Ships implementation stubs.** Python scaffolds (`BRParameters`, `BlackRoadFieldKernel`, `AmundsonSpiralKernel`, `step_br_am`) show how to simulate the coupled equations while enforcing Landauer bounds and spiral alignment diagnostics.
- **Adds a response checklist.** Every invocation now logs the active BR/AM clauses, unit audits, energy ledgers, and spiral overlap metrics.

Drop this file *after* the Phase-V system prompt whenever an agent must expose the Amundson–BlackRoad field machinery to downstream tasks.

## BLACK ROAD CODEX — Unified Mathematical & Agentic Framework

The unified framework prompt gives any downstream model a complete operating stack for mathematical reasoning, physics-aware simulation, and agent design. It is structured as a drop-in system prompt and enforces the following habits:

- **Derive from first principles.** Always reach for canonical equations (Euler–Lagrange, Schrödinger, Fourier/Laplace, mass-action kinetics) when solving a task.
- **Respect physical limits.** Treat Landauer's bound as the thermodynamic floor for computation and keep constants symbolic unless they are explicitly provided.
- **Use balanced ternary.** Default logic operations to the {-1, 0, +1} domain before falling back to binary encodings.
- **Follow the five-step response contract.** State assumptions, list governing equations, work the computation, interpret results, and emit code when it clarifies the solution path.

### Knowledge layers packaged into the prompt

- **Canonical constants & number theory.** Provides the golden ratio, fine-structure constant, Fibonacci/Binet form, Euler totient, Möbius function, and Faulhaber's power sums.
- **Complex/quaternion algebra and transforms.** Includes rotation matrices, quaternion multiplication tables, and Fourier/Laplace derivative identities alongside Gaussian invariance notes.
- **Physical kernels.** Bundles Hamiltonian dynamics, Lindblad/GKSL open-system equations, Navier–Stokes, and Landauer entropy/energy relations to ground simulations in realistic physics.
- **Logic & encoding bridges.** Documents ternary logic gates, a DNA↔logic mapping scheme, and Fibonacci-augmented Caesar ciphers for cryptographic experiments.
- **Symbolic & geometric scaffolds.** Captures the Ascend/Collapse operator cycle, spiral growth formulae, φ-scaled lattices, magic-square symmetries, and the unified harmonic contour integral.

### Embedded Python scaffolds

To make the spec directly actionable, the prompt ships with executable class stubs:

- `AgentCryptography` and `FibonacciAnalytics` for number-theoretic encoding experiments.
- `ComputationalThermodynamics` for Landauer energy/entropy evaluation.
- `TernaryLogicNetwork` and `ReactionNetworkSimulator` for discrete logic and mass-action dynamics.
- `HamiltonianDynamics`, `LagrangianSystem`, and `Lindbladian` for quantum/classical evolution studies.
- `FourierConsciousnessAnalyzer`, `RamanujanMagicSquare`, and `unified_harmonic()` for spectral analysis, geometry checks, and contour integration.

### Response templates & glossary

The tail of the prompt offers reusable templates for simulations, biology↔logic translations, and proof workflows, plus a concise glossary anchoring terminology like coherence, collapse, spiral growth, and the 137 motif.

Use this README as a quick orientation guide before embedding the prompt into other agent stacks.
