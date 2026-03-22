"""Bot that updates dashboard metrics baselines and monitors performance."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

LOGGER = logging.getLogger(__name__)


@dataclass
class MetricsMuse:
    """Update and maintain dashboard metrics baselines."""

    root_dir: Path = Path(".")
    metrics_file: Path = Path("metrics_baseline.json")
    dry_run: bool = False

    def load_current_metrics(self) -> Dict[str, any]:
        """Load current metrics baseline."""
        if self.metrics_file.exists():
            try:
                with open(self.metrics_file) as f:
                    return json.load(f)
            except json.JSONDecodeError:
                LOGGER.warning(f"Failed to parse {self.metrics_file}")

        return {"updated_at": None, "baselines": {}}

    def collect_test_metrics(self) -> Dict[str, any]:
        """Collect test coverage and performance metrics."""
        metrics = {}

        # Look for coverage reports
        coverage_files = list(self.root_dir.glob("**/coverage/coverage-summary.json"))

        for cov_file in coverage_files:
            try:
                with open(cov_file) as f:
                    data = json.load(f)
                    total = data.get("total", {})
                    metrics[f"coverage_{cov_file.parent.parent.name}"] = {
                        "statements": total.get("statements", {}).get("pct", 0),
                        "branches": total.get("branches", {}).get("pct", 0),
                        "functions": total.get("functions", {}).get("pct", 0),
                        "lines": total.get("lines", {}).get("pct", 0),
                    }
            except Exception as exc:
                LOGGER.debug(f"Failed to read {cov_file}: {exc}")

        return metrics

    def collect_build_metrics(self) -> Dict[str, any]:
        """Collect build performance metrics."""
        metrics = {}

        # Look for build timing files
        timing_files = list(self.root_dir.glob("**/.next/trace"))

        for timing_file in timing_files[:1]:  # Just check first one
            metrics["build_has_trace"] = True

        return metrics

    def collect_bundle_metrics(self) -> Dict[str, any]:
        """Collect bundle size metrics."""
        metrics = {}

        # Look for webpack stats
        stats_files = list(self.root_dir.glob("**/dist/**/stats.json"))

        for stats_file in stats_files:
            try:
                with open(stats_file) as f:
                    data = json.load(f)
                    assets = data.get("assets", [])
                    total_size = sum(asset.get("size", 0) for asset in assets)
                    metrics[f"bundle_{stats_file.parent.name}"] = {
                        "total_size_kb": total_size / 1024,
                        "asset_count": len(assets),
                    }
            except Exception as exc:
                LOGGER.debug(f"Failed to read {stats_file}: {exc}")

        return metrics

    def update_baseline(self, new_metrics: Dict[str, any]) -> bool:
        """Update the metrics baseline file."""
        baseline = {
            "updated_at": datetime.now().isoformat(),
            "baselines": new_metrics,
        }

        if self.dry_run:
            LOGGER.info(f"DRY-RUN: Would update {self.metrics_file}")
            return True

        try:
            with open(self.metrics_file, "w") as f:
                json.dump(baseline, f, indent=2)
            LOGGER.info(f"Updated metrics baseline: {self.metrics_file}")
            return True
        except Exception as exc:
            LOGGER.error(f"Failed to write metrics: {exc}")
            return False

    def execute(self) -> Dict[str, any]:
        """Collect and update all metrics baselines."""
        current = self.load_current_metrics()

        LOGGER.info("Collecting current metrics...")

        new_metrics = {}
        new_metrics.update(self.collect_test_metrics())
        new_metrics.update(self.collect_build_metrics())
        new_metrics.update(self.collect_bundle_metrics())

        stats = {
            "metrics_collected": len(new_metrics),
            "metrics": new_metrics,
            "updated": False,
        }

        if new_metrics:
            stats["updated"] = self.update_baseline(new_metrics)
            LOGGER.info(f"Collected {len(new_metrics)} metric categories")
        else:
            LOGGER.warning("No metrics found to collect")

        return stats


__all__ = ["MetricsMuse"]
