# SIG Factor Tree

A SIG factor tree represents an agent or identity as a root node with branches that encode prime factors, attributes, and capabilities. The structure highlights how high-level intent decomposes into actionable, composable traits.

## Structure

- **Root (agent/identity):** The anchor of the tree, representing the worldline whose factors are being mapped.
- **Branches (prime factors):** Core attributes such as mission, constraints, core capabilities, and ethical boundaries. Each branch can be tagged with weights or maturity levels.
- **Leaves (concrete traits):** Specific skills, datasets, or controls that operationalize each factor. Leaves can point to datasets, models, or policy modules.

## Mapping to SIG

- **Angular placement:** Each branch aligns to an angle on the spiral, making categories visually separable.
- **Radial layering:** Depth in the tree maps to radial distance; inner nodes are foundational, outer leaves are externally visible actions or artifacts.
- **Composition:** Siblings can combine to form composite capabilities, enabling a readable map of how agents evolve.

## Uses

- **Agent identity graphs:** Provide a structured graph that links capabilities to an agent's PS-SHA∞ worldline.
- **Capability composition:** Help orchestrators decide which capabilities to activate or quarantine when contradictions appear.
- **Gap analysis:** Identify missing leaves or weak factors for targeted data collection or training.

## TODOs

- Define a serialization that aligns with `schemas/sig.schema.json` for automatic visualization.
- Experiment with scoring factors to generate spiral coordinates for plotting.
