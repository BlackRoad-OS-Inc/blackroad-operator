#!/bin/bash
set -euo pipefail

# Cleanup Merged Branches Script
# This script removes local and remote branches that have been merged

echo "🧹 Starting branch cleanup..."

# Fetch latest from origin and prune deleted remote branches
echo "📡 Fetching from origin and pruning..."
git fetch origin --prune

# Get the default branch (main or master)
DEFAULT_BRANCH=$(git remote show origin | grep 'HEAD branch' | cut -d' ' -f5)
echo "📍 Default branch: $DEFAULT_BRANCH"

# Ensure we're not on a branch we're about to delete
if [[ $(git branch --show-current) != "$DEFAULT_BRANCH" ]] && [[ $(git branch --show-current) != "claude/okay-cece-i-011CUyKGfB6QAMm9pYujCT2F" ]]; then
  echo "⚠️  Switching to $DEFAULT_BRANCH to safely delete branches..."
  git checkout "$DEFAULT_BRANCH" 2>/dev/null || git checkout -b "$DEFAULT_BRANCH" "origin/$DEFAULT_BRANCH"
fi

# Count branches before cleanup
REMOTE_COUNT=$(git branch -r | wc -l)
LOCAL_COUNT=$(git branch | wc -l)
echo "📊 Before cleanup: $LOCAL_COUNT local branches, $REMOTE_COUNT remote branches"

# Delete local branches that have been merged into default branch
echo ""
echo "🗑️  Deleting merged local branches..."
DELETED_LOCAL=0
git branch --merged "$DEFAULT_BRANCH" | grep -v "^\*" | grep -v "$DEFAULT_BRANCH" | grep -v "claude/okay-cece-i-011CUyKGfB6QAMm9pYujCT2F" | while read -r branch; do
  echo "  Deleting local: $branch"
  git branch -d "$branch" 2>/dev/null || true
  ((DELETED_LOCAL++)) || true
done

# Delete remote merged bot branches (claude, codex, copilot, dependabot)
echo ""
echo "🌐 Deleting merged remote bot branches..."
DELETED_REMOTE=0

# Get list of merged remote branches
git branch -r --merged "$DEFAULT_BRANCH" | \
  grep -E "origin/(claude|codex|copilot|dependabot)" | \
  grep -v "origin/$DEFAULT_BRANCH" | \
  grep -v "origin/claude/okay-cece-i-011CUyKGfB6QAMm9pYujCT2F" | \
  sed 's/origin\///' | \
  while read -r branch; do
    echo "  Deleting remote: $branch"
    git push origin --delete "$branch" 2>/dev/null || echo "    ⚠️  Failed to delete $branch (may already be deleted)"
    ((DELETED_REMOTE++)) || true
  done

# Final count
echo ""
echo "✅ Cleanup complete!"
echo "📊 Deleted approximately: local branches and remote branches"
echo ""
echo "💡 To see remaining branches:"
echo "   Local:  git branch"
echo "   Remote: git branch -r"
