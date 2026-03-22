# blackroad-ab-testing-lab

> A/B testing framework for ML and product experiments using pure Python stdlib

Run statistically rigorous A/B tests with Welch's t-test, confidence intervals, and winner determination. Uses only Python's `statistics` and `math` stdlib — no scipy or numpy required.

## Features

- 🧪 **Experiment management** — Create, start, stop experiments
- 🎯 **Variant assignment** — Multiple variants with configurable traffic splits
- 📊 **Welch's t-test** — Two-sample t-test with unequal variances
- 📏 **Confidence intervals** — 95% CI using t-distribution
- 🏆 **Winner detection** — Statistical significance check (α=0.05)
- 🔢 **Pure Python** — No external statistical libraries required

## Statistical Methodology

This library implements **Welch's t-test** (two-tailed) for comparing variant means:

1. **t-statistic**: `t = (μ₁ - μ₂) / √(s₁²/n₁ + s₂²/n₂)`
2. **Degrees of freedom**: Welch–Satterthwaite approximation
3. **p-value**: Computed via regularized incomplete beta function (Lentz continued fraction)
4. **Confidence interval**: `μ ± t* × (s/√n)`

A result is considered significant when `p < α` (default α = 0.05).

## Installation

```bash
git clone https://github.com/BlackRoad-Labs/blackroad-ab-testing-lab
cd blackroad-ab-testing-lab
```

## Usage

### Create an experiment

```bash
python ab_testing.py create "checkout_button" \
  "New green CTA increases checkout conversion" \
  "conversion_rate" \
  --min-sample 200
```

### Add variants

```bash
EXP_ID=<experiment-id>
python ab_testing.py add-variant $EXP_ID control --pct 50 --desc "Blue button"
python ab_testing.py add-variant $EXP_ID treatment --pct 50 \
  --config '{"color": "green", "text": "Buy Now"}' --desc "Green button"
```

### Record results

```bash
python ab_testing.py record $EXP_ID user-001 control 0
python ab_testing.py record $EXP_ID user-002 treatment 1
python ab_testing.py record $EXP_ID user-003 treatment 1
```

### Analyze

```bash
python ab_testing.py analyze $EXP_ID
```

Output:
```
=== Analysis: checkout_button ===
Metric: conversion_rate
Variants:
  control:   n=100 mean=0.2340 CI=[0.1980, 0.2700]
  treatment: n=100 mean=0.3120 CI=[0.2750, 0.3490]

Comparisons:
  control vs treatment: p=0.0023 ✓ SIGNIFICANT
```

### Check significance

```bash
python ab_testing.py check-significance $EXP_ID --alpha 0.05
```

### Declare winner

```bash
python ab_testing.py winner $EXP_ID
```

## Tests

```bash
pytest tests/ -v
```
