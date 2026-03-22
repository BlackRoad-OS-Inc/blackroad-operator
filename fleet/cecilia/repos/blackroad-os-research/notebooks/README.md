# Notebooks

This directory contains Jupyter notebooks and exploratory analysis scripts for BlackRoad OS research.

## Organization

Notebooks are organized by research domain:

- **`sig/`** - Spiral Information Geometry explorations
  - Coordinate transforms
  - Distance metrics
  - Factor tree visualizations
  - Embedding analysis

- **`qlm/`** - Quantum Language Model experiments
  - Entanglement proxies
  - Superposition models
  - Interference patterns

- **`orchestration/`** - Orchestration strategy prototypes
  - Contradiction resolution
  - Agent coordination
  - Workflow experiments

## Style Guide

Please follow the [Notebook Style Guide](../docs/notebook-style-guide.md) when creating notebooks.

### Quick Checklist

Every notebook should have:

- [ ] Header cell with purpose, dependencies, and data sources
- [ ] Organized imports
- [ ] Centralized configuration
- [ ] Markdown cells explaining each section
- [ ] Labeled visualizations
- [ ] Small datasets (or references to external data)
- [ ] Cross-references to related papers/experiments

## Creating a New Notebook

1. Choose the appropriate domain subdirectory
2. Name your notebook descriptively: `descriptive-name.ipynb`
3. Copy the header template from the style guide
4. Document your dependencies
5. Link to related papers and experiments

## Data

Notebooks should use:
- Small synthetic datasets
- Sampled data (< 1000 rows typically)
- References to external data sources (documented in code)

Never commit large datasets directly in notebooks.

## Outputs

Clear large outputs before committing:
- Use "Cell > All Output > Clear" for notebooks with heavy outputs
- Save important results to files instead of displaying in cells
- Keep only essential visualizations embedded

## Related Documentation

- [Research Overview](../docs/research-overview.md)
- [Notebook Style Guide](../docs/notebook-style-guide.md)
- [Experiment Template](../docs/experiment-template.md)
