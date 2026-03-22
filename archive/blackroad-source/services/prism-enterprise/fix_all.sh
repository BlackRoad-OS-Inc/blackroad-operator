#!/usr/bin/env bash
set -euo pipefail
echo "==> Node: lint & fix"
pnpm -v >/dev/null 2>&1 || npm i -g pnpm
pnpm install --ignore-scripts || npm install
pnpm dlx prettier -w .
pnpm dlx eslint . --ext .ts,.tsx,.js --fix || true

echo "==> Python: format & static checks"
pipx install ruff black || true
ruff check . --fix || true
black . || true

echo "==> Markdown/YAML: normalize"
pnpm dlx markdownlint-cli2 --fix '**/*.md' || true
pnpm dlx prettier -w "**/*.{yml,yaml,md,json}"

echo "==> Go (if present)"
command -v go >/dev/null && go fmt ./... || true

echo "==> Commit"
git add -A
git commit -m "chore: repo-wide format & lint autofix"
