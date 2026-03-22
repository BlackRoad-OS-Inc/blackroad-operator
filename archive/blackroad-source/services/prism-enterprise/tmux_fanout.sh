#!/usr/bin/env bash
set -euo pipefail

SERVICES=(
  "services/backroad"
  "services/llm-gateway"
  "services/legal-compliance-automation"
  "services/operations-supply-chain"
  "services/rd-innovation-lab"
  "services/metaverse-campus"
  "services/city-portal"
  "lucidia-llm"
  "serving/jetson"
  "apps/prism-console-web"
)

SESSION=${1:-fanout}
tmux new-session -d -s "$SESSION"

i=0
for svc in "${SERVICES[@]}"; do
  if [ $i -gt 0 ]; then tmux split-window -t "$SESSION":0 -h; fi
  tmux.select-layout -t "$SESSION":0 tiled
  tmux.send-keys -t "$SESSION":0.$i "cd $svc && git pull --rebase && make test || npm test || pytest -q || true" C-m
  ((i++))
  if [ $i -eq 10 ]; then break; fi
done

tmux select-layout -t "$SESSION":0 tiled
tmux attach -t "$SESSION"
