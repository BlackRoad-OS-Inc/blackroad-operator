#!/usr/bin/env bash
set -euo pipefail

env_name=${1:-ci}
mkdir -p ops/artifacts

curl -sS "https://${env_name}.example.com/health" -o ops/artifacts/health.json
curl -sS "https://${env_name}.example.com/ready" -o ops/artifacts/ready.json
