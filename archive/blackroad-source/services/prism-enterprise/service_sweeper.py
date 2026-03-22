"""Bot that identifies and decommissions inactive services and manifests."""

from __future__ import annotations

import logging
import subprocess
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

LOGGER = logging.getLogger(__name__)


@dataclass
class ServiceSweeper:
    """Identify inactive services and stale deployment manifests."""

    root_dir: Path = Path(".")
    inactive_threshold_days: int = 90
    dry_run: bool = False

    def find_service_dirs(self) -> List[Path]:
        """Find all service directories."""
        service_dirs = []

        # Look for common service directory patterns
        for pattern in ["services/*", "apps/*", "packages/*"]:
            for path in self.root_dir.glob(pattern):
                if path.is_dir() and not path.name.startswith("."):
                    service_dirs.append(path)

        return service_dirs

    def find_deployment_manifests(self) -> List[Path]:
        """Find Kubernetes and Docker manifests."""
        manifests: List[Path] = []

        patterns = [
            "**/k8s/**/*.yaml",
            "**/k8s/**/*.yml",
            "**/kubernetes/**/*.yaml",
            "**/docker-compose*.yml",
            "**/Dockerfile*",
        ]

        for pattern in patterns:
            for manifest in self.root_dir.glob(pattern):
                manifests.append(manifest)

        return manifests

    def get_last_modified(self, path: Path) -> Optional[datetime]:
        """Get last modification time using git or filesystem."""
        try:
            # Try git first for more accurate "last changed" time
            result = subprocess.run(
                ["git", "log", "-1", "--format=%ct", "--", str(path)],
                capture_output=True,
                text=True,
                cwd=self.root_dir,
                timeout=5,
            )

            if result.returncode == 0 and result.stdout.strip():
                timestamp = int(result.stdout.strip())
                return datetime.fromtimestamp(timestamp)

        except (subprocess.TimeoutExpired, ValueError):
            pass

        # Fallback to filesystem mtime
        return datetime.fromtimestamp(path.stat().st_mtime)

    def is_service_active(self, service_dir: Path) -> bool:
        """Check if a service appears to be active."""
        # Check for recent changes
        last_modified = self.get_last_modified(service_dir)
        if not last_modified:
            return True  # Can't determine, assume active

        days_inactive = (datetime.now() - last_modified).days

        return days_inactive < self.inactive_threshold_days

    def has_deployment_reference(self, service_name: str, manifests: List[Path]) -> bool:
        """Check if service is referenced in any deployment manifest."""
        for manifest in manifests:
            try:
                content = manifest.read_text(errors="ignore")
                if service_name in content:
                    return True
            except Exception:
                continue

        return False

    def analyze_service(self, service_dir: Path, manifests: List[Path]) -> Dict[str, any]:
        """Analyze a service directory for activity."""
        service_name = service_dir.name
        last_modified = self.get_last_modified(service_dir)

        if not last_modified:
            days_inactive = 0
        else:
            days_inactive = (datetime.now() - last_modified).days

        is_active = self.is_service_active(service_dir)
        has_deployment = self.has_deployment_reference(service_name, manifests)

        # Check for package.json or other indicators
        has_package_json = (service_dir / "package.json").exists()
        has_dockerfile = any((service_dir / f).exists() for f in ["Dockerfile", "Dockerfile.dev"])

        return {
            "name": service_name,
            "path": str(service_dir),
            "days_inactive": days_inactive,
            "is_active": is_active,
            "has_deployment": has_deployment,
            "has_package_json": has_package_json,
            "has_dockerfile": has_dockerfile,
            "last_modified": last_modified.isoformat() if last_modified else None,
        }

    def execute(self) -> Dict[str, any]:
        """Identify inactive services and stale manifests."""
        service_dirs = self.find_service_dirs()
        manifests = self.find_deployment_manifests()

        LOGGER.info(f"Analyzing {len(service_dirs)} services...")
        LOGGER.info(f"Found {len(manifests)} deployment manifests")

        inactive_services = []
        all_analyses = []

        for service_dir in service_dirs:
            analysis = self.analyze_service(service_dir, manifests)
            all_analyses.append(analysis)

            if not analysis["is_active"]:
                inactive_services.append(analysis)
                LOGGER.warning(
                    f"Inactive service: {analysis['name']} "
                    f"({analysis['days_inactive']} days since last change)"
                )

        # Find orphaned manifests (referencing non-existent services)
        service_names = {s.name for s in service_dirs}
        orphaned_manifests = []

        for manifest in manifests:
            try:
                content = manifest.read_text(errors="ignore")

                # Simple heuristic: check if any service name is mentioned
                has_reference = any(name in content for name in service_names)

                if not has_reference and "example" not in manifest.name.lower():
                    orphaned_manifests.append(str(manifest))

            except Exception:
                continue

        stats = {
            "total_services": len(service_dirs),
            "inactive_services": len(inactive_services),
            "inactive_details": inactive_services,
            "total_manifests": len(manifests),
            "orphaned_manifests": orphaned_manifests,
            "orphaned_count": len(orphaned_manifests),
        }

        LOGGER.info(f"Found {len(inactive_services)} inactive services")
        LOGGER.info(f"Found {len(orphaned_manifests)} potentially orphaned manifests")

        return stats


__all__ = ["ServiceSweeper"]
