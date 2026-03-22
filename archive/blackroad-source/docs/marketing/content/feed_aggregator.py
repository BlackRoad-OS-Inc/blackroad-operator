"""
BlackRoad Media — World Artifact RSS Feed Aggregator
Aggregates world artifacts from Pi nodes + GitHub into RSS and JSON feeds
"""
import json
import hashlib
from datetime import datetime
from typing import Optional
import httpx


GITHUB_WORLDS_URL = "https://api.github.com/repos/BlackRoad-OS-Inc/blackroad-agents/contents/worlds"


async def fetch_worlds(token: Optional[str] = None) -> list[dict]:
    """Fetch world artifacts from GitHub."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    async with httpx.AsyncClient() as client:
        r = await client.get(GITHUB_WORLDS_URL, headers=headers)
        r.raise_for_status()
        files = r.json()
    
    worlds = []
    for f in files:
        if not f["name"].endswith(".md"):
            continue
        parts = f["name"].replace(".md", "").split("_")
        if len(parts) >= 3:
            worlds.append({
                "id": hashlib.sha256(f["name"].encode()).hexdigest()[:12],
                "filename": f["name"],
                "date": f"{parts[0][:4]}-{parts[0][4:6]}-{parts[0][6:8]}",
                "type": parts[2] if len(parts) > 2 else "unknown",
                "name": "_".join(parts[3:]) if len(parts) > 3 else "artifact",
                "url": f["html_url"],
                "download_url": f["download_url"],
            })
    return sorted(worlds, key=lambda x: x["filename"], reverse=True)


def to_rss(worlds: list[dict], feed_url: str = "https://blackroad.ai/worlds/feed") -> str:
    """Convert world artifacts to RSS 2.0 XML."""
    items = ""
    for w in worlds[:50]:
        items += f"""
    <item>
      <title>{w['type'].title()} — {w['name']}</title>
      <link>{w['url']}</link>
      <guid>{w['id']}</guid>
      <pubDate>{w['date']}</pubDate>
      <description>AI-generated {w['type']} artifact from BlackRoad Pi fleet</description>
    </item>"""
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BlackRoad World Artifacts</title>
    <link>https://blackroad.ai/worlds</link>
    <description>AI-generated worlds, lore, and code from the BlackRoad Pi fleet</description>
    <language>en-us</language>
    <lastBuildDate>{datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')}</lastBuildDate>
{items}
  </channel>
</rss>"""


if __name__ == "__main__":
    import asyncio
    worlds = asyncio.run(fetch_worlds())
    print(json.dumps(worlds[:3], indent=2))
