"""
Tests for BlackRoad Ventures Startup Metrics Tracker.
"""
import os
import sys
import tempfile
from pathlib import Path

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from startup_metrics import (
    Metric,
    Startup,
    StartupAnalytics,
    StartupMetricsManager,
    StartupStore,
    VALID_STAGES,
)


# ─── Fixtures ────────────────────────────────────────────────────────────────


@pytest.fixture
def tmp_db(tmp_path):
    return tmp_path / "startups.db"


@pytest.fixture
def mgr(tmp_db):
    m = StartupMetricsManager(tmp_db)
    yield m
    m.close()


@pytest.fixture
def seed_startup(mgr):
    mgr.add_startup(
        "s1", "TestCo", "seed",
        mrr=50_000, burn_rate=100_000, cash_balance=1_800_000,
        headcount=10,
    )
    for i, (mrr, period) in enumerate([
        (35_000, "2024-10"),
        (42_000, "2024-11"),
        (47_000, "2024-12"),
        (50_000, "2025-01"),
    ]):
        mgr.log_metric("s1", "mrr", mrr, period)
    return "s1"


# ─── Startup dataclass tests ─────────────────────────────────────────────────


class TestStartupDataclass:
    def test_computed_arr(self):
        s = Startup("s1", "Co", mrr=10_000)
        assert s.computed_arr == 120_000.0

    def test_computed_runway_finite(self):
        s = Startup("s1", "Co", burn_rate=50_000, cash_balance=600_000)
        assert abs(s.computed_runway - 12.0) < 0.001

    def test_computed_runway_zero_burn(self):
        s = Startup("s1", "Co", burn_rate=0, cash_balance=500_000)
        import math
        assert math.isinf(s.computed_runway)

    def test_arr_per_employee(self):
        s = Startup("s1", "Co", arr=1_200_000, headcount=10)
        assert s.arr_per_employee == 120_000.0

    def test_arr_per_employee_zero_headcount(self):
        s = Startup("s1", "Co", arr=100_000, headcount=0)
        assert s.arr_per_employee == 0.0

    def test_burn_multiple(self):
        s = Startup("s1", "Co", mrr=100_000, burn_rate=200_000)
        assert abs(s.burn_multiple - 2.0) < 0.001

    def test_burn_multiple_zero_mrr(self):
        s = Startup("s1", "Co", mrr=0, burn_rate=10_000)
        import math
        assert math.isinf(s.burn_multiple)

    def test_default_stage(self):
        s = Startup("s1", "Co")
        assert s.stage == "pre_seed"


# ─── StartupStore tests ───────────────────────────────────────────────────────


class TestStartupStore:
    def test_create_and_get(self, tmp_db):
        store = StartupStore(tmp_db)
        startup = Startup("s1", "TestCo", stage="seed", mrr=10_000)
        store.create(startup)
        loaded = store.get("s1")
        assert loaded is not None
        assert loaded.name == "TestCo"
        assert loaded.stage == "seed"
        store.close()

    def test_get_nonexistent(self, tmp_db):
        store = StartupStore(tmp_db)
        assert store.get("nope") is None
        store.close()

    def test_update_mrr(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co", mrr=5000))
        store.update("s1", mrr=10_000)
        loaded = store.get("s1")
        assert loaded.mrr == 10_000.0
        store.close()

    def test_delete_cascades(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co", mrr=5000))
        m = Metric("s1", "mrr", 5000, "2024-01")
        store.log_metric(m)
        store.delete("s1")
        assert store.get("s1") is None
        series = store.get_metric_series("s1", "mrr")
        assert series == []
        store.close()

    def test_log_and_retrieve_metric(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co", mrr=5000))
        store.log_metric(Metric("s1", "mrr", 5000, "2024-01"))
        store.log_metric(Metric("s1", "mrr", 6000, "2024-02"))
        series = store.get_metric_series("s1", "mrr")
        assert len(series) == 2
        store.close()

    def test_get_latest_metric(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co", mrr=5000))
        store.log_metric(Metric("s1", "mrr", 5000, "2024-01"))
        store.log_metric(Metric("s1", "mrr", 8000, "2024-02"))
        val = store.get_latest_metric("s1", "mrr")
        # latest by period desc = 2024-02
        assert val == 8000.0
        store.close()

    def test_latest_metric_nonexistent(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co"))
        assert store.get_latest_metric("s1", "nonexistent_kpi") is None
        store.close()

    def test_funding_round_log(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "Co"))
        store.add_funding_round("s1", "Seed", 1_000_000, "VC Fund", 5_000_000)
        rounds = store.get_funding_history("s1")
        assert len(rounds) == 1
        assert rounds[0]["amount"] == 1_000_000
        store.close()

    def test_list_all(self, tmp_db):
        store = StartupStore(tmp_db)
        store.create(Startup("s1", "A"))
        store.create(Startup("s2", "B"))
        items = store.list_all()
        assert len(items) == 2
        store.close()


# ─── StartupAnalytics tests ───────────────────────────────────────────────────


class TestStartupAnalytics:
    def _make_startup(self, **kwargs) -> Startup:
        defaults = dict(
            id="s1", name="TestCo", stage="seed",
            mrr=50_000, arr=600_000,
            burn_rate=100_000, runway_months=18,
            cash_balance=1_800_000, headcount=10,
        )
        defaults.update(kwargs)
        return Startup(**defaults)

    def test_runway_healthy(self):
        s = self._make_startup(cash_balance=2_400_000, burn_rate=100_000)
        r = StartupAnalytics.get_runway(s)
        assert r["runway_status"] == "healthy"
        assert abs(r["runway_months"] - 24.0) < 0.01

    def test_runway_critical(self):
        s = self._make_startup(cash_balance=300_000, burn_rate=100_000)
        r = StartupAnalytics.get_runway(s)
        assert r["runway_status"] == "critical"

    def test_runway_profitable_no_burn(self):
        s = self._make_startup(burn_rate=0, cash_balance=500_000)
        r = StartupAnalytics.get_runway(s)
        assert r["runway_months"] is None
        assert r["runway_status"] == "profitable"

    def test_growth_rate_positive(self):
        series = [
            {"value": 50_000, "period": "2025-01"},
            {"value": 42_000, "period": "2024-12"},
            {"value": 35_000, "period": "2024-11"},
        ]
        rate = StartupAnalytics.calculate_growth_rate(series, periods=3)
        assert rate is not None
        assert rate > 0

    def test_growth_rate_needs_two_periods(self):
        series = [{"value": 10_000, "period": "2024-01"}]
        assert StartupAnalytics.calculate_growth_rate(series) is None

    def test_growth_rate_empty_series(self):
        assert StartupAnalytics.calculate_growth_rate([]) is None

    def test_growth_rate_negative(self):
        series = [
            {"value": 5_000, "period": "2024-03"},
            {"value": 10_000, "period": "2024-02"},
            {"value": 15_000, "period": "2024-01"},
        ]
        rate = StartupAnalytics.calculate_growth_rate(series, periods=3)
        assert rate is not None
        assert rate < 0

    def test_benchmarks_stage_seed(self):
        s = self._make_startup(stage="seed", mrr=50_000, arr=600_000)
        bench = StartupAnalytics.benchmarks(s)
        assert bench["stage"] == "seed"
        assert "benchmarks" in bench
        assert "gaps" in bench
        assert "scores" in bench

    def test_benchmarks_mrr_above_target_scores_above_100(self):
        s = self._make_startup(
            stage="seed", mrr=100_000, arr=1_200_000,
            burn_rate=100_000, runway_months=18,
        )
        bench = StartupAnalytics.benchmarks(s)
        assert bench["scores"]["mrr_score"] > 100

    def test_benchmarks_override_stage(self):
        s = self._make_startup(stage="seed")
        bench = StartupAnalytics.benchmarks(s, stage="series_a")
        assert bench["stage"] == "series_a"

    def test_investor_report_text_contains_name(self):
        s = self._make_startup()
        report = StartupAnalytics.investor_report_text(s, {}, [])
        assert "TESTCO" in report
        assert "MRR" in report
        assert "Burn Rate" in report


# ─── StartupMetricsManager integration tests ────────────────────────────────


class TestStartupMetricsManager:
    def test_add_and_retrieve(self, mgr):
        mgr.add_startup("s1", "Alpha", "seed", mrr=20_000, burn_rate=40_000,
                        cash_balance=720_000)
        runway = mgr.get_runway("s1")
        assert abs(runway["runway_months"] - 18.0) < 0.1

    def test_invalid_stage_raises(self, mgr):
        with pytest.raises(ValueError, match="stage"):
            mgr.add_startup("s1", "Bad Stage Co", "unicorn")

    def test_startup_not_found_raises(self, mgr):
        with pytest.raises(ValueError):
            mgr.get_runway("nonexistent")

    def test_log_and_growth_rate(self, mgr, seed_startup):
        rate = mgr.calculate_growth_rate(seed_startup, "mrr", periods=3)
        assert rate is not None
        assert rate > 0  # growing startup

    def test_growth_rate_insufficient_data(self, mgr):
        mgr.add_startup("s2", "NewCo", "pre_seed")
        mgr.log_metric("s2", "mrr", 1000, "2025-01")
        rate = mgr.calculate_growth_rate("s2", "mrr", periods=3)
        assert rate is None

    def test_investor_report_text(self, mgr, seed_startup):
        report = mgr.investor_report(seed_startup, fmt="text")
        assert "TestCo" in report or "TESTCO" in report
        assert "MRR" in report

    def test_investor_report_json_parseable(self, mgr, seed_startup):
        import json
        report = mgr.investor_report(seed_startup, fmt="json")
        data = json.loads(report)
        assert "startup" in data
        assert data["startup"]["id"] == seed_startup

    def test_benchmarks_returns_stage(self, mgr, seed_startup):
        bench = mgr.benchmarks(seed_startup)
        assert bench["stage"] == "seed"
        assert "scores" in bench

    def test_portfolio_summary(self, mgr):
        mgr.add_startup("a", "Alpha", "seed",  mrr=50_000)
        mgr.add_startup("b", "Beta",  "series_a", mrr=200_000)
        summary = mgr.portfolio_summary()
        assert len(summary) == 2
        ids = [s["id"] for s in summary]
        assert "a" in ids
        assert "b" in ids

    def test_update_startup_derives_arr(self, mgr, seed_startup):
        mgr.update_startup(seed_startup, mrr=60_000)
        s = mgr.store.get(seed_startup)
        assert abs(s.arr - 720_000) < 1.0

    def test_funding_round_appears_in_report(self, mgr, seed_startup):
        mgr.add_funding_round(seed_startup, "Seed", 1_500_000, "BRV", 9_000_000)
        report = mgr.investor_report(seed_startup, fmt="text")
        assert "1,500,000" in report or "1500000" in report

    def test_multiple_startups_isolated(self, mgr):
        mgr.add_startup("x1", "Xco", "seed", mrr=10_000)
        mgr.add_startup("x2", "Yco", "series_a", mrr=100_000)
        mgr.log_metric("x1", "cac", 500, "2024-01")
        mgr.log_metric("x2", "cac", 3000, "2024-01")
        v1 = mgr.store.get_latest_metric("x1", "cac")
        v2 = mgr.store.get_latest_metric("x2", "cac")
        assert v1 == 500.0
        assert v2 == 3000.0

    def test_valid_stages_exhaustive(self):
        """Ensure all stages in VALID_STAGES are accepted."""
        for stage in VALID_STAGES:
            s = Startup("s_test", "Co", stage=stage)
            assert s.stage == stage
