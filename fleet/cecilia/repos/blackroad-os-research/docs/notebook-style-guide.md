# Notebook Style Guide

Guidelines for creating and maintaining Jupyter notebooks in the BlackRoad OS Research repository.

## 📋 General Principles

1. **Self-Contained**: Each notebook should be understandable on its own
2. **Reproducible**: Include all dependencies and setup instructions
3. **Documented**: Use markdown cells liberally to explain your thinking
4. **Minimal**: Avoid large outputs; summarize results instead
5. **Linked**: Cross-reference related papers and experiments

## 📁 Organization

### Directory Structure

Place notebooks in theme-specific subdirectories:

```
notebooks/
├── sig/               # Spiral Information Geometry
├── qlm/               # Quantum Language Models
├── orchestration/     # Orchestration strategies
└── agents/            # Agent behavior and identity
```

### Naming Convention

Use descriptive, lowercase names with hyphens:

```
notebooks/sig/spiral-distance-metrics.ipynb
notebooks/qlm/entanglement-proxy-exploration.ipynb
notebooks/orchestration/contradiction-resolution.ipynb
```

## 📝 Notebook Structure

### 1. Header Cell (Markdown)

Every notebook should start with a header cell:

```markdown
# {Title of Notebook}

**Date:** YYYY-MM-DD  
**Author:** {Name/Agent}  
**Domain:** {sig/qlm/agents/orchestration}  
**Status:** {exploration/draft/validated}

## Purpose

Brief description of what this notebook explores.

## Dependencies

- Python 3.11+
- numpy 1.24+
- pandas 2.0+
- matplotlib 3.7+
- {any custom packages}

Install with:
\```bash
pip install -r requirements.txt
\```

## Data Sources

- Dataset 1: {description and location}
- Dataset 2: {synthetic, generated in cell X}

## Related Work

- Paper: `/papers/sig/spiral-geometry.md`
- Experiment: `/experiments/sig/experiment-2025-11-24-distance/`
```

### 2. Imports Cell (Code)

Group imports logically:

```python
# Standard library
import os
import sys
from pathlib import Path

# Data handling
import numpy as np
import pandas as pd

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns

# Custom utilities
sys.path.append('../src')
from geometry.spiral import SpiralCoordinate
from metrics.distance import spiral_distance
```

### 3. Configuration Cell (Code)

Centralize configuration:

```python
# Configuration
CONFIG = {
    'data_path': '../data/samples/',
    'output_path': './outputs/',
    'random_seed': 42,
    'n_samples': 1000,
    'dimensions': 128
}

# Set random seeds for reproducibility
np.random.seed(CONFIG['random_seed'])
```

### 4. Analysis Sections (Markdown + Code)

Use clear section headers:

```markdown
## 1. Data Loading and Preparation

Description of this section...
```

```python
# Load data
df = pd.read_csv(CONFIG['data_path'] + 'dataset.csv')
print(f"Loaded {len(df)} samples with {len(df.columns)} features")
```

## 🎨 Style Guidelines

### Markdown Cells

- Use headers (`##`, `###`) to structure content
- Include brief explanations before code blocks
- Summarize findings after visualizations
- Use bullet points for lists
- Include LaTeX for mathematical notation: `$x = y$` or `$$E = mc^2$$`

### Code Cells

- Keep cells focused on a single task
- Add comments for complex operations
- Use descriptive variable names
- Follow PEP 8 style guidelines
- Limit cell length (aim for < 20 lines when possible)

### Visualizations

- Always label axes
- Include titles
- Use consistent color schemes
- Add legends when needed
- Save important plots to `results/` folder

```python
plt.figure(figsize=(10, 6))
plt.plot(x, y, label='Metric A')
plt.xlabel('Dimension')
plt.ylabel('Distance')
plt.title('Spiral Distance Metrics Comparison')
plt.legend()
plt.savefig('./results/distance-comparison.png', dpi=150, bbox_inches='tight')
plt.show()
```

## 🔬 Data Handling

### Using Small Datasets

- Prefer synthetic or sampled data
- Load only what you need
- Document external data sources (don't commit large files)

```python
# Good: Use small sample
df_sample = df.sample(n=1000, random_state=42)

# Good: Generate synthetic data
synthetic_data = generate_spiral_points(n=500)

# Bad: Load entire 10GB dataset
# df_full = pd.read_csv('huge_dataset.csv')  # Don't do this!
```

### External Data References

```python
# Reference external data (don't include in repo)
DATA_SOURCE = {
    'name': 'SIG Embeddings Dataset v2',
    'location': 's3://blackroad-research/sig-embeddings/',
    'size': '10GB',
    'format': 'parquet',
    'description': 'Agent embeddings in spiral coordinates'
}
print(f"This notebook uses: {DATA_SOURCE['name']}")
print(f"Access at: {DATA_SOURCE['location']}")
```

## 📊 Output Management

### Clearing Outputs

Before committing:
- Clear all cell outputs if they're large
- Keep only small, essential outputs
- Use "Cell > All Output > Clear" before committing

### Saving Results

Save important results to files:

```python
# Save summary statistics
results = {
    'mean_distance': float(distances.mean()),
    'std_distance': float(distances.std()),
    'n_samples': len(distances)
}

import json
with open('./results/summary.json', 'w') as f:
    json.dump(results, f, indent=2)
```

## 🔗 Cross-Referencing

Link to related work:

```markdown
## Related Work

This analysis supports the theory in:
- [Spiral Information Geometry Overview](/papers/spiral-information-geometry/sig-overview.md)
- [Experiment: Distance Metrics](/experiments/sig/experiment-2025-11-24-distance/)

See also:
- Notebook: [Factor Tree Visualization](./factor-tree-viz.ipynb)
```

## ✅ Pre-Commit Checklist

Before committing a notebook:

- [ ] Header cell includes purpose, dependencies, and data sources
- [ ] Imports are organized and minimal
- [ ] Configuration is centralized
- [ ] Cells are documented with markdown
- [ ] Large outputs are cleared
- [ ] Visualizations have labels and titles
- [ ] Results are saved to files (not just displayed)
- [ ] No secrets or API keys in code
- [ ] No large datasets committed
- [ ] Cross-references to papers/experiments are included

## 🚫 Common Pitfalls to Avoid

1. **Massive Outputs**: Don't commit notebooks with 100+ MB of outputs
2. **Hardcoded Paths**: Use relative paths or configuration variables
3. **Secrets**: Never include API keys, tokens, or passwords
4. **Large Data**: Don't load or commit huge datasets
5. **Unclear Purpose**: Always explain why the notebook exists
6. **No Documentation**: Code-only cells without context
7. **Irreproducible**: Missing dependencies or setup steps

## 💡 Tips & Best Practices

1. **Restart & Run All**: Test your notebook with "Restart Kernel and Run All Cells" before committing
2. **Use Virtual Environments**: Document your environment setup
3. **Version Key Results**: Save timestamped outputs for important findings
4. **Modularize**: Extract reusable code to `/src` utilities
5. **Link to Papers**: Every notebook should relate to theory
6. **Document Failures**: If an approach didn't work, explain why
7. **Include Next Steps**: End with what should be tried next

## 📚 Resources

- [Jupyter Best Practices](https://jupyter-notebook.readthedocs.io/)
- [PEP 8 Style Guide](https://pep8.org/)
- [NumPy Docstring Guide](https://numpydoc.readthedocs.io/)
