#!/usr/bin/env bash
CF_TOKEN="yP5h0HvsXX0BpHLs01tLmgtTbQurIKPL4YnQfIwy"
GEMATRIA="159.65.43.12"

declare -A ZONES
ZONES=(
  ["blackroad.io"]="d6566eba4500b460ffec6650d3b4baf6"
  ["blackroad.company"]="f654e077612d3d240f96300b7c0c6cae"
  ["blackroad.me"]="622395674d479bad0a7d3790722c14be"
  ["blackroad.network"]="fae5a76a78154e0509bede2e3eba8124"
  ["blackroad.systems"]="13293825c2b0491085cbece9fc02e401"
  ["blackroadai.com"]="590afe2b9b2ae222e77d89c10b7412d3"
  ["blackroadinc.us"]="decb1bf816ff29197d88751228ad0017"
  ["blackroadqi.com"]="e24dbdfd8868183e4093b8cdba709240"
  ["blackroadquantum.com"]="1c93ece77e64728f506d635f5b58c60a"
  ["blackroadquantum.info"]="9855ce5bf6602150ea9195f3cd975d3e"
  ["blackroadquantum.net"]="7d606471c0feab151c8ad493fd8a5c8e"
  ["blackroadquantum.shop"]="b842746ff2e811c1be959e5a843b25e6"
  ["blackroadquantum.store"]="498fef62d7a9812e69413e7451edf3b1"
  ["lucidia.earth"]="a91af33930bb9b9ddfa0cf12c0232460"
  ["lucidia.studio"]="43edda4c64475e5d81934ec7f64f6801"
  ["lucidiaqi.com"]="8a787536b6dd285bdf06dde65e96e8c0"
  ["roadchain.io"]="86d82685f669fe45d0ee6d24ef21b255"
  ["roadcoin.io"]="111d9214d54a282b1e889fa3d1e2faa8"
  ["blackboxprogramming.io"]="6e27d41cb2d27cd8f2f26e95608d3899"
)

create_record() {
  local zone_id="$1" name="$2" type="$3" content="$4" proxied="$5"
  local result
  result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"$type\",\"name\":\"$name\",\"content\":\"$content\",\"proxied\":$proxied,\"ttl\":1}" 2>/dev/null)

  if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
    echo "  + $name -> $content"
  else
    local err
    err=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','unknown'))" 2>/dev/null)
    if echo "$err" | grep -qi "already exists"; then
      echo "  = $name (exists)"
    else
      echo "  ! $name FAILED: $err"
    fi
  fi
}

add_subs() {
  local domain="$1"
  shift
  local zone_id="${ZONES[$domain]}"
  echo ""
  echo "=== $domain (${#} subdomains) ==="
  for sub in "$@"; do
    create_record "$zone_id" "$sub.$domain" "A" "$GEMATRIA" "true"
  done
}

echo "Creating 126 subdomains across 19 domains..."
echo "Target: $GEMATRIA (Gematria) via CF proxy"

# blackroad.io — 20 subdomains
add_subs "blackroad.io" \
  app api os prism docs chat search auth pay status \
  mail hq roundtrip git cdn images code start dash queue

# blackroadai.com — 10 subdomains
add_subs "blackroadai.com" \
  models inference rag train agents skills ollama deepseek qwen vllm

# blackroad.network — 9 subdomains
add_subs "blackroad.network" \
  mesh dns vpn nats nodes edge tor ipfs wire

# blackboxprogramming.io — 8 subdomains
add_subs "blackboxprogramming.io" \
  code roadcode api deploy review registry ci automation

# blackroad.company — 7 subdomains
add_subs "blackroad.company" \
  ir board hr legal careers press brand

# blackroad.systems — 7 subdomains
add_subs "blackroad.systems" \
  fleet grafana alerts logs health power uptime

# roadchain.io — 7 subdomains
add_subs "roadchain.io" \
  explorer wallet bridge contracts did api testnet

# lucidia.earth — 6 subdomains
add_subs "lucidia.earth" \
  agents workspace terminal 3d command models

# roadcoin.io — 6 subdomains
add_subs "roadcoin.io" \
  wallet exchange faucet stake docs market

# blackroad.me — 5 subdomains
add_subs "blackroad.me" \
  profile id vault keys sso

# lucidia.studio — 5 subdomains
add_subs "lucidia.studio" \
  video canvas writing templates assets

# blackroadquantum.net — 5 subdomains
add_subs "blackroadquantum.net" \
  blackbox onion mesh audit siem

# blackroadqi.com — 4 subdomains
add_subs "blackroadqi.com" \
  math prover sim trinary

# blackroadquantum.com — 4 subdomains
add_subs "blackroadquantum.com" \
  lab circuit docs api

# blackroadinc.us — 4 subdomains
add_subs "blackroadinc.us" \
  stripe taxes compliance formation

# blackroadquantum.shop — 4 subdomains
add_subs "blackroadquantum.shop" \
  store kits parts cart

# blackroadquantum.store — 4 subdomains
add_subs "blackroadquantum.store" \
  models datasets licenses support

# lucidiaqi.com — 3 subdomains
add_subs "lucidiaqi.com" \
  agents router decision

# blackroadquantum.info — 3 subdomains
add_subs "blackroadquantum.info" \
  papers wiki data

echo ""
echo "Done! All subdomains created."
