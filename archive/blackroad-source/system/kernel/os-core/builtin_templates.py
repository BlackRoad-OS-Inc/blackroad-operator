"""BlackRoad Agent Marketplace - Built-in Templates

Defines the canonical set of built-in agent templates provided
by BlackRoad OS for common use cases."""

from __future__ import annotations

from datetime import datetime, UTC
from typing import Dict

from .models import AgentTemplateMetadata, TemplateCategory, TemplateStatus


def get_builtin_templates() -> Dict[str, AgentTemplateMetadata]:
    """    Get all built-in agent templates.

    Returns:
        Dictionary mapping template ID to template metadata."""
    templates = {}

    # Financial Analyst Agent
    templates["template-financial-analyst"] = AgentTemplateMetadata(
        id="template-financial-analyst",
        name="Financial Analyst Agent",
        description="Analyzes financial data, generates reports, and identifies trends",
        version="1.0.0",
        author="BlackRoad OS",
        category=TemplateCategory.FINANCE,
        role="Financial Analyst",
        capabilities=["analyze_transactions", "generate_reports", "forecast_revenue"],
        runtime_type="llm_brain",
        pack_requirements=["pack-finance"],
        tags=["finance", "analytics", "reporting"],
        status=TemplateStatus.PUBLISHED,
        published_at=datetime.now(UTC).isoformat(),
        rating=4.8,
        downloads=1247,
        review_count=89
    )

    # Research Assistant Agent
    templates["template-research-assistant"] = AgentTemplateMetadata(
        id="template-research-assistant",
        name="Research Assistant Agent",
        description="Searches academic papers, synthesizes knowledge, and assists with research",
        version="1.0.0",
        author="BlackRoad OS",
        category=TemplateCategory.RESEARCH,
        role="Research Assistant",
        capabilities=["search_papers", "synthesize_knowledge"],
        runtime_type="llm_brain",
        pack_requirements=["pack-research-lab"],
        tags=["research", "academic", "literature-review"],
        status=TemplateStatus.PUBLISHED,
        published_at=datetime.now(UTC).isoformat(),
        rating=4.6,
        downloads=892,
        review_count=54
    )

    # DevOps Engineer Agent
    templates["template-devops-engineer"] = AgentTemplateMetadata(
        id="template-devops-engineer",
        name="DevOps Engineer Agent",
        description="Deploys services, manages infrastructure, and monitors system health",
        version="1.0.0",
        author="BlackRoad OS",
        category=TemplateCategory.DEVOPS,
        role="DevOps Engineer",
        capabilities=["deploy_services", "monitor_systems", "manage_infrastructure"],
        runtime_type="workflow_engine",
        pack_requirements=["pack-infra-devops"],
        tags=["devops", "deployment", "infrastructure"],
        status=TemplateStatus.PUBLISHED,
        published_at=datetime.now(UTC).isoformat(),
        rating=4.9,
        downloads=2103,
        review_count=142
    )

    # Content Writer Agent
    templates["template-content-writer"] = AgentTemplateMetadata(
        id="template-content-writer",
        name="Content Writer Agent",
        description="Generates creative content, scripts, and marketing copy",
        version="1.0.0",
        author="BlackRoad OS",
        category=TemplateCategory.CREATIVE,
        role="Content Writer",
        capabilities=["generate_content"],
        runtime_type="llm_brain",
        pack_requirements=["pack-creator-studio"],
        tags=["content", "creative", "writing"],
        status=TemplateStatus.PUBLISHED,
        published_at=datetime.now(UTC).isoformat(),
        rating=4.5,
        downloads=1567,
        review_count=98
    )

    # Customer Support Agent
    templates["template-customer-support"] = AgentTemplateMetadata(
        id="template-customer-support",
        name="Customer Support Agent",
        description="Handles customer inquiries, troubleshoots issues, and provides assistance",
        version="1.0.0",
        author="BlackRoad OS",
        category=TemplateCategory.SUPPORT,
        role="Customer Support Specialist",
        capabilities=["handle_inquiries", "troubleshoot", "ticket_routing"],
        runtime_type="llm_brain",
        pack_requirements=[],
        tags=["support", "customer-service", "help-desk"],
        status=TemplateStatus.PUBLISHED,
        published_at=datetime.now(UTC).isoformat(),
        rating=4.7,
        downloads=3421,
        review_count=234
    )

    return templates


__all__ = ["get_builtin_templates"]
