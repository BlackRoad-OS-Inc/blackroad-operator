# Universal Simulation Starter

This scaffold mirrors the multiphysics benchmarking plan so you can wire in Genesis generation and downstream solvers quickly.

## Layout
- `00_spec/`: scenario definition and acceptance criteria.
- `10_genesis/`: prompt, configuration, and run script for Genesis.
- `20_bench_solid/`: solid mechanics benchmark entrypoint (e.g., Taichi-MPM, FEniCS, SOFA).
- `30_bench_fluid/`: fluid benchmark entrypoint (e.g., DualSPHysics, PySPH, Taichi-FLIP).
- `40_compare/`: metrics + plotting utilities for comparing outputs.
- `90_reports/`: reporting template for summarizing each run.

Artifacts are expected in `artifacts/` once the scripts are executed. Adjust the paths if your workflow differs.

## Quickstart
```bash
make genesis   # run Genesis generation
make solid     # run the solid benchmark
make fluid     # run the fluid benchmark
make diag      # generate diagnostics (extend as needed)
make variants  # materialise baseline + variant prompt directories
make variants-batch  # compute metrics for baseline + variants
make report-all  # build consolidated Markdown report
```

## Next Steps
1. Replace the stubs in `run_genesis.py`, `run_mpm.py`, and `run_sph.py` with real solver integrations.
2. Feed your solver outputs into the metric helpers to quantify differences.
3. Capture qualitative evidence (screenshots, plots) and document in the report template.
# Universal Simulation Starter Pipeline

This module scaffolds a lightweight, automation-friendly pipeline that can orchestrate
PySPH and Taichi-MPM style simulations. The included stages generate deterministic stub
metrics when the heavy simulation engines are unavailable so the downstream comparison
and reporting steps remain functional inside CI environments.

## Layout

```
10_genesis/        # Generates per-variant outputs and a manifest
40_compare/        # Aggregates metrics for quick inspection
90_reports/        # Produces a Markdown summary of all runs
tools/             # Helper utilities and orchestration wrappers
Makefile           # Wiring for running the full pipeline locally
```

`10_genesis/variants.yaml` enumerates the default simulation scenarios. Each entry can
be extended with additional parameters or engines as the real simulations evolve.

## Quickstart

To execute the complete pipeline you can either use the Makefile:

```bash
make -C universal-sim-starter all
```

or run the convenience wrapper that chains every stage and performs validation:

```bash
python3 universal-sim-starter/tools/generate_outputs.py --force-stub
```

Use the `--force-stub` switch to ensure deterministic stub metrics even when PySPH or
Taichi-MPM are installed locally.

## Validation & Cleanup

After running the pipeline you can verify the artifacts (the target will rerun any
missing stages automatically) with:

```bash
make -C universal-sim-starter check
```

Temporary outputs live under `universal-sim-starter/outputs` and can be removed with:

```bash
make -C universal-sim-starter clean
```

This keeps local working trees tidy while allowing the generated reports to be reviewed
on demand.
