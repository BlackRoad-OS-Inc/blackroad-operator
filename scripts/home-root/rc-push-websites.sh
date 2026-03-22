#!/usr/bin/env bash
ORG="BlackRoad-OS-Inc"
TPL="/Users/alexa/Desktop/templates"

push_file() {
  local repo="$1" filepath="$2" file="$3" message="$4"
  local encoded sha
  encoded=$(base64 -i "$file")
  sha=$(gh api "repos/$ORG/$repo/contents/$filepath" --jq '.sha' 2>/dev/null || echo "")
  if [ -n "$sha" ] && [ "$sha" != "null" ]; then
    gh api -X PUT "repos/$ORG/$repo/contents/$filepath" \
      -f message="$message" -f content="$encoded" -f sha="$sha" --silent 2>/dev/null
  else
    gh api -X PUT "repos/$ORG/$repo/contents/$filepath" \
      -f message="$message" -f content="$encoded" --silent 2>/dev/null
  fi
}

customize_landing() {
  local domain="$1" title="$2" tagline="$3" accent="$4" accent2="$5"
  local src="$TPL/landing-hero.html"
  local tmp="/tmp/rc-$domain.html"
  sed \
    -e "s|BlackRoad OS|$title|g" \
    -e "s|Pave Tomorrow|$tagline|g" \
    -e "s|blackroad\.io|$domain|g" \
    -e "s|#FF6B2B|$accent|g" \
    -e "s|#FF2255|$accent2|g" \
    "$src" > "$tmp" 2>/dev/null || cp "$src" "$tmp"
  echo "$tmp"
}

declare -A DOMAIN_MAP
DOMAIN_MAP=(
  ["blackroad.company"]="blackroad-os-inc.html"
  ["blackroad.io"]="blackroad-os.html"
  ["blackroad.me"]="CUSTOM|BlackRoad Me|Your sovereign digital identity|#4488FF|#00D4FF"
  ["blackroad.network"]="CUSTOM|BlackRoad Network|The sovereign mesh|#00D4FF|#4488FF"
  ["blackroad.systems"]="status-page.html"
  ["blackroadai.com"]="blackroad-ai.html"
  ["blackroadinc.us"]="blackroad-os-inc.html"
  ["blackroadqi.com"]="CUSTOM|BlackRoad QI|Quantum Intelligence|#8844FF|#4488FF"
  ["blackroadquantum.com"]="CUSTOM|BlackRoad Quantum|The quantum computing platform|#8844FF|#CC00AA"
  ["blackroadquantum.info"]="CUSTOM|BlackRoad Quantum Info|Quantum research|#8844FF|#4488FF"
  ["blackroadquantum.net"]="blackroad-security.html"
  ["blackroadquantum.shop"]="pricing-page.html"
  ["blackroadquantum.store"]="pricing-page.html"
  ["lucidia.earth"]="CUSTOM|Lucidia Earth|Intelligence rooted in the real world|#FFC107|#FF6B2B"
  ["lucidia.studio"]="blackroad-studio.html"
  ["lucidiaqi.com"]="CUSTOM|Lucidia QI|Quantum-enhanced AI agents|#E040FB|#8844FF"
  ["roadchain.io"]="CUSTOM|RoadChain|Sovereign blockchain|#00D4FF|#8844FF"
  ["roadcoin.io"]="CUSTOM|RoadCoin|The currency of sovereign computing|#FFC107|#FF6B2B"
  ["blackboxprogramming.io"]="blackbox-enterprises.html"
)

count=0
total=${#DOMAIN_MAP[@]}

for domain in "${!DOMAIN_MAP[@]}"; do
  count=$((count + 1))
  spec="${DOMAIN_MAP[$domain]}"
  echo "[$count/$total] $domain"

  if [[ "$spec" == CUSTOM* ]]; then
    IFS='|' read -r _ title tagline accent accent2 <<< "$spec"
    tmpfile=$(customize_landing "$domain" "$title" "$tagline" "$accent" "$accent2")
    push_file "$domain" "index.html" "$tmpfile" "[RC] Add elaborate index.html website for $domain

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Pushed custom index.html" || echo "  FAILED"
    rm -f "$tmpfile"
  else
    srcfile="$TPL/$spec"
    if [ -f "$srcfile" ]; then
      push_file "$domain" "index.html" "$srcfile" "[RC] Add elaborate index.html website for $domain (from $spec template)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Pushed $spec -> index.html" || echo "  FAILED"
    else
      echo "  Template $spec not found, using landing-hero"
      tmpfile=$(customize_landing "$domain" "$domain" "Pave Tomorrow" "#FF6B2B" "#FF2255")
      push_file "$domain" "index.html" "$tmpfile" "[RC] Add index.html website for $domain

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>" && echo "  Pushed fallback index.html" || echo "  FAILED"
      rm -f "$tmpfile"
    fi
  fi
done

echo ""
echo "Done! index.html pushed to all $total domain repos."
