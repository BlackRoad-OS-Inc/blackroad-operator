from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the QLM bridge service."""

    model_config = SettingsConfigDict(env_prefix="QLM_", env_file=".env", extra="ignore")

    bridge_port: int = 8100
    gateway_url: Optional[AnyUrl] = None
    storage_path: str = "/tmp/origin-qlm-bridge"
    policy_bundle: Optional[str] = None
    evidence_stream: Optional[AnyUrl] = None


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()
