"""
BlackRoad Labs — Benchmark Runner
Production-quality benchmarking: wall-clock timing, memory profiling,
ASCII charts, CSV export, and a full argparse CLI.

Usage:
    python -m src.benchmark_runner demo --iterations 500
    python -m src.benchmark_runner compare results/benchmarks.json
    python -m src.benchmark_runner report  results/benchmarks.json
    python -m src.benchmark_runner memory-profile --func list_comp
"""
from __future__ import annotations

import argparse
import csv
import gc
import json
import statistics
import sys
import timeit
import tracemalloc
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

# ──────────────────────────────────────────────────────────────────────────────
# Data structures
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class TimingStats:
    """Timing statistics computed from a raw list of nanosecond samples."""

    min_ms: float
    max_ms: float
    mean_ms: float
    median_ms: float
    stddev_ms: float
    p95_ms: float
    p99_ms: float
    iterations: int

    @classmethod
    def from_samples(cls, samples_ns: List[float], iterations: int) -> "TimingStats":
        """Build TimingStats from raw nanosecond timings."""
        samples_ms = [s / 1_000_000 for s in samples_ns]
        s = sorted(samples_ms)
        n = len(s)
        return cls(
            min_ms=s[0],
            max_ms=s[-1],
            mean_ms=statistics.mean(samples_ms),
            median_ms=statistics.median(samples_ms),
            stddev_ms=statistics.stdev(samples_ms) if n > 1 else 0.0,
            p95_ms=s[max(0, int(n * 0.95) - 1)],
            p99_ms=s[max(0, int(n * 0.99) - 1)],
            iterations=iterations,
        )


@dataclass
class MemoryStats:
    """Memory profiling statistics from a pair of tracemalloc snapshots."""

    peak_bytes: int
    current_bytes: int
    peak_mb: float
    current_mb: float

    @classmethod
    def from_snapshots(
        cls,
        snap_before: tracemalloc.Snapshot,
        snap_after: tracemalloc.Snapshot,
    ) -> "MemoryStats":
        stats = snap_after.compare_to(snap_before, "lineno")
        total_current = max(0, sum(s.size_diff for s in stats))
        total_peak    = sum(s.size for s in stats if s.size > 0)
        return cls(
            peak_bytes=total_peak,
            current_bytes=total_current,
            peak_mb=total_peak    / 1_048_576,
            current_mb=total_current / 1_048_576,
        )


@dataclass
class BenchmarkResult:
    """
    Complete benchmark result for a single function.

    Attributes:
        name:      Display name for the benchmark.
        func_path: Fully-qualified function path (module.qualname).
        timestamp: ISO-8601 UTC timestamp of when the run started.
        timing:    Wall-clock timing statistics.
        memory:    Optional memory profiling stats (None if skipped).
        tags:      Arbitrary key-value metadata.
        error:     Error message if the benchmark raised an exception.
    """

    name: str
    func_path: str
    timestamp: str
    timing: TimingStats
    memory: Optional[MemoryStats]
    tags: Dict[str, str] = field(default_factory=dict)
    error: Optional[str] = None

    # ── Serialisation ─────────────────────────────────────────────────────────

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, d: Dict[str, Any]) -> "BenchmarkResult":
        return cls(
            name=d["name"],
            func_path=d["func_path"],
            timestamp=d["timestamp"],
            timing=TimingStats(**d["timing"]),
            memory=MemoryStats(**d["memory"]) if d.get("memory") else None,
            tags=d.get("tags", {}),
            error=d.get("error"),
        )

    # ── Display ───────────────────────────────────────────────────────────────

    def summary_line(self) -> str:
        """Single-line human-readable summary."""
        t = self.timing
        mem_str = f"  peak={self.memory.peak_mb:.2f}MB" if self.memory else ""
        return (
            f"{self.name:<30} "
            f"mean={t.mean_ms:>8.3f}ms  "
            f"p95={t.p95_ms:>8.3f}ms  "
            f"p99={t.p99_ms:>8.3f}ms  "
            f"stddev={t.stddev_ms:>7.3f}ms"
            f"{mem_str}"
        )


# ──────────────────────────────────────────────────────────────────────────────
# Core API
# ──────────────────────────────────────────────────────────────────────────────

def run_benchmark(
    func: Callable,
    iterations: int = 1000,
    warmup: int = 10,
    name: Optional[str] = None,
    profile_memory: bool = True,
    tags: Optional[Dict[str, str]] = None,
    args: Tuple = (),
    kwargs: Optional[Dict[str, Any]] = None,
) -> BenchmarkResult:
    """
    Benchmark a callable: warm up, time *iterations* calls, optionally profile memory.

    Args:
        func:           The callable to benchmark.
        iterations:     Number of timed iterations.
        warmup:         Warm-up iterations (not included in stats).
        name:           Display name; defaults to func.__qualname__.
        profile_memory: Collect tracemalloc memory stats.
        tags:           Arbitrary metadata attached to the result.
        args:           Positional args forwarded to *func*.
        kwargs:         Keyword args forwarded to *func*.

    Returns:
        BenchmarkResult with full timing and optional memory stats.

    Example::

        result = run_benchmark(sorted, args=([3, 1, 2],), iterations=5000)
        print(result.summary_line())
    """
    kwargs = kwargs or {}
    bench_name = name or getattr(func, "__qualname__", repr(func))
    func_path  = (
        f"{getattr(func, '__module__', '?')}"
        f".{getattr(func, '__qualname__', '?')}"
    )

    # warmup
    for _ in range(warmup):
        func(*args, **kwargs)

    # timing (GC off for reproducibility)
    gc.disable()
    samples_ns: List[float] = []
    timer = timeit.default_timer
    try:
        for _ in range(iterations):
            t0 = timer()
            func(*args, **kwargs)
            t1 = timer()
            samples_ns.append((t1 - t0) * 1_000_000_000)
    finally:
        gc.enable()

    timing = TimingStats.from_samples(samples_ns, iterations)

    # memory
    mem_stats: Optional[MemoryStats] = None
    if profile_memory:
        tracemalloc.start()
        snap_before = tracemalloc.take_snapshot()
        func(*args, **kwargs)
        snap_after = tracemalloc.take_snapshot()
        tracemalloc.stop()
        mem_stats = MemoryStats.from_snapshots(snap_before, snap_after)

    return BenchmarkResult(
        name=bench_name,
        func_path=func_path,
        timestamp=datetime.now(timezone.utc).isoformat(),
        timing=timing,
        memory=mem_stats,
        tags=tags or {},
    )


def compare_benchmarks(
    results: List[BenchmarkResult],
    baseline_name: Optional[str] = None,
    metric: str = "mean_ms",
) -> Dict[str, Any]:
    """
    Compare multiple benchmark results against a baseline.

    Args:
        results:       Results to compare.
        baseline_name: Name of the baseline (defaults to first entry).
        metric:        TimingStats field to use (e.g. "mean_ms", "p99_ms").

    Returns:
        Dict with sorted comparison rows and speedup ratios.
    """
    if not results:
        return {"error": "No results to compare"}

    baseline     = next((r for r in results if r.name == baseline_name), results[0])
    baseline_val = getattr(baseline.timing, metric)

    rows = []
    for r in results:
        val     = getattr(r.timing, metric)
        speedup = (baseline_val / val) if val > 0 else float("inf")
        rows.append({
            "name":                r.name,
            metric:                round(val, 4),
            "speedup_vs_baseline": round(speedup, 3),
            "is_baseline":         r.name == baseline.name,
        })

    rows.sort(key=lambda x: x[metric])
    return {
        "baseline":     baseline.name,
        "metric":       metric,
        "comparisons":  rows,
        "fastest":      rows[0]["name"],
        "slowest":      rows[-1]["name"],
        "speedup_range": {
            "min": rows[0]["speedup_vs_baseline"],
            "max": rows[-1]["speedup_vs_baseline"],
        },
    }


def export_csv(results: List[BenchmarkResult], path: str) -> Path:
    """
    Export benchmark results to a CSV file.

    Args:
        results: List of BenchmarkResult to export.
        path:    Output path (parent directories created automatically).

    Returns:
        Path object pointing to the written file.
    """
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)

    fieldnames = [
        "name", "func_path", "timestamp",
        "iterations", "mean_ms", "median_ms", "min_ms", "max_ms",
        "stddev_ms", "p95_ms", "p99_ms", "peak_mb", "current_mb",
    ]
    with out.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            writer.writerow({
                "name":       r.name,
                "func_path":  r.func_path,
                "timestamp":  r.timestamp,
                "iterations": r.timing.iterations,
                "mean_ms":    r.timing.mean_ms,
                "median_ms":  r.timing.median_ms,
                "min_ms":     r.timing.min_ms,
                "max_ms":     r.timing.max_ms,
                "stddev_ms":  r.timing.stddev_ms,
                "p95_ms":     r.timing.p95_ms,
                "p99_ms":     r.timing.p99_ms,
                "peak_mb":    r.memory.peak_mb    if r.memory else "",
                "current_mb": r.memory.current_mb if r.memory else "",
            })
    return out


def plot_ascii_chart(
    results: List[BenchmarkResult],
    metric: str = "mean_ms",
    width: int = 50,
    title: Optional[str] = None,
) -> str:
    """
    Render a horizontal ASCII bar chart of benchmark results sorted fastest→slowest.

    Args:
        results: Results to visualise.
        metric:  TimingStats field to chart (e.g. "mean_ms", "p99_ms").
        width:   Maximum bar length in characters.
        title:   Optional chart title (defaults to "Benchmark — {metric}").

    Returns:
        Multi-line string ready for ``print()``.

    Example::

        print(plot_ascii_chart(results, metric="p95_ms"))
    """
    if not results:
        return "(no results to plot)"

    values       = [getattr(r.timing, metric) for r in results]
    max_val      = max(values) if values else 1.0
    max_name_len = max(len(r.name) for r in results)
    sep          = "─" * (max_name_len + width + 22)

    lines: List[str] = [
        f"\n{sep}",
        f"  {title or f'Benchmark — {metric}'}",
        sep,
    ]
    for r, val in sorted(zip(results, values), key=lambda x: x[1]):
        bar_len = int((val / max_val) * width) if max_val > 0 else 0
        bar     = "█" * bar_len + "░" * (width - bar_len)
        lines.append(f"  {r.name.ljust(max_name_len)}  [{bar}]  {val:>9.3f} ms")

    lines.append(f"{sep}\n")
    return "\n".join(lines)


def memory_profile(
    func: Callable,
    args: Tuple = (),
    kwargs: Optional[Dict[str, Any]] = None,
    top_n: int = 10,
) -> Dict[str, Any]:
    """
    Detailed per-line memory profile of a single function call via tracemalloc.

    Args:
        func:   Function to profile.
        args:   Positional arguments forwarded to *func*.
        kwargs: Keyword arguments forwarded to *func*.
        top_n:  Number of top-allocating lines to return.

    Returns:
        Dict with peak_traced_mb, total_allocations, top_allocations list,
        and the type of the function's return value.
    """
    kwargs = kwargs or {}
    tracemalloc.start(25)
    snap_before = tracemalloc.take_snapshot()
    result      = func(*args, **kwargs)
    snap_after  = tracemalloc.take_snapshot()
    peak_traced, _ = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    stats = snap_after.compare_to(snap_before, "lineno")
    top_stats = [
        {
            "file":            str(s.traceback[0].filename) if s.traceback else "?",
            "line":            s.traceback[0].lineno        if s.traceback else 0,
            "size_diff_bytes": s.size_diff,
            "size_bytes":      s.size,
            "count_diff":      s.count_diff,
        }
        for s in stats[:top_n]
    ]
    return {
        "peak_traced_bytes":   peak_traced,
        "peak_traced_mb":      peak_traced / 1_048_576,
        "total_allocations":   sum(s["size_bytes"] for s in top_stats if s["size_bytes"] > 0),
        "top_allocations":     top_stats,
        "func_result_type":    type(result).__name__,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Persistence helpers
# ──────────────────────────────────────────────────────────────────────────────

def save_results(results: List[BenchmarkResult], path: str) -> Path:
    """Persist results list to a JSON file (creates parent dirs)."""
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps([r.to_dict() for r in results], indent=2))
    return out


def load_results(path: str) -> List[BenchmarkResult]:
    """Load a list of BenchmarkResult objects from a JSON file."""
    return [BenchmarkResult.from_dict(d) for d in json.loads(Path(path).read_text())]


# ──────────────────────────────────────────────────────────────────────────────
# Demo suite
# ──────────────────────────────────────────────────────────────────────────────

def _demo_suite() -> List[Callable]:
    """Built-in set of trivial functions used by the demo command."""
    import hashlib
    import random

    def sort_random(n: int = 1000) -> List[int]:
        return sorted(random.sample(range(n * 10), n))

    def sha256_string(s: str = "blackroad-labs-benchmark-payload") -> str:
        return hashlib.sha256(s.encode()).hexdigest()

    def list_comp(n: int = 500) -> List[int]:
        return [i ** 2 for i in range(n)]

    def dict_build(n: int = 500) -> Dict[str, int]:
        return {str(i): i ** 2 for i in range(n)}

    def string_join(n: int = 200) -> str:
        return "-".join(str(i) for i in range(n))

    def nested_loop(n: int = 80) -> int:
        total = 0
        for i in range(n):
            for j in range(n):
                total += i ^ j
        return total

    return [sort_random, sha256_string, list_comp, dict_build, string_join, nested_loop]


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def _build_cli() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="benchmark_runner",
        description="BlackRoad Labs — Production Benchmark Runner",
    )
    sub = p.add_subparsers(dest="command", required=True)

    demo = sub.add_parser("demo", help="Run the built-in demo suite")
    demo.add_argument("--iterations", type=int, default=500)
    demo.add_argument("--output", default="results/benchmarks.json")
    demo.add_argument("--csv",    default="results/benchmarks.csv")
    demo.add_argument("--no-memory", action="store_true")
    demo.add_argument("--metric", default="mean_ms")

    cmp = sub.add_parser("compare", help="Compare saved benchmark results")
    cmp.add_argument("file")
    cmp.add_argument("--metric",   default="mean_ms")
    cmp.add_argument("--baseline", default=None)

    rep = sub.add_parser("report", help="Full report from saved results")
    rep.add_argument("file")

    mem = sub.add_parser("memory-profile", help="Per-line memory profile a demo function")
    mem.add_argument("--func", default="list_comp")
    mem.add_argument("--top",  type=int, default=10)

    return p


def main(argv: Optional[List[str]] = None) -> int:
    args = _build_cli().parse_args(argv)

    if args.command == "demo":
        suite   = _demo_suite()
        results: List[BenchmarkResult] = []
        print(f"\n\U0001f52c Running {len(suite)} benchmarks \u00d7 {args.iterations} iterations\u2026\n")
        for fn in suite:
            print(f"  \u2193 {fn.__name__:<25}", end=" ", flush=True)
            r = run_benchmark(fn, iterations=args.iterations,
                              profile_memory=not args.no_memory, name=fn.__name__)
            results.append(r)
            print(f"mean={r.timing.mean_ms:.3f}ms  p99={r.timing.p99_ms:.3f}ms")

        print(plot_ascii_chart(results, metric=args.metric))
        cmp = compare_benchmarks(results, metric=args.metric)
        print(f"  \u26a1 Fastest : {cmp['fastest']}")
        print(f"  \U0001f422 Slowest : {cmp['slowest']}")
        json_out = save_results(results, args.output)
        csv_out  = export_csv(results, args.csv)
        print(f"\n  Saved JSON \u2192 {json_out}")
        print(f"  Saved CSV  \u2192 {csv_out}\n")
        return 0

    elif args.command == "compare":
        results = load_results(args.file)
        cmp = compare_benchmarks(results, baseline_name=args.baseline, metric=args.metric)
        print(f"\n\U0001f4ca Comparison  metric={cmp['metric']}  baseline={cmp['baseline']}\n")
        print(f"  {'Name':<30} {cmp['metric']:>12}   Speedup")
        print(f"  {'─'*30} {'─'*12}   {'─'*10}")
        for row in cmp["comparisons"]:
            marker = "  ◀ baseline" if row["is_baseline"] else ""
            print(f"  {row['name']:<30} {row[cmp['metric']]:>12.3f}   \u00d7{row['speedup_vs_baseline']:.3f}{marker}")
        print()
        return 0

    elif args.command == "report":
        results = load_results(args.file)
        print(f"\n\U0001f4cb Benchmark Report — {len(results)} results\n")
        for r in results:
            print(" ", r.summary_line())
            if r.memory:
                print(f"    memory peak={r.memory.peak_mb:.3f}MB  current={r.memory.current_mb:.3f}MB")
        print()
        return 0

    elif args.command == "memory-profile":
        fn_map = {fn.__name__: fn for fn in _demo_suite()}
        fn = fn_map.get(args.func)
        if fn is None:
            print(f"Unknown function '{args.func}'. Choose from: {list(fn_map)}")
            return 1
        profile = memory_profile(fn, top_n=args.top)
        print(f"\n\U0001f50d Memory Profile: {args.func}\n")
        print(f"  Peak traced : {profile['peak_traced_mb']:.4f} MB")
        print(f"  Total alloc : {profile['total_allocations']:,} bytes")
        print(f"  Return type : {profile['func_result_type']}\n")
        for i, a in enumerate(profile["top_allocations"][:args.top], 1):
            print(f"  {i:2}. {a['file']:50} line {a['line']:5}  +{a['size_diff_bytes']:,}B")
        print()
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
