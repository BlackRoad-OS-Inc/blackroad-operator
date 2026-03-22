"""BlackRoad Agent Marketplace - Template Management

Handles template publishing, persistence, and retrieval."""

from __future__ import annotations

import json
import hashlib
from pathlib import Path
from datetime import datetime, UTC
from typing import Dict, Optional

from .models import AgentTemplateMetadata, TemplateStatus


class TemplateManager:
    """Manages template storage and retrieval."""
    def __init__(self, marketplace_dir: Path):
        self.marketplace_dir = marketplace_dir
        self.marketplace_dir.mkdir(parents=True, exist_ok=True)
        self.templates_file = self.marketplace_dir / "templates.jsonl"

    def load_all(self) -> Dict[str, AgentTemplateMetadata]:
        """Load all templates from disk."""
        templates = {}

        if self.templates_file.exists():
            with open(self.templates_file, 'r') as f:
                for line in f:
                    template_data = json.loads(line)
                    template = AgentTemplateMetadata.from_dict(template_data)
                    templates[template.id] = template

        return templates

    def save(self, template: AgentTemplateMetadata):
        """Persist a template to disk."""
        with open(self.templates_file, 'a') as f:
            f.write(json.dumps(template.to_dict()) + '\n')

    def get(self, template_id: str, templates: Dict[str, AgentTemplateMetadata]) -> Optional[AgentTemplateMetadata]:
        """Get a template by ID."""
        return templates.get(template_id)

    def generate_template_id(self, name: str) -> str:
        """Generate unique template ID from name."""
        base = name.lower().replace(" ", "-")
        timestamp = datetime.now(UTC).strftime("%Y%m%d%H%M%S")
        return f"template-{base}-{timestamp}"


async def publish_template(
    template: AgentTemplateMetadata,
    manager: TemplateManager,
    templates: Dict[str, AgentTemplateMetadata]
) -> str:
    """Publish a new agent template to the marketplace.

    Args:
        template: Template metadata to publish
        manager: Template manager instance
        templates: Current templates dictionary

    Returns:
        Template ID
    """
    # Validate template
    if not template.id:
        template.id = manager.generate_template_id(template.name)

    # Set publication metadata
    template.status = TemplateStatus.PUBLISHED
    template.published_at = datetime.now(UTC).isoformat()
    template.updated_at = datetime.now(UTC).isoformat()

    # Register
    templates[template.id] = template
    manager.save(template)

    return template.id


__all__ = [
    "TemplateManager",
    "publish_template"
]
