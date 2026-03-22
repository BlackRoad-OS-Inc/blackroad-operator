# Experiments

Active research experiments from BlackRoad Labs.

## Active Experiments

| ID | Title | Status | Lead | Branch |
|----|-------|--------|------|--------|
| EXP-001 | PS-SHA∞ Memory Integrity | 🟢 Running | ECHO | `exp/memory-integrity` |
| EXP-002 | Trinary Logic Gate Performance | 🟡 Paused | LUCIDIA | `exp/trinary-gates` |
| EXP-003 | Contradiction Amplification K(t) | �� Running | PRISM | `exp/contradiction-amp` |
| EXP-004 | Tokenless Gateway Latency | 🟢 Running | ALICE | `exp/gateway-latency` |
| EXP-005 | Agent Emergence Patterns | 🔵 Proposed | CECE | `exp/emergence` |

## Experiment Lifecycle

```
PROPOSED → DESIGNING → RUNNING → ANALYZING → COMPLETE → ARCHIVED
                ↓
            CANCELLED
```

## Running an Experiment

```bash
# Clone and set up
git clone https://github.com/BlackRoad-Labs/experiments
cd experiments

# Run EXP-001
python experiments/exp-001-memory/run.py --iterations 1000

# Analyze results
python experiments/exp-001-memory/analyze.py --output results/exp-001/
```

## Results Archive

Completed experiment results are archived in `results/`:
- `results/exp-XXX/data.jsonl` — raw data
- `results/exp-XXX/report.md` — analysis report
- `results/exp-XXX/visualizations/` — charts

## Contributing an Experiment

1. Open an issue with the `experiment` label
2. Fork and create `experiments/exp-NNN-<name>/`
3. Include `hypothesis.md`, `methodology.md`, `run.py`
4. Submit PR with initial results

---
*BlackRoad Labs — where AI emergence happens*
