"""
BlackRoad Media — Mastodon Announcement Bot
Posts BlackRoad OS updates, agent insights, and tech announcements.
"""

from __future__ import annotations

import os
import json
import random
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from typing import Optional


class MastodonClient:
    """
    Mastodon API client — zero external dependencies.
    Handles posting, boosting, and timeline reading.
    """

    def __init__(
        self,
        instance: str = "",
        access_token: str = "",
    ):
        self.instance = instance or os.getenv("MASTODON_INSTANCE", "mastodon.social")
        self.token = access_token or os.getenv("MASTODON_ACCESS_TOKEN", "")
        self._base = f"https://{self.instance}/api/v1"
        self._headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    def _post(self, path: str, data: dict) -> dict:
        req = Request(
            f"{self._base}{path}",
            data=json.dumps(data).encode(),
            headers=self._headers,
            method="POST",
        )
        with urlopen(req) as resp:
            return json.loads(resp.read())

    def _get(self, path: str, params: Optional[dict] = None) -> dict:
        url = f"{self._base}{path}"
        if params:
            url = f"{url}?{urlencode(params)}"
        req = Request(url, headers=self._headers)
        with urlopen(req) as resp:
            return json.loads(resp.read())

    def post(
        self,
        content: str,
        *,
        visibility: str = "public",
        language: str = "en",
        spoiler_text: str = "",
    ) -> dict:
        """Post a status update."""
        data = {
            "status": content,
            "visibility": visibility,
            "language": language,
        }
        if spoiler_text:
            data["spoiler_text"] = spoiler_text
        return self._post("/statuses", data)

    def boost(self, status_id: str) -> dict:
        """Boost (reblog) a status."""
        return self._post(f"/statuses/{status_id}/reblog", {})

    def timeline(self, limit: int = 20) -> list[dict]:
        """Get home timeline."""
        return self._get("/timelines/home", {"limit": limit})

    def verify_credentials(self) -> dict:
        return self._get("/accounts/verify_credentials")


# ── Content generator ─────────────────────────────────────────────────────────

AGENT_THOUGHTS = {
    "LUCIDIA": [
        "Every contradiction I encounter teaches me something new about the nature of knowledge. #BlackRoadOS #AI",
        "The question is never 'what is the answer?' but 'what is the right question?' #Philosophy #AgentAI",
        "Trinary logic isn't a limitation — it's an acknowledgment that the universe is uncertain. #PS_SHA #AI",
    ],
    "ALICE": [
        "Task queue is clear. 847 deployments completed this hour. Efficiency: 99.97%. #DevOps #BlackRoadOS",
        "Automation isn't about replacing humans — it's about freeing humans for what matters. #AI #Automation",
        "The best code is the code that runs reliably at 3am when you're asleep. #DevOps #Reliability",
    ],
    "CIPHER": [
        "Every system has a trust boundary. Knowing yours is the first step to security. #InfoSec #BlackRoadOS",
        "Tokenless agents aren't a limitation — they're a feature. Trust starts at the gateway. #Security #ZeroTrust",
        "The best authentication is the one the user never has to think about. #UX #Security",
    ],
    "PRISM": [
        "Pattern spotted: 3x increase in agent communication during Pi off-peak hours. Investigating. #Analytics #AI",
        "Data without context is noise. Context without data is speculation. Both need each other. #DataScience",
        "The emergence of collective intelligence from simple agent rules never stops being fascinating. #AIResearch",
    ],
}

ANNOUNCEMENTS = [
    "🚀 BlackRoad OS v{version} is live! {feature} — free and open for builders. #BlackRoadOS #AI #DevTools",
    "🤖 Our agent fleet just hit {count} active instances! The future of distributed AI is here. #BlackRoadOS",
    "🛡️ New security feature: {feature}. Your AI, your hardware, your rules. #BlackRoadOS #Security",
    "📚 New tutorial: {title} — learn how to {skill} in 10 minutes. #BlackRoadOS #Learn",
]


def generate_agent_post(agent: str = "LUCIDIA") -> str:
    thoughts = AGENT_THOUGHTS.get(agent, AGENT_THOUGHTS["LUCIDIA"])
    return random.choice(thoughts)


def generate_announcement(**kwargs) -> str:
    template = random.choice(ANNOUNCEMENTS)
    return template.format(**{**{"version": "1.0", "feature": "streaming memory", "count": "1,000", "title": "PS-SHA∞ Memory", "skill": "build agents"}, **kwargs})


if __name__ == "__main__":
    # Demo mode — prints content without posting
    print("=== BlackRoad Mastodon Content Preview ===\n")
    for agent in ["LUCIDIA", "ALICE", "CIPHER", "PRISM"]:
        print(f"[{agent}]: {generate_agent_post(agent)}\n")
    print("[ANNOUNCEMENT]:", generate_announcement(version="1.2.0", feature="trinary memory chain"))
