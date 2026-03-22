"""
Production product catalog for BlackRoad ML Pipeline.

Defines every production-level product/service offered through the
BlackRoad platform, including Stripe price identifiers (read from env
vars), feature flags, and pipeline integration metadata.

Usage::

    from products import PRODUCTS, get_product, list_products

    for p in list_products():
        print(p["name"], p["tier"])

    pro = get_product("ml_pipeline_pro")
    print(pro["features"])
"""

from __future__ import annotations

import os
from dataclasses import dataclass, asdict, field
from typing import Optional


@dataclass(frozen=True)
class Product:
    """A single production-level product/service."""
    id: str
    name: str
    description: str
    tier: str                        # e.g. "free", "pro", "enterprise"
    stripe_price_env: str            # env-var name that holds the Stripe Price ID
    features: tuple[str, ...]
    pipeline_stages: tuple[str, ...] # which ML pipeline stages are included
    max_pipelines: int               # 0 = unlimited
    max_models_per_pipeline: int
    storage_gb: int
    support_level: str               # "community", "email", "priority", "dedicated"
    active: bool = True

    @property
    def stripe_price_id(self) -> str:
        """Resolve the Stripe Price ID from the environment at runtime.

        Returns an empty string when the environment variable is not set.
        """
        return os.environ.get(self.stripe_price_env, "")

    def to_dict(self) -> dict:
        d = asdict(self)
        d["stripe_price_id"] = self.stripe_price_id
        return d


# ---------------------------------------------------------------------------
# Product catalog — every production-level product
# ---------------------------------------------------------------------------

PRODUCTS: tuple[Product, ...] = (
    Product(
        id="ml_pipeline_free",
        name="ML Pipeline Free",
        description="Get started with ML pipeline orchestration at no cost.",
        tier="free",
        stripe_price_env="STRIPE_PRICE_FREE",
        features=(
            "single_pipeline",
            "basic_metrics",
            "sqlite_storage",
            "community_support",
        ),
        pipeline_stages=(
            "DataIngestion",
            "FeatureEngineering",
            "Training",
            "Evaluation",
        ),
        max_pipelines=1,
        max_models_per_pipeline=3,
        storage_gb=1,
        support_level="community",
    ),
    Product(
        id="ml_pipeline_pro",
        name="ML Pipeline Pro",
        description="Production-grade ML pipelines with deployment, rollback, and advanced metrics.",
        tier="pro",
        stripe_price_env="STRIPE_PRICE_PRO",
        features=(
            "unlimited_pipelines",
            "deployment",
            "rollback",
            "advanced_metrics",
            "feature_versioning",
            "s3_storage",
            "email_support",
        ),
        pipeline_stages=(
            "DataIngestion",
            "FeatureEngineering",
            "Training",
            "Evaluation",
            "Deployment",
        ),
        max_pipelines=0,  # unlimited
        max_models_per_pipeline=50,
        storage_gb=100,
        support_level="email",
    ),
    Product(
        id="ml_pipeline_enterprise",
        name="ML Pipeline Enterprise",
        description="Enterprise ML platform with dedicated support, SLA, and custom integrations.",
        tier="enterprise",
        stripe_price_env="STRIPE_PRICE_ENTERPRISE",
        features=(
            "unlimited_pipelines",
            "deployment",
            "rollback",
            "advanced_metrics",
            "feature_versioning",
            "s3_storage",
            "google_drive_integration",
            "custom_stages",
            "multi_region_deploy",
            "audit_logging",
            "sso",
            "dedicated_support",
            "sla_99_9",
        ),
        pipeline_stages=(
            "DataIngestion",
            "FeatureEngineering",
            "Training",
            "Evaluation",
            "Deployment",
        ),
        max_pipelines=0,
        max_models_per_pipeline=0,  # unlimited
        storage_gb=0,               # unlimited
        support_level="dedicated",
    ),
    Product(
        id="ml_data_labeling",
        name="Data Labeling Service",
        description="Managed data labeling for supervised ML training datasets.",
        tier="pro",
        stripe_price_env="STRIPE_PRICE_DATA_LABELING",
        features=(
            "human_in_the_loop",
            "auto_labeling",
            "quality_review",
            "export_formats",
        ),
        pipeline_stages=(
            "DataIngestion",
            "FeatureEngineering",
        ),
        max_pipelines=0,
        max_models_per_pipeline=0,
        storage_gb=500,
        support_level="email",
    ),
    Product(
        id="ml_model_monitoring",
        name="Model Monitoring",
        description="Real-time model performance monitoring, drift detection, and alerting.",
        tier="pro",
        stripe_price_env="STRIPE_PRICE_MODEL_MONITORING",
        features=(
            "drift_detection",
            "performance_alerts",
            "dashboard",
            "webhook_notifications",
            "custom_metrics",
        ),
        pipeline_stages=(
            "Evaluation",
            "Deployment",
        ),
        max_pipelines=0,
        max_models_per_pipeline=0,
        storage_gb=50,
        support_level="email",
    ),
    Product(
        id="ml_feature_store",
        name="Feature Store",
        description="Centralized feature store for ML feature sharing and reuse.",
        tier="pro",
        stripe_price_env="STRIPE_PRICE_FEATURE_STORE",
        features=(
            "feature_versioning",
            "feature_sharing",
            "online_serving",
            "offline_batch",
            "feature_lineage",
        ),
        pipeline_stages=(
            "FeatureEngineering",
        ),
        max_pipelines=0,
        max_models_per_pipeline=0,
        storage_gb=200,
        support_level="email",
    ),
    Product(
        id="ml_automl",
        name="AutoML",
        description="Automated model selection, hyperparameter tuning, and ensemble building.",
        tier="enterprise",
        stripe_price_env="STRIPE_PRICE_AUTOML",
        features=(
            "auto_model_selection",
            "hyperparameter_tuning",
            "ensemble_building",
            "neural_architecture_search",
            "experiment_tracking",
        ),
        pipeline_stages=(
            "Training",
            "Evaluation",
        ),
        max_pipelines=0,
        max_models_per_pipeline=0,
        storage_gb=500,
        support_level="dedicated",
    ),
)

# Build a lookup dict for fast access by ID
_PRODUCT_MAP: dict[str, Product] = {p.id: p for p in PRODUCTS}


def get_product(product_id: str) -> Optional[Product]:
    """Return a Product by its ID, or None if not found."""
    return _PRODUCT_MAP.get(product_id)


def list_products(*, active_only: bool = True, tier: Optional[str] = None) -> list[dict]:
    """Return all products as dicts, optionally filtered.

    Args:
        active_only: If True, exclude inactive products.
        tier: Filter by tier (free / pro / enterprise).

    Returns:
        List of product dicts.
    """
    results = []
    for p in PRODUCTS:
        if active_only and not p.active:
            continue
        if tier and p.tier != tier:
            continue
        results.append(p.to_dict())
    return results


def list_product_ids() -> list[str]:
    """Return all product IDs."""
    return [p.id for p in PRODUCTS]
