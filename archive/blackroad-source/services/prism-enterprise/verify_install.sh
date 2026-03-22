#!/usr/bin/env bash
set -euo pipefail

echo "Running smoke checks..."
python -m cli.console --help >/dev/null
python -m cli.console bot:list >/dev/null
echo "OK"
