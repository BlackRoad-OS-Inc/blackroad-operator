#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-/srv/blackroad}"
echo "Installing Education Pack into $TARGET ..."

mkdir -p "$TARGET/packs/education"
cp pack.yaml "$TARGET/packs/education/"
cp -R agents workflows curricula rubrics "$TARGET/packs/education/" 2>/dev/null || true
echo "Pack metadata is in pack.yaml – wire this into your pack index."
