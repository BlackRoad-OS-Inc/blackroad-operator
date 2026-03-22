#!/bin/bash
# Keep Ollama models warm — Cecilia ONLY (Octavia too slow for inference)
curl -s --max-time 10 http://192.168.4.96:11434/api/generate \
  -d '{"model":"qwen2.5:3b","prompt":"ping","stream":false,"keep_alive":"30m","options":{"num_predict":1}}' >/dev/null 2>&1
curl -s --max-time 10 http://192.168.4.96:11434/api/generate \
  -d '{"model":"nomic-embed-text","prompt":"ping","stream":false,"keep_alive":"30m","options":{"num_predict":1}}' >/dev/null 2>&1
