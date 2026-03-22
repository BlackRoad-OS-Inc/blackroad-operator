"""Tests for A/B Testing Lab."""
import math
import pytest
import sys
sys.path.insert(0, "/tmp")
from ab_testing import (
    ABTestingLab, Experiment, Variant, DataPoint,
    welchs_p_value, confidence_interval,
    STATUS_RUNNING, STATUS_STOPPED,
)


@pytest.fixture
def lab(tmp_path):
    return ABTestingLab(db_path=str(tmp_path / "test.db"))


@pytest.fixture
def exp_with_variants(lab):
    exp_id = lab.create_experiment("checkout_cta", "New CTA improves CVR", "conversion_rate", min_sample=5)
    lab.add_variant(exp_id, "control", 50.0, {})
    lab.add_variant(exp_id, "treatment", 50.0, {"cta": "Buy Now!"})
    return lab, exp_id


def test_create_experiment(lab):
    exp_id = lab.create_experiment("test_exp", "hypothesis", "metric")
    assert exp_id


def test_experiment_starts_running(lab):
    exp_id = lab.create_experiment("test", "h", "m")
    lab.start_experiment(exp_id)
    exps = lab.list_experiments()
    assert any(e["id"] == exp_id for e in exps)


def test_add_variant(exp_with_variants):
    lab, exp_id = exp_with_variants
    with lab._get_conn() as conn:
        rows = conn.execute("SELECT * FROM variants WHERE exp_id=?", (exp_id,)).fetchall()
    assert len(rows) == 2


def test_record_result(exp_with_variants):
    lab, exp_id = exp_with_variants
    dp = lab.record_result(exp_id, "user-1", "control", 0.0)
    assert dp.id


def test_record_unknown_variant_raises(exp_with_variants):
    lab, exp_id = exp_with_variants
    with pytest.raises(ValueError, match="not found"):
        lab.record_result(exp_id, "user-1", "nonexistent", 1.0)


def test_analyze_no_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    result = lab.analyze(exp_id)
    assert result["experiment"] == "checkout_cta"
    assert len(result["variants"]) == 2
    for v in result["variants"]:
        assert v["n"] == 0


def test_analyze_with_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    # control: ~40% conversion
    for i in range(20):
        lab.record_result(exp_id, f"ctrl-{i}", "control", float(i % 2 == 0) * 0.4 + 0.2)
    # treatment: ~60% conversion
    for i in range(20):
        lab.record_result(exp_id, f"trt-{i}", "treatment", float(i % 2 == 0) * 0.6 + 0.3)
    result = lab.analyze(exp_id)
    assert result["variants"][0]["n"] == 20
    assert result["variants"][0]["mean"] is not None
    assert len(result["comparisons"]) == 1


def test_significance_check_not_enough_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    result = lab.significance_check(exp_id)
    assert not result["is_significant"]


def test_significance_check_with_significant_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    # Very different distributions with variance
    import random
    rng = random.Random(99)
    for i in range(50):
        lab.record_result(exp_id, f"c{i}", "control", rng.gauss(0.1, 0.02))
    for i in range(50):
        lab.record_result(exp_id, f"t{i}", "treatment", rng.gauss(0.9, 0.02))
    result = lab.significance_check(exp_id)
    assert result["is_significant"]


def test_winner_no_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    result = lab.winner(exp_id)
    assert result["winner"] is None


def test_winner_with_data(exp_with_variants):
    lab, exp_id = exp_with_variants
    for i in range(30):
        lab.record_result(exp_id, f"c{i}", "control", 0.2)
    for i in range(30):
        lab.record_result(exp_id, f"t{i}", "treatment", 0.8)
    result = lab.winner(exp_id)
    assert result["winner"] == "treatment"


def test_welchs_identical_samples():
    vals = [1.0, 2.0, 3.0, 4.0, 5.0]
    t, p, df = welchs_p_value(vals, vals)
    assert p > 0.5  # Identical samples should have high p-value


def test_welchs_very_different_samples():
    # Use values with variance: group A near 0, group B near 1
    import random
    rng = random.Random(42)
    a = [rng.gauss(0.0, 0.05) for _ in range(50)]
    b = [rng.gauss(1.0, 0.05) for _ in range(50)]
    t, p, df = welchs_p_value(a, b)
    assert p < 0.001


def test_confidence_interval_symmetric():
    vals = [2.0] * 10
    lo, hi = confidence_interval(vals)
    assert lo == hi == 2.0  # No variance → degenerate CI


def test_confidence_interval_contains_mean():
    import statistics as st
    vals = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
    mean = st.mean(vals)
    lo, hi = confidence_interval(vals, 0.95)
    assert lo <= mean <= hi


def test_welchs_insufficient_data():
    t, p, df = welchs_p_value([1.0], [2.0])
    assert p == 1.0
