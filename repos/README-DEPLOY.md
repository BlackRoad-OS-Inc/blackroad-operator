# BlackRoad deployment workflows

This repository exposes two deployment paths that now live inside a single
GitHub Actions workflow (`.github/workflows/blackroad-deploy.yml`). The default
"modern" path is triggered automatically on pushes to `main` and talks to the
BlackRoad deploy webhook. A manual "legacy" path remains available for the
historic SSH-based rollout and can be triggered on demand from the Actions tab.

## Modern webhook deploy (default)

Pushes to `main` execute the **Modern webhook deploy** job. The workflow builds
in place, calls `POST /api/deploy/hook`, and performs progressive verification
with cache purges and Slack notifications when configured.

### Required configuration

Add the following Action secrets/variables under
**Settings → Secrets and variables → Actions**:

- `BR_DEPLOY_SECRET` — bearer token accepted by `/api/deploy/hook` and
  `/api/deploy/trigger`.
- `BR_DEPLOY_URL` — optional override if the webhook lives somewhere other than
  `https://blackroad.io/api/deploy/hook`.
- `CF_ZONE_ID` / `CF_API_TOKEN` — optional Cloudflare purge credentials used
  when the version check fails.
- `SLACK_WEBHOOK_URL` — optional Slack notification target.
- `SITE_URL` / `API_URL` (Repository **variables**) — optional overrides when the
  canonical domains differ from `https://blackroad.io`.

### What the job does

1. Installs dependencies and builds the Prism console.
2. Calls the deploy webhook with the current SHA, branch, and actor.
3. Waits for the API to report the new build SHA, purging Cloudflare or forcing a
   rebuild if necessary.
4. Revalidates `/healthz` and `/api/version` before marking the run successful.
5. Posts a Slack summary when `SLACK_WEBHOOK_URL` is available.

## Gated Promotions

The `gate-and-promote.yml` workflow orchestrates gated promotions for preview,
staging, and production. Each run evaluates the Policy Gate (`tools/policy_gate.ts`),
executes the API and UI test suites, validates the metrics contract snapshot
(`data/metrics/status.json`), and confirms manual approvals from
`config/approvals.json`. Gate outcomes are surfaced through the Gatekeeper API
(`GET /api/gate/status`) and mirrored to GitHub Checks (`Policy Gate`, `Tests
Gate`, `Metrics Gate`, `Approvals Gate`). When all gates are green the workflow
delegates to reusable deployment ladders:

- **Staging** calls `reusable-canary.yml` to step traffic through `1,50,100`
  canary slices with baked health probes.
- **Production** calls `reusable-bluegreen.yml` to warm the green stack, shift
  traffic, and fall back automatically if CloudWatch alarms or probes turn red.

Both reusable workflows emit `Canary Health`/`BlueGreen Health` checks and
invoke `scripts/rollback.sh` if the run fails, ensuring parity with the
rollback guidance captured in `docs/ops/rollback-forward.md`.
## API ECS deployments

Use `.github/workflows/blackroad-api-ecs.yml` when you need to roll out the API
service onto AWS ECS. The workflow wraps the reusable
`reusable-ecs-service-deploy.yml` helper so other pipelines can call it with
`workflow_call`, while the manual dispatch path provides an operator-friendly
form in the Actions UI.

### Required secrets and variables

Configure the following repository secrets for each environment:

- `STAGING_AWS_DEPLOY_ROLE_ARN` / `PROD_AWS_DEPLOY_ROLE_ARN` — IAM roles that
  grant the workflow permission to register task definitions and update the
  service.
- `STAGING_ECS_CLUSTER` / `PROD_ECS_CLUSTER` — ECS cluster names or ARNs.
- `STAGING_ECS_SERVICE` / `PROD_ECS_SERVICE` — Service identifiers to update.
- `STAGING_ECS_CONTAINER` / `PROD_ECS_CONTAINER` — Container names within the
  task definition whose image should be replaced.

If another workflow invokes `blackroad-api-ecs.yml` with its own
`workflow_call` block, it can pass alternative credentials or ECS identifiers by
providing the optional secrets `AWS_ROLE_TO_ASSUME`, `ECS_CLUSTER`,
`ECS_SERVICE`, and `ECS_CONTAINER`.

### Dispatch inputs

- `environment` — `staging` or `production` to select the secret set.
- `image` — Optional image reference. Defaults to
  `ghcr.io/blackboxprogramming/blackroad-api:<sha>` when left blank.
- `wait-for-service-stability` — Defaults to `true`. Set to `false` to skip the
  `aws ecs wait services-stable` step when running parallel smoke tests.

## Legacy SSH fallback

The historical SSH pipeline still exists as a manual job. Trigger it from the
workflow's **Run workflow** dialog and choose `legacy-ssh` for the `target`
input. Optional inputs let you deploy another ref or override the health check
endpoints used during verification.

## DigitalOcean browser console quickstart

When you need a one-off static landing page without touching an SSH client,
provision a Rocky/Alma/CentOS droplet in DigitalOcean and run the following
commands directly from the browser console. They install Nginx, serve a
placeholder site from `/var/www/blackroad`, expose a `/healthz` endpoint, and
optionally enable the Cockpit web admin for future maintenance.

```bash
dnf -y install nginx

mkdir -p /var/www/blackroad
cat >/var/www/blackroad/index.html <<'HTML'
<!doctype html><meta charset="utf-8"><title>BlackRoad</title>
<style>body{margin:0;background:#060b18;color:#e6f0ff;font:16px/1.5 system-ui;display:grid;place-items:center;height:100vh}main{max-width:640px;padding:24px;text-align:center}</style>
<main><h1>BlackRoad is live</h1><p>HTTP is up. HTTPS next.</p></main>
HTML

cat >/etc/nginx/conf.d/blackroad.conf <<'NGINX'
server {
  listen 80;
  server_name blackroad.io www.blackroad.io;

  root /var/www/blackroad;
  index index.html;

  location = /healthz {
    add_header Content-Type application/json;
    return 200 '{"ok":true,"service":"blackroad","ts":"$time_iso8601"}';
  }
}
NGINX

nginx -t && systemctl enable --now nginx

# Allow inbound HTTP/HTTPS traffic (firewalld blocks them by default)
firewall-cmd --add-service=http --permanent 2>/dev/null || true
firewall-cmd --add-service=https --permanent 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

# Optional: browser-based admin
dnf -y install cockpit
systemctl enable --now cockpit.socket
firewall-cmd --add-service=cockpit --permanent 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

# Local smoke tests
curl -sI http://127.0.0.1 | head -n1
curl -s http://127.0.0.1/healthz
```

Point the GoDaddy DNS records to the droplet's IP (`A` records for `@` and
`www`), wait for propagation, and verify from a local terminal:

```bash
curl -I http://blackroad.io
curl -s http://blackroad.io/healthz
```

To avoid SSH entirely, enable the Cockpit UI at
`https://<droplet-ip>:9090` and sign in with the droplet's root credentials.

Once DNS resolves, install Certbot and request certificates for HTTPS:

```bash
dnf -y install epel-release
dnf -y install certbot python3-certbot-nginx || true
if ! command -v certbot >/dev/null; then
  dnf -y install snapd && systemctl enable --now snapd && ln -sf /var/lib/snapd/snap /snap
  snap install core && snap refresh core
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
fi

certbot --nginx -d blackroad.io -d www.blackroad.io \
  --redirect --agree-tos -m you@example.com --non-interactive

curl -sI https://blackroad.io | head -n1
curl -s https://blackroad.io/healthz
```

If any command fails, grab the trailing log lines and investigate before
continuing.

### Legacy-specific secrets and variables

Configure these secrets if you rely on the fallback path:

- `DEPLOY_HOST` — target server hostname.
- `DEPLOY_USER` — SSH user that can write to `/var/www/blackroad` and
  `/srv/blackroad-api`.
- `DEPLOY_KEY` — private SSH key with access to the host.
- `DEPLOY_PORT` — optional port (set as a secret or variable) if SSH does not
  run on 22.

### Workflow behaviour

1. Checks out the requested ref (defaults to the workflow ref).
2. Builds `sites/blackroad` and packages the API into tarballs.
3. Uploads both archives to the host via SCP.
4. Extracts the artifacts, restarts `blackroad-api` and `lucidia-llm`, and checks
   the supplied health endpoints before finishing.

### Health overrides

The manual dispatch form accepts `health_url` and `api_health_url` inputs. When
left blank, the workflow checks `https://blackroad.io/health` and
`https://blackroad.io/api/health` respectively. Provide alternate URLs if you
are targeting a different host.

## Reusable deployment workflows

Smaller service-specific pipelines can now delegate platform rollouts to
reusable GitHub workflows. The harnesses line up with the environment manifests
under `environments/` so every deploy path shares the same guardrails.

### `.github/workflows/reusable-aws-ecs-deploy.yml`

Call this workflow with `uses: ./.github/workflows/reusable-aws-ecs-deploy.yml`
to register a new task definition revision and trigger a deployment for an ECS
service. Required inputs include the cluster, service, and container image. Pass
`secrets.aws-role-to-assume` (or static access keys) so the job can assume the
appropriate deploy role. Optional inputs let you override the desired count and
wait for stability before exiting.

```
jobs:
  publish-api:
    uses: ./.github/workflows/reusable-aws-ecs-deploy.yml
    with:
      cluster: prism-prod
      service: api-gateway
      image: ${{ needs.build.outputs.image-ref }}
      container-name: api
      region: us-west-2
    secrets:
      aws-role-to-assume: ${{ secrets.AWS_PROD_DEPLOY_ROLE_ARN }}
      aws-external-id: ${{ secrets.AWS_PROD_EXTERNAL_ID }}
```

### `.github/workflows/reusable-fly-deploy.yml`

Use this workflow when a service ships via Fly.io. It accepts an app name and
either a Docker image reference or falls back to the checked-in `fly.toml`. You
can stage secret updates by providing newline-separated `KEY=VALUE` pairs and
optionally pass a `release-command` to run post-deploy migrations.

```
jobs:
  deploy-bridge:
    uses: ./.github/workflows/reusable-fly-deploy.yml
    with:
      app: blackroad-bridge-prod
      image: ${{ needs.build.outputs.image-ref }}
      strategy: rolling
    secrets:
      fly-api-token: ${{ secrets.FLY_API_TOKEN }}
```
## Canary + rollback workflows

Production traffic now flows through paired workflows that mirror the
environment manifest entries:

- **deploy-canary** — build, publish, and shift a configurable percentage of
  requests to the green target group while watching CloudWatch latency/5xx
  baselines. Use this for quick spot checks or a single promotion.
- **deploy-canary-ladder** — iterate through multiple percentages (defaults to
  `1,50,100`) with soak times and automated rollback to blue if the metrics or
  HTTP probes cross thresholds.
- **Deploy & Self-Heal** — rsync to long-lived hosts, run
  `scripts/deploy.sh`, and invoke the self-heal automation capable of rolling
  back via Git or Docker. Useful when ECS or the webhook path is unhealthy.

The secrets/variables called out in `environments/production.yml` must stay in
sync with GitHub repository settings so these jobs can assume the correct AWS
roles and reference the ALB listener or target groups. For step-by-step
procedures, see [`docs/ops/rollback-forward.md`](docs/ops/rollback-forward.md).
## Ollama bridge (Fly.io)

The Ollama bridge now deploys via Fly.io using
`.github/workflows/ollama-bridge-deploy.yml`. The workflow builds the container
image from `srv/ollama-bridge/Dockerfile`, pushes it with the current commit SHA
label, and performs a health probe against
`https://blackroad-ollama-bridge.fly.dev/api/llm/health` before finishing.

### Required configuration

Add a Fly API token under repository secrets:

- `FLY_API_TOKEN` — generated with `fly auth token`. Required to deploy via the
  workflow.

Provision runtime configuration directly in Fly secrets:

- `OLLAMA_BASE_URL` — base URL for the upstream Ollama runtime (e.g.,
  `https://ollama.internal:11434`).
- Optional overrides like `MODEL_DEFAULT` can be supplied the same way.

### Manual rollbacks

If a release needs to be reverted, run the following locally with a valid Fly
token:

```bash
flyctl releases --app blackroad-ollama-bridge        # inspect recent releases
flyctl deploy --config deploy/fly/ollama-bridge/fly.toml --image <previous>
```

Alternatively, run the GitHub workflow manually and provide the `image_label`
input matching a previous release image tag.

## Related documentation

- [`DEPLOYMENT.md`](DEPLOYMENT.md) — GitHub App setup, branch policy, and
  rollback tooling.
- [`environments/production.yml`](environments/production.yml) — source-of-truth
  manifest for production infrastructure and automation.
- [`environments/preview.yml`](environments/preview.yml) — captures preview
  environment automation, including the PR container image pipeline.

## PR preview container builds

Preview review flows now publish a GHCR image for each pull request through
`.github/workflows/preview-containers.yml`. The job shares the same triggers as
the Terraform-backed preview environment and:
### Rollback / roll forward playbook

Follow the `runbooks/examples/release_rollback_forward.yaml` runbook when a
deployment needs human review. It captures the pre-checks, health validation,
and paths for both rollback and roll forward so the on-call can document the
decision and keep the rest of engineering in the loop.

Quick reference from the runbook:

1. Announce the investigation and complete the pre-checks (latest deploy SHA,
   change approval status, and health probes).
2. Record the decision in the runbook artifacts and, if rolling back, point the
   symlinks at the previous release using `scripts/deploy.sh <prior-tarball>`.
3. After the environment stabilizes, either re-run the deploy workflow from the
   target SHA (roll forward) or confirm rollback completion in `#eng` with links
   to the collected metrics and health checks.

All evidence collected through the runbook lands in
`artifacts/runbooks/releases/<environment>/` (for example,
`artifacts/runbooks/releases/staging/`), making it easy to hand off context
to the next on-call or audit the decision later.

Monorepo notes
•If your SPA is at web/, it will be built and packaged automatically.
•If your API is at api/, its source is packaged (prod deps installed on the server).
•If you keep everything at root, the workflow still attempts sensible fallbacks.

1. Builds the current branch into a container tagged
   `ghcr.io/<owner>/blackroad-prism-console:pr-<pr-number>-<short-sha>`.
2. Uploads a Syft-generated SBOM artifact named `pr-<pr-number>-sbom`.
3. Runs Grype and uploads the SARIF report to the repository’s code scanning
   dashboard.
4. Comments pull instructions on the PR so reviewers can run the container
   locally.

The job uses `GITHUB_TOKEN` for registry access by default. Supply `GHCR_PAT`
when a fine-grained token is required for downstream automations.
### That’s it
This **one** pipeline handles **build → artifact → SSH deploy → atomic switch → health → auto‑rollback** and retains the **last 3** releases. If you want me to tailor it to a specific repo layout (e.g., exact web/api paths, extra build steps, Prisma migrations, PM2 instead of systemd), say the word and I’ll adapt the files accordingly.

_Last updated on 2025-09-11_
