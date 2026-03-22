"""Tests for ``parse_numeric_prefix``."""
"""Tests for :mod:`prism_utils`."""
import ast
"""Tests for :mod:`prism_utils`."""
import ast

import pytest
"""Tests for ``parse_numeric_prefix``.

The cases below capture both valid numeric prefixes and the fallback behavior
when the input does not start with a parseable number.
"""
"""Tests for :mod:`prism_utils`."""

import pytest
"""Tests for :func:`prism_utils.parse_numeric_prefix`."""
"""Test helper functions in `prism_utils`."""
"""Tests for parse_numeric_prefix."""

from prism_utils import parse_numeric_prefix


def test_parse_numeric_prefix_valid():
    """Return the numeric prefix when the input starts with a valid number."""
    """It returns the numeric portion when the prefix is well formed."""

    """Return the numeric part when valid values are provided."""
    """Return numeric prefix for valid input."""
    assert parse_numeric_prefix("2, rest") == 2.0
    assert parse_numeric_prefix("3.5") == 3.5
    assert parse_numeric_prefix("-1 stuff") == -1.0
    assert parse_numeric_prefix("+4") == 4.0
    assert parse_numeric_prefix(" 7") == 7.0
    assert parse_numeric_prefix("2 rest") == 2.0
    assert parse_numeric_prefix(" -4.2 extra") == -4.2
    assert parse_numeric_prefix("2e3") == 2000.0
    assert parse_numeric_prefix("+3E2 trailing") == 300.0
    assert parse_numeric_prefix(".5e1") == 5.0
    assert parse_numeric_prefix("-1.5e-2 extra") == -0.015
    assert parse_numeric_prefix(".5E+3 stuff") == 500.0
    assert parse_numeric_prefix("6.02E23 molecules") == 6.02e23
    assert parse_numeric_prefix(" -7, stuff") == -7.0
    assert parse_numeric_prefix("1e3") == 1000.0
    assert parse_numeric_prefix(" 4 ") == 4.0
    assert parse_numeric_prefix(".5 pears") == 0.5
    assert parse_numeric_prefix("-.25") == -0.25


def test_parse_numeric_prefix_invalid():
    """Default to 1.0 when the prefix is missing or cannot be parsed."""
    """It falls back to ``1.0`` for missing or malformed prefixes."""

    """Fall back to ``1.0`` when the prefix is invalid."""
    """Return ``1.0`` when the prefix is invalid."""
    assert parse_numeric_prefix("abc") == 1.0
    assert parse_numeric_prefix("1a") == 1.0
    assert parse_numeric_prefix("") == 1.0
    assert parse_numeric_prefix("+a") == 1.0
@pytest.mark.parametrize(
    "text, expected",
    [
        ("2, rest", 2.0),
        ("3.5", 3.5),
        ("-4, things", -4.0),
        ("-0.5", -0.5),
    ],
)
def test_parse_numeric_prefix_valid(text: str, expected: float) -> None:
    """Return parsed value for valid numeric prefixes."""
    assert parse_numeric_prefix(text) == expected


@pytest.mark.parametrize(
    "text",
    [
        pytest.param("", id="empty"),
        pytest.param("   ", id="whitespace"),
        pytest.param("abc", id="non-numeric"),
        pytest.param("1a", id="mixed"),
        pytest.param("(", id="syntax-error"),
    ],
)
def test_parse_numeric_prefix_invalid(text: str) -> None:
    """Fall back to ``1.0`` when parsing fails."""
    assert parse_numeric_prefix(text) == 1.0


@pytest.mark.parametrize("exc", [RecursionError, MemoryError])


@pytest.mark.parametrize("exc", [RecursionError, MemoryError, RuntimeError])
def test_parse_numeric_prefix_other_errors(monkeypatch, exc):
    def bad_eval(_):
        raise exc()

    monkeypatch.setattr(ast, "literal_eval", bad_eval)
    assert parse_numeric_prefix("2") == 1.0
    assert parse_numeric_prefix("7e+") == 1.0
@pytest.mark.parametrize(
    "text, expected",
    [
        ("2, rest", 2.0),
        ("3.5", 3.5),
        ("-4, things", -4.0),
    ],
)
def test_parse_numeric_prefix_valid(text: str, expected: float) -> None:
    """Return parsed value for valid numeric prefixes."""
    assert parse_numeric_prefix(text) == expected


@pytest.mark.parametrize(
    "text, expected",
    [
        ("2, rest", 2.0),
        ("3.5", 3.5),
        ("-4, things", -4.0),
    ],
)
def test_parse_numeric_prefix_valid(text: str, expected: float) -> None:
    """Return parsed value for valid numeric prefixes."""
    assert parse_numeric_prefix(text) == expected


@pytest.mark.parametrize("text", ["", "   ", "abc", "1a", "("])
def test_parse_numeric_prefix_invalid(text: str) -> None:
    """Fall back to ``1.0`` when parsing fails."""
    assert parse_numeric_prefix(text) == 1.0
