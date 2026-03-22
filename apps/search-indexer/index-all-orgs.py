#!/usr/bin/env python3
"""Index ALL repos from ALL 16 GitHub orgs into RoadSearch"""
import json, subprocess, sys

pages = []
orgs = [
    "BlackRoad-OS-Inc", "BlackRoad-OS", "BlackRoad-AI", "BlackRoad-Labs",
    "BlackRoad-Cloud", "BlackRoad-Ventures", "BlackRoad-Foundation",
    "BlackRoad-Media", "BlackRoad-Hardware", "BlackRoad-Education",
    "BlackRoad-Gov", "BlackRoad-Security", "BlackRoad-Interactive",
    "BlackRoad-Archive", "BlackRoad-Studio", "Blackbox-Enterprises"
]

for org in orgs:
    try:
        result = subprocess.run([
            "gh", "api", f"orgs/{org}/repos?per_page=100&sort=updated",
            "--paginate", "--jq",
            '.[] | {name, description, html_url, topics, size, language}'
        ], capture_output=True, text=True, timeout=30)
        
        count = 0
        for line in result.stdout.strip().split('\n'):
            if not line.strip(): continue
            try:
                r = json.loads(line)
                if r.get('size', 0) < 10: continue
                desc = r.get('description') or f"Repository in {org}"
                topics = r.get('topics', []) or []
                lang = r.get('language') or ''
                
                pages.append({
                    "url": r['html_url'],
                    "title": f"{r['name']} — {org}",
                    "description": desc[:300],
                    "content": f"{desc} Language: {lang}. Topics: {', '.join(topics)}.",
                    "domain": "github.com",
                    "category": "repo",
                    "tags": ','.join(topics[:5] + [org.lower(), 'github', lang.lower()])[:200]
                })
                count += 1
            except: pass
        print(f"  {org}: {count} repos", file=sys.stderr)
    except Exception as e:
        print(f"  {org}: FAILED - {e}", file=sys.stderr)

print(f"Total repo pages: {len(pages)}", file=sys.stderr)
print(json.dumps(pages))
