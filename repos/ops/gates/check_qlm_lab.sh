#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

data_dir="$repo_root/prism/policies"
input_cov="$repo_root/prism/ci/qlm_lab.coverage.json"
input_rag="$repo_root/prism/ci/qlm_lab.rag.json"

if ! command -v opa >/dev/null 2>&1; then
  install_dir="$repo_root/.bin"
  mkdir -p "$install_dir"
  curl -sSL -o "$install_dir/opa" https://openpolicyagent.org/downloads/latest/opa_linux_amd64
  chmod +x "$install_dir/opa"
  export PATH="$install_dir:$PATH"
fi

echo "Evaluating QLM Lab coverage gate..."
opa eval --data "$data_dir" --input "$input_cov" 'data.prism.gates.qlm_lab.allow' | grep -q "true"

echo "Evaluating QLM Lab RAG gate..."
opa eval --data "$data_dir" --input "$input_rag" 'data.prism.gates.qlm_lab_rag.allow' | grep -q "true"

echo "QLM Lab gates satisfied."
