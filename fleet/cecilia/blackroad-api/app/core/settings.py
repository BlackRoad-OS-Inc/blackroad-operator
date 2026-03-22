"""Application settings using Pydantic BaseSettings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings loaded from environment."""

    app_name: str = "blackroad-os-api"
    version: str = "0.0.1"
    git_sha: str = Field("unknown", alias="GIT_SHA")
    log_level: str = "INFO"
    celery_broker_url: str = Field(default="memory://", alias="CELERY_BROKER_URL")
    gateway_url: str = Field(default="http://127.0.0.1:8787", alias="BLACKROAD_GATEWAY_URL")
    db_path: str = Field(default="./blackroad.db", alias="BLACKROAD_DB")

    model_config = SettingsConfigDict(
        env_file=(".env", "infra/api.env"), env_file_encoding="utf-8"
    )


settings = Settings()
