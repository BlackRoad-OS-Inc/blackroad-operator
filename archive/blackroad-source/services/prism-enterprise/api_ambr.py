"""FastAPI application exposing math and Amundson–BlackRoad endpoints."""

from __future__ import annotations

import json
import math
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from pydantic import BaseModel, ConfigDict, Field
from prometheus_client import Counter, Gauge, CONTENT_TYPE_LATEST, generate_latest

ROOT_DIR = Path(__file__).resolve().parents[2]
PACKAGES_DIR = ROOT_DIR / "packages"
if str(PACKAGES_DIR) not in sys.path:
    sys.path.insert(0, str(PACKAGES_DIR))

from amundson_blackroad.autonomy import conserved_mass, simulate_transport  # noqa: E402
from amundson_blackroad.resolution import AmbrContext, resolve_coherence_inputs  # noqa: E402
from amundson_blackroad.spiral import simulate_am2  # noqa: E402
from amundson_blackroad.thermo import energy_increment, landauer_min, spiral_entropy  # noqa: E402

from lucidia_math_lab.amundson_equations import phase_derivative  # noqa: E402

from . import fractals, logic, primes, proofs, waves  # noqa: E402
from .storage import (  # noqa: E402
    ArtifactRecord,
    format_units,
    get_output_root,
    log_run,
    record_artifact,
    relative_to_output,
)

AMBR_RUNS = Counter("ambr_runs_total", "Number of successful AMBR simulations", ["kind"])
AMBR_ERRORS = Counter("ambr_errors_total", "Number of failed AMBR simulations", ["kind"])
LAND_VIOLATIONS = Counter("landauer_violations_total", "Runs violating Landauer bound")
ARTIFACT_BYTES = Counter(
    "artifact_bytes_total", "Bytes written for generated artifacts", ["domain"]
)
AMBR_LAST_MASS_ERROR = Gauge("ambr_last_mass_error", "Most recent mass conservation error")
AMBR_LAST_ENERGY = Gauge("ambr_last_energy_dE", "Most recent energy increment value")

SERVER_CONTEXT = AmbrContext()
STRICT_PHASE_FIELDS = (
    "omega_0",
    "lambda_",
    "eta",
    "phi_x",
    "phi_y",
    "r_x",
    "r_y",
    "k_b_t",
)


class MandelbrotQuery(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    width: int = Field(512, gt=16, le=4096)
    height: int = Field(512, gt=16, le=4096)
    iter: int = Field(256, alias="iter", gt=1, le=5000)
    xmin: float = Field(-2.0)
    xmax: float = Field(1.0)
    ymin: float = Field(-1.5)
    ymax: float = Field(1.5)
    cmap: str = Field("viridis")
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class PrimeQuery(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    limit: int = Field(1000, gt=10, le=200000)
    plot: bool = Field(True)
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class TruthTableRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    vars: List[str] = Field(..., alias="vars", min_length=1, max_length=8)
    expression: Optional[str] = Field(None, max_length=200)
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class ProofRequest(BaseModel):
    statement: str = Field(..., min_length=1, max_length=500)
    assumption: str = Field(..., min_length=1, max_length=500)
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class SineQuery(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    freq: float = Field(..., alias="freq", gt=0)
    phase: float = Field(0.0)
    samples: int = Field(512, gt=8, le=8192)
    sample_rate: float = Field(1024.0, gt=0)
    amplitude: float = Field(1.0, gt=0)
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class Am2Query(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    T: float = Field(10.0, gt=0)
    dt: float = Field(1e-3, gt=0)
    a0: float = Field(0.1)
    theta0: float = Field(0.0)
    gamma: float = Field(0.3)
    kappa: float = Field(0.7)
    eta: float = Field(0.5)
    omega0: float = Field(1.0)
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class TransportRequest(BaseModel):
    x: List[float]
    A: List[float]
    rho: List[float]
    dt: float = Field(1e-3, gt=0)
    steps: int = Field(100, gt=0, le=10000)
    mu: float = Field(1.0)
    chi: float = Field(0.0)
    Uc: Optional[List[float]] = None
    bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)

    def to_arrays(self) -> Dict[str, np.ndarray]:
        x = np.asarray(self.x, dtype=float)
        A = np.asarray(self.A, dtype=float)
        rho = np.asarray(self.rho, dtype=float)
        if x.shape != A.shape or x.shape != rho.shape:
            raise ValueError("x, A, and rho must have identical shapes")
        if self.Uc is not None:
            Uc = np.asarray(self.Uc, dtype=float)
            if Uc.shape != x.shape:
                raise ValueError("Uc must match x shape")
        else:
            Uc = None
        return {"x": x, "A": A, "rho": rho, "Uc": Uc}


class EnergyRequest(BaseModel):
    T: float = Field(..., gt=0)
    a: float = Field(...)
    theta: float = Field(...)
    da: float = Field(...)
    dtheta: float = Field(...)
    Omega: float = Field(...)
    n_bits: Optional[float] = Field(None, ge=0)
    temperature: Optional[float] = Field(None, gt=0)


class PhaseDerivativeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    omega_0: Optional[float] = Field(None, alias="omega_0")
    lambda_: Optional[float] = Field(None, alias="lambda")
    eta: Optional[float] = Field(None, alias="eta")
    phi_x: Optional[float] = Field(None, alias="phi_x")
    phi_y: Optional[float] = Field(None, alias="phi_y")
    r_x: Optional[float] = Field(None, alias="r_x")
    r_y: Optional[float] = Field(None, alias="r_y")
    k_b_t: Optional[float] = Field(None, alias="k_b_t")
    temperature_K: Optional[float] = Field(None, alias="temperature_K")
    auto_resolve: bool = Field(True, alias="auto_resolve")


def _error(
    status_code: int, code: str, hint: str, *, fields: Optional[List[str]] = None
) -> None:
    detail: Dict[str, Any] = {"error_code": code, "hint": hint}
    if fields:
        detail["fields"] = fields
    raise HTTPException(status_code=status_code, detail=detail)


def _record_run(
    domain: str,
    *,
    params: Dict[str, Any],
    invariants: Dict[str, Any],
    artifact_path: Optional[Path] = None,
    bits: Optional[float] = None,
    temperature: Optional[float] = None,
    energy: Optional[float] = None,
) -> Dict[str, Any]:
    artifact_record: Optional[ArtifactRecord] = None
    if artifact_path is not None:
        artifact_record = record_artifact(domain, artifact_path)
        ARTIFACT_BYTES.labels(domain=domain).inc(artifact_record.bytes)
    extras: Dict[str, Any] = {}
    if bits is not None and temperature is not None:
        delta_e = landauer_min(bits, temperature)
        extras["landauer"] = {
            "bits": bits,
            "temperature": temperature,
            "delta_e_min": delta_e,
            "energy": energy,
            "pass": None if energy is None else bool(energy >= delta_e),
        }
        if energy is not None and energy < delta_e:
            LAND_VIOLATIONS.inc()
    run_path = log_run(domain, params=params, invariants=invariants, artifact=artifact_record, extras=extras)
    return {
        "artifact": artifact_record.to_response() if artifact_record else None,
        "run_record": str(relative_to_output(run_path)),
        "landauer": extras.get("landauer"),
    }


def _ledger_payload(
    domain: str,
    provenance: Dict[str, Any],
    *,
    artifact: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    timestamp = datetime.now(timezone.utc).isoformat()
    content_hash = artifact["sha512"] if artifact else uuid.uuid4().hex
    payload = {
        "id": str(uuid.uuid4()),
        "timestamp_utc": timestamp,
        "domain": domain,
        "entity": "BlackRoad",
        "agent": "Cadillac",
        "action_type": "SYSTEM_EVENT",
        "payload_ref": str(provenance["run_record"]),
        "content_hash": f"sha512:{content_hash}",
        "prev_hash": os.getenv("LEDGER_PREV_HASH", ""),
        "signatures": [],
    }
    return payload


def _maybe_emit_ledger(domain: str, provenance: Dict[str, Any]) -> None:
    if os.getenv("LEDGER_ENABLED", "false").lower() != "true":
        return
    endpoint = os.getenv("LEDGER_ENDPOINT")
    if not endpoint:
        return
    try:
        import urllib.request

        payload = _ledger_payload(domain, provenance, artifact=provenance.get("artifact"))
        data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(endpoint, data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(request, timeout=5)
    except Exception:
        # Ledger errors are non-fatal for the service.
        pass


app = FastAPI(title="Lucidia Infinity Math API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

math_router = APIRouter(prefix="/api/math", tags=["math"])
ambr_router = APIRouter(prefix="/api/ambr", tags=["ambr"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    detail = {"error_code": "validation_error", "hint": exc.errors()}
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=detail)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict):
        payload = detail
    else:
        payload = {"error_code": "http_error", "hint": detail}
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/ready")
async def ready() -> Dict[str, str]:
    return {"status": "ready"}


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    data = generate_latest()
    return PlainTextResponse(data.decode("utf-8"), media_type=CONTENT_TYPE_LATEST)


@math_router.get("/fractals/mandelbrot")
async def mandelbrot(query: MandelbrotQuery = Depends()) -> Dict[str, Any]:
    try:
        result = fractals.render_mandelbrot(
            width=query.width,
            height=query.height,
            max_iter=query.iter,
            xmin=query.xmin,
            xmax=query.xmax,
            ymin=query.ymin,
            ymax=query.ymax,
            cmap=query.cmap,
        )
    except ValueError as exc:
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    provenance = _record_run(
        "fractals",
        params=result.params,
        invariants=result.invariants,
        artifact_path=result.image_path,
        bits=query.bits,
        temperature=query.temperature,
    )
    _maybe_emit_ledger("fractals", provenance)
    response = {
        "artifact": provenance["artifact"],
        "params": result.params,
        "invariants": result.invariants,
        "grid_shape": result.grid_shape,
        "units": format_units(
            [
                ("width", "px"),
                ("height", "px"),
                ("escape_radius", "1"),
                ("bounded_fraction", "1"),
            ]
        ),
        "run_record": provenance["run_record"],
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@math_router.get("/primes")
async def primes_endpoint(query: PrimeQuery = Depends()) -> Dict[str, Any]:
    try:
        result = primes.generate_primes(query.limit, with_plot=query.plot)
    except ValueError as exc:
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    plot_path = result.plot_path if result.plot_path else None
    provenance = _record_run(
        "primes",
        params={"limit": result.limit, "plot": query.plot},
        invariants=result.invariants,
        artifact_path=plot_path,
        bits=query.bits,
        temperature=query.temperature,
    )
    _maybe_emit_ledger("primes", provenance)
    response = {
        "primes": result.primes,
        "count": len(result.primes),
        "invariants": result.invariants,
        "units": format_units([("count", "1"), ("density", "1"), ("nth_prime", "1")]),
        "run_record": provenance["run_record"],
    }
    if provenance["artifact"]:
        response["plot"] = provenance["artifact"]
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@math_router.post("/logic/truth-table")
async def truth_table_endpoint(body: TruthTableRequest) -> Dict[str, Any]:
    try:
        table = logic.generate_truth_table(body.vars, expression=body.expression)
        path = logic.persist_truth_table(table)
    except ValueError as exc:
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    provenance = _record_run(
        "logic",
        params={"vars": body.vars, "expression": body.expression},
        invariants={"row_count": len(table.rows)},
        artifact_path=path,
        bits=body.bits,
        temperature=body.temperature,
    )
    _maybe_emit_ledger("logic", provenance)
    response = {
        "table": table.to_serialisable(),
        "artifact": provenance["artifact"],
        "run_record": provenance["run_record"],
        "units": format_units([("row_count", "1")]),
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@math_router.post("/proofs/contradiction")
async def proofs_endpoint(body: ProofRequest) -> Dict[str, Any]:
    try:
        path = proofs.record_contradiction(body.statement, body.assumption)
    except ValueError as exc:
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    invariants = {"contradiction": True}
    provenance = _record_run(
        "proofs",
        params={"statement": body.statement, "assumption": body.assumption},
        invariants=invariants,
        artifact_path=path,
        bits=body.bits,
        temperature=body.temperature,
    )
    _maybe_emit_ledger("proofs", provenance)
    response = {
        "artifact": provenance["artifact"],
        "result": invariants,
        "run_record": provenance["run_record"],
        "units": format_units([("contradiction", "1")]),
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@math_router.get("/waves/sine")
async def sine_endpoint(query: SineQuery = Depends()) -> Dict[str, Any]:
    try:
        sine = waves.generate_sine_wave(
            frequency=query.freq,
            phase=query.phase,
            samples=query.samples,
            sample_rate=query.sample_rate,
            amplitude=query.amplitude,
        )
    except ValueError as exc:
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    invariants = sine.invariants
    provenance = _record_run(
        "waves",
        params={
            "frequency": query.freq,
            "phase": query.phase,
            "samples": query.samples,
            "sample_rate": query.sample_rate,
            "amplitude": query.amplitude,
        },
        invariants=invariants,
        artifact_path=sine.plot_path,
        bits=query.bits,
        temperature=query.temperature,
    )
    _maybe_emit_ledger("waves", provenance)
    sample_record = record_artifact("waves", sine.samples_path)
    ARTIFACT_BYTES.labels(domain="waves").inc(sample_record.bytes)
    response = {
        "samples": {
            "path": str(sample_record.path),
            "relative_path": str(relative_to_output(sample_record.path)),
            "sha512": sample_record.sha512,
            "bytes": sample_record.bytes,
        },
        "plot": provenance["artifact"],
        "invariants": invariants,
        "units": format_units(
            [
                ("time", "s"),
                ("mean", "1"),
                ("rms", "1"),
                ("max", "1"),
                ("min", "1"),
            ]
        ),
        "run_record": provenance["run_record"],
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@math_router.get("/{subpath:path}")
async def serve_artifact(subpath: str) -> FileResponse:
    root = get_output_root()
    target = (root / subpath).resolve()
    if not str(target).startswith(str(root.resolve())):
        _error(status.HTTP_404_NOT_FOUND, "not_found", "Artifact outside output root")
    if not target.exists():
        _error(status.HTTP_404_NOT_FOUND, "not_found", "Artifact not found")
    return FileResponse(target, headers={"Cache-Control": "public, max-age=3600"})


@ambr_router.get("/sim/am2")
async def am2_endpoint(query: Am2Query = Depends()) -> Dict[str, Any]:
    try:
        t, a, theta, amp = simulate_am2(
            query.T,
            query.dt,
            query.a0,
            query.theta0,
            query.gamma,
            query.kappa,
            query.eta,
            query.omega0,
        )
    except ValueError as exc:
        AMBR_ERRORS.labels(kind="am2").inc()
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    entropy = spiral_entropy(a, theta)
    dE = energy_increment(a, theta, query.dt, gamma=query.gamma, eta=query.eta)
    AMBR_RUNS.labels(kind="am2").inc()
    AMBR_LAST_ENERGY.set(dE)
    provenance = _record_run(
        "ambr",
        params=query.model_dump(),
        invariants={"entropy": entropy, "energy_increment": dE},
        bits=query.bits,
        temperature=query.temperature,
        energy=dE,
    )
    _maybe_emit_ledger("ambr", provenance)
    response = {
        "t": t.tolist(),
        "a": a.tolist(),
        "theta": theta.tolist(),
        "amp": amp.tolist(),
        "units": format_units([("t", "s"), ("a", "1"), ("theta", "rad")]),
        "invariants": {"entropy": entropy, "energy_increment": dE},
        "run_record": provenance["run_record"],
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    return response


@ambr_router.post("/sim/transport")
async def transport_endpoint(body: TransportRequest) -> Dict[str, Any]:
    try:
        arrays = body.to_arrays()
        result = simulate_transport(
            arrays["x"],
            arrays["A"],
            arrays["rho"],
            body.steps,
            body.dt,
            mu_A=body.mu,
            chi_A=body.chi,
            Uc=arrays["Uc"],
        )
    except ValueError as exc:
        AMBR_ERRORS.labels(kind="transport").inc()
        _error(status.HTTP_400_BAD_REQUEST, "invalid_parameters", str(exc))
    m0 = conserved_mass(arrays["x"], arrays["A"])
    mass_error = float(result["mass"] - m0)
    AMBR_RUNS.labels(kind="transport").inc()
    AMBR_LAST_MASS_ERROR.set(mass_error)
    invariants = {
        "mass_initial": m0,
        "mass_final": float(result["mass"]),
        "mass_error": mass_error,
    }
    provenance = _record_run(
        "ambr",
        params={
            "dt": body.dt,
            "steps": body.steps,
            "mu": body.mu,
            "chi": body.chi,
        },
        invariants=invariants,
        bits=body.bits,
        temperature=body.temperature,
    )
    _maybe_emit_ledger("ambr", provenance)
    response = {
        "x": result["x"].tolist(),
        "A": result["A"].tolist(),
        "flux": result["flux"].tolist(),
        "mass": float(result["mass"]),
        "mass_error": mass_error,
        "units": format_units(
            [
                ("mass", "1"),
                ("mass_error", "1"),
                ("flux", "1 / s"),
            ]
        ),
        "run_record": provenance["run_record"],
    }
    if provenance.get("landauer"):
        response["landauer"] = provenance["landauer"]
    if abs(mass_error) > 1e-3:
        response["warning"] = "Mass conservation threshold exceeded"
    return response


@ambr_router.post("/coherence/dphi")
async def phase_derivative_endpoint(body: PhaseDerivativeRequest) -> Dict[str, Any]:
    payload = body.model_dump(by_alias=False, exclude_none=True)
    auto = bool(payload.pop("auto_resolve", True))
    provided_fields = set(payload)
    context = SERVER_CONTEXT
    if auto:
        resolved, missing, why = resolve_coherence_inputs(ctx=context, **payload)
        invalid = sorted(name for name in missing if name in provided_fields)
        if invalid:
            AMBR_ERRORS.labels(kind="dphi").inc()
            _error(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "invalid_parameters",
                f"Non-finite values for: {', '.join(invalid)}",
                fields=[{"field": name, "reason": why.get(name, "non_finite")} for name in invalid],
            )
        derivative_inputs = {name: resolved[name] for name in STRICT_PHASE_FIELDS}
        auto_non_finite = [key for key, value in derivative_inputs.items() if not math.isfinite(value)]
        if auto_non_finite:
            AMBR_ERRORS.labels(kind="dphi").inc()
            sorted_non_finite = sorted(auto_non_finite)
            _error(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "invalid_parameters",
                f"Non-finite values for: {', '.join(sorted_non_finite)}",
                fields=[{"field": name, "reason": "non_finite"} for name in sorted_non_finite],
            )
        derivative = float(phase_derivative(**derivative_inputs))
        context.last_phi_x = derivative_inputs["phi_x"]
        context.last_phi_y = derivative_inputs["phi_y"]
        AMBR_RUNS.labels(kind="dphi").inc()
        filtered_why = {key: value for key, value in why.items() if key not in provided_fields}
        return {
            "dphi_dt": derivative,
            "resolved": derivative_inputs,
            "why": filtered_why,
            "mode": "auto",
            "inferred": sorted(missing),
        }
    missing = [field for field in STRICT_PHASE_FIELDS if field not in payload]
    if missing:
        AMBR_ERRORS.labels(kind="dphi").inc()
        sorted_missing = sorted(missing)
        _error(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "missing_parameters",
            f"Missing fields: {', '.join(sorted_missing)}",
            fields=[{"field": name, "reason": "missing"} for name in sorted_missing],
        )
    resolved = {name: float(payload[name]) for name in STRICT_PHASE_FIELDS}
    non_finite = [key for key, value in resolved.items() if not math.isfinite(value)]
    if non_finite:
        AMBR_ERRORS.labels(kind="dphi").inc()
        sorted_invalid = sorted(non_finite)
        _error(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "invalid_parameters",
            f"Non-finite values for: {', '.join(sorted_invalid)}",
            fields=[{"field": name, "reason": "non_finite"} for name in sorted_invalid],
        )
    derivative = float(phase_derivative(**resolved))
    context.last_phi_x = resolved["phi_x"]
    context.last_phi_y = resolved["phi_y"]
    AMBR_RUNS.labels(kind="dphi").inc()
    return {
        "dphi_dt": derivative,
        "resolved": resolved,
        "why": {},
        "mode": "strict",
    }


@ambr_router.post("/energy")
async def energy_endpoint(body: EnergyRequest) -> Dict[str, Any]:
    n_bits = body.n_bits
    temperature = body.temperature
    entropy = abs(body.a * body.theta)
    dE = float(body.Omega * (body.da + body.dtheta))
    AMBR_RUNS.labels(kind="energy").inc()
    AMBR_LAST_ENERGY.set(dE)
    provenance = _record_run(
        "ambr",
        params=body.model_dump(),
        invariants={"entropy_estimate": entropy, "energy_increment": dE},
        bits=n_bits,
        temperature=temperature,
        energy=dE,
    )
    _maybe_emit_ledger("ambr", provenance)
    landauer_entry = provenance.get("landauer")
    response = {
        "dE": dE,
        "entropy_estimate": entropy,
        "units": format_units([("dE", "J"), ("entropy_estimate", "1")]),
        "run_record": provenance["run_record"],
    }
    if landauer_entry:
        response["E_min"] = landauer_entry["delta_e_min"]
        response["pass"] = landauer_entry["pass"]
    return response


app.include_router(math_router)
app.include_router(ambr_router)
