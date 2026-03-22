"""BlackRoad Agent Marketplace - Data Models

Defines core data structures for the marketplace:
- Template metadata and status
- Community reviews and ratings
- Template categories"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from datetime import datetime, UTC
from enum import Enum


class TemplateStatus(Enum):
    """Agent template publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class TemplateCategory(Enum):
    """Agent template categories."""
    FINANCE = "finance"
    LEGAL = "legal"
    RESEARCH = "research"
    CREATIVE = "creative"
    DEVOPS = "devops"
    SUPPORT = "support"
    ANALYTICS = "analytics"
    AUTOMATION = "automation"
    GENERAL = "general"


@dataclass
class AgentTemplateMetadata:
    """Metadata for a publishable agent template."""
    id: str
    name: str
    description: str
    version: str
    author: str
    category: TemplateCategory

    # Configuration
    role: str
    capabilities: List[str]
    runtime_type: str
    pack_requirements: List[str] = field(default_factory=list)

    # Discovery
    tags: List[str] = field(default_factory=list)
    license: str = "MIT"
    homepage: Optional[str] = None
    repository: Optional[str] = None

    # Stats
    downloads: int = 0
    rating: float = 0.0
    review_count: int = 0

    # Publication
    status: TemplateStatus = TemplateStatus.DRAFT
    published_at: Optional[str] = None
    updated_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())

    # Resources
    default_resources: Dict[str, Any] = field(default_factory=dict)
    suggested_workflows: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "version": self.version,
            "author": self.author,
            "category": self.category.value,
            "role": self.role,
            "capabilities": self.capabilities,
            "runtime_type": self.runtime_type,
            "pack_requirements": self.pack_requirements,
            "tags": self.tags,
            "license": self.license,
            "homepage": self.homepage,
            "repository": self.repository,
            "downloads": self.downloads,
            "rating": self.rating,
            "review_count": self.review_count,
            "status": self.status.value,
            "published_at": self.published_at,
            "updated_at": self.updated_at,
            "default_resources": self.default_resources,
            "suggested_workflows": self.suggested_workflows
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> AgentTemplateMetadata:
        """Create from dictionary."""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            version=data["version"],
            author=data["author"],
            category=TemplateCategory(data["category"]),
            role=data["role"],
            capabilities=data["capabilities"],
            runtime_type=data["runtime_type"],
            pack_requirements=data.get("pack_requirements", []),
            tags=data.get("tags", []),
            license=data.get("license", "MIT"),
            homepage=data.get("homepage"),
            repository=data.get("repository"),
            downloads=data.get("downloads", 0),
            rating=data.get("rating", 0.0),
            review_count=data.get("review_count", 0),
            status=TemplateStatus(data.get("status", "draft")),
            published_at=data.get("published_at"),
            updated_at=data.get("updated_at", datetime.now(UTC).isoformat()),
            default_resources=data.get("default_resources", {}),
            suggested_workflows=data.get("suggested_workflows", [])
        )


@dataclass
class AgentReview:
    """User review of an agent template."""
    id: str
    template_id: str
    user_id: str
    rating: int  # 1-5
    title: str
    content: str
    created_at: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    helpful_count: int = 0


__all__ = [
    "TemplateStatus",
    "TemplateCategory",
    "AgentTemplateMetadata",
    "AgentReview"
]
