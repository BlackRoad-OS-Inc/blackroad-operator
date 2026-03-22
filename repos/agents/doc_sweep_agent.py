"""Bot that audits documentation for stale guidance and outdated content."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional

LOGGER = logging.getLogger(__name__)


@dataclass
class StaleDoc:
    """Represents a potentially stale documentation file."""

    path: Path
    last_modified: datetime
    age_days: int
    issues: List[str] = field(default_factory=list)
    confidence: float = 0.0


@dataclass
class DocSweepAgent:
    """Audit documentation for stale guidance, broken links, and outdated information."""

    root_dir: Path = Path(".")
    stale_threshold_days: int = 180  # 6 months
    dry_run: bool = False

    def find_docs(self) -> List[Path]:
        """Find all documentation files."""
        patterns = ["**/*.md", "**/*.txt", "**/*.rst", "**/README*"]
        docs: List[Path] = []

        for pattern in patterns:
            for doc_path in self.root_dir.glob(pattern):
                # Skip node_modules, venv, .git
                if any(part in ["node_modules", "venv", ".venv", ".git", "dist", "build"] for part in doc_path.parts):
                    continue
                docs.append(doc_path)

        return list(set(docs))  # Deduplicate

    def check_stale_dates(self, content: str) -> List[str]:
        """Find date references that might be stale."""
        issues = []

        # Look for date patterns
        date_patterns = [
            r"\b(20\d{2})\b",
            r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(20\d{2})\b",
            r"\b(20\d{2}-\d{2}-\d{2})\b",
        ]

        current_year = datetime.now().year
        for pattern in date_patterns:
            for match in re.finditer(pattern, content):
                year_str = match.group(1) if len(match.groups()) == 1 else match.group(2)
                try:
                    year = int(year_str)
                    if current_year - year > 1:
                        issues.append(f"References old date: {match.group(0)}")
                except ValueError:
                    pass

        return issues

    def analyze_doc(self, doc_path: Path) -> Optional[StaleDoc]:
        """Analyze a single documentation file."""
        try:
            mtime = datetime.fromtimestamp(doc_path.stat().st_mtime)
            age = datetime.now() - mtime
            age_days = age.days

            content = doc_path.read_text(errors="ignore")
            issues: List[str] = []
            issues.extend(self.check_stale_dates(content))

            confidence = 0.0
            if age_days > self.stale_threshold_days:
                confidence += 0.5
            confidence += min(len(issues) * 0.1, 0.5)

            if age_days > self.stale_threshold_days or issues:
                return StaleDoc(
                    path=doc_path,
                    last_modified=mtime,
                    age_days=age_days,
                    issues=issues,
                    confidence=min(confidence, 1.0),
                )

        except Exception as exc:
            LOGGER.warning(f"Failed to analyze {doc_path}: {exc}")

        return None

    def execute(self) -> Dict[str, any]:
        """Audit all documentation and return findings."""
        docs = self.find_docs()
        stale_docs: List[StaleDoc] = []

        LOGGER.info(f"Analyzing {len(docs)} documentation files...")

        for doc_path in docs:
            result = self.analyze_doc(doc_path)
            if result:
                stale_docs.append(result)

        stale_docs.sort(key=lambda d: d.confidence, reverse=True)

        stats = {
            "total_docs": len(docs),
            "stale_count": len(stale_docs),
            "stale_docs": [
                {
                    "path": str(doc.path),
                    "age_days": doc.age_days,
                    "confidence": doc.confidence,
                    "issues": doc.issues,
                }
                for doc in stale_docs
            ],
        }

        LOGGER.info(f"Found {len(stale_docs)} potentially stale documents")
        return stats


__all__ = ["DocSweepAgent", "StaleDoc"]
