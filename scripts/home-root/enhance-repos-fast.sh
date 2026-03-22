#!/bin/bash
# Fast repo enhancement — batch process via GitHub API
# Usage: ./enhance-repos-fast.sh ORG_NAME

set -e
ORG="${1:?Usage: $0 ORG_NAME}"
ENHANCED=0; SKIPPED=0; FAILED=0

G='\033[38;5;82m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[38;5;69m'; P='\033[38;5;205m'; N='\033[0m'

LICENSE_B64=$(printf 'Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.\n\nThis software is proprietary and confidential.\nUnauthorized copying, distribution, or use is strictly prohibited.\n\nFor testing and non-commercial use only.\nPublicly visible but legally protected.\n\nBlackRoad OS — Pave Tomorrow.' | base64 | tr -d '\n')

GITIGNORE_B64=$(printf 'node_modules/\ndist/\n.env\n.env.local\n*.log\n.DS_Store\n.wrangler/\ncoverage/\n.next/\n.turbo/\n' | base64 | tr -d '\n')

echo -e "${P}━━━ $ORG ━━━${N}"

# Get all non-fork non-archived repos with content info in ONE call
repos=$(gh api "orgs/$ORG/repos?per_page=100&type=sources" --paginate --jq '.[] | select(.archived == false) | "\(.name)|\(.description // "")|\(.default_branch)|\(.topics | join(","))"' 2>/dev/null || \
  gh repo list "$ORG" --limit 200 --json name,description,defaultBranchRef,isArchived,isFork --jq '.[] | select(.isArchived == false and .isFork == false) | "\(.name)|\(.description // "")|\(.defaultBranchRef.name)|\("")"' 2>/dev/null)

total=$(echo "$repos" | grep -c '|' || echo 0)
echo -e "${C}Found $total repos${N}"
count=0

while IFS='|' read -r name desc branch topics; do
  [ -z "$name" ] && continue
  count=$((count + 1))
  [ -z "$branch" ] && branch="main"

  # Check what's missing via tree API (1 call instead of 4)
  tree=$(gh api "repos/$ORG/$name/git/trees/$branch" --jq '[.tree[].path]' 2>/dev/null || echo "[]")

  has_readme=$(echo "$tree" | grep -q '"README.md"' && echo y || echo n)
  has_license=$(echo "$tree" | grep -q '"LICENSE"' && echo y || echo n)
  has_gitignore=$(echo "$tree" | grep -q '".gitignore"' && echo y || echo n)
  has_topics=$([[ -n "$topics" ]] && echo y || echo n)
  has_desc=$([[ -n "$desc" ]] && echo y || echo n)

  missing=""
  [ "$has_readme" = "n" ] && missing="${missing}README "
  [ "$has_license" = "n" ] && missing="${missing}LICENSE "
  [ "$has_gitignore" = "n" ] && missing="${missing}.gitignore "
  [ "$has_topics" = "n" ] && missing="${missing}topics "
  [ "$has_desc" = "n" ] && missing="${missing}desc "

  if [ -z "$missing" ]; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo -e "  ${Y}[$count/$total]${N} $name — fix: $missing"

  # Apply fixes
  if [ "$has_license" = "n" ]; then
    gh api -X PUT "repos/$ORG/$name/contents/LICENSE" \
      -f message="chore: add proprietary license" \
      -f content="$LICENSE_B64" \
      -f branch="$branch" --silent 2>/dev/null && echo -e "    ${G}+LICENSE${N}" || echo -e "    ${R}!LICENSE${N}"
  fi

  if [ "$has_gitignore" = "n" ]; then
    gh api -X PUT "repos/$ORG/$name/contents/.gitignore" \
      -f message="chore: add .gitignore" \
      -f content="$GITIGNORE_B64" \
      -f branch="$branch" --silent 2>/dev/null && echo -e "    ${G}+.gitignore${N}" || echo -e "    ${R}!.gitignore${N}"
  fi

  if [ "$has_desc" = "n" ]; then
    auto_desc="BlackRoad OS — ${name//-/ }"
    gh repo edit "$ORG/$name" --description "$auto_desc" 2>/dev/null && echo -e "    ${G}+desc${N}" || true
  fi

  if [ "$has_topics" = "n" ]; then
    gh api -X PUT "repos/$ORG/$name/topics" --input - <<< '{"names":["blackroad-os","edge-ai","local-ai"]}' --silent 2>/dev/null && echo -e "    ${G}+topics${N}" || true
  fi

  ENHANCED=$((ENHANCED + 1))
  sleep 1
done <<< "$repos"

echo -e "${P}Done: ${G}$ENHANCED enhanced${N} | ${Y}$SKIPPED ok${N} | ${R}$FAILED failed${N} / $total total"
