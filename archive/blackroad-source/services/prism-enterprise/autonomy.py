"""BlackRoad autonomy transport equations (BR-1/2/7)."""

from __future__ import annotations

from typing import Dict, Optional, Tuple

import numpy as np

Array = np.ndarray


def compute_flux(
    A: Array,
    rho_trust: Array,
    dx: float,
    *,
    mu_A: float = 1.0,
    chi_A: float = 0.0,
    Uc: Optional[Array] = None,
) -> Array:
    """Compute BR-2 flux J_A."""

    if dx <= 0:
        raise ValueError("dx must be positive")
    if Uc is None:
        Uc = np.zeros_like(A)

    grad_rho = np.gradient(rho_trust, dx, edge_order=2)
    grad_Uc = np.gradient(Uc, dx, edge_order=2)
    return mu_A * grad_rho - chi_A * grad_Uc


def conserved_mass(x: Array, A: Array) -> float:
    """Integrate the A field over x."""

    return float(np.trapz(A, x))


def step_transport(
    A: Array,
    rho_trust: Array,
    dx: float,
    dt: float,
    *,
    mu_A: float = 1.0,
    chi_A: float = 0.0,
    Uc: Optional[Array] = None,
) -> Tuple[Array, Array]:
    """Advance the BR-1 transport equation by one step."""

    flux = compute_flux(A, rho_trust, dx, mu_A=mu_A, chi_A=chi_A, Uc=Uc)
    divergence = np.gradient(flux, dx, edge_order=2)
    next_A = A - dt * divergence
    return next_A, flux


def simulate_transport(
    x: Array,
    A0: Array,
    rho_trust: Array,
    steps: int,
    dt: float,
    *,
    mu_A: float = 1.0,
    chi_A: float = 0.0,
    Uc: Optional[Array] = None,
) -> Dict[str, Array]:
    """Iteratively integrate the transport equation."""

    if steps <= 0:
        raise ValueError("steps must be positive")
    if dt <= 0:
        raise ValueError("dt must be positive")
    dx = float(x[1] - x[0])
    A = A0.copy()
    last_flux = np.zeros_like(A)
    for _ in range(steps):
        A, last_flux = step_transport(A, rho_trust, dx, dt, mu_A=mu_A, chi_A=chi_A, Uc=Uc)
    return {
        "x": x,
        "A": A,
        "flux": last_flux,
        "mass": float(conserved_mass(x, A)),
    }


def trust_field_step(
    rho_trust: Array,
    dx: float,
    dt: float,
    *,
    diffusion: float = 0.1,
    relaxation: float = 0.0,
    source: Optional[Array] = None,
) -> Array:
    """Evolve the trust field following BR-7."""

    if diffusion < 0:
        raise ValueError("diffusion must be non-negative")
    if source is None:
        source = np.zeros_like(rho_trust)
    laplacian = np.gradient(np.gradient(rho_trust, dx, edge_order=2), dx, edge_order=2)
    return rho_trust + dt * (diffusion * laplacian - relaxation * rho_trust + source)
