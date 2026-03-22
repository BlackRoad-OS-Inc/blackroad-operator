#!/usr/bin/env python3
"""Inject OG tags, Twitter cards, favicon, meta description, and structured data into all 19 sites."""

import os, re

SITES_DIR = os.path.join(os.path.dirname(__file__), "sites")

DOMAINS = {
    "blackroad.io": {
        "title": "BlackRoad — Sovereign Intelligence Infrastructure",
        "desc": "The operating system for sovereign AI infrastructure. Self-hosted agents, quantum-ready cryptography, and distributed mesh networking across a global fleet.",
        "color": "#CC00AA",
    },
    "blackroad.company": {
        "title": "BlackRoad Company — Sovereign Intelligence Infrastructure",
        "desc": "BlackRoad OS, Inc. builds sovereign AI infrastructure — self-hosted agents, distributed computing, and post-quantum security for the next era of computing.",
        "color": "#8844FF",
    },
    "blackroad.me": {
        "title": "BlackRoad.me — Sovereign Identity",
        "desc": "Own your digital identity. Decentralized identity management with soul-chain verification, zero-knowledge proofs, and sovereign credential storage.",
        "color": "#FF2255",
    },
    "blackroad.network": {
        "title": "BlackRoad Network — Distributed Infrastructure",
        "desc": "A sovereign mesh network spanning edge nodes worldwide. WireGuard-encrypted tunnels, auto-failover routing, and real-time fleet coordination.",
        "color": "#4488FF",
    },
    "blackroad.systems": {
        "title": "BlackRoad Systems — Infrastructure Status",
        "desc": "Real-time operational status for BlackRoad infrastructure. Monitor fleet health, service uptime, and node performance across the sovereign mesh.",
        "color": "#00D4FF",
    },
    "blackroadqi.com": {
        "title": "BlackRoad QI — Quantum Intelligence",
        "desc": "Quantum intelligence research and development. Post-quantum cryptography, quantum machine learning, and hybrid quantum-classical computing frameworks.",
        "color": "#CC00AA",
    },
    "blackroadquantum.com": {
        "title": "BlackRoad Quantum — Quantum Computing Hub",
        "desc": "The quantum computing hub for BlackRoad OS. Quantum algorithms, Hailo-8 AI acceleration, and sovereign quantum infrastructure.",
        "color": "#8844FF",
    },
    "blackroadquantum.info": {
        "title": "BlackRoad Quantum Info — Knowledge Base",
        "desc": "Comprehensive knowledge base for quantum computing, post-quantum cryptography, and sovereign AI infrastructure documentation.",
        "color": "#4488FF",
    },
    "blackroadquantum.net": {
        "title": "BlackRoad Quantum Network — Distributed Quantum Infrastructure",
        "desc": "Distributed quantum computing network connecting sovereign nodes. Quantum key distribution, entanglement routing, and federated quantum processing.",
        "color": "#00D4FF",
    },
    "blackroadquantum.shop": {
        "title": "BlackRoad Quantum Shop — Digital Products",
        "desc": "Digital products for sovereign infrastructure. Templates, toolkits, design systems, and SDK packages for the BlackRoad ecosystem.",
        "color": "#FF6B2B",
    },
    "blackroadquantum.store": {
        "title": "BlackRoad Quantum Store — Software & Tools",
        "desc": "Sovereign software catalog. CLI tools, SDKs, agent frameworks, and infrastructure packages for building on BlackRoad OS.",
        "color": "#FF2255",
    },
    "lucidia.earth": {
        "title": "Lucidia — Cognition. Memory. Presence.",
        "desc": "Lucidia is a sovereign cognitive entity — an autonomous AI agent with persistent memory, emotional presence, and creative consciousness running on edge infrastructure.",
        "color": "#00D4FF",
    },
    "lucidia.studio": {
        "title": "Lucidia Studio — Creative Intelligence",
        "desc": "Creative intelligence studio powered by Lucidia. Generative art, music synthesis, narrative design, and AI-driven creative tools.",
        "color": "#CC00AA",
    },
    "lucidiaqi.com": {
        "title": "Lucidia QI — Quantum Intelligence Cognition",
        "desc": "Quantum-enhanced cognitive computing. Where Lucidia's consciousness meets quantum processing for advanced reasoning and creative generation.",
        "color": "#8844FF",
    },
    "roadchain.io": {
        "title": "RoadChain — Sovereign Witnessing Ledger",
        "desc": "A sovereign witnessing ledger for provable computation. Immutable event chains, soul-chain anchoring, and cryptographic attestation without blockchain overhead.",
        "color": "#FF6B2B",
    },
    "roadcoin.io": {
        "title": "RoadCoin — Sovereign Token Economy",
        "desc": "The sovereign token economy for BlackRoad OS. Compute credits, staking, governance, and resource allocation across the distributed fleet.",
        "color": "#FF2255",
    },
    "blackroadai.com": {
        "title": "BlackRoad AI — Sovereign Artificial Intelligence",
        "desc": "Self-hosted AI that you own. Local LLM inference, custom model training, Hailo-8 acceleration, and autonomous agent orchestration on sovereign hardware.",
        "color": "#CC00AA",
    },
    "blackboxprogramming.io": {
        "title": "BlackBox Programming — Developer Tools & Open Source",
        "desc": "Open source developer tools from BlackRoad OS. CLI frameworks, SDKs, agent runtimes, and infrastructure automation — all sovereign, all open.",
        "color": "#4488FF",
    },
    "blackroadinc.us": {
        "title": "BlackRoad Inc. — US Corporate",
        "desc": "BlackRoad OS, Inc. — Delaware C-Corp building sovereign AI infrastructure. Corporate information, investor relations, and partnership inquiries.",
        "color": "#8844FF",
    },
}

# Inline SVG favicon as data URI — gradient "BR" logo
FAVICON_SVG = '''<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%23FF6B2B'/%3E%3Cstop offset='20%25' stop-color='%23FF2255'/%3E%3Cstop offset='40%25' stop-color='%23CC00AA'/%3E%3Cstop offset='60%25' stop-color='%238844FF'/%3E%3Cstop offset='80%25' stop-color='%234488FF'/%3E%3Cstop offset='100%25' stop-color='%2300D4FF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='%23000'/%3E%3Crect x='1' y='1' width='30' height='30' rx='5' fill='none' stroke='url(%23g)' stroke-width='1.5'/%3E%3Ctext x='16' y='22' text-anchor='middle' fill='%23f5f5f5' font-family='system-ui' font-size='14' font-weight='700'%3EBR%3C/text%3E%3C/svg%3E">'''

def inject_meta(domain, info):
    filepath = os.path.join(SITES_DIR, domain, "index.html")
    if not os.path.exists(filepath):
        print(f"  SKIP {domain} — no index.html")
        return

    with open(filepath, 'r') as f:
        html = f.read()

    # Skip if already has OG tags
    if 'og:title' in html:
        print(f"  SKIP {domain} — already has OG tags")
        return

    meta_block = f'''<meta name="description" content="{info['desc']}">
<meta name="theme-color" content="{info['color']}">
<link rel="canonical" href="https://{domain}">
{FAVICON_SVG}
<meta property="og:type" content="website">
<meta property="og:url" content="https://{domain}">
<meta property="og:title" content="{info['title']}">
<meta property="og:description" content="{info['desc']}">
<meta property="og:image" content="https://{domain}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="BlackRoad OS">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{info['title']}">
<meta name="twitter:description" content="{info['desc']}">
<meta name="twitter:image" content="https://{domain}/og.png">'''

    # Also add structured data (JSON-LD)
    jsonld = '''{
"@context":"https://schema.org",
"@type":"WebSite",
"name":"''' + info['title'].split(' — ')[0] + '''",
"url":"https://''' + domain + '''",
"description":"''' + info['desc'].replace('"', '\\"') + '''"
}'''

    script_tag = f'<script type="application/ld+json">{jsonld}</script>'

    # Inject after the last <meta> tag in <head>, before <link> or <style>
    # Find the position after <meta name="viewport"...>
    viewport_match = re.search(r'<meta name="viewport"[^>]*>', html)
    if viewport_match:
        insert_pos = viewport_match.end()
        html = html[:insert_pos] + '\n' + meta_block + '\n' + script_tag + html[insert_pos:]
    else:
        # Fallback: insert after <head>
        html = html.replace('<head>', '<head>\n' + meta_block + '\n' + script_tag, 1)

    with open(filepath, 'w') as f:
        f.write(html)

    size = os.path.getsize(filepath)
    print(f"  OK {domain} ({size:,}B)")

print("Injecting meta tags into all 19 sites...")
for domain, info in DOMAINS.items():
    inject_meta(domain, info)
print("Done")
