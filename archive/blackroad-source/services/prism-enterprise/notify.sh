#!/usr/bin/env bash
set -euo pipefail

message=${1:-"Deployment complete"}

echo "::notice::${message}"
