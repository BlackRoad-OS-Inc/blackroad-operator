"""Bootstrap Engine configuration helpers."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List


_DEFAULT_PRISM_CANDIDATES = (
    "services/prism-console-api/data/prism.db",
    "services/prism-console-api/prism.db",
    "services/prism-console-api/var/prism.db",
    "data/prism.db",
    "prism.db",
)
_DEFAULT_PI_OPS_CANDIDATES = (
    "pi_ops/ops.db",
    "ops.db",
)


@dataclass(slots=True)
class BootstrapConfig:
    """Centralised runtime configuration for the bootstrap engine."""

    repo_root: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent)
    prism_db_candidates: List[Path] = field(default_factory=list)
    pi_ops_db_candidates: List[Path] = field(default_factory=list)
    census_path: Path | None = None
    identities_path: Path | None = None
    metaverse_status_url: str = field(default_factory=lambda: os.environ.get("METAVERSE_STATUS_URL", "http://localhost:3000/api/health"))
    pi_ops_mqtt_host: str = field(default_factory=lambda: os.environ.get("PI_OPS_MQTT_HOST", "localhost"))
    pi_ops_mqtt_port: int = field(default_factory=lambda: int(os.environ.get("PI_OPS_MQTT_PORT", "1883")))
    mqtt_timeout: float = field(default_factory=lambda: float(os.environ.get("PI_OPS_MQTT_TIMEOUT", "2.0")))

    @classmethod
    def from_env(cls, repo_root: Path | None = None) -> "BootstrapConfig":
        root = repo_root or Path(os.environ.get("BLACKROAD_REPO_ROOT", Path(__file__).resolve().parent.parent))
        prism_env = os.environ.get("PRISM_DB_PATH")
        pi_ops_env = os.environ.get("PI_OPS_DB_PATH")
        census_env = os.environ.get("AGENT_IDS_PATH")
        identities_env = os.environ.get("AGENT_IDENTITIES_PATH")
        config = cls(repo_root=root)
        if prism_env:
            config.prism_db_candidates.append(Path(prism_env))
        if pi_ops_env:
            config.pi_ops_db_candidates.append(Path(pi_ops_env))
        if census_env:
            config.census_path = Path(census_env)
        if identities_env:
            config.identities_path = Path(identities_env)
        config._initialise_defaults()
        return config

    def _initialise_defaults(self) -> None:
        if not self.prism_db_candidates:
            self.prism_db_candidates = [Path(path) for path in _DEFAULT_PRISM_CANDIDATES]
        if not self.pi_ops_db_candidates:
            self.pi_ops_db_candidates = [Path(path) for path in _DEFAULT_PI_OPS_CANDIDATES]
        if self.census_path is None:
            self.census_path = self.repo_root / "AGENT_IDS_P1_P1250.txt"
        if self.identities_path is None:
            self.identities_path = self.repo_root / "artifacts/agents/identities.jsonl"

    def iter_prism_candidates(self) -> Iterable[Path]:
        yield from self._iter_candidates(self.prism_db_candidates)

    def iter_pi_ops_candidates(self) -> Iterable[Path]:
        yield from self._iter_candidates(self.pi_ops_db_candidates)

    def _iter_candidates(self, candidates: Iterable[Path]) -> Iterable[Path]:
        for candidate in candidates:
            yield candidate if candidate.is_absolute() else self.repo_root / candidate
