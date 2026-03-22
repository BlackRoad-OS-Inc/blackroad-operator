"""
Production configuration for BlackRoad ML Pipeline.

Reads all external-service credentials and tuning knobs from environment
variables so that **no secrets are ever hard-coded or committed**.
"""

import os
from dataclasses import dataclass, field
from pathlib import Path


def _require(var: str) -> str:
    """Return the value of an environment variable or raise."""
    value = os.environ.get(var)
    if not value:
        raise EnvironmentError(
            f"Required environment variable {var!r} is not set. "
            "See .env.example for the full list of required variables."
        )
    return value


def _optional(var: str, default: str = "") -> str:
    return os.environ.get(var, default)


# ---------------------------------------------------------------------------
# Stripe
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class StripeConfig:
    """Stripe billing configuration — all values from env vars."""
    secret_key: str
    publishable_key: str
    webhook_secret: str

    @classmethod
    def from_env(cls) -> "StripeConfig":
        return cls(
            secret_key=_require("STRIPE_SECRET_KEY"),
            publishable_key=_require("STRIPE_PUBLISHABLE_KEY"),
            webhook_secret=_require("STRIPE_WEBHOOK_SECRET"),
        )


# ---------------------------------------------------------------------------
# Storage / Drive
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class StorageConfig:
    """Artifact & dataset storage configuration."""
    backend: str = "local"
    s3_bucket: str = ""
    s3_region: str = "us-east-1"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    google_drive_credentials_json: str = ""
    google_drive_folder_id: str = ""

    @classmethod
    def from_env(cls) -> "StorageConfig":
        return cls(
            backend=_optional("STORAGE_BACKEND", "local"),
            s3_bucket=_optional("STORAGE_S3_BUCKET"),
            s3_region=_optional("STORAGE_S3_REGION", "us-east-1"),
            s3_access_key=_optional("STORAGE_S3_ACCESS_KEY"),
            s3_secret_key=_optional("STORAGE_S3_SECRET_KEY"),
            google_drive_credentials_json=_optional("GOOGLE_DRIVE_CREDENTIALS_JSON"),
            google_drive_folder_id=_optional("GOOGLE_DRIVE_FOLDER_ID"),
        )


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PipelineConfig:
    """Core ML pipeline settings.

    Note: The parent directory of ``db_path`` is created automatically
    by :class:`ml_pipeline.MLPipelineOrchestrator` on first use.
    """
    db_path: str = ""
    log_level: str = "INFO"
    artifact_dir: str = "/artifacts"

    @classmethod
    def from_env(cls) -> "PipelineConfig":
        return cls(
            db_path=_optional("ML_PIPELINE_DB", str(Path.home() / ".blackroad" / "ml_pipeline.db")),
            log_level=_optional("ML_PIPELINE_LOG_LEVEL", "INFO"),
            artifact_dir=_optional("ML_PIPELINE_ARTIFACT_DIR", "/artifacts"),
        )


# ---------------------------------------------------------------------------
# Deployment
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class DeployConfig:
    """Deployment target settings."""
    endpoint_base: str = "https://api.blackroad.ai/v1"
    replicas: int = 2
    health_check_interval: int = 30

    @classmethod
    def from_env(cls) -> "DeployConfig":
        return cls(
            endpoint_base=_optional("DEPLOY_ENDPOINT_BASE", "https://api.blackroad.ai/v1"),
            replicas=int(_optional("DEPLOY_REPLICAS", "2")),
            health_check_interval=int(_optional("DEPLOY_HEALTH_CHECK_INTERVAL", "30")),
        )


# ---------------------------------------------------------------------------
# Top-level helper
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ProductionConfig:
    """Aggregate production configuration."""
    stripe: StripeConfig
    storage: StorageConfig
    pipeline: PipelineConfig
    deploy: DeployConfig

    @classmethod
    def from_env(cls) -> "ProductionConfig":
        """Build the full config tree from environment variables."""
        return cls(
            stripe=StripeConfig.from_env(),
            storage=StorageConfig.from_env(),
            pipeline=PipelineConfig.from_env(),
            deploy=DeployConfig.from_env(),
        )


def load_config(require_stripe: bool = True) -> ProductionConfig:
    """Load production configuration from environment variables.

    Args:
        require_stripe: When False, Stripe keys are not required (useful
            for local dev/test where billing is not needed).

    Returns:
        A fully-populated ProductionConfig.
    """
    if require_stripe:
        stripe = StripeConfig.from_env()
    else:
        stripe = StripeConfig(
            secret_key=_optional("STRIPE_SECRET_KEY", ""),
            publishable_key=_optional("STRIPE_PUBLISHABLE_KEY", ""),
            webhook_secret=_optional("STRIPE_WEBHOOK_SECRET", ""),
        )

    return ProductionConfig(
        stripe=stripe,
        storage=StorageConfig.from_env(),
        pipeline=PipelineConfig.from_env(),
        deploy=DeployConfig.from_env(),
    )
