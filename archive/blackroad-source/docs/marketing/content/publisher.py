#!/usr/bin/env python3
"""
BlackRoad Media Posting API
Unified interface for posting to Mastodon, Matrix, Pixelfed.
"""
import os, json, asyncio
from typing import Optional
import httpx

class MediaPublisher:
    """Post content to multiple social platforms."""
    
    def __init__(self):
        self.mastodon_url = os.getenv("MASTODON_INSTANCE", "https://mastodon.social")
        self.mastodon_token = os.getenv("MASTODON_TOKEN", "")
        self.matrix_url = os.getenv("MATRIX_HOMESERVER", "https://matrix.org")
        self.matrix_token = os.getenv("MATRIX_TOKEN", "")
        self.matrix_room = os.getenv("MATRIX_ROOM_ID", "")
        self.pixelfed_url = os.getenv("PIXELFED_INSTANCE", "https://pixelfed.social")
        self.pixelfed_token = os.getenv("PIXELFED_TOKEN", "")

    async def post_mastodon(self, text: str, visibility: str = "public") -> dict:
        """Post a status to Mastodon."""
        if not self.mastodon_token:
            return {"skipped": "MASTODON_TOKEN not set"}
        async with httpx.AsyncClient() as client:
            r = await client.post(
                f"{self.mastodon_url}/api/v1/statuses",
                headers={"Authorization": f"Bearer {self.mastodon_token}"},
                json={"status": text[:500], "visibility": visibility}
            )
            r.raise_for_status()
            return r.json()

    async def post_matrix(self, text: str) -> dict:
        """Send a message to a Matrix room."""
        if not self.matrix_token or not self.matrix_room:
            return {"skipped": "MATRIX_TOKEN or MATRIX_ROOM_ID not set"}
        import time, random
        txn_id = f"{int(time.time())}{random.randint(1000,9999)}"
        async with httpx.AsyncClient() as client:
            r = await client.put(
                f"{self.matrix_url}/_matrix/client/v3/rooms/{self.matrix_room}/send/m.room.message/{txn_id}",
                headers={"Authorization": f"Bearer {self.matrix_token}"},
                json={"msgtype": "m.text", "body": text}
            )
            r.raise_for_status()
            return r.json()

    async def broadcast(self, text: str, platforms: list[str] = None) -> dict:
        """Post to all configured platforms."""
        platforms = platforms or ["mastodon", "matrix"]
        tasks = {}
        if "mastodon" in platforms:
            tasks["mastodon"] = self.post_mastodon(text)
        if "matrix" in platforms:
            tasks["matrix"] = self.post_matrix(text)
        
        results = {}
        for platform, coro in tasks.items():
            try:
                results[platform] = await coro
            except Exception as e:
                results[platform] = {"error": str(e)}
        return results


class ContentScheduler:
    """Schedule and queue social media posts."""
    
    def __init__(self, db_path: str = "~/.blackroad/media-schedule.json"):
        self.db_path = os.path.expanduser(db_path)
        self.publisher = MediaPublisher()
    
    def _load(self) -> list:
        if os.path.exists(self.db_path):
            with open(self.db_path) as f:
                return json.load(f)
        return []
    
    def _save(self, items: list):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with open(self.db_path, "w") as f:
            json.dump(items, f, indent=2)
    
    def schedule(self, text: str, platforms: list[str], scheduled_at: float) -> str:
        import uuid
        items = self._load()
        item_id = uuid.uuid4().hex[:8]
        items.append({
            "id": item_id,
            "text": text,
            "platforms": platforms,
            "scheduled_at": scheduled_at,
            "status": "pending"
        })
        self._save(items)
        return item_id
    
    async def process_due(self) -> list[dict]:
        """Process all posts due now."""
        import time
        items = self._load()
        now = time.time()
        processed = []
        
        for item in items:
            if item["status"] == "pending" and item["scheduled_at"] <= now:
                result = await self.publisher.broadcast(item["text"], item["platforms"])
                item["status"] = "sent"
                item["result"] = result
                processed.append(item)
        
        self._save(items)
        return processed


if __name__ == "__main__":
    publisher = MediaPublisher()
    result = asyncio.run(publisher.broadcast(
        "🚀 BlackRoad OS — Your AI. Your Hardware. Your Rules. #AI #OpenSource"
    ))
    print(json.dumps(result, indent=2))
