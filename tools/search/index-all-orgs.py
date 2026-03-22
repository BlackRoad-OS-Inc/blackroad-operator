#!/usr/bin/env python3
"""BlackRoad Cross-Org Search Index Builder
Indexes ALL 623 repos across 16 GitHub orgs + 19 live websites + 1553 subdomains
into a unified FTS5 SQLite database for instant search.
"""

import sqlite3
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

HOME = os.path.expanduser("~")
DB_PATH = os.path.join(HOME, ".blackroad/search-all-orgs.db")

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

# Colors
P = "\033[38;5;205m"
G = "\033[0;32m"
B = "\033[38;5;69m"
A = "\033[38;5;214m"
R = "\033[0m"
D = "\033[2m"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript("""
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
        entity_type, org, repo, title, content, tags, url,
        tokenize='porter unicode61'
    );
    CREATE TABLE IF NOT EXISTS repos (
        org TEXT, name TEXT, description TEXT, language TEXT,
        visibility TEXT, updated_at TEXT, has_issues INTEGER,
        stars INTEGER, topics TEXT, url TEXT,
        PRIMARY KEY (org, name)
    );
    CREATE TABLE IF NOT EXISTS websites (
        domain TEXT PRIMARY KEY, title TEXT, status_code INTEGER,
        content_length INTEGER, last_checked TEXT
    );
    CREATE TABLE IF NOT EXISTS subdomains (
        fqdn TEXT PRIMARY KEY, domain TEXT, subdomain TEXT,
        ip TEXT, proxied INTEGER, record_type TEXT
    );
    CREATE TABLE IF NOT EXISTS index_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT, entries INTEGER, duration_ms INTEGER,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    """)
    return conn


def gh_cmd(args):
    """Run gh CLI command and return JSON output"""
    try:
        result = subprocess.run(
            ["gh"] + args,
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return json.loads(result.stdout) if result.stdout.strip() else []
        return []
    except Exception:
        return []


def curl_cmd(url, timeout=10):
    """Fetch URL content"""
    try:
        result = subprocess.run(
            ["curl", "-sL", "--max-time", str(timeout), url],
            capture_output=True, text=True, timeout=timeout + 5
        )
        return result.stdout if result.returncode == 0 else ""
    except Exception:
        return ""


def index_org_repos(conn, org):
    """Index all repos in a GitHub org"""
    c = conn.cursor()
    start = time.time()
    count = 0

    repos = gh_cmd([
        "repo", "list", org, "--limit", "200",
        "--json", "name,description,primaryLanguage,visibility,updatedAt,stargazerCount,repositoryTopics,url,hasIssuesEnabled"
    ])

    for repo in repos:
        name = repo.get("name", "")
        desc = repo.get("description", "") or ""
        lang = repo.get("primaryLanguage", {})
        lang_name = lang.get("name", "none") if lang else "none"
        vis = repo.get("visibility", "PUBLIC")
        updated = repo.get("updatedAt", "")
        stars = repo.get("stargazerCount", 0)
        topics = ",".join([t.get("name", "") for t in (repo.get("repositoryTopics") or [])])
        url = repo.get("url", f"https://github.com/{org}/{name}")
        has_issues = 1 if repo.get("hasIssuesEnabled") else 0

        # Insert into repos table
        c.execute("""INSERT OR REPLACE INTO repos VALUES (?,?,?,?,?,?,?,?,?,?)""",
                  (org, name, desc, lang_name, vis, updated, has_issues, stars, topics, url))

        # Insert into FTS search index
        search_content = f"{name} {desc} {lang_name} {topics} {org}"
        c.execute("""INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)""",
                  ("repo", org, name, name, search_content, f"{lang_name},{vis},{topics}", url))
        count += 1

        # Try to get README content for deeper indexing
        readme_data = gh_cmd([
            "api", f"repos/{org}/{name}/contents/README.md",
            "--jq", ".content"
        ])
        if readme_data and isinstance(readme_data, str):
            try:
                import base64
                readme_text = base64.b64decode(readme_data).decode("utf-8", errors="ignore")[:3000]
                c.execute("""INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)""",
                          ("readme", org, name, f"{name} README", readme_text, org, f"{url}#readme"))
                count += 1
            except Exception:
                pass

    duration = int((time.time() - start) * 1000)
    c.execute("INSERT INTO index_log (source, entries, duration_ms) VALUES (?,?,?)",
              (f"org:{org}", count, duration))
    conn.commit()
    return count


def index_websites(conn):
    """Index all 19 domain websites by fetching their HTML"""
    c = conn.cursor()
    start = time.time()
    count = 0

    for domain in DOMAINS:
        url = f"https://{domain}"
        html = curl_cmd(url, timeout=10)

        if html:
            # Extract title
            import re
            title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1).strip() if title_match else domain

            # Strip HTML for content
            content = re.sub(r'<[^>]+>', ' ', html)
            content = re.sub(r'\s+', ' ', content).strip()[:3000]

            status = 200
            content_length = len(html)
        else:
            title = domain
            content = ""
            status = 0
            content_length = 0

        c.execute("INSERT OR REPLACE INTO websites VALUES (?,?,?,?,?)",
                  (domain, title, status, content_length, datetime.now().isoformat()))

        if content:
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("website", "domains", domain, title, content, "website", url))
            count += 1

    duration = int((time.time() - start) * 1000)
    c.execute("INSERT INTO index_log (source, entries, duration_ms) VALUES (?,?,?)",
              ("websites", count, duration))
    conn.commit()
    return count


def index_subdomains(conn):
    """Index all subdomains from the architecture file"""
    c = conn.cursor()
    count = 0
    arch_file = os.path.join(HOME, "SUBDOMAIN-ARCHITECTURE.md")

    if os.path.exists(arch_file):
        with open(arch_file) as f:
            content = f.read()

        # Parse subdomain entries from markdown tables
        import re
        for match in re.finditer(r'\| `([a-z0-9-]+)\.([a-z.]+)` \|', content):
            sub, domain = match.groups()
            fqdn = f"{sub}.{domain}"
            c.execute("INSERT OR REPLACE INTO subdomains VALUES (?,?,?,?,?,?)",
                      (fqdn, domain, sub, "159.65.43.12", 1, "A"))
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("subdomain", "dns", fqdn, fqdn, f"{sub} {domain} subdomain", domain, f"https://{fqdn}"))
            count += 1

    conn.commit()
    return count


def index_local_memory(conn):
    """Index codex, TILs, journal from local memory system"""
    c = conn.cursor()
    count = 0

    # Codex
    codex_db = os.path.join(HOME, ".blackroad/memory/codex/codex.db")
    if os.path.exists(codex_db):
        cx = sqlite3.connect(codex_db)
        for name, cat, prob, sol in cx.execute("SELECT name, category, problem, solution FROM solutions"):
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("solution", "codex", name, name, f"{prob} {sol}", str(cat), ""))
            count += 1
        for name, ptype, desc in cx.execute("SELECT pattern_name, pattern_type, description FROM patterns"):
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("pattern", "codex", name, name, str(desc), str(ptype), ""))
            count += 1
        cx.close()

    # TILs
    til_dir = os.path.join(HOME, ".blackroad/memory/til")
    if os.path.isdir(til_dir):
        import glob
        for f in glob.glob(os.path.join(til_dir, "til-*.json")):
            try:
                with open(f) as fh:
                    d = json.load(fh)
                tid = d.get("til_id", "")
                cat = d.get("category", "")
                learning = d.get("learning", "")
                if tid:
                    c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                              ("til", "memory", tid, f"TIL: {cat}", learning, cat, ""))
                    count += 1
            except Exception:
                continue

    # Journal (last 500 entries)
    journal = os.path.join(HOME, ".blackroad/memory/journals/master-journal.jsonl")
    if os.path.exists(journal):
        lines = open(journal).readlines()
        for line in lines[-500:]:
            try:
                d = json.loads(line.strip())
                action = d.get("action", "")
                entity = str(d.get("entity", ""))
                details = str(d.get("details", ""))
                ts = d.get("timestamp", "")[:19]
                eid = f"j-{ts}-{action}"[:64]
                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                          ("journal", "memory", eid, f"{action}: {entity}", details, action, ""))
                count += 1
            except Exception:
                continue

    conn.commit()
    return count


def index_local_scripts(conn):
    """Index all shell scripts across the system"""
    c = conn.cursor()
    count = 0
    import glob

    # Home dir scripts
    for sh in glob.glob(os.path.join(HOME, "*.sh")):
        name = os.path.basename(sh)
        try:
            with open(sh, errors="ignore") as f:
                content = f.read()[:1000]
            # Extract description from comments
            desc = ""
            for line in content.split("\n")[:5]:
                if line.startswith("#") and not line.startswith("#!"):
                    desc += line.lstrip("# ") + " "
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("script", "home", name, name, f"{desc} {content[:500]}", "shell", sh))
            count += 1
        except Exception:
            continue

    # Operator scripts
    for sh in glob.glob(os.path.join(HOME, "blackroad-operator/scripts/**/*.sh"), recursive=True):
        name = os.path.basename(sh)
        rel = os.path.relpath(sh, os.path.join(HOME, "blackroad-operator"))
        try:
            with open(sh, errors="ignore") as f:
                content = f.read()[:1000]
            desc = ""
            for line in content.split("\n")[:5]:
                if line.startswith("#") and not line.startswith("#!"):
                    desc += line.lstrip("# ") + " "
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("script", "operator", rel, name, f"{desc} {content[:500]}", "shell", sh))
            count += 1
        except Exception:
            continue

    # Operator tools
    for sh in glob.glob(os.path.join(HOME, "blackroad-operator/tools/**/*.sh"), recursive=True):
        name = os.path.basename(sh)
        rel = os.path.relpath(sh, os.path.join(HOME, "blackroad-operator"))
        try:
            with open(sh, errors="ignore") as f:
                content = f.read()[:1000]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?,?)",
                      ("tool", "operator", rel, name, content[:500], "shell", sh))
            count += 1
        except Exception:
            continue

    conn.commit()
    return count


def print_stats(conn):
    """Print index statistics"""
    c = conn.cursor()
    print(f"\n{P}╔════════════════════════════════════════════════════════════╗{R}")
    print(f"{P}║  BlackRoad Cross-Org Search Index — Complete               ║{R}")
    print(f"{P}╚════════════════════════════════════════════════════════════╝{R}")

    total = c.execute("SELECT COUNT(*) FROM search_index").fetchone()[0]
    print(f"\n  {G}Total indexed entries:{R} {total}")

    print(f"\n  {B}By type:{R}")
    for row in c.execute("SELECT entity_type, COUNT(*) FROM search_index GROUP BY entity_type ORDER BY COUNT(*) DESC"):
        print(f"    {row[0]:20s} {row[1]:>6}")

    print(f"\n  {B}By org:{R}")
    for row in c.execute("SELECT org, COUNT(*) FROM search_index GROUP BY org ORDER BY COUNT(*) DESC LIMIT 20"):
        print(f"    {row[0]:25s} {row[1]:>6}")

    repo_count = c.execute("SELECT COUNT(*) FROM repos").fetchone()[0]
    website_count = c.execute("SELECT COUNT(*) FROM websites").fetchone()[0]
    subdomain_count = c.execute("SELECT COUNT(*) FROM subdomains").fetchone()[0]

    print(f"\n  {A}Repos indexed:{R} {repo_count}")
    print(f"  {A}Websites indexed:{R} {website_count}")
    print(f"  {A}Subdomains indexed:{R} {subdomain_count}")

    print(f"\n  {B}Index log:{R}")
    for row in c.execute("SELECT source, entries, duration_ms FROM index_log ORDER BY indexed_at DESC LIMIT 20"):
        print(f"    {row[0]:30s} {row[1]:>5} entries  {row[2]:>6}ms")

    print(f"\n  {D}Database: {DB_PATH}{R}")
    db_size = os.path.getsize(DB_PATH) / 1024 / 1024
    print(f"  {D}Size: {db_size:.1f} MB{R}")


def search(conn, query, limit=20):
    """Search the index"""
    c = conn.cursor()
    results = c.execute("""
        SELECT entity_type, org, repo, title, snippet(search_index, 4, '>>>', '<<<', '...', 30), url
        FROM search_index
        WHERE search_index MATCH ?
        ORDER BY rank
        LIMIT ?
    """, (query, limit)).fetchall()
    return results


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "search":
        query = " ".join(sys.argv[2:])
        if not query:
            print("Usage: index-all-orgs.py search <query>")
            sys.exit(1)
        conn = sqlite3.connect(DB_PATH)
        results = search(conn, query)
        if not results:
            print("No results found.")
        else:
            for r in results:
                etype, org, repo, title, snippet, url = r
                print(f"  {G}[{etype}]{R} {B}{org}/{repo}{R}: {title}")
                print(f"    {D}{snippet}{R}")
                if url:
                    print(f"    {B}{url}{R}")
                print()
        conn.close()
        return

    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        conn = sqlite3.connect(DB_PATH)
        print_stats(conn)
        conn.close()
        return

    # Full rebuild
    print(f"{P}BlackRoad Cross-Org Search Index Builder{R}")
    print(f"{D}Indexing 623 repos across 16 orgs + 19 websites + memory{R}\n")

    conn = init_db()

    # Clear existing index for rebuild
    conn.execute("DELETE FROM search_index")
    conn.commit()

    total = 0

    # Index all orgs
    for org in ORGS:
        count = index_org_repos(conn, org)
        total += count
        print(f"  {G}✓{R} {org}: {count} entries")

    # Index websites
    count = index_websites(conn)
    total += count
    print(f"  {G}✓{R} Websites: {count} entries")

    # Index subdomains
    count = index_subdomains(conn)
    total += count
    print(f"  {G}✓{R} Subdomains: {count} entries")

    # Index local memory
    count = index_local_memory(conn)
    total += count
    print(f"  {G}✓{R} Memory (codex/TIL/journal): {count} entries")

    # Index local scripts
    count = index_local_scripts(conn)
    total += count
    print(f"  {G}✓{R} Scripts: {count} entries")

    conn.commit()
    print_stats(conn)
    conn.close()


if __name__ == "__main__":
    main()
