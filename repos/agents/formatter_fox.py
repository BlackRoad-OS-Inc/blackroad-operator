"""Bot that standardizes formatting configs across the repository."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List

LOGGER = logging.getLogger(__name__)


@dataclass
class FormatterFox:
    """Standardize formatting configurations (.prettierrc, .editorconfig, etc)."""

    root_dir: Path = Path(".")
    dry_run: bool = False

    STANDARD_PRETTIER = {
        "semi": True,
        "singleQuote": False,
        "tabWidth": 2,
        "trailingComma": "es5",
        "printWidth": 100,
    }

    STANDARD_EDITORCONFIG = """
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
"""

    def find_formatter_configs(self) -> Dict[str, List[Path]]:
        """Find all formatter configuration files."""
        configs = {
            "prettier": [],
            "editorconfig": [],
            "eslint": [],
        }

        for prettier in self.root_dir.glob("**/.prettierrc*"):
            if "node_modules" not in prettier.parts:
                configs["prettier"].append(prettier)

        for editor in self.root_dir.glob("**/.editorconfig"):
            configs["editorconfig"].append(editor)

        for eslint in self.root_dir.glob("**/.eslintrc*"):
            if "node_modules" not in eslint.parts:
                configs["eslint"].append(eslint)

        return configs

    def standardize_prettier(self, config_path: Path) -> bool:
        """Standardize a prettier config file."""
        try:
            if self.dry_run:
                LOGGER.info(f"DRY-RUN: Would standardize {config_path}")
                return True

            if config_path.suffix == ".json" or config_path.name == ".prettierrc":
                with open(config_path, "w") as f:
                    json.dump(self.STANDARD_PRETTIER, f, indent=2)
                LOGGER.info(f"Standardized: {config_path}")
                return True

        except Exception as exc:
            LOGGER.warning(f"Failed to standardize {config_path}: {exc}")

        return False

    def ensure_editorconfig(self) -> bool:
        """Ensure .editorconfig exists in root."""
        editorconfig_path = self.root_dir / ".editorconfig"

        if editorconfig_path.exists():
            LOGGER.info(".editorconfig already exists")
            return True

        if self.dry_run:
            LOGGER.info("DRY-RUN: Would create .editorconfig")
            return True

        try:
            editorconfig_path.write_text(self.STANDARD_EDITORCONFIG.strip())
            LOGGER.info(f"Created: {editorconfig_path}")
            return True
        except Exception as exc:
            LOGGER.error(f"Failed to create .editorconfig: {exc}")
            return False

    def execute(self) -> Dict[str, any]:
        """Standardize all formatter configurations."""
        configs = self.find_formatter_configs()
        stats = {
            "prettier_standardized": 0,
            "editorconfig_ensured": False,
            "total_configs": sum(len(v) for v in configs.values()),
        }

        LOGGER.info(f"Found {stats['total_configs']} formatter configs")

        # Standardize prettier configs
        for prettier_config in configs["prettier"]:
            if self.standardize_prettier(prettier_config):
                stats["prettier_standardized"] += 1

        # Ensure .editorconfig exists
        stats["editorconfig_ensured"] = self.ensure_editorconfig()

        LOGGER.info(f"FormatterFox completed: {stats}")
        return stats


__all__ = ["FormatterFox"]
