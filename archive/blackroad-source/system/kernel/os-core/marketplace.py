"""BlackRoad Agent Marketplace (Legacy Import Path)

This module provides backward compatibility for existing imports.
New code should import from blackroad_core.marketplace instead.

Example:
    # Old (still supported)
    from blackroad_core.marketplace import AgentMarketplace

    # New (preferred)
    from blackroad_core.marketplace import AgentMarketplace"""

import warnings

# Re-export all public APIs from refactored modules
from blackroad_core.marketplace import (
    AgentMarketplace,
    AgentTemplateMetadata,
    AgentReview,
    TemplateStatus,
    TemplateCategory
)

# Show deprecation warning
warnings.warn(
    "Importing from blackroad_core.marketplace.py is deprecated. "
    "Import from blackroad_core.marketplace package instead.",
    DeprecationWarning,
    stacklevel=2
)

__all__ = [
    "AgentMarketplace",
    "AgentTemplateMetadata",
    "AgentReview",
    "TemplateStatus",
    "TemplateCategory"
]
