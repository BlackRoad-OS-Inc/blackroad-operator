#!/usr/bin/env bash
# RoadID — BlackRoad identity system CLI wrapper
# Usage: roadid <command> [args]
# Symlink: ln -sf ~/roadnet/roadid.sh /usr/local/bin/roadid

set -e

ROADNET_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
exec python3 "$ROADNET_DIR/roadid.py" "$@"
