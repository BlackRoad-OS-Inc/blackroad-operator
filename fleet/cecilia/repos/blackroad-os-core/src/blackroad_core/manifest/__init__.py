"""Manifest Schemas and Validation

Defines the structure of agent and pack manifests with validation utilities."""

from dataclasses import dataclass, field, asdict
from typing import Any, Optional
from enum import Enum
import json


class RuntimeType(str, Enum):
    """Supported agent runtime types."""
    LLM_BRAIN = "llm_brain"
    LLM_WORKFLOW = "llm_workflow"
    WORKFLOW_ENGINE = "workflow_engine"
    PYTHON_SCRIPT = "python_script"
    HTTP_WEBHOOK = "http_webhook"
    COMPOSITE = "composite"


@dataclass
class ResourceRequirements:
    """Resource requirements for an agent."""
    cpu: str = "100m"
    memory: str = "128Mi"
    gpu: Optional[str] = None


@dataclass
class LLMConfig:
    """LLM configuration for AI-powered agents."""
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    provider: str = "openai"
    system_prompt: Optional[str] = None


@dataclass
class LoggingConfig:
    """Logging configuration."""
    level: str = "info"
    retain_days: int = 30


@dataclass
class AuditConfig:
    """Audit configuration."""
    enabled: bool = True
    pii_sensitivity: str = "low"  # 'none', 'low', 'medium', 'high'


@dataclass
class Permissions:
    """Agent permissions."""
    allowed_data: list[str] = field(default_factory=list)
    allowed_actions: list[str] = field(default_factory=list)
    denied_data: list[str] = field(default_factory=list)
    denied_actions: list[str] = field(default_factory=list)


@dataclass
class AgentManifest:
    """    Complete agent manifest definition.

    This defines everything about how an agent operates:
    - Identity and metadata
    - Runtime configuration
    - Resource requirements
    - LLM settings (if applicable)
    - Permissions and capabilities
    - Logging and audit settings"""
    id: str
    name: str
    pack: str
    runtime_type: RuntimeType
    description: str = ""
    version: str = "1.0.0"
    capabilities: list[str] = field(default_factory=list)
    resources: ResourceRequirements = field(default_factory=ResourceRequirements)
    llm: Optional[LLMConfig] = None
    permissions: Permissions = field(default_factory=Permissions)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    audit: AuditConfig = field(default_factory=AuditConfig)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        data = asdict(self)
        data["runtime_type"] = self.runtime_type.value
        return data

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "AgentManifest":
        """Create from dictionary."""
        data = data.copy()

        # Handle runtime_type
        if isinstance(data.get("runtime_type"), str):
            data["runtime_type"] = RuntimeType(data["runtime_type"])

        # Handle nested objects
        if isinstance(data.get("resources"), dict):
            data["resources"] = ResourceRequirements(**data["resources"])

        if data.get("llm") and isinstance(data["llm"], dict):
            data["llm"] = LLMConfig(**data["llm"])

        if isinstance(data.get("permissions"), dict):
            data["permissions"] = Permissions(**data["permissions"])

        if isinstance(data.get("logging"), dict):
            data["logging"] = LoggingConfig(**data["logging"])

        if isinstance(data.get("audit"), dict):
            data["audit"] = AuditConfig(**data["audit"])

        return cls(**data)


@dataclass
class PackManifest:
    """    Pack manifest definition.

    Defines a collection of agent templates for a specific domain."""
    key: str
    name: str
    description: str = ""
    version: str = "1.0.0"
    icon: Optional[str] = None
    category: str = "general"
    agent_templates: list[str] = field(default_factory=list)
    workflows: list[str] = field(default_factory=list)
    dependencies: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "PackManifest":
        """Create from dictionary."""
        return cls(**data)


def validate_agent_manifest(manifest: dict[str, Any]) -> tuple[bool, list[str]]:
    """    Validate an agent manifest dictionary.

    Args:
        manifest: The manifest to validate

    Returns:
        Tuple of (is_valid, list of error messages)"""
    errors = []

    # Required fields
    required = ["id", "name", "pack", "runtime_type"]
    for field in required:
        if field not in manifest:
            errors.append(f"Missing required field: {field}")

    # Validate runtime_type
    if "runtime_type" in manifest:
        try:
            RuntimeType(manifest["runtime_type"])
        except ValueError:
            valid_types = [t.value for t in RuntimeType]
            errors.append(f"Invalid runtime_type. Must be one of: {valid_types}")

    # Validate resources if present
    if "resources" in manifest:
        res = manifest["resources"]
        if not isinstance(res, dict):
            errors.append("resources must be a dictionary")

    # Validate LLM config if present and runtime is LLM-based
    if manifest.get("runtime_type") in ["llm_brain", "llm_workflow"]:
        if "llm" not in manifest:
            errors.append("LLM runtime types require 'llm' configuration")
        elif not isinstance(manifest["llm"], dict):
            errors.append("llm must be a dictionary")
        elif "model" not in manifest["llm"]:
            errors.append("llm.model is required")

    return len(errors) == 0, errors


def validate_pack_manifest(manifest: dict[str, Any]) -> tuple[bool, list[str]]:
    """    Validate a pack manifest dictionary.

    Args:
        manifest: The manifest to validate

    Returns:
        Tuple of (is_valid, list of error messages)"""
    errors = []

    required = ["key", "name"]
    for field in required:
        if field not in manifest:
            errors.append(f"Missing required field: {field}")

    if "key" in manifest:
        key = manifest["key"]
        if not isinstance(key, str) or not key.isidentifier():
            errors.append("key must be a valid identifier (letters, numbers, underscores)")

    return len(errors) == 0, errors


def merge_manifests(
    base: dict[str, Any],
    overrides: dict[str, Any],
) -> dict[str, Any]:
    """    Merge a base manifest with org-specific overrides.

    Creates the effective_manifest for an agent instance.
    Overrides are applied recursively for nested dicts.

    Args:
        base: The base manifest from the template
        overrides: Org-specific overrides

    Returns:
        Merged manifest dictionary"""
    result = base.copy()

    for key, value in overrides.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_manifests(result[key], value)
        else:
            result[key] = value

    return result


__all__ = [
    "RuntimeType",
    "ResourceRequirements",
    "LLMConfig",
    "LoggingConfig",
    "AuditConfig",
    "Permissions",
    "AgentManifest",
    "PackManifest",
    "validate_agent_manifest",
    "validate_pack_manifest",
    "merge_manifests",
]
