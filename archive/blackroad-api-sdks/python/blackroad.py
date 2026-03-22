"""
BlackRoad OS Python SDK

Connect to BlackRoad fleet, AI inference, stats, and Slack hub.

    from blackroad import BlackRoad

    br = BlackRoad()
    status = br.fleet.status()
    br.slack.post("hello from python")
"""

import urllib.request
import urllib.error
import json
from typing import Optional


class _Fleet:
    """Fleet status and health monitoring."""

    def __init__(self, client):
        self._client = client

    def status(self) -> dict:
        """Get fleet status for all nodes."""
        return self._client._get(f"{self._client.stats_url}/fleet")

    def all(self) -> dict:
        """Get all fleet data: infra, GitHub, analytics."""
        return self._client._get(f"{self._client.stats_url}/all")

    def health(self) -> dict:
        """Health check for the stats API."""
        return self._client._get(f"{self._client.stats_url}/health")


class _Slack:
    """Post messages to Slack through the BlackRoad hub."""

    def __init__(self, client):
        self._client = client

    def post(self, text: str) -> dict:
        """Post a message to the default Slack channel."""
        return self._client._post(f"{self._client.slack_url}/post", {"text": text})

    def alert(self, text: str) -> dict:
        """Post an alert to the alerts channel."""
        return self._client._post(f"{self._client.slack_url}/alert", {"text": text})

    def deploy(self, text: str) -> dict:
        """Post a deploy notification."""
        return self._client._post(f"{self._client.slack_url}/deploy", {"text": text})

    def status(self) -> dict:
        """Get Slack hub status."""
        return self._client._get(f"{self._client.slack_url}/status")


class _AI:
    """AI inference through the BlackRoad gateway."""

    def __init__(self, client):
        self._client = client

    def generate(self, model: str, prompt: str, stream: bool = False) -> dict:
        """Generate a completion using Ollama on the fleet."""
        return self._client._post(
            f"{self._client.gateway_url}/api/generate",
            {"model": model, "prompt": prompt, "stream": stream},
        )

    def chat(self, model: str, messages: list, stream: bool = False) -> dict:
        """Chat completion using Ollama on the fleet."""
        return self._client._post(
            f"{self._client.gateway_url}/api/chat",
            {"model": model, "messages": messages, "stream": stream},
        )

    def embed(self, model: str, input: str) -> dict:
        """Generate embeddings."""
        return self._client._post(
            f"{self._client.gateway_url}/api/embed",
            {"model": model, "input": input},
        )

    def models(self) -> dict:
        """List available models."""
        return self._client._get(f"{self._client.gateway_url}/api/tags")


class BlackRoad:
    """BlackRoad OS SDK client.

    Args:
        stats_url: Stats API URL (default: public endpoint)
        slack_url: Slack hub URL (default: public endpoint)
        gateway_url: AI gateway URL (default: localhost Ollama)
    """

    def __init__(
        self,
        stats_url: str = "https://stats-blackroad.amundsonalexa.workers.dev",
        slack_url: str = "https://blackroad-slack.amundsonalexa.workers.dev",
        gateway_url: str = "http://localhost:11434",
    ):
        self.stats_url = stats_url.rstrip("/")
        self.slack_url = slack_url.rstrip("/")
        self.gateway_url = gateway_url.rstrip("/")

        self.fleet = _Fleet(self)
        self.slack = _Slack(self)
        self.ai = _AI(self)

    def _get(self, url: str) -> dict:
        req = urllib.request.Request(url)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.URLError as e:
            return {"error": str(e)}

    def _post(self, url: str, data: dict) -> dict:
        body = json.dumps(data).encode()
        req = urllib.request.Request(
            url, data=body, headers={"Content-Type": "application/json"}, method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.URLError as e:
            return {"error": str(e)}


if __name__ == "__main__":
    br = BlackRoad()
    print("Fleet:", json.dumps(br.fleet.health(), indent=2))
    print("Slack:", json.dumps(br.slack.status(), indent=2))
