#!/usr/bin/env python3
"""Build a massive search index for RoadSearch"""
import json, subprocess, sys

pages = []

# === 1. ALL 20 DOMAIN SITES ===
domains = {
    "blackroad.io": ("BlackRoad OS — Pave Tomorrow", "Sovereign infrastructure. 5 Pi nodes, 52 TOPS AI, 7 nodes. Your AI. Your hardware. Your rules.", "os,sovereign,infrastructure,pi,agents"),
    "blackroad.company": ("BlackRoad Company — Enterprise", "Enterprise infrastructure that runs itself. Delaware C-Corp founded Nov 2025.", "corporate,enterprise,company,delaware"),
    "blackroadai.com": ("BlackRoad AI — Sovereign Intelligence", "Local-first AI. Ollama fleet, Hailo-8 accelerators, 52 TOPS on Raspberry Pi.", "ai,ollama,hailo,inference,models"),
    "blackroadinc.us": ("BlackRoad OS, Inc. — US Corporate", "Delaware C-Corporation. EIN 41-2663817. Founded by Alexa Amundson.", "corporate,delaware,ein,legal"),
    "blackroadquantum.com": ("BlackRoad Quantum — Computing Platform", "Quantum computing research and mathematical frameworks.", "quantum,math,computing,research"),
    "blackroadquantum.info": ("BlackRoad Quantum — Research", "Documentation and research papers on quantum mathematics.", "quantum,research,papers,documentation"),
    "blackroadquantum.net": ("BlackRoad Quantum Network", "Distributed quantum computing network.", "quantum,network,distributed"),
    "blackroadquantum.shop": ("BlackRoad Quantum Shop", "Quantum computing tools and resources.", "quantum,tools,resources,shop"),
    "blackroadquantum.store": ("BlackRoad Quantum Store", "Digital store for quantum computing products.", "quantum,store,digital,products"),
    "blackroad.me": ("BlackRoad Identity — Sovereign Auth", "Authentication and identity management. JWT tokens, signup, login.", "auth,identity,jwt,login,signup"),
    "blackroad.network": ("BlackRoad Network — Mesh Infrastructure", "WireGuard mesh VPN, Pi-hole DNS, sovereign connectivity across 5 Pi nodes.", "network,wireguard,mesh,vpn,dns"),
    "blackroad.systems": ("BlackRoad Systems — Infrastructure", "System monitoring, fleet management, self-hosted infrastructure.", "systems,monitoring,fleet,infrastructure"),
    "blackroadqi.com": ("BlackRoad QI — Quantum Intelligence", "Quantum intelligence platform combining AI with mathematical frameworks.", "qi,quantum,intelligence,ai,math"),
    "roadchain.io": ("RoadChain — Layer-1 Blockchain", "Sovereign blockchain built from scratch. secp256k1, Python-native.", "blockchain,layer1,crypto,secp256k1"),
    "roadcoin.io": ("RoadCoin — Creator Payments", "Micropayments for creators. Direct, instant, fair. 90%+ revenue share.", "payments,crypto,creators,micropayments"),
    "lucidia.earth": ("Lucidia — AI with Memory", "AI companion with persistent memory across every device and session.", "lucidia,ai,memory,companion,persistent"),
    "lucidia.studio": ("Lucidia Studio — Creative AI", "AI-powered creative workspace. Code generation, content creation.", "lucidia,studio,creative,ai,workspace"),
    "lucidiaqi.com": ("Lucidia QI — Quantum Dreaming", "Quantum reasoning engine. Deep analysis and philosophical synthesis.", "lucidia,qi,quantum,reasoning,philosophy"),
    "blackboxprogramming.io": ("BlackBox IDE — Code Sovereign", "Sovereign developer environment. AI co-coding, local inference, zero telemetry.", "ide,coding,developer,ai,blackbox"),
}

for domain, (title, desc, tags) in domains.items():
    pages.append({"url": f"https://{domain}", "title": title, "description": desc, "domain": domain, "category": "site", "tags": tags})

# === 2. PRODUCT SUBDOMAINS ===
subdomains = {
    "chat.blackroad.io": ("BlackRoad Chat — AI Conversations", "Multi-agent AI chat with 35+ agents, 6 rooms, memory system, Workers AI.", "chat,ai,agents,conversations,workers-ai", "app"),
    "search.blackroad.io": ("RoadSearch — Search Engine", "Privacy-first search engine. FTS5, AI answers, autocomplete, trending.", "search,fts5,ai,privacy,engine", "app"),
    "roundtrip.blackroad.io": ("RoundTrip — Agent Hub", "167 AI agents across 10 groups. Chat, debate, fleet coordination.", "roundtrip,agents,hub,coordination,debate", "app"),
    "auth.blackroad.io": ("BlackRoad Auth — Identity", "Authentication service. Signup, login, JWT tokens. 47 accounts.", "auth,identity,jwt,signup,login", "app"),
    "app.blackroad.io": ("BlackRoad App — Dashboard", "Main application dashboard. Login, agents, fleet status.", "app,dashboard,login,agents", "app"),
    "status.blackroad.io": ("BlackRoad Status — System Health", "Live infrastructure status. 7 nodes, service health, uptime.", "status,health,monitoring,uptime", "app"),
    "hq.blackroad.io": ("Pixel HQ — Virtual Office", "14-floor pixel art headquarters. Agent assignments, floor plans.", "hq,pixel,office,virtual,metaverse", "app"),
    "images.blackroad.io": ("BlackRoad Images — Asset CDN", "Image hosting and CDN. Pixel art, logos, brand assets.", "images,cdn,assets,hosting", "app"),
    "prism.blackroad.io": ("PRISM — Enterprise Console", "Fleet management, agent coordination, KPI tracking.", "prism,console,erp,fleet,management", "app"),
}

for sub, (title, desc, tags, cat) in subdomains.items():
    pages.append({"url": f"https://{sub}", "title": title, "description": desc, "domain": sub, "category": cat, "tags": tags})

# === 3. ALL 167 ROUNDTRIP AGENTS ===
try:
    result = subprocess.run(["curl", "-s", "--max-time", "10", "https://roundtrip.blackroad.io/api/agents"], capture_output=True, text=True)
    agents = json.loads(result.stdout)
    for a in agents:
        pages.append({
            "url": f"https://roundtrip.blackroad.io/agent/{a['id']}",
            "title": f"{a['name']} — {a.get('role','Agent')}",
            "description": a.get('persona', f"{a['name']} is a BlackRoad agent.")[:200],
            "domain": "roundtrip.blackroad.io",
            "category": "agent",
            "tags": f"agent,{a.get('group','')},{a.get('role','').lower()},{a['id']}"
        })
    print(f"Indexed {len(agents)} agents", file=sys.stderr)
except Exception as e:
    print(f"Agent indexing failed: {e}", file=sys.stderr)

# === 4. TOP GITHUB REPOS ===
try:
    result = subprocess.run(["gh", "api", "orgs/BlackRoad-OS-Inc/repos?per_page=100&sort=updated", "--jq",
        '.[] | {name, description, html_url, topics, size}'], capture_output=True, text=True)
    for line in result.stdout.strip().split('\n'):
        if not line.strip(): continue
        try:
            r = json.loads(line)
            if r.get('size', 0) < 50: continue  # skip stubs
            pages.append({
                "url": r['html_url'],
                "title": f"{r['name']} — BlackRoad OS",
                "description": (r.get('description') or f"BlackRoad repository: {r['name']}")[:200],
                "domain": "github.com",
                "category": "repo",
                "tags": ','.join(r.get('topics', [])[:5] + ['github', 'repo'])
            })
        except: pass
    print(f"Indexed repos from BlackRoad-OS-Inc", file=sys.stderr)
except Exception as e:
    print(f"Repo indexing failed: {e}", file=sys.stderr)

# === 5. KEY DOCUMENTATION PAGES ===
docs = [
    ("https://blackroad.io/docs", "BlackRoad Documentation", "Complete documentation for BlackRoad OS products and infrastructure.", "docs"),
    ("https://blackroad.io/pricing", "BlackRoad Pricing", "Simple, honest pricing. Rider $29/mo, Paver $99/mo, Enterprise $299/mo.", "docs"),
    ("https://blackroad.io/about", "About BlackRoad OS", "Founded by Alexa Amundson. Delaware C-Corp. 5 Raspberry Pi nodes.", "docs"),
    ("https://blackroad.io/agents", "BlackRoad Agents", "167 AI agents across fleet, cloud, services, AI, ops, creative, and more.", "docs"),
    ("https://blackroad.io/fleet", "BlackRoad Fleet", "Alice, Cecilia, Octavia, Aria, Lucidia — 5 Raspberry Pi 5 nodes.", "docs"),
    ("https://blackroad.io/changelog", "BlackRoad Changelog", "Development history and release notes.", "docs"),
]
for url, title, desc, cat in docs:
    pages.append({"url": url, "title": title, "description": desc, "domain": "blackroad.io", "category": cat, "tags": "docs,documentation"})

# === 6. AMUNDSON MATH ===
math_pages = [
    ("https://blackroad.io/math/amundson", "Amundson Function G(n)", "G(n) = n^(n+1)/(n+1)^n. Core function of the Amundson Framework.", "math,amundson,function,combinatorics"),
    ("https://blackroad.io/math/constant", "The Amundson Constant A_G", "A_G ≈ 1.244331783986725. Defined as Σ G(n)/n!. Likely transcendental.", "math,constant,transcendental,series"),
    ("https://blackroad.io/math/crossover", "Crossover Constant α", "α ≈ 2.293166. The unique solution to x = (1+1/x)^x. Where G(α) = 1.", "math,crossover,constant,equation"),
    ("https://blackroad.io/math/cayley", "Cayley Tree Connection", "G(n) = n³·T(n)/(n+1)^n where T(n) = n^(n-2) labeled trees.", "math,cayley,trees,graph-theory"),
    ("https://blackroad.io/math/identities", "Amundson Identities", "50+ verified identities. Telescoping product, rational recurrence, factorial-from-G.", "math,identities,proofs,algebra"),
]
for url, title, desc, tags in math_pages:
    pages.append({"url": url, "title": title, "description": desc, "domain": "blackroad.io", "category": "docs", "tags": tags})

# === 7. FLEET NODES ===
nodes = [
    ("alice", "192.168.4.49", "Gateway, Pi-hole, PostgreSQL, headscale, PowerDNS, nginx", "gateway,pihole,postgres,dns"),
    ("cecilia", "192.168.4.96", "AI Engine, Ollama, MinIO, Hailo-8, InfluxDB", "ai,ollama,minio,hailo,inference"),
    ("octavia", "192.168.4.101", "Gitea, Docker, NATS, NVMe storage", "gitea,docker,nats,storage"),
    ("aria", "192.168.4.98", "Monitoring, workerd, nginx, InfluxDB", "monitoring,workerd,nginx"),
    ("lucidia", "192.168.4.38", "334 apps, GitHub Actions runners, NATS", "apps,actions,nats,runner"),
    ("gematria", "159.65.43.12", "TLS edge, Caddy, PowerDNS, 151 domains", "caddy,tls,edge,dns"),
    ("anastasia", "159.89.247.184", "Backup cloud, Caddy, headscale", "backup,cloud,caddy"),
]
for name, ip, desc, tags in nodes:
    pages.append({
        "url": f"https://blackroad.io/fleet/{name}",
        "title": f"{name.title()} — BlackRoad Fleet Node",
        "description": f"{name.title()} ({ip}): {desc}",
        "domain": "blackroad.io",
        "category": "infra",
        "tags": f"fleet,node,pi,{tags}"
    })

# === 8. PRODUCTS ===
products = [
    ("RoadSearch", "search.blackroad.io", "Privacy-first search engine with FTS5 and AI answers"),
    ("RoundTrip", "roundtrip.blackroad.io", "167-agent coordination hub with debate and fleet management"),
    ("BlackRoad Chat", "chat.blackroad.io", "Multi-agent AI chat with memory and tool calling"),
    ("BlackRoad Auth", "auth.blackroad.io", "Authentication service with JWT, signup, login"),
    ("OpenClaw", "github.com/BlackRoad-OS-Inc/openclaw", "Forked personal AI assistant (328K stars upstream)"),
    ("Lucidia", "lucidia.earth", "AI companion with persistent memory across devices"),
    ("BlackBox IDE", "blackboxprogramming.io", "Sovereign developer environment"),
    ("RoadChain", "roadchain.io", "Layer-1 blockchain built from scratch"),
    ("RoadCoin", "roadcoin.io", "Creator micropayment system"),
    ("PRISM", "prism.blackroad.io", "Enterprise resource planning and fleet management"),
]
for name, domain, desc in products:
    pages.append({
        "url": f"https://{domain}",
        "title": f"{name} — BlackRoad Product",
        "description": desc,
        "domain": domain,
        "category": "product",
        "tags": f"product,{name.lower().replace(' ','-')}"
    })

print(f"Total pages to index: {len(pages)}", file=sys.stderr)
print(json.dumps(pages))
