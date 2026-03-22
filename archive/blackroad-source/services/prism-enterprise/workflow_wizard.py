"""Bot that refreshes CI workflow matrices for active runtimes."""

from __future__ import annotations

import logging
import re
import yaml
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set

LOGGER = logging.getLogger(__name__)


@dataclass
class WorkflowWizard:
    """Update GitHub Actions workflows with current runtime versions."""

    root_dir: Path = Path(".")
    dry_run: bool = False

    CURRENT_NODEJS_VERSIONS = ["18", "20", "22"]
    CURRENT_PYTHON_VERSIONS = ["3.10", "3.11", "3.12"]

    def find_workflows(self) -> List[Path]:
        """Find all GitHub Actions workflow files."""
        workflow_dir = self.root_dir / ".github" / "workflows"
        if not workflow_dir.exists():
            return []

        return list(workflow_dir.glob("*.yml")) + list(workflow_dir.glob("*.yaml"))

    def analyze_workflow(self, workflow_path: Path) -> Dict[str, any]:
        """Analyze a workflow file for outdated runtime versions."""
        try:
            content = workflow_path.read_text()

            # Find Node.js versions
            node_versions = set(re.findall(r"node-version:\s*['\"]?(\d+)", content))

            # Find Python versions
            python_versions = set(re.findall(r"python-version:\s*['\"]?(3\.\d+)", content))

            return {
                "path": str(workflow_path),
                "node_versions": list(node_versions),
                "python_versions": list(python_versions),
                "needs_update": (
                    bool(node_versions - set(self.CURRENT_NODEJS_VERSIONS))
                    or bool(python_versions - set(self.CURRENT_PYTHON_VERSIONS))
                ),
            }

        except Exception as exc:
            LOGGER.warning(f"Failed to analyze {workflow_path}: {exc}")
            return {"path": str(workflow_path), "needs_update": False}

    def execute(self) -> Dict[str, any]:
        """Analyze all workflows and report outdated runtime versions."""
        workflows = self.find_workflows()
        outdated = []

        LOGGER.info(f"Analyzing {len(workflows)} GitHub Actions workflows...")

        for workflow in workflows:
            analysis = self.analyze_workflow(workflow)
            if analysis.get("needs_update"):
                outdated.append(analysis)
                LOGGER.warning(f"Outdated runtimes in {workflow.name}")
                if analysis.get("node_versions"):
                    LOGGER.warning(f"  Node.js: {analysis['node_versions']}")
                if analysis.get("python_versions"):
                    LOGGER.warning(f"  Python: {analysis['python_versions']}")

        stats = {
            "total_workflows": len(workflows),
            "outdated_count": len(outdated),
            "outdated_workflows": outdated,
            "recommended_node": self.CURRENT_NODEJS_VERSIONS,
            "recommended_python": self.CURRENT_PYTHON_VERSIONS,
        }

        LOGGER.info(f"Found {len(outdated)} workflows with outdated runtimes")
        return stats


__all__ = ["WorkflowWizard"]
