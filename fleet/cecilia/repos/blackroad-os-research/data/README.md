# Data Directory

⚠️ **This directory contains METADATA and REFERENCES only** ⚠️

**DO NOT** commit large datasets, proprietary data, or sensitive information to this repository.

## Purpose

This directory documents:
- Where actual datasets are stored (external locations)
- Small sample datasets for testing and examples
- Synthetic datasets for demonstrations
- Data schemas and formats

## What Goes Here

✅ **Allowed:**
- `README.md` files describing data sources
- Small sample CSVs (< 100 KB, < 1000 rows)
- Synthetic example datasets
- Data schema specifications
- References to external storage (S3, URLs, etc.)
- Metadata files (JSON, YAML)

❌ **Not Allowed:**
- Large datasets (> 1 MB)
- Raw production data
- Personal or sensitive information
- API keys or credentials
- Proprietary datasets
- Binary data files (`.pkl`, `.h5`, `.parquet`)

## Directory Structure

```
data/
├── README.md          # This file
├── samples/           # Small sample datasets for testing
│   └── *.csv
├── examples/          # Synthetic example datasets
│   └── *.csv
└── schemas/           # Data format specifications
    └── *.json
```

Note: `/schemas` at the repository root contains JSON schemas for core concepts. This `data/schemas/` is for dataset format specifications.

## External Data Sources

### SIG Embeddings Dataset

- **Location:** `s3://blackroad-research/sig-embeddings/v2/`
- **Size:** ~10 GB (compressed)
- **Format:** Parquet files partitioned by date
- **Schema:** See `/schemas/sig.schema.json`
- **Access:** Requires AWS credentials with read access to `blackroad-research` bucket
- **Description:** Agent embeddings in spiral coordinate system with factor tree annotations
- **Last Updated:** 2025-11-20

### QLM Interaction Traces

- **Location:** `s3://blackroad-research/qlm-traces/`
- **Size:** ~5 GB
- **Format:** JSONL (JSON Lines)
- **Schema:** See `schemas/interaction-trace.json` (if created)
- **Access:** Requires credentials
- **Description:** Logged agent interactions for QLM analysis
- **Last Updated:** 2025-11-15

### Agent Worldline Dataset

- **Location:** External database (contact research team)
- **Size:** ~50 GB
- **Format:** PostgreSQL dump
- **Access:** Database credentials required
- **Description:** Historical agent worldlines with PS-SHA∞ hashes
- **Last Updated:** Ongoing

## Sample Data

Small samples from larger datasets are stored in `samples/` for:
- Quick testing in notebooks
- Example code demonstrations
- CI/CD pipeline testing

Example:
```python
import pandas as pd

# Load sample data (safe to commit)
df = pd.read_csv('data/samples/sig-sample-100.csv')
print(f"Sample has {len(df)} rows")

# Reference full dataset (not in repo)
# Full dataset: s3://blackroad-research/sig-embeddings/v2/
```

## Synthetic Data

The `examples/` directory contains **generated** synthetic data for:
- Demonstrations
- Tutorials
- Unit tests
- Public examples

These datasets are:
- Artificially created (not real data)
- Safe to share publicly
- Reproducible from code

Example:
```python
import numpy as np
import pandas as pd

# Generate synthetic spiral data
def generate_spiral_points(n=100, noise=0.1):
    """Generate synthetic points on a spiral."""
    t = np.linspace(0, 4*np.pi, n)
    r = np.exp(0.1 * t)
    x = r * np.cos(t) + noise * np.random.randn(n)
    y = r * np.sin(t) + noise * np.random.randn(n)
    return pd.DataFrame({'x': x, 'y': y, 't': t, 'r': r})

# Save synthetic data
df = generate_spiral_points(n=200)
df.to_csv('data/examples/spiral-synthetic-200.csv', index=False)
```

## Adding External Data References

When you need to reference a new external dataset:

1. Add entry to this README under "External Data Sources"
2. Include:
   - Location (URL, S3 path, database connection)
   - Size
   - Format
   - Schema reference
   - Access requirements
   - Description
   - Last updated date
3. Optionally create a small sample in `samples/`
4. Document the schema in `/schemas` if it's a new format

## Privacy & Security

🔒 **Never commit:**
- Personal identifiable information (PII)
- API keys, tokens, passwords
- Proprietary datasets
- Production database contents
- Real user data

If you accidentally commit sensitive data:
1. **Immediately** delete the file
2. **Rotate** any exposed credentials
3. **Notify** the team
4. **Rewrite** git history if necessary (force push)

## Data Usage in Code

### Good Practice

```python
# Reference external data
DATA_CONFIG = {
    'source': 's3://blackroad-research/sig-embeddings/v2/',
    'format': 'parquet',
    'size_gb': 10,
    'description': 'Agent embeddings in spiral coordinates'
}

# Load small sample for testing
sample_df = pd.read_csv('data/samples/sig-sample-100.csv')

# Generate synthetic data for demonstrations
synthetic_df = generate_test_data(n_samples=1000)
```

### Bad Practice

```python
# Don't do this - loading huge dataset
# df = pd.read_parquet('data/full-embeddings-10gb.parquet')  # ❌

# Don't do this - committing sensitive data
# api_key = "sk-1234567890"  # ❌
# df.to_csv('data/user-private-data.csv')  # ❌
```

## Related Documentation

- [Research Overview](../docs/research-overview.md)
- [Experiment Template](../docs/experiment-template.md)
- [Notebook Style Guide](../docs/notebook-style-guide.md)
- Root `/schemas` directory for JSON Schemas
