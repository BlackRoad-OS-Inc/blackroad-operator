# Experiment Template

Use this template when creating a new experiment in the BlackRoad OS Research repository.

## Directory Structure

```
experiments/{domain}/experiment-YYYY-MM-DD-{descriptive-name}/
├── README.md           # This file (copy and customize)
├── config.json         # Experiment parameters
├── notebook.ipynb      # Analysis notebook (optional)
├── scripts/            # Supporting scripts
└── results/            # Output summaries and findings
    ├── summary.md
    └── metrics.json
```

## README Template

Copy the template below and customize for your experiment:

---

# Experiment: {Short Title}

**Date:** YYYY-MM-DD  
**Domain:** {sig/qlm/agents/orchestration/etc.}  
**Status:** {planned/running/completed/archived}  
**Author:** {Name or Agent ID}

## 🎯 Research Question

What specific question are we exploring?

Example: "Can spiral coordinate distance metrics predict agent semantic similarity better than cosine similarity?"

## 🧰 Setup

### Data
- **Source:** {Describe data source}
- **Size:** {Number of samples, dimensions}
- **Format:** {CSV, JSON, synthetic, etc.}
- **Location:** {Path or external reference}

### Models/Tools
- **Model:** {If using a model, specify}
- **Libraries:** {Key dependencies}
- **Environment:** {Python version, etc.}

### Parameters
See `config.json` for full parameters. Key settings:
- Parameter 1: value
- Parameter 2: value

## 📊 Metrics & Evaluation

What signals are we tracking?

- **Primary Metric:** {e.g., F1 score, distance correlation}
- **Secondary Metrics:** {e.g., runtime, memory usage}
- **Success Criteria:** {What would validate the hypothesis?}

## 🔬 Methodology

Brief description of the experimental approach:

1. Step 1
2. Step 2
3. Step 3

## 📈 Results

### Key Findings

- Finding 1
- Finding 2
- Finding 3

### Quantitative Results

| Metric | Value | Baseline | Improvement |
|--------|-------|----------|-------------|
| {metric} | {val} | {baseline} | {%} |

### Visualizations

{Link to plots in results/ or describe findings}

## 💡 Insights & Interpretation

What did we learn?

- Insight 1
- Insight 2
- Unexpected observation 3

## 🚀 Next Steps

What should future experiments try?

- [ ] Follow-up experiment idea 1
- [ ] Variation to test 2
- [ ] Related question 3

## 🔗 Related Work

- **Papers:** Link to related papers in `/papers/`
- **Notebooks:** Link to analysis notebooks
- **Dependencies:** Link to experiments this builds on

## ⚠️ Limitations & Caveats

- Limitation 1
- Assumption 2
- Known issue 3

## 📚 References

- External paper 1
- External resource 2

---

## Config Template (config.json)

```json
{
  "experiment": {
    "id": "experiment-YYYY-MM-DD-name",
    "domain": "sig|qlm|agents|orchestration",
    "date": "YYYY-MM-DD",
    "status": "planned|running|completed"
  },
  "data": {
    "source": "path/to/data or description",
    "samples": 1000,
    "features": 128
  },
  "parameters": {
    "param1": "value1",
    "param2": 42,
    "param3": true
  },
  "environment": {
    "python_version": "3.11",
    "key_packages": [
      "numpy==1.24.0",
      "pandas==2.0.0"
    ]
  }
}
```

## Results Template (results/summary.md)

```markdown
# Experiment Results Summary

## Date: YYYY-MM-DD

## Quick Stats

- Total runs: X
- Success rate: Y%
- Average runtime: Z seconds

## Main Findings

1. Finding 1 with supporting data
2. Finding 2 with evidence
3. Finding 3 with analysis

## Recommendations

Based on these results, we recommend:

- Action 1
- Action 2
- Further investigation into 3
```
