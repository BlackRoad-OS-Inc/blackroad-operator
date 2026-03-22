#!/usr/bin/env bash
set -euo pipefail
if [[ -z "${K3S_MASTER_IP:-}" ]]; then
  echo "K3S_MASTER_IP not set" >&2
  exit 1
fi
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC='--write-kubeconfig-mode 644' sh -
