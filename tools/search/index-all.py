#!/usr/bin/env python3
"""BlackRoad Unified Index Builder — indexes everything into search.db FTS5"""

import sqlite3
import json
import os
import re
import glob
import time
import sys
from pathlib import Path

HOME = os.path.expanduser("~")
DB_PATH = os.path.join(HOME, ".blackroad/search.db")
CODEX_DB = os.path.join(HOME, ".blackroad/memory/codex/codex.db")
TASKS_DB = os.path.join(HOME, ".blackroad/memory/tasks.db")
INDEX_DB = os.path.join(HOME, ".blackroad/memory/indexes/indexes.db")
JOURNAL = os.path.join(HOME, ".blackroad/memory/journals/master-journal.jsonl")
TIL_DIR = os.path.join(HOME, ".blackroad/memory/til")
SNIPPET_DB = os.path.join(HOME, ".blackroad/snippet-manager/snippets.db")
BR_ROOT = os.environ.get("BR_ROOT", os.path.join(HOME, "blackroad-operator"))
WEBSITES_DIR = os.path.join(BR_ROOT, "websites")

# Colors
G = "\033[0;32m"
A = "\033[38;5;214m"
V = "\033[38;5;135m"
B = "\033[1m"
D = "\033[2m"
N = "\033[0m"


def init_db(conn):
    conn.executescript("""
    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
        entity_type, entity_id, title, content, tags, metadata,
        tokenize='porter unicode61'
    );
    CREATE TABLE IF NOT EXISTS search_meta (
        entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP, word_count INTEGER,
        PRIMARY KEY (entity_type, entity_id)
    );
    CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT NOT NULL,
        results_count INTEGER, searched_at TEXT DEFAULT CURRENT_TIMESTAMP, user_id TEXT
    );
    CREATE TABLE IF NOT EXISTS synonyms (word TEXT PRIMARY KEY, synonyms TEXT);
    CREATE TABLE IF NOT EXISTS index_stats (
        source TEXT PRIMARY KEY, entry_count INTEGER DEFAULT 0,
        last_indexed TEXT, duration_ms INTEGER
    );
    """)


def strip_html(text):
    """Remove HTML tags and decode common entities"""
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&')
    text = text.replace('&lt;', '<').replace('&gt;', '>')
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_title(html):
    m = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None


def index_codex(conn):
    if not os.path.exists(CODEX_DB):
        return 0
    cx = sqlite3.connect(CODEX_DB)
    c = conn.cursor()
    count = 0

    for name, cat, prob, sol in cx.execute("SELECT name, category, problem, solution FROM solutions"):
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("solution", name, name, f"{prob} {sol}", str(cat), "codex"))
        count += 1

    for name, ptype, desc in cx.execute("SELECT pattern_name, pattern_type, description FROM patterns"):
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("pattern", name, name, str(desc), str(ptype), "codex"))
        count += 1

    for name, cat, pri in cx.execute("SELECT practice_name, category, priority FROM best_practices"):
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("practice", name, name, f"{cat} {pri}", str(cat), "codex"))
        count += 1

    for name, desc, sev in cx.execute("SELECT name, description, severity FROM anti_patterns"):
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("anti-pattern", name, name, str(desc), str(sev), "codex"))
        count += 1

    # Templates
    for row in cx.execute("SELECT template_name, template_type, content FROM templates"):
        name, ttype, content = row
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("template", name, name, str(content)[:2000], str(ttype), "codex"))
        count += 1

    cx.close()
    return count


def index_tils(conn):
    if not os.path.isdir(TIL_DIR):
        return 0
    c = conn.cursor()
    count = 0

    for f in glob.glob(os.path.join(TIL_DIR, "til-*.json")):
        try:
            with open(f) as fh:
                d = json.load(fh)
            tid = d.get("til_id", "")
            cat = d.get("category", "")
            learning = d.get("learning", "")
            broadcaster = d.get("broadcaster", "")
            if not tid:
                continue
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("til", tid, f"TIL: {cat}", learning, cat, broadcaster))
            count += 1
        except Exception:
            continue

    return count


def index_journal(conn):
    if not os.path.exists(JOURNAL):
        return 0
    c = conn.cursor()
    count = 0

    with open(JOURNAL) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
                ts = d.get("timestamp", "")[:19]
                action = d.get("action", "unknown")
                entity = str(d.get("entity", ""))
                details = str(d.get("details", ""))
                agent = str(d.get("agent_hash", ""))[:16]
                eid = f"journal-{ts}-{action}-{entity}"[:128]
                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                          ("journal", eid, f"{action}: {entity}", details, action, f"agent:{agent} ts:{ts}"))
                count += 1
            except Exception:
                continue

    return count


def index_websites(conn):
    if not os.path.isdir(WEBSITES_DIR):
        return 0
    c = conn.cursor()
    count = 0

    for site_dir in sorted(glob.glob(os.path.join(WEBSITES_DIR, "*/"))):
        site_name = os.path.basename(site_dir.rstrip("/"))
        if site_name == "_shared":
            continue

        # Index all HTML files in the site
        for html_file in glob.glob(os.path.join(site_dir, "**/*.html"), recursive=True):
            try:
                with open(html_file, encoding="utf-8", errors="ignore") as fh:
                    html = fh.read()
                title = extract_title(html) or site_name
                content = strip_html(html)[:3000]
                rel_path = os.path.relpath(html_file, WEBSITES_DIR)
                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                          ("website", rel_path, title, content, site_name, "websites"))
                count += 1
            except Exception:
                continue

    return count


def index_repos(conn):
    c = conn.cursor()
    count = 0

    # All READMEs in orgs/
    for readme in glob.glob(os.path.join(BR_ROOT, "orgs/*/*/README.md")) + \
                  glob.glob(os.path.join(BR_ROOT, "orgs/*/README.md")):
        try:
            repo_path = os.path.dirname(readme)
            repo_name = os.path.basename(repo_path)
            org_name = os.path.basename(os.path.dirname(repo_path))
            with open(readme, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = text.split("\n")[0].lstrip("# ").strip() or repo_name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("repo", f"{org_name}/{repo_name}", title, text[:3000], org_name, "repos"))
            count += 1
        except Exception:
            continue

    # Also CLAUDE.md files (rich context)
    for claude_md in glob.glob(os.path.join(BR_ROOT, "orgs/*/*/CLAUDE.md")):
        try:
            repo_path = os.path.dirname(claude_md)
            repo_name = os.path.basename(repo_path)
            org_name = os.path.basename(os.path.dirname(repo_path))
            with open(claude_md, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("repo-docs", f"{org_name}/{repo_name}/CLAUDE.md",
                       f"{repo_name} CLAUDE.md", text[:5000], org_name, "repos"))
            count += 1
        except Exception:
            continue

    return count


def index_tools(conn):
    c = conn.cursor()
    count = 0

    for tool_dir in sorted(glob.glob(os.path.join(BR_ROOT, "tools/*/"))):
        tool_name = os.path.basename(tool_dir.rstrip("/"))
        script = os.path.join(tool_dir, f"br-{tool_name}.sh")
        if not os.path.exists(script):
            continue
        try:
            with open(script, encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()[:20]
            desc = " ".join(l.lstrip("# ").strip() for l in lines
                           if l.startswith("#") and not l.startswith("#!"))
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("tool", tool_name, f"br {tool_name}", desc[:1000], "cli tool", "tools"))
            count += 1
        except Exception:
            continue

    return count


def index_snippets(conn):
    if not os.path.exists(SNIPPET_DB):
        return 0
    c = conn.cursor()
    sx = sqlite3.connect(SNIPPET_DB)
    count = 0

    for name, lang, desc, code in sx.execute("SELECT name, language, description, code FROM snippets"):
        c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                  ("snippet", str(name), str(name), f"{desc} {code}"[:2000], str(lang), "snippets"))
        count += 1

    sx.close()
    return count


def index_wiki(conn):
    wiki_dir = os.path.join(WEBSITES_DIR, "wiki")
    if not os.path.isdir(wiki_dir):
        return 0
    c = conn.cursor()
    count = 0

    for html_file in glob.glob(os.path.join(wiki_dir, "**/*.html"), recursive=True):
        try:
            name = os.path.splitext(os.path.basename(html_file))[0]
            with open(html_file, encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            title = extract_title(html) or name
            content = strip_html(html)[:3000]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("wiki", name, title, content, "wiki", "wiki"))
            count += 1
        except Exception:
            continue

    return count


def index_agents(conn):
    c = conn.cursor()
    count = 0

    # Agent scripts
    for script in glob.glob(os.path.join(BR_ROOT, "blackroad-core/agents/*.sh")):
        try:
            name = os.path.splitext(os.path.basename(script))[0]
            with open(script, encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()[:10]
            desc = " ".join(l.lstrip("# ").strip() for l in lines
                           if l.startswith("#") and not l.startswith("#!"))
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("agent", name, f"Agent: {name}", desc[:1000], "agent", "agents"))
            count += 1
        except Exception:
            continue

    # Agent web pages
    for page in glob.glob(os.path.join(WEBSITES_DIR, "agents/*/index.html")):
        try:
            name = os.path.basename(os.path.dirname(page))
            with open(page, encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            title = extract_title(html) or name
            content = strip_html(html)[:3000]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("agent", f"web-{name}", title, content, "agent website", "agents"))
            count += 1
        except Exception:
            continue

    return count


def index_knowledge_graph(conn):
    if not os.path.exists(INDEX_DB):
        return 0
    c = conn.cursor()
    ix = sqlite3.connect(INDEX_DB)
    count = 0

    try:
        for subj, pred, obj, conf in ix.execute(
                "SELECT subject, predicate, object, confidence FROM knowledge_graph"):
            eid = f"{subj}-{pred}-{obj}"[:128]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("knowledge", eid, f"{subj} {pred} {obj}",
                       f"{subj} {pred} {obj}", "knowledge-graph", f"confidence:{conf}"))
            count += 1
    except Exception:
        pass

    ix.close()
    return count


def index_scripts(conn):
    """Index standalone shell scripts in home directory"""
    c = conn.cursor()
    count = 0

    for script in glob.glob(os.path.join(HOME, "*.sh")):
        try:
            name = os.path.basename(script)
            with open(script, encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()[:15]
            desc = " ".join(l.lstrip("# ").strip() for l in lines
                           if l.startswith("#") and not l.startswith("#!"))
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("script", name, name, desc[:1000], "shell script", "home"))
            count += 1
        except Exception:
            continue

    return count


def index_claude_memories(conn):
    """Index Claude project memories"""
    c = conn.cursor()
    count = 0
    mem_dir = os.path.join(HOME, ".claude/projects/-Users-alexa/memory")

    for md_file in glob.glob(os.path.join(mem_dir, "*.md")):
        try:
            name = os.path.splitext(os.path.basename(md_file))[0]
            if name == "MEMORY":
                continue
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            # Extract description from frontmatter
            desc_match = re.search(r'description:\s*(.+)', text)
            desc = desc_match.group(1) if desc_match else name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("memory", name, desc, text[:3000], "claude memory", "memories"))
            count += 1
        except Exception:
            continue

    return count


def index_domains(conn):
    """Index the blackroad-web-core domain pages"""
    c = conn.cursor()
    count = 0
    domains_dir = os.path.join(BR_ROOT, "blackroad-web-core/domains")

    if not os.path.isdir(domains_dir):
        return 0

    for html_file in glob.glob(os.path.join(domains_dir, "*.html")):
        try:
            name = os.path.splitext(os.path.basename(html_file))[0]
            with open(html_file, encoding="utf-8", errors="ignore") as fh:
                html = fh.read()
            title = extract_title(html) or name
            content = strip_html(html)[:3000]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("domain", name, title, content, "domain-page", "domains"))
            count += 1
        except Exception:
            continue

    return count


def extract_md_title(text):
    """Extract title from the first H1 line of a markdown file"""
    for line in text.split("\n")[:10]:
        line = line.strip()
        if line.startswith("# "):
            return line.lstrip("# ").strip()
    return None


def index_docs(conn):
    """Index all files in ~/blackroad-operator/docs/ recursively"""
    docs_dir = os.path.join(BR_ROOT, "docs")
    if not os.path.isdir(docs_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(docs_dir, "**/*.md"), recursive=True):
        try:
            rel_path = os.path.relpath(md_file, BR_ROOT)
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("docs", rel_path, title, text[:5000], "documentation", "docs"))
            count += 1
        except Exception:
            continue

    return count


def index_root_docs(conn):
    """Index the root-level .md files in ~/blackroad-operator/ (articles)"""
    c = conn.cursor()
    count = 0
    skip = {"README.md", "CLAUDE.md"}

    for md_file in glob.glob(os.path.join(BR_ROOT, "*.md")):
        try:
            basename = os.path.basename(md_file)
            if basename in skip:
                continue
            name = os.path.splitext(basename)[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("article", basename, title, text[:5000], "root-docs", "root-docs"))
            count += 1
        except Exception:
            continue

    return count


def index_roadnet(conn):
    """Index ~/roadnet/*.md files (infrastructure documentation)"""
    roadnet_dir = os.path.join(HOME, "roadnet")
    if not os.path.isdir(roadnet_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(roadnet_dir, "*.md")):
        try:
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("infrastructure", name, title, text[:5000], "roadnet", "roadnet"))
            count += 1
        except Exception:
            continue

    return count


def index_carpool(conn):
    """Index ~/blackroad-operator/carpool/*.md files (agent coordination docs)"""
    carpool_dir = os.path.join(BR_ROOT, "carpool")
    if not os.path.isdir(carpool_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(carpool_dir, "*.md")):
        try:
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("carpool", name, title, text[:5000], "agent-coordination", "carpool"))
            count += 1
        except Exception:
            continue

    return count


def index_corporate(conn):
    """Index ~/blackroad-operator/docs/corporate/ with full content (business docs)"""
    corp_dir = os.path.join(BR_ROOT, "docs", "corporate")
    if not os.path.isdir(corp_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(corp_dir, "**/*.md"), recursive=True):
        try:
            rel_path = os.path.relpath(md_file, corp_dir)
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("corporate", rel_path, title, text[:10000], "corporate", "corporate"))
            count += 1
        except Exception:
            continue

    return count


def index_compliance(conn):
    """Index ~/blackroad-operator/orgs/core/compliance-blackroadio/docs/"""
    compliance_dir = os.path.join(BR_ROOT, "orgs", "core", "compliance-blackroadio", "docs")
    if not os.path.isdir(compliance_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(compliance_dir, "**/*.md"), recursive=True):
        try:
            rel_path = os.path.relpath(md_file, compliance_dir)
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("compliance", rel_path, title, text[:10000], "compliance", "compliance"))
            count += 1
        except Exception:
            continue

    return count


def index_agent_manifests(conn):
    """Index JSON agent manifests from agents/ and carpool/ directories"""
    c = conn.cursor()
    count = 0

    search_dirs = [
        os.path.join(BR_ROOT, "agents"),
        os.path.join(BR_ROOT, "carpool"),
    ]

    for search_dir in search_dirs:
        if not os.path.isdir(search_dir):
            continue
        for json_file in glob.glob(os.path.join(search_dir, "**/*.json"), recursive=True):
            try:
                with open(json_file, encoding="utf-8", errors="ignore") as fh:
                    data = json.load(fh)

                if not isinstance(data, dict):
                    continue

                # Extract agent metadata
                agent_name = data.get("name", data.get("agent", data.get("id", "")))
                role = data.get("role", data.get("description", ""))
                capabilities = data.get("capabilities", data.get("skills", []))
                if isinstance(capabilities, list):
                    capabilities = ", ".join(str(c_item) for c_item in capabilities)
                else:
                    capabilities = str(capabilities)

                if not agent_name:
                    agent_name = os.path.splitext(os.path.basename(json_file))[0]

                rel_path = os.path.relpath(json_file, BR_ROOT)
                content = f"{agent_name} {role} {capabilities} {json.dumps(data)}"[:5000]
                title = f"Agent: {agent_name}" if agent_name else os.path.basename(json_file)

                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                          ("agent-manifest", rel_path, title, content, "agent-manifest", "manifests"))
                count += 1
            except (json.JSONDecodeError, Exception):
                continue

    return count


def index_garage(conn):
    """Index ~/blackroad-garage/ — private fleet infrastructure docs"""
    garage_dir = os.path.join(HOME, "blackroad-garage")
    if not os.path.isdir(garage_dir):
        return 0
    c = conn.cursor()
    count = 0

    for md_file in glob.glob(os.path.join(garage_dir, "*.md")):
        try:
            name = os.path.splitext(os.path.basename(md_file))[0]
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or name
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("garage", name, title, text[:8000], "fleet infrastructure", "garage"))
            count += 1
        except Exception:
            continue

    # Also index JSON results
    for json_file in glob.glob(os.path.join(garage_dir, "*.json")):
        try:
            name = os.path.splitext(os.path.basename(json_file))[0]
            with open(json_file, encoding="utf-8", errors="ignore") as fh:
                data = json.load(fh)
            content = json.dumps(data, indent=2)[:5000]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("garage", name, f"Experiment: {name}", content, "quantum experiments", "garage"))
            count += 1
        except Exception:
            continue

    return count


def index_disaster_recovery(conn):
    """Index ~/blackroad-disaster-recovery/ — credentials, configs, critical files"""
    dr_dir = os.path.join(HOME, "blackroad-disaster-recovery")
    if not os.path.isdir(dr_dir):
        return 0
    c = conn.cursor()
    count = 0

    # Index markdown files
    for md_file in glob.glob(os.path.join(dr_dir, "**/*.md"), recursive=True):
        try:
            name = os.path.relpath(md_file, dr_dir)
            with open(md_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = extract_md_title(text) or os.path.basename(name)
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("disaster-recovery", name, title, text[:5000], "disaster recovery", "dr"))
            count += 1
        except Exception:
            continue

    # Index YAML files (credentials inventory, crypto holdings)
    for yaml_file in glob.glob(os.path.join(dr_dir, "**/*.yaml"), recursive=True) + \
                     glob.glob(os.path.join(dr_dir, "**/*.yml"), recursive=True):
        try:
            name = os.path.relpath(yaml_file, dr_dir)
            with open(yaml_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            title = os.path.splitext(os.path.basename(yaml_file))[0]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("disaster-recovery", name, title, text[:5000], "credentials config", "dr"))
            count += 1
        except Exception:
            continue

    # Index Python files (symbolic kernel, etc.)
    for py_file in glob.glob(os.path.join(dr_dir, "**/*.py"), recursive=True):
        try:
            name = os.path.relpath(py_file, dr_dir)
            with open(py_file, encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
            # Extract docstring or first comments
            desc_lines = [l.lstrip("# ").strip() for l in text.split("\n")[:15]
                          if l.startswith("#") or l.startswith('"""') or l.startswith("'''")]
            desc = " ".join(desc_lines)[:500]
            c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                      ("disaster-recovery", name, os.path.basename(name), f"{desc} {text[:3000]}", "code", "dr"))
            count += 1
        except Exception:
            continue

    return count


def index_drive_structure(conn):
    """Index the Google Drive BlackRoad OS Inc folder structure (cached via rclone)"""
    import subprocess
    c = conn.cursor()
    count = 0

    try:
        result = subprocess.run(
            ["rclone", "lsf", "gdrive-blackroad:BlackRoad OS, Inc./", "--recursive"],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            files = result.stdout.strip().split("\n")
            # Group by folder
            folders = {}
            for f in files:
                parts = f.split("/")
                if len(parts) >= 2:
                    folder = parts[0]
                    if folder not in folders:
                        folders[folder] = []
                    folders[folder].append(f)

            for folder, items in folders.items():
                content = "\n".join(items[:50])
                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                          ("gdrive", folder, f"Drive: {folder}", content, "google drive", "gdrive-blackroad"))
                count += 1

            # Also index individual files for searchability
            for f in files:
                if f.endswith("/"):
                    continue
                name = os.path.basename(f.rstrip("/"))
                folder = f.split("/")[0] if "/" in f else ""
                c.execute("INSERT OR REPLACE INTO search_index VALUES (?,?,?,?,?,?)",
                          ("gdrive-file", f, name, f"{folder} {name} {f}", "google drive file", "gdrive-blackroad"))
                count += 1
    except Exception:
        pass

    return count


def rebuild(conn):
    print(f"\n  {A}{B}◆ BR SEARCH-ALL{N}  {D}Rebuilding unified index...{N}\n")

    conn.execute("DELETE FROM search_index")
    conn.execute("DELETE FROM search_meta")
    conn.execute("DELETE FROM index_stats")
    conn.commit()

    sources = [
        ("codex", index_codex),
        ("tils", index_tils),
        ("journal", index_journal),
        ("websites", index_websites),
        ("repos", index_repos),
        ("tools", index_tools),
        ("snippets", index_snippets),
        ("wiki", index_wiki),
        ("agents", index_agents),
        ("knowledge", index_knowledge_graph),
        ("scripts", index_scripts),
        ("memories", index_claude_memories),
        ("domains", index_domains),
        ("docs", index_docs),
        ("root-docs", index_root_docs),
        ("roadnet", index_roadnet),
        ("carpool", index_carpool),
        ("corporate", index_corporate),
        ("compliance", index_compliance),
        ("agent-manifests", index_agent_manifests),
        ("garage", index_garage),
        ("disaster-recovery", index_disaster_recovery),
        ("gdrive", index_drive_structure),
    ]

    total = 0
    for name, func in sources:
        t0 = time.time()
        try:
            count = func(conn)
            ms = int((time.time() - t0) * 1000)
            conn.execute(
                "INSERT OR REPLACE INTO index_stats VALUES (?,?,datetime('now'),?)",
                (name, count, ms))
            conn.commit()
            print(f"  {G}✓{N} {name}: {B}{count}{N} entries ({ms}ms)")
            total += count
        except Exception as e:
            print(f"  \033[0;31m✗{N} {name}: {e}")

    conn.commit()
    print(f"\n  {B}{G}Index rebuilt: {total} total entries{N}")
    print(f"  {D}Database: {DB_PATH}{N}\n")

    # Breakdown
    print(f"  {B}Breakdown:{N}")
    for row in conn.execute(
            "SELECT entity_type, count(*) FROM search_index GROUP BY entity_type ORDER BY count(*) DESC"):
        print(f"  {A}  {row[0]:<20}{N} {row[1]}")
    print()


def search(conn, query, type_filter=None, limit=20):
    # Auto-rebuild if empty
    count = conn.execute("SELECT count(*) FROM search_index").fetchone()[0]
    if count < 10:
        print(f"  {D}Index empty — rebuilding...{N}")
        rebuild(conn)

    print(f"\n  {A}{B}◆ BR SEARCH-ALL{N}  {D}\"{query}\"{N}")
    if type_filter:
        print(f"  {D}Filter: {type_filter}{N}")
    print(f"  {D}{'─' * 58}{N}\n")

    # FTS5 search
    where = f"AND entity_type = '{type_filter}'" if type_filter else ""

    try:
        rows = conn.execute(f"""
            SELECT entity_type, entity_id, title,
                   snippet(search_index, 3, '\033[1;33m', '\033[0m', '...', 50),
                   rank
            FROM search_index
            WHERE search_index MATCH ?
            {where}
            ORDER BY rank
            LIMIT ?
        """, (query, limit)).fetchall()
    except Exception:
        rows = []

    # Fallback to LIKE
    if not rows:
        try:
            rows = conn.execute(f"""
                SELECT entity_type, entity_id, title,
                       substr(content, max(1, instr(lower(content), lower(?))-30), 100),
                       0
                FROM search_index
                WHERE lower(content) LIKE ? OR lower(title) LIKE ?
                {where}
                LIMIT ?
            """, (query, f"%{query.lower()}%", f"%{query.lower()}%", limit)).fetchall()
        except Exception:
            rows = []

    if not rows:
        print(f"  \033[0;31mNo results{N} for \"{query}\"")
        print(f"  {D}Try: br search-all --rebuild{N}\n")
        conn.execute("INSERT INTO search_history(query, results_count) VALUES (?, 0)", (query,))
        conn.commit()
        return

    icons = {
        "solution": "💡", "pattern": "🔄", "practice": "✅", "anti-pattern": "⚠️ ",
        "til": "📝", "journal": "📜", "website": "🌐", "repo": "📦", "repo-docs": "📄",
        "tool": "🔧", "snippet": "✂️ ", "wiki": "📖", "agent": "🤖", "knowledge": "🧠",
        "script": "📜", "memory": "🧠", "domain": "🌍", "template": "📋",
        "docs": "📚", "article": "📄", "infrastructure": "🏗️ ", "carpool": "🚗",
        "corporate": "🏢", "compliance": "⚖️ ", "agent-manifest": "🤖",
        "garage": "🔧", "disaster-recovery": "🚨", "gdrive": "☁️ ", "gdrive-file": "📁",
    }

    prev_type = None
    for etype, eid, title, snippet, rank in rows:
        if etype != prev_type:
            icon = icons.get(etype, "  ")
            print(f"  {B}{D}── {icon} {etype.upper()}{N}")
            prev_type = etype
        snippet_clean = (snippet or "")[:80].replace("\n", " ")
        print(f"  {A}{title[:38]:<38}{N}  {snippet_clean}")

    print(f"\n  {D}{len(rows)} results{N}\n")

    conn.execute("INSERT INTO search_history(query, results_count) VALUES (?, ?)",
                 (query, len(rows)))
    conn.commit()


def stats(conn):
    print(f"\n  {A}{B}◆ BR SEARCH-ALL{N}  {D}Index Statistics{N}\n")

    total = conn.execute("SELECT count(*) FROM search_index").fetchone()[0]
    print(f"  {B}Total indexed: {total}{N}\n")

    print(f"  {B}By type:{N}")
    for etype, cnt in conn.execute(
            "SELECT entity_type, count(*) FROM search_index GROUP BY entity_type ORDER BY count(*) DESC"):
        print(f"  {A}  {etype:<20}{N} {cnt}")

    print(f"\n  {B}By source:{N}")
    for src, cnt, ts in conn.execute(
            "SELECT source, entry_count, last_indexed FROM index_stats ORDER BY entry_count DESC"):
        print(f"  {V}  {src:<20}{N} {cnt:>4} entries  {D}{ts or ''}{N}")

    print(f"\n  {B}Recent searches:{N}")
    for q, cnt, ts in conn.execute(
            "SELECT query, results_count, searched_at FROM search_history ORDER BY searched_at DESC LIMIT 10"):
        print(f"  {D}  {str(q)[:30]:<30}{N} {cnt:>3} results  {D}{ts}{N}")
    print()


def main():
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    args = sys.argv[1:]

    if not args or "--help" in args or "-h" in args or "help" in args:
        print(f"""
  {A}{B}◆ BR SEARCH-ALL{N}  {D}Unified search across the entire BlackRoad ecosystem{N}
  {D}FTS5-powered: codex, TILs, journal, websites, repos, tools, agents, wiki, snippets, memories{N}
  {D}{'─' * 58}{N}
  {B}USAGE{N}
    br search-all {D}<query>{N}                    Search everything
    br search-all {D}<query> --type solution{N}    Filter by type
    br search-all {D}<query> --limit 50{N}         More results
    br search-all {D}--rebuild{N}                  Reindex all sources
    br search-all {D}--stats{N}                    Show index statistics

  {B}TYPES{N}  solution | pattern | practice | anti-pattern | til | journal
         website | repo | tool | snippet | wiki | agent | knowledge | memory | domain
         docs | article | infrastructure | carpool | corporate | compliance | agent-manifest

  {B}EXAMPLES{N}
    {D}br search-all 'cloudflare deploy'{N}
    {D}br search-all 'ssh tunnel' --type solution{N}
    {D}br search-all 'pave tomorrow' --type website{N}
    {D}br search-all --rebuild{N}
""")
        conn.close()
        return

    if "--rebuild" in args:
        rebuild(conn)
        conn.close()
        return

    if "--stats" in args:
        stats(conn)
        conn.close()
        return

    # Parse query and flags
    query_parts = []
    type_filter = None
    limit = 20
    i = 0
    while i < len(args):
        if args[i] == "--type" and i + 1 < len(args):
            type_filter = args[i + 1]
            i += 2
        elif args[i] == "--limit" and i + 1 < len(args):
            limit = int(args[i + 1])
            i += 2
        elif args[i].startswith("-"):
            i += 1
        else:
            query_parts.append(args[i])
            i += 1

    query = " ".join(query_parts)
    if query:
        search(conn, query, type_filter, limit)
    else:
        print("  No query provided. Use --help for usage.")

    conn.close()


if __name__ == "__main__":
    main()
