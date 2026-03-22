# <!-- FILE: /ops/backup/restic_setup.sh -->
#!/usr/bin/env bash
set -euo pipefail

export RESTIC_REPOSITORY="${RESTIC_REPOSITORY:-s3:http://minio:9000/lucidia-backups}"
export RESTIC_PASSWORD="${RESTIC_PASSWORD:-PLEASE_SET_RESTIC_PASSWORD}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-minio}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-PLEASE_SET_MINIO_ROOT_PASSWORD}"
export RESTIC_REPOSITORY="s3:http://minio:9000/lucidia-backups"
export RESTIC_PASSWORD="restic_pass"

: "${AWS_ACCESS_KEY_ID:?Set AWS_ACCESS_KEY_ID (obtain from your secret manager or via an OIDC exchange).}"
: "${AWS_SECRET_ACCESS_KEY:?Set AWS_SECRET_ACCESS_KEY (obtain from your secret manager or via an OIDC exchange).}"
export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY

restic init || true
