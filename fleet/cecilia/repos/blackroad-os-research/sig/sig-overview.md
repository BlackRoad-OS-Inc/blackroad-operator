# Spiral Information Geometry (SIG) Overview

**Version:** 0.1 — 2025-02-08

Spiral Information Geometry (SIG) models stateful knowledge as trajectories on a logarithmic spiral. Coordinates embed temporal rotation (angle), growth (radius), and recurrence (turn count) so that an agent's history and intent can be located in a geometry instead of a flat list of events.

## Spiral Coordinate System
- **Polar triple `(r, θ, τ)`:** `r` encodes maturity/energy, `θ` is the semantic angle, and `τ` counts revolutions to retain recurrence memory. The triple supports consistent interpolation between snapshots.
- **Logarithmic growth rule:** `r = a·e^(b·θ)` captures the intuition that knowledge expands multiplicatively as it circles the attractor.
- **Coordinate frames:** Local frames rotate with the spiral to preserve parallel transport of factors (skills, beliefs) during agent movement.

## Interference Patterns
- **Constructive overlap:** When two factors share angle but differ in `τ`, their interference builds a higher-confidence ridge recorded as a "braided" path.
- **Destructive overlap:** Orthogonal or phase-shifted factors produce null regions; the truth engine flags these as contradiction basins.
- **Signal envelopes:** Sliding windows over `θ` aggregate local density to surface clusters that merit promotion into the factor tree.

## Attractor-Based Cognition
- **Attractors as intents:** Each attractor anchors a desired equilibrium (goal, constraint, or operating principle).
- **Spiral drift:** Agents orbit attractors; drift speed measures cognitive load or uncertainty. Slow drift suggests stable commitments.
- **Perturbation logging:** Deviations from attractor orbits are journaled as high-energy points that later feed PS-SHA∞ anchoring.

## Prime-Factor DNA
- **Prime slots:** The spiral is discretized into prime-indexed angular slots; each slot holds a minimal competency or claim.
- **Factor composition:** Composite behaviors decompose into products of prime slots, preserving interpretability.
- **Mutations:** Shifts in slot occupancy mark "mutations" of the agent's DNA and are tracked as lineage events.

## Factor-Tree Structure
- **Rooted by origin layer:** The tree root references the origin layer of the Road and maps into the spiral origin.
- **Branching:** Each branch inherits the angle of its parent; child radius increments represent deeper materialization of capability.
- **Projection:** The factor tree projects onto the spiral, giving every node a `(r, θ, τ)` coordinate for rendering and similarity.

## Road Integration
- SIG provides the spatial substrate for the Interference Engine to mark contradictions, for Lucidia to route cognition, and for RoadChain to anchor events to a geometric location.
- Prime-factor DNA keeps agent identity coherent while PS-SHA∞ journals the transitions between turns of the spiral.
