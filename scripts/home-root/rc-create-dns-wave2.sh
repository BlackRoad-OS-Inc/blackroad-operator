#!/usr/bin/env bash
CF_TOKEN="yP5h0HvsXX0BpHLs01tLmgtTbQurIKPL4YnQfIwy"
GEMATRIA="159.65.43.12"

declare -A ZONES
ZONES=(
  ["blackroad.io"]="d6566eba4500b460ffec6650d3b4baf6"
  ["blackroad.company"]="f654e077612d3d240f96300b7c0c6cae"
  ["blackroad.me"]="622395674d479bad0a7d3790722c14be"
  ["blackroad.network"]="fae5a76a78154e0509bede2e3eba8124"
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
  local zone_id="$1" name="$2"
  local result
  result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$zone_id/dns_records" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$GEMATRIA\",\"proxied\":true,\"ttl\":1}" 2>/dev/null)
  if echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
    echo "  + $name"
  else
    local err
    err=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('errors',[{}])[0].get('message','?'))" 2>/dev/null)
    if echo "$err" | grep -qi "already exists"; then
      echo "  = $name (exists)"
    else
      echo "  ! $name FAILED: $err"
    fi
  fi
}

add_subs() {
  local domain="$1"; shift
  local zone_id="${ZONES[$domain]}"
  echo ""
  echo "=== $domain (+${#} new) ==="
  for sub in "$@"; do
    create_record "$zone_id" "$sub.$domain"
  done
}

echo "WAVE 2: Adding more subdomains across all domains..."

# blackroad.io — 38 slots, add 30 more (product subdomains)
add_subs "blackroad.io" \
  store shop pricing billing account settings \
  careers jobs team about blog changelog \
  learn tutorials academy roadwork homework \
  create studio canvas video music \
  explore discover map navigate \
  sandbox lab playground dev staging

# blackroad.company — 185 slots, add 40 more
add_subs "blackroad.company" \
  investor pitch deck fundraise cap-table \
  contracts policies bylaws minutes filings \
  accounting finance budget payroll taxes \
  insurance benefits equity stock options \
  partners vendors clients customers referrals \
  ops strategy planning okrs metrics \
  meetings notes wiki knowledge docs \
  compliance audit security governance risk

# blackroad.me — 181 slots, add 25 more
add_subs "blackroad.me" \
  dashboard settings notifications preferences \
  wallet payments subscriptions billing \
  portfolio resume cv work projects \
  social links bio avatar banner \
  privacy security 2fa passkeys recovery \
  api webhooks integrations export

# blackroad.network — 175 slots, add 35 more
add_subs "blackroad.network" \
  monitor dashboard status health ping \
  proxy gateway ingress egress firewall \
  alice cecilia octavia aria lucidia \
  gematria anastasia pi1 pi2 pi3 pi4 pi5 \
  cdn cache storage backup mirror \
  tunnel relay bridge nat router \
  metrics traces logs events

# blackroadai.com — 175 slots, add 40 more
add_subs "blackroadai.com" \
  chat assistant copilot tutor mentor \
  playground sandbox notebook lab experiment \
  hub registry catalog gallery showcase \
  embed search vector semantic graph \
  voice tts stt whisper transcribe \
  vision image video generate diffusion \
  finetune eval benchmark test validate \
  gateway router proxy fleet cluster

# blackroadinc.us — 190 slots, add 30 more
add_subs "blackroadinc.us" \
  board shareholders equity cap-table \
  legal contracts patents trademarks ip \
  accounting payroll invoices receipts \
  banking treasury wire ach \
  insurance benefits 401k health dental \
  office space mail courier \
  hr hiring onboarding training reviews

# blackroadqi.com — 189 slots, add 25 more
add_subs "blackroadqi.com" \
  framework axioms proofs theorems lemmas \
  calculator visualizer plotter grapher \
  elimit convergence series sequence \
  research papers citations bibliography \
  tests benchmarks results validation \
  api sdk docs examples tutorials

# blackroadquantum.com — 185 slots, add 30 more
add_subs "blackroadquantum.com" \
  simulator emulator compiler runtime \
  qubits gates circuits algorithms \
  entanglement superposition measurement \
  research papers journal publications \
  classroom course workshop seminar \
  playground sandbox demo showcase \
  community forum discuss contribute \
  sdk cli tools plugins

# blackroadquantum.info — 190 slots, add 25 more
add_subs "blackroadquantum.info" \
  library catalog index archive \
  journal articles reviews abstracts \
  conference talks slides poster \
  blog news updates announcements \
  glossary faq reference guide \
  resources downloads assets media

# blackroadquantum.net — 188 slots, add 30 more
add_subs "blackroadquantum.net" \
  firewall ids ips waf scanner \
  vault secrets keys certs tokens \
  proxy relay tunnel vpn wireguard \
  monitor alert incident response forensics \
  compliance gdpr hipaa soc2 iso27001 \
  pentest vulnerability exploit ctf

# blackroadquantum.shop — 189 slots, add 30 more
add_subs "blackroadquantum.shop" \
  catalog products bundles deals featured \
  checkout payment shipping tracking returns \
  reviews ratings wishlist compare \
  raspberry hailo ssd nvme case \
  cluster rack cable psu cooling \
  merch shirts stickers posters swag \
  wholesale bulk enterprise custom

# blackroadquantum.store — 189 slots, add 30 more
add_subs "blackroadquantum.store" \
  software apps tools plugins extensions \
  api sdk library framework starter \
  themes skins templates presets packs \
  plans pricing enterprise team individual \
  download install update changelog release \
  docs guides tutorials examples recipes

# lucidia.earth — 174 slots, add 30 more
add_subs "lucidia.earth" \
  hub dashboard portal console panel \
  deploy run execute schedule cron \
  memory knowledge graph context history \
  skills tools actions triggers events \
  fleet roster status health monitor \
  api sdk cli docs reference

# lucidia.studio — 178 slots, add 30 more
add_subs "lucidia.studio" \
  editor preview render export publish \
  audio music podcast voice sound \
  photo image filter effect transform \
  animation motion timeline keyframe sprite \
  design layout typography color palette \
  collaborate share team workspace project

# lucidiaqi.com — 178 slots, add 20 more
add_subs "lucidiaqi.com" \
  hub dashboard console portal \
  inference predict classify detect \
  optimize schedule allocate balance \
  monitor trace debug profile \
  api sdk docs reference examples

# roadchain.io — 190 slots, add 35 more
add_subs "roadchain.io" \
  node validator miner staker \
  block tx receipt log event \
  token nft metadata storage ipfs \
  governance proposal vote delegate \
  swap pool liquidity farm yield \
  analytics dashboard metrics chart \
  faucet airdrop claim rewards \
  audit verify scan inspect \
  docs whitepaper roadmap changelog

# roadcoin.io — 188 slots, add 30 more
add_subs "roadcoin.io" \
  app dashboard portfolio balance \
  send receive transfer swap bridge \
  history transactions pending confirmed \
  earn rewards mining staking yield \
  community governance vote forum \
  charts price ticker volume \
  api sdk tools cli

# blackboxprogramming.io — 183 slots, add 30 more
add_subs "blackboxprogramming.io" \
  ide editor terminal shell console \
  git repo branch commit diff \
  build test lint format check \
  docs wiki guides tutorials blog \
  packages npm crates pypi hub \
  sandbox playground repl notebook lab

echo ""
echo "WAVE 2 COMPLETE!"
