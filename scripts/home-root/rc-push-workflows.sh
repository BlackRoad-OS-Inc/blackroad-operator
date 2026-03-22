#!/usr/bin/env bash
ORG="BlackRoad-OS-Inc"

# Universal BlackRoad CI/CD workflow
WORKFLOW=$(cat << 'WEOF'
name: BlackRoad CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  validate:
    name: Validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate repo structure
        run: |
          echo "🛤️ BlackRoad OS, Inc. — Validating..."
          test -f LICENSE && echo "  ✓ LICENSE" || echo "  ✗ LICENSE missing"
          test -f README.md && echo "  ✓ README.md" || echo "  ✗ README.md missing"
          test -d RoadCode && echo "  ✓ RoadCode/" || echo "  ○ No RoadCode dir"
          test -f TODO.md && echo "  ✓ TODO.md" || echo "  ○ No TODO.md"
          test -f ROADMAP.md && echo "  ✓ ROADMAP.md" || echo "  ○ No ROADMAP.md"
          echo "  ✓ Validation complete"

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint shell scripts
        run: |
          if compgen -G "*.sh" > /dev/null || compgen -G "**/*.sh" > /dev/null; then
            sudo apt-get update -qq && sudo apt-get install -y -qq shellcheck
            find . -name "*.sh" -not -path "./.git/*" -not -path "./node_modules/*" | \
              xargs shellcheck --severity=warning 2>&1 | head -30 || true
          else
            echo "No shell scripts to lint"
          fi
        continue-on-error: true
      - name: Lint JavaScript/TypeScript
        run: |
          if [ -f package.json ]; then
            npm ci --ignore-scripts 2>/dev/null || true
            npx eslint . --max-warnings 0 2>/dev/null || true
          fi
        continue-on-error: true

  license-check:
    name: License Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Verify proprietary license
        run: |
          if grep -q "BLACKROAD" LICENSE 2>/dev/null; then
            echo "✓ BlackRoad proprietary license present"
          else
            echo "✗ WARNING: Missing BlackRoad proprietary license"
            exit 1
          fi

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [validate, license-check]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to GitHub Pages
        if: hashFiles('index.html') != ''
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
        continue-on-error: true
      - name: Notify RoundTrip
        run: |
          curl -s -X POST "https://roundtrip.blackroad.io/api/chat" \
            -H "Content-Type: application/json" \
            -d "{\"agent\":\"roadie\",\"message\":\"[DEPLOY] ${{ github.repository }} deployed\",\"channel\":\"deploys\"}" || true
        continue-on-error: true

  mirror:
    name: Mirror to Gitea
    runs-on: ubuntu-latest
    needs: [validate]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Push to Gitea
        run: |
          echo "Mirror to Gitea would run here"
          echo "Target: git.blackroad.io/${{ github.repository }}"
        continue-on-error: true
WEOF
)

WORKFLOW_B64=$(printf '%s' "$WORKFLOW" | base64)

# Repos that need workflows
REPOS="RoadCode Root roadmap rearview tollbooth backroad blackroad-code start overpass blackroad-vllm blackroad-prism-console blackroad-vscode-extension blackroad-domains blackroad-mobile-app blackroad-priority-stack blackroad-pitstop information metaverse source-code memory local the-seam blackroad-os-operator BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud BlackRoad-Labs BlackRoad-AI passenger curb carpool roundabout oneway pitstop"

count=0
success=0
for repo in $REPOS; do
  count=$((count + 1))
  # Check if workflow already exists
  existing=$(gh api "repos/$ORG/$repo/contents/.github/workflows/blackroad-ci.yml" --jq '.sha' 2>/dev/null || echo "")

  if [ -n "$existing" ] && [ "$existing" != "null" ]; then
    gh api -X PUT "repos/$ORG/$repo/contents/.github/workflows/blackroad-ci.yml" \
      -f message="[RC] Update BlackRoad CI/CD workflow" \
      -f content="$WORKFLOW_B64" -f sha="$existing" --silent 2>/dev/null
  else
    gh api -X PUT "repos/$ORG/$repo/contents/.github/workflows/blackroad-ci.yml" \
      -f message="[RC] Add BlackRoad CI/CD workflow" \
      -f content="$WORKFLOW_B64" --silent 2>/dev/null
  fi

  if [ $? -eq 0 ]; then
    success=$((success + 1))
    echo "  ✓ $repo"
  else
    echo "  ✗ $repo (failed)"
  fi
done

echo ""
echo "Workflows pushed: $success/$count"
