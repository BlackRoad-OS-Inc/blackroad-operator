#!/usr/bin/env bash

set -euo pipefail

# Branch Cleanup Script
# Deletes merged branches from the remote repository and (optionally) from the
# local checkout. When invoked from CI set AUTO_APPROVE=true and provide an
# auth token (via GH_TOKEN or GITHUB_TOKEN) capable of deleting remote
# branches.

REMOTE=${REMOTE:-origin}
REMOTE_BASE_BRANCH=${REMOTE_BASE_BRANCH:-${BASE_BRANCH:-${REMOTE}/main}}
LOCAL_BASE_BRANCH=${LOCAL_BASE_BRANCH:-main}
PROTECTED_BRANCHES=${PROTECTED_BRANCHES:-"main staging production develop release/*"}
AUTO_APPROVE=${AUTO_APPROVE:-${CI:-false}}
DELETE_REMOTE=${DELETE_REMOTE:-true}
DELETE_LOCAL=${DELETE_LOCAL:-false}
DRY_RUN=${DRY_RUN:-false}

usage() {
  cat <<'USAGE'
Usage: cleanup-dead-branches.sh [options]

Options:
  --remote-only        Delete merged branches from the remote (default)
  --local-only         Delete merged branches from the local checkout
  --local              Delete merged branches both locally and remotely
  --remote-base <ref>  Base ref used to detect merged remote branches
  --local-base <ref>   Base ref used to detect merged local branches
  --dry-run            List candidate branches without deleting them
  --auto-approve       Skip interactive confirmation prompts
  -h, --help           Show this help message

Environment variables:
  REMOTE                Remote name (default: origin)
  PROTECTED_BRANCHES    Space-separated list of patterns to keep
  AUTO_APPROVE          Set to "true" to bypass prompts
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote-only)
      DELETE_REMOTE=true
      DELETE_LOCAL=false
      ;;
    --local-only)
      DELETE_REMOTE=false
      DELETE_LOCAL=true
      ;;
    --local)
      DELETE_REMOTE=true
      DELETE_LOCAL=true
      ;;
    --remote-base)
      shift
      if [ $# -eq 0 ]; then
        echo "Missing value for --remote-base" >&2
        exit 1
      fi
      REMOTE_BASE_BRANCH=$1
      ;;
    --local-base)
      shift
      if [ $# -eq 0 ]; then
        echo "Missing value for --local-base" >&2
        exit 1
      fi
      LOCAL_BASE_BRANCH=$1
      ;;
    --dry-run)
      DRY_RUN=true
      ;;
    --auto-approve)
      AUTO_APPROVE=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

confirm_deletion() {
  local scope=$1
  local count=$2

  if [ "$DRY_RUN" = true ]; then
    echo "Dry run enabled; not deleting $scope branches."
    return 1
  fi

  if [ "$AUTO_APPROVE" = true ]; then
    echo "AUTO_APPROVE enabled; deleting $count $scope branches."
    return 0
  fi

  echo "WARNING: This action cannot be undone!"
  read -rp "Delete the listed $scope branches? (yes/no): " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Skipping deletion of $scope branches."
    return 1
  fi

  return 0
}

filter_protected() {
  local branch
  for branch in "$@"; do
    [ -z "$branch" ] && continue
    [ "$branch" = "HEAD" ] && continue

    local skip=false
    local pattern
    for pattern in $PROTECTED_BRANCHES; do
      if [[ $branch == $pattern ]]; then
        skip=true
        break
      fi
    done

    if [ "$skip" = false ]; then
      printf '%s\n' "$branch"
    fi
  done
}

delete_remote_branches() {
  echo "Remote: $REMOTE"
  echo "Base for remote merge detection: $REMOTE_BASE_BRANCH"

  git fetch "$REMOTE" --prune

  if ! git rev-parse --verify "$REMOTE_BASE_BRANCH" >/dev/null 2>&1; then
    echo "Base branch $REMOTE_BASE_BRANCH not found; skipping remote cleanup." >&2
    return
  fi

  mapfile -t branches < <(
    git for-each-ref --format='%(refname:strip=2)' "refs/remotes/${REMOTE}" \
      --merged "$REMOTE_BASE_BRANCH" | sed "s#^${REMOTE}/##" | sort -u
  )

  mapfile -t filtered < <(filter_protected "${branches[@]}")

  local count=${#filtered[@]}

  if [ "$count" -eq 0 ]; then
    echo "No merged remote branches to delete." >&2
    return
  fi

  echo "Identified $count merged remote branches eligible for deletion:"
  printf '  %s\n' "${filtered[@]}"

  if ! confirm_deletion remote "$count"; then
    return
  fi

  echo ""
  echo "Starting remote branch deletion..."
  echo ""

  local deleted=0
  local failed=0

  for branch in "${filtered[@]}"; do
    echo "Deleting remote branch: $branch"
    if git push "$REMOTE" --delete "$branch" >/dev/null 2>&1; then
      ((deleted++))
    else
      ((failed++))
      echo "  Failed to delete remote branch: $branch" >&2
    fi
  done

  echo ""
  echo "Remote cleanup complete."
  echo "Successfully deleted: $deleted branches"
  echo "Failed: $failed branches"

  if [ "$failed" -gt 0 ]; then
    return 1
  fi
}

delete_local_branches() {
  echo "Local base for merge detection: $LOCAL_BASE_BRANCH"

  if ! git rev-parse --verify "$LOCAL_BASE_BRANCH" >/dev/null 2>&1; then
    echo "Local base branch $LOCAL_BASE_BRANCH not found; skipping local cleanup." >&2
    return
  fi

  mapfile -t branches < <(
    git for-each-ref --format='%(refname:strip=2)' refs/heads \
      --merged "$LOCAL_BASE_BRANCH" | sort -u
  )

  mapfile -t filtered < <(filter_protected "${branches[@]}")

  local count=${#filtered[@]}

  if [ "$count" -eq 0 ]; then
    echo "No merged local branches to delete." >&2
    return
  fi

  echo "Identified $count merged local branches eligible for deletion:"
  printf '  %s\n' "${filtered[@]}"

  if ! confirm_deletion local "$count"; then
    return
  fi

  echo ""
  echo "Starting local branch deletion..."
  echo ""

  local deleted=0
  local failed=0

  for branch in "${filtered[@]}"; do
    echo "Deleting local branch: $branch"
    if git branch -d "$branch" >/dev/null 2>&1; then
      ((deleted++))
    else
      ((failed++))
      echo "  Failed to delete local branch: $branch" >&2
    fi
  done

  echo ""
  echo "Local cleanup complete."
  echo "Successfully deleted: $deleted branches"
  echo "Failed: $failed branches"

  if [ "$failed" -gt 0 ]; then
    return 1
  fi
}

echo "=== Dead Branch Cleanup Script ==="

echo "Remote cleanup enabled: $DELETE_REMOTE"
echo "Local cleanup enabled: $DELETE_LOCAL"
echo "Dry run: $DRY_RUN"

delete_status=0

if [ "$DELETE_REMOTE" = true ]; then
  delete_remote_branches || delete_status=$?
else
  echo "Remote cleanup disabled."
fi

if [ "$DELETE_LOCAL" = true ]; then
  delete_local_branches || delete_status=$?
else
  echo "Local cleanup disabled."
fi

exit $delete_status
