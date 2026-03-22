#!/usr/bin/env bash
set -euo pipefail
PREV=${1:-"$(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)"}
NOW=${2:-HEAD}
echo "## Release Notes ($(date -u +%Y-%m-%d))"
git log --pretty="- %h %s (%an)" $PREV..$NOW | sed 's/\[skip ci\]//g'
