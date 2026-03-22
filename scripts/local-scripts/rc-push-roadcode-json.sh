#!/usr/bin/env bash
ORG="BlackRoad-OS-Inc"

push_json() {
  local repo="$1" content="$2"
  local encoded sha
  encoded=$(printf '%s' "$content" | base64)
  sha=$(gh api "repos/$ORG/$repo/contents/RoadCode/roadcode.json" --jq '.sha' 2>/dev/null || echo "")
  if [ -n "$sha" ] && [ "$sha" != "null" ]; then
    gh api -X PUT "repos/$ORG/$repo/contents/RoadCode/roadcode.json" \
      -f message="[RC] Add roadcode.json config" -f content="$encoded" -f sha="$sha" --silent 2>/dev/null
  else
    gh api -X PUT "repos/$ORG/$repo/contents/RoadCode/roadcode.json" \
      -f message="[RC] Add roadcode.json config" -f content="$encoded" --silent 2>/dev/null
  fi
}

declare -A CATS
CATS=(
  ["blackroad.company"]="corporate"
  ["blackroad.io"]="platform"
  ["blackroad.me"]="identity"
  ["blackroad.network"]="infrastructure"
  ["blackroad.systems"]="monitoring"
  ["blackroadai.com"]="ai"
  ["blackroadinc.us"]="corporate-us"
  ["blackroadqi.com"]="quantum"
  ["blackroadquantum.com"]="quantum"
  ["blackroadquantum.info"]="research"
  ["blackroadquantum.net"]="security"
  ["blackroadquantum.shop"]="commerce"
  ["blackroadquantum.store"]="store"
  ["lucidia.earth"]="agents"
  ["lucidia.studio"]="creative"
  ["lucidiaqi.com"]="quantum-ai"
  ["roadchain.io"]="blockchain"
  ["roadcoin.io"]="crypto"
  ["blackboxprogramming.io"]="devtools"
)

declare -A TITLES
TITLES=(
  ["blackroad.company"]="BlackRoad Company"
  ["blackroad.io"]="BlackRoad IO"
  ["blackroad.me"]="BlackRoad Me"
  ["blackroad.network"]="BlackRoad Network"
  ["blackroad.systems"]="BlackRoad Systems"
  ["blackroadai.com"]="BlackRoad AI"
  ["blackroadinc.us"]="BlackRoad Inc"
  ["blackroadqi.com"]="BlackRoad QI"
  ["blackroadquantum.com"]="BlackRoad Quantum"
  ["blackroadquantum.info"]="BlackRoad Quantum Info"
  ["blackroadquantum.net"]="BlackRoad Quantum Net"
  ["blackroadquantum.shop"]="BlackRoad Quantum Shop"
  ["blackroadquantum.store"]="BlackRoad Quantum Store"
  ["lucidia.earth"]="Lucidia Earth"
  ["lucidia.studio"]="Lucidia Studio"
  ["lucidiaqi.com"]="Lucidia QI"
  ["roadchain.io"]="RoadChain"
  ["roadcoin.io"]="RoadCoin"
  ["blackboxprogramming.io"]="BlackBox Programming"
)

count=0
for domain in "${!CATS[@]}"; do
  count=$((count + 1))
  cat="${CATS[$domain]}"
  title="${TITLES[$domain]}"
  json="{
  \"name\": \"$domain\",
  \"org\": \"$ORG\",
  \"category\": \"$cat\",
  \"title\": \"$title\",
  \"deploy\": {
    \"target\": \"gematria\",
    \"path\": \"/var/www/blackroad/$domain\",
    \"ssl\": \"auto\",
    \"cdn\": true
  },
  \"mirrors\": {
    \"gitea\": \"https://git.blackroad.io/$ORG/$domain\",
    \"github\": \"https://github.com/$ORG/$domain\"
  },
  \"ci\": {
    \"on_push\": [\"build\", \"deploy\"],
    \"on_pr\": [\"lint\", \"audit\"]
  },
  \"monitoring\": {
    \"uptime\": true,
    \"analytics\": \"roadanalytics\",
    \"alerts\": \"nats\"
  }
}"
  echo "[$count/19] $domain"
  push_json "$domain" "$json" && echo "  roadcode.json pushed" || echo "  FAILED"
done
echo "Done!"
