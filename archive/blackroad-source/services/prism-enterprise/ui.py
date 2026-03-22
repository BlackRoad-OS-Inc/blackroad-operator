"""User-facing interfaces for the Lucidia math platform."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any, Callable, Dict

from flask import Flask, jsonify, request, send_from_directory

from . import finance, fractals, logic, numbers, primes, proofs, waves
from .api_ambr import ambr_api, bp as ambr_bp, run_am2_simulation, run_transport_simulation
from .api_math import mandelbrot_counts, math_api, primes_payload, sine_wave_samples, truth_table_payload
from packages.textviz import pgm_p2

MENU: Dict[str, Callable[[], Dict[str, object]]] = {}


def _demo_am2() -> Dict[str, object]:
    return run_am2_simulation({})


def _demo_transport() -> Dict[str, object]:
    import numpy as np

    x = np.linspace(-1.0, 1.0, 64)
    A0 = np.exp(-x**2)
    rho = 1.0 - 0.2 * x**2
    body = {
        "x": x.tolist(),
        "A": A0.tolist(),
        "rho": rho.tolist(),
        "dt": 1e-3,
        "steps": 50,
        "bits": 8,
        "temperature": 300.0,
    }
    return run_transport_simulation(body)


def _demo_mandelbrot() -> Dict[str, object]:
    counts = mandelbrot_counts(40, 40, 40, -2.0, 1.0, -1.5, 1.5)
    return {"format": "PGM", "sample": pgm_p2(counts).splitlines()[:10], "units": {"format": "portable-graymap"}}


def _demo_primes() -> Dict[str, object]:
    return primes_payload(100)


def _demo_logic() -> Dict[str, object]:
    return truth_table_payload("a and not b", ["a", "b"])


def _demo_wave() -> Dict[str, object]:
    xs, ys = sine_wave_samples(1.0, 0.0, 16, 1.0)
    return {"x": xs, "y": ys, "units": {"x": "s", "y": "arb"}}


MENU.update(
    {
        "AM-2": _demo_am2,
        "Transport": _demo_transport,
        "Mandelbrot": _demo_mandelbrot,
        "Primes": _demo_primes,
        "Logic": _demo_logic,
        "Wave": _demo_wave,
        "Finance": finance.demo,
        "Numbers": numbers.demo,
        "Fractals": lambda: fractals.demo(),
        "Proofs": lambda: proofs.demo(),
        "Waves": lambda: waves.demo(),
    }
)


def repl() -> None:
    """Simple command line REPL exposing demo functions."""

    options = list(MENU.keys())
    while True:
        for idx, name in enumerate(options, start=1):
            print(f"{idx}. {name}")
        print("0. Exit")
        try:
            choice = int(input("Select module: "))
        except ValueError:
            print("Invalid input\n")
            continue
        if choice == 0:
            break
        if 1 <= choice <= len(options):
            name = options[choice - 1]
            result = MENU[name]()
            print(json.dumps({"module": name, "result": result}, indent=2))
        else:
            print("Invalid selection\n")


def create_app() -> Flask:
    """Create a minimal Flask application exposing the text-only API."""

    app = Flask(__name__)
    app.register_blueprint(ambr_api)
    app.register_blueprint(math_api)

    @app.get("/api/demo/<module>")
    def api_demo(module: str):  # pragma: no cover - thin wrapper
        func = MENU.get(module.replace("-", " ").title())
        if not func:
            return jsonify({"error": "unknown module"}), 404
        return jsonify(func())

    return app


def demo() -> None:
    """Launch the REPL for interactive exploration."""

    repl()


interactive_app = create_app()

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
_AMBR_ROOT = Path(__file__).resolve().parents[2] / "packages" / "amundson_blackroad"


def _safe_float(value: Any, default: float | None = None) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: Any, default: int | None = None) -> int | None:
    try:
        return int(value) if value is not None else default
    except (TypeError, ValueError):
        return default


def _load_ambr_module(name: str):
    module_name = f"amundson_blackroad.{name}"
    if module_name in sys.modules:
        return sys.modules[module_name]
    path = _AMBR_ROOT / f"{name}.py"
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"unable to load module {module_name}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


resolution = _load_ambr_module("resolution")
projective = _load_ambr_module("projective")
chebyshev = _load_ambr_module("chebyshev")
collatz = _load_ambr_module("collatz")
fib_pascal = _load_ambr_module("fib_pascal")

api_app = Flask(__name__)
api_app.register_blueprint(ambr_bp)
app = api_app


@api_app.get("/health")
def health() -> tuple:
    return jsonify({"status": "ok"})


@api_app.get("/api/math/<path:subpath>")
def get_output(subpath: str):
    """Serve generated artifacts from the output tree."""

    return send_from_directory(OUTPUT_DIR, subpath)


@api_app.get("/api/ambr/resolve")
def resolve_endpoint():
    args = request.args
    ctx = resolution.AmbrContext(
        last_phi_x=_safe_float(args.get("last_phi_x"), 0.0) or 0.0,
        last_phi_y=_safe_float(args.get("last_phi_y"), 0.0) or 0.0,
        default_temperature_K=_safe_float(args.get("default_temperature_K"), 300.0) or 300.0,
        default_r=_safe_float(args.get("default_r"), 1.0) or 1.0,
    )
    payload: Dict[str, float] = {}
    for key in ("omega_0", "lambda_", "eta", "phi_x", "phi_y", "r", "amplitude", "temperature_K", "k_b_t"):
        value = _safe_float(args.get(key))
        if value is not None:
            payload[key] = value
    resolved, missing, why = resolution.resolve_coherence_inputs(ctx, **payload)
    units = {
        "omega_0": "rad/s",
        "lambda_": "1",
        "eta": "1",
        "phi_x": "rad",
        "phi_y": "rad",
        "r": "1",
        "amplitude": "1",
        "temperature_K": "K",
        "k_b_t": "J",
    }
    return jsonify({"resolved": resolved, "missing": missing, "why": why, "units": units})


@api_app.post("/api/ambr/am6/projective_step")
def projective_step():
    body = request.get_json(force=True)
    a = _safe_float(body.get("a"), 0.0) or 0.0
    gamma = _safe_float(body.get("gamma"), 0.3) or 0.3
    kappa = _safe_float(body.get("kappa"), 0.7) or 0.7
    eta = _safe_float(body.get("eta"), 0.5) or 0.5
    omega0 = _safe_float(body.get("omega0"), 1.0) or 1.0
    if "u" in body:
        u = _safe_float(body.get("u"), 0.0) or 0.0
        theta = projective.theta_from_u(u)
    else:
        theta = _safe_float(body.get("theta"), 0.0) or 0.0
        u = projective.u_from_theta(theta)
    a_dot, u_dot, theta_dot, response = projective.projective_am2_step(a, u, gamma, kappa, eta, omega0)
    dt = _safe_float(body.get("dt"))
    payload: Dict[str, Any] = {
        "theta": theta,
        "u": u,
        "a": a,
        "derivatives": {"a_dot": a_dot, "u_dot": u_dot, "theta_dot": theta_dot},
        "response": response,
        "units": {
            "theta": "rad",
            "u": "1",
            "a": "1",
            "a_dot": "1/s",
            "u_dot": "1/s",
            "theta_dot": "rad/s",
        },
    }
    if dt is not None and dt > 0:
        u_next = u + dt * u_dot
        payload["next_state"] = {
            "a": a + dt * a_dot,
            "u": u_next,
            "theta": projective.theta_from_u(u_next),
        }
        payload["units"]["dt"] = "s"
        payload["dt"] = dt
    return jsonify(payload)


@api_app.get("/api/ambr/am8/resonance")
def resonance_endpoint():
    theta = _safe_float(request.args.get("theta"))
    if theta is None:
        return jsonify({"error": "theta required"}), 400
    n_max = _safe_int(request.args.get("n_max"), 10) or 10
    scores = chebyshev.resonance_score(theta, n_max)
    return jsonify(
        {
            "theta": theta,
            "n": scores["n"].tolist(),
            "p": scores["p"].tolist(),
            "approx": scores["approx"].tolist(),
            "score": scores["score"].tolist(),
            "units": {"theta": "rad", "score": "1"},
        }
    )


@api_app.post("/api/ambr/br8/collatz_push")
def collatz_push():
    body = request.get_json(force=True)
    raw_dist = body.get("A", {})
    distribution: Dict[int, float] = {}
    for key, value in raw_dist.items():
        state = _safe_int(key)
        mass = _safe_float(value)
        if state is None or mass is None:
            continue
        distribution[state] = mass
    steps = _safe_int(body.get("steps"), 1) or 1
    temperature = _safe_float(body.get("temperature_K"), 300.0) or 300.0
    next_dist, energy = collatz.collatz_pushforward(distribution, steps, temperature_K=temperature)
    return jsonify(
        {
            "A_next": {str(k): v for k, v in next_dist.items()},
            "delta_E_min_J": energy,
            "total_mass": sum(next_dist.values()),
            "units": {"delta_E_min_J": "J", "temperature_K": "K"},
            "temperature_K": temperature,
        }
    )


@api_app.get("/api/ambr/fibpascal/row")
def fib_pascal_row():
    n = _safe_int(request.args.get("n"), 0)
    if n is None or n < 0:
        return jsonify({"error": "n must be non-negative"}), 400
    row = fib_pascal.pascal_row(n)
    diagonal = fib_pascal.pascal_diagonal_sums(n)
    fib_target = fib_pascal.fib(n + 1)
    return jsonify(
        {
            "row": row,
            "n": n,
            "fib_target": fib_target,
            "diagonal_sum": diagonal,
            "matches_fibonacci": diagonal == fib_target,
            "units": {"row": "1", "fib_target": "1"},
        }
    )


if __name__ == "__main__":
    api_app.run(host="127.0.0.1", port=8500)

__all__ = ["repl", "app"]

app = create_app()
