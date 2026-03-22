#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"

if [ -z "$branch" ]; then
  echo "failed: could not determine git branch"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "failed: missing git remote 'origin'"
  exit 1
fi

if ! git remote get-url gitea >/dev/null 2>&1; then
  echo "failed: missing git remote 'gitea'"
  exit 1
fi

echo "Pushing $branch to GitHub..."
git push origin "$branch"

echo "Pushing $branch to Gitea..."
git push gitea "$branch"

echo "Done."
