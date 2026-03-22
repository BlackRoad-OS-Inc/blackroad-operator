"""Projective AM-2 integration utilities (Amundson VI)."""

from __future__ import annotations

import math
from typing import Tuple

import numpy as np

from .spiral import FieldLift, PhiTransform, am2_step


def u_from_theta(theta: float) -> float:
    """Map the phase angle to projective coordinate ``u = tan(θ / 2)``.

    Parameters
    ----------
    theta:
        Phase angle measured in radians (rad).

    Returns
    -------
    float
        Projective coordinate ``u`` (dimensionless).
    """

    return math.tan(0.5 * theta)


def theta_from_u(u: float) -> float:
    """Recover the phase angle from projective coordinate ``u``.

    Parameters
    ----------
    u:
        Projective coordinate (dimensionless).

    Returns
    -------
    float
        Phase angle :math:`\theta` in radians (rad).
    """

    return 2.0 * math.atan(u)


def projective_am2_step(
    a: float,
    u: float,
    gamma: float,
    kappa: float,
    eta: float,
    omega0: float = 1.0,
    *,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
) -> Tuple[float, float, float, float]:
    """Return AM-2 derivatives using projective phase coordinates.

    Returns
    -------
    a_dot, u_dot, theta_dot, response:
        Time derivatives with units ``a_dot`` (1/s), ``u_dot`` (1/s),
        ``theta_dot`` (rad/s), alongside the lifted response (arbitrary units).
    """

    theta = theta_from_u(u)
    a_dot, theta_dot, response = am2_step(
        a, theta, gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn
    )
    u_dot = 0.5 * (1.0 + u**2) * theta_dot
    return a_dot, u_dot, theta_dot, response


def simulate_projective_am2(
    T: float = 10.0,
    dt: float = 1e-3,
    a0: float = 0.1,
    *,
    theta0: float | None = 0.0,
    u0: float | None = None,
    gamma: float = 0.3,
    kappa: float = 0.7,
    eta: float = 0.5,
    omega0: float = 1.0,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Simulate AM-2 dynamics in projective phase coordinates.

    Returns
    -------
    t, a, u, theta, response:
        Arrays containing time samples (s), amplitudes (dimensionless),
        projective coordinate (dimensionless), recovered phase (rad), and
        lifted response (arbitrary units).
    """

    if dt <= 0:
        raise ValueError("time step must be positive")
    if T <= 0:
        raise ValueError("horizon must be positive")

    n_steps = int(np.ceil(T / dt)) + 1
    t = np.linspace(0.0, dt * (n_steps - 1), n_steps)
    a = np.empty(n_steps, dtype=float)
    u = np.empty(n_steps, dtype=float)
    theta = np.empty(n_steps, dtype=float)
    response = np.empty(n_steps, dtype=float)

    if u0 is None:
        if theta0 is None:
            raise ValueError("either theta0 or u0 must be supplied")
        u_init = u_from_theta(theta0)
        theta_init = float(theta0)
    else:
        u_init = float(u0)
        theta_init = theta_from_u(u_init)

    a[0] = a0
    u[0] = u_init
    theta[0] = theta_init

    a_dot, u_dot, theta_dot, resp = projective_am2_step(
        a0, u_init, gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn
    )
    response[0] = resp

    for i in range(1, n_steps):
        a_dot, u_dot, theta_dot, resp = projective_am2_step(
            a[i - 1], u[i - 1], gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn
        )
        a[i] = a[i - 1] + dt * a_dot
        u[i] = u[i - 1] + dt * u_dot
        theta[i] = theta_from_u(u[i])
        response[i] = resp

    return t, a, u, theta, response
