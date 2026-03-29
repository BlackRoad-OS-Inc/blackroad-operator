#!/usr/bin/env python3
"""BlackRoad Cross-Org Search Index Builder v2
Indexes ALL repos across 16 GitHub orgs + 19 live websites + subdomains + memory
into a unified FTS5 SQLite database. Generates sitemaps and topic suggestions.

Usage:
    python3 index-all-orgs.py              # Full rebuild
    python3 index-all-orgs.py search <q>   # Search the index
    python3 index-all-orgs.py stats        # Show statistics
    python3 index-all-orgs.py sitemap      # Generate sitemaps for all domains
    python3 index-all-orgs.py topics       # Set GitHub topics on all repos
    python3 index-all-orgs.py export-d1    # Export index as SQL for D1 import
"""

import sqlite3
import json
import os
import subprocess
import sys
import time
import re
import glob
import base64
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

HOME = os.path.expanduser("~")
DB_PATH = os.path.join(HOME, ".blackroad/search-all-orgs.db")
SITEMAP_DIR = os.path.join(HOME, "blackroad-operator/sitemaps")

ORGS = [
    "BlackRoad-OS-Inc", "BlackRoad-OS", "BlackRoad-Studio", "BlackRoad-Archive",
    "BlackRoad-Interactive", "BlackRoad-Security", "BlackRoad-Gov", "BlackRoad-Education",
    "BlackRoad-Hardware", "BlackRoad-Media", "BlackRoad-Foundation", "BlackRoad-Ventures",
    "BlackRoad-Cloud", "BlackRoad-Labs", "BlackRoad-AI", "Blackbox-Enterprises"
]

DOMAINS = [
    "blackroad.io", "blackroad.company", "blackroad.me", "blackroad.network",
    "blackroad.systems", "blackroadai.com", "blackroadinc.us", "blackroadqi.com",
    "blackroadquantum.com", "blackroadquantum.info", "blackroadquantum.net",
    "blackroadquantum.shop", "blackroadquantum.store", "lucidia.earth",
    "lucidia.studio", "lucidiaqi.com", "roadchain.io", "roadcoin.io",
    "blackboxprogramming.io"
]

SUBDOMAINS = [
    "app", "prism", "chat", "search", "docs", "status", "dash", "agents",
    "models", "explorer", "wallet", "pay", "tutor", "social", "canvas",
    "cadence", "roadcode", "video", "live", "game", "book", "work", "radio",
    "hq", "roundtrip", "images", "auth", "api"
]

# Topic suggestions based on repo name/description patterns
TOPIC_RULES = {
    "agent": ["ai-agents", "multi-agent-system", "autonomous-agents"],
    "llm": ["large-language-models", "machine-learning", "ai"],
    "ollama": ["ollama", "local-ai", "self-hosted-ai"],
    "cloudflare": ["cloudflare-workers", "edge-computing"],
    "raspberry-pi": ["raspberry-pi", "iot", "edge-computing"],
    "hailo": ["hailo-8", "neural-processing", "edge-ai"],
    "wireguard": ["wireguard", "vpn", "mesh-network"],
    "mesh": ["mesh-network", "peer-to-peer", "distributed-systems"],
    "bitcoin": ["bitcoin", "cryptocurrency", "blockchain"],
    "search": ["search-engine", "full-text-search"],
    "chat": ["chat", "real-time", "websocket"],
    "math": ["mathematics", "number-theory"],
    "quantum": ["quantum-computing", "quantum-information"],
    "pixel": ["pixel-art", "metaverse", "virtual-office"],
    "game": ["game-development", "interactive"],
    "education": ["education", "tutoring", "edtech"],
    "stripe": ["stripe", "payments", "fintech"],
    "dns": ["dns", "networking"],
    "docker": ["docker", "containers"],
    "gitea": ["gitea", "self-hosted-git"],
    "minio": ["minio", "object-storage", "s3-compatible"],
    "headscale": ["headscale", "tailscale", "vpn"],
    "nats": ["nats", "message-queue", "pub-sub"],
}

BASE_TOPICS = ["blackroad-os", "sovereign-infrastructure"]

# Colors
P = "\033[38;5;205m"
G = "\033[0;32m"
B = "\033[38;5;69m"
A = "\033[38;5;214m"
V = "\033[38;5;135m"
R = "\033[0m"
D = "\033[2m"
BOLD = "\033[1m"


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    # Drop and recreate to handle schema changes
    conn.executescript("""
    DROP TABLE IF EXISTS repos;
    DROP TABLE IF EXISTS websites;
    DROP TABLE IF EXISTS subdomains;
    DROP TABLE IF EXISTS topic_suggestions;
    """)
    try:
        conn.execute("DROP TABLE IF EXISTS search_index")
    except Exception:
        pass
    conn.executescript("""
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
        entity_type, org, repo, title, content, tags, url,
        tokenize='porter unicode61'
    );
    CREATE TABLE IF NOT EXISTS repos (
        org TEXT, name TEXT, description TEXT, language TEXT,
        visibility TEXT, updated_at TEXT, has_issues INTEGER,
        stars INTEGER, topics TEXT, url TEXT,
        readme_excerpt TEXT, license TEXT, fork INTEGER DEFAULT 0,
        archived INTEGER DEFAULT 0, default_branch TEXT,
        PRIMARY KEY (org, name)
    );
    CREATE TABLE IF NOT EXISTS websites (
        domain TEXT PRIMARY KEY, title TEXT, description TEXT,
        status_code INTEGER, content_length INTEGER,
        links_count INTEGER DEFAULT 0, last_checked TEXT
    );
    CREATE TABLE IF NOT EXISTS subdomains (
        fqdn TEXT PRIMARY KEY, domain TEXT, subdomain TEXT,
        ip TEXT, proxied INTEGER, record_type TEXT,
        status_code INTEGER, title TEXT, last_checked TEXT
    );
    CREATE TABLE IF NOT EXISTS index_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT, entries INTEGER, duration_ms INTEGER,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS topic_suggestions (
        org TEXT, repo TEXT, suggested_topics TEXT, applied INTEGER DEFAULT 0,
        PRIMARY KEY (org, repo)
    );
    """)
    return conn


def gh_cmd(args, timeout=30):
    """Run gh CLI command and return output"""
    try:
        result = subprocess.run(
            ["gh"] + args,
            capture_output=True, text=True, timeout=timeout
        )
        if result.returncode == 0:
            out = result.stdout.strip()
            if out:
                try:
                    return json.loads(out)
                except json.JSONDecodeError:
                    return out
        return None
    except Exception:
        return None


def curl_fetch(url, timeout=10):
    """Fetch URL and return (status_code, content)"""
    try:
        result = subprocess.run(
            ["curl", "-sL", "-o", "-", "-w", "\n%{http_code}",
             "--max-time", str(timeout), url],
            capture_output=True, text=True, timeout=timeout + 5
        )
        if result.returncode == 0:
            lines = result.stdout.rsplit("\n", 1)
            if len(lines) == 2:
                content, status = lines
                return int(status), content
            return 0, result.stdout
        return 0, ""
    except Exception:
        return 0, ""


def extract_html_meta(html):
    """Extract title, description, and link count from HTML"""
    title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""

    desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']',
                           html, re.IGNORECASE)
    desc = desc_match.group(1).strip() if desc_match else ""

    links = len(re.findall(r'<a\s+[^>]*href=', html, re.IGNORECASE))

    content = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<style[^>]*>.*?</style>', ' ', content, flags=re.IGNORECASE | re.DOTALL)
    content = re.sub(r'<[^>]+>', ' ', content)
    content = re.sub(r'\s+', ' ', content).strip()

    return title, desc, content[:5000], links


def suggest_topics(name, desc, lang):
    """Suggest GitHub topics for a repo based on its name and description"""
    topics = set(BASE_TOPICS)
    text = f"{name} {desc}".lower()

    for keyword, suggested in TOPIC_RULES.items():
        if keyword in text:
            topics.update(suggested)

    # Language-based
    lang_lower = (lang or "").lower()
    if lang_lower == "python":
        topics.add("python")
    elif lang_lower in ("typescript", "javascript"):
        topics.add("typescript") if lang_lower == "typescript" else topics.add("javascript")
    elif lang_lower == "rust":
        topics.add("rust")
    elif lang_lower == "shell":
        topics.add("shell")
        topics.add("bash")

    return sorted(topics)[:20]  # GitHub max 20 topics


def index_org_repos(conn, org):
    """Index all repos in a GitHub org with deep README content"""
    c = conn.cursor()
    start = time.time()
    count = 0

    repos = gh_cmd([
        "repo", "list", org, "--limit", "200",
        "--json", "name,description,primaryLanguage,visibility,updatedAt,stargazerCount,"
                  "repositoryTopics,url,hasIssuesEnabled,isFork,isArchived,defaultBranchRef,"
                  "licenseInfo"
    ])

    if not repos or not isinstance(repos, list):
        return 0

    for repo in repos:
        name = repo.get("name", "")
        desc = repo.get("description", "") or ""
        lang = repo.get("primaryLanguage", {})
        lang_name = lang.get("name", "none") if lang else "none"
        vis = repo.get("visibility", "PUBLIC")
        updated = repo.get("updatedAt", "")
        stars = repo.get("stargazerCount", 0)
        raw_topics = repo.get("repositoryTopics") or []
        topics = ",".join([t.get("name", "") for t in raw_topics])
        url = repo.get("url", f"https://github.com/{org}/{name}")
        has_issues = 1 if repo.get("hasIssuesEnabled") else 0
        is_fork = 1 if repo.get("isFork") else 0
        is_archived = 1 if repo.get("isArchived") else 0
        license_info = repo.get("licenseInfo") or {}
        license_name = license_info.get("spdxId", "") if isinstance(license_info, dict) else ""
        default_branch = ""
        branch_ref = repo.get("defaultBranchRef")
        if branch_ref and isinstance(branch_ref, dict):
            default_branch = branch_ref.get("name", "main")

        # Insert into repos table (enhanced with new columns)
        c.execute("""INSERT OR REPLACE INTO repos
                     (org, name, description, language, visibility, updated_at,
                      has_issues, stars, topics, url, license, fork, archived, default_branch)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                  (org, name, desc, lang_name, vis, updated, has_issues,
                   stars, topics, url, license_name, is_fork, is_archived, default_branch))

        # Build rich search content
        search_content = f"{name} {desc} {lang_name} {topics} {org}"

        # FTS index for the repo
        c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                  ("repo", org, name, name, search_content,
                   f"{lang_name},{vis},{topics}", url))
        count += 1

        # Suggest topics
        suggested = suggest_topics(name, desc, lang_name)
        c.execute("INSERT OR REPLACE INTO topic_suggestions VALUES (?,?,?,0)",
                  (org, name, ",".join(suggested)))

    # Batch fetch READMEs (parallel, up to 8 at a time)
    def fetch_readme(repo_info):
        org_name, repo_name = repo_info
        data = gh_cmd(["api", f"repos/{org_name}/{repo_name}/readme",
                        "--jq", ".content"], timeout=15)
        if data and isinstance(data, str):
            try:
                return org_name, repo_name, base64.b64decode(data).decode("utf-8", errors="ignore")
            except Exception:
                pass
        return org_name, repo_name, None

    repo_list = [(org, r.get("name", "")) for r in repos if r.get("name")]

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(fetch_readme, ri): ri for ri in repo_list}
        for future in as_completed(futures):
            org_name, repo_name, readme_text = future.result()
            if readme_text:
                excerpt = readme_text[:3000]
                c.execute("UPDATE repos SET readme_excerpt = ? WHERE org = ? AND name = ?",
                          (excerpt[:500], org_name, repo_name))
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("readme", org_name, repo_name, f"{repo_name} README",
                           excerpt, org_name, f"https://github.com/{org_name}/{repo_name}#readme"))
                count += 1

    duration = int((time.time() - start) * 1000)
    c.execute("INSERT INTO index_log (source, entries, duration_ms) VALUES (?,?,?)",
              (f"org:{org}", count, duration))
    conn.commit()
    return count


def index_websites(conn):
    """Index all 19 domains + key subdomains"""
    c = conn.cursor()
    start = time.time()
    count = 0

    # Root domains
    urls = [(d, f"https://{d}") for d in DOMAINS]
    # Key subdomains on blackroad.io
    urls += [(f"{sub}.blackroad.io", f"https://{sub}.blackroad.io") for sub in SUBDOMAINS]

    def fetch_site(item):
        domain, url = item
        status, html = curl_fetch(url, timeout=10)
        return domain, url, status, html

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_site, u): u for u in urls}
        for future in as_completed(futures):
            domain, url, status, html = future.result()

            if html and status >= 200 and status < 400:
                title, desc, content, links = extract_html_meta(html)
                title = title or domain
            else:
                title, desc, content, links = domain, "", "", 0

            if "." in domain and domain.count(".") == 1:
                # Root domain
                c.execute("INSERT OR REPLACE INTO websites VALUES (?,?,?,?,?,?,?)",
                          (domain, title, desc, status, len(html) if html else 0,
                           links, datetime.now(timezone.utc).isoformat()))
            else:
                # Subdomain
                parts = domain.split(".", 1)
                sub = parts[0]
                parent = parts[1] if len(parts) > 1 else domain
                c.execute("INSERT OR REPLACE INTO subdomains VALUES (?,?,?,?,?,?,?,?,?)",
                          (domain, parent, sub, "", 1, "CNAME",
                           status, title, datetime.now(timezone.utc).isoformat()))

            if content:
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("website", "domains", domain, title, content,
                           f"website,{domain}", url))
                count += 1

    duration = int((time.time() - start) * 1000)
    c.execute("INSERT INTO index_log (source, entries, duration_ms) VALUES (?,?,?)",
              ("websites", count, duration))
    conn.commit()
    return count


def index_subdomains_from_arch(conn):
    """Index subdomains from SUBDOMAIN-ARCHITECTURE.md"""
    c = conn.cursor()
    count = 0
    arch_file = os.path.join(HOME, "SUBDOMAIN-ARCHITECTURE.md")

    if os.path.exists(arch_file):
        with open(arch_file) as f:
            content = f.read()

        for match in re.finditer(r'\| `([a-z0-9-]+)\.([a-z.]+)` \|', content):
            sub, domain = match.groups()
            fqdn = f"{sub}.{domain}"
            c.execute("""INSERT OR IGNORE INTO subdomains (fqdn, domain, subdomain, ip, proxied, record_type)
                         VALUES (?,?,?,?,?,?)""",
                      (fqdn, domain, sub, "", 1, "CNAME"))
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("subdomain", "dns", fqdn, fqdn,
                       f"{sub} {domain} subdomain dns", domain, f"https://{fqdn}"))
            count += 1

    conn.commit()
    return count


def index_local_memory(conn):
    """Index codex, TILs, journal, Claude memories"""
    c = conn.cursor()
    count = 0

    # Codex
    codex_db = os.path.join(HOME, ".blackroad/memory/codex/codex.db")
    if os.path.exists(codex_db):
        cx = sqlite3.connect(codex_db)
        for name, cat, prob, sol in cx.execute("SELECT name, category, problem, solution FROM solutions"):
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("solution", "codex", str(name), str(name),
                       f"{prob} {sol}", str(cat), ""))
            count += 1
        for name, ptype, desc in cx.execute("SELECT pattern_name, pattern_type, description FROM patterns"):
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("pattern", "codex", str(name), str(name), str(desc), str(ptype), ""))
            count += 1
        for name, cat, pri in cx.execute("SELECT practice_name, category, priority FROM best_practices"):
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("practice", "codex", str(name), str(name),
                       f"{cat} {pri}", str(cat), ""))
            count += 1
        cx.close()

    # TILs
    til_dir = os.path.join(HOME, ".blackroad/memory/til")
    if os.path.isdir(til_dir):
        for f in glob.glob(os.path.join(til_dir, "til-*.json")):
            try:
                with open(f) as fh:
                    d = json.load(fh)
                tid = d.get("til_id", "")
                cat = d.get("category", "")
                learning = d.get("learning", "")
                if tid:
                    c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                              ("til", "memory", tid, f"TIL: {cat}", learning, cat, ""))
                    count += 1
            except Exception:
                continue

    # Journal (last 1000 entries)
    journal = os.path.join(HOME, ".blackroad/memory/journals/master-journal.jsonl")
    if os.path.exists(journal):
        lines = open(journal).readlines()
        for line in lines[-1000:]:
            try:
                d = json.loads(line.strip())
                action = d.get("action", "")
                entity = str(d.get("entity", ""))
                details = str(d.get("details", ""))
                ts = d.get("timestamp", "")[:19]
                eid = f"j-{ts}-{action}"[:64]
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("journal", "memory", eid, f"{action}: {entity}",
                           details, action, ""))
                count += 1
            except Exception:
                continue

    # Claude project memories
    mem_dir = os.path.join(HOME, ".claude/projects/-Users-alexa/memory")
    if os.path.isdir(mem_dir):
        for md_file in glob.glob(os.path.join(mem_dir, "*.md")):
            name = os.path.splitext(os.path.basename(md_file))[0]
            if name == "MEMORY":
                continue
            try:
                with open(md_file, encoding="utf-8", errors="ignore") as fh:
                    text = fh.read()
                desc_match = re.search(r'description:\s*(.+)', text)
                desc = desc_match.group(1) if desc_match else name
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("memory", "claude", name, desc, text[:3000],
                           "claude-memory", ""))
                count += 1
            except Exception:
                continue

    conn.commit()
    return count


def index_local_scripts(conn):
    """Index shell scripts from home dir and operator"""
    c = conn.cursor()
    count = 0

    script_dirs = [
        (HOME, "*.sh", "home"),
        (os.path.join(HOME, "blackroad-operator/scripts"), "**/*.sh", "operator/scripts"),
        (os.path.join(HOME, "blackroad-operator/tools"), "**/*.sh", "operator/tools"),
        (os.path.join(HOME, "blackroad-operator/tools"), "**/*.py", "operator/tools-py"),
    ]

    for base_dir, pattern, source in script_dirs:
        for script in glob.glob(os.path.join(base_dir, pattern), recursive=True):
            name = os.path.basename(script)
            rel = os.path.relpath(script, HOME)
            try:
                with open(script, errors="ignore") as f:
                    content = f.read()[:2000]
                desc = ""
                for line in content.split("\n")[:10]:
                    if line.startswith("#") and not line.startswith("#!"):
                        desc += line.lstrip("# ") + " "
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("script", source, rel, name,
                           f"{desc} {content[:1000]}", "shell", script))
                count += 1
            except Exception:
                continue

    conn.commit()
    return count


def index_local_docs(conn):
    """Index all markdown files in blackroad-operator"""
    c = conn.cursor()
    count = 0
    br_root = os.path.join(HOME, "blackroad-operator")

    # docs/ directory
    docs_dir = os.path.join(br_root, "docs")
    if os.path.isdir(docs_dir):
        for md in glob.glob(os.path.join(docs_dir, "**/*.md"), recursive=True):
            try:
                rel = os.path.relpath(md, br_root)
                name = os.path.splitext(os.path.basename(md))[0]
                with open(md, encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                title = None
                for line in text.split("\n")[:10]:
                    if line.startswith("# "):
                        title = line.lstrip("# ").strip()
                        break
                title = title or name
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("docs", "operator", rel, title, text[:5000],
                           "documentation", ""))
                count += 1
            except Exception:
                continue

    # Root .md files in operator
    for md in glob.glob(os.path.join(br_root, "*.md")):
        name = os.path.splitext(os.path.basename(md))[0]
        if name in ("README", "CLAUDE"):
            continue
        try:
            with open(md, encoding="utf-8", errors="ignore") as f:
                text = f.read()
            title = None
            for line in text.split("\n")[:10]:
                if line.startswith("# "):
                    title = line.lstrip("# ").strip()
                    break
            title = title or name
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("article", "operator", name, title, text[:5000],
                       "root-docs", ""))
            count += 1
        except Exception:
            continue

    # Home directory .md files (50+ docs)
    for md in glob.glob(os.path.join(HOME, "*.md")):
        name = os.path.splitext(os.path.basename(md))[0]
        try:
            with open(md, encoding="utf-8", errors="ignore") as f:
                text = f.read()
            title = None
            for line in text.split("\n")[:10]:
                if line.startswith("# "):
                    title = line.lstrip("# ").strip()
                    break
            title = title or name
            c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("article", "home", name, title, text[:5000],
                       "home-docs", ""))
            count += 1
        except Exception:
            continue

    # roadnet
    roadnet_dir = os.path.join(HOME, "roadnet")
    if os.path.isdir(roadnet_dir):
        for md in glob.glob(os.path.join(roadnet_dir, "*.md")):
            name = os.path.splitext(os.path.basename(md))[0]
            try:
                with open(md, encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                title = None
                for line in text.split("\n")[:10]:
                    if line.startswith("# "):
                        title = line.lstrip("# ").strip()
                        break
                title = title or name
                c.execute("INSERT INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("infrastructure", "roadnet", name, title, text[:5000],
                           "roadnet", ""))
                count += 1
            except Exception:
                continue

    conn.commit()
    return count


def generate_sitemaps(conn):
    """Generate sitemap.xml for each domain"""
    os.makedirs(SITEMAP_DIR, exist_ok=True)
    c = conn.cursor()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Per-domain sitemaps
    for domain in DOMAINS:
        urls = []

        # Root page
        urls.append({"loc": f"https://{domain}/", "priority": "1.0", "changefreq": "daily"})

        # Subdomains that belong to this domain
        for row in c.execute("SELECT fqdn, status_code FROM subdomains WHERE domain = ?", (domain,)):
            fqdn, status = row
            if status and status >= 200 and status < 400:
                urls.append({"loc": f"https://{fqdn}/", "priority": "0.7", "changefreq": "weekly"})

        # GitHub repos (for blackroad.io, link to all org repos)
        if domain == "blackroad.io":
            for row in c.execute("SELECT org, name FROM repos WHERE archived = 0 LIMIT 200"):
                org, name = row
                urls.append({
                    "loc": f"https://github.com/{org}/{name}",
                    "priority": "0.5",
                    "changefreq": "monthly"
                })

        # Write sitemap
        sitemap_path = os.path.join(SITEMAP_DIR, f"sitemap-{domain.replace('.', '-')}.xml")
        with open(sitemap_path, "w") as f:
            f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
            f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
            for u in urls:
                f.write(f'  <url>\n')
                f.write(f'    <loc>{u["loc"]}</loc>\n')
                f.write(f'    <lastmod>{now}</lastmod>\n')
                f.write(f'    <changefreq>{u["changefreq"]}</changefreq>\n')
                f.write(f'    <priority>{u["priority"]}</priority>\n')
                f.write(f'  </url>\n')
            f.write('</urlset>\n')

        print(f"  {G}✓{R} {sitemap_path} ({len(urls)} URLs)")

    # Master sitemap index
    index_path = os.path.join(SITEMAP_DIR, "sitemap-index.xml")
    with open(index_path, "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for domain in DOMAINS:
            fname = f"sitemap-{domain.replace('.', '-')}.xml"
            f.write(f'  <sitemap>\n')
            f.write(f'    <loc>https://{domain}/{fname}</loc>\n')
            f.write(f'    <lastmod>{now}</lastmod>\n')
            f.write(f'  </sitemap>\n')
        f.write('</sitemapindex>\n')

    print(f"\n  {BOLD}{G}Sitemap index:{R} {index_path}")
    print(f"  {D}{len(DOMAINS)} domain sitemaps generated{R}")


def apply_topics(conn, dry_run=True):
    """Set GitHub topics on repos that are missing good topics"""
    c = conn.cursor()
    rows = c.execute("""
        SELECT ts.org, ts.repo, ts.suggested_topics, r.topics
        FROM topic_suggestions ts
        JOIN repos r ON ts.org = r.org AND ts.repo = r.name
        WHERE ts.applied = 0 AND r.archived = 0
        ORDER BY ts.org, ts.repo
    """).fetchall()

    applied = 0
    for org, repo, suggested, current in rows:
        current_set = set(t.strip() for t in (current or "").split(",") if t.strip())
        suggested_set = set(t.strip() for t in suggested.split(",") if t.strip())
        new_topics = suggested_set - current_set
        merged = sorted(current_set | suggested_set)[:20]

        if not new_topics:
            continue

        print(f"  {B}{org}/{repo}{R}: +{', '.join(new_topics)}")

        if not dry_run:
            # Apply via gh CLI
            topic_args = []
            for t in merged:
                topic_args.extend(["--add-topic", t])
            result = subprocess.run(
                ["gh", "repo", "edit", f"{org}/{repo}"] + topic_args,
                capture_output=True, text=True, timeout=15
            )
            if result.returncode == 0:
                c.execute("UPDATE topic_suggestions SET applied = 1 WHERE org = ? AND repo = ?",
                          (org, repo))
                applied += 1
            else:
                print(f"    {D}Error: {result.stderr.strip()}{R}")

    conn.commit()
    mode = "DRY RUN" if dry_run else "APPLIED"
    print(f"\n  {BOLD}{G}{mode}:{R} {applied if not dry_run else len(rows)} repos with topic suggestions")
    if dry_run:
        print(f"  {D}Run with --apply to set topics: python3 index-all-orgs.py topics --apply{R}")


def export_d1_sql(conn):
    """Export index as SQL INSERT statements for D1 import"""
    c = conn.cursor()
    export_path = os.path.join(HOME, "blackroad-operator/sitemaps/search-d1-export.sql")
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    with open(export_path, "w") as f:
        f.write("-- BlackRoad Search D1 Export\n")
        f.write(f"-- Generated: {datetime.now(timezone.utc).isoformat()}\n\n")

        f.write("""CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE, domain TEXT, title TEXT, description TEXT,
  content TEXT, category TEXT, tags TEXT,
  status_code INTEGER DEFAULT 200, indexed_at TEXT
);\n\n""")

        # Export repos as pages
        for row in c.execute("SELECT org, name, description, language, url, topics FROM repos WHERE archived = 0"):
            org, name, desc, lang, url, topics = row
            desc_safe = (desc or "").replace("'", "''")
            title_safe = f"{org}/{name}".replace("'", "''")
            tags_safe = (topics or "").replace("'", "''")
            f.write(f"INSERT OR IGNORE INTO pages (url, domain, title, description, content, category, tags, indexed_at) "
                    f"VALUES ('{url}', 'github.com', '{title_safe}', '{desc_safe}', "
                    f"'{desc_safe} {lang} {tags_safe}', 'repository', '{tags_safe}', "
                    f"'{datetime.now(timezone.utc).isoformat()}');\n")

        # Export websites
        for row in c.execute("SELECT domain, title, description FROM websites WHERE status_code >= 200"):
            domain, title, desc = row
            title_safe = (title or "").replace("'", "''")
            desc_safe = (desc or "").replace("'", "''")
            f.write(f"INSERT OR IGNORE INTO pages (url, domain, title, description, category, indexed_at) "
                    f"VALUES ('https://{domain}/', '{domain}', '{title_safe}', '{desc_safe}', "
                    f"'website', '{datetime.now(timezone.utc).isoformat()}');\n")

        f.write("\n-- Rebuild FTS index after import\n")

    count = c.execute("SELECT COUNT(*) FROM repos WHERE archived = 0").fetchone()[0]
    count += c.execute("SELECT COUNT(*) FROM websites WHERE status_code >= 200").fetchone()[0]
    print(f"  {G}✓{R} Exported {count} entries to {export_path}")


def print_stats(conn):
    """Print comprehensive index statistics"""
    c = conn.cursor()
    print(f"\n{P}╔════════════════════════════════════════════════════════════╗{R}")
    print(f"{P}║  BlackRoad Cross-Org Search Index v2                       ║{R}")
    print(f"{P}╚════════════════════════════════════════════════════════════╝{R}")

    total = c.execute("SELECT COUNT(*) FROM search_index").fetchone()[0]
    print(f"\n  {BOLD}Total indexed entries:{R} {G}{total}{R}")

    print(f"\n  {B}By type:{R}")
    for row in c.execute("SELECT entity_type, COUNT(*) FROM search_index GROUP BY entity_type ORDER BY COUNT(*) DESC"):
        bar = "█" * min(40, row[1] // 5)
        print(f"    {row[0]:20s} {row[1]:>6}  {D}{bar}{R}")

    print(f"\n  {B}By org:{R}")
    for row in c.execute("SELECT org, COUNT(*) FROM search_index GROUP BY org ORDER BY COUNT(*) DESC LIMIT 20"):
        print(f"    {row[0]:25s} {row[1]:>6}")

    repo_count = c.execute("SELECT COUNT(*) FROM repos").fetchone()[0]
    active_repos = c.execute("SELECT COUNT(*) FROM repos WHERE archived = 0").fetchone()[0]
    forked_repos = c.execute("SELECT COUNT(*) FROM repos WHERE fork = 1").fetchone()[0]
    website_count = c.execute("SELECT COUNT(*) FROM websites").fetchone()[0]
    live_websites = c.execute("SELECT COUNT(*) FROM websites WHERE status_code >= 200 AND status_code < 400").fetchone()[0]
    subdomain_count = c.execute("SELECT COUNT(*) FROM subdomains").fetchone()[0]

    print(f"\n  {A}Repos:{R} {repo_count} total, {active_repos} active, {forked_repos} forks")
    print(f"  {A}Websites:{R} {website_count} domains ({live_websites} live)")
    print(f"  {A}Subdomains:{R} {subdomain_count}")

    # Language breakdown
    print(f"\n  {B}Top languages:{R}")
    for row in c.execute("""SELECT language, COUNT(*) FROM repos
                           WHERE language != 'none' AND archived = 0
                           GROUP BY language ORDER BY COUNT(*) DESC LIMIT 10"""):
        print(f"    {row[0]:15s} {row[1]:>4}")

    # Topics coverage
    with_topics = c.execute("SELECT COUNT(*) FROM repos WHERE topics != '' AND topics IS NOT NULL").fetchone()[0]
    without_topics = c.execute("SELECT COUNT(*) FROM repos WHERE (topics = '' OR topics IS NULL) AND archived = 0").fetchone()[0]
    print(f"\n  {A}Topic coverage:{R} {with_topics} repos with topics, {without_topics} missing topics")

    # Suggestions pending
    pending = c.execute("SELECT COUNT(*) FROM topic_suggestions WHERE applied = 0").fetchone()[0]
    if pending:
        print(f"  {V}Topic suggestions pending:{R} {pending}")

    print(f"\n  {B}Recent index runs:{R}")
    for row in c.execute("SELECT source, entries, duration_ms, indexed_at FROM index_log ORDER BY indexed_at DESC LIMIT 15"):
        print(f"    {row[0]:30s} {row[1]:>5} entries  {row[2]:>6}ms  {D}{row[3]}{R}")

    print(f"\n  {D}Database: {DB_PATH}{R}")
    if os.path.exists(DB_PATH):
        db_size = os.path.getsize(DB_PATH) / 1024 / 1024
        print(f"  {D}Size: {db_size:.1f} MB{R}")


def search(conn, query, limit=20):
    """Search the index with highlighted snippets"""
    c = conn.cursor()

    try:
        results = c.execute("""
            SELECT entity_type, org, repo, title,
                   snippet(search_index, 4, '\033[1;33m', '\033[0m', '...', 40),
                   url, rank
            FROM search_index
            WHERE search_index MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (query, limit)).fetchall()
    except Exception:
        results = []

    # Fallback to LIKE
    if not results:
        try:
            results = c.execute("""
                SELECT entity_type, org, repo, title,
                       substr(content, max(1, instr(lower(content), lower(?))-40), 120),
                       url, 0
                FROM search_index
                WHERE lower(content) LIKE ? OR lower(title) LIKE ?
                LIMIT ?
            """, (query, f"%{query.lower()}%", f"%{query.lower()}%", limit)).fetchall()
        except Exception:
            results = []

    return results


def main():
    if len(sys.argv) > 1:
        cmd = sys.argv[1]

        if cmd == "search":
            query = " ".join(sys.argv[2:])
            if not query:
                print("Usage: index-all-orgs.py search <query>")
                sys.exit(1)
            conn = sqlite3.connect(DB_PATH)
            results = search(conn, query)
            if not results:
                print("  No results found.")
            else:
                print(f"\n  {A}{BOLD}Search:{R} \"{query}\"")
                print(f"  {D}{'─' * 58}{R}\n")
                prev_type = None
                for etype, org, repo, title, snippet, url, rank in results:
                    if etype != prev_type:
                        print(f"  {D}── {etype.upper()}{R}")
                        prev_type = etype
                    print(f"  {G}[{org}]{R} {B}{repo}{R}: {title}")
                    if snippet:
                        print(f"    {snippet}")
                    if url:
                        print(f"    {D}{url}{R}")
                print(f"\n  {D}{len(results)} results{R}\n")
            conn.close()
            return

        if cmd == "stats":
            conn = sqlite3.connect(DB_PATH)
            print_stats(conn)
            conn.close()
            return

        if cmd == "sitemap":
            conn = sqlite3.connect(DB_PATH)
            print(f"\n{P}Generating sitemaps...{R}\n")
            generate_sitemaps(conn)
            conn.close()
            return

        if cmd == "topics":
            conn = sqlite3.connect(DB_PATH)
            dry_run = "--apply" not in sys.argv
            print(f"\n{P}GitHub Topic Suggestions{R}\n")
            apply_topics(conn, dry_run=dry_run)
            conn.close()
            return

        if cmd == "export-d1":
            conn = sqlite3.connect(DB_PATH)
            print(f"\n{P}Exporting index for D1...{R}\n")
            export_d1_sql(conn)
            conn.close()
            return

    # Full rebuild
    print(f"\n{P}╔════════════════════════════════════════════════════════════╗{R}")
    print(f"{P}║  BlackRoad Cross-Org Search Index Builder v2               ║{R}")
    print(f"{P}╚════════════════════════════════════════════════════════════╝{R}")
    print(f"{D}Indexing all repos across 16 orgs + domains + subdomains + memory{R}\n")

    conn = init_db()

    # Clear for full rebuild
    conn.execute("DELETE FROM search_index")
    conn.commit()

    total = 0
    t0 = time.time()

    # Index all GitHub orgs
    for org in ORGS:
        count = index_org_repos(conn, org)
        total += count
        print(f"  {G}✓{R} {org}: {BOLD}{count}{R} entries")

    # Index websites + subdomains
    count = index_websites(conn)
    total += count
    print(f"  {G}✓{R} Websites + subdomains: {BOLD}{count}{R} entries")

    count = index_subdomains_from_arch(conn)
    total += count
    print(f"  {G}✓{R} Subdomain architecture: {BOLD}{count}{R} entries")

    # Index local memory
    count = index_local_memory(conn)
    total += count
    print(f"  {G}✓{R} Memory (codex/TIL/journal/claude): {BOLD}{count}{R} entries")

    # Index scripts
    count = index_local_scripts(conn)
    total += count
    print(f"  {G}✓{R} Scripts: {BOLD}{count}{R} entries")

    # Index docs
    count = index_local_docs(conn)
    total += count
    print(f"  {G}✓{R} Documentation: {BOLD}{count}{R} entries")

    elapsed = time.time() - t0
    conn.execute("INSERT INTO index_log (source, entries, duration_ms) VALUES (?,?,?)",
                 ("full-rebuild", total, int(elapsed * 1000)))
    conn.commit()

    print(f"\n  {BOLD}{G}Total: {total} entries indexed in {elapsed:.1f}s{R}")

    # Auto-generate sitemaps
    print(f"\n{P}Generating sitemaps...{R}\n")
    generate_sitemaps(conn)

    print_stats(conn)
    conn.close()


if __name__ == "__main__":
    main()
