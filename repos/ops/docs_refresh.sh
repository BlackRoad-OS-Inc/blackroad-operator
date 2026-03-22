#!/usr/bin/env bash
set -euo pipefail
# stitch README pointers, ensure required-checks doc matches CI names
git add -A
git commit -m "docs: refresh READMEs, required checks, cleanup notes" || true
