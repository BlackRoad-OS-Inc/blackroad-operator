"""BlackRoad Agent Marketplace

Central marketplace for discovering and sharing agent templates.

Refactored into modular components:
- models: Data structures and enums
- templates: Template management and persistence
- search: Discovery and filtering
- statistics: Analytics
- builtin_templates: Canonical built-in templates"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

from .models import (
    AgentTemplateMetadata,
    AgentReview,
    TemplateStatus,
    TemplateCategory
)
from .templates import TemplateManager, publish_template
from .search import (
    search_templates,
    list_by_category,
    get_popular,
    get_top_rated
)
from .statistics import get_marketplace_statistics
from .builtin_templates import get_builtin_templates


class AgentMarketplace:
    """    Central marketplace for discovering and sharing agent templates.

    Provides:
    - Template publishing and discovery
    - Search and filtering
    - Version management
    - Community reviews
    - Usage analytics"""

    def __init__(self, marketplace_dir: Path = Path("data/marketplace")):
        self.marketplace_dir = marketplace_dir
        self.marketplace_dir.mkdir(parents=True, exist_ok=True)

        # Template management
        self.template_manager = TemplateManager(marketplace_dir)

        # Template registry
        self.templates: Dict[str, AgentTemplateMetadata] = {}
        self.reviews: Dict[str, List[AgentReview]] = {}

        # Load marketplace data
        self._load_marketplace()

        # Register built-in templates
        self._register_builtin_templates()

    def _load_marketplace(self):
        """Load marketplace data from disk."""
        self.templates = self.template_manager.load_all()

    def _register_builtin_templates(self):
        """Register built-in community templates."""
        builtin = get_builtin_templates()

        for template_id, template in builtin.items():
            if template_id not in self.templates:
                self.templates[template_id] = template

    async def publish_template(self, template: AgentTemplateMetadata) -> str:
        """        Publish a new agent template to the marketplace.

        Args:
            template: Template metadata to publish

        Returns:
            Template ID"""
        return await publish_template(template, self.template_manager, self.templates)

    def search(
        self,
        query: Optional[str] = None,
        category: Optional[TemplateCategory] = None,
        tags: Optional[List[str]] = None,
        min_rating: float = 0.0,
        sort_by: str = "downloads"
    ) -> List[AgentTemplateMetadata]:
        """        Search for agent templates.

        Args:
            query: Search query (matches name, description, tags)
            category: Filter by category
            tags: Filter by tags (any match)
            min_rating: Minimum rating threshold
            sort_by: Sort criteria

        Returns:
            List of matching templates"""
        return search_templates(
            self.templates,
            query=query,
            category=category,
            tags=tags,
            min_rating=min_rating,
            sort_by=sort_by
        )

    def get_template(self, template_id: str) -> Optional[AgentTemplateMetadata]:
        """Get a template by ID."""
        return self.template_manager.get(template_id, self.templates)

    def list_by_category(self, category: TemplateCategory) -> List[AgentTemplateMetadata]:
        """List all templates in a category."""
        return list_by_category(self.templates, category)

    def get_popular(self, limit: int = 10) -> List[AgentTemplateMetadata]:
        """Get most popular templates by downloads."""
        return get_popular(self.templates, limit)

    def get_top_rated(self, limit: int = 10) -> List[AgentTemplateMetadata]:
        """Get highest rated templates."""
        return get_top_rated(self.templates, limit)

    async def add_review(self, review: AgentReview):
        """Add a review for a template."""
        if review.template_id not in self.reviews:
            self.reviews[review.template_id] = []

        self.reviews[review.template_id].append(review)

        # Recalculate rating
        template = self.templates.get(review.template_id)
        if template:
            reviews = self.reviews[review.template_id]
            template.rating = sum(r.rating for r in reviews) / len(reviews)
            template.review_count = len(reviews)

    async def increment_download(self, template_id: str):
        """Increment download counter for a template."""
        template = self.templates.get(template_id)
        if template:
            template.downloads += 1

    def get_statistics(self) -> Dict[str, any]:
        """Get marketplace statistics."""
        return get_marketplace_statistics(self.templates)


__all__ = [
    "AgentMarketplace",
    "AgentTemplateMetadata",
    "AgentReview",
    "TemplateStatus",
    "TemplateCategory"
]
