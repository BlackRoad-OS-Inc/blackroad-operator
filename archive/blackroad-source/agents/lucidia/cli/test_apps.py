"""Tests for Lucidia mini applications."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from components.apps import Calculator, Clock, SystemInfo, Fortune, APPS


class TestCalculator:
    def test_basic_addition(self):
        assert Calculator.eval("2 + 2") == 4

    def test_multiplication(self):
        assert Calculator.eval("6 * 7") == 42

    def test_division(self):
        assert Calculator.eval("84 / 2") == 42.0

    def test_error_handling(self):
        result = Calculator.eval("import os")
        assert "Error" in str(result)

    def test_builtins(self):
        assert Calculator.eval("abs(-5)") == 5
        assert Calculator.eval("max(1, 2, 3)") == 3


class TestClock:
    def test_now_returns_string(self):
        result = Clock.now()
        assert isinstance(result, str)
        assert len(result) == 19  # "YYYY-MM-DD HH:MM:SS"

    def test_date_format(self):
        result = Clock.date()
        assert isinstance(result, str)
        assert len(result) == 10  # "YYYY-MM-DD"

    def test_time_format(self):
        result = Clock.time()
        assert isinstance(result, str)
        assert len(result) == 8  # "HH:MM:SS"

    def test_unix_timestamp(self):
        result = Clock.unix()
        assert isinstance(result, int)
        assert result > 1_000_000_000


class TestSystemInfo:
    def test_whoami_returns_dict(self):
        result = SystemInfo.whoami()
        assert isinstance(result, dict)
        assert "os" in result
        assert "org" in result
        assert result["org"] == "BlackRoad OS, Inc."

    def test_neofetch_returns_string(self):
        result = SystemInfo.neofetch()
        assert "lucidia" in result
        assert "BlackRoad" in result


class TestFortune:
    def test_returns_string(self):
        result = Fortune.get()
        assert isinstance(result, str)
        assert len(result) > 0

    def test_from_known_list(self):
        result = Fortune.get()
        assert result in Fortune.FORTUNES


class TestAppsRegistry:
    def test_registry_has_expected_keys(self):
        expected = {"calc", "btc", "eth", "fortune", "weather", "time", "date", "unix", "whoami", "neofetch"}
        assert expected == set(APPS.keys())

    def test_fortune_callable(self):
        result = APPS["fortune"]()
        assert isinstance(result, str)

    def test_time_callable(self):
        result = APPS["time"]()
        assert isinstance(result, str)
