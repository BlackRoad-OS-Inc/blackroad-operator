# CLAUDE.md

## Project Overview

This is **algorithms** — a community-driven collection of 200+ algorithm and data structure implementations in pure Python 3. It is installable via `pip3 install algorithms` and organized as a Python package with `setuptools`.

- **License:** MIT
- **Python:** 3.4+ (CI tests on 3.6 and 3.7)
- **No external runtime dependencies** — all algorithms use the Python standard library only.

## Repository Structure

```
algorithms/          # Main Python package
├── arrays/          # Array manipulation (two_sum, merge_intervals, rotate, etc.)
├── automata/        # Finite automata (DFA)
├── backtrack/        # Backtracking (permutations, combinations, sudoku, n-queens, etc.)
├── bfs/             # Breadth-first search (maze, shortest distance, word ladder)
├── bit/             # Bit manipulation (count ones, power of two, swap, etc.)
├── compression/     # Compression algorithms (Huffman, RLE, Elias)
├── dfs/             # Depth-first search (islands, sudoku solver, maze)
├── distribution/    # Distribution/histogram
├── dp/              # Dynamic programming (knapsack, coin change, climbing stairs, etc.)
├── graph/           # Graph algorithms (Dijkstra, Tarjan, topological sort, flow)
├── heap/            # Heap problems (skyline, sliding window max, merge k lists)
├── linkedlist/      # Linked list operations (reverse, cycle detection, merge)
├── map/             # Hash map problems (hashtable, word pattern, LCS)
├── maths/           # Math algorithms (primes, RSA, GCD, combinatorics)
├── matrix/          # Matrix operations (rotation, spiral, inversion)
├── ml/              # Machine learning (nearest neighbor)
├── queues/          # Queue problems (max sliding window, moving average)
├── search/          # Search algorithms (binary search, linear search, rotated array)
├── set/             # Set problems (randomized set, set covering)
├── sort/            # Sorting algorithms (merge, quick, heap, radix, bubble, etc.)
├── stack/           # Stack problems (valid parenthesis, simplify path)
├── strings/         # String algorithms (palindrome, pattern matching, encoding)
├── tree/            # Trees (BST, AVL, red-black, trie, segment tree, traversals)
├── unionfind/       # Union-Find (count islands)
└── unix/            # Unix path utilities

tests/               # Test suite (one file per algorithm category)
docs/                # Sphinx documentation source
```

## Common Commands

### Running Tests

```bash
# Run all tests with unittest (preferred)
python3 -m unittest discover tests

# Run all tests with pytest
python3 -m pytest tests

# Run a specific test module
python3 -m unittest tests.test_sort

# Run a specific test class or method
python3 -m pytest tests/test_sort.py::TestSuite::test_merge_sort
```

### Linting and Formatting

```bash
# Check formatting with black
black --check .

# Auto-format with black
black .

# Lint for syntax errors and undefined names (must pass)
flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics

# Full lint with complexity and line-length checks (warnings only)
flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
```

### Package Installation

```bash
# Install in development mode
pip install -e .

# Install test dependencies
pip install -r test_requirements.txt
```

## Code Conventions

### Style

- **Formatter:** Black (line length default 88)
- **Linter:** Flake8 (max line length 127, max complexity 10)
- **Indentation:** 4 spaces (standard Python)
- **Naming:** `snake_case` for functions/variables, `PascalCase` for classes
- **Python 3 only** — no Python 2 compatibility

### Algorithm File Structure

Each algorithm lives in its own `.py` file within the appropriate category directory. Follow this pattern:

```python
"""
Brief description of the problem or algorithm.
Optional example of input/output.

Time complexity: O(n log(n))
Space complexity: O(n)
"""


def algorithm_name(params):
    """Short docstring with complexity: O(n)"""
    # Implementation
    pass
```

- Include time/space complexity in docstrings
- Add comments for non-obvious logic
- Keep implementations self-contained (no external dependencies)
- Multiple solution approaches in the same file are encouraged (e.g., naive vs. optimized)

### Module Exports

Each category directory has an `__init__.py` that re-exports all algorithms using wildcard imports:

```python
from .algorithm_name import *
```

When adding a new algorithm, add the corresponding import to the category's `__init__.py`.

### Test Structure

Tests live in `tests/` with one file per category (e.g., `tests/test_sort.py`). Tests use `unittest.TestCase`:

```python
from algorithms.category import function_name

import unittest


class TestSuite(unittest.TestCase):
    def test_function_name(self):
        self.assertEqual(expected, function_name(input))
```

- Import algorithms from the package (e.g., `from algorithms.sort import merge_sort`)
- Use `self.assertEqual`, `self.assertTrue`, etc.
- Test both normal cases and edge cases
- Tests must be compatible with both `unittest` and `pytest`

## Adding a New Algorithm

1. Create a new `.py` file in the appropriate `algorithms/<category>/` directory
2. Add the wildcard import to `algorithms/<category>/__init__.py`
3. Add corresponding tests to `tests/test_<category>.py`
4. Run `python3 -m unittest discover tests` to verify all tests pass
5. Run `black .` to format and `flake8` to lint

## CI/CD

- **Travis CI** runs on Python 3.6 and 3.7
- **Tox** manages test environments
- Pipeline: black check (non-blocking) → flake8 syntax check (blocking) → flake8 style check (non-blocking) → tox test suite
- **Coverage** tracked via `coverage` + `coveralls`

## Key Details

- The top-level `algorithms/__init__.py` is empty — imports go through subpackages
- Each category `__init__.py` uses `from .module import *` to expose all public functions
- No configuration files for black/flake8 beyond the `.travis.yml` inline commands
- The `.coveragerc` omits `__init__` files and system packages from coverage reports
- File names should be lowercase with underscores (e.g., `merge_sort.py`, not `MergeSort.py`)
