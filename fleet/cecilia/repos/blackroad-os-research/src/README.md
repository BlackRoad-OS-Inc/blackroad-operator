# Research Source Code

This directory contains **reusable research utilities** for BlackRoad OS experiments and analysis.

⚠️ **Important**: This is NOT production code. Code here is for research purposes and must be hardened before moving to production repositories like `blackroad-os-core`.

## Purpose

Provide modular, well-documented utilities that:
- Reduce code duplication across experiments
- Implement research-specific algorithms
- Support notebooks and simulations
- Can inspire production implementations

## Organization

Organize code by functional domain:

```
src/
├── geometry/          # Spiral coordinate systems, transformations
│   ├── spiral.py
│   ├── coordinates.py
│   └── projections.py
├── metrics/           # Custom evaluation metrics
│   ├── distance.py
│   ├── similarity.py
│   └── coherence.py
├── models/            # Lightweight model wrappers
│   ├── qlm.py
│   └── embeddings.py
├── visualization/     # Plotting and rendering utilities
│   ├── spiral_plots.py
│   └── factor_trees.py
└── utils/             # General helpers
    ├── data.py
    └── config.py
```

## Code Standards

### Required

1. **Type Hints**: Use Python type hints everywhere
   ```python
   def spiral_distance(p1: SpiralCoordinate, p2: SpiralCoordinate) -> float:
       """Calculate distance between two points in spiral space."""
       pass
   ```

2. **Documentation**: Every function needs a docstring
   ```python
   def transform_to_spiral(x: np.ndarray, y: np.ndarray) -> SpiralCoordinate:
       """
       Convert Cartesian coordinates to spiral coordinates.
       
       Args:
           x: X-axis values
           y: Y-axis values
           
       Returns:
           SpiralCoordinate with (r, theta, tau) components
       """
       pass
   ```

3. **Small & Composable**: Keep functions focused
   - Single responsibility principle
   - Aim for < 50 lines per function
   - Compose complex operations from simple ones

4. **No Secrets**: Never hardcode credentials or environment-specific URLs
   ```python
   # Good
   def get_model(api_key: str, endpoint: str):
       pass
   
   # Bad
   API_KEY = "sk-1234..."  # Don't do this!
   ```

### Recommended

- Use dataclasses or Pydantic models for structured data
- Include examples in docstrings
- Add simple unit tests in a `tests/` subdirectory (optional)
- Use meaningful variable names

## Example: Good Research Code

```python
from dataclasses import dataclass
from typing import Tuple
import numpy as np

@dataclass
class SpiralCoordinate:
    """Point in spiral information geometry space."""
    r: float      # Radial distance from origin
    theta: float  # Angular position (radians)
    tau: float    # Spiral time parameter
    
    def to_cartesian(self) -> Tuple[float, float]:
        """Convert to Cartesian coordinates (x, y)."""
        x = self.r * np.cos(self.theta)
        y = self.r * np.sin(self.theta)
        return (x, y)

def spiral_distance(p1: SpiralCoordinate, p2: SpiralCoordinate) -> float:
    """
    Calculate geodesic distance in spiral space.
    
    Uses the natural spiral metric accounting for both
    radial separation and angular unwinding.
    
    Args:
        p1: First point
        p2: Second point
        
    Returns:
        Distance in spiral space units
        
    Example:
        >>> p1 = SpiralCoordinate(r=1.0, theta=0.0, tau=0.0)
        >>> p2 = SpiralCoordinate(r=2.0, theta=np.pi/2, tau=1.0)
        >>> dist = spiral_distance(p1, p2)
    """
    dr = p2.r - p1.r
    dtheta = np.abs(p2.theta - p1.theta)
    dtau = p2.tau - p1.tau
    
    # Spiral metric (simplified)
    return np.sqrt(dr**2 + (p1.r * dtheta)**2 + dtau**2)
```

## Using Research Code

### In Notebooks

```python
import sys
sys.path.append('../src')

from geometry.spiral import SpiralCoordinate, spiral_distance
from metrics.similarity import cosine_similarity
```

### In Experiments

```python
import sys
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent.parent.parent / 'src'
sys.path.append(str(src_path))

from geometry.spiral import SpiralCoordinate
```

## Dependencies

Keep dependencies minimal and document them:

- Create `requirements.txt` if Python packages are needed
- Pin versions for reproducibility
- Only include what's actually used

Example `requirements.txt`:
```
numpy>=1.24.0,<2.0.0
pandas>=2.0.0,<3.0.0
scipy>=1.11.0
```

## Migration to Production

When research code is ready for production:

1. **Review & Harden**: Add comprehensive error handling
2. **Test**: Add full test coverage
3. **Optimize**: Profile and optimize if needed
4. **Document**: Write production-grade documentation
5. **Port**: Move to appropriate production repo (e.g., `blackroad-os-core`)
6. **Reference**: Update research code with link to production version

Example:
```python
def spiral_distance(p1: SpiralCoordinate, p2: SpiralCoordinate) -> float:
    """
    Calculate spiral distance.
    
    Note: Production version available in blackroad-os-core:
    https://github.com/BlackRoad-OS/blackroad-os-core/blob/main/src/geometry/spiral.ts
    
    This research version is kept for reference and experimentation.
    """
    pass
```

## What NOT to Include

- Large model weights or checkpoints
- API keys or secrets
- Production service implementations
- Complex build systems
- Heavy dependencies (avoid PyTorch/TensorFlow unless essential)

## Related Documentation

- [Research Overview](../docs/research-overview.md)
- [Experiment Template](../docs/experiment-template.md)
- [Notebook Style Guide](../docs/notebook-style-guide.md)
