"""Bot that validates environment configuration files across services."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set

LOGGER = logging.getLogger(__name__)


@dataclass
class ConfigGuardian:
    """Validate environment configuration files and detect secrets."""

    root_dir: Path = Path(".")
    dry_run: bool = False

    SENSITIVE_PATTERNS = [
        r"(password|passwd|pwd)\s*[=:]",
        r"(api_key|apikey|api-key)\s*[=:]",
        r"(secret|token)\s*[=:]",
        r"(private_key|privatekey)\s*[=:]",
    ]

    def find_config_files(self) -> List[Path]:
        """Find all configuration files."""
        patterns = [
            "**/.env",
            "**/.env.*",
            "**/config.json",
            "**/config.yml",
            "**/config.yaml",
            "**/config.toml",
        ]

        files: List[Path] = []
        for pattern in patterns:
            for config_file in self.root_dir.glob(pattern):
                # Skip node_modules, venv, etc.
                if any(part in ["node_modules", "venv", ".venv", ".git", "dist"] for part in config_file.parts):
                    continue
                # Skip .example files (they're templates)
                if ".example" in config_file.name or "sample" in config_file.name.lower():
                    continue
                files.append(config_file)

        return files

    def check_for_secrets(self, content: str) -> List[str]:
        """Check content for potential exposed secrets."""
        issues = []

        for pattern in self.SENSITIVE_PATTERNS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                line = content[: match.start()].count("\n") + 1
                # Check if value looks like a placeholder
                value_pattern = r"[=:]\s*([^\n]+)"
                value_match = re.search(value_pattern, content[match.start() :])

                if value_match:
                    value = value_match.group(1).strip().strip('"').strip("'")

                    # Skip obvious placeholders
                    if value and value not in ["", "changeme", "your-key-here", "xxx", "***"]:
                        if not re.match(r"^\$\{.*\}$", value):  # Not an env var reference
                            issues.append(f"Line {line}: Potential exposed secret ({match.group(1)})")

        return issues

    def validate_env_syntax(self, content: str) -> List[str]:
        """Validate .env file syntax."""
        issues = []
        lines = content.splitlines()

        for i, line in enumerate(lines, 1):
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue

            # Check for valid KEY=VALUE format
            if "=" not in line:
                issues.append(f"Line {i}: Invalid syntax (missing '=')")
                continue

            key, _ = line.split("=", 1)
            key = key.strip()

            # Check key format
            if not re.match(r"^[A-Z_][A-Z0-9_]*$", key):
                issues.append(f"Line {i}: Key '{key}' should be UPPER_CASE_SNAKE_CASE")

        return issues

    def analyze_config(self, config_path: Path) -> Dict[str, any]:
        """Analyze a configuration file."""
        try:
            content = config_path.read_text()
            issues = []

            # Check for secrets
            issues.extend(self.check_for_secrets(content))

            # Validate .env syntax
            if ".env" in config_path.name:
                issues.extend(self.validate_env_syntax(content))

            return {
                "path": str(config_path),
                "issues": issues,
                "has_issues": len(issues) > 0,
            }

        except Exception as exc:
            LOGGER.warning(f"Failed to analyze {config_path}: {exc}")
            return {"path": str(config_path), "issues": [f"Error: {exc}"], "has_issues": True}

    def execute(self) -> Dict[str, any]:
        """Validate all configuration files."""
        configs = self.find_config_files()
        problematic = []

        LOGGER.info(f"Validating {len(configs)} configuration files...")

        for config_file in configs:
            analysis = self.analyze_config(config_file)
            if analysis["has_issues"]:
                problematic.append(analysis)
                LOGGER.warning(f"Issues in {config_file.name}:")
                for issue in analysis["issues"][:5]:  # Show first 5
                    LOGGER.warning(f"  - {issue}")

        stats = {
            "total_configs": len(configs),
            "problematic_count": len(problematic),
            "problematic_configs": problematic,
        }

        if problematic:
            LOGGER.warning(f"Found {len(problematic)} configs with issues")
        else:
            LOGGER.info("All configuration files validated successfully")

        return stats


__all__ = ["ConfigGuardian"]
