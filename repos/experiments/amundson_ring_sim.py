"""Ring network construction and coherence flow simulation.

This module implements the ``Amundson VII–IX`` recipe provided by the user.
It creates a polar ring layout, assigns the exponential weights that penalise
radial jumps and large angular separations, and simulates the stochastic phase
flow with an Euler–Maruyama integrator.  The simulation reports the spectral
gap of the weighted graph together with the Kuramoto-style order parameters for
each ring.

Run the script directly to generate a network, simulate the flow, and print the
per-ring coherence trajectories.  Example::

    python experiments/amundson_ring_sim.py --rings 3 --counts 6,12,24 --steps 400

The output includes the spectral gap ``lambda_2`` of the graph Laplacian and a
CSV table showing the order parameter magnitude for each ring over time.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple

import numpy as np


@dataclass(frozen=True)
class Station:
    """Metadata for a station on a polar ring layout."""

    index: int
    ring: int
    angle: float
    radius: float


def ring_radii(r0: float, growth: float, rings: int) -> np.ndarray:
    """Return monotonically increasing radii for ``rings`` concentric circles."""

    exponents = np.arange(rings, dtype=float)
    return r0 * np.exp(growth * exponents)


def build_stations(
    counts: Sequence[int],
    r0: float,
    growth: float,
    theta_offsets: Sequence[float] | float = 0.0,
) -> List[Station]:
    """Construct the polar grid stations for the Amundson layout."""

    rings = len(counts)
    radii = ring_radii(r0, growth, rings)
    if isinstance(theta_offsets, Iterable) and not isinstance(theta_offsets, (str, bytes)):
        offsets = list(theta_offsets)
        if len(offsets) != rings:
            raise ValueError("theta_offsets must match number of rings")
    else:
        offsets = [float(theta_offsets)] * rings

    stations: List[Station] = []
    idx = 0
    for ring, (count, radius, offset) in enumerate(zip(counts, radii, offsets)):
        for k in range(count):
            angle = offset + (2.0 * np.pi * k) / float(count)
            stations.append(Station(index=idx, ring=ring, angle=angle, radius=radius))
            idx += 1
    return stations


def angular_decay(theta_i: float, theta_j: float) -> float:
    """Return the angular weight decay term ``exp(-beta * (1 - cos Δθ))``."""

    delta = theta_i - theta_j
    return 1.0 - np.cos(delta)


def weight_matrix(
    stations: Sequence[Station],
    alpha: float,
    beta: float,
) -> np.ndarray:
    """Construct the exponential weight matrix described in Amundson VII."""

    n = len(stations)
    w = np.zeros((n, n), dtype=float)
    for i, si in enumerate(stations):
        for j in range(i + 1, n):
            sj = stations[j]
            radial = np.exp(-alpha * abs(si.ring - sj.ring))
            angular = np.exp(-beta * angular_decay(si.angle, sj.angle))
            wij = radial * angular
            w[i, j] = wij
            w[j, i] = wij
    return w


def laplacian_spectral_gap(weights: np.ndarray) -> float:
    """Return the second-smallest eigenvalue of the combinatorial Laplacian."""

    degrees = np.sum(weights, axis=1)
    laplacian = np.diag(degrees) - weights
    # Numerical precision can introduce tiny negative components; clip them.
    laplacian = (laplacian + laplacian.T) * 0.5
    eigenvalues = np.linalg.eigvalsh(laplacian)
    eigenvalues.sort()
    if eigenvalues.size < 2:
        return 0.0
    return float(eigenvalues[1])


def simulate_flow(
    weights: np.ndarray,
    steps: int,
    dt: float,
    lam: float,
    temperature: float,
    rng: np.random.Generator,
    phi0: np.ndarray | None = None,
) -> np.ndarray:
    """Simulate the stochastic phase flow using Euler–Maruyama integration."""

    n = weights.shape[0]
    if phi0 is None:
        phi = rng.uniform(0.0, 2.0 * np.pi, size=n)
    else:
        phi = np.asarray(phi0, dtype=float)
        if phi.shape != (n,):
            raise ValueError("phi0 must have shape (n,)")
    phases = np.empty((steps + 1, n), dtype=float)
    phases[0] = phi
    noise_scale = np.sqrt(max(temperature, 0.0) * 2.0 * dt)

    for t in range(steps):
        phase_diff = phases[t][:, np.newaxis] - phases[t][np.newaxis, :]
        sin_term = np.sin(-phase_diff)  # sin(phi_j - phi_i)
        drift = lam * np.sum(weights * sin_term, axis=1)
        noise = rng.normal(scale=noise_scale, size=n)
        phases[t + 1] = phases[t] + dt * drift + noise
        phases[t + 1] = np.mod(phases[t + 1], 2.0 * np.pi)
    return phases


def ring_order_parameters(
    phases: np.ndarray,
    counts: Sequence[int],
) -> Tuple[np.ndarray, np.ndarray]:
    """Return magnitude and mean phase for each ring at every timestep."""

    rings = len(counts)
    indices: List[np.ndarray] = []
    start = 0
    for count in counts:
        end = start + count
        indices.append(np.arange(start, end))
        start = end

    timesteps = phases.shape[0]
    magnitudes = np.zeros((timesteps, rings), dtype=float)
    mean_phases = np.zeros((timesteps, rings), dtype=float)

    for t in range(timesteps):
        for ring, idx in enumerate(indices):
            values = phases[t, idx]
            order = np.exp(1j * values).mean()
            magnitudes[t, ring] = np.abs(order)
            mean_phases[t, ring] = np.angle(order)
    return magnitudes, mean_phases


def parse_counts(arg: str, rings: int | None = None) -> List[int]:
    """Parse a comma-separated list of integers and validate length."""

    values = [int(token.strip()) for token in arg.split(",") if token.strip()]
    if rings is not None and len(values) != rings:
        raise argparse.ArgumentTypeError(
            f"expected {rings} counts, received {len(values)}"
        )
    if any(v <= 0 for v in values):
        raise argparse.ArgumentTypeError("counts must be positive integers")
    return values


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rings", type=int, default=3, help="number of concentric rings")
    parser.add_argument(
        "--counts",
        type=str,
        default="6,12,24",
        help="comma-separated station counts for each ring",
    )
    parser.add_argument("--base-radius", type=float, default=1.0, help="radius of the core ring")
    parser.add_argument(
        "--growth",
        type=float,
        default=np.log(1.3),
        help="exponential growth factor between successive ring radii",
    )
    parser.add_argument(
        "--theta-offsets",
        type=str,
        default=None,
        help="optional comma-separated angular offsets (radians) per ring",
    )
    parser.add_argument("--alpha", type=float, default=1.0, help="radial decay coefficient")
    parser.add_argument("--beta", type=float, default=4.0, help="angular decay coefficient")
    parser.add_argument("--lambda", dest="lam", type=float, default=1.0, help="coupling strength")
    parser.add_argument("--temperature", type=float, default=0.02, help="thermal noise level")
    parser.add_argument("--steps", type=int, default=400, help="simulation steps")
    parser.add_argument("--dt", type=float, default=0.01, help="integration timestep")
    parser.add_argument("--seed", type=int, default=13, help="random seed for reproducibility")

    args = parser.parse_args()

    if args.rings <= 0:
        raise SystemExit("--rings must be positive")

    counts = parse_counts(args.counts, rings=args.rings)
    if args.theta_offsets is None:
        theta_offsets: Sequence[float] | float = 0.0
    else:
        offset_values = [float(token.strip()) for token in args.theta_offsets.split(",")]
        if len(offset_values) != args.rings:
            raise SystemExit("--theta-offsets must provide one value per ring")
        theta_offsets = offset_values

    stations = build_stations(counts, args.base_radius, args.growth, theta_offsets)
    weights = weight_matrix(stations, args.alpha, args.beta)
    gap = laplacian_spectral_gap(weights)

    rng = np.random.default_rng(args.seed)
    phases = simulate_flow(weights, args.steps, args.dt, args.lam, args.temperature, rng)
    magnitudes, mean_phases = ring_order_parameters(phases, counts)

    print("# Amundson ring coherence simulation")
    print(f"rings={args.rings} counts={counts} lambda={args.lam} T={args.temperature}")
    print(f"alpha={args.alpha} beta={args.beta} base_radius={args.base_radius} growth={args.growth}")
    print(f"spectral_gap_lambda2={gap:.6f}")
    header = ["time"] + [f"R_{ring}" for ring in range(args.rings)] + [f"psi_{ring}" for ring in range(args.rings)]
    print(",".join(header))
    times = np.linspace(0.0, args.steps * args.dt, num=args.steps + 1)
    for t, time in enumerate(times):
        row = [f"{time:.6f}"]
        row.extend(f"{magnitudes[t, ring]:.6f}" for ring in range(args.rings))
        row.extend(f"{mean_phases[t, ring]:.6f}" for ring in range(args.rings))
        print(",".join(row))


if __name__ == "__main__":
    main()
