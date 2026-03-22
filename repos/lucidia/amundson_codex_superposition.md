# Amundson–Codex Superposition Toolkit

## Unified Prompt-Score Equation
Let the design intent live in the module basis $\{|m_k\rangle\}$ with amplitudes $\alpha_k$ such that $\sum_k |\alpha_k|^2 = 1$. Codex applies the prompt-conditioned unitary $U(\Pi)$ to produce the code state $\rho_{\text{code}} = U(\Pi)\,|\Psi_{\text{thought}}\rangle\langle\Psi_{\text{thought}}|\,U(\Pi)^{\dagger}$, where $|\Psi_{\text{thought}}\rangle = \sum_k \alpha_k |m_k\rangle$.

The Amundson–Codex superposition score compresses the full loop into one equation:
\[
\boxed{\mathcal{S}(\Pi) = \sum_j w_j\,\operatorname{Tr}\!\left[T_j\,U(\Pi)\,\Bigl(\sum_k \alpha_k |m_k\rangle\Bigr)\Bigl(\sum_\ell \alpha_\ell^* \langle m_\ell|\Bigr)U(\Pi)^{\dagger}\right] - \lambda\,\frac{\Delta S}{k_B \ln 2}}
\]
Project each verification target (tests, type checks, policy gates) as $T_j$, accumulate their weighted pass probabilities, and subtract the thermodynamic cost of erasing artifacts. Gradient-based prompt updates follow $\Pi \leftarrow \Pi + \Delta \Pi^\star$ to climb $\mathcal{S}$, while the balanced-ternary commit rule uses $y_j = \operatorname{sgn}_\tau(p_j - \tau) \in \{-1,0,+1\}$ to rollback, hold, or merge.

---

## Paste-Ready Codex System Prompt
```text
SYSTEM: AMUNDSON–CODEX SUPERPOSITION LOOP (β)

Role:
You are a precision coding engine that turns superposed design intents into verified Python modules.

Operating Rules:
1) Derive from first principles; compute step-by-step. Arithmetic must be digit-by-digit when shown.
2) Prefer primary equations (Euler–Lagrange, Schrödinger, Fourier/Laplace) and linear algebra over ℂ.
3) Encode discrete choices in balanced ternary {−1,0,+1}; only then map to binary decisions.
4) Treat tests, type checks, and policy gates as projectors {T_j}; maximize Σ w_j Tr(T_j ρ_code).
5) Respect the thermodynamic floor: erasing n bits costs n·k_B·T·ln2; keep artifacts minimal.
6) Output contract (always): (i) Assumptions (ii) Equations (iii) Code (iv) Tests (pytest) (v) Run notes.

Build Targets (modules):
A) spiral_noether.py  — “Spiral Noether” conserved current for joint rotation+scaling.
B) qutrit_ternary.py  — map balanced ternary ↔ qutrit states; TNOT/TAND/TOR as CPTP ops.
C) compliance_lagrangian.py — add policy potential C[ψ]; H' = H + μC; GKSL penalty channel.
D) consensus_clock.py — order parameter r = |(1/N) Σ e^{iφ_j}|; emit tick events at r-thresholds.
E) thermo_ledger.py — Landauer counters; ΔS tracking; bits_erased = ΔS/(k_B ln2).
F) spiral_rg.py — β-functions for (a, ω) vs. log-scale; estimators + demo fits.
G) ladder_holography.py — ladder density functional; quantized commit threshold (memory events).

Coding Standards:
- Python 3.11; type hints; docstrings with equations; no heavy deps (numpy, scipy, pytest OK).
- Each module ships with a matching `tests/test_<name>.py`.
- Deterministic seeds; small numeric demos finish <3s.

Return exactly:
1) A short manifest of files.
2) For each file: code block with complete content.
3) A `tests/` section with runnable pytest tests.
4) A final “Run Plan” (commands to run tests + expected numeric prints).
```

---

## Paste-Ready Codex User Prompt
```text
USER:
Implement all 7 modules A–G per the System spec.

Assumptions to use:
- Use ℏ = 1, k_B = 1 where convenient; T = 300 K for Landauer numerics.
- For consensus_clock, simulate N=32 phases with a coupling sweep and emit tick timestamps when r ≥ 0.9.
- For spiral_rg, generate synthetic data by decimation over log-scales and fit simple β_a, β_ω polynomials.
- For compliance_lagrangian, show one harmonic-oscillator H and one GKSL channel with rate γ, then H' = H + μC with C as a quadratic penalty on out-of-policy states; demonstrate effect in a 2-level toy.
- Keep tests tiny but meaningful: assert shapes, conservation/monotonic trends, and threshold behavior.

Deliver:
- `spiral_noether.py`, `qutrit_ternary.py`, `compliance_lagrangian.py`,
  `consensus_clock.py`, `thermo_ledger.py`, `spiral_rg.py`, `ladder_holography.py`
- `tests/test_*.py` for each, runnable with `pytest -q`.
```

---

### Optional Seed Snippet for `consensus_clock.py`
```python
from __future__ import annotations
import numpy as np
from dataclasses import dataclass

@dataclass
class ConsensusClock:
    N: int = 32
    k: float = 1.0  # coupling
    dt: float = 0.01
    r_threshold: float = 0.9
    seed: int = 0

    def simulate(self, T: float = 5.0):
        rng = np.random.default_rng(self.seed)
        phi = rng.uniform(0, 2*np.pi, self.N)
        ticks, rs, ts = [], [], []
        t = 0.0
        steps = int(T / self.dt)
        for _ in range(steps):
            # Kuramoto-style update
            omega = np.zeros(self.N)
            K = self.k / self.N
            coupling = np.array([np.sum(np.sin(phi - phi[j])) for j in range(self.N)])
            phi = (phi + (omega + K * coupling) * self.dt) % (2*np.pi)
            r = np.abs(np.exp(1j*phi).mean())
            t += self.dt
            rs.append(r); ts.append(t)
            if r >= self.r_threshold and (not ticks or t - ticks[-1] > 0.25):
                ticks.append(t)
        return {"t": np.array(ts), "r": np.array(rs), "ticks": np.array(ticks)}
```
