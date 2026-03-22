#!/bin/bash
# Inject Google Analytics + Cloudflare Web Analytics into all 33 BlackRoad-OS-Inc repos
# Usage: ./inject-all-analytics.sh
# Requires: gh CLI authenticated, git
set -e

# ══════════════════════════════════════════════════════════════
# ANALYTICS CONFIGURATION
# ══════════════════════════════════════════════════════════════

# Google Analytics 4 — Measurement ID
# Create at: https://analytics.google.com → Admin → Data Streams → Web
GA_ID="G-XXXXXXXXXX"  # REPLACE with real GA4 measurement ID

# Cloudflare Web Analytics — one token per apex domain
# Create at: https://dash.cloudflare.com/?to=/:account/web-analytics → Add a site
# Since domains share apex domains, we only need tokens per apex:
declare -A CF_TOKENS=(
  ["blackroad.company"]="REPLACE_TOKEN"
  ["blackroad.io"]="REPLACE_TOKEN"
  ["blackroad.me"]="REPLACE_TOKEN"
  ["blackroad.network"]="REPLACE_TOKEN"
  ["blackroad.systems"]="REPLACE_TOKEN"
  ["blackroadai.com"]="REPLACE_TOKEN"
  ["blackroadinc.us"]="REPLACE_TOKEN"
  ["blackroadqi.com"]="REPLACE_TOKEN"
  ["blackroadquantum.com"]="REPLACE_TOKEN"   # covers .info .net .shop .store
  ["blackroadquantum.info"]="REPLACE_TOKEN"
  ["blackroadquantum.net"]="REPLACE_TOKEN"
  ["blackroadquantum.shop"]="REPLACE_TOKEN"
  ["blackroadquantum.store"]="REPLACE_TOKEN"
  ["lucidia.earth"]="REPLACE_TOKEN"
  ["lucidia.studio"]="REPLACE_TOKEN"
  ["lucidiaqi.com"]="REPLACE_TOKEN"
  ["roadchain.io"]="REPLACE_TOKEN"
  ["roadcoin.io"]="REPLACE_TOKEN"
  ["blackboxprogramming.io"]="REPLACE_TOKEN"
)

# Default CF token for org repos (not domain-specific)
CF_DEFAULT_TOKEN="REPLACE_TOKEN"

# ══════════════════════════════════════════════════════════════
# REPO LISTS
# ══════════════════════════════════════════════════════════════

ORG_REPOS=(
  BlackRoad-OS BlackRoad-Studio BlackRoad-Archive BlackRoad-Interactive
  BlackRoad-Security BlackRoad-Gov BlackRoad-Education BlackRoad-Hardware
  BlackRoad-Media BlackRoad-Foundation BlackRoad-Ventures BlackRoad-Cloud
  BlackRoad-Labs BlackRoad-AI
)

DOMAIN_REPOS=(
  blackroad.company blackroad.io blackroad.me blackroad.network
  blackroad.systems blackroadai.com blackroadinc.us blackroadqi.com
  blackroadquantum.com blackroadquantum.info blackroadquantum.net
  blackroadquantum.shop blackroadquantum.store lucidia.earth
  lucidia.studio lucidiaqi.com roadchain.io roadcoin.io
  blackboxprogramming.io
)

# ══════════════════════════════════════════════════════════════
# ANALYTICS SNIPPETS
# ══════════════════════════════════════════════════════════════

ga_snippet() {
  cat << EOF
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}');
</script>
EOF
}

cf_snippet() {
  local token="$1"
  cat << EOF
<!-- Cloudflare Web Analytics -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${token}"}'></script>
EOF
}

# ══════════════════════════════════════════════════════════════
# INJECTION FUNCTION
# ══════════════════════════════════════════════════════════════

inject_repo() {
  local repo="$1"
  local cf_token="$2"

  echo "=== Injecting analytics: $repo ==="

  TMPDIR=$(mktemp -d)
  cd "$TMPDIR"

  git clone --depth 1 "https://github.com/BlackRoad-OS-Inc/${repo}.git" repo 2>/dev/null
  cd repo
  git config user.email "alexa@blackroad.io"
  git config user.name "BlackRoad OS"

  if [ ! -f index.html ]; then
    echo "  SKIP: no index.html"
    cd /tmp && rm -rf "$TMPDIR"
    return
  fi

  # Check if already injected
  if grep -q 'googletagmanager\|gtag' index.html 2>/dev/null; then
    echo "  SKIP: GA already present"
    cd /tmp && rm -rf "$TMPDIR"
    return
  fi

  # Build the analytics block
  ANALYTICS_BLOCK=""

  # Add GA4
  ANALYTICS_BLOCK+="<!-- Google Analytics 4 -->"$'\n'
  ANALYTICS_BLOCK+="<script async src=\"https://www.googletagmanager.com/gtag/js?id=${GA_ID}\"></script>"$'\n'
  ANALYTICS_BLOCK+="<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>"$'\n'

  # Add CF Web Analytics
  ANALYTICS_BLOCK+="<!-- Cloudflare Web Analytics -->"$'\n'
  ANALYTICS_BLOCK+="<script defer src=\"https://static.cloudflareinsights.com/beacon.min.js\" data-cf-beacon='{\"token\":\"${cf_token}\"}'></script>"$'\n'

  # Inject before </head> (GA) or before </body> (CF beacon)
  # We'll put everything before </body> for simplicity
  if grep -q '</body>' index.html; then
    sed -i '' "s|</body>|${ANALYTICS_BLOCK}</body>|" index.html
    echo "  + Injected GA4 + CF Web Analytics"
  elif grep -q '</html>' index.html; then
    sed -i '' "s|</html>|${ANALYTICS_BLOCK}</html>|" index.html
    echo "  + Injected GA4 + CF Web Analytics (before </html>)"
  else
    # Append to end
    echo "$ANALYTICS_BLOCK" >> index.html
    echo "  + Appended GA4 + CF Web Analytics"
  fi

  # Commit and push
  git add -A
  git commit -m "Add Google Analytics 4 + Cloudflare Web Analytics

GA4: ${GA_ID}
CF Web Analytics: beacon token injected
Both privacy-respecting, no cookies required for CF.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" 2>/dev/null || echo "  (no changes)"

  git push origin main 2>&1 | tail -1 || echo "  PUSH FAILED"

  cd /tmp && rm -rf "$TMPDIR"
  echo "  DONE: $repo"
}

# ══════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BlackRoad Analytics Injection — 33 Repos                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "GA4 ID: ${GA_ID}"
echo ""

# Org repos (use default CF token)
for repo in "${ORG_REPOS[@]}"; do
  inject_repo "$repo" "$CF_DEFAULT_TOKEN"
done

# Domain repos (use domain-specific CF token)
for repo in "${DOMAIN_REPOS[@]}"; do
  token="${CF_TOKENS[$repo]:-$CF_DEFAULT_TOKEN}"
  inject_repo "$repo" "$token"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "  Analytics injection complete!"
echo "  Next: Replace REPLACE_TOKEN with real tokens"
echo "  GA4: https://analytics.google.com"
echo "  CF:  https://dash.cloudflare.com → Web Analytics"
echo "═══════════════════════════════════════════════"
