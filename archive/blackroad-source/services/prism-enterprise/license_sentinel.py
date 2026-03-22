"""Bot that verifies license headers and attributions across source files."""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

LOGGER = logging.getLogger(__name__)


@dataclass
class LicenseSentinel:
    """Verify and add license headers to source files."""

    root_dir: Path = Path(".")
    license_type: str = "MIT"
    copyright_holder: str = "BlackRoad Inc."
    dry_run: bool = False

    LICENSE_TEMPLATES = {
        "MIT": """/*
 * Copyright (c) {year} {holder}
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
""",
        "APACHE": """# Copyright {year} {holder}
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
""",
    }

    def find_source_files(self) -> List[Path]:
        """Find all source files that should have license headers."""
        patterns = ["**/*.py", "**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx", "**/*.go", "**/*.rs"]
        files: List[Path] = []

        for pattern in patterns:
            for file_path in self.root_dir.glob(pattern):
                # Skip generated/vendor files
                if any(part in ["node_modules", "venv", ".venv", "dist", "build", ".git", "vendor"] for part in file_path.parts):
                    continue
                files.append(file_path)

        return files

    def has_license_header(self, content: str) -> bool:
        """Check if content has a license header."""
        # Look for common license indicators
        indicators = [
            r"Copyright.*\d{4}",
            r"Licensed under",
            r"Permission is hereby granted",
            r"SPDX-License-Identifier",
        ]

        for indicator in indicators:
            if re.search(indicator, content, re.IGNORECASE):
                return True

        return False

    def get_license_header(self, file_suffix: str) -> str:
        """Get appropriate license header for file type."""
        year = datetime.now().year
        template = self.LICENSE_TEMPLATES.get(self.license_type, self.LICENSE_TEMPLATES["MIT"])

        header = template.format(year=year, holder=self.copyright_holder)

        # Adjust comment style for Python
        if file_suffix == ".py":
            header = '"""' + header.strip("/*").strip("*/").strip() + '"""\n\n'

        return header

    def add_license_header(self, file_path: Path) -> bool:
        """Add license header to a file if missing."""
        try:
            content = file_path.read_text()

            if self.has_license_header(content):
                return False  # Already has license

            if self.dry_run:
                LOGGER.info(f"DRY-RUN: Would add license header to {file_path}")
                return True

            header = self.get_license_header(file_path.suffix)
            new_content = header + content

            file_path.write_text(new_content)
            LOGGER.info(f"Added license header: {file_path}")
            return True

        except Exception as exc:
            LOGGER.warning(f"Failed to add license to {file_path}: {exc}")
            return False

    def execute(self) -> Dict[str, any]:
        """Verify and add license headers to all source files."""
        files = self.find_source_files()
        stats = {
            "total_files": len(files),
            "with_license": 0,
            "added_license": 0,
            "errors": 0,
        }

        LOGGER.info(f"Checking {len(files)} source files for license headers...")

        for file_path in files:
            try:
                content = file_path.read_text()

                if self.has_license_header(content):
                    stats["with_license"] += 1
                else:
                    if self.add_license_header(file_path):
                        stats["added_license"] += 1
                    else:
                        stats["errors"] += 1

            except Exception as exc:
                LOGGER.warning(f"Error processing {file_path}: {exc}")
                stats["errors"] += 1

        coverage = (stats["with_license"] + stats["added_license"]) / max(stats["total_files"], 1) * 100

        LOGGER.info(f"License coverage: {coverage:.1f}%")
        LOGGER.info(f"LicenseSentinel completed: {stats}")

        return {**stats, "coverage_percent": coverage}


__all__ = ["LicenseSentinel"]
