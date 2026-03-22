# Ops quickstart
Bridge runs on :4000; nginx routes /api and /ws

## Hybrid Deploy

Static site is served via GitHub Pages at https://blackroad.io.
API and NGINX configs deploy over SSH with `.github/workflows/prism-ssh-deploy.yml`.
Actions require secrets `DEPLOY_HOST`, `DEPLOY_USER`, and `DEPLOY_KEY`.

API health check: http://127.0.0.1:4000/api/health

On the server you can run:

```sh
scripts/nginx-ensure-and-health.sh
scripts/nginx-enable-tls.sh   # optional TLS helper
```

## Release verification & rollback

- Run `runbooks/examples/release_rollback_forward.yaml` when a deployment needs
  validation or recovery. It documents the health checks, rollback commands, and
  roll-forward steps. The artifacts land under
  `artifacts/runbooks/releases/<environment>/` (e.g.,
  `artifacts/runbooks/releases/prod/`).
- Quick health probes:

  ```sh
  curl -fsSL https://blackroad.io/health
  curl -fsSL https://blackroad.io/api/health
  ```
- Roll back with the previous tarball if needed:

  ```sh
  scripts/deploy.sh release-<prior>.tar.gz
  ```
- After stabilizing, re-run `.github/workflows/blackroad-deploy.yml` from the
  desired SHA to roll forward.

## Cleanup broom

`usr/local/sbin/br-cleanup.sh` audits the API, Yjs, bridges, nginx, IPFS, and more. It defaults to a read-only `audit` mode and can also `fix` or `prune`.

```sh
sudo br-cleanup.sh audit | tee /srv/ops/cleanup-audit.txt
sudo br-cleanup.sh fix   | tee /srv/ops/cleanup-fix.txt
sudo br-cleanup.sh prune | tee /srv/ops/cleanup-prune.txt
```

To run nightly, install the service and timer from `etc/systemd/system/` and reload systemd:

```sh
sudo cp etc/systemd/system/br-cleanup-nightly.* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now br-cleanup-nightly.timer

API health check: http://127.0.0.1:4000/api/health

On the server you can run:

```sh
scripts/nginx-ensure-and-health.sh
scripts/nginx-enable-tls.sh   # optional TLS helper
```

An optional sudoers snippet is in `etc/sudoers.d/br-cleanup`.

BlackRoad relies on an automated preview → staging → production flow. This
quickstart highlights how to operate the system without stepping outside the
guardrails defined in `environments/*.yml` and `DEPLOYMENT.md`.

## Environment map
| Environment | Domains | Primary workflow | Notes |
| --- | --- | --- | --- |
| Preview (`pr`) | `https://dev.blackroad.io`, `https://pr-<n>.dev.blackroad.io` | `.github/workflows/preview-env.yml` | Spins up ephemeral ECS services + ALB rules per pull request. Terraform config lives in `infra/preview-env/` and the manifest is documented in `environments/preview.yml`. |
| Staging (`stg`) | `https://stage.blackroad.io` | `.github/workflows/pages-stage.yml` | Builds and archives the static site proof artifact. API wiring is planned; see `environments/staging.yml` for current status. |
| Production (`prod`) | `https://blackroad.io`, `https://www.blackroad.io`, `https://api.blackroad.io` | `.github/workflows/blackroad-deploy.yml` | GitHub Pages publishes the marketing site; API gateway will promote via the same workflow once the ECS module is enabled. Full manifest: `environments/production.yml`. |
| Preview (`pr`) | `https://dev.blackroad.io`, `https://pr-<n>.dev.blackroad.io` | `.github/workflows/preview.yml` | Spins up ephemeral ECS services + ALB rules per pull request. Terraform config lives in `infra/preview-env/` and the manifest is documented in `environments/preview.yml`. |
| Staging (`stg`) | `https://stage.blackroad.io` | `.github/workflows/pages-stage.yml` | Builds and archives the static site proof artifact. API images promote through `.github/workflows/blackroad-api-ecs.yml`; see `environments/staging.yml` for secrets and current ECS status. |
| Production (`prod`) | `https://blackroad.io`, `https://www.blackroad.io`, `https://api.blackroad.io` | `.github/workflows/blackroad-deploy.yml` | GitHub Pages publishes the marketing site. The API gateway promotes via `.github/workflows/blackroad-api-ecs.yml` once the ECS module is enabled. Full manifest: `environments/production.yml`. |

| Environment | Branch | Domains | Required workflows | Notes |
| --- | --- | --- | --- | --- |
| Preview (`pr`) | PR heads | `https://dev.blackroad.io`, `https://pr-<n>.dev.blackroad.io` | `preview.yml`, `preview-containers.yml`, `preview-frontend-host.yml` | Spins up isolated ECS/Fargate stacks per pull request, publishes GHCR images with SBOM + Grype scans, and tears down automatically on close. |
| Staging (`stg`) | `staging` | `https://stage.blackroad.io` | `pages-stage.yml`, `stage-stress.yml` (opt-in) | Rebuilds the proof artifact on every staging push and daily cron; optional load test gated behind `STRESS=true`. Mirrors production infra in `br-infra-iac/envs/stg`. |
| Production (`prod`) | `main` | `https://blackroad.io`, `https://www.blackroad.io`, `https://api.blackroad.io` | `blackroad-deploy.yml`, `deploy-canary.yml`, `deploy-canary-ladder.yml`, `change-approve.yml` | Modern webhook deploy on push; progressive delivery and CAB approval guard the release. Legacy SSH path remains as a manual fallback. |

Refer to `environments/preview.yml`, `environments/staging.yml`, and
`environments/production.yml` for the authoritative source of domains, secrets,
Terraform backends, and change-management requirements.

## Release flow
### Preview (per PR)
- Triggered automatically on pull request open/update via `preview-env.yml`.
- Builds the image, applies Terraform (`infra/preview-env`), and comments with the preview URL.
- Closing the PR or re-running the `destroy` job removes ALB rules, target groups, ECS services, and Route53 aliases.
- Smoke test: `curl -sSfL https://pr-<n>.dev.blackroad.io/healthz/ui` (already executed in the workflow).

1. **Pull request** — Apply the `automerge` label so the queue serialises the
   change. Preview workflows must pass before merge.
2. **Staging branch** — Promotion to staging triggers `pages-stage.yml`, building
   the proof artifact. Run `stage-stress.yml` with `STRESS=true` when load
   validation is required.
3. **Production** — A green staging run plus CAB approval unlocks
   `blackroad-deploy.yml`. The workflow builds the SPA, calls the deploy webhook,
   verifies `/healthz` and `/api/version`, and posts Slack status updates.
4. **Progressive rollout (optional)** — Use `deploy-canary.yml` for single-step
   canaries or `deploy-canary-ladder.yml` for laddered rollouts prior to full
   traffic shifts.

## Branch hygiene

- Keep development trunk-based. Long-running branches should be rebased or
  closed once preview automation surfaces issues.
- `cleanup-dead-branches.sh` now supports non-interactive runs via
  `AUTO_APPROVE=true`. The weekly **Branch Hygiene** GitHub Action invokes it to
  delete merged branches automatically. Override the base with
  `BASE_BRANCH=origin/staging` when pruning staging-specific branches.

## Merge queue guardrails

- `docs/ops/merge-queue.md` explains how to apply branch protection with the CLI, enable the merge queue, and keep the `queue:ready` label in sync.
- `docs/ops/required-checks.md` lists the commit status contexts that must stay green before labeling a pull request as queue-ready.

## Health & verification

- Preview: `curl -fsS https://pr-<n>.dev.blackroad.io/healthz/ui` (already run in
  CI but handy for local smoke tests).
- Staging: `curl -fsS https://stage.blackroad.io/health.json` and
  `curl -fsS https://api.staging.blackroad.io/api/llm/health`.
- Production: `https://blackroad.io/healthz`, `https://blackroad.io/api/version`,
  and `https://api.blackroad.io/health` (automated in the deploy workflow).
- Grafana/Prometheus/Alertmanager definitions live under
  `deploy/k8s/monitoring.yaml`.

## Manual escape hatches

- **Legacy deploy** — Run `.github/workflows/blackroad-deploy.yml` with
  `target=legacy-ssh` and provide `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`, and
  optional `DEPLOY_PORT` when the webhook path is unavailable.
- **DigitalOcean droplet** — For temporary static hosting, follow the quickstart
  in `DEPLOYMENT.md` (Docker Compose build + Caddy/Nginx health endpoints).
- **Rollback** — Use `POST /api/rollback/:releaseId` with the internal token or
  re-run `blackroad-deploy.yml` against a known-good commit.

## Policy gates

- **SEC rule 204-2 (forecast guardrail)** — `policies/sec_rule_204_2.rego`
  enforces citations for revenue forecasts that exceed a 10% deviation. The
  orchestrator loads this via `SecRule2042Gate` and the `task:route` command
  will fail fast when the policy denies execution.
  - Add supporting links under `task.metadata["forecast"]["citations"]` (or
    attach baseline/projection values so the gate can compute the variance).
  - Policy coverage lives in `tests/policies/test_sec_rule_204_2.py`; run `pytest
    tests/policies` for a focused check.
- **Emergency override** — When compliance signs off, set the environment
  variable `PRISM_SEC_204_2_OVERRIDE=I_ACKNOWLEDGE_SEC_204_2_RISK` for the CLI or
  worker invocation performing the reroute. The orchestrator logs the override
  and skips the denial once. Clear the variable immediately after the run and
  document the exception in the change record.
### Staging
- Pushes to `main` touching `blackroad-stage/**` or manual dispatch run `pages-stage.yml`.
- Generates a daily proof + `health.json` for `stage.blackroad.io` and uploads the artifact (no automatic publish step yet).
- Use the artifact for QA sign-off or handoff to downstream deploy automation.

### API ECS (staging & production)
- Run `.github/workflows/blackroad-api-ecs.yml` to promote the API container image to ECS.
- The workflow selects `staging` or `production` secrets based on the dispatch input, waits for `aws ecs wait services-stable`, and exposes a `workflow_call` interface for composition inside CI pipelines.
- Required secrets are documented in `README-DEPLOY.md` and mirrored in `environments/*.yml` manifests.

### Production
- `blackroad-deploy.yml` runs on every `main` push and exposes a `workflow_dispatch` entry for manual redeploys.
- Builds the SPA, triggers the deploy webhook (`BR_DEPLOY_SECRET` / `BR_DEPLOY_URL`), then lets downstream infra promote the build.
- API and NGINX remain accessible over SSH while we finish migrating to ECS; scripts live under `scripts/` for TLS + health.

## Rollback and forward

| Scope | Rollback | Forward fix |
| --- | --- | --- |
| Preview env | Re-run the workflow with the prior commit (Actions → `preview-env` → `Run workflow` with old SHA) or close the PR to tear everything down. | Push a new commit or dispatch the workflow with the hotfix branch; Terraform will update in place. |
| Staging site | Download the previous `blackroad-stage` artifact from Actions and republish manually if needed. | Re-run `pages-stage.yml` after merging the fix or push a corrective commit to `blackroad-stage/**`. |
| Production site/API | Trigger `BlackRoad • Deploy` with `workflow_dispatch`, selecting the last known-good `main` commit. For API hosts still on SSH, run `.github/workflows/prism-ssh-deploy.yml` or `scripts/nginx-ensure-and-health.sh` from the bastion. | Merge the fix and re-run `BlackRoad • Deploy`; ECS workloads will follow once the production module is switched on. |

Document every rollback/forward action in the incident log and update the corresponding manifest to reflect configuration changes.

## Routine health & cleanup

- API health checks: `https://api.blackroad.io/health` (prod) and `http://127.0.0.1:4000/api/health` (bridge).
- Static site health endpoints: `https://blackroad.io/healthz`, `https://stage.blackroad.io/health.json`.
- Server helpers:
  ```sh
  scripts/nginx-ensure-and-health.sh
  scripts/nginx-enable-tls.sh   # optional TLS helper
  ```
- Cleanup broom: `usr/local/sbin/br-cleanup.sh` audits API, Yjs, bridges, nginx, IPFS, etc. Modes:
  ```sh
  sudo br-cleanup.sh audit | tee /srv/ops/cleanup-audit.txt
  sudo br-cleanup.sh fix   | tee /srv/ops/cleanup-fix.txt
  sudo br-cleanup.sh prune | tee /srv/ops/cleanup-prune.txt
  ```
  Install the systemd service + timer from `etc/systemd/system/` and enable `br-cleanup-nightly.timer` for scheduled runs. Optional sudoers entry: `etc/sudoers.d/br-cleanup`.

## References

- Deployment playbook: `DEPLOYMENT.md`
- Environment manifests: `environments/`
- Change management: `.github/workflows/change-approve.yml`,
  `runbooks/examples/infra_release_policy.yaml`
- Monitoring stack: `deploy/k8s/monitoring.yaml`
- Environment manifests: `environments/*.yml`
- Preview Terraform stack: `infra/preview-env/`
- Reusable module: `modules/preview-env/`
- Deployment workflows: `.github/workflows/preview-env.yml`, `pages-stage.yml`, `blackroad-deploy.yml`, `prism-ssh-deploy.yml`
- Branch guardrails: `docs/ops/merge-queue.md`, `docs/ops/required-checks.md`, `docs/ops/branch-policy.md`

_Last updated on 2025-10-06_

_Last updated on 2025-09-11_
