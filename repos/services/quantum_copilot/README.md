# Quantum-Secure Compliance Copilot

This FastAPI micro-service powers the one-day vertical slice outlined in the sprint brief. It exposes:

- **Landing experience** (`/`): public marketing page with metrics and lead capture.
- **Advisor sandbox** (`/sandbox`): form-driven suitability/marketing submission that calls policy checks and emits audit bundles.
- **Evidence console** (`/console`): internal view listing case outcomes, rule failures, and download links for generated artifacts.
- **API endpoints** (`/api/reviews`, `/api/metrics`, `/api/demo-cases`): programmatic hooks for automated testing and dashboards.

Policy-as-code enforcement is modelled with 12 Rego rules split across FINRA 2210, SEC 204-2, and language safety packages. The Python `PolicyEngine` mirrors those rules for deterministic execution during the demo.

Evidence bundles contain a JSON artifact, PDF summary, and manifest signed with a SHAKE-256-based quantum-secure toggle. Artifacts are stored under `data/quantum_copilot/bundles/<case-id>/`.

## Running locally

```bash
uvicorn services.quantum_copilot.app:app --reload
```

Visit `http://127.0.0.1:8000/` to access the landing page and sandbox.
