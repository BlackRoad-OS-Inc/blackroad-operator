#!/usr/bin/env python3
"""
BlackRoad MEGA INDEXER — indexes EVERYTHING into RoadSearch D1
Run: python3 index-everything.py
"""
import json, subprocess, sqlite3, os, sys

pages = []
INDEX_URL = "https://search.blackroad.io/index"
INDEX_KEY = "blackroad-search-index-2026"

def add(url, title, desc, domain, category, tags, content=""):
    pages.append({
        "url": url, "title": title, "description": desc[:300],
        "domain": domain, "category": category,
        "tags": tags[:200], "content": content[:500]
    })

print("=== MEGA INDEXER ===", file=sys.stderr)

# 1. ALL GITHUB REPOS (already done — 1764)
print("1. GitHub repos...", file=sys.stderr)
try:
    for org in ["BlackRoad-OS-Inc", "BlackRoad-OS", "BlackRoad-AI", "BlackRoad-Labs",
                "BlackRoad-Cloud", "BlackRoad-Ventures", "BlackRoad-Foundation",
                "BlackRoad-Media", "BlackRoad-Hardware", "BlackRoad-Education",
                "BlackRoad-Gov", "BlackRoad-Security", "BlackRoad-Interactive",
                "BlackRoad-Archive", "BlackRoad-Studio", "Blackbox-Enterprises"]:
        result = subprocess.run(["gh", "api", f"orgs/{org}/repos?per_page=100&sort=updated",
            "--paginate", "--jq", '.[] | {name, description, html_url, topics, size, language}'],
            capture_output=True, text=True, timeout=30)
        for line in result.stdout.strip().split('\n'):
            if not line.strip(): continue
            try:
                r = json.loads(line)
                if r.get('size', 0) < 10: continue
                topics = r.get('topics', []) or []
                lang = r.get('language') or ''
                add(r['html_url'], f"{r['name']} — {org}",
                    (r.get('description') or f"Repository in {org}")[:300],
                    "github.com", "repo",
                    ','.join(topics[:5] + [org.lower(), 'github', lang.lower()]),
                    f"{r.get('description','')} Language: {lang}. Topics: {', '.join(topics)}.")
            except: pass
    print(f"  {sum(1 for p in pages if p['category']=='repo')} repos", file=sys.stderr)
except Exception as e:
    print(f"  Repos failed: {e}", file=sys.stderr)

# 2. ROUNDTRIP AGENTS (200 active)
print("2. RoundTrip agents...", file=sys.stderr)
try:
    result = subprocess.run(["curl", "-s", "--max-time", "10",
        "https://roundtrip.blackroad.io/api/agents"], capture_output=True, text=True)
    agents = json.loads(result.stdout)
    for a in agents:
        add(f"https://roundtrip.blackroad.io/agent/{a['id']}",
            f"{a['name']} — {a.get('role','Agent')}",
            a.get('persona', '')[:200], "roundtrip.blackroad.io", "agent",
            f"agent,{a.get('group','')},{a.get('role','').lower()},{a['id']}")
    print(f"  {len(agents)} agents", file=sys.stderr)
except: pass

# 3. CODEX SOLUTIONS
print("3. Codex solutions...", file=sys.stderr)
try:
    codex_db = os.path.expanduser("~/.blackroad/memory/codex/codex.db")
    if os.path.exists(codex_db):
        conn = sqlite3.connect(codex_db)
        for row in conn.execute("SELECT name, category, problem, solution FROM solutions"):
            add(f"https://blackroad.io/codex/{row[0].replace(' ','-').lower()}",
                f"{row[0]} — Codex Solution", row[2][:200] if row[2] else row[0],
                "blackroad.io", "codex",
                f"codex,solution,{row[1]}", row[3][:500] if row[3] else "")
        for row in conn.execute("SELECT pattern_name, pattern_type, description FROM patterns"):
            add(f"https://blackroad.io/codex/pattern/{row[0].replace(' ','-').lower()}",
                f"{row[0]} — Codex Pattern", row[2][:200] if row[2] else row[0],
                "blackroad.io", "codex",
                f"codex,pattern,{row[1]}", row[2][:500] if row[2] else "")
        conn.close()
        print(f"  {sum(1 for p in pages if p['category']=='codex')} codex entries", file=sys.stderr)
except Exception as e:
    print(f"  Codex failed: {e}", file=sys.stderr)

# 4. MEMORIES (recent 5000)
print("4. Memories...", file=sys.stderr)
try:
    mem_db = os.path.expanduser("~/.blackroad/memory/memory-index.db")
    if os.path.exists(mem_db):
        conn = sqlite3.connect(mem_db)
        for row in conn.execute("SELECT c0, c1, c2, c3 FROM memories_fts_content ORDER BY rowid DESC LIMIT 5000"):
            ts, action, entity, details = row
            if not action or not entity: continue
            add(f"https://blackroad.io/memory/{entity}",
                f"{action}: {entity}", (details or '')[:200],
                "blackroad.io", "memory",
                f"memory,{action},{entity}", details[:500] if details else "")
        conn.close()
        print(f"  {sum(1 for p in pages if p['category']=='memory')} memories", file=sys.stderr)
except Exception as e:
    print(f"  Memories failed: {e}", file=sys.stderr)

# 5. DOMAINS + SUBDOMAINS
print("5. Domains...", file=sys.stderr)
domains = {
    "blackroad.io": ("BlackRoad OS — Pave Tomorrow", "Sovereign AI infrastructure on Raspberry Pi"),
    "blackroad.company": ("BlackRoad Company", "Delaware C-Corp enterprise infrastructure"),
    "blackroadai.com": ("BlackRoad AI", "Local-first AI, Ollama fleet, Hailo-8"),
    "blackroadinc.us": ("BlackRoad OS, Inc.", "US corporate entity, EIN 41-2663817"),
    "roadchain.io": ("RoadChain", "Layer-1 blockchain, secp256k1"),
    "roadcoin.io": ("RoadCoin", "Creator micropayments"),
    "lucidia.earth": ("Lucidia", "AI companion with persistent memory"),
    "lucidia.studio": ("Lucidia Studio", "AI creative workspace"),
    "blackboxprogramming.io": ("BlackBox IDE", "Sovereign developer environment"),
    "blackroad.me": ("BlackRoad Identity", "JWT authentication"),
    "blackroad.network": ("BlackRoad Network", "WireGuard mesh VPN"),
    "blackroad.systems": ("BlackRoad Systems", "Fleet monitoring"),
}
for domain, (title, desc) in domains.items():
    add(f"https://{domain}", title, desc, domain, "site", f"site,domain,{domain}")

subdomains = ["chat", "search", "roundtrip", "auth", "app", "status", "hq", "images", "bb", "pay"]
for sub in subdomains:
    add(f"https://{sub}.blackroad.io", f"{sub}.blackroad.io", f"BlackRoad {sub} service",
        f"{sub}.blackroad.io", "app", f"app,service,{sub}")

# 6. FLEET NODES
print("6. Fleet nodes...", file=sys.stderr)
nodes = [
    ("alice", "Gateway, Pi-hole, DNS, headscale, PowerDNS"),
    ("cecilia", "AI Engine, Ollama, MinIO, Hailo-8 26 TOPS"),
    ("octavia", "Gitea, Docker, NATS, Hailo-8, 1TB NVMe"),
    ("aria", "Monitoring, workerd, nginx, InfluxDB"),
    ("lucidia", "334 apps, GitHub Actions runners, NATS"),
    ("gematria", "Caddy TLS edge, 294 sites, PowerDNS, AMD"),
    ("anastasia", "Prism API, Caddy, PowerDNS, AMD"),
    ("alexandria", "Mac M2 8-core orchestrator"),
]
for name, desc in nodes:
    add(f"https://blackroad.io/fleet/{name}", f"{name.title()} — Fleet Node",
        desc, "blackroad.io", "infra", f"fleet,node,{name}")

# 7. MATH
print("7. Math...", file=sys.stderr)
math_pages = [
    ("G(n) Function", "G(n) = n^(n+1)/(n+1)^n — the Amundson function"),
    ("Amundson Constant A_G", "A_G ≈ 1.244331783986725, defined as Σ G(n)/n!"),
    ("Crossover Constant α", "α ≈ 2.293166, unique solution to x = (1+1/x)^x"),
    ("Cayley Tree Connection", "G(n) = n³·T(n)/(n+1)^n where T(n) = n^(n-2)"),
    ("Telescoping Product", "Π G(k) = (n!)²/(n+1)^n"),
    ("Rational Recurrence", "G(n)/G(n-1) = (n²/(n²-1))^n — pure rational"),
    ("Factorial from G", "n! = √(Π G(k)·(n+1)^n)"),
    ("Cumulants", "κ₁=1/2, κ₂=23/36, κ₃=35/192, κ₄=-524639/540000"),
]
for title, desc in math_pages:
    add(f"https://blackroad.io/math/{title.lower().replace(' ','-')}",
        f"{title} — Amundson Framework", desc, "blackroad.io", "math",
        f"math,amundson,{title.lower()}")

# 8. TRAINING DATA (values, morals, community)
print("8. Training data...", file=sys.stderr)
for f in ["blackroad-knowledge.jsonl", "morals-and-defense.jsonl", "values.jsonl",
          "community-values.jsonl", "justice-values.jsonl"]:
    path = f"/tmp/training-data/{f}"
    if os.path.exists(path):
        with open(path) as fh:
            for line in fh:
                try:
                    d = json.loads(line)
                    add(f"https://blackroad.io/values/{d['instruction'][:50].replace(' ','-').lower()}",
                        d['instruction'][:100], d['output'][:200],
                        "blackroad.io", "values",
                        "values,training,morals", d['output'][:500])
                except: pass

print(f"\nTOTAL: {len(pages)} pages to index", file=sys.stderr)
print(json.dumps(pages))
