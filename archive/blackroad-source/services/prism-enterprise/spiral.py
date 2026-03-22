"""Amundson spiral dynamics kernels (AM-1/2/3)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Tuple

import numpy as np

FieldLift = Callable[[float, float], float]
PhiTransform = Callable[[float], float]


def field_lift(a: float, theta: float, mode: str = "exponential") -> float:
    """Lift the (a, theta) state into an amplitude field.

    Parameters
    ----------
    a:
        Spiral amplitude parameter.
    theta:
        Spiral angle parameter.
    mode:
        Strategy for the lift. ``"exponential"`` realises AM-3 directly, while
        ``"linear"`` is a numerically gentle option used in tests.
    """

    if mode == "exponential":
        argument = np.clip(a * theta, -50.0, 50.0)
        return float(np.exp(argument))
    if mode == "linear":
        return float(a)
    if mode == "theta":
        return float(theta)
    raise ValueError(f"unsupported lift mode: {mode}")


def am2_step(
    a: float,
    theta: float,
    gamma: float,
    kappa: float,
    eta: float,
    omega0: float = 1.0,
    *,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
) -> Tuple[float, float, float]:
    """Compute the instantaneous AM-2 derivatives and lifted field."""

    if phi is None:
        phi = lambda amp: amp
    if lift_fn is None:
        lift_fn = lambda x, y: field_lift(x, y, mode="exponential")

    lifted = lift_fn(a, theta)
    response = phi(lifted)
    a_dot = -gamma * a + eta * response
    theta_dot = omega0 + kappa * a
    return a_dot, theta_dot, response


def simulate_am2(
    T: float = 10.0,
    dt: float = 1e-3,
    a0: float = 0.1,
    theta0: float = 0.0,
    gamma: float = 0.3,
    kappa: float = 0.7,
    eta: float = 0.5,
    omega0: float = 1.0,
    *,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Simulate the coupled AM-2 spiral equations."""

    if dt <= 0:
        raise ValueError("time step must be positive")
    if T <= 0:
        raise ValueError("horizon must be positive")

    n_steps = int(np.ceil(T / dt)) + 1
    t = np.linspace(0.0, dt * (n_steps - 1), n_steps)
    a = np.empty(n_steps, dtype=float)
    theta = np.empty(n_steps, dtype=float)
    amp = np.empty(n_steps, dtype=float)
    a[0] = a0
    theta[0] = theta0

    a_dot, theta_dot, response = am2_step(
        a0, theta0, gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn
    )
    amp[0] = response

    for i in range(1, n_steps):
        a_dot, theta_dot, response = am2_step(
            a[i - 1], theta[i - 1], gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn
        )
        a[i] = a[i - 1] + dt * a_dot
        theta[i] = theta[i - 1] + dt * theta_dot
        amp[i] = response

    return t, a, theta, amp


def jacobian_am2(
    a: float,
    theta: float,
    gamma: float,
    kappa: float,
    eta: float,
    omega0: float,
    *,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
    eps: float = 1e-6,
) -> np.ndarray:
    """Numerically estimate the Jacobian of the AM-2 system at a point."""

    base = np.array(am2_step(a, theta, gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn)[0:2])
    jac = np.zeros((2, 2), dtype=float)
    perturb = np.array([eps, 0.0])
    for idx in range(2):
        if idx == 1:
            perturb = np.array([0.0, eps])
        shifted = np.array(
            am2_step(
                a + perturb[0],
                theta + perturb[1],
                gamma,
                kappa,
                eta,
                omega0,
                phi=phi,
                lift_fn=lift_fn,
            )[0:2]
        )
        jac[:, idx] = (shifted - base) / eps
    return jac


@dataclass
class StabilityReport:
    """Phase-space stability report for the AM-2 fixed point."""

    jacobian: np.ndarray
    eigenvalues: np.ndarray

    @property
    def is_stable(self) -> bool:
        """Return ``True`` when all eigenvalues have non-positive real part."""

        return bool(np.all(self.eigenvalues.real <= 0.0))


def fixed_point_stability(
    a: float,
    theta: float,
    gamma: float,
    kappa: float,
    eta: float,
    omega0: float,
    *,
    phi: PhiTransform | None = None,
    lift_fn: FieldLift | None = None,
    eps: float = 1e-6,
) -> StabilityReport:
    """Return the Jacobian and eigenvalues at a candidate fixed point."""

    jac = jacobian_am2(a, theta, gamma, kappa, eta, omega0, phi=phi, lift_fn=lift_fn, eps=eps)
    eigenvalues = np.linalg.eigvals(jac)
    return StabilityReport(jacobian=jac, eigenvalues=eigenvalues)
