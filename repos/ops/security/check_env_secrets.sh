#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

mapfile -t env_files < <(git ls-files '*.env' '*.env.*')
violations=()

for file in "${env_files[@]}"; do
  # allow documented samples and encrypted blobs
  case "$file" in
    *.example|*.template|*.dist|sops/*|*.sops|*.sops.yaml|*.sops.yml|*.sops.json)
      continue
      ;;
    _trash/*|etc/blackroad/shap-e.env|lucidia/lucidia.env|ops/backup/restic.env|opt/blackroad/*|tools/tools-adapter/.env)
      # legacy files tracked for documentation/historical reasons; migrate to SOPS before modifying
      continue
      ;;
  esac
  if grep -q 'ENC\[' "$file" 2>/dev/null; then
    continue
  fi
  violations+=("$file")
done

if ((${#violations[@]} > 0)); then
  printf 'Detected plaintext .env files that must be removed or encrypted with SOPS:\n' >&2
  printf '  - %s\n' "${violations[@]}" >&2
  printf 'Refer to SECURITY.md for remediation guidance.\n' >&2
  exit 1
fi

echo "Secret hygiene check passed: no plaintext .env files tracked."
