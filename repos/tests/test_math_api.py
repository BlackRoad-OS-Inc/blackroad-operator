from __future__ import annotations

import json
import math
from pathlib import Path
import importlib.util
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import pytest
from fastapi.testclient import TestClient

from lucidia_math_lab.amundson_equations import phase_derivative


def _install_ambr_stubs() -> None:
    """Install lightweight stubs for the Amundson–BlackRoad package."""

    if "amundson_blackroad.autonomy" in sys.modules:
        return

    import types
    from dataclasses import dataclass

    pkg = types.ModuleType("amundson_blackroad")
    pkg.__path__ = []  # type: ignore[attr-defined]
    sys.modules["amundson_blackroad"] = pkg

    autonomy = types.ModuleType("amundson_blackroad.autonomy")

    def _trapz(x: np.ndarray, y: np.ndarray) -> float:
        return float(np.trapz(y, x))

    def conserved_mass(x: np.ndarray, A: np.ndarray) -> float:
        return _trapz(x, A)

    def simulate_transport(
        x: np.ndarray,
        A: np.ndarray,
        rho: np.ndarray,
        steps: int,
        dt: float,
        *,
        mu_A: float = 1.0,
        chi_A: float = 0.0,
        Uc: np.ndarray | None = None,
    ) -> dict[str, np.ndarray]:
        if steps <= 0 or dt <= 0:
            raise ValueError("steps and dt must be positive")
        flux = np.zeros_like(A)
        return {"x": x, "A": A, "flux": flux, "mass": conserved_mass(x, A)}

    autonomy.conserved_mass = conserved_mass
    autonomy.simulate_transport = simulate_transport
    sys.modules["amundson_blackroad.autonomy"] = autonomy
    setattr(pkg, "autonomy", autonomy)

    spiral = types.ModuleType("amundson_blackroad.spiral")

    def simulate_am2(T: float, dt: float, *args: float) -> tuple[np.ndarray, ...]:
        steps = max(int(T / dt), 1)
        t = np.linspace(0.0, T, steps)
        a = np.full_like(t, 0.1)
        theta = np.full_like(t, 0.2)
        amp = np.sqrt(a ** 2 + theta ** 2)
        return t, a, theta, amp

    spiral.simulate_am2 = simulate_am2
    sys.modules["amundson_blackroad.spiral"] = spiral
    setattr(pkg, "spiral", spiral)

    thermo = types.ModuleType("amundson_blackroad.thermo")

    def energy_increment(a: np.ndarray, theta: np.ndarray, dt: float, *, gamma: float, eta: float) -> float:
        return float(np.abs(a).sum() * dt * max(gamma, 1e-9))

    def landauer_min(bits: float, temperature: float) -> float:
        return float(bits * temperature * 1e-23)

    def spiral_entropy(a: np.ndarray, theta: np.ndarray) -> float:
        return float(np.mean(np.abs(a) + np.abs(theta)))

    thermo.energy_increment = energy_increment
    thermo.landauer_min = landauer_min
    thermo.spiral_entropy = spiral_entropy
    sys.modules["amundson_blackroad.thermo"] = thermo
    setattr(pkg, "thermo", thermo)

    resolution = types.ModuleType("amundson_blackroad.resolution")

    K_BOLTZMANN = 1.380649e-23

    @dataclass
    class AmbrContext:
        last_phi_x: float = 0.0
        last_phi_y: float = 0.0
        default_temperature_K: float = 300.0
        default_r: float = 1.0

    def resolve_coherence_inputs(
        ctx: AmbrContext = AmbrContext(),
        **payload: float,
    ) -> tuple[dict[str, float], list[str], dict[str, str]]:
        resolved: dict[str, float] = {}
        why: dict[str, str] = {}
        missing: list[str] = []

        omega_0 = float(payload.get("omega_0", 1.0))
        if "omega_0" not in payload:
            why["omega_0"] = "default 1.0 (baseline phase drift)"
        lambda_ = float(payload.get("lambda_", 0.5))
        if "lambda_" not in payload:
            why["lambda_"] = "default 0.5 (moderate coupling)"
        eta = float(payload.get("eta", 0.2))
        if "eta" not in payload:
            why["eta"] = "default 0.2 (gentle damping)"

        if "phi_x" in payload:
            phi_x = float(payload["phi_x"])
        else:
            phi_x = ctx.last_phi_x
            why["phi_x"] = "from context.last_phi_x"
        if "phi_y" in payload:
            phi_y = float(payload["phi_y"])
        else:
            phi_y = ctx.last_phi_y
            why["phi_y"] = "from context.last_phi_y"

        r_x = float(payload.get("r_x", ctx.default_r))
        if "r_x" not in payload:
            why["r_x"] = "default unity participation"
        r_y = float(payload.get("r_y", ctx.default_r))
        if "r_y" not in payload:
            why["r_y"] = "default unity participation"

        if "k_b_t" in payload:
            k_b_t = float(payload["k_b_t"])
        else:
            temperature_K = float(payload.get("temperature_K", ctx.default_temperature_K))
            if "temperature_K" not in payload:
                why["temperature_K"] = "default 300 K"
            k_b_t = K_BOLTZMANN * temperature_K
            why["k_b_t"] = "computed as k_B * T"

        for name, value in {
            "omega_0": omega_0,
            "lambda_": lambda_,
            "eta": eta,
            "phi_x": phi_x,
            "phi_y": phi_y,
            "r_x": r_x,
            "r_y": r_y,
            "k_b_t": k_b_t,
        }.items():
            if not math.isfinite(value):
                missing.append(name)

        resolved.update(
            omega_0=omega_0,
            lambda_=lambda_,
            eta=eta,
            phi_x=phi_x,
            phi_y=phi_y,
            r_x=r_x,
            r_y=r_y,
            k_b_t=k_b_t,
        )
        return resolved, missing, why

    resolution.K_BOLTZMANN = K_BOLTZMANN
    resolution.AmbrContext = AmbrContext
    resolution.resolve_coherence_inputs = resolve_coherence_inputs
    resolution.__all__ = ["AmbrContext", "K_BOLTZMANN", "resolve_coherence_inputs"]
    sys.modules["amundson_blackroad.resolution"] = resolution
    setattr(pkg, "resolution", resolution)


_install_ambr_stubs()

MODULE_PATH = Path(__file__).resolve().parents[1] / "srv" / "lucidia-math" / "api_ambr.py"
spec = importlib.util.spec_from_file_location(
    "lucidia_math",
    MODULE_PATH,
    submodule_search_locations=[str(MODULE_PATH.parent)],
)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
assert spec.loader
spec.loader.exec_module(module)  # type: ignore[arg-type]
app = module.app
SERVER_CONTEXT = module.SERVER_CONTEXT


@pytest.fixture
def client(tmp_path, monkeypatch) -> TestClient:
    monkeypatch.setenv("MATH_OUTPUT_DIR", str(tmp_path))
    return TestClient(app)


def _artifact_exists(output_dir: Path, record: dict) -> bool:
    path = output_dir / Path(record["relative_path"])
    return path.exists() and path.stat().st_size > 0


def test_fractal_endpoint_generates_artifact(client: TestClient, tmp_path: Path) -> None:
    response = client.get(
        "/api/math/fractals/mandelbrot",
        params={"width": 64, "height": 64, "iter": 32, "xmin": -2, "xmax": 1, "ymin": -1, "ymax": 1},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "artifact" in payload
    assert _artifact_exists(tmp_path, payload["artifact"])
    assert payload["units"]["width"] == "px"


def test_prime_endpoint_returns_sequence(client: TestClient) -> None:
    response = client.get("/api/math/primes", params={"limit": 50, "plot": False})
    assert response.status_code == 200
    payload = response.json()
    assert payload["count"] == len(payload["primes"])
    assert payload["count"] > 0


def test_truth_table_persists_json(client: TestClient, tmp_path: Path) -> None:
    response = client.post(
        "/api/math/logic/truth-table",
        json={"vars": ["A", "B"], "expression": "A and B"},
    )
    assert response.status_code == 200
    payload = response.json()
    artifact = payload["artifact"]
    assert _artifact_exists(tmp_path, artifact)
    table = payload["table"]
    assert table["rows"][0]["result"] is False
    assert table["rows"][-1]["result"] is True


def test_waves_endpoint_returns_samples(client: TestClient, tmp_path: Path) -> None:
    response = client.get(
        "/api/math/waves/sine",
        params={"freq": 2.0, "phase": 0.0, "samples": 32, "sample_rate": 128.0},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "samples" in payload
    sample_record = payload["samples"]
    path = tmp_path / Path(sample_record["relative_path"])
    assert path.exists()
    data = json.loads(path.read_text())
    assert len(data["values"]) == 32


def test_am2_endpoint_units(client: TestClient) -> None:
    response = client.get(
        "/api/ambr/sim/am2",
        params={"T": 0.1, "dt": 0.01, "a0": 0.2, "theta0": 0.1, "gamma": 0.5, "kappa": 0.3, "eta": 0.2},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["units"]["t"] == "s"
    assert len(payload["t"]) == len(payload["a"])


def test_transport_endpoint_conserves_mass(client: TestClient) -> None:
    x = np.linspace(-1.0, 1.0, 32)
    A = np.exp(-x ** 2)
    rho = np.tanh(x)
    response = client.post(
        "/api/ambr/sim/transport",
        json={
            "x": x.tolist(),
            "A": A.tolist(),
            "rho": rho.tolist(),
            "steps": 20,
            "dt": 1e-3,
            "mu": 0.5,
            "bits": 12,
            "temperature": 300.0,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert abs(payload["mass_error"]) < 1e-3
    assert "landauer" in payload
    assert payload["landauer"]["bits"] == 12
    assert payload["units"]["mass"] == "1"
    assert "flux" in payload["units"]


def test_energy_endpoint_reports_landauer(client: TestClient) -> None:
    response = client.post(
        "/api/ambr/energy",
        json={
            "T": 300.0,
            "a": 0.2,
            "theta": 0.3,
            "da": 0.01,
            "dtheta": 0.02,
            "Omega": 1e-21,
            "n_bits": 8,
            "temperature": 300.0,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["E_min"] > 0
    assert isinstance(payload["pass"], bool)
    assert payload["units"]["dE"] == "J"


def test_energy_endpoint_flags_landauer_violation(client: TestClient) -> None:
    response = client.post(
        "/api/ambr/energy",
        json={
            "T": 300.0,
            "a": 0.1,
            "theta": 0.1,
            "da": 0.0,
            "dtheta": 0.0,
            "Omega": 0.0,
            "n_bits": 4,
            "temperature": 300.0,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["E_min"] > 0
    assert payload["pass"] is False


def test_phase_derivative_endpoint_auto_resolves(client: TestClient) -> None:
    SERVER_CONTEXT.last_phi_x = 0.0
    SERVER_CONTEXT.last_phi_y = 1.2
    response = client.post("/api/ambr/coherence/dphi", json={"phi_x": 0.4})
    assert response.status_code == 200
    payload = response.json()
    resolved = payload["resolved"]
    assert payload["mode"] == "auto"
    assert math.isclose(payload["dphi_dt"], phase_derivative(**resolved))
    assert math.isclose(resolved["phi_x"], 0.4)
    assert math.isclose(resolved["phi_y"], 1.2)
    assert "phi_y" in payload["why"]


def test_phase_derivative_endpoint_auto_rejects_nan(client: TestClient) -> None:
    response = client.post("/api/ambr/coherence/dphi", json={"phi_x": "nan"})
    assert response.status_code == 422
    payload = response.json()
    assert payload["error_code"] == "invalid_parameters"
    assert any(field["field"] == "phi_x" for field in payload.get("fields", []))


@pytest.mark.parametrize(
    "payload, inferred",
    [
        (
            {},
            {"omega_0", "lambda_", "eta", "phi_x", "phi_y", "r_x", "r_y", "k_b_t"},
        ),
        (
            {"phi_x": 0.9, "phi_y": -0.3},
            {"omega_0", "lambda_", "eta", "r_x", "r_y", "k_b_t"},
        ),
    ],
)
def test_phase_derivative_endpoint_auto_temperature_inference(
    client: TestClient, payload: dict, inferred: set[str]
) -> None:
    SERVER_CONTEXT.last_phi_x = -0.25
    SERVER_CONTEXT.last_phi_y = 0.75
    request_json = {"temperature_K": 300.0, **payload}
    response = client.post("/api/ambr/coherence/dphi", json=request_json)
    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "auto"
    resolved = body["resolved"]
    why = body["why"]
    assert math.isclose(resolved["k_b_t"], 1.380649e-23 * 300.0)
    for field in inferred:
        assert field in why
    missing_fields = inferred & {"phi_x", "phi_y"}
    if "phi_x" in missing_fields:
        assert math.isclose(resolved["phi_x"], SERVER_CONTEXT.last_phi_x)
    if "phi_y" in missing_fields:
        assert math.isclose(resolved["phi_y"], SERVER_CONTEXT.last_phi_y)
    for provided in payload:
        if provided in why:
            pytest.fail(f"unexpected provenance entry recorded for provided field {provided}")


def test_phase_derivative_endpoint_strict_requires_fields(client: TestClient) -> None:
    response = client.post(
        "/api/ambr/coherence/dphi",
        json={"auto_resolve": False, "omega_0": 1.0},
    )
    assert response.status_code == 422
    payload = response.json()
    assert payload["error_code"] == "missing_parameters"


def test_phase_derivative_endpoint_strict_success(client: TestClient) -> None:
    body = {
        "auto_resolve": False,
        "omega_0": 1.0,
        "lambda_": 0.5,
        "eta": 0.2,
        "phi_x": 0.3,
        "phi_y": -0.2,
        "r_x": 1.1,
        "r_y": 0.9,
        "k_b_t": 1e-21,
    }
    response = client.post("/api/ambr/coherence/dphi", json=body)
    assert response.status_code == 200
    payload = response.json()
    resolved = payload["resolved"]
    assert payload["mode"] == "strict"
    assert payload["why"] == {}
    assert math.isclose(payload["dphi_dt"], phase_derivative(**resolved))


def test_phase_derivative_endpoint_strict_rejects_nan(client: TestClient) -> None:
    body = {
        "auto_resolve": False,
        "omega_0": 1.0,
        "lambda_": 0.5,
        "eta": 0.2,
        "phi_x": "nan",
        "phi_y": 0.1,
        "r_x": 1.0,
        "r_y": 1.0,
        "k_b_t": 1e-21,
    }
    response = client.post("/api/ambr/coherence/dphi", json=body)
    assert response.status_code == 422
    payload = response.json()
    assert isinstance(payload.get("fields"), list)
    assert payload["fields"]
    first_error = payload["fields"][0]
    assert first_error["field"] == "phi_x"
    assert "reason" in first_error


def test_phase_derivative_endpoint_strict_temperature_why_empty(client: TestClient) -> None:
    body = {
        "auto_resolve": False,
        "omega_0": 1.0,
        "lambda_": 0.5,
        "eta": 0.2,
        "phi_x": 0.3,
        "phi_y": -0.2,
        "r_x": 1.1,
        "r_y": 0.9,
        "k_b_t": 1e-21,
        "temperature_K": 310.0,
    }
    response = client.post("/api/ambr/coherence/dphi", json=body)
    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "strict"
    assert payload["why"] == {}
def test_negative_temperature_request_rejected(client: TestClient) -> None:
    response = client.post(
        "/api/ambr/energy",
        json={
            "T": 300.0,
            "a": 0.2,
            "theta": 0.3,
            "da": 0.01,
            "dtheta": 0.02,
            "Omega": 1.0,
            "n_bits": 1,
            "temperature": -5.0,
        },
    )
    assert response.status_code == 422
    payload = response.json()
    assert payload["error_code"] == "validation_error"
    assert isinstance(payload["hint"], list)
