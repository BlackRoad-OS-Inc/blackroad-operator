#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DIR="${ROOT}/release"
mkdir -p "${RELEASE_DIR}"

SIGNING_KEY="${SIGNING_KEY:-${RELEASE_DIR}/signing_key.pem}"
if [[ ! -f "${SIGNING_KEY}" ]]; then
  echo "Signing key missing. Provide SIGNING_KEY or create ${SIGNING_KEY}." >&2
  exit 1
fi

stamp="$(date +%Y%m%d_%H%M%S)"
target_dir="${RELEASE_DIR}/offline_service_${stamp}"
mkdir -p "${target_dir}"

tarball="${target_dir}/offline_service_${stamp}.tgz"

pushd "${ROOT}" >/dev/null
  tar -czf "${tarball}" \
    server.js \
    ops.html \
    audit_ledger.py \
    demo \
    demo.sh \
    check.sh
popd >/dev/null

sha256sum "${tarball}" > "${target_dir}/sha256.txt"
sha_value=$(cut -d' ' -f1 "${target_dir}/sha256.txt")

openssl dgst -sha256 -sign "${SIGNING_KEY}" -out "${target_dir}/bundle.sig" "${tarball}"
openssl base64 -A -in "${target_dir}/bundle.sig" -out "${target_dir}/bundle.sig.b64"

printf "%s" "${sha_value}" | openssl dgst -sha256 -sign "${SIGNING_KEY}" | openssl base64 -A > "${target_dir}/sha256.sig"
openssl rsa -in "${SIGNING_KEY}" -pubout -out "${target_dir}/public.pem" >/dev/null 2>&1

cat <<MANIFEST > "${target_dir}/manifest.json"
{
  "created": "${stamp}",
  "tarball": "$(basename "${tarball}")",
  "sha256": "${sha_value}",
  "sha256_signature": "$(cat "${target_dir}/sha256.sig")"
}
MANIFEST

echo "Release package created: ${tarball}"
echo "SHA-256: ${sha_value}"
