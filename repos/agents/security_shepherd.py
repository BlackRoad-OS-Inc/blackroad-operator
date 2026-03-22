"""Bot that aligns security policy docs with latest controls."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set

LOGGER = logging.getLogger(__name__)


@dataclass
class SecurityShepherd:
    """Audit security documentation and verify controls are documented."""

    root_dir: Path = Path(".")
    dry_run: bool = False

    REQUIRED_SECTIONS = [
        "Authentication",
        "Authorization",
        "Data Protection",
        "Network Security",
        "Incident Response",
        "Vulnerability Management",
        "Access Control",
        "Logging & Monitoring",
    ]

    SECURITY_CONTROLS = [
        "mTLS",
        "encryption at rest",
        "encryption in transit",
        "API authentication",
        "rate limiting",
        "input validation",
        "SQL injection protection",
        "XSS protection",
        "CSRF protection",
        "secrets management",
    ]

    def find_security_docs(self) -> List[Path]:
        """Find security-related documentation."""
        patterns = [
            "**/SECURITY.md",
            "**/HARDENING.md",
            "**/security/**/*.md",
            "**/docs/security/**/*.md",
        ]

        docs: Set[Path] = set()
        for pattern in patterns:
            docs.update(self.root_dir.glob(pattern))

        return list(docs)

    def check_required_sections(self, content: str) -> List[str]:
        """Check if required security sections are present."""
        missing = []

        for section in self.REQUIRED_SECTIONS:
            # Look for markdown headers containing the section name
            pattern = rf"^#+\s+.*{re.escape(section)}"
            if not re.search(pattern, content, re.MULTILINE | re.IGNORECASE):
                missing.append(section)

        return missing

    def check_security_controls(self, content: str) -> Dict[str, bool]:
        """Check which security controls are mentioned."""
        controls_found = {}

        for control in self.SECURITY_CONTROLS:
            controls_found[control] = bool(re.search(re.escape(control), content, re.IGNORECASE))

        return controls_found

    def check_outdated_info(self, content: str) -> List[str]:
        """Check for outdated security information."""
        issues = []

        # Look for old TLS versions
        if re.search(r"\b(TLS\s*1\.0|TLS\s*1\.1|SSL)\b", content):
            issues.append("References outdated TLS/SSL versions")

        # Look for deprecated algorithms
        deprecated = ["MD5", "SHA1", "DES", "3DES", "RC4"]
        for algo in deprecated:
            if re.search(rf"\b{algo}\b", content):
                issues.append(f"References deprecated algorithm: {algo}")

        # Check for old authentication methods
        if re.search(r"\bBasic\s+Auth(?:entication)?\b", content) and "deprecat" not in content.lower():
            issues.append("References Basic Authentication without deprecation notice")

        return issues

    def analyze_security_doc(self, doc_path: Path) -> Dict[str, any]:
        """Analyze a security documentation file."""
        try:
            content = doc_path.read_text()

            missing_sections = self.check_required_sections(content)
            controls = self.check_security_controls(content)
            outdated = self.check_outdated_info(content)

            documented_controls = sum(1 for v in controls.values() if v)
            coverage = (documented_controls / len(self.SECURITY_CONTROLS)) * 100

            return {
                "path": str(doc_path),
                "missing_sections": missing_sections,
                "controls_coverage": coverage,
                "controls": controls,
                "outdated_info": outdated,
                "issues_count": len(missing_sections) + len(outdated),
            }

        except Exception as exc:
            LOGGER.warning(f"Failed to analyze {doc_path}: {exc}")
            return {"path": str(doc_path), "issues_count": 1, "error": str(exc)}

    def execute(self) -> Dict[str, any]:
        """Audit all security documentation."""
        docs = self.find_security_docs()

        if not docs:
            LOGGER.warning("No security documentation found!")
            return {"total_docs": 0, "analyses": []}

        LOGGER.info(f"Analyzing {len(docs)} security documents...")

        analyses = []
        for doc_path in docs:
            analysis = self.analyze_security_doc(doc_path)
            analyses.append(analysis)

            # Log findings
            if analysis.get("missing_sections"):
                LOGGER.warning(f"{doc_path.name} missing sections: {', '.join(analysis['missing_sections'])}")

            if analysis.get("outdated_info"):
                LOGGER.warning(f"{doc_path.name} has outdated information:")
                for issue in analysis["outdated_info"]:
                    LOGGER.warning(f"  - {issue}")

            coverage = analysis.get("controls_coverage", 0)
            LOGGER.info(f"{doc_path.name} security controls coverage: {coverage:.1f}%")

        # Calculate overall statistics
        total_issues = sum(a.get("issues_count", 0) for a in analyses)
        avg_coverage = sum(a.get("controls_coverage", 0) for a in analyses) / len(analyses) if analyses else 0

        stats = {
            "total_docs": len(docs),
            "total_issues": total_issues,
            "average_coverage": avg_coverage,
            "analyses": analyses,
        }

        LOGGER.info(f"Overall security documentation coverage: {avg_coverage:.1f}%")
        LOGGER.info(f"Total issues found: {total_issues}")

        return stats


__all__ = ["SecurityShepherd"]
