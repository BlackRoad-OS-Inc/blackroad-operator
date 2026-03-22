"""
BlackRoad Notion Integration
Sync docs, READMEs, and release notes to Notion.
"""
from __future__ import annotations
import os, re, glob, logging
from pathlib import Path
from typing import Optional
from notion_client import Client

logger = logging.getLogger("blackroad.notion")

NOTION_API_KEY = os.getenv("NOTION_API_KEY", "")
NOTION_DATABASE_ID = os.getenv("NOTION_DATABASE_ID", "")


class BlackRoadNotionClient:
    """Sync BlackRoad docs to Notion workspace."""

    def __init__(self, token: Optional[str] = None, db_id: Optional[str] = None):
        self.token = token or NOTION_API_KEY
        self.db_id = db_id or NOTION_DATABASE_ID
        if not self.token:
            raise ValueError("NOTION_API_KEY env var not set")
        self.client = Client(auth=self.token)

    # ──────────────────────────────────────────────
    # Core Sync
    # ──────────────────────────────────────────────

    def upsert_page(
        self,
        title: str,
        content: str,
        *,
        tags: list[str] | None = None,
        repo: str = "",
    ) -> str:
        """Create or update a Notion page in the configured database."""
        # Check if exists
        results = self.client.databases.query(
            database_id=self.db_id,
            filter={"property": "Name", "title": {"equals": title}}
        )

        # Build block children from markdown
        blocks = self._md_to_blocks(content[:3000])

        properties: dict = {
            "Name": {"title": [{"text": {"content": title[:100]}}]},
        }
        if repo:
            properties["Repo"] = {"rich_text": [{"text": {"content": repo}}]}
        if tags:
            properties["Tags"] = {"multi_select": [{"name": t} for t in tags[:5]]}

        if results["results"]:
            page_id = results["results"][0]["id"]
            self.client.pages.update(page_id=page_id, properties=properties)
            # Clear and replace blocks
            existing = self.client.blocks.children.list(page_id)["results"]
            for block in existing[:100]:
                try:
                    self.client.blocks.delete(block_id=block["id"])
                except:
                    pass
            if blocks:
                self.client.blocks.children.append(page_id, children=blocks)
            logger.info("✓ Updated: %s", title)
            return page_id
        else:
            page = self.client.pages.create(
                parent={"database_id": self.db_id},
                properties=properties,
                children=blocks,
            )
            logger.info("✓ Created: %s", title)
            return page["id"]

    def sync_repo_docs(self, repo_path: str = ".", repo_name: str = "") -> int:
        """Sync all .md files from a repo to Notion."""
        synced = 0
        for md_file in glob.glob(f"{repo_path}/**/*.md", recursive=True):
            if any(skip in md_file for skip in ["node_modules", ".git", "dist"]):
                continue
            try:
                content = Path(md_file).read_text(encoding="utf-8")
                title = self._extract_title(content, md_file)
                self.upsert_page(title, content, repo=repo_name)
                synced += 1
            except Exception as e:
                logger.warning("⚠ %s: %s", md_file, e)
        return synced

    def create_release_page(self, version: str, notes: str, repo: str = "") -> str:
        """Create a release notes page in Notion."""
        return self.upsert_page(
            f"Release {version}",
            notes,
            tags=["release", "changelog"],
            repo=repo,
        )

    # ──────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────

    def _extract_title(self, content: str, filepath: str) -> str:
        match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if match:
            return match.group(1).strip()
        return Path(filepath).stem.replace('-', ' ').replace('_', ' ').title()

    def _md_to_blocks(self, content: str) -> list[dict]:
        """Convert markdown to basic Notion blocks."""
        blocks = []
        for line in content.split('\n')[:50]:
            if line.startswith('# '):
                blocks.append({"object":"block","type":"heading_1","heading_1":{"rich_text":[{"type":"text","text":{"content":line[2:100]}}]}})
            elif line.startswith('## '):
                blocks.append({"object":"block","type":"heading_2","heading_2":{"rich_text":[{"type":"text","text":{"content":line[3:100]}}]}})
            elif line.startswith('### '):
                blocks.append({"object":"block","type":"heading_3","heading_3":{"rich_text":[{"type":"text","text":{"content":line[4:100]}}]}})
            elif line.startswith('- ') or line.startswith('* '):
                blocks.append({"object":"block","type":"bulleted_list_item","bulleted_list_item":{"rich_text":[{"type":"text","text":{"content":line[2:100]}}]}})
            elif line.startswith('```'):
                pass  # Skip code fences
            elif line.strip():
                blocks.append({"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":line[:200]}}]}})
        return blocks[:100]  # Notion limit
