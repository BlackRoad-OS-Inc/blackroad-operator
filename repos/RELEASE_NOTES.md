# v1.0-rc Release Candidate

## Highlights
- **QLM Lab 0.1.3** ships with reproducible demos (Bell, tool-caller, toolformer, RAG) and emits gate payloads for the production Rego checks.
- **Quality gates & CI** run lint, tests, demos, SBOM generation, provenance attestations, and secret hygiene enforcement before deployment promotion.
- **Environment manifest** now tracks preview, staging, and production surfaces for RoadView search, BackRoad, Lucidia, RoadWork, RoadGlitch, and the RoadCoin simulation.
- **Supply chain artifacts** include CycloneDX SBOMs for Python/Node packages and a Sigstore provenance bundle checked into `artifacts/`.
- **Security posture** improved with mandatory SOPS usage guidance and an automated plaintext `.env` detector in CI.

## Deployment Notes
- Staging deployments automatically run health checks for `staging.console.blackroad.io` and `roadview.staging.blackroad.io`.
- Production releases trigger ECS rollouts for the console web tier, worker tier, and RoadView search service, followed by live `/healthz` checks.
- RoadCoin remains simulation-only; enable it explicitly via the `ROADCOIN_SIMULATION` environment flag when testing wallets.

## Verification Checklist
- `make -C modules/qlm_lab demo` produces Bell histograms, lineage, and RAG outputs in `modules/qlm_lab/artifacts/`.
- `pytest modules/qlm_lab/tests --cov=qlm_lab` maintains ≥90% line coverage on `qlm_lab/tools/quantum_np.py`.
- `ops/gates/check_qlm_lab.sh` evaluates both coverage and RAG Rego policies to `allow=true`.
