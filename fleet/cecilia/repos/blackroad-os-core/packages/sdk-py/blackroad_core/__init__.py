from __future__ import annotations

import html
import json
import os
from pathlib import Path
from typing import List, Optional

import requests
import yaml
from pydantic import BaseModel

DEFAULT_CATALOG_URL = str(Path.cwd() / "catalog.json")
DEFAULT_POLICY_PATH = Path.cwd().joinpath("policy/role_matrix.yaml")


class Agent(BaseModel):
    id: str
    name: str
    role: str
    managerId: Optional[str] = None


class Catalog(BaseModel):
    agents: List[Agent]

    @classmethod
    def load(cls, source: Optional[str] = None) -> "Catalog":
        if source is None:
            if "CATALOG_URL" in os.environ:
                source = os.environ["CATALOG_URL"]
            else:
                source = str(DEFAULT_CATALOG_URL)
        if source.startswith("http"):
            response = requests.get(source, timeout=5)
            response.raise_for_status()
            data = response.json()
        else:
            data = json.loads(Path(source).read_text())
        return cls(**data)

    def generate_org_chart_svg(self) -> str:
        nodes = []
        for idx, agent in enumerate(self.agents):
            y = 40 + idx * 40
            safe_name = html.escape(agent.name)
            safe_role = html.escape(agent.role)
            # Sanitize user-controlled data to prevent XSS attacks
            safe_id = html.escape(agent.id, quote=True)
            safe_name = html.escape(agent.name)
            safe_role = html.escape(agent.role)
            nodes.append(
                f"<g id='{safe_id}'><rect x='10' y='{y}' width='240' height='30' fill='#0f172a' rx='4'/><text x='20' y='{y + 20}' fill='#e2e8f0'>{safe_name} ({safe_role})</text></g>"
            )
        height = 40 + len(self.agents) * 40
        return f"<svg xmlns='http://www.w3.org/2000/svg' width='260' height='{height}'>" + "".join(nodes) + "</svg>"


class RoleGuard:
    def __init__(self, roles: List[str], policy_path: Optional[str] = None):
        self.roles = roles
        self.policy_path = Path(policy_path) if policy_path else DEFAULT_POLICY_PATH
        self.policy = self._load_policy()

    def _load_policy(self) -> dict:
        if not self.policy_path.exists():
            return {}
        return yaml.safe_load(self.policy_path.read_text()) or {}

    def can_perform(self, action: str, resource: str) -> bool:
        # Validate that action and resource don't contain separators used in policy keys
        if ":" in action or ":" in resource:
            raise ValueError("Action and resource parameters must not contain colon characters as they are used as separators in policy keys")
        check = f"{action}:{resource}"
        return any(check in (self.policy.get(role) or []) for role in self.roles)


__all__ = ["Agent", "Catalog", "RoleGuard"]
