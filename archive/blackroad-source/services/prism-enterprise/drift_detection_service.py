"""Layered drift detection microservice utilities.

This module implements a light-weight, two-stage drift detector that mirrors
the blueprint outlined in the user request:

* **Layer A** computes fast complexity sentinels (permutation entropy and the
  Higuchi fractal dimension) on short windows of recent telemetry.
* **Layer B** confirms anomalies flagged by the sentinel layer using a sliced
  Wasserstein distance against a clean baseline distribution.

The implementation favors a pure NumPy stack so it can be dropped directly
into the existing Prism console agent runtime without additional dependencies.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Iterable, Optional

import numpy as np


def _as_float_array(values: Iterable[float]) -> np.ndarray:
    """Convert an iterable to a contiguous NumPy array of dtype float64."""

    array = np.asarray(values, dtype=np.float64)
    if array.ndim == 0:
        raise ValueError("Expected an iterable with at least one element.")
    return np.ascontiguousarray(array)


def permutation_entropy(
    signal: Iterable[float],
    embedding_dimension: int = 4,
    delay: int = 1,
    normalize: bool = True,
) -> float:
    """Compute the permutation entropy of a one-dimensional time series.

    Args:
        signal: Univariate sequence representing the sliding window to analyse.
        embedding_dimension: Permutation embedding dimension (``m``).
        delay: Embedding delay (``tau``) between samples.
        normalize: If ``True`` the entropy is normalised by ``log(m!)``.

    Returns:
        Permutation entropy of the provided sequence.
    """

    data = _as_float_array(signal)
    m = int(embedding_dimension)
    tau = int(delay)
    if m < 2:
        raise ValueError("embedding_dimension must be >= 2")
    if tau < 1:
        raise ValueError("delay must be >= 1")

    window_length = data.size - (m - 1) * tau
    if window_length <= 0:
        raise ValueError("Signal is too short for the requested parameters")

    permutations = np.lib.stride_tricks.sliding_window_view(
        data, window_shape=(m,), axis=0
    )[::tau]
    ranks = np.argsort(np.argsort(permutations, axis=1), axis=1)
    factorial = np.math.factorial(m)
    # Encode permutations as integers in base ``m`` to count efficiently.
    coeffs = (m ** np.arange(m)).reshape(1, -1)
    keys = (ranks * coeffs).sum(axis=1)
    counts = np.bincount(keys, minlength=factorial)
    probabilities = counts[counts > 0] / counts.sum()
    entropy = -(probabilities * np.log(probabilities)).sum()
    if normalize:
        entropy /= np.log(factorial)
    return float(entropy)


def higuchi_fractal_dimension(
    signal: Iterable[float],
    kmax: int = 8,
) -> float:
    """Estimate the Higuchi fractal dimension of a one-dimensional signal."""

    data = _as_float_array(signal)
    n = data.size
    if n < 2:
        raise ValueError("Signal must contain at least two samples")
    if kmax < 2:
        raise ValueError("kmax must be >= 2")

    ks = np.arange(1, kmax + 1, dtype=np.float64)
    lengths = np.empty_like(ks)

    for idx, k in enumerate(ks):
        L_k = []
        for m in range(int(k)):
            subseq = data[m:: int(k)]
            if subseq.size < 2:
                continue
            diff = np.abs(np.diff(subseq))
            length = diff.sum() * (n - 1) / (subseq.size * k)
            L_k.append(length)
        if not L_k:
            lengths[idx] = 0.0
        else:
            lengths[idx] = np.mean(L_k)

    valid = lengths > 0
    if not np.any(valid):
        return 1.0

    log_lengths = np.log(lengths[valid])
    log_ks = np.log(ks[valid])
    slope, _ = np.polyfit(log_ks, log_lengths, 1)
    return float(slope)


def _quantile_interpolation(values: np.ndarray, grid: np.ndarray) -> np.ndarray:
    """Interpolate quantiles on a uniform grid without heavy dependencies."""

    sorted_values = np.sort(values)
    n = sorted_values.size
    if n == 1:
        return np.repeat(sorted_values, grid.size)
    cdf_x = np.linspace(0.0, 1.0, num=n)
    return np.interp(grid, cdf_x, sorted_values)


def sliced_wasserstein_distance(
    x: np.ndarray,
    y: np.ndarray,
    *,
    n_projections: int = 100,
    quantile_points: int = 128,
    p: int = 2,
    random_state: Optional[int] = None,
) -> float:
    """Estimate the sliced Wasserstein distance between two samples."""

    x_array = _as_float_array(x)
    y_array = _as_float_array(y)

    if x_array.ndim == 1:
        x_array = x_array[:, np.newaxis]
    if y_array.ndim == 1:
        y_array = y_array[:, np.newaxis]

    if x_array.shape[1] != y_array.shape[1]:
        raise ValueError("x and y must share the same number of features")

    rng = np.random.default_rng(random_state)
    directions = rng.normal(size=(n_projections, x_array.shape[1]))
    directions /= np.linalg.norm(directions, axis=1, keepdims=True) + 1e-12

    grid = np.linspace(0.0, 1.0, quantile_points)
    distances = np.empty(n_projections, dtype=np.float64)

    for idx, direction in enumerate(directions):
        proj_x = x_array @ direction
        proj_y = y_array @ direction
        qx = _quantile_interpolation(proj_x, grid)
        qy = _quantile_interpolation(proj_y, grid)
        diff = np.abs(qx - qy) ** p
        distances[idx] = diff.mean() ** (1.0 / p)

    return float(distances.mean())


def _sliding_windows(array: np.ndarray, window_size: int) -> np.ndarray:
    """Return a view of all contiguous windows with the provided size."""

    if window_size <= 0:
        raise ValueError("window_size must be positive")
    if array.ndim != 1:
        raise ValueError("_sliding_windows expects a one-dimensional array")
    if array.size < window_size:
        raise ValueError("Array is smaller than the requested window size")

    return np.lib.stride_tricks.sliding_window_view(array, window_shape=window_size)


def _multivariate_windows(array: np.ndarray, window_size: int) -> np.ndarray:
    """Construct contiguous multivariate windows with a lightweight routine."""

    if window_size <= 0:
        raise ValueError("window_size must be positive")

    array = _as_float_array(array)
    if array.ndim == 1:
        array = array[:, np.newaxis]

    n_samples = array.shape[0]
    if n_samples < window_size:
        raise ValueError("Not enough samples to extract the requested window size")

    return np.stack(
        [array[idx : idx + window_size] for idx in range(n_samples - window_size + 1)]
    )


def _percentile(values: np.ndarray, percentile: float) -> float:
    """Compute a percentile with validation."""

    if not 0.0 <= percentile <= 100.0:
        raise ValueError("percentile must be within [0, 100]")
    return float(np.percentile(values, percentile))


@dataclass
class DriftDetectorConfig:
    """Configuration container for the layered drift detector."""

    window_size: int = 512
    sentinel_percentile: float = 95.0
    confirm_percentile: float = 95.0
    consecutive_sentinels: int = 3
    embedding_dimension: int = 4
    delay: int = 1
    kmax: int = 8
    n_projections: int = 100
    quantile_points: int = 128
    wasserstein_p: int = 2
    random_state: Optional[int] = None


@dataclass
class DriftDetectionResult:
    """Structured return object for detection calls."""

    sentinel_triggered: bool
    confirm_triggered: bool
    alert: bool
    metrics: Dict[str, float]
    thresholds: Dict[str, float]


@dataclass
class LayeredDriftDetector:
    """Streaming detector implementing the two-layer workflow."""

    baseline_series: Iterable[float]
    baseline_reference: np.ndarray
    config: DriftDetectorConfig = field(default_factory=DriftDetectorConfig)

    def __post_init__(self) -> None:
        series_array = _as_float_array(self.baseline_series)
        self._series_windows = _sliding_windows(series_array, self.config.window_size)

        baseline_metrics_pe = np.apply_along_axis(
            permutation_entropy,
            axis=1,
            arr=self._series_windows,
            embedding_dimension=self.config.embedding_dimension,
            delay=self.config.delay,
        )
        baseline_metrics_hfd = np.apply_along_axis(
            higuchi_fractal_dimension,
            axis=1,
            arr=self._series_windows,
            kmax=self.config.kmax,
        )

        reference = _as_float_array(self.baseline_reference)
        if reference.ndim == 1:
            reference = reference[:, np.newaxis]
        self._reference = reference

        ref_windows = _multivariate_windows(self._reference, self.config.window_size)
        wasserstein_samples = [
            sliced_wasserstein_distance(
                window,
                self._reference,
                n_projections=self.config.n_projections,
                quantile_points=self.config.quantile_points,
                p=self.config.wasserstein_p,
                random_state=self.config.random_state,
            )
            for window in ref_windows
        ]

        self._thresholds = {
            "permutation_entropy": _percentile(
                baseline_metrics_pe, self.config.sentinel_percentile
            ),
            "higuchi_fd": _percentile(
                baseline_metrics_hfd, self.config.sentinel_percentile
            ),
            "sliced_wasserstein": _percentile(
                np.asarray(wasserstein_samples), self.config.confirm_percentile
            ),
        }

        self._consecutive_sentinels = 0

    def check(
        self,
        window_series: Iterable[float],
        window_multivariate: Optional[np.ndarray] = None,
    ) -> DriftDetectionResult:
        """Evaluate a telemetry window and emit detection metrics."""

        window_array = _as_float_array(window_series)
        if window_array.size != self.config.window_size:
            raise ValueError(
                "window_series must match the configured window_size "
                f"({self.config.window_size})"
            )

        pe = permutation_entropy(
            window_array,
            embedding_dimension=self.config.embedding_dimension,
            delay=self.config.delay,
        )
        hfd = higuchi_fractal_dimension(window_array, kmax=self.config.kmax)

        sentinel_triggered = (
            pe > self._thresholds["permutation_entropy"]
            or hfd > self._thresholds["higuchi_fd"]
        )

        metrics: Dict[str, float] = {
            "permutation_entropy": pe,
            "higuchi_fd": hfd,
        }

        confirm_triggered = False
        wasserstein_value: Optional[float] = None

        if sentinel_triggered:
            self._consecutive_sentinels += 1
            if self._consecutive_sentinels >= self.config.consecutive_sentinels:
                if window_multivariate is None:
                    window_multivariate = window_array[:, np.newaxis]
                else:
                    window_multivariate = _as_float_array(window_multivariate)
                    if window_multivariate.ndim == 1:
                        window_multivariate = window_multivariate[:, np.newaxis]
                    if window_multivariate.shape[0] != self.config.window_size:
                        raise ValueError(
                            "window_multivariate must match window_size in rows"
                        )

                wasserstein_value = sliced_wasserstein_distance(
                    window_multivariate,
                    self._reference,
                    n_projections=self.config.n_projections,
                    quantile_points=self.config.quantile_points,
                    p=self.config.wasserstein_p,
                    random_state=self.config.random_state,
                )
                metrics["sliced_wasserstein"] = wasserstein_value
                confirm_triggered = (
                    wasserstein_value > self._thresholds["sliced_wasserstein"]
                )
        else:
            self._consecutive_sentinels = 0

        alert = sentinel_triggered and confirm_triggered

        if wasserstein_value is None:
            metrics["sliced_wasserstein"] = np.nan

        return DriftDetectionResult(
            sentinel_triggered=sentinel_triggered,
            confirm_triggered=confirm_triggered,
            alert=alert,
            metrics=metrics,
            thresholds=self._thresholds.copy(),
        )


__all__ = [
    "DriftDetectorConfig",
    "DriftDetectionResult",
    "LayeredDriftDetector",
    "permutation_entropy",
    "higuchi_fractal_dimension",
    "sliced_wasserstein_distance",
]
