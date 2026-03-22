"""Pytest configuration — add repo root to sys.path for module imports."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
