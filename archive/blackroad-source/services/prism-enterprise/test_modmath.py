"""Tests for modular arithmetic utilities."""

from __future__ import annotations

import json
import math
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CLI_PATH = PROJECT_ROOT / "cli.py"

sys.path.insert(0, str(PROJECT_ROOT / "src"))


import pytest
from hypothesis import given, strategies as st

from modmath import MultiplicativeOrderError, modexp, multiplicative_order


def run_cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    """Execute the CLI with the provided arguments and return the process result."""

    return subprocess.run(
        [sys.executable, str(CLI_PATH), *args],
        check=False,
        capture_output=True,
        text=True,
    )


def test_modexp_matches_python_pow():
    assert modexp(7, 560, 561) == pow(7, 560, 561)
    assert modexp(2, 1024, 997) == pow(2, 1024, 997)


def test_modexp_handles_zero_and_one():
    assert modexp(0, 5, 13) == 0
    assert modexp(5, 0, 13) == 1
    assert modexp(1, 123456, 17) == 1


def test_multiplicative_order_basic_cases():
    assert multiplicative_order(2, 5) == 4
    assert multiplicative_order(4, 7) == 3
    assert multiplicative_order(10, 11) == 2


def test_multiplicative_order_requires_coprime_inputs():
    with pytest.raises(MultiplicativeOrderError):
        multiplicative_order(6, 21)


def test_multiplicative_order_respects_iteration_limit():
    with pytest.raises(MultiplicativeOrderError):
        multiplicative_order(2, 7, max_iter=2)


def test_cli_help_lists_subcommands():
    result = run_cli(["--help"])
    assert result.returncode == 0
    assert "modexp" in result.stdout
    assert "order" in result.stdout
    assert "bench" in result.stdout


def test_cli_modexp_plain_output():
    result = run_cli(["modexp", "--a", "7", "--e", "560", "--modulus", "561"])
    assert result.returncode == 0
    assert "561" not in result.stderr
    assert result.stdout.strip() == "1"


def test_cli_modexp_json_output():
    result = run_cli(
        [
            "modexp",
            "--a",
            "4",
            "--e",
            "13",
            "--modulus",
            "497",
            "--json",
        ]
    )
    assert result.returncode == 0
    payload = json.loads(result.stdout)
    assert payload["result"] == modexp(4, 13, 497)


def test_cli_order_handles_errors_gracefully():
    result = run_cli(["order", "--a", "6", "--modulus", "21"])
    assert result.returncode != 0
    assert "coprime" in result.stderr.lower()


def test_cli_bench_reports_runtime():
    result = run_cli(["bench", "--a", "7", "--e", "560", "--modulus", "561"])
    assert result.returncode == 0
    assert "iterations" in result.stdout.lower()


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for divisor in range(2, int(math.isqrt(n)) + 1):
        if n % divisor == 0:
            return False
    return True


@st.composite
def coprime_bases(draw: st.DrawFn) -> tuple[int, int, int]:
    prime_candidates = [p for p in range(3, 50) if is_prime(p)]
    p = draw(st.sampled_from(prime_candidates))
    q = draw(st.sampled_from([x for x in prime_candidates if x != p]))
    modulus = p * q
    base = draw(st.integers(min_value=2, max_value=modulus - 1).filter(lambda x: math.gcd(x, modulus) == 1))
    return base, p, q


@given(coprime_bases())
def test_modexp_euler_totient_property(data: tuple[int, int, int]):
    base, p, q = data
    modulus = p * q
    totient = (p - 1) * (q - 1)
    assert modexp(base, totient, modulus) == 1
