#!/usr/bin/env bash
set -euo pipefail
SERVICES=( . services/backroad services/llm-gateway services/legal-compliance-automation services/operations-supply-chain services/rd-innovation-lab services/metaverse-campus services/city-portal lucidia-llm serving/jetson apps/prism-console-web )
for s in "${SERVICES[@]}"; do
  echo "==> Build $s"
  docker build -q "$s" || { echo "Build failed: $s"; exit 1; }
done
echo "All images built."
