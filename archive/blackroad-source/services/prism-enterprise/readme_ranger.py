"""Bot that consolidates duplicate README content across the project."""

from __future__ import annotations

import difflib
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Set

LOGGER = logging.getLogger(__name__)


@dataclass
class ReadmeRanger:
    """Find and consolidate duplicate README content."""

    root_dir: Path = Path(".")
    similarity_threshold: float = 0.7
    dry_run: bool = False

    def find_readmes(self) -> List[Path]:
        """Find all README files."""
        patterns = ["**/README.md", "**/README.txt", "**/README"]
        readmes: List[Path] = []

        for pattern in patterns:
            for readme in self.root_dir.glob(pattern):
                if any(part in ["node_modules", ".venv", "venv", ".git"] for part in readme.parts):
                    continue
                readmes.append(readme)

        return readmes

    def calculate_similarity(self, content1: str, content2: str) -> float:
        """Calculate similarity between two text contents."""
        return difflib.SequenceMatcher(None, content1, content2).ratio()

    def find_duplicates(self, readmes: List[Path]) -> List[Dict[str, any]]:
        """Find duplicate or highly similar README content."""
        duplicates = []

        for i, readme1 in enumerate(readmes):
            try:
                content1 = readme1.read_text(errors="ignore")
            except Exception:
                continue

            for readme2 in readmes[i + 1 :]:
                try:
                    content2 = readme2.read_text(errors="ignore")
                except Exception:
                    continue

                similarity = self.calculate_similarity(content1, content2)

                if similarity >= self.similarity_threshold:
                    duplicates.append(
                        {
                            "file1": str(readme1),
                            "file2": str(readme2),
                            "similarity": similarity,
                        }
                    )

        return duplicates

    def extract_common_sections(self, readmes: List[Path]) -> Dict[str, int]:
        """Extract common sections across READMEs."""
        section_counts: Dict[str, int] = {}

        for readme in readmes:
            try:
                content = readme.read_text(errors="ignore")

                # Find markdown headers
                import re

                headers = re.findall(r"^#+\s+(.+)$", content, re.MULTILINE)

                for header in headers:
                    section_counts[header.strip()] = section_counts.get(header.strip(), 0) + 1

            except Exception:
                continue

        return section_counts

    def execute(self) -> Dict[str, any]:
        """Analyze all READMEs and find consolidation opportunities."""
        readmes = self.find_readmes()

        LOGGER.info(f"Analyzing {len(readmes)} README files...")

        duplicates = self.find_duplicates(readmes)
        common_sections = self.extract_common_sections(readmes)

        # Filter common sections that appear in >30% of READMEs
        threshold = len(readmes) * 0.3
        frequent_sections = {k: v for k, v in common_sections.items() if v >= threshold}

        stats = {
            "total_readmes": len(readmes),
            "duplicates": duplicates,
            "duplicate_count": len(duplicates),
            "common_sections": frequent_sections,
        }

        # Log findings
        LOGGER.info(f"Found {len(duplicates)} duplicate README pairs")
        for dup in duplicates[:5]:  # Top 5
            LOGGER.warning(
                f"Duplicate ({dup['similarity']:.0%}): {dup['file1']} <-> {dup['file2']}"
            )

        if frequent_sections:
            LOGGER.info("Common sections across READMEs:")
            for section, count in sorted(frequent_sections.items(), key=lambda x: x[1], reverse=True)[:10]:
                LOGGER.info(f"  '{section}': {count} occurrences")

        return stats


__all__ = ["ReadmeRanger"]
