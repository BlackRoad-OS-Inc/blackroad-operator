"""FastAPI application wiring the Quantum-Secure Compliance Copilot."""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from . import config
from .attest.attest import create_manifest, emit_bundle, load_signer
from .demo import load_demo_cases
from .models import BundleResult, ClientProfile, LeadRequest, ReviewRequest
from .policy_engine import PolicyEngine
from .rationale import draft_rationale
from .storage import ComplianceRepository

app = FastAPI(
    title="Quantum-Secure Compliance Copilot",
    version=config.SERVICE_VERSION,
    description="Vertical slice demo performing policy-as-code checks and audit bundle generation.",
)

templates = Jinja2Templates(directory=str(config.TEMPLATES_DIR))
app.mount("/static", StaticFiles(directory=str(config.STATIC_DIR)), name="static")

repository = ComplianceRepository()
policy_engine = PolicyEngine()
signer = load_signer()


@app.on_event("startup")
def _ensure_dirs() -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    config.BUNDLE_DIR.mkdir(parents=True, exist_ok=True)


def _run_review(request: ReviewRequest) -> BundleResult:
    start_time = time.perf_counter()

    rationale = draft_rationale(request.profile)
    findings = policy_engine.evaluate(request, rationale_text=rationale.rationale_text)
    status = "approved" if all(finding.passed for finding in findings) else "needs-remediation"

    latency_ms = int((time.perf_counter() - start_time) * 1000)
    case_id = f"QC-{datetime.utcnow():%Y%m%d-%H%M%S}-{uuid.uuid4().hex[:6]}"
    rationale_hash = uuid.uuid5(uuid.NAMESPACE_URL, rationale.rationale_text).hex
    manifest = create_manifest(
        case_id=case_id,
        request=request,
        findings=findings,
        rationale_hash=rationale_hash,
    )
    bundle_dir = config.BUNDLE_DIR / case_id
    artifact_path = bundle_dir / "artifact.json"
    pdf_path = bundle_dir / "report.pdf"

    bundle = BundleResult(
        case_id=case_id,
        status=status,
        findings=list(findings),
        rationale=rationale,
        manifest=manifest,
        artifact_path=artifact_path,
        pdf_path=pdf_path,
        signature=None,
        pqc_enabled=request.pqc_enabled,
        latency_ms=latency_ms,
    )

    bundle_outputs = emit_bundle(case_id, request, bundle, signer)
    bundle.signature = bundle_outputs["signature"]  # type: ignore[assignment]

    repository.record_review(
        request,
        bundle,
        artifact_hash=bundle_outputs["artifact_hash"],
        signature=bundle.signature,
    )
    repository.update_funnel(bundle=True)

    return bundle


@app.get("/", response_class=HTMLResponse)
async def landing(request: Request) -> HTMLResponse:
    repository.update_funnel(visit=True)
    demo_cases = load_demo_cases()
    metrics = repository.load_console_dataset().metrics
    return templates.TemplateResponse(
        "landing.html",
        {
            "request": request,
            "demo_cases": demo_cases,
            "metrics": metrics,
        },
    )


@app.post("/leads")
async def submit_lead(
    email: str = Form(...),
    role: str = Form(...),
    organization: str = Form(...),
    team_size: str = Form(...),
    timeline: str = Form(...),
) -> RedirectResponse:
    lead = LeadRequest(
        email=email,
        role=role,
        organization=organization,
        team_size=team_size,  # type: ignore[arg-type]
        timeline=timeline,  # type: ignore[arg-type]
    )
    repository.record_lead(lead)
    repository.update_funnel(signup=True)
    return RedirectResponse(url="/sandbox?lead=success", status_code=303)


@app.get("/sandbox", response_class=HTMLResponse)
async def sandbox(request: Request, lead: str | None = None) -> HTMLResponse:
    repository.update_funnel(sandbox=True)
    demo_cases = load_demo_cases()
    return templates.TemplateResponse(
        "sandbox.html",
        {"request": request, "lead": lead, "demo_cases": demo_cases},
    )


@app.post("/sandbox/review")
async def sandbox_review(
    request: Request,
    advisor_email: str = Form(...),
    representative_id: str = Form(...),
    client_name: str = Form(...),
    client_age: int = Form(...),
    net_worth_band: str = Form(...),
    investment_objective: str = Form(...),
    risk_tolerance: str = Form(...),
    marketing_material: str = Form(...),
    data_sources: str = Form(""),
    advisor_notes: str = Form(""),
    pqc_enabled: bool = Form(False),
    mode: str = Form("suitability"),
) -> HTMLResponse:
    profile = ClientProfile(
        client_name=client_name,
        client_age=client_age,
        net_worth_band=net_worth_band,  # type: ignore[arg-type]
        investment_objective=investment_objective,  # type: ignore[arg-type]
        risk_tolerance=risk_tolerance,  # type: ignore[arg-type]
        marketing_material=marketing_material,
        data_sources=[item.strip() for item in data_sources.split("\n") if item.strip()],
        advisor_notes=advisor_notes or None,
    )
    review_request = ReviewRequest(
        profile=profile,
        advisor_email=advisor_email,
        representative_id=representative_id,
        pqc_enabled=bool(pqc_enabled),
        mode=mode,  # type: ignore[arg-type]
    )

    bundle = _run_review(review_request)

    console_dataset = repository.load_console_dataset()
    return templates.TemplateResponse(
        "console.html",
        {
            "request": request,
            "bundle": bundle,
            "console": console_dataset,
        },
    )


@app.get("/console", response_class=HTMLResponse)
async def console(request: Request) -> HTMLResponse:
    console_dataset = repository.load_console_dataset()
    return templates.TemplateResponse(
        "console.html",
        {"request": request, "bundle": None, "console": console_dataset},
    )


@app.get("/api/demo-cases")
async def api_demo_cases() -> JSONResponse:
    cases = load_demo_cases()
    return JSONResponse([case.model_dump() for case in cases])


@app.post("/api/reviews")
async def api_review(payload: ReviewRequest) -> JSONResponse:
    bundle = _run_review(payload)
    response = bundle.model_dump()
    response["findings"] = [finding.model_dump() for finding in bundle.findings]
    response["manifest"] = bundle.manifest.model_dump()
    return JSONResponse(response)


@app.get("/api/metrics")
async def api_metrics() -> JSONResponse:
    dataset = repository.load_console_dataset()
    return JSONResponse(dataset.metrics.model_dump())


@app.get("/bundles/{case_id}/{artifact}")
async def download_bundle_artifact(case_id: str, artifact: str) -> FileResponse:
    safe_name = Path(artifact).name
    target = config.BUNDLE_DIR / case_id / safe_name
    if not target.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")
    return FileResponse(target)


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)
