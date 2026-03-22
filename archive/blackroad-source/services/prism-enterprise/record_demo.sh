#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/docs/media"
mkdir -p "$OUT_DIR"

if ! command -v npx >/dev/null; then
  echo "npx is required" >&2
  exit 1
fi

npx --yes playwright install chromium >/dev/null
node "$ROOT_DIR/scripts/record_demo.mjs" "$OUT_DIR/demo.webm"

if command -v ffmpeg >/dev/null; then
  ffmpeg -y -i "$OUT_DIR/demo.webm" -c:v libx264 -preset slow -crf 22 "$OUT_DIR/demo.mp4" >/dev/null
  ffmpeg -y -i "$OUT_DIR/demo.mp4" -vf "fps=12,scale=720:-1:flags=lanczos" "$OUT_DIR/demo.gif" >/dev/null
else
  echo "ffmpeg missing; skipping GIF generation" >&2
fi
