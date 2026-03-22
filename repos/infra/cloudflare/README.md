# Cloudflare Automation Stubs

These stubs pair with the **BlackRoad Domain Automation Runbook** (`RUNBOOKS/blackroad-domain-automation.md`). They let us stage DNS zones and records as code while we finish the full Terraform plan.

## Files

- `main.tf` — Minimal Terraform configuration to create Cloudflare zones and DNS records from variable maps.
- `records.auto.tfvars.example` — Example variable payload describing the BlackRoad constellation of zones and records.
- `zones.template.json` — JSON schema for the Codex agents when they need to emit zone state snapshots.

## Usage

1. Copy `records.auto.tfvars.example` to `records.auto.tfvars` and fill in production values (Cloudflare account IDs, record targets, Microsoft 365 tenant hostname, etc.).
2. Export `CLOUDFLARE_API_TOKEN` with zone + DNS permissions and either set it via environment variable (`TF_VAR_cloudflare_api_token`) or interactively when Terraform prompts.
3. Initialize and apply:
   ```bash
   cd infra/cloudflare
   terraform init
   terraform plan -var-file=records.auto.tfvars
   terraform apply -var-file=records.auto.tfvars
   ```
4. When agents produce updates (e.g., new subdomains, DMARC tweaks), patch the tfvars file and re-run `terraform apply` to keep Cloudflare in sync.

> **Safety:** Check the `plan` output for accidental deletions before applying. Add `allow_overwrite = true` to individual records if Cloudflare already contains them but Terraform must become the source of truth.
