"""
A/B Testing Framework for ML and Product Experiments
blackroad-ab-testing-lab: Statistical A/B test management using pure Python stdlib.
"""

import argparse
import json
import logging
import math
import os
import sqlite3
import statistics
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional
from uuid import uuid4

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ab_testing")

DB_PATH = os.environ.get("AB_TEST_DB", str(__import__("pathlib").Path.home() / ".blackroad" / "ab_testing.db"))

STATUS_DRAFT = "draft"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_STOPPED = "stopped"

STATUSES = [STATUS_DRAFT, STATUS_RUNNING, STATUS_COMPLETED, STATUS_STOPPED]


@dataclass
class Experiment:
    """Represents an A/B experiment."""
    id: str
    name: str
    hypothesis: str
    metric: str
    status: str = STATUS_DRAFT
    start_dt: Optional[str] = None
    end_dt: Optional[str] = None
    min_sample: int = 100
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_row(cls, row) -> "Experiment":
        return cls(
            id=row["id"],
            name=row["name"],
            hypothesis=row["hypothesis"],
            metric=row["metric"],
            status=row["status"],
            start_dt=row["start_dt"],
            end_dt=row["end_dt"],
            min_sample=row["min_sample"],
            created_at=row["created_at"],
        )


@dataclass
class Variant:
    """A variant within an experiment (e.g. control vs treatment)."""
    id: str
    exp_id: str
    name: str
    description: str
    traffic_pct: float
    config: dict
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        d = asdict(self)
        d["config"] = self.config
        return d

    @classmethod
    def from_row(cls, row) -> "Variant":
        return cls(
            id=row["id"],
            exp_id=row["exp_id"],
            name=row["name"],
            description=row["description"] or "",
            traffic_pct=row["traffic_pct"],
            config=json.loads(row["config"]) if row["config"] else {},
            created_at=row["created_at"],
        )


@dataclass
class DataPoint:
    """A single measurement from one user in one variant."""
    id: str
    variant_id: str
    value: float
    user_id: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Pure-Python Statistics (Welch's t-test, no scipy/numpy)
# ---------------------------------------------------------------------------

def _welchs_t_statistic(mean1: float, mean2: float, var1: float, var2: float, n1: int, n2: int) -> float:
    """Compute Welch's t-statistic."""
    denom = math.sqrt(var1 / n1 + var2 / n2)
    if denom == 0:
        return 0.0
    return (mean1 - mean2) / denom


def _welchs_dof(var1: float, var2: float, n1: int, n2: int) -> float:
    """Compute Welch–Satterthwaite degrees of freedom."""
    a = var1 / n1
    b = var2 / n2
    numerator = (a + b) ** 2
    denominator = (a ** 2) / (n1 - 1) + (b ** 2) / (n2 - 1)
    if denominator == 0:
        return float(n1 + n2 - 2)
    return numerator / denominator


def _t_distribution_cdf(t: float, df: float) -> float:
    """
    Approximation of the CDF of the t-distribution using the regularized
    incomplete beta function via the betainc relation.
    P(T <= t) for t >= 0, then mirror for negative t.

    Uses the continued fraction expansion for betainc (Lentz method approx).
    This is an approximation sufficient for significance testing.
    """
    t_abs = abs(t)
    x = df / (df + t_abs ** 2)

    def _betainc(a: float, b: float, x_val: float) -> float:
        """Regularized incomplete beta function via continued fraction (Lentz)."""
        if x_val < 0 or x_val > 1:
            return 0.0
        if x_val == 0.0:
            return 0.0
        if x_val == 1.0:
            return 1.0
        lbeta = math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)
        front = math.exp(math.log(x_val) * a + math.log(1 - x_val) * b - lbeta) / a

        # Lentz continued fraction
        TINY = 1e-30
        MAX_ITER = 200
        EPS = 3e-7

        def _cf():
            qab = a + b
            qap = a + 1.0
            qam = a - 1.0
            c = 1.0
            d = 1.0 - qab * x_val / qap
            if abs(d) < TINY:
                d = TINY
            d = 1.0 / d
            h = d
            for m in range(1, MAX_ITER + 1):
                m2 = 2 * m
                aa = m * (b - m) * x_val / ((qam + m2) * (a + m2))
                d = 1.0 + aa * d
                if abs(d) < TINY:
                    d = TINY
                c = 1.0 + aa / c
                if abs(c) < TINY:
                    c = TINY
                d = 1.0 / d
                h *= d * c
                aa = -(a + m) * (qab + m) * x_val / ((a + m2) * (qap + m2))
                d = 1.0 + aa * d
                if abs(d) < TINY:
                    d = TINY
                c = 1.0 + aa / c
                if abs(c) < TINY:
                    c = TINY
                d = 1.0 / d
                delta = d * c
                h *= delta
                if abs(delta - 1.0) < EPS:
                    break
            return h

        if x_val < (a + 1.0) / (a + b + 2.0):
            return front * _cf()
        else:
            front2 = math.exp(math.log(1 - x_val) * b + math.log(x_val) * a - lbeta) / b
            return 1.0 - front2 * _cf_alt(b, a, 1 - x_val, MAX_ITER, EPS, TINY)

    def _cf_alt(a, b, x_val, MAX_ITER, EPS, TINY):
        qab = a + b
        qap = a + 1.0
        qam = a - 1.0
        c = 1.0
        d = 1.0 - qab * x_val / qap
        if abs(d) < TINY:
            d = TINY
        d = 1.0 / d
        h = d
        for m in range(1, MAX_ITER + 1):
            m2 = 2 * m
            aa = m * (b - m) * x_val / ((qam + m2) * (a + m2))
            d = 1.0 + aa * d
            if abs(d) < TINY:
                d = TINY
            c = 1.0 + aa / c
            if abs(c) < TINY:
                c = TINY
            d = 1.0 / d
            h *= d * c
            aa = -(a + m) * (qab + m) * x_val / ((a + m2) * (qap + m2))
            d = 1.0 + aa * d
            if abs(d) < TINY:
                d = TINY
            c = 1.0 + aa / c
            if abs(c) < TINY:
                c = TINY
            d = 1.0 / d
            delta = d * c
            h *= delta
            if abs(delta - 1.0) < EPS:
                break
        return h

    half_a = df / 2.0
    half_b = 0.5
    p_incomplete = _betainc(half_a, half_b, x)
    p_one_tail = p_incomplete / 2.0

    if t >= 0:
        return 1.0 - p_one_tail
    else:
        return p_one_tail


def welchs_p_value(values1: list, values2: list) -> tuple:
    """
    Compute Welch's t-test p-value (two-tailed) for two independent samples.

    Args:
        values1: List of floats for group 1.
        values2: List of floats for group 2.

    Returns:
        Tuple of (t_statistic, p_value, degrees_of_freedom).
    """
    n1, n2 = len(values1), len(values2)
    if n1 < 2 or n2 < 2:
        return (0.0, 1.0, 0.0)

    mean1 = statistics.mean(values1)
    mean2 = statistics.mean(values2)
    var1 = statistics.variance(values1)
    var2 = statistics.variance(values2)

    t = _welchs_t_statistic(mean1, mean2, var1, var2, n1, n2)
    df = _welchs_dof(var1, var2, n1, n2)

    if df <= 0:
        return (t, 1.0, df)

    # Two-tailed p-value
    cdf_val = _t_distribution_cdf(t, df)
    p = 2.0 * min(cdf_val, 1.0 - cdf_val)
    p = max(0.0, min(1.0, p))
    return (t, p, df)


def confidence_interval(values: list, confidence: float = 0.95) -> tuple:
    """
    Compute confidence interval for a list of values using t-distribution.

    Args:
        values: List of floats.
        confidence: Confidence level (e.g. 0.95).

    Returns:
        Tuple of (lower, upper).
    """
    n = len(values)
    if n < 2:
        m = values[0] if values else 0.0
        return (m, m)

    m = statistics.mean(values)
    se = statistics.stdev(values) / math.sqrt(n)

    # Approximate t* using normal approximation for large n,
    # or look up common values for small n.
    alpha = 1 - confidence
    if n >= 30:
        # Use normal z approximation
        t_star = _z_score(1 - alpha / 2)
    else:
        # Approximate t* via inverse CDF iteration
        t_star = _approx_t_star(n - 1, confidence)

    margin = t_star * se
    return (m - margin, m + margin)


def _z_score(p: float) -> float:
    """Rational approximation of the probit function (Abramowitz and Stegun 26.2.17)."""
    if p >= 1.0:
        return 10.0
    if p <= 0.0:
        return -10.0
    t = math.sqrt(-2.0 * math.log(min(p, 1 - p)))
    c0, c1, c2 = 2.515517, 0.802853, 0.010328
    d1, d2, d3 = 1.432788, 0.189269, 0.001308
    num = c0 + c1 * t + c2 * t ** 2
    den = 1 + d1 * t + d2 * t ** 2 + d3 * t ** 3
    z = t - num / den
    return z if p >= 0.5 else -z


def _approx_t_star(df: int, confidence: float) -> float:
    """Approximate t* for small df using bisection on the t-CDF."""
    target = 0.5 + confidence / 2
    lo, hi = 0.0, 50.0
    for _ in range(60):
        mid = (lo + hi) / 2
        cdf = _t_distribution_cdf(mid, float(df))
        if cdf < target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


# ---------------------------------------------------------------------------
# ABTestingLab
# ---------------------------------------------------------------------------

class ABTestingLab:
    """
    A/B Testing Laboratory.

    Create experiments, assign traffic to variants, record observations,
    and run Welch's t-test significance analysis using pure Python stdlib.

    Usage::

        lab = ABTestingLab()
        exp_id = lab.create_experiment("checkout_cta", "New CTA improves CVR", "conversion_rate")
        lab.add_variant(exp_id, "control", 50.0, {})
        lab.add_variant(exp_id, "treatment", 50.0, {"cta": "Buy Now"})
        lab.record_result(exp_id, "user-1", "control", 0)
        lab.record_result(exp_id, "user-2", "treatment", 1)
        result = lab.analyze(exp_id)
    """

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or DB_PATH
        import pathlib
        pathlib.Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS experiments (
                    id TEXT PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL,
                    hypothesis TEXT NOT NULL,
                    metric TEXT NOT NULL,
                    status TEXT DEFAULT 'draft',
                    start_dt TEXT,
                    end_dt TEXT,
                    min_sample INTEGER DEFAULT 100,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS variants (
                    id TEXT PRIMARY KEY,
                    exp_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    traffic_pct REAL DEFAULT 50.0,
                    config TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (exp_id) REFERENCES experiments(id),
                    UNIQUE(exp_id, name)
                );

                CREATE TABLE IF NOT EXISTS data_points (
                    id TEXT PRIMARY KEY,
                    variant_id TEXT NOT NULL,
                    value REAL NOT NULL,
                    user_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (variant_id) REFERENCES variants(id)
                );

                CREATE INDEX IF NOT EXISTS idx_variants_exp ON variants(exp_id);
                CREATE INDEX IF NOT EXISTS idx_dp_variant ON data_points(variant_id);
            """)
        logger.debug("DB initialized at %s", self.db_path)

    def create_experiment(
        self,
        name: str,
        hypothesis: str,
        metric: str,
        min_sample: int = 100,
    ) -> str:
        """Create a new A/B experiment.

        Args:
            name: Unique experiment name.
            hypothesis: What we're testing and why.
            metric: Primary metric to measure (e.g. 'conversion_rate').
            min_sample: Minimum samples per variant before analysis.

        Returns:
            Experiment ID.
        """
        exp = Experiment(
            id=str(uuid4()),
            name=name,
            hypothesis=hypothesis,
            metric=metric,
            min_sample=min_sample,
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO experiments (id, name, hypothesis, metric, status, min_sample, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (exp.id, exp.name, exp.hypothesis, exp.metric, exp.status, exp.min_sample, exp.created_at),
            )
        logger.info("Experiment created: %s (%s)", name, exp.id[:8])
        return exp.id

    def start_experiment(self, exp_id: str) -> None:
        """Start collecting data for an experiment."""
        with self._get_conn() as conn:
            conn.execute(
                "UPDATE experiments SET status=?, start_dt=? WHERE id=?",
                (STATUS_RUNNING, datetime.utcnow().isoformat(), exp_id),
            )
        logger.info("Experiment %s started.", exp_id[:8])

    def stop_experiment(self, exp_id: str) -> None:
        """Stop data collection."""
        with self._get_conn() as conn:
            conn.execute(
                "UPDATE experiments SET status=?, end_dt=? WHERE id=?",
                (STATUS_STOPPED, datetime.utcnow().isoformat(), exp_id),
            )

    def add_variant(
        self,
        exp_id: str,
        name: str,
        traffic_pct: float,
        config: Optional[dict] = None,
        description: str = "",
    ) -> Variant:
        """Add a variant to an experiment.

        Args:
            exp_id: Experiment ID.
            name: Variant name (e.g. 'control', 'treatment_a').
            traffic_pct: Percentage of traffic to receive (0–100).
            config: Configuration dict for the variant.
            description: Human-readable description.

        Returns:
            The created Variant.
        """
        variant = Variant(
            id=str(uuid4()),
            exp_id=exp_id,
            name=name,
            description=description,
            traffic_pct=traffic_pct,
            config=config or {},
        )
        with self._get_conn() as conn:
            conn.execute(
                """INSERT INTO variants (id, exp_id, name, description, traffic_pct, config, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    variant.id, variant.exp_id, variant.name, variant.description,
                    variant.traffic_pct, json.dumps(variant.config), variant.created_at,
                ),
            )
        logger.info("Variant '%s' added to experiment %s (%.0f%% traffic)", name, exp_id[:8], traffic_pct)
        return variant

    def _get_variant(self, exp_id: str, variant_name: str) -> Optional[Variant]:
        with self._get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM variants WHERE exp_id=? AND name=?",
                (exp_id, variant_name),
            ).fetchone()
        return Variant.from_row(row) if row else None

    def record_result(
        self,
        exp_id: str,
        user_id: str,
        variant_name: str,
        value: float,
    ) -> DataPoint:
        """Record a metric observation for a user.

        Args:
            exp_id: Experiment ID.
            user_id: User identifier (for dedup tracking).
            variant_name: Which variant the user saw.
            value: Measured metric value.

        Returns:
            The recorded DataPoint.
        """
        variant = self._get_variant(exp_id, variant_name)
        if not variant:
            raise ValueError(f"Variant '{variant_name}' not found in experiment {exp_id}")

        dp = DataPoint(
            id=str(uuid4()),
            variant_id=variant.id,
            value=value,
            user_id=user_id,
        )
        with self._get_conn() as conn:
            conn.execute(
                "INSERT INTO data_points (id, variant_id, value, user_id, timestamp) VALUES (?, ?, ?, ?, ?)",
                (dp.id, dp.variant_id, dp.value, dp.user_id, dp.timestamp),
            )
        return dp

    def _get_variant_values(self, variant_id: str) -> list:
        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT value FROM data_points WHERE variant_id=?", (variant_id,)
            ).fetchall()
        return [r["value"] for r in rows]

    def analyze(self, exp_id: str) -> dict:
        """Run statistical analysis on an experiment.

        Computes per-variant statistics and Welch's t-test between each
        pair of variants. Uses only Python stdlib (statistics, math).

        Args:
            exp_id: Experiment ID.

        Returns:
            Analysis dict with per-variant stats and pairwise comparisons.
        """
        with self._get_conn() as conn:
            exp_row = conn.execute("SELECT * FROM experiments WHERE id=?", (exp_id,)).fetchone()
            variant_rows = conn.execute(
                "SELECT * FROM variants WHERE exp_id=? ORDER BY created_at", (exp_id,)
            ).fetchall()

        if not exp_row:
            raise ValueError(f"Experiment {exp_id} not found.")

        exp = Experiment.from_row(exp_row)
        variants = [Variant.from_row(r) for r in variant_rows]

        variant_stats = []
        variant_values_map = {}

        for v in variants:
            values = self._get_variant_values(v.id)
            n = len(values)
            variant_values_map[v.name] = values

            if n >= 2:
                mean = statistics.mean(values)
                stdev = statistics.stdev(values)
                ci = confidence_interval(values)
                var_stat = {
                    "variant": v.name,
                    "n": n,
                    "mean": round(mean, 6),
                    "stdev": round(stdev, 6),
                    "min": min(values),
                    "max": max(values),
                    "ci_lower": round(ci[0], 6),
                    "ci_upper": round(ci[1], 6),
                    "traffic_pct": v.traffic_pct,
                }
            elif n == 1:
                var_stat = {
                    "variant": v.name,
                    "n": n,
                    "mean": values[0],
                    "stdev": 0.0,
                    "min": values[0],
                    "max": values[0],
                    "ci_lower": values[0],
                    "ci_upper": values[0],
                    "traffic_pct": v.traffic_pct,
                }
            else:
                var_stat = {
                    "variant": v.name,
                    "n": 0,
                    "mean": None,
                    "stdev": None,
                    "min": None,
                    "max": None,
                    "ci_lower": None,
                    "ci_upper": None,
                    "traffic_pct": v.traffic_pct,
                }
            variant_stats.append(var_stat)

        # Pairwise Welch's t-test comparisons
        comparisons = []
        variant_names = [v.name for v in variants]
        for i in range(len(variant_names)):
            for j in range(i + 1, len(variant_names)):
                va = variant_names[i]
                vb = variant_names[j]
                vals_a = variant_values_map.get(va, [])
                vals_b = variant_values_map.get(vb, [])
                if len(vals_a) >= 2 and len(vals_b) >= 2:
                    t_stat, p_val, df = welchs_p_value(vals_a, vals_b)
                    comparisons.append({
                        "variant_a": va,
                        "variant_b": vb,
                        "t_statistic": round(t_stat, 6),
                        "p_value": round(p_val, 6),
                        "degrees_of_freedom": round(df, 2),
                        "significant_at_0_05": p_val < 0.05,
                        "significant_at_0_01": p_val < 0.01,
                    })
                else:
                    comparisons.append({
                        "variant_a": va,
                        "variant_b": vb,
                        "t_statistic": None,
                        "p_value": None,
                        "degrees_of_freedom": None,
                        "significant_at_0_05": False,
                        "significant_at_0_01": False,
                        "note": "Insufficient data",
                    })

        return {
            "experiment": exp.name,
            "metric": exp.metric,
            "hypothesis": exp.hypothesis,
            "status": exp.status,
            "min_sample": exp.min_sample,
            "variants": variant_stats,
            "comparisons": comparisons,
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    def significance_check(self, exp_id: str, alpha: float = 0.05) -> dict:
        """Check if any comparison in an experiment is significant.

        Args:
            exp_id: Experiment ID.
            alpha: Significance level (default 0.05).

        Returns:
            Dict with is_significant, significant_pairs, alpha.
        """
        analysis = self.analyze(exp_id)
        significant_pairs = [
            c for c in analysis["comparisons"]
            if c.get("p_value") is not None and c["p_value"] < alpha
        ]
        return {
            "experiment": analysis["experiment"],
            "is_significant": len(significant_pairs) > 0,
            "alpha": alpha,
            "significant_pairs": significant_pairs,
            "total_comparisons": len(analysis["comparisons"]),
        }

    def winner(self, exp_id: str) -> dict:
        """Determine the winning variant (highest mean, if significant).

        Args:
            exp_id: Experiment ID.

        Returns:
            Dict with winner, mean, is_significant.
        """
        analysis = self.analyze(exp_id)
        variants_with_data = [v for v in analysis["variants"] if v["mean"] is not None]

        if not variants_with_data:
            return {"winner": None, "reason": "No data collected yet."}

        sig_check = self.significance_check(exp_id)
        best = max(variants_with_data, key=lambda v: v["mean"])

        return {
            "winner": best["variant"],
            "mean": best["mean"],
            "n": best["n"],
            "is_significant": sig_check["is_significant"],
            "confidence": "high" if sig_check["is_significant"] else "low",
            "note": "Result is statistically significant." if sig_check["is_significant"]
                    else "Result is NOT statistically significant. Collect more data.",
        }

    def list_experiments(self, status_filter: Optional[str] = None) -> list:
        """List all experiments."""
        with self._get_conn() as conn:
            if status_filter:
                rows = conn.execute(
                    "SELECT * FROM experiments WHERE status=? ORDER BY created_at DESC",
                    (status_filter,),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM experiments ORDER BY created_at DESC"
                ).fetchall()
        return [Experiment.from_row(r).to_dict() for r in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_create(args, lab: ABTestingLab) -> None:
    exp_id = lab.create_experiment(
        args.name, args.hypothesis, args.metric, min_sample=args.min_sample
    )
    print(f"✓ Experiment created: {exp_id}")
    lab.start_experiment(exp_id)
    print(f"  Status: running")


def cmd_add_variant(args, lab: ABTestingLab) -> None:
    config = json.loads(args.config) if args.config else {}
    variant = lab.add_variant(args.exp_id, args.name, args.pct, config, description=args.desc or "")
    print(f"✓ Variant '{args.name}' added ({args.pct}% traffic)")


def cmd_record(args, lab: ABTestingLab) -> None:
    dp = lab.record_result(args.exp_id, args.user_id, args.variant, float(args.value))
    print(f"✓ Recorded value={args.value} for user {args.user_id} in variant '{args.variant}'")


def cmd_analyze(args, lab: ABTestingLab) -> None:
    result = lab.analyze(args.exp_id)
    print(f"=== Analysis: {result['experiment']} ===")
    print(f"Metric: {result['metric']}")
    print(f"Hypothesis: {result['hypothesis']}")
    print("\nVariants:")
    for v in result["variants"]:
        ci = ""
        if v["ci_lower"] is not None:
            ci = f" CI=[{v['ci_lower']:.4f}, {v['ci_upper']:.4f}]"
        mean_str = f"{v['mean']:.4f}" if v["mean"] is not None else "N/A"
        print(f"  {v['variant']}: n={v['n']} mean={mean_str}{ci}")
    if result["comparisons"]:
        print("\nComparisons:")
        for c in result["comparisons"]:
            p = f"{c['p_value']:.4f}" if c["p_value"] is not None else "N/A"
            sig = "✓ SIGNIFICANT" if c.get("significant_at_0_05") else "✗ not significant"
            print(f"  {c['variant_a']} vs {c['variant_b']}: p={p} {sig}")


def cmd_check_significance(args, lab: ABTestingLab) -> None:
    result = lab.significance_check(args.exp_id, alpha=args.alpha)
    print(f"Experiment: {result['experiment']}")
    print(f"Significant at α={args.alpha}: {'YES ✓' if result['is_significant'] else 'NO ✗'}")
    if result["significant_pairs"]:
        for p in result["significant_pairs"]:
            print(f"  {p['variant_a']} vs {p['variant_b']}: p={p['p_value']:.4f}")


def cmd_winner(args, lab: ABTestingLab) -> None:
    result = lab.winner(args.exp_id)
    if result.get("winner"):
        print(f"Winner: {result['winner']} (mean={result['mean']:.4f}, n={result['n']})")
        print(f"  {result['note']}")
    else:
        print(f"No winner: {result.get('reason', 'unknown')}")


def cmd_ask(args, _lab: ABTestingLab) -> None:
    from ollama_router import route, OLLAMA_TRIGGERS
    text = args.prompt
    try:
        response = route(text, model=args.model or None, base_url=args.base_url or None)
        print(response)
    except ValueError as exc:
        triggers = ", ".join(f"@{t}" for t in sorted(OLLAMA_TRIGGERS))
        print(f"Error: {exc}\nSupported triggers: {triggers}")
    except Exception as exc:  # noqa: BLE001
        print(f"Ollama error: {exc}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="A/B Testing Lab")
    parser.add_argument("--db", help="Override database path")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("create", help="Create and start an experiment")
    p.add_argument("name", help="Experiment name")
    p.add_argument("hypothesis", help="Experiment hypothesis")
    p.add_argument("metric", help="Primary metric")
    p.add_argument("--min-sample", type=int, default=100)
    p.set_defaults(func=cmd_create)

    p = sub.add_parser("add-variant", help="Add a variant to an experiment")
    p.add_argument("exp_id", help="Experiment ID")
    p.add_argument("name", help="Variant name")
    p.add_argument("--pct", type=float, required=True, help="Traffic percentage")
    p.add_argument("--config", help="JSON config")
    p.add_argument("--desc", help="Description")
    p.set_defaults(func=cmd_add_variant)

    p = sub.add_parser("record", help="Record a result")
    p.add_argument("exp_id")
    p.add_argument("user_id")
    p.add_argument("variant")
    p.add_argument("value", type=float)
    p.set_defaults(func=cmd_record)

    p = sub.add_parser("analyze", help="Analyze an experiment")
    p.add_argument("exp_id")
    p.set_defaults(func=cmd_analyze)

    p = sub.add_parser("check-significance", help="Check statistical significance")
    p.add_argument("exp_id")
    p.add_argument("--alpha", type=float, default=0.05)
    p.set_defaults(func=cmd_check_significance)

    p = sub.add_parser("winner", help="Determine the winning variant")
    p.add_argument("exp_id")
    p.set_defaults(func=cmd_winner)

    p = sub.add_parser(
        "ask",
        help="Route a prompt to Ollama via @ollama / @copilot / @lucidia / @blackboxprogramming",
    )
    p.add_argument("prompt", help="Prompt text (must contain a trigger mention)")
    p.add_argument("--model", help="Ollama model name (default: llama3)")
    p.add_argument("--base-url", dest="base_url", help="Ollama server base URL (default: http://localhost:11434)")
    p.set_defaults(func=cmd_ask)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    lab = ABTestingLab(db_path=args.db)
    args.func(args, lab)


if __name__ == "__main__":
    main()
