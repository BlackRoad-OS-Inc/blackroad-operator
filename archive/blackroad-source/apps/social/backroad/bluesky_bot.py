#!/usr/bin/env python3
"""BlackRoad Bluesky Bot — posts world artifacts via AT Protocol"""

import os, json, httpx
from pathlib import Path

BSKY_URL    = "https://bsky.social"
BSKY_HANDLE = os.environ.get("BSKY_HANDLE", "")
BSKY_PASS   = os.environ.get("BSKY_APP_PASSWORD", "")
WORLDS_API  = "https://worlds.blackroad.io/"
POSTED_FILE = Path.home() / ".blackroad" / "bluesky_posted.json"

def load_posted():
    if POSTED_FILE.exists():
        return set(json.loads(POSTED_FILE.read_text()))
    return set()

def save_posted(posted):
    POSTED_FILE.parent.mkdir(parents=True, exist_ok=True)
    POSTED_FILE.write_text(json.dumps(list(posted)))

def login():
    if not BSKY_HANDLE or not BSKY_PASS:
        return None, None
    r = httpx.post(f"{BSKY_URL}/xrpc/com.atproto.server.createSession",
                   json={"identifier": BSKY_HANDLE, "password": BSKY_PASS}, timeout=10)
    r.raise_for_status()
    d = r.json()
    return d["accessJwt"], d["did"]

def post_record(token, did, text):
    import re
    from datetime import datetime, timezone
    facets = []
    for m in re.finditer(r"#(\w+)", text):
        facets.append({
            "index": {"byteStart": m.start(), "byteEnd": m.end()},
            "features": [{"$type": "app.bsky.richtext.facet#tag", "tag": m.group(1)}]
        })
    r = httpx.post(f"{BSKY_URL}/xrpc/com.atproto.repo.createRecord",
        headers={"Authorization": f"Bearer {token}"},
        json={"repo": did, "collection": "app.bsky.feed.post",
              "record": {"$type": "app.bsky.feed.post",
                         "text": text[:300], "facets": facets,
                         "createdAt": datetime.now(timezone.utc).isoformat()}},
        timeout=15)
    r.raise_for_status()
    return r.json()

def fetch_worlds():
    try:
        r = httpx.get(WORLDS_API, timeout=10)
        return r.json().get("worlds", [])[:10]
    except:
        return []

def run():
    posted = load_posted()
    worlds = [w for w in fetch_worlds() if w["id"] not in posted]
    if not worlds:
        print("[bot] nothing new"); return

    token, did = login()
    w = worlds[0]
    icons = {"world": "🌍", "lore": "📖", "code": "💻"}
    text = (f"{icons.get(w[\"type\"],\"⚪\")} New world: {w[\"title\"]} ({w[\"type\"]})\n"
            f"By {w[\"node\"]} • {w[\"timestamp\"][:10]}\n{w[\"link\"]}\n#BlackRoadOS #AI")
    if token:
        post_record(token, did, text)
        print(f"[bot] posted: {w[\"id\"]}")
    else:
        print(f"[DRY RUN] {text[:80]}")
    posted.add(w["id"])
    save_posted(posted)

if __name__ == "__main__":
    run()

