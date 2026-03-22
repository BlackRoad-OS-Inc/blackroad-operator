#!/usr/bin/env bash
set -euo pipefail

k6 run ops/scripts/k6_smoke.js
