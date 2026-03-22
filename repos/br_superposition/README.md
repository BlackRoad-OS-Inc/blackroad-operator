# BlackRoad / Amundson Superposition Module

This module implements the mathematical framework for agent beliefs and identities based on quantum-inspired superposition principles.

## Overview

The module separates two categories of equations:

### BlackRoad Equations (Established Quantum Mechanics)
- **Born Rule**: `pᵢ = |aᵢ|²` - Probability from amplitude
- **Shannon Entropy**: `H = -Σ pᵢ log₂(pᵢ)` - Uncertainty measure
- **Normalization**: `Σ |aᵢ|² = 1` - Amplitude constraint
- **Measurement Collapse**: Projective measurement causing state collapse

### Amundson Equations (Novel Extensions)
- **Contradiction Energy**: `K(t) = C × exp(λ × |Δ|)` - Cost of contradictions
- **Phase Gap**: `max |θᵢ - θⱼ|` - Coherence measure across high-weight states
- **Temperature Transform**: `pᵢ(T) ∝ pᵢ^(1/T)` - Distribution sharpening/flattening
- **Partial Collapse**: `p'ᵢ = (1-μ)pᵢ + μqᵢ` - Soft measurement backaction
- **Spiral Mapping**: Polar visualization of superposition states

## Components

### `SuperposedVariable`
Represents a variable in superposition with complex amplitudes.

```python
from br_superposition import SuperposedVariable

# Create a superposed belief
amplitudes = {
    True: 0.6 + 0.3j,
    False: 0.5 - 0.4j,
}
belief = SuperposedVariable(amplitudes)

# Get probabilities (Born rule)
probs = belief.probabilities()

# Calculate entropy
entropy = belief.entropy()

# Apply temperature transform
sharpened = belief.with_temperature(T=0.5)  # Sharper
flattened = belief.with_temperature(T=2.0)  # Flatter
```

### `Agent`
An entity with superposed beliefs and identities.

```python
from br_superposition import Agent, SuperposedVariable

agent = Agent()

# Add beliefs
belief = SuperposedVariable({True: 0.7+0j, False: 0.3+0j})
agent.add_belief("should_launch", belief)

# Hard measurement (full collapse)
outcome = agent.measure_hard("should_launch")

# Soft measurement (partial collapse)
outcome = agent.measure_soft("should_launch", strength=0.1)
```

### `Orchestrator`
Manages measurement operations with coherence budget tracking.

```python
from br_superposition import (
    Orchestrator,
    CoherenceBudget,
    MeasurementConfig,
)

# Create orchestrator with budget
orchestrator = Orchestrator(CoherenceBudget(value=100.0))

# Configure measurement
config = MeasurementConfig(
    strength=0.1,  # Soft measurement
    temperature_shift=None,
    cost_multiplier=1.0,
)

# Perform measurement
outcome, success = orchestrator.measure(
    agent=agent,
    var_name="should_launch",
    config=config,
    mode="belief",
)

# Check remaining budget
budget = orchestrator.get_budget()
```

## Utility Functions

```python
from br_superposition import (
    phase_gap,
    contradiction_energy,
    spiral_mapping,
)

# Phase gap (coherence measure)
gap = phase_gap(amplitudes)

# Contradiction energy
K = contradiction_energy(C=1.0, delta=0.5, lam=2.0)

# Spiral coordinates for visualization
coords = spiral_mapping(amplitudes)
```

## Running the Demo

```bash
cd br_superposition
python demo.py
```

The demo shows:
1. Creating an agent with conflicting beliefs
2. Analyzing initial state (probabilities, entropy, phase gap, K(t))
3. Soft measurements (μ ~ 0.1) with minimal change
4. Hard measurements (μ ~ 1.0) causing full collapse
5. Coherence budget tracking

## Testing

```bash
pytest br_superposition/
```

## Integration

This module can be integrated with:
- **Lucidia Viewer**: Visualize belief states as spiral plots
- **Prism Console**: Track agent state evolution over time
- **Decision Systems**: Use superposition for multi-hypothesis reasoning
