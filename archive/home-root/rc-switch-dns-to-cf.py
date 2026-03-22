#!/usr/bin/env python3
"""Switch all subdomain DNS from Gematria A records to CF Pages CNAME records.
Every subdomain that currently points to 159.65.43.12 gets changed to CNAME → domain.pages.dev"""

import subprocess, json, time, sys

CF_TOKEN = "yP5h0HvsXX0BpHLs01tLmgtTbQurIKPL4YnQfIwy"
GEMATRIA = "159.65.43.12"

ZONES = {
    "blackroad.io": "d6566eba4500b460ffec6650d3b4baf6",
    "blackroad.company": "f654e077612d3d240f96300b7c0c6cae",
    "blackroad.me": "622395674d479bad0a7d3790722c14be",
    "blackroad.network": "fae5a76a78154e0509bede2e3eba8124",
    "blackroad.systems": "13293825c2b0491085cbece9fc02e401",
    "blackroadai.com": "590afe2b9b2ae222e77d89c10b7412d3",
    "blackroadinc.us": "decb1bf816ff29197d88751228ad0017",
    "blackroadqi.com": "e24dbdfd8868183e4093b8cdba709240",
    "blackroadquantum.com": "1c93ece77e64728f506d635f5b58c60a",
    "blackroadquantum.info": "9855ce5bf6602150ea9195f3cd975d3e",
    "blackroadquantum.net": "7d606471c0feab151c8ad493fd8a5c8e",
    "blackroadquantum.shop": "b842746ff2e811c1be959e5a843b25e6",
    "blackroadquantum.store": "498fef62d7a9812e69413e7451edf3b1",
    "lucidia.earth": "a91af33930bb9b9ddfa0cf12c0232460",
    "lucidia.studio": "43edda4c64475e5d81934ec7f64f6801",
    "lucidiaqi.com": "8a787536b6dd285bdf06dde65e96e8c0",
    "roadchain.io": "86d82685f669fe45d0ee6d24ef21b255",
    "roadcoin.io": "111d9214d54a282b1e889fa3d1e2faa8",
    "blackboxprogramming.io": "6e27d41cb2d27cd8f2f26e95608d3899",
}

# Map domain to its CF Pages project CNAME target
PAGES_TARGETS = {
    "blackroad.io": "blackroad-io.pages.dev",
    "blackroad.company": "blackroad-company.pages.dev",
    "blackroad.me": "blackroad-me.pages.dev",
    "blackroad.network": "blackroad-network.pages.dev",
    "blackroad.systems": "blackroad-systems.pages.dev",
    "blackroadai.com": "blackroadai-com.pages.dev",
    "blackroadinc.us": "blackroadinc-us.pages.dev",
    "blackroadqi.com": "blackroadqi-com.pages.dev",
    "blackroadquantum.com": "blackroadquantum-com.pages.dev",
    "blackroadquantum.info": "blackroadquantum-info.pages.dev",
    "blackroadquantum.net": "blackroadquantum-net.pages.dev",
    "blackroadquantum.shop": "blackroadquantum-shop.pages.dev",
    "blackroadquantum.store": "blackroadquantum-store.pages.dev",
    "lucidia.earth": "lucidia-earth.pages.dev",
    "lucidia.studio": "lucidia-studio.pages.dev",
    "lucidiaqi.com": "lucidiaqi-com.pages.dev",
    "roadchain.io": "roadchain-io.pages.dev",
    "roadcoin.io": "roadcoin-io.pages.dev",
    "blackboxprogramming.io": "blackboxprogramming-io.pages.dev",
}

# Skip these — they need real backend routing (keep on Gematria/tunnel)
KEEP_ON_BACKEND = {
    "prism.blackroad.io", "git.blackroad.io", "roundtrip.blackroad.io",
    "chat.blackroad.io", "api.blackroad.io", "auth.blackroad.io",
    "pay.blackroad.io", "status.blackroad.io", "code.blackroad.io",
    "images.blackroad.io", "hq.blackroad.io", "search.blackroad.io",
    "app.blackroad.io", "agents.blackroadai.com", "agents.lucidia.earth",
    "ollama.blackroadai.com", "dashboard.blackroad.io",
    "fleet.blackroad.io", "deploy.blackroad.io",
    "monitor.blackroad.io", "metrics.blackroad.io",
    "cecilia.blackroad.io", "aria.blackroad.io",
    "storage.blackroad.io", "brand.blackroad.io",
    "wiki.blackroad.io", "blog.blackroad.io",
    "cloud.blackroad.io", "services.blackroad.io",
    "squad.blackroad.io", "roadcode-squad.blackroad.io",
    "gitea.blackroad.io", "stats.blackroad.io",
    "portal.blackroad.io", "memory.blackroad.io",
    "stripe.blackroad.io", "admin.blackroad.io",
    "docs.blackroad.io", "headscale.blackroad.io",
    "qdrant.blackroad.io", "ollama.blackroad.io",
    "ollama-internal.blackroad.io",
}

def cf_api(method, path, data=None):
    cmd = ["curl", "-s", "-X", method,
           f"https://api.cloudflare.com/client/v4/{path}",
           "-H", f"Authorization: Bearer {CF_TOKEN}",
           "-H", "Content-Type: application/json"]
    if data:
        cmd.extend(["--data", json.dumps(data)])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    try:
        return json.loads(r.stdout)
    except:
        return {"success": False}

total_switched = 0
total_skipped = 0
total_kept = 0

for domain, zone_id in ZONES.items():
    target = PAGES_TARGETS[domain]
    print(f"\n=== {domain} → {target} ===")

    # Get all A records pointing to Gematria
    page = 1
    records = []
    while True:
        resp = cf_api("GET", f"zones/{zone_id}/dns_records?type=A&content={GEMATRIA}&per_page=100&page={page}")
        if not resp.get("success"):
            break
        batch = resp.get("result", [])
        records.extend(batch)
        if len(batch) < 100:
            break
        page += 1

    switched = 0
    for rec in records:
        fqdn = rec["name"]
        rec_id = rec["id"]

        # Skip root domain records
        if fqdn == domain:
            total_skipped += 1
            continue

        # Skip backend services
        if fqdn in KEEP_ON_BACKEND:
            total_kept += 1
            continue

        # Delete the A record
        cf_api("DELETE", f"zones/{zone_id}/dns_records/{rec_id}")

        # Create CNAME pointing to pages.dev (proxied)
        cf_api("POST", f"zones/{zone_id}/dns_records", {
            "type": "CNAME",
            "name": fqdn,
            "content": target,
            "proxied": True,
            "ttl": 1
        })

        switched += 1
        total_switched += 1

    print(f"  Switched: {switched} | Kept on backend: {sum(1 for r in records if r['name'] in KEEP_ON_BACKEND)}")

print(f"\n{'='*50}")
print(f"TOTAL SWITCHED: {total_switched} (A→CNAME)")
print(f"TOTAL KEPT ON BACKEND: {total_kept}")
print(f"TOTAL SKIPPED (root): {total_skipped}")
print(f"{'='*50}")
