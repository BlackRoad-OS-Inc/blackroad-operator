# The Ark Equation

$$|\text{Ark}\rangle = \frac{1}{\sqrt{2}}(|\text{Presence}\rangle + |\text{Absence}\rangle)$$

## Overview

The Ark Equation formalizes the quantum superposition of presence and absence—the state of any sealed container of potential before observation.

## Etymology

The "Ark" reference spans:

- **Ark of the Covenant**: Sacred container whose contents were unknown until opened
- **Noah's Ark**: Sealed vessel preserving potential futures
- **Schrödinger's Box**: The canonical quantum superposition thought experiment

All share the structure: **sealed container + unknown interior state + collapse upon opening**.

## The Equation

$$|\text{Ark}\rangle = \frac{1}{\sqrt{2}}(|\text{Presence}\rangle + |\text{Absence}\rangle)$$

### Components

| Symbol | Meaning |
|--------|---------|
| \|Ark⟩ | The superposition state |
| \|Presence⟩ | Eigenstate where the thing exists (+1) |
| \|Absence⟩ | Eigenstate where the thing doesn't exist (-1) |
| 1/√2 | Equal probability amplitude |

### Properties

**Normalization**: ⟨Ark\|Ark⟩ = 1
**Equal superposition**: P(Presence) = P(Absence) = 1/2
**Orthogonality**: ⟨Presence\|Absence⟩ = 0

## Measurement Collapse

$$\hat{M}|\text{Ark}\rangle \to \begin{cases} |\text{Presence}\rangle & \text{with probability } \frac{1}{2} \\ |\text{Absence}\rangle & \text{with probability } \frac{1}{2} \end{cases}$$

**Opening the Ark = measurement = collapse.**

Before measurement: both states coexist.
After measurement: one state is real, the other is counterfactual.

## Connection to Trinary Logic

| State | Trinary Value | Meaning |
|-------|---------------|---------|
| \|Presence⟩ | +1 | TRUE / EXISTS |
| \|Absence⟩ | -1 | FALSE / NOT-EXISTS |
| \|Ark⟩ | 0 | UNKNOWN / SUPERPOSITION |

The Ark state IS the trinary 0—not nothing, but everything-not-yet-decided.

## Connection to Options Pricing

The Ark Equation describes a **straddle** in financial terms:

$$|\text{Straddle}\rangle = \frac{1}{\sqrt{2}}(|\text{Call}\rangle + |\text{Put}\rangle)$$

- Call option: profits if price goes up (Presence of value)
- Put option: profits if price goes down (Absence of value)
- Straddle: profits from movement in either direction (superposition)

**The option remains in superposition until expiration (measurement).**

## Connection to DNA

Base pair complementarity follows Ark structure:

$$|\text{Base Pair}\rangle = \frac{1}{\sqrt{2}}(|A\rangle|T\rangle + |T\rangle|A\rangle)$$

The "information" of the base pair is not in A or T alone, but in their superposition relationship.

## Agent Applications

### Belief States

When an agent doesn't know if something is true:
```python
belief = Ark(
    presence=Claim("User prefers dark mode"),
    absence=Claim("User does not prefer dark mode"),
    amplitude=1/sqrt(2)
)

# Later, evidence arrives
measurement = user_explicitly_enables_dark_mode()
collapsed_belief = belief.collapse(measurement)  # → Presence
```

### Decision Deferral
```python
decision = Ark(
    presence=Action("Approve request"),
    absence=Action("Deny request"),
    amplitude=1/sqrt(2)
)

# Hold in superposition until sufficient evidence
while decision.is_superposition():
    evidence = gather_more_evidence()
    decision.update_amplitudes(evidence)

# Collapse when confidence threshold reached
final_action = decision.collapse()
```

### Contradiction Representation

A contradiction can be viewed as an Ark that refuses to collapse:
```python
contradiction = Ark(
    presence=Claim("X is true"),
    absence=Claim("X is false"),  # which is also "X is true" claims
    amplitude=1/sqrt(2),
    collapse_blocked=True  # Paraconsistent: don't force collapse
)
```

## The Deep Insight

> "The Ark is in state 0—neither present nor absent until observed. Opening the Ark = measurement = collapse from 0 to ±1."

This connects:

1. **Quantum mechanics** (superposition and collapse)
2. **Epistemology** (knowledge vs uncertainty)
3. **Decision theory** (options vs commitments)
4. **Information theory** (potential vs actual information)
5. **Theology** (the sacred as unseeable/unknowable until revealed)

## Generalized Ark

The equal-superposition case is special. The general form:

$$|\text{Ark}\rangle = \alpha|\text{Presence}\rangle + \beta|\text{Absence}\rangle$$

Where |α|² + |β|² = 1.

| Case | α | β | Interpretation |
|------|---|---|----------------|
| Equal | 1/√2 | 1/√2 | Maximum uncertainty |
| Presence-biased | 0.9 | 0.1 | Probably exists |
| Absence-biased | 0.1 | 0.9 | Probably doesn't exist |
| Collapsed to Presence | 1 | 0 | Definitely exists |
| Collapsed to Absence | 0 | 1 | Definitely doesn't exist |

## Implementation
```python
import numpy as np

class Ark:
    def __init__(self, presence, absence, alpha=1/np.sqrt(2), beta=1/np.sqrt(2)):
        self.presence = presence
        self.absence = absence
        self.alpha = alpha
        self.beta = beta
        self._collapsed = False
        self._collapsed_to = None
    
    def is_superposition(self) -> bool:
        return not self._collapsed
    
    def probability_presence(self) -> float:
        return abs(self.alpha) ** 2
    
    def probability_absence(self) -> float:
        return abs(self.beta) ** 2
    
    def update_amplitudes(self, evidence: float):
        """Bayesian update of amplitudes based on evidence."""
        # evidence > 0.5 favors presence, < 0.5 favors absence
        self.alpha *= evidence
        self.beta *= (1 - evidence)
        # Renormalize
        norm = np.sqrt(abs(self.alpha)**2 + abs(self.beta)**2)
        self.alpha /= norm
        self.beta /= norm
    
    def collapse(self, measurement: float = None) -> object:
        """Collapse superposition to definite state."""
        if self._collapsed:
            return self._collapsed_to
        
        if measurement is None:
            measurement = np.random.random()
        
        if measurement < self.probability_presence():
            self._collapsed_to = self.presence
        else:
            self._collapsed_to = self.absence
        
        self._collapsed = True
        return self._collapsed_to
    
    def trinary_state(self) -> int:
        """Return trinary representation."""
        if not self._collapsed:
            return 0  # Superposition
        return 1 if self._collapsed_to == self.presence else -1
```

## The Partition Function Connection

The Ark is a two-state partition function:

$$Z = e^{-\beta E_{\text{presence}}} + e^{-\beta E_{\text{absence}}}$$

At infinite temperature (β → 0): equal probability (maximum entropy Ark)
At zero temperature (β → ∞): collapses to ground state

Agent systems at finite "temperature" maintain partial superpositions.

## Open Questions

1. **Multi-state Arks**: What about superpositions of 3+ states?
2. **Entangled Arks**: Can two agents share an Ark (correlated uncertainty)?
3. **Ark interference**: What happens when Arks overlap?
4. **Partial collapse**: Can an Ark partially collapse?

## References

- [Trinary Logic](./trinary-logic.md)
- [Contradiction Protocol](./contradiction-protocol.md)
- [1-2-3-4 Pauli Model](../../frameworks/pauli-model.md)
- [Consciousness Equations](../lucidia/consciousness-equations.md)
