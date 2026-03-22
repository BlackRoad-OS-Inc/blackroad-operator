# Environment Manifests

These manifests describe the shape of the BlackRoad deployment targets so that automation and operators can reason about them without reverse-engineering Terraform modules or digging through CI configuration. Each file captures the minimum viable information we need to wire CI/CD workflows and runbooks into the appropriate infrastructure footprint.

## File Layout

- `preview.yaml` – ephemeral environments spun up per pull request or short-lived experiment.
- `staging.yaml` – long-running integration environment that mirrors production controls.
- `production.yaml` – customer-facing deployment with stricter guardrails and observability.

## Schema

Every manifest follows the same top-level keys:

- `environment`: Canonical environment slug used by automation and observability tags.
- `description`: Human readable summary of the environment's purpose.
- `owner`: Team or role accountable for the environment.
- `regions`: Cloud regions (and providers) where the footprint lives.
- `repositories`: Source repos that deliver artifacts into the environment.
- `deployments`: Service blocks that capture runtime, scaling, ingress, and health surfaces.
- `dependencies`: External systems this environment relies on (databases, queues, third-party APIs).
- `release_process`: Summary of how changes are promoted, including approval and rollout patterns.

The files are intentionally YAML so that they can be consumed directly by `ops/` automation or rendered into documentation.

## Usage

- **Automation** – Workflows can parse these manifests to determine which Terraform workspace, Fly.io app, or ECS service to operate on.
- **Runbooks** – Incident responders can quickly identify health endpoints and escalation paths.
- **Planning** – Product and infrastructure leads can verify that staging stays in lockstep with production before enabling new features.

When adding new environments, copy an existing manifest and adjust the metadata. Keep the schema aligned so that tooling can rely on consistent keys.
This directory tracks the canonical environment descriptions for BlackRoad Prism deployments.
The manifests are written in YAML so automation and runbooks can consume the same source
of truth when provisioning infrastructure or wiring CI/CD workflows.

## Files

- `blackroad.yaml` — describes the preview, staging, and production targets for the
  public Prism Console deployment. Each environment lists runtime, region, networking,
  and deployment hooks so workflows can publish builds to the correct destination.

## Usage

The manifests are designed to be referenced by scripts and GitHub Actions. A typical
workflow reads the manifest, injects environment-specific secrets, and runs the
appropriate IaC or deployment command.

To keep manifests authoritative:

1. Update the YAML definitions whenever infrastructure characteristics change.
2. Commit the file alongside any Terraform, Helm, or workflow modifications that rely
   on the new configuration.
3. Use environment identifiers (`preview`, `staging`, `production`) consistently across
   CI pipelines, runbooks, and application configuration.
This directory captures the canonical deploy targets for Prism Console.
It is the source of truth for automation wiring, CI/CD pipelines, and
runbooks so that staging, preview, and production all share the same
contract.

- `environments.yaml` &mdash; high-level description of each footprint,
  including provider targets, release triggers, and policy gates. The file
  is designed to be machine-readable so GitHub Actions, Terraform, or
  other orchestrators can derive deploy steps without re-encoding
  environment specific knowledge.

## Authoring Guidelines

1. Keep every environment self-contained: metadata, targets, and rollout
   policy should live alongside each other to reduce tribal knowledge.
2. Reference deploy workflows or Terraform states by relative path so the
   manifest remains portable across forks.
3. Record policy gates and rollback hooks so runbooks can link directly to
   authoritative procedures.
4. Treat this directory as the control plane &mdash; infrastructure changes
   should start here and then be implemented in the respective automation
   directories (`infra/preview-env`, `infra/prism`, `.github/workflows/`,
   etc.).

## Next steps

- Connect the manifest to GitHub Actions so deploy jobs can read targets
  and automatically select Fly.io vs. AWS ECS.
- Extend Terraform modules to consume the same metadata, ensuring state
  files stay in sync with release automation.
- Update release runbooks to reference the manifest rather than duplicating
  environment descriptions.
