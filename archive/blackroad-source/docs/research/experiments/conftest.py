"""
pytest configuration for BlackRoad Labs experiments.
Adds experiment directories to sys.path so test modules can import from run.py.
"""
import sys
from pathlib import Path

# Allow "from run import ..." inside experiment test files
def pytest_collect_file(parent, file_path):
    """Add each experiment directory to sys.path when collecting tests."""
    if file_path.name.startswith("test_"):
        exp_dir = str(file_path.parent)
        if exp_dir not in sys.path:
            sys.path.insert(0, exp_dir)
        # Also add parent (experiments/) so cross-experiment imports work
        parent_dir = str(file_path.parent.parent)
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)

