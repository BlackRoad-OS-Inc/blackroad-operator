#!/bin/bash
# Run this ON the Pi — cloudflared uses its own cert, no API key needed
# scp this to Pi then: ssh pi@192.168.4.64 "bash tunnel-route-all.sh"

TUNNEL_ID="52915859-da18-4aa6-add5-7bd9fcac2e0b"

DOMAINS=(
  blackroad.io www.blackroad.io
  agents.blackroad.io api.blackroad.io dashboard.blackroad.io
  docs.blackroad.io hub.blackroad.io chat.blackroad.io
  ollama.blackroad.io gateway.blackroad.io console.blackroad.io
  blackroad.me www.blackroad.me
  blackroad.network www.blackroad.network
  blackroad.systems www.blackroad.systems
  blackroad.company www.blackroad.company
  blackroadinc.us www.blackroadinc.us
  blackroadai.com www.blackroadai.com
  blackroadqi.com www.blackroadqi.com
  blackroadquantum.com www.blackroadquantum.com
  blackroadquantum.net www.blackroadquantum.net
  blackroadquantum.info www.blackroadquantum.info
  blackroadquantum.shop www.blackroadquantum.shop
  blackroadquantum.store www.blackroadquantum.store
  lucidia.earth www.lucidia.earth app.lucidia.earth
  lucidia.studio www.lucidia.studio
  lucidiaqi.com www.lucidiaqi.com
  aliceqi.com www.aliceqi.com
  roadchain.io www.roadchain.io app.roadchain.io
  roadcoin.io www.roadcoin.io
  blackboxprogramming.io www.blackboxprogramming.io
)

for domain in "${DOMAINS[@]}"; do
  cloudflared tunnel route dns "$TUNNEL_ID" "$domain" && echo "✓ $domain" || echo "✗ $domain"
done
