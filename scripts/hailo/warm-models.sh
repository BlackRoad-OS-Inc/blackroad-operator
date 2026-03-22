#!/bin/bash
# Keep Ollama models warm on all fleet nodes
# Run via cron: */10 * * * * /opt/blackroad/scripts/warm-models.sh

for node in 192.168.4.96 192.168.4.101; do
  curl -s "http://$node:11434/api/generate" \
    -d '{"model":"tinyllama:latest","prompt":"warmup","stream":false,"keep_alive":"24h","options":{"num_predict":1}}' \
    > /dev/null 2>&1 &
done

# Warm qwen on Cecilia (best model)
curl -s "http://192.168.4.96:11434/api/generate" \
  -d '{"model":"qwen2.5:3b","prompt":"warmup","stream":false,"keep_alive":"24h","options":{"num_predict":1}}' \
  > /dev/null 2>&1 &

wait
