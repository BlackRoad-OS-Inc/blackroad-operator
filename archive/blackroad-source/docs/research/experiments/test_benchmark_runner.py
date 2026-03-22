"""Tests for src/benchmark_runner.py"""
from __future__ import annotations
import json
import math
import tempfile
from pathlib import Path

import pytest

# Ensure src/ is importable from project root
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.benchmark_runner import (
    BenchmarkResult,
    MemoryStats,
    TimingStats,
    compare_benchmarks,
    export_csv,
    load_results,
    memory_profile,
    plot_ascii_chart,
    run_benchmark,
    save_results,
)


# ── fixtures ──────────────────────────────────────────────────────────────────

def trivial_fn() -> int:
    """Deterministic O(1) function for fast tests."""
    return 42


def alloc_fn() -> list:
    return [i * 2 for i in range(500)]


# ── TimingStats ───────────────────────────────────────────────────────────────

class TestTimingStats:
    def test_from_uniform_samples(self):
        samples_ns = [1_000_000.0] * 100  # all 1 ms
        stats = TimingStats.from_samples(samples_ns, 100)
        assert math.isclose(stats.mean_ms, 1.0, abs_tol=1e-6)
        assert math.isclose(stats.min_ms,  1.0, abs_tol=1e-6)
        assert math.isclose(stats.max_ms,  1.0, abs_tol=1e-6)
        assert stats.stddev_ms == pytest.approx(0.0, abs=1e-9)
        assert stats.iterations == 100

    def test_percentiles_are_ordered(self):
        samples_ns = list(range(1_000_000, 101_000_000, 1_000_000))  # 1ms..100ms
        stats = TimingStats.from_samples(samples_ns, len(samples_ns))
        assert stats.min_ms <= stats.p95_ms <= stats.p99_ms <= stats.max_ms

    def test_single_sample(self):
        stats = TimingStats.from_samples([5_000_000.0], 1)
        assert stats.mean_ms == pytest.approx(5.0)
        assert stats.stddev_ms == 0.0


# ── MemoryStats ───────────────────────────────────────────────────────────────

class TestMemoryStats:
    def test_mb_conversion(self):
        mem = MemoryStats(peak_bytes=1_048_576, current_bytes=524_288,
                          peak_mb=1.0, current_mb=0.5)
        assert mem.peak_mb == pytest.approx(1.0)
        assert mem.current_mb == pytest.approx(0.5)


# ── run_benchmark ─────────────────────────────────────────────────────────────

class TestRunBenchmark:
    def test_returns_benchmark_result(self):
        r = run_benchmark(trivial_fn, iterations=50, warmup=5, profile_memory=False)
        assert isinstance(r, BenchmarkResult)
        assert r.name == "trivial_fn"
        assert r.timing.iterations == 50
        assert r.timing.mean_ms >= 0.0
        assert r.memory is None

    def test_memory_profiling(self):
        r = run_benchmark(alloc_fn, iterations=10, warmup=2, profile_memory=True)
        assert r.memory is not None
        assert r.memory.peak_bytes >= 0
        assert r.memory.peak_mb >= 0.0

    def test_custom_name_and_tags(self):
        r = run_benchmark(trivial_fn, iterations=10, profile_memory=False,
                          name="my_bench", tags={"env": "ci"})
        assert r.name == "my_bench"
        assert r.tags == {"env": "ci"}

    def test_timing_is_positive(self):
        r = run_benchmark(trivial_fn, iterations=100, profile_memory=False)
        assert r.timing.min_ms >= 0.0
        assert r.timing.mean_ms >= r.timing.min_ms

    def test_args_forwarded(self):
        def add(a: int, b: int) -> int:
            return a + b
        r = run_benchmark(add, iterations=20, profile_memory=False, args=(1, 2))
        assert r.timing.iterations == 20

    def test_timestamp_is_iso8601(self):
        r = run_benchmark(trivial_fn, iterations=5, profile_memory=False)
        from datetime import datetime
        datetime.fromisoformat(r.timestamp)  # should not raise


# ── compare_benchmarks ────────────────────────────────────────────────────────

class TestCompareBenchmarks:
    def _make_results(self):
        r1 = run_benchmark(trivial_fn, iterations=50, profile_memory=False, name="fast")
        r2 = run_benchmark(alloc_fn,   iterations=50, profile_memory=False, name="slow")
        return [r1, r2]

    def test_returns_correct_keys(self):
        cmp = compare_benchmarks(self._make_results())
        assert "baseline" in cmp
        assert "comparisons" in cmp
        assert "fastest" in cmp
        assert "slowest" in cmp

    def test_empty_input(self):
        cmp = compare_benchmarks([])
        assert "error" in cmp

    def test_baseline_speedup_is_one(self):
        results = self._make_results()
        cmp = compare_benchmarks(results, baseline_name=results[0].name)
        baseline_row = next(r for r in cmp["comparisons"] if r["is_baseline"])
        assert baseline_row["speedup_vs_baseline"] == pytest.approx(1.0, rel=1e-3)

    def test_sorted_ascending(self):
        results = self._make_results()
        cmp = compare_benchmarks(results)
        vals = [r["mean_ms"] for r in cmp["comparisons"]]
        assert vals == sorted(vals)


# ── export_csv / save / load ──────────────────────────────────────────────────

class TestPersistence:
    def test_export_csv_creates_file(self, tmp_path):
        r = run_benchmark(trivial_fn, iterations=10, profile_memory=False)
        out = export_csv([r], str(tmp_path / "bench.csv"))
        assert out.exists()
        lines = out.read_text().splitlines()
        assert len(lines) == 2  # header + 1 data row

    def test_save_and_load_roundtrip(self, tmp_path):
        r = run_benchmark(trivial_fn, iterations=10, profile_memory=True)
        path = str(tmp_path / "results.json")
        save_results([r], path)
        loaded = load_results(path)
        assert len(loaded) == 1
        assert loaded[0].name == r.name
        assert loaded[0].timing.iterations == r.timing.iterations
        assert loaded[0].timing.mean_ms == pytest.approx(r.timing.mean_ms, rel=1e-6)

    def test_save_multiple_results(self, tmp_path):
        results = [
            run_benchmark(trivial_fn, iterations=5, profile_memory=False, name=f"fn_{i}")
            for i in range(3)
        ]
        path = str(tmp_path / "multi.json")
        save_results(results, path)
        loaded = load_results(path)
        assert len(loaded) == 3
        names = [r.name for r in loaded]
        assert "fn_0" in names and "fn_2" in names


# ── plot_ascii_chart ──────────────────────────────────────────────────────────

class TestPlotAsciiChart:
    def test_returns_string(self):
        r = run_benchmark(trivial_fn, iterations=10, profile_memory=False)
        chart = plot_ascii_chart([r])
        assert isinstance(chart, str)
        assert r.name in chart

    def test_empty_returns_fallback(self):
        assert plot_ascii_chart([]) == "(no results to plot)"

    def test_custom_metric(self):
        r = run_benchmark(trivial_fn, iterations=10, profile_memory=False)
        chart = plot_ascii_chart([r], metric="p99_ms")
        assert "p99_ms" in chart or "Benchmark" in chart

    def test_sorted_by_value(self):
        results = [
            run_benchmark(trivial_fn, iterations=5,  profile_memory=False, name="fast"),
            run_benchmark(alloc_fn,   iterations=5,  profile_memory=False, name="slow"),
        ]
        chart = plot_ascii_chart(results)
        fast_pos = chart.find("fast")
        slow_pos = chart.find("slow")
        assert fast_pos < slow_pos, "Faster benchmark should appear before slower"


# ── memory_profile ────────────────────────────────────────────────────────────

class TestMemoryProfile:
    def test_returns_expected_keys(self):
        profile = memory_profile(alloc_fn)
        assert "peak_traced_mb"    in profile
        assert "total_allocations" in profile
        assert "top_allocations"   in profile
        assert "func_result_type"  in profile

    def test_result_type(self):
        profile = memory_profile(alloc_fn)
        assert profile["func_result_type"] == "list"

    def test_peak_mb_nonnegative(self):
        profile = memory_profile(trivial_fn)
        assert profile["peak_traced_mb"] >= 0.0


# ── CLI ───────────────────────────────────────────────────────────────────────

class TestCLI:
    def test_demo_command_runs(self, tmp_path, capsys):
        from src.benchmark_runner import main
        rc = main(["demo", "--iterations", "20", "--no-memory",
                   "--output", str(tmp_path / "b.json"),
                   "--csv",    str(tmp_path / "b.csv")])
        assert rc == 0
        captured = capsys.readouterr()
        assert "mean=" in captured.out

    def test_compare_command(self, tmp_path, capsys):
        from src.benchmark_runner import main, run_benchmark, save_results
        results = [run_benchmark(trivial_fn, iterations=5, profile_memory=False)]
        path = str(tmp_path / "r.json")
        save_results(results, path)
        rc = main(["compare", path])
        assert rc == 0

    def test_report_command(self, tmp_path, capsys):
        from src.benchmark_runner import main, run_benchmark, save_results
        results = [run_benchmark(trivial_fn, iterations=5, profile_memory=False)]
        path = str(tmp_path / "r.json")
        save_results(results, path)
        rc = main(["report", path])
        assert rc == 0
        captured = capsys.readouterr()
        assert "trivial_fn" in captured.out
