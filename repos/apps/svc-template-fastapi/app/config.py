"""Application configuration via environment variables."""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Service configuration sourced from environment variables."""

    app_name: str = Field(default="svc-template-fastapi", description="Service name for logging/metrics")
    environment: str = Field(default="local", description="Deployment environment label")
    log_level: str = Field(default="INFO", description="Python log level")
    otlp_endpoint: str | None = Field(default=None, description="OTLP collector endpoint")
    build_sha: str = Field(default="local", description="Git SHA used for builds")
    readiness_dependencies: List[str] = Field(
        default_factory=list,
        description="Comma-separated list of dependency URLs to probe for readiness.",
    )
    metrics_auth_token: str | None = Field(
        default=None,
        description="Optional bearer token required to read /metrics.",
    )

    model_config = SettingsConfigDict(env_file=None, case_sensitive=False, extra="ignore")

    def model_post_init(self, __context: dict | None) -> None:  # type: ignore[override]
        self.readiness_dependencies = self._parse_dependency_list(self.readiness_dependencies)

    @staticmethod
    def _parse_dependency_list(value: str | List[str] | None) -> List[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [item.strip() for item in value.split(",") if item.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
