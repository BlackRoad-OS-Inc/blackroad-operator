"""Tests for the ``tools.timekeys`` utilities."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
import sys


PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pytest

from tools.timekeys import normalize_time_string


@pytest.mark.parametrize(
    "dayfirst, expected",
    [
        (True, datetime(2024, 5, 4, 1, 2, 3, 123456)),
        (False, datetime(2024, 4, 5, 1, 2, 3, 123456)),
    ],
)
def test_normalize_time_string_dayfirst(dayfirst: bool, expected: datetime) -> None:
    """Ensure ambiguous dates are parsed according to the ``dayfirst`` flag."""

    result = normalize_time_string(
        "04:05:2024 01:02:03.123456",
        dayfirst=dayfirst,
    )
    assert result.tzinfo is not None
    assert result.tzinfo.key == "UTC"
    assert result.replace(tzinfo=None) == expected


@pytest.mark.parametrize(
    "timestamp, microseconds",
    [
        ("2024-01-02T03:04:05:123456Z", 123456),
        ("2024-01-02T03:04:05:123456789Z", 123456),
    ],
)
def test_normalize_time_string_fractional_seconds(
    timestamp: str, microseconds: int
) -> None:
    """Compact fractional-second formats normalise to microsecond precision."""

    result = normalize_time_string(timestamp)
    assert result.tzinfo is not None
    assert result.microsecond == microseconds
    assert result.tzinfo.key == "UTC"
