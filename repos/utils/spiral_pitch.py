"""Utilities for estimating log-spiral pitch and fit quality."""

from __future__ import annotations

import numpy as np


def analyze_spiral_trace(z: np.ndarray) -> tuple[float, float, np.ndarray]:
    """Estimate the log-spiral pitch and reconstruction for a complex trace.

    Parameters
    ----------
    z:
        Complex-valued samples describing the trajectory to analyse. The trace
        must be non-zero everywhere so that the logarithm of the magnitude is
        well defined.

    Returns
    -------
    pitch:
        The growth-per-radian (``c``) obtained from the least-squares fit of
        ``log|z|`` against the unwrapped phase ``theta``.
    spiralness:
        A unitless goodness-of-fit score defined as
        ``1 - MSE(log|z| - (c * theta + b)) / Var(log|z|)``. Values near 1
        indicate that the trace closely follows a logarithmic spiral.
    reconstruction:
        Samples of the best-fit logarithmic spiral, matching the shape of the
        input trace.

    Raises
    ------
    ValueError
        If the input trace is empty or contains zeros.
    """

    samples = np.asarray(z, dtype=np.complex128)
    if samples.size == 0:
        raise ValueError("Input trace must contain at least one complex sample.")
    if np.any(samples == 0):
        raise ValueError("Input trace must be non-zero everywhere.")

    flat = samples.reshape(-1)
    theta = np.unwrap(np.angle(flat))
    rho = np.log(np.abs(flat))

    design = np.vstack([theta, np.ones_like(theta)]).T
    coeffs, *_ = np.linalg.lstsq(design, rho, rcond=None)
    pitch, intercept = coeffs

    fitted_rho = design @ coeffs
    errors = rho - fitted_rho
    mse = np.mean(errors**2)
    variance = np.var(rho)

    if variance == 0:
        spiralness = 1.0 if np.allclose(mse, 0.0) else 0.0
    else:
        spiralness = 1.0 - (mse / variance)

    reconstruction_flat = np.exp(fitted_rho + 1j * theta)
    reconstruction = reconstruction_flat.reshape(samples.shape)

    return float(pitch), float(spiralness), reconstruction


__all__ = ["analyze_spiral_trace"]
