"""Miscellaneous helpers used across Prism Console."""

from __future__ import annotations

import re

# Match an optional sign and decimal number at the start of the string.
#
# The pattern also accepts numbers like ``.5`` or ``-.25`` that omit the
# leading ``0`` before the decimal point. The negative lookahead ensures the
# match is not immediately followed by an alphanumeric character so that
# strings such as ``"1a"`` are treated as invalid.
_NUMERIC_PREFIX = re.compile(r"^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?![0-9A-Za-z_])")


def parse_numeric_prefix(text: str) -> float:
    """Return the leading numeric value in ``text`` or ``1.0`` if parsing fails."""
# Regex for a decimal number, allowing leading whitespace, optional sign and fraction.
_NUMERIC_PREFIX = re.compile(r"^\s*([+-]?\d+(?:\.\d+)?)")
# leading ``0`` before the decimal point.
_NUMERIC_PREFIX = re.compile(r"^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))")


def parse_numeric_prefix(text: str) -> float:
    """Extracts the leading decimal value from ``text``.

    """Extract a leading decimal value from ``text``.

    The regex ignores leading whitespace and accepts an optional ``+`` or ``-``
    sign and an optional fractional part. Numbers lacking a leading zero, such
    as ``".5 kg"`` or ``"-.25"``, are also recognized. If no valid number is
    found, ``1.0`` is returned. Inputs such as ``"-3.5 apples"`` or ``"2, rest"``
    are recognized; malformed values default to ``1.0``.
    """
    match = _NUMERIC_PREFIX.match(text)
    if not match:
        return 1.0
    try:
        return float(match.group(1))
    except ValueError:  # pragma: no cover - defensive guard
        return 1.0


__all__ = ["parse_numeric_prefix"]
    """Extract the numeric prefix from ``text``.

    The first comma-separated token is safely evaluated with
    :func:`ast.literal_eval`. If that token is missing or not numeric the
    function returns ``1.0``.
"""Utility functions for the BlackRoad Prism console."""

from __future__ import annotations

import ast
import re

_NUMERIC_PREFIX_RE = re.compile(r"^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)")
# Match optional sign, integer/decimal part, and optional exponent.
_NUMERIC_PREFIX_RE = re.compile(
    r"^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?![eE])"
_NUMERIC_PREFIX_RE = re.compile(
    r"^\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)",
)


def parse_numeric_prefix(text: str) -> float:
    """Return the leading numeric value in ``text`` or 1.0 if none exists.
    """Return the leading numeric value in ``text`` or ``1.0`` if absent.

    The function extracts an optional sign and numeric token—supporting
    integers, decimals, and scientific notation—at the start of ``text`` using
    a regular expression. The extracted token is parsed with
    :func:`ast.literal_eval` for safety. If the token cannot be parsed or is
    absent, ``1.0`` is returned.
    The function extracts an optional sign and numeric token at the start of
    ``text`` using a regular expression. Tokens may include decimal mantissas
    and scientific-notation exponents (``1e-3`` or ``.5E+2``). The extracted
    token is parsed with :func:`ast.literal_eval` for safety. If the token
    cannot be parsed or is absent, ``1.0`` is returned.
    This uses :func:`ast.literal_eval` for safety instead of ``eval`` and
    accepts inputs like ``"2, something"``. Non-numeric or invalid values
    would raise ``ValueError`` or ``SyntaxError``, but these are suppressed
    and result in a default return of ``1.0``.
    :func:`ast.literal_eval`. If that token is missing, not numeric, or causes
    ``literal_eval`` to raise (e.g. ``RecursionError`` from extreme nesting),
    the function returns ``1.0`` instead of propagating the exception.
    The prefix is parsed with ``ast.literal_eval`` for safety and accepts
    inputs such as ``"2, something"``. Non-numeric or invalid values fall back
    to 1.0.
    """Return the leading numeric value in ``text`` or ``1.0`` if parsing fails.

    The prefix may include negatives or decimals. The function uses
    :func:`ast.literal_eval` for safety instead of ``eval`` and evaluates the
    substring before the first comma. Only ``ValueError`` and ``SyntaxError``
    are suppressed. This covers empty strings, whitespace, non-numeric tokens,
    or malformed expressions, and the default ``1.0`` is returned in those
    cases.
    accepts inputs like ``"2, something"``. Only ``ValueError`` and
    ``SyntaxError`` are suppressed—such as for empty strings, non-numeric
    tokens, or malformed expressions—and the default ``1.0`` is returned.
    """
    match = _NUMERIC_PREFIX_RE.match(text)
    if not match:
        return 1.0
    try:
        # Evaluate only the portion before the first comma to ignore any
        # trailing text (for example, "2, rest"). ``ast.literal_eval`` is
        # intentionally used instead of ``eval`` because it restricts the
        # permitted syntax to Python literals, preventing arbitrary code
        # execution while still accepting ints, floats, and their negative
        # forms.
        value = ast.literal_eval(text.split(",", maxsplit=1)[0].strip())
        if isinstance(value, (int, float)):
            return float(value)
    except (ValueError, SyntaxError, MemoryError, RecursionError):
        # Non-numeric, malformed, or pathological prefixes fall through to the
        # default below.
        value = ast.literal_eval(match.group(1))
    except Exception:
        return 1.0
    return float(value) if isinstance(value, (int, float)) else 1.0
    except Exception:  # noqa: BLE001 - literal_eval may raise ValueError, SyntaxError, RecursionError, MemoryError, etc.
        # Non-numeric, malformed, or pathological prefixes fall through to the
        # default below.
    except (ValueError, SyntaxError):
        # Raised when the leading segment isn't a valid Python literal
        # Non-numeric literals—such as strings, malformed expressions, or
        # whitespace (which becomes an empty string after ``strip`` and raises
        # ``SyntaxError`` from ``ast.literal_eval``)—raise
        # ``ValueError``/``SyntaxError`` and fall through to the default of
        # ``1.0``.
        pass
import re

# Precompiled regex to extract a leading decimal number with optional sign.
# Match optional leading whitespace, an optional sign, digits, and an optional
# fractional part.
_NUMERIC_PREFIX = re.compile(r"^\s*([+-]?\d+(?:\.\d+)?)")


def parse_numeric_prefix(text: str) -> float:
    """Return the leading decimal value in ``text`` or ``1.0`` if absent.

    Only simple base-10 numbers are supported to avoid evaluating arbitrary
    Python expressions. Inputs like ``"2, something"`` are accepted. Non-numeric
    or invalid values default to ``1.0``.
    Allows leading whitespace, an optional sign, and an optional fractional
    part, ignoring trailing characters. Returns ``1.0`` when no valid number is
    found.
    """
    match = _NUMERIC_PREFIX.match(text)
    if match:
        try:
            return float(match.group(1))
        except ValueError:
            pass
    return 1.0
