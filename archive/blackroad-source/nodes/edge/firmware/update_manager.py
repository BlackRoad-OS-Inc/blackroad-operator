#!/usr/bin/env python3
"""BlackRoad Pi Agent — OTA Update Manager.

Checks GitHub for new releases and applies firmware updates in-place.
"""

from __future__ import annotations
import asyncio
import hashlib
import json
import logging
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"
REPO_OWNER = "BlackRoad-Hardware"
REPO_NAME = "firmware"
AGENT_DIR = Path(__file__).parent.parent.parent


class OTAUpdateManager:
    """Checks for and applies OTA firmware updates from GitHub releases."""

    def __init__(self, current_version: str, github_token: Optional[str] = None):
        self.current_version = current_version
        self.headers = {"Accept": "application/vnd.github+json"}
        if github_token:
            self.headers["Authorization"] = f"Bearer {github_token}"
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(headers=self.headers, timeout=30)
        return self

    async def __aexit__(self, *args):
        if self._client:
            await self._client.aclose()

    async def check_update(self) -> Optional[dict]:
        """Return latest release info if newer than current_version, else None."""
        assert self._client
        url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/releases/latest"
        try:
            resp = await self._client.get(url)
            resp.raise_for_status()
            release = resp.json()
            tag = release.get("tag_name", "").lstrip("v")
            if self._version_gt(tag, self.current_version):
                return release
        except Exception as exc:
            logger.warning("OTA check failed: %s", exc)
        return None

    async def apply_update(self, release: dict) -> bool:
        """Download and apply the firmware update. Returns True on success."""
        assert self._client
        assets = release.get("assets", [])
        tar_asset = next((a for a in assets if a["name"].endswith(".tar.gz")), None)
        if not tar_asset:
            logger.warning("No .tar.gz asset in release %s", release.get("tag_name"))
            return False

        download_url = tar_asset["browser_download_url"]
        logger.info("Downloading OTA update from %s", download_url)

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_tar = Path(tmpdir) / "firmware.tar.gz"
            async with self._client.stream("GET", download_url) as resp:
                resp.raise_for_status()
                with open(tmp_tar, "wb") as f:
                    async for chunk in resp.aiter_bytes(chunk_size=8192):
                        f.write(chunk)

            # Verify SHA256 if checksum file present
            sha_asset = next((a for a in assets if a["name"].endswith(".sha256")), None)
            if sha_asset:
                sha_resp = await self._client.get(sha_asset["browser_download_url"])
                expected_sha = sha_resp.text.strip().split()[0]
                actual_sha = hashlib.sha256(tmp_tar.read_bytes()).hexdigest()
                if actual_sha != expected_sha:
                    logger.error("SHA256 mismatch! expected=%s actual=%s", expected_sha, actual_sha)
                    return False
                logger.info("SHA256 verified ✓")

            # Extract and install
            try:
                subprocess.run(
                    ["tar", "-xzf", str(tmp_tar), "-C", str(AGENT_DIR), "--strip-components=1"],
                    check=True
                )
                logger.info("OTA update applied: %s → %s", self.current_version, release["tag_name"])
                return True
            except subprocess.CalledProcessError as exc:
                logger.error("Extract failed: %s", exc)
                return False

    @staticmethod
    def _version_gt(a: str, b: str) -> bool:
        """Return True if version a > version b (semver)."""
        def parts(v: str):
            try:
                return tuple(int(x) for x in v.split("."))
            except ValueError:
                return (0,)
        return parts(a) > parts(b)


async def check_and_update(current_version: str = "0.1.0") -> bool:
    """CLI helper: check for update and apply if available."""
    token = os.environ.get("GITHUB_TOKEN")
    async with OTAUpdateManager(current_version, github_token=token) as manager:
        release = await manager.check_update()
        if release:
            logger.info("Update available: %s", release["tag_name"])
            return await manager.apply_update(release)
        else:
            logger.info("Already up-to-date (%s)", current_version)
            return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(check_and_update())
