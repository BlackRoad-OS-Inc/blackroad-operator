#!/usr/bin/env python3
"""Phase VI ↔ Phase VII bridge orchestration layer.

This module stitches together the autonomy/ trust transport equations from
``codex_phase_06`` with the variational + GKSL dynamics in ``codex_phase_07``.
It provides:

* ``sample_trust_field`` – convert a spatial trust history into a temporal probe.
* ``construct_coupled_hamiltonian`` – map Amundson spiral parameters to a qubit H.
* ``BridgeStreamer`` – rate-limited UDP streaming helper for Unity dashboards.
* ``run_coupled_evolution`` – execute the coupled simulation end-to-end.
* Diagnostics helpers (Bloch vector extraction, plotting, CLI entry point).

The intent is to promote reproducible experiments that validate how Phase VI
mass conservation propagates into Phase VII entropy growth while enabling live
visualisation through the Unity bridge.
"""

from __future__ import annotations

import argparse
import contextlib
import logging
import math
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, Iterable, List, Optional, Tuple

import numpy as np
from matplotlib import pyplot as plt
from matplotlib import animation
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401  (side-effect import)
from scipy.interpolate import interp1d

try:  # Phase VI imports
    from codex_phase_06 import (
        AmundsonSpiral,
        BlackRoadField,
        PhysicalConstants as PhaseVIConstants,
    )
except ImportError as exc:  # pragma: no cover - defensive fallback
    raise RuntimeError("Phase VI module is required for the bridge") from exc

try:  # Phase VII imports
    from codex_phase_07 import (
        GKSL,
        LagrangianConfig,
        VariationalSystem,
        UnityBridge,
        von_neumann_entropy,
    )
except Exception as exc:  # pragma: no cover - defensive fallback
    warnings.warn(
        f"Falling back to phase_vii_shim due to import error: {exc}",
        RuntimeWarning,
    )
    from phase_vii_shim import (  # type: ignore
        GKSL,
        LagrangianConfig,
        VariationalSystem,
        UnityBridge,
        von_neumann_entropy,
    )


logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

CONST = PhaseVIConstants()


# ---------------------------------------------------------------------------
# Core bridge utilities
# ---------------------------------------------------------------------------

def sample_trust_field(
    x: np.ndarray,
    rho_history: np.ndarray,
    t_eval: np.ndarray,
    *,
    strategy: str = "mean",
    probe_position: float = 0.0,
) -> Callable[[float], float]:
    """Convert a spatial trust history ``rho_history(x, t)`` into ``rho(t)``.

    Parameters
    ----------
    x:
        Spatial grid (shape ``[N_space]``).
    rho_history:
        Trust history (shape ``[N_time, N_space]``).
    t_eval:
        Time stamps associated with ``rho_history``.
    strategy:
        ``"mean"`` (default) uses the spatial mean.  ``"peak"`` tracks the
        maximum trust value, while ``"probe"`` samples the cell closest to
        ``probe_position``.
    probe_position:
        Spatial location used when ``strategy == "probe"``.
    """

    if rho_history.shape != (len(t_eval), len(x)):
        raise ValueError("rho_history shape must match (len(t_eval), len(x))")

    if strategy not in {"mean", "peak", "probe"}:
        raise ValueError("strategy must be one of 'mean', 'peak', or 'probe'")

    if strategy == "mean":
        series = rho_history.mean(axis=1)
    elif strategy == "peak":
        series = rho_history.max(axis=1)
    else:  # probe strategy
        idx = int(np.argmin(np.abs(x - probe_position)))
        series = rho_history[:, idx]

    interpolator = interp1d(
        t_eval,
        series,
        kind="cubic",
        bounds_error=False,
        fill_value="extrapolate",
    )

    return lambda t: float(interpolator(t))


def construct_coupled_hamiltonian(
    a: float,
    theta: float,
    *,
    omega_spiral: float = 1.0,
) -> np.ndarray:
    """Map Amundson spiral parameters to a driven qubit Hamiltonian."""

    sigma_x = np.array([[0.0, 1.0], [1.0, 0.0]], dtype=complex)
    sigma_y = np.array([[0.0, -1.0j], [1.0j, 0.0]], dtype=complex)
    sigma_z = np.array([[1.0, 0.0], [0.0, -1.0]], dtype=complex)

    return omega_spiral * sigma_z + a * sigma_x + theta * sigma_y


class BridgeStreamer:
    """Rate-limited sender that pushes coupled state to Unity via UDP."""

    def __init__(self, bridge: UnityBridge, *, fps: int = 30) -> None:
        self.bridge = bridge
        self.fps = max(1, int(fps))
        self.dt_send = 1.0 / float(self.fps)
        self._last_send_time = -math.inf

    def send_state(self, t_sim: float, payload: Dict[str, object]) -> None:
        """Send payload respecting the configured frame rate."""

        if t_sim - self._last_send_time < self.dt_send:
            return
        message = {
            "timestamp": float(t_sim),
            "phase_vi": {
                "autonomy": float(payload.get("A", 0.0)),
                "trust": float(payload.get("rho", 0.0)),
            },
            "phase_vii": {
                "a": float(payload.get("a", 0.0)),
                "theta": float(payload.get("theta", 0.0)),
                "entropy": float(payload.get("S", 0.0)),
                "bloch": [float(x) for x in payload.get("bloch", (0.0, 0.0, 1.0))],
            },
        }
        self.bridge.send(message)
        self._last_send_time = float(t_sim)


# ---------------------------------------------------------------------------
# Coupled evolution driver
# ---------------------------------------------------------------------------

def _unity_context(bridge: UnityBridge):
    """Provide a safe context manager around ``UnityBridge`` implementations."""

    @contextlib.contextmanager
    def _manager():
        if hasattr(bridge, "__enter__") and hasattr(bridge, "__exit__"):
            with bridge:  # type: ignore[misc]
                yield bridge
        else:
            try:
                yield bridge
            finally:
                close = getattr(bridge, "close", None)
                if callable(close):
                    close()

    return _manager()


@dataclass
class BridgeResults:
    """Container for coupled simulation results."""

    t: np.ndarray
    x: np.ndarray
    autonomy_history: np.ndarray
    autonomy_conservation_error: float
    trust_history: np.ndarray
    trust_probe: Callable[[float], float]
    variational_traj: np.ndarray
    energy: np.ndarray
    quantum_states: List[np.ndarray]
    entropy: np.ndarray
    entropy_monotonic: bool

    def bloch_history(self) -> np.ndarray:
        return np.array([bloch_vector(rho) for rho in self.quantum_states])


def run_coupled_evolution(
    *,
    T_end: float = 10.0,
    N_steps: int = 1000,
    stream_to_unity: bool = True,
    unity_host: str = "127.0.0.1",
    unity_port: int = 44444,
    unity_fps: int = 30,
    trust_strategy: str = "mean",
) -> BridgeResults:
    """Execute Phase VI → Phase VII coupled dynamics."""

    if N_steps < 2:
        raise ValueError("N_steps must be ≥ 2")

    # --- Phase VI: autonomy & trust transport ---------------------------------
    L = 10.0
    x = np.linspace(-L / 2.0, L / 2.0, 256)
    t = np.linspace(0.0, float(T_end), int(N_steps))
    dt = float(t[1] - t[0])
    dx = float(x[1] - x[0])

    field = BlackRoadField(mu_A=1.0)
    A_init = np.exp(-x**2)

    spiral = AmundsonSpiral(a0=0.1, theta0=0.0, gamma=0.05, kappa=0.4, eta=0.2)
    a_traj_spiral, theta_traj_spiral, psi_amp = spiral.coupled_dynamics(t)

    rho_init = -np.exp(-(x - 2.0) ** 2) - np.exp(-(x + 2.0) ** 2)

    autonomy_history, conservation_error = field.simulate_transport_1D(
        x,
        t,
        A_init,
        rho_init,
    )

    trust_history = np.zeros_like(autonomy_history)
    trust_history[0] = rho_init

    for idx in range(len(t) - 1):
        Psi_slice = np.full_like(x, psi_amp[idx], dtype=float)
        trust_history[idx + 1] = field.trust_evolution_step(
            trust_history[idx],
            Psi_slice,
            autonomy_history[idx],
            dx,
            dt,
        )

    rho_fun = sample_trust_field(x, trust_history, t, strategy=trust_strategy)

    # --- Phase VII: Variational leapfrog --------------------------------------
    cfg = LagrangianConfig(k_a=0.4, gamma_a=0.05, gamma_theta=0.05)
    var_sys = VariationalSystem(cfg)
    y0 = np.array([a_traj_spiral[0], 0.0, theta_traj_spiral[0], 0.0], dtype=float)
    variational_traj = var_sys.leapfrog(y0, t, rho_fun)
    energy = VariationalSystem.energy(cfg, variational_traj, rho_fun, t)

    # --- Phase VII: GKSL evolution --------------------------------------------
    rho_q = np.array([[1.0, 0.0], [0.0, 0.0]], dtype=complex)
    quantum_states: List[np.ndarray] = []
    entropy_vals: List[float] = []

    for idx, t_i in enumerate(t):
        a_val, _, theta_val, _ = variational_traj[idx]
        H = construct_coupled_hamiltonian(a_val, theta_val)
        L_damp = np.sqrt(0.1) * np.array([[0.0, 1.0], [0.0, 0.0]], dtype=complex)
        gksl = GKSL(H, (L_damp,))

        if idx < len(t) - 1:
            rho_q = gksl.step_rk4(rho_q, t[idx + 1] - t_i, CONST.hbar)

        quantum_states.append(rho_q.copy())
        entropy_vals.append(von_neumann_entropy(rho_q))

    entropy_array = np.asarray(entropy_vals)
    entropy_monotonic = bool(np.all(np.diff(entropy_array) >= -1e-10))
    if not entropy_monotonic:
        logger.warning(
            "Entropy decreased during evolution (min ΔS = %.3e)",
            float(np.min(np.diff(entropy_array))),
        )

    # --- Unity streaming ------------------------------------------------------
    if stream_to_unity:
        try:
            bridge = UnityBridge(host=unity_host, port=int(unity_port))
        except Exception as exc:  # pragma: no cover - runtime guard
            logger.error("Failed to initialise UnityBridge: %s", exc)
        else:
            with _unity_context(bridge) as managed_bridge:
                streamer = BridgeStreamer(managed_bridge, fps=unity_fps)
                for idx, t_i in enumerate(t):
                    streamer.send_state(
                        float(t_i),
                        {
                            "A": float(np.mean(autonomy_history[idx])),
                            "rho": float(rho_fun(float(t_i))),
                            "a": float(variational_traj[idx, 0]),
                            "theta": float(variational_traj[idx, 2]),
                            "S": float(entropy_array[idx]),
                            "bloch": bloch_vector(quantum_states[idx]),
                        },
                    )

    return BridgeResults(
        t=t,
        x=x,
        autonomy_history=autonomy_history,
        autonomy_conservation_error=float(conservation_error),
        trust_history=trust_history,
        trust_probe=rho_fun,
        variational_traj=variational_traj,
        energy=energy,
        quantum_states=quantum_states,
        entropy=entropy_array,
        entropy_monotonic=entropy_monotonic,
    )


# ---------------------------------------------------------------------------
# Diagnostics and visualisation
# ---------------------------------------------------------------------------

def bloch_vector(rho: np.ndarray) -> Tuple[float, float, float]:
    """Return Bloch coordinates for a qubit density matrix."""

    sigma_x = np.array([[0.0, 1.0], [1.0, 0.0]], dtype=complex)
    sigma_y = np.array([[0.0, -1.0j], [1.0j, 0.0]], dtype=complex)
    sigma_z = np.array([[1.0, 0.0], [0.0, -1.0]], dtype=complex)

    return (
        float(np.real(np.trace(rho @ sigma_x))),
        float(np.real(np.trace(rho @ sigma_y))),
        float(np.real(np.trace(rho @ sigma_z))),
    )


def plot_bridge_diagnostics(
    results: BridgeResults,
    *,
    save_prefix: Optional[Path] = None,
    show: bool = True,
    animate_bloch: bool = True,
) -> None:
    """Generate 3D phase-space plot and Bloch sphere diagnostics."""

    bloch_hist = results.bloch_history()

    fig = plt.figure(figsize=(10, 6))
    ax = fig.add_subplot(111, projection="3d")
    ax.plot(
        results.variational_traj[:, 0],
        results.variational_traj[:, 2],
        [results.trust_probe(float(t_i)) for t_i in results.t],
        color="navy",
        label="(a, θ, ρ_probe)",
    )
    ax.set_xlabel("a")
    ax.set_ylabel("θ")
    ax.set_zlabel("ρ_probe")
    ax.legend()
    ax.set_title("Phase VI–VII Coupled Trajectory")
    fig.tight_layout()

    if save_prefix is not None:
        path = Path(f"{save_prefix}_phase_space.png")
        fig.savefig(path, dpi=300, bbox_inches="tight")
    if show:
        plt.show()
    else:
        plt.close(fig)

    if animate_bloch:
        _animate_bloch_history(
            results.t,
            bloch_hist,
            save_prefix=save_prefix,
            show=show,
        )


def _animate_bloch_history(
    t: np.ndarray,
    bloch_hist: np.ndarray,
    *,
    save_prefix: Optional[Path],
    show: bool,
) -> None:
    """Create a simple Bloch-sphere animation."""

    fig = plt.figure(figsize=(6, 6))
    ax = fig.add_subplot(111, projection="3d")
    ax.set_xlim((-1.0, 1.0))
    ax.set_ylim((-1.0, 1.0))
    ax.set_zlim((-1.0, 1.0))
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Bloch Vector Evolution")

    point, = ax.plot([], [], [], marker="o", color="crimson", markersize=6)

    def init():
        point.set_data([], [])
        point.set_3d_properties([])
        return (point,)

    def update(frame_idx: int):
        point.set_data(bloch_hist[frame_idx, 0], bloch_hist[frame_idx, 1])
        point.set_3d_properties(bloch_hist[frame_idx, 2])
        return (point,)

    anim = animation.FuncAnimation(
        fig,
        update,
        frames=len(t),
        init_func=init,
        interval=1000 * (t[1] - t[0]),
        blit=True,
    )

    if save_prefix is not None:
        path = Path(f"{save_prefix}_bloch.mp4")
        anim.save(path, dpi=200)
    if show:
        plt.show()
    else:
        plt.close(fig)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv: Optional[Iterable[str]] = None) -> None:
    parser = argparse.ArgumentParser(description="Phase VI ↔ Phase VII bridge")
    parser.add_argument("--duration", type=float, default=10.0, help="Simulation horizon [s]")
    parser.add_argument("--steps", type=int, default=1000, help="Number of integration steps")
    parser.add_argument("--no-stream", action="store_true", help="Disable Unity UDP streaming")
    parser.add_argument("--unity-host", type=str, default="127.0.0.1", help="Unity host")
    parser.add_argument("--unity-port", type=int, default=44444, help="Unity UDP port")
    parser.add_argument("--unity-fps", type=int, default=30, help="Streaming frame rate")
    parser.add_argument(
        "--trust-strategy",
        choices=["mean", "peak", "probe"],
        default="mean",
        help="Spatial sampling strategy for trust field",
    )
    parser.add_argument("--plot", action="store_true", help="Show diagnostics plots")
    parser.add_argument("--save-prefix", type=Path, default=None, help="Optional prefix for saved figures")

    args = parser.parse_args(list(argv) if argv is not None else None)

    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    logger.info("Running coupled evolution (T_end=%.2f, steps=%d)", args.duration, args.steps)

    results = run_coupled_evolution(
        T_end=args.duration,
        N_steps=args.steps,
        stream_to_unity=not args.no_stream,
        unity_host=args.unity_host,
        unity_port=args.unity_port,
        unity_fps=args.unity_fps,
        trust_strategy=args.trust_strategy,
    )

    logger.info("Autonomy conservation error: %.3e", results.autonomy_conservation_error)
    logger.info("Entropy monotonic: %s", results.entropy_monotonic)

    if args.plot or args.save_prefix is not None:
        plot_bridge_diagnostics(
            results,
            save_prefix=args.save_prefix,
            show=args.plot,
            animate_bloch=True,
        )


if __name__ == "__main__":  # pragma: no cover
    main()
