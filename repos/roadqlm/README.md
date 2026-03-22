# RoadQLM

RoadQLM is an agent-first quantum SDK that focuses on dual targeting (Qiskit and PennyLane),
trust-aware execution, and fast GPU-based parameter sweeps. The implementation in this
repository provides a lightweight scaffold that exercises the key design ideas without
requiring optional dependencies at import time.

## Quick start

```bash
python -m roadqlm --help
python -m roadqlm bench --output out
python -m roadqlm export --fmt oq3 --in examples/maxcut_12.json --out out/maxcut.oq3
```

## Benchmarks

Benchmarks live under `roadqlm/bench` and can be orchestrated via `roadqlm bench`. Outputs
are persisted as JSON summaries for easy comparison.

## Trust and Emit Gate

The `roadqlm.agents` package contains primitives for trust scoring (`trust.trust`) and the
Emit gate (`emit.emit`). These utilities can be composed to gate circuit executions on
compliance and transparency metrics before publishing results.
