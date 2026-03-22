"""Integration tests for the text-only math API."""
from __future__ import annotations

import importlib.util
from pathlib import Path
import sys

import numpy as np
import pytest


def _load_create_app():
    root = Path(__file__).resolve().parents[2]
    pkg_dir = root / "srv" / "lucidia-math"
    package_name = "lucidia_math_pkg"

    packages_dir = root / "packages"
    if str(packages_dir) not in sys.path:
        sys.path.insert(0, str(packages_dir))

    if package_name not in sys.modules:
        pkg_init = pkg_dir / "__init__.py"
        pkg_spec = importlib.util.spec_from_file_location(
            package_name,
            pkg_init,
            submodule_search_locations=[str(pkg_dir)],
        )
        if pkg_spec is None or pkg_spec.loader is None:
            raise RuntimeError("unable to load lucidia-math package")
        package = importlib.util.module_from_spec(pkg_spec)
        sys.modules[package_name] = package
        pkg_spec.loader.exec_module(package)

    module_path = pkg_dir / "ui.py"
    spec = importlib.util.spec_from_file_location(f"{package_name}.ui", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load lucidia-math.ui module")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module.create_app


@pytest.fixture(scope="module")
def client():
    create_app = _load_create_app()
    app = create_app()
    with app.test_client() as client:
        yield client


def test_am2_simulation_units(client):
    resp = client.get("/api/ambr/sim/am2?bits=4&temperature=290")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["units"]["t"] == "s"
    assert data["thermo"]["delta_e_min"] >= 0
    assert len(data["t"]) == len(data["amp"]) >= 2


def test_am2_plot_svg(client):
    resp = client.get("/api/ambr/plot/am2.svg")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert resp.mimetype.startswith("image/svg+xml")
    assert "<svg" in body and "</svg>" in body


def test_transport_mass_conservation(client):
    x = np.linspace(-1.0, 1.0, 32)
    payload = {
        "x": x.tolist(),
        "A": np.exp(-x**2).tolist(),
        "rho": (1.0 - 0.1 * x**2).tolist(),
        "dt": 1e-3,
        "steps": 40,
        "bits": 6,
        "temperature": 310,
    }
    resp = client.post("/api/ambr/sim/transport", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    rel_error = data["invariants"]["mass_conservation"]["relative_error"]
    assert rel_error <= data["invariants"]["mass_conservation"]["tolerance"]
    assert data["thermo"]["delta_e_min"] >= 0


def test_transport_field_pgm(client):
    payload = {"values": [[0, 1, 2], [2, 1, 0]], "maxval": 8}
    resp = client.post("/api/ambr/field/a.pgm", json=payload)
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert body.startswith("P2\n")
    assert resp.mimetype.startswith("image/x-portable-graymap")


def test_energy_endpoint_allows_get(client):
    resp = client.get("/api/ambr/energy?bits=10&temperature=295&limit=1e-19")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "delta_e" in data and data["delta_e"] <= data["limit"] + 1e-12


def test_mandelbrot_text_response(client):
    resp = client.get("/api/math/fractals/mandelbrot.pgm?width=32&height=32&iter=32")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert body.startswith("P2\n")


def test_wave_svg_response(client):
    resp = client.get("/api/math/waves/sine.svg?samples=64&freq=0.5")
    assert resp.status_code == 200
    body = resp.get_data(as_text=True)
    assert "<svg" in body


def test_primes_payload(client):
    resp = client.get("/api/math/primes.json?limit=100")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["primes"][-1] <= data["limit"]


def test_truth_table_rows(client):
    payload = {"expression": "a and (b or not c)", "variables": ["a", "b", "c"]}
    resp = client.post("/api/math/logic/truth-table", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data["rows"]) == 8
    sample_row = data["rows"][0]
    assert "result" in sample_row
