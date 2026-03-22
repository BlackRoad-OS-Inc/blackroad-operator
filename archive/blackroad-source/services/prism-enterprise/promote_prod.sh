#!/usr/bin/env bash
set -euo pipefail

echo "Promoting release image to production..."
terraform -chdir=infra/terraform/aws apply -auto-approve -var "environment=prod" -var "image_tag=release-prod"
