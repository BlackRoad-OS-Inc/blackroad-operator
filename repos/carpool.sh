#!/usr/bin/env bash
# CarPool — Pick up your agent. Ride the BlackRoad.
# Symlink: ln -sf ~/roadnet/carpool.sh ~/bin/carpool

set -e

ROADNET_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
exec python3 "$ROADNET_DIR/carpool.py" "$@"
