# Environment manifests

The files in this directory capture the source-of-truth for each deployed or
planned environment. They summarise domains, deployment workflows, Terraform
roots, health checks, and required approvals so that release and ops teams have
one place to reference when wiring automation.

## Field guide

Every manifest follows a lightweight schema so ops and release automation stay
in sync:

- `name` / `slug` — human and short identifiers.
- `state` — `active`, `provisioning`, or `planned` based on readiness.
- `description` — quick context for why the environment exists.
- `contacts` — default Slack or reviewer routing.
- `domains` — canonical hostnames or URL patterns served by the environment.
- `deployments` — per-service blocks describing workflow triggers, hosting
  providers, Terraform roots (when applicable), and health checks. Use
  `state` inside each block when a service is still being wired up.
  - When Terraform manages the deployment, include `terraform_backend`
    metadata so operators know where remote state and locks live.
- `infrastructure` — cloud region, Terraform roots, and backend state files that
  provision the footprint.
- `automation` — deploy workflows, required secrets, and notification routes
  that move new builds into the environment.
  `state` inside each block when a service is still being wired up. When the
  infrastructure is provisioned through Terraform modules, reference the
  relative module path so the manifest doubles as navigation for ops engineers.
- `change_management` — approvals or runbooks that must be followed.
- `observability` — scripts or commands teams use to verify the environment.
- Optional fields like `environment`, `secrets`, or `notes` help describe the
  inputs a workflow expects and any gotchas future maintainers should keep in
  mind. List them when they save a trip to other repos or credential stores.

The additional `infrastructure` and `automation` sections make it easier for
release tooling to wire GitHub Actions, Terraform state, and downstream
dashboards together without trawling the monorepo. Update both sections whenever
we add a new workflow, change Terraform backends, or swap regions so bots and
humans stay aligned.

For deployment reversals or expedited fixes, the environments reference the
`runbooks/examples/release_rollback_forward.yaml` playbook that pairs with the
deployment and ops guides. Runbook evidence is stored under
`artifacts/runbooks/releases/<environment>/` for later review.

Update the manifest whenever the environment changes (new workflow, Terraform
module, domain, or approval requirement). These files should stay aligned with
`br-infra-iac`, `.github/workflows/*`, and the documented runbooks.

## Validating changes

Run the schema validator to confirm manifests stay consistent:

```bash
./scripts/validate_environment_manifests.py
```

The command exits non-zero when a manifest fails validation and prints the
specific path and schema error to help with debugging.
## CLI helper

Generate a quick summary for release tooling (or manual spot checks) with the
environment summary script:

```bash
python tools/environments_summary.py --format text
```

Filter to a single environment by slug when wiring automation:

```bash
python tools/environments_summary.py --env stg
```

## Current coverage

- `production.yml` — customer-facing blackroad.io footprint.
- `staging.yml` — stage.blackroad.io plus the AWS scaffolding that mirrors prod.
- `preview.yml` — ephemeral PR preview infrastructure under dev.blackroad.io.
Each file in this directory captures the reviewers and routing details for one deployment footprint. Automation can load these YML documents to determine who to ping for approvals and which hostnames map to the environment.

## Fields

- `name`: Short identifier for the environment.
- `url`: Canonical hostname that represents the environment (used for status pings and dashboards).
- `url_template` (optional): Template for ephemeral endpoints, used by preview environments that spin up per PR (`<number>` is replaced with the pull request number).
- `reviewers`: Default GitHub handles or teams who should review releases hitting the environment.
- `notes`: Free-form context about infrastructure targets or routing.

## Current environments

- `production.yml` — Public site at https://blackroad.io
- `staging.yml` — Release-candidate staging stack on Fly.io + AWS ECS
- `preview.yml` — Ephemeral per-PR preview routed through AWS ALB and Route53 under `*.dev.blackroad.io`

Extend these files with additional metadata (e.g., deploy workflows, health checks) as automation matures.
- `preview-env.yml` — ephemeral PR preview infrastructure under dev.blackroad.io.
This directory holds the declarative manifests for the three delivery surfaces we operate today:
preview, staging, and production.  Each manifest is a single source of truth for how code leaves the
repository, what infrastructure it lands on, and the guardrails that keep the environment healthy.

The manifests intentionally stay platform-agnostic.  They describe the outcome we expect (domains,
scaling limits, dependencies, approvals) and reference the automation surfaces that realise that
outcome (GitHub workflows, Terraform modules, runbooks).  Our deploy pipelines can consume these
files directly to render environment-specific plans or to hydrate ChatOps commands with the right
context.

## File layout

| File | Purpose |
| --- | --- |
| `preview.yaml` | Ephemeral review apps for pull requests (Fly.io edge + AWS ECS preview stack). |
| `staging.yaml` | Always-on staging slice that mirrors production topology while allowing faster rollouts. |
| `production.yaml` | Customer-facing footprint running behind Cloudflare with the strictest guardrails. |

## Schema

Every manifest shares the same top-level structure:

```yaml
meta:
  name: staging
  tier: stable
  description: "Short human readable summary."
  owners:
    - "platform@blackroad.io"
  tags: [web, api, workflows]

runtime:
  code:
    repo: blackroad-prism-console
    entrypoints:
      - path: sites/blackroad
        type: nextjs
      - path: srv/blackroad-api
        type: express
  artifacts:
    - workflow: .github/workflows/prism-ci.yml
      produces: [docker-image, static-assets]

infrastructure:
  compute: []           # Fly.io apps, ECS services, cron jobs, workers
  data: []              # Postgres, Redis, S3 buckets, etc.
  networking: []        # Domains, DNS, CDN, TLS

operations:
  deployments: []       # pipelines, approvals, rollout strategy
  observability: []     # dashboards, alerts, logging
  compliance: []        # backups, retention, access controls
  runbooks: []          # URLs into RUNBOOK.md or pager playbooks

slo:
  availability: "99.5%"
  latency_ms_p95: 600
  rto_minutes: 30
  rpo_minutes: 15
```

A field can be omitted when it does not apply, but try to prefer explicit empty lists or
`description` placeholders so gaps are obvious during reviews.

## Consuming the manifests

* **Automation** – The GitHub Actions defined under `.github/workflows/` can look up a manifest to
  determine the target domain, scale, and secrets bundle before calling Terraform or deployment
  hooks.
* **ChatOps** – The `/deploy` and `/cache` commands reference these manifests to advertise the
  environment they are touching and to link to the correct runbooks.
* **Runbooks** – Operators can rely on a single location for domain/IP ownership, key dependencies,
  and the change management process before approving a rollout.

When adding a new environment, copy one of the existing manifests, update the metadata and
infrastructure blocks, and link the file from the table above.
- `preview.yml` — ephemeral PR preview infrastructure under dev.blackroad.io,
  backed by the reusable Terraform stack in `infra/preview-env`.
# Environment Manifests

This directory contains declarative manifests describing each externally accessible footprint.

| Name        | URL Pattern                           | Notes |
|-------------|----------------------------------------|-------|
| production  | https://blackroad.io                  | Primary customer-facing footprint with `www` alias. |
| staging     | https://dev.blackroadinc.us           | Release-candidate surface routed through the hub domain. |
| preview     | https://pr-<number>.dev.blackroad.io | Ephemeral per-PR previews served via the ECS/Fargate module. |

Each manifest is structured consistently so automation can discover and route deployments without manual configuration. Update these files when environments are added or modified.
The files in this directory describe where and how each BlackRoad Prism Console environment is deployed.
They provide a single place for release engineering, infrastructure, and operations teams to agree on the
shape of staging, preview, and production footprints noted in `../AGENT_WORKBOARD.md`.

## Schema

Each manifest is a YAML document with the following top-level keys:

| Key | Description |
| --- | --- |
| `name` | Human readable name of the environment. |
| `slug` | Short identifier used in automation (e.g., `prod`, `stg`). |
| `status` | Lifecycle flag: `active`, `planned`, or `deprecated`. |
| `description` | One or two sentence summary of the environment's purpose. |
| `domains` | Map of externally visible domains for this environment. |
| `deploy_targets` | Array of deployment targets. Each entry includes a `provider`, optional configuration fields (`app`, `config`, `region`, etc.), a `status`, and free-form `notes`. |
| `ci_cd` | Workflows, branches, and promotion details used to reach the environment. |
| `approvals` | Change control requirements, reviewer handles, and policy gates. |
| `runbooks` | Links to the runbooks that cover routine deploy/rollback procedures. |
| `observability` | Dashboards, alerting integrations, and logging references. |
| `notes` | Extra bullet points that do not fit cleanly elsewhere. |

### Usage

- New infrastructure work should add or update a manifest entry instead of sprinkling environment-specific
  details through docs.
- CI/CD and automation bots can consume these manifests to decide where to promote builds and which guardrails
  to enforce before touching an environment.
- When an environment graduates from `planned` to `active`, update the manifest and notify the deploy bots so
  they can wire the new target into their pipelines.

These manifests intentionally stay concise so they remain easy to keep in sync with actual infrastructure.

### Validation

Run `make environments-validate` to perform a structural lint of the manifests.
It checks required keys, data types, and that common enumerations such as
`status` values stay within the agreed vocabulary.
