"""BlackRoad Agent Marketplace - Analytics and Statistics

Provides marketplace-wide analytics and statistics."""

from __future__ import annotations

from typing import Dict, Any

from .models import AgentTemplateMetadata, TemplateStatus


def get_marketplace_statistics(templates: dict[str, AgentTemplateMetadata]) -> Dict[str, Any]:
    """Get marketplace statistics.

    Args:
        templates: Template registry

    Returns:
        Dictionary with marketplace-wide statistics
    """
    published = [
        t for t in templates.values()
        if t.status == TemplateStatus.PUBLISHED
    ]

    category_counts = {}
    for template in published:
        cat = template.category.value
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "total_templates": len(published),
        "total_downloads": sum(t.downloads for t in published),
        "avg_rating": sum(t.rating for t in published) / len(published) if published else 0,
        "total_reviews": sum(t.review_count for t in published),
        "by_category": category_counts
    }


__all__ = ["get_marketplace_statistics"]
