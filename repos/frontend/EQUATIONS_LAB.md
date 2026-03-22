# Equations Lab UI

The Equations Lab brings the Amundson–BlackRoad measurement stack into a browser console with sliders, live charts, and invariants. It connects directly to the `/api/ambr/*` routes provided by `srv/lucidia-math` and renders the returned JSON in real time.

## Features

- **AM-2 Simulator** – adjust the dissipative (`γ`), coupling (`κ`), and evidence (`η`) coefficients. A live chart plots amplitude and phase trajectories while the stability eigenvalues and spiral entropy ledger update on each fetch.
- **BR-1/2 Transport** – drive the autonomy continuity equation with adjustable step count, mobility, and trust potentials. The plot compares the initial and evolved densities and reports mass conservation errors to the 1e-3 acceptance target.
- **AM-4 Energy Ledger** – submit temperature, phase, and amplitude deltas to compute the discrete energy increment. The Landauer floor check flags whether irreversible work exceeds the thermodynamic minimum.
- **AM-VI Projective Phase** – explore the projective coordinate `u = tan(θ/2)` to avoid singularities near `π/2`. The panel reports `(a_dot, u_dot, θ_dot)` with next-step estimates and highlights the lifted response.
- **AM-VIII Resonance Scanner** – sweep harmonics up to `n_max` and visualise when `θ/π` locks to rational ratios. Resonance peaks return the numerator `p`, denominator `n`, and a dimensionless score.
- **BR-8 Collatz Flow** – move a discrete mass distribution through Collatz iterations while tracking Landauer energy. The card reports mass preservation, irreversible energy (`J`), and the pushed-forward histogram.
- **Fib–Pascal Instrument** – fetch Pascal rows, diagonal sums, and the matching Fibonacci target in one call. The UI confirms `Σ diagonal = F_{n+1}` and exposes the `F`-matrix pairs for quick inspection.

## Usage

1. Ensure the Lucidia Math service is running locally (`python -m srv.lucidia-math.ui`).
2. Start the Vite dev server from `frontend/` (`npm install && npm run dev`).
3. Navigate to `/equations-lab` in the browser. Use the parameter controls to call the API and inspect the responses in the summary cards.

## Data Guarantees

- Every API call includes unit labels so charts and ledgers remain dimensionally sound.
- Irreversible operations automatically compute the Landauer bound via `amundson_blackroad.thermo`.
- Mass conservation errors, spiral entropy, and Jacobian eigenvalues are surfaced alongside plots so the acceptance criteria (V1–V4) stay visible during exploration.

## Extending

The UI is written in React with Recharts for plotting. The main component lives at `frontend/src/pages/EquationsLab.jsx`. Additional diagnostics can be added by extending the helper hooks or by wiring new endpoints through the shared `useAmbrEndpoint` wrapper.
