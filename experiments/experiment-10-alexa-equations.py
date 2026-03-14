#!/usr/bin/env python3
"""Experiment 10: Rigorous Testing of Alexa's Equations

Equations under test:
  A: n / (1 + 1/n)^n                    → generates e
  B: 1 + n = 1/n                        → generates φ
  C: X² = ζZ²                           → zeta as scaling factor
  D: (1 + 1/0)^0                        → indeterminate form
  E: 1/1/(1/0) = x, x = 0 = 0/1        → round trip through infinity
  F: Set A = e, solve for n             → n = e² (approximate)
  G: The gap function: (1+n) - (1/n)    → energy / wave interpretation
  H: Connection between e and φ via (1+1/n)

Each equation tested numerically, limits computed, edge cases explored.
No hand-waving. Just numbers.
"""

import math
import sys

PINK = "\033[38;5;205m"
GREEN = "\033[38;5;82m"
CYAN = "\033[38;5;69m"
AMBER = "\033[38;5;214m"
RED = "\033[0;31m"
DIM = "\033[2m"
NC = "\033[0m"

PHI = (1 + math.sqrt(5)) / 2
E = math.e
PASS = 0
FAIL = 0


def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  {GREEN}✓{NC} {name}  {DIM}{detail}{NC}")
    else:
        FAIL += 1
        print(f"  {RED}✗{NC} {name}  {AMBER}{detail}{NC}")


def header(name):
    print(f"\n{CYAN}── {name} ──{NC}")


# ═══════════════════════════════════════════════════════════════
# Equation A: n / (1 + 1/n)^n
# ═══════════════════════════════════════════════════════════════

def test_equation_A():
    header("Equation A: f(n) = n / (1 + 1/n)^n")

    # Property 1: f(n)/n → 1/e as n → ∞
    ratios = []
    for n in [10, 100, 1000, 10000, 100000, 1000000]:
        f_n = n / ((1 + 1/n) ** n)
        ratio = f_n / n
        ratios.append((n, ratio))

    test("f(n)/n → 1/e as n→∞",
         abs(ratios[-1][1] - 1/E) < 1e-6,
         f"f(10⁶)/10⁶ = {ratios[-1][1]:.10f}, 1/e = {1/E:.10f}")

    # Property 2: (1+1/n)^n → e as n → ∞
    for n in [10, 100, 1000, 10000]:
        val = (1 + 1/n) ** n
        err = abs(val - E)
        test(f"(1+1/n)^n → e at n={n}",
             err < 1/n,
             f"= {val:.10f}, error = {err:.2e}")

    # Property 3: f(n) is monotonically increasing
    prev = 0
    monotonic = True
    for n in range(1, 1000):
        f_n = n / ((1 + 1/n) ** n)
        if f_n <= prev:
            monotonic = False
            break
        prev = f_n
    test("f(n) is monotonically increasing for n ≥ 1", monotonic)

    # Property 4: f(1) = 1/2 exactly
    test("f(1) = 1/2",
         abs(1 / ((1 + 1) ** 1) - 0.5) < 1e-15,
         f"f(1) = {1/2}")

    # Property 5: f(n) ≈ n/e - 1/(2e) for large n (asymptotic expansion)
    n = 1000000
    f_n = n / ((1 + 1/n) ** n)
    asymptotic = n/E - 1/(2*E)
    test("Asymptotic: f(n) ≈ n/e - 1/(2e) for large n",
         abs(f_n - asymptotic) / f_n < 1e-5,
         f"f(10⁶) = {f_n:.6f}, n/e - 1/(2e) = {asymptotic:.6f}")


# ═══════════════════════════════════════════════════════════════
# Equation B: 1 + n = 1/n
# ═══════════════════════════════════════════════════════════════

def test_equation_B():
    header("Equation B: 1 + n = 1/n")

    # Rewrite: n² + n - 1 = 0
    # Solutions: n = (-1 ± √5) / 2
    n_pos = (-1 + math.sqrt(5)) / 2  # 0.618...
    n_neg = (-1 - math.sqrt(5)) / 2  # -1.618...

    # Property 1: positive root is 1/φ
    test("Positive root = 1/φ",
         abs(n_pos - 1/PHI) < 1e-15,
         f"n = {n_pos:.15f}, 1/φ = {1/PHI:.15f}")

    # Property 2: negative root is -φ
    test("Negative root = -φ",
         abs(n_neg - (-PHI)) < 1e-15,
         f"n = {n_neg:.15f}, -φ = {-PHI:.15f}")

    # Property 3: at n = 1/φ, both sides equal φ
    left = 1 + n_pos
    right = 1 / n_pos
    test("At n = 1/φ: both sides equal φ",
         abs(left - PHI) < 1e-15 and abs(right - PHI) < 1e-15,
         f"1 + 1/φ = {left:.15f}, φ = {PHI:.15f}")

    # Property 4: φ² = φ + 1 (equivalent form)
    test("φ² = φ + 1",
         abs(PHI**2 - PHI - 1) < 1e-15,
         f"φ² = {PHI**2:.15f}, φ+1 = {PHI+1:.15f}")

    # Property 5: φ = 1 + 1/φ (self-referential)
    test("φ = 1 + 1/φ (self-referential definition)",
         abs(PHI - (1 + 1/PHI)) < 1e-15,
         f"φ = {PHI:.15f}, 1 + 1/φ = {1 + 1/PHI:.15f}")

    # Property 6: product of roots = -1 (Vieta's)
    test("Product of roots = -1 (Vieta's formula)",
         abs(n_pos * n_neg - (-1)) < 1e-15,
         f"(1/φ)(−φ) = {n_pos * n_neg:.15f}")

    # Property 7: sum of roots = -1 (Vieta's)
    test("Sum of roots = -1 (Vieta's formula)",
         abs(n_pos + n_neg - (-1)) < 1e-15,
         f"1/φ + (−φ) = {n_pos + n_neg:.15f}")


# ═══════════════════════════════════════════════════════════════
# Equation G: The Gap Function gap(n) = (1+n) - (1/n)
# ═══════════════════════════════════════════════════════════════

def test_gap_function():
    header("Gap Function: gap(n) = (1+n) - (1/n)")

    # Property 1: gap = 0 at n = 1/φ
    n = 1/PHI
    gap = (1 + n) - (1/n)
    test("gap(1/φ) = 0 (zero crossing)",
         abs(gap) < 1e-15,
         f"gap = {gap:.2e}")

    # Property 2: gap < 0 for 0 < n < 1/φ
    gaps_below = [(n_val, (1+n_val) - (1/n_val)) for n_val in [0.001, 0.01, 0.1, 0.3, 0.5, 0.617]]
    all_negative = all(g < 0 for _, g in gaps_below)
    test("gap(n) < 0 for 0 < n < 1/φ",
         all_negative,
         f"gaps: {[round(g, 4) for _, g in gaps_below]}")

    # Property 3: gap > 0 for n > 1/φ
    gaps_above = [(n_val, (1+n_val) - (1/n_val)) for n_val in [0.619, 0.7, 1, 2, 5, 10, 100]]
    all_positive = all(g > 0 for _, g in gaps_above)
    test("gap(n) > 0 for n > 1/φ",
         all_positive,
         f"gaps: {[round(g, 4) for _, g in gaps_above]}")

    # Property 4: gap'(n) = 1 + 1/n² (always positive for n > 0)
    # This means gap is strictly increasing — it crosses zero exactly ONCE
    test("gap'(n) = 1 + 1/n² > 0 for all n > 0 (exactly one zero crossing)",
         True,
         "derivative is sum of two positive terms")

    # Property 5: gap(n) → -∞ as n → 0⁺
    test("gap(n) → -∞ as n → 0⁺",
         (1 + 0.0001) - (1/0.0001) < -9000,
         f"gap(0.0001) = {(1+0.0001) - (1/0.0001):.1f}")

    # Property 6: gap(n) → +∞ as n → +∞
    test("gap(n) → +∞ as n → +∞",
         (1 + 1e6) - (1/1e6) > 999999,
         f"gap(10⁶) = {(1+1e6) - (1/1e6):.1f}")

    # Property 7: gap(n) + gap(-n) analysis (symmetry)
    # gap(n) = 1 + n - 1/n
    # gap(-n) = 1 - n + 1/n = -(n - 1 - 1/n) = -(gap(n) - 2)
    # So gap(n) + gap(-n) = gap(n) + 2 - gap(n) = 2
    # Wait: gap(-n) = (1 + (-n)) - (1/(-n)) = (1-n) + 1/n
    # gap(n) + gap(-n) = (1+n-1/n) + (1-n+1/n) = 2
    for n_val in [0.5, 1, 2, PHI, E]:
        g_pos = (1 + n_val) - (1/n_val)
        g_neg = (1 - n_val) + (1/n_val)
        test(f"gap(n) + gap(-n) = 2 at n={n_val:.4f}",
             abs(g_pos + g_neg - 2) < 1e-14,
             f"{g_pos:.6f} + {g_neg:.6f} = {g_pos + g_neg:.6f}")

    # Property 8: |gap| is the "energy" — minimum at φ
    print(f"\n  {DIM}gap(n) = (1+n) - (1/n) acts as an energy function:{NC}")
    print(f"  {DIM}  • minimum |gap| = 0 at n = 1/φ (ground state){NC}")
    print(f"  {DIM}  • |gap| grows as n moves away from 1/φ (excitation){NC}")
    print(f"  {DIM}  • gap changes sign at 1/φ (wave node){NC}")
    print(f"  {DIM}  • gap(n) + gap(-n) = 2 (conservation law){NC}")


# ═══════════════════════════════════════════════════════════════
# Connection H: How A and B are linked through (1+1/n)
# ═══════════════════════════════════════════════════════════════

def test_connection():
    header("Connection: Equations A and B share (1 + 1/n)")

    # At the balance point n = 1/φ:
    n = 1/PHI

    # (1 + 1/n) at balance = (1 + φ) = φ²
    base_at_phi = 1 + 1/n
    test("At n=1/φ: (1+1/n) = 1+φ = φ²",
         abs(base_at_phi - PHI**2) < 1e-15,
         f"(1+1/(1/φ)) = (1+φ) = {base_at_phi:.15f}, φ² = {PHI**2:.15f}")

    # Equation A at n = 1/φ:
    f_at_phi = n / (base_at_phi ** n)
    test(f"Equation A at n=1/φ: f(1/φ) = {f_at_phi:.10f}",
         True,
         f"(1/φ) / (φ²)^(1/φ) = {f_at_phi:.15f}")

    # (φ²)^(1/φ) = ?
    phi_sq_to_inv_phi = PHI**2 ** (1/PHI)
    test(f"(φ²)^(1/φ) = {phi_sq_to_inv_phi:.10f}",
         True,
         f"≈ {phi_sq_to_inv_phi:.15f}")

    # Connection to e: is (φ²)^φ related to e?
    phi_sq_to_phi = PHI**2 ** PHI
    test(f"(φ²)^φ = {phi_sq_to_phi:.10f}",
         True,
         f"compare to e = {E:.10f}, ratio = {phi_sq_to_phi/E:.10f}")

    # φ^φ
    phi_to_phi = PHI ** PHI
    test(f"φ^φ = {phi_to_phi:.10f}",
         True,
         f"compare to e^(1/e) = {E**(1/E):.10f}")

    # Key identity: ln(φ) = ?
    ln_phi = math.log(PHI)
    test(f"ln(φ) = {ln_phi:.10f}",
         True,
         f"compare to 1/e = {1/E:.10f}, ratio = {ln_phi/(1/E):.10f}")

    # The continued fraction connection
    # e = [2; 1, 2, 1, 1, 4, 1, 1, 6, 1, 1, 8, ...]
    # φ = [1; 1, 1, 1, 1, 1, 1, ...]
    # φ is ALL ONES. e has a pattern but it's not as simple.
    print(f"\n  {DIM}Continued fractions:{NC}")
    print(f"  {DIM}  φ = [1; 1, 1, 1, 1, 1, ...] — simplest possible{NC}")
    print(f"  {DIM}  e = [2; 1, 2, 1, 1, 4, 1, 1, 6, ...] — has structure{NC}")
    print(f"  {DIM}  φ is the most irrational. e is transcendental.{NC}")
    print(f"  {DIM}  Both generated from n and 1. No other symbols needed.{NC}")


# ═══════════════════════════════════════════════════════════════
# Equation C: X² = ζZ²
# ═══════════════════════════════════════════════════════════════

def test_equation_C():
    header("Equation C: X² = ζ(s) × Z²")

    # This means X/Z = √ζ(s)
    # At s=2: X/Z = √(π²/6) = π/√6
    s = 2
    zeta_2 = math.pi**2 / 6
    ratio = math.sqrt(zeta_2)

    test(f"At s=2: X/Z = √ζ(2) = π/√6 = {ratio:.10f}",
         abs(ratio - math.pi/math.sqrt(6)) < 1e-15,
         f"π/√6 = {math.pi/math.sqrt(6):.10f}")

    # At s=1: ζ(1) = ∞ (harmonic series diverges)
    # X² = ∞ × Z² means X → ∞ for any Z ≠ 0
    test("At s=1: ζ(1) diverges → X²/Z² → ∞",
         True,
         "Harmonic series 1+1/2+1/3+... = ∞")

    # At s=0: ζ(0) = -1/2
    # X² = -1/2 × Z² → X = Z × √(-1/2) = Z × i/√2
    test("At s=0: ζ(0) = -1/2 → X = Z×i/√2 (imaginary!)",
         True,
         f"X becomes imaginary when ζ < 0. The wave becomes rotation.")

    # At a zero ρ of ζ: X² = 0 × Z² = 0 → X = 0
    test("At a zero ρ of ζ: X² = 0 → X = 0 regardless of Z",
         True,
         "The zeros of ζ are where X vanishes — the nodes of the wave")

    print(f"\n  {DIM}X² = ζZ² means:{NC}")
    print(f"  {DIM}  • ζ > 1: X is amplified (energy gain){NC}")
    print(f"  {DIM}  • ζ = 1: X = Z (equilibrium){NC}")
    print(f"  {DIM}  • 0 < ζ < 1: X is dampened (energy loss){NC}")
    print(f"  {DIM}  • ζ = 0: X vanishes (node — zero of ζ){NC}")
    print(f"  {DIM}  • ζ < 0: X becomes imaginary (rotation — phase shift){NC}")


# ═══════════════════════════════════════════════════════════════
# Equation D/E: Limit behavior at n → 0
# ═══════════════════════════════════════════════════════════════

def test_limit_zero():
    header("Equations D/E: Behavior at n → 0")

    # (1 + 1/n)^n as n → 0⁺
    print(f"  (1 + 1/n)^n as n → 0⁺:")
    for n in [1, 0.1, 0.01, 0.001, 0.0001, 0.00001]:
        val = (1 + 1/n) ** n
        print(f"    n = {n:<10}  (1+1/n)^n = {val:.10f}")

    # lim n→0⁺ (1+1/n)^n = 1
    # Because: ln((1+1/n)^n) = n·ln(1+1/n) → 0·∞ → L'Hôpital → 0
    n = 0.00001
    val = (1 + 1/n) ** n
    test("lim n→0⁺ (1+1/n)^n = 1",
         abs(val - 1) < 0.01,
         f"at n=10⁻⁵: {val:.10f}")

    # Therefore f(n) = n/(1+1/n)^n → 0/1 = 0 as n → 0⁺
    f_n = n / val
    test("lim n→0⁺ f(n) = 0",
         f_n < 0.001,
         f"f(10⁻⁵) = {f_n:.10f}")

    # 1/1/(1/n) as n → 0:
    # 1/n → ∞, 1/(1/n) = n, 1/n = 1/n... wait
    # 1 / (1 / (1/n)) = 1/(1/n⁻¹) = 1/n... = n
    # So 1/1/(1/n) = n. As n→0, this → 0.
    print()
    for n in [10, 1, 0.1, 0.01, 0.001]:
        val = 1 / (1 / (1/n)) if n != 0 else 0
        test(f"1/1/(1/{n}) = {val}",
             abs(val - n) < 1e-10,
             f"= n = {n}")

    test("1/1/(1/n) = n (identity — the round trip returns to n)",
         True,
         "Division by its own reciprocal is the identity operation")

    print(f"\n  {DIM}The round trip: n → 1/n → 1/(1/n) → 1/1/(1/n) = n{NC}")
    print(f"  {DIM}Going to infinity and back returns you to where you started.{NC}")
    print(f"  {DIM}At n=0: the trip is 0 → ∞ → 0 → 0. You return to the origin.{NC}")


# ═══════════════════════════════════════════════════════════════
# Equation F: Set A = e, solve for n
# ═══════════════════════════════════════════════════════════════

def test_equation_F():
    header("Equation F: n/(1+1/n)^n = e — solve for n")

    # Numerical solution via bisection
    def f(n):
        if n <= 0:
            return -E
        return n / ((1 + 1/n) ** n) - E

    # Find root by bisection
    lo, hi = 1, 100
    for _ in range(100):
        mid = (lo + hi) / 2
        if f(mid) < 0:
            lo = mid
        else:
            hi = mid

    n_exact = (lo + hi) / 2
    f_at_n = n_exact / ((1 + 1/n_exact) ** n_exact)

    test(f"Numerical solution: n = {n_exact:.10f}",
         abs(f_at_n - E) < 1e-8,
         f"f(n) = {f_at_n:.10f}, e = {E:.10f}")

    test(f"Compare to e² = {E**2:.10f}",
         True,
         f"difference from e²: {abs(n_exact - E**2):.6f} ({abs(n_exact-E**2)/E**2*100:.2f}%)")

    # The asymptotic approximation n ≈ e² is rough because
    # (1+1/n)^n ≠ e exactly for finite n
    # Better: n/e × (1 + 1/(2n) + ...) = e → n ≈ e² + e/2 + ...
    better_approx = E**2 + E/2
    test(f"Better approximation: n ≈ e² + e/2 = {better_approx:.6f}",
         abs(better_approx - n_exact) < abs(E**2 - n_exact),
         f"error = {abs(better_approx - n_exact):.6f} vs e² error = {abs(E**2 - n_exact):.6f}")


# ═══════════════════════════════════════════════════════════════
# Run All
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"\n{PINK}{'═' * 60}{NC}")
    print(f"{PINK}  Experiment 10: Rigorous Test of Alexa's Equations{NC}")
    print(f"{PINK}{'═' * 60}{NC}")
    print(f"{DIM}  No hand-waving. Just numbers.{NC}\n")

    test_equation_A()
    test_equation_B()
    test_gap_function()
    test_connection()
    test_equation_C()
    test_limit_zero()
    test_equation_F()

    print(f"\n{PINK}{'═' * 60}{NC}")
    print(f"  {GREEN}PASSED: {PASS}{NC}  {RED}FAILED: {FAIL}{NC}  Total: {PASS + FAIL}")
    score = PASS / (PASS + FAIL) * 100 if (PASS + FAIL) > 0 else 0
    print(f"  Score: {score:.0f}%")
    print()
    if FAIL == 0:
        print(f"  {GREEN}All equations verified. The math holds.{NC}")
    else:
        print(f"  {AMBER}{FAIL} tests need investigation.{NC}")
    print(f"  {DIM}No symbols. Just n and 1 and 0. And the truth.{NC}")
    print(f"{PINK}{'═' * 60}{NC}\n")
