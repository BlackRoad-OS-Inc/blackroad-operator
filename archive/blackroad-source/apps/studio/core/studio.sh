#!/bin/bash
# BlackRoad Studio Workflow
# Automates creative asset processing and deployment
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

ASSETS_DIR="${HOME}/.blackroad/studio/assets"
EXPORT_DIR="${HOME}/.blackroad/studio/exports"
mkdir -p "$ASSETS_DIR" "$EXPORT_DIR"

cmd_optimize() {
  local input="$1"
  echo -e "${CYAN}Optimizing: $input${NC}"
  if command -v ffmpeg >/dev/null 2>&1; then
    case "${input##*.}" in
      mp4|mov) ffmpeg -i "$input" -c:v libx264 -crf 23 -preset fast "$EXPORT_DIR/$(basename "$input")" ;;
      png)     ffmpeg -i "$input" "$EXPORT_DIR/$(basename "${input%.png}").webp" ;;
      jpg|jpeg)ffmpeg -i "$input" -q:v 85 "$EXPORT_DIR/$(basename "$input")" ;;
      *) echo "Unsupported format: ${input##*.}" ;;
    esac
    echo -e "${GREEN}✓ Exported to $EXPORT_DIR${NC}"
  fi
}

cmd_thumbnail() {
  local video="$1"
  if command -v ffmpeg >/dev/null 2>&1; then
    ffmpeg -i "$video" -ss 00:00:02 -vframes 1 "$EXPORT_DIR/thumb-$(basename "${video%.*}").jpg" 2>/dev/null
    echo -e "${GREEN}✓ Thumbnail: $EXPORT_DIR/thumb-$(basename "${video%.*}").jpg${NC}"
  fi
}

case "${1:-help}" in
  optimize) cmd_optimize "${2:-}" ;;
  thumbnail) cmd_thumbnail "${2:-}" ;;
  *) echo "Usage: studio <optimize|thumbnail> <file>" ;;
esac
