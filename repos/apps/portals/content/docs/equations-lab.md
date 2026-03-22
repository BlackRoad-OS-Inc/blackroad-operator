---
title: "Equations Lab"
summary: "Interactive portal for the Amundson–BlackRoad kernels"
updated: "2024-11-15"
---

## Overview

The Equations Lab connects the Infinity Math API to a browser workspace so
engineers can explore the Amundson–BlackRoad simulations without leaving
the portal. The page exposes three panels:

1. **AM-2 Spiral** – adjust the coupling coefficients and examine the
   time evolution of the amplitude and angle.
2. **BR-1/2 Transport** – reshape the trust wells and monitor the field
   response as well as the mass conservation error.
3. **AM-4 Energy Ledger** – compare the incremental energy against the
   Landauer floor while tuning thermodynamic parameters.

Each run stores artefacts in the math service output volume and logs a
`run.json` provenance record with hashes, parameters, and Landauer
metadata.

## Parameters

### AM-2 panel

| Control | Description | Range |
| --- | --- | --- |
| `gamma` | Dissipation coefficient | 0.0 – 1.5 |
| `kappa` | Coupling coefficient | 0.0 – 1.5 |
| `eta` | Response gain | 0.0 – 1.5 |
| `omega0` | Base angular velocity | 0.0 – 1.5 |
| `a0` | Initial amplitude | 0.0 – 1.5 |
| `theta0` | Initial angle (rad) | −π – π |
| `T` | Horizon (s) | 1 – 10 |

### BR-1/2 panel

| Control | Description |
| --- | --- |
| `μ` | Transport mobility parameter |
| `Offset` | Half distance between the trust wells |
| `Left depth` | Magnitude of the left trust well |
| `Right depth` | Magnitude of the right trust well |

### Energy Ledger panel

| Control | Description |
| --- | --- |
| `Temperature` | Thermodynamic temperature in Kelvin |
| `Bits` | Irreversible bit count for the Landauer floor |
| `a` / `θ` | State sample used for the ledger |
| `Δa` / `Δθ` | Perturbations to state variables |
| `Ω` | Energy density constant (J) |

## Provenance

For every execution the API:

- Saves artefacts under `output/<domain>/...` with SHA-512 hashes.
- Writes a `runs/run_<timestamp>.json` record with inputs, invariants,
  and the Landauer floor (`ΔE_min`).
- Emits Prometheus counters for run counts, mass error, and energy.
- Optionally posts a Ledger entry when `LEDGER_ENABLED=true`.

## Usage Tips

- Use the **Download session JSON** button to capture current parameters
  and outputs for reproducibility.
- Keep the mass error under `1e-3` to satisfy the BR-1 invariant.
- When the energy ledger reports `pass = false`, adjust the irreversible
  bit budget or the energy constant `Ω` until the inequality is
  satisfied.

For API details see `content/docs/api-math.md`.
