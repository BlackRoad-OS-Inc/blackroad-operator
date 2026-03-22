#!/usr/bin/env bash
set -euo pipefail

# prune merged branches locally and remotely
git fetch origin --prune
DEFAULT_BRANCH=$(git remote show origin | awk '/HEAD branch/ {print $NF}')
git checkout "$DEFAULT_BRANCH"
git pull --rebase
git branch --merged | egrep -v "(^\*|main|master|dev)" | xargs -r git branch -d
git for-each-ref --format='%(refname:short) %(upstream:short)' refs/heads | \
  awk '$2 ~ /origin\/'"$DEFAULT_BRANCH"'/' {print $1}' | xargs -r -I{} git push origin --delete {}
