"""Bot that identifies and retires unused dependencies across packages."""

from __future__ import annotations

import json
import logging
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Set

LOGGER = logging.getLogger(__name__)


@dataclass
class DependencyDoctor:
    """Audit and remove unused dependencies from package.json and requirements.txt files."""

    root_dir: Path = Path(".")
    dry_run: bool = False

    def find_package_files(self) -> List[Path]:
        """Find all package.json and requirements.txt files."""
        files: List[Path] = []

        # Find package.json files
        for pkg in self.root_dir.glob("**/package.json"):
            if "node_modules" not in pkg.parts:
                files.append(pkg)

        # Find requirements.txt files
        for req in self.root_dir.glob("**/requirements.txt"):
            if any(part in ["venv", ".venv", "dist", "build"] for part in req.parts):
                continue
            files.append(req)

        return files

    def analyze_npm_deps(self, package_json: Path) -> Dict[str, List[str]]:
        """Analyze npm dependencies and find unused ones."""
        try:
            with open(package_json) as f:
                data = json.load(f)

            dependencies = set(data.get("dependencies", {}).keys())
            dev_dependencies = set(data.get("devDependencies", {}).keys())

            # Use depcheck to find unused dependencies
            package_dir = package_json.parent
            result = subprocess.run(
                ["npx", "depcheck", "--json"],
                cwd=package_dir,
                capture_output=True,
                text=True,
                timeout=60,
            )

            if result.returncode == 0:
                depcheck_data = json.loads(result.stdout)
                unused = depcheck_data.get("dependencies", [])
                return {
                    "package": str(package_json),
                    "unused": unused,
                    "total": len(dependencies) + len(dev_dependencies),
                }
        except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError) as exc:
            LOGGER.debug(f"Could not analyze {package_json}: {exc}")

        return {"package": str(package_json), "unused": [], "total": 0}

    def analyze_python_deps(self, requirements_file: Path) -> Dict[str, List[str]]:
        """Analyze Python dependencies."""
        try:
            content = requirements_file.read_text()
            requirements = [
                line.split("==")[0].split(">=")[0].split("~=")[0].strip()
                for line in content.splitlines()
                if line.strip() and not line.startswith("#")
            ]

            return {
                "package": str(requirements_file),
                "total": len(requirements),
                "requirements": requirements,
            }
        except Exception as exc:
            LOGGER.warning(f"Failed to analyze {requirements_file}: {exc}")

        return {"package": str(requirements_file), "total": 0, "requirements": []}

    def execute(self) -> Dict[str, any]:
        """Audit all dependencies and report unused ones."""
        package_files = self.find_package_files()
        results = {"npm_packages": [], "python_packages": [], "total_unused": 0}

        LOGGER.info(f"Analyzing {len(package_files)} package files...")

        for pkg_file in package_files:
            if pkg_file.name == "package.json":
                analysis = self.analyze_npm_deps(pkg_file)
                if analysis["unused"]:
                    results["npm_packages"].append(analysis)
                    results["total_unused"] += len(analysis["unused"])
                    LOGGER.warning(f"Unused deps in {pkg_file}: {', '.join(analysis['unused'])}")

            elif pkg_file.name == "requirements.txt":
                analysis = self.analyze_python_deps(pkg_file)
                results["python_packages"].append(analysis)

        LOGGER.info(f"Found {results['total_unused']} unused npm dependencies")
        return results


__all__ = ["DependencyDoctor"]
