# Offline Policy Service

A lightweight policy evaluation surface for offline demos and QA. It exposes a minimal REST API for evaluating policies, verifying signed bundles, and remediating risky marketing copy.

## Endpoints

* `GET /health` — readiness probe.
* `GET /api/policy/metrics` — snapshot of evaluation, attestation, and remediation counters.
* `POST /api/policy/evaluate` — accepts `{ caseId, pqc, rules }` and returns the aggregate result.
* `POST /api/policy/bundle` — verifies a bundle hash against an RSA signature and records the policy version.
* `POST /api/policy/remediate` — rewrites banned marketing phrases and appends risk disclosures when needed.
* `POST /api/attest/bundle` — records external attestation outcomes.

The service writes a hash-chained ledger to `audit.ndjson` capturing each evaluation, remediation, and bundle verification.

## Tooling

* `ops.html` — lightweight dashboard that polls metrics every 10 seconds.
* `demo.sh` — runs sample requests using the payloads under `demo/`.
* `check.sh` — CI smoke test that starts the server, exercises the API, validates the audit ledger, and exits with `SMOKE OK` when successful.
* `make_release.sh` — builds a signed tarball containing runtime artifacts under `release/`.
* `audit_ledger.py` — verifies the integrity of the hash chain stored in `audit.ndjson`.

To create a release bundle you must supply an RSA private key via the `SIGNING_KEY` environment variable or place it at `release/signing_key.pem`.
