"""BlackRoad Agent Marketplace - Search and Discovery

Provides search, filtering, and recommendation functionality for agent templates."""

from __future__ import annotations

from typing import List, Optional

from .models import AgentTemplateMetadata, TemplateCategory, TemplateStatus


def search_templates(
    templates: dict[str, AgentTemplateMetadata],
    query: Optional[str] = None,
    category: Optional[TemplateCategory] = None,
    tags: Optional[List[str]] = None,
    min_rating: float = 0.0,
    sort_by: str = "downloads"  # downloads, rating, published_at
) -> List[AgentTemplateMetadata]:
    """    Search for agent templates.

    Args:
        templates: Template registry
        query: Search query (matches name, description, tags)
        category: Filter by category
        tags: Filter by tags (any match)
        min_rating: Minimum rating threshold
        sort_by: Sort criteria

    Returns:
        List of matching templates"""
    results = list(templates.values())

    # Filter by status (only published)
    results = [t for t in results if t.status == TemplateStatus.PUBLISHED]

    # Filter by category
    if category:
        results = [t for t in results if t.category == category]

    # Filter by tags
    if tags:
        results = [
            t for t in results
            if any(tag in t.tags for tag in tags)
        ]

    # Filter by rating
    results = [t for t in results if t.rating >= min_rating]

    # Filter by query
    if query:
        query_lower = query.lower()
        results = [
            t for t in results
            if query_lower in t.name.lower()
            or query_lower in t.description.lower()
            or any(query_lower in tag for tag in t.tags)
        ]

    # Sort
    if sort_by == "downloads":
        results.sort(key=lambda t: t.downloads, reverse=True)
    elif sort_by == "rating":
        results.sort(key=lambda t: t.rating, reverse=True)
    elif sort_by == "published_at":
        results.sort(key=lambda t: t.published_at or "", reverse=True)

    return results


def list_by_category(
    templates: dict[str, AgentTemplateMetadata],
    category: TemplateCategory
) -> List[AgentTemplateMetadata]:
    """List all templates in a category."""
    return [
        t for t in templates.values()
        if t.category == category and t.status == TemplateStatus.PUBLISHED
    ]


def get_popular(
    templates: dict[str, AgentTemplateMetadata],
    limit: int = 10
) -> List[AgentTemplateMetadata]:
    """Get most popular templates by downloads."""
    published = [
        t for t in templates.values()
        if t.status == TemplateStatus.PUBLISHED
    ]
    published.sort(key=lambda t: t.downloads, reverse=True)
    return published[:limit]


def get_top_rated(
    templates: dict[str, AgentTemplateMetadata],
    limit: int = 10,
    min_reviews: int = 10
) -> List[AgentTemplateMetadata]:
    """Get highest rated templates."""
    published = [
        t for t in templates.values()
        if t.status == TemplateStatus.PUBLISHED and t.review_count >= min_reviews
    ]
    published.sort(key=lambda t: t.rating, reverse=True)
    return published[:limit]


__all__ = [
    "search_templates",
    "list_by_category",
    "get_popular",
    "get_top_rated"
]
