"""Tests for production configuration module."""

import os
import pytest
from config import (
    StripeConfig,
    StorageConfig,
    PipelineConfig,
    DeployConfig,
    ProductionConfig,
    load_config,
)


class TestStripeConfig:
    def test_from_env(self, monkeypatch):
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_123")
        monkeypatch.setenv("STRIPE_PUBLISHABLE_KEY", "pk_test_123")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_123")
        cfg = StripeConfig.from_env()
        assert cfg.secret_key == "sk_test_123"
        assert cfg.publishable_key == "pk_test_123"
        assert cfg.webhook_secret == "whsec_test_123"

    def test_from_env_missing_raises(self, monkeypatch):
        monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
        monkeypatch.delenv("STRIPE_PUBLISHABLE_KEY", raising=False)
        monkeypatch.delenv("STRIPE_WEBHOOK_SECRET", raising=False)
        with pytest.raises(EnvironmentError, match="STRIPE_SECRET_KEY"):
            StripeConfig.from_env()


class TestStorageConfig:
    def test_defaults(self, monkeypatch):
        for var in ("STORAGE_BACKEND", "STORAGE_S3_BUCKET", "STORAGE_S3_REGION",
                     "STORAGE_S3_ACCESS_KEY", "STORAGE_S3_SECRET_KEY",
                     "GOOGLE_DRIVE_CREDENTIALS_JSON", "GOOGLE_DRIVE_FOLDER_ID"):
            monkeypatch.delenv(var, raising=False)
        cfg = StorageConfig.from_env()
        assert cfg.backend == "local"
        assert cfg.s3_region == "us-east-1"

    def test_s3_config(self, monkeypatch):
        monkeypatch.setenv("STORAGE_BACKEND", "s3")
        monkeypatch.setenv("STORAGE_S3_BUCKET", "my-bucket")
        cfg = StorageConfig.from_env()
        assert cfg.backend == "s3"
        assert cfg.s3_bucket == "my-bucket"


class TestPipelineConfig:
    def test_defaults(self, monkeypatch):
        monkeypatch.delenv("ML_PIPELINE_DB", raising=False)
        monkeypatch.delenv("ML_PIPELINE_LOG_LEVEL", raising=False)
        monkeypatch.delenv("ML_PIPELINE_ARTIFACT_DIR", raising=False)
        cfg = PipelineConfig.from_env()
        assert cfg.log_level == "INFO"
        assert cfg.artifact_dir == "/artifacts"

    def test_custom(self, monkeypatch):
        monkeypatch.setenv("ML_PIPELINE_LOG_LEVEL", "DEBUG")
        cfg = PipelineConfig.from_env()
        assert cfg.log_level == "DEBUG"


class TestDeployConfig:
    def test_defaults(self, monkeypatch):
        monkeypatch.delenv("DEPLOY_ENDPOINT_BASE", raising=False)
        monkeypatch.delenv("DEPLOY_REPLICAS", raising=False)
        monkeypatch.delenv("DEPLOY_HEALTH_CHECK_INTERVAL", raising=False)
        cfg = DeployConfig.from_env()
        assert cfg.endpoint_base == "https://api.blackroad.ai/v1"
        assert cfg.replicas == 2
        assert cfg.health_check_interval == 30


class TestLoadConfig:
    def test_load_without_stripe(self, monkeypatch):
        monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
        monkeypatch.delenv("STRIPE_PUBLISHABLE_KEY", raising=False)
        monkeypatch.delenv("STRIPE_WEBHOOK_SECRET", raising=False)
        cfg = load_config(require_stripe=False)
        assert cfg.stripe.secret_key == ""
        assert cfg.storage.backend in ("local", "s3")

    def test_load_with_stripe(self, monkeypatch):
        monkeypatch.setenv("STRIPE_SECRET_KEY", "sk_test_x")
        monkeypatch.setenv("STRIPE_PUBLISHABLE_KEY", "pk_test_x")
        monkeypatch.setenv("STRIPE_WEBHOOK_SECRET", "whsec_test_x")
        cfg = load_config(require_stripe=True)
        assert cfg.stripe.secret_key == "sk_test_x"

    def test_load_stripe_required_missing_raises(self, monkeypatch):
        monkeypatch.delenv("STRIPE_SECRET_KEY", raising=False)
        with pytest.raises(EnvironmentError):
            load_config(require_stripe=True)
