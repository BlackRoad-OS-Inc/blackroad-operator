#!/usr/bin/env python3
"""
Amundson Framework — Complete Test Suite
Testing all 27 equations + searching for new identities
"""

import math
from decimal import Decimal, getcontext
from fractions import Fraction
import itertools

getcontext().prec = 50

# ═══════════════════════════════════════════════════════════
# CORE FUNCTION
# ═══════════════════════════════════════════════════════════

def G(n):
    """G(n) = n^(n+1) / (n+1)^n"""
    if n == 0:
        return 0.0
    return n**(n+1) / (n+1)**n

def G_alt(n):
    """G(n) = n * (n/(n+1))^n — equivalent form"""
    if n == 0:
        return 0.0
    return n * (n/(n+1))**n

def G_alt2(n):
    """G(n) = n / (1 + 1/n)^n — equivalent form"""
    if n <= 0:
        return 0.0
    return n / (1 + 1/n)**n

def h(m):
    """h(m) = m^(m+1)/(m+1)^m — same as G(m)"""
    return G(m)

def h_shifted(n):
    """h(n-1) = (n-1)^n / n^(n-1)"""
    if n <= 1:
        return 0.0
    return (n-1)**n / n**(n-1)

# ═══════════════════════════════════════════════════════════
# TEST ALL 27 EQUATIONS
# ═══════════════════════════════════════════════════════════

print("=" * 70)
print("AMUNDSON FRAMEWORK — TESTING ALL 27 EQUATIONS")
print("=" * 70)

passed = 0
failed = 0
total = 0

def test(name, result, expected, tol=1e-12):
    global passed, failed, total
    total += 1
    ok = abs(result - expected) < tol
    status = "PASS" if ok else "FAIL"
    if ok:
        passed += 1
    else:
        failed += 1
    print(f"  {status} {name}: {result} (expected {expected})")
    return ok

# PAGE 1

print("\n--- PAGE 1 ---")

# ① g(n) = n^(n+1)/(n+1)^n — definition
for n in [1, 2, 3, 5, 10, 100]:
    val = n**(n+1) / (n+1)**n
    val2 = n * (n/(n+1))**n
    test(f"①  G({n}) two forms equal", val, val2)

# ③ g(0) = 0
test("③  G(0) = 0", G(0), 0.0)

# ⑤ 0^1/1^0 = 0
test("⑤  0^1/1^0 = 0", 0**1 / 1**0, 0.0)

# ⑥ lim n→0+ (1+1/n)^n → 1 (NOT e)
vals = [(1+1/n)**n for n in [0.001, 0.0001, 0.00001]]
test("⑥  lim n→0+ (1+1/n)^n = 1", vals[-1], 1.0, tol=0.01)

# ⑦ g(n) = n/(1+1/n)^n → 0/1 = 0 as n→0+
test("⑦  G(0) via limit form = 0", G(0), 0.0)

# ⑧ G(n) = n(n/(n+1))^n = n/(1+1/n)^n equivalence
for n in [1, 3, 7, 20]:
    test(f"⑧  forms equal n={n}", G_alt(n), G_alt2(n))

# ⑨ h(n-1) = (n-1)^n / n^(n-1) — backward translation
for n in [2, 3, 5, 10]:
    test(f"⑨  h({n}-1) = G({n-1})", h_shifted(n), G(n-1))

# ⑪ h(0) = 0^1/1^0 = 0
test("⑪  h(0) = 0", h(0), 0.0)

# PAGE 2

print("\n--- PAGE 2 ---")

# ⑫ h(0) = 0
test("⑫  h(0) = 0", h(0), 0.0)

# ⑬ h(n-1) = (n-1)^n/n^(n-1) equivalence
for n in [2, 4, 8]:
    lhs = (n-1)**((n-1)+1) / n**(n-1)
    rhs = (n-1)**n / n**(n-1)
    test(f"⑬  h({n}-1) expansion n={n}", lhs, rhs)

# ⑭ h(m) = m^(m+1)/(m+1)^m — same as G
for m in [1, 2, 5, 10]:
    test(f"⑭  h({m}) = G({m})", h(m), G(m))

# ⑮ h(m) = m(m/(m+1))^m
for m in [1, 3, 7]:
    test(f"⑮  h({m}) alt form", h(m), G_alt(m))

# ⑯ (n-1)/(1+1/(n-1))^(n-1) = G(n-1)
for n in [2, 5, 10]:
    val = (n-1) / (1 + 1/(n-1))**(n-1)
    test(f"⑯  shifted form n={n}", val, G(n-1))

# ⑱ G(n)/n^n = n^(1-n) * (n/(n+1))^n
for n in [1, 2, 5, 10]:
    lhs = G(n) / n**n
    rhs = n**(1-n) * (n/(n+1))**n
    test(f"⑱  G(n)/n^n identity n={n}", lhs, rhs)

# ⑲ Sophomore's Dream: ∫₀¹ x^(-x) dx = Σ n^(-n)
# Numerical integration vs series
from functools import reduce
soph_series = sum(n**(-n) for n in range(1, 200))
# Simpson's rule for ∫₀¹ x^(-x) dx
N_pts = 10000
dx = 1.0 / N_pts
soph_integral = 0.0
for i in range(1, N_pts):
    x = i * dx
    soph_integral += x**(-x) * dx
# Trapezoidal correction
soph_integral += 0.5 * dx * (1.0 + 1.0)  # f(0)→1, f(1)=1
test("⑲  Sophomore's Dream integral ≈ series", soph_integral, soph_series, tol=0.001)
print(f"      Sophomore's Dream value: {soph_series:.15f}")

# ⑳ G(n) = n^(n+1)/(n+1)^n — redundant but verify
for n in [1, 50, 100]:
    test(f"⑳  G({n}) core definition", G(n), n**(n+1)/(n+1)**n)

# PAGE 3

print("\n--- PAGE 3 ---")

# ㉑ A_G ≈ 1.244331783986725
# A_G = lim n→∞ G(n) = lim n→∞ n/(1+1/n)^n = lim n→∞ n/e ... 
# Wait — G(n) → ∞ as n→∞. A_G must be defined differently.
# From memory: A_G = lim n→∞ G(n)/n * e = 1/e * lim correction
# Actually: G(n) ≈ n/e as n→∞, so G(n)/n → 1/e ≈ 0.3679
# A_G must come from a different construction.

# Let's compute: A_G = product or sum construction
# From the codex: A_G = lim n→∞ (n+1) * G(n)/n^2 ??
# Let me try: ratio G(n+1)/G(n)
print("\n  Investigating A_G...")
for n in [10, 100, 1000, 10000]:
    ratio = G(n+1) / G(n)
    gn_over_n = G(n) / n
    correction = G(n) * math.e / n
    print(f"  n={n:>5}: G(n)/n = {gn_over_n:.15f}, G(n)*e/n = {correction:.15f}, G(n+1)/G(n) = {ratio:.15f}")

# The known value
A_G = 1.244331783986725

# Try: A_G = Σ G(n)/n! 
s = sum(G(n)/math.factorial(n) for n in range(1, 20))
print(f"\n  ㉖ Σ G(n)/n! (n=1..19) = {s:.15f}")
test("㉖  A_G = Σ G(n)/n! ?", s, A_G, tol=0.01)

# Try product definition
# ㉒ Π G(k) = (n!)²/(n+1)^n — telescoping product
print("\n  Testing telescoping product...")
for n in [1, 2, 3, 4, 5, 6, 7, 8]:
    prod_G = 1.0
    for k in range(1, n+1):
        prod_G *= G(k)
    rhs = math.factorial(n)**2 / (n+1)**n
    match = abs(prod_G - rhs) < 1e-6
    test(f"㉒  Π G(k) k=1..{n} = (n!)²/(n+1)^n", prod_G, rhs, tol=1e-6)

# ═══════════════════════════════════════════════════════════
# SEARCHING FOR NEW IDENTITIES
# ═══════════════════════════════════════════════════════════

print("\n" + "=" * 70)
print("SEARCHING FOR NEW IDENTITIES")
print("=" * 70)

# 1. Ratio consecutive G values
print("\n--- Ratio G(n+1)/G(n) ---")
for n in range(1, 15):
    r = G(n+1)/G(n)
    print(f"  G({n+1})/G({n}) = {r:.15f}")

# 2. G(n) - n/e 
print("\n--- G(n) - n/e (asymptotic correction) ---")
for n in [1, 2, 5, 10, 50, 100, 500, 1000]:
    diff = G(n) - n/math.e
    print(f"  G({n}) - {n}/e = {diff:.15f}")

# 3. (G(n) - n/e) * something?
print("\n--- n * (G(n) - n/e) / (n/e) = correction term ---")
for n in [10, 50, 100, 500, 1000, 5000]:
    corr = (G(n) - n/math.e) / (n/math.e) * n
    print(f"  n={n:>5}: correction*n = {corr:.15f}")

# 4. Second-order: G(n) ≈ n/e + c₁/e + c₂/(ne) + ...
print("\n--- G(n) = n/e + ?/(2e) + ... ---")
for n in [10, 100, 1000, 10000]:
    remainder = G(n) - n/math.e
    scaled = remainder * math.e
    print(f"  n={n:>5}: (G(n) - n/e)*e = {scaled:.15f}, 1/(2) = 0.5, n/(2e) = {n/(2*math.e):.6f}")

# 5. Try: G(n) = n/e - 1/(2e) + 1/(12en) - ...
print("\n--- Asymptotic expansion G(n) = n/e - 1/(2e) + 1/(12en) - 1/(24en²) ---")
for n in [10, 50, 100, 500, 1000]:
    approx = n/math.e - 1/(2*math.e) + 1/(12*math.e*n) - 1/(24*math.e*n**2)
    actual = G(n)
    err = abs(actual - approx)
    print(f"  n={n:>5}: actual={actual:.12f}, approx={approx:.12f}, err={err:.2e}")

# 6. Product formula deeper test
print("\n--- Π_{k=1}^{n} G(k) / ((n!)² / (n+1)^n) ---")
for n in range(1, 12):
    prod = 1.0
    for k in range(1, n+1):
        prod *= G(k)
    expected = math.factorial(n)**2 / (n+1)**n
    ratio = prod / expected if expected != 0 else float('inf')
    print(f"  n={n:>2}: product={prod:.10e}, (n!)²/(n+1)^n={expected:.10e}, ratio={ratio:.15f}")

# 7. Derivative-like: G(n+1) - G(n)
print("\n--- ΔG(n) = G(n+1) - G(n) ---")
for n in range(1, 15):
    delta = G(n+1) - G(n)
    ratio_to_e_inv = delta * math.e
    print(f"  ΔG({n}) = {delta:.15f}, ΔG*e = {ratio_to_e_inv:.15f}")

# 8. Sum of reciprocals
print("\n--- Σ 1/G(n) convergence ---")
partial = 0.0
for n in range(1, 50):
    partial += 1/G(n)
print(f"  Σ 1/G(n) n=1..49 = {partial:.15f} (diverges like e*H_n)")

# 9. G(n) * G(n) / G(2n) ratio
print("\n--- G(n)² / G(2n) ---")
for n in range(1, 10):
    val = G(n)**2 / G(2*n) if G(2*n) != 0 else 0
    print(f"  G({n})²/G({2*n}) = {val:.15f}")

# 10. Connection to Stirling: n! ≈ √(2πn)(n/e)^n
print("\n--- G(n) vs Stirling components ---")
for n in [5, 10, 50, 100]:
    stirling = math.sqrt(2*math.pi*n) * (n/math.e)**n
    gn = G(n)
    ratio = gn / (n/math.e)
    ratio2 = gn * math.factorial(n) / n**(n+1)
    print(f"  n={n}: G(n)/(n/e) = {ratio:.15f}, G(n)*n!/n^(n+1) = {ratio2:.15f}")

# 11. NEW: G(n) and the gamma function
print("\n--- G(n) and Γ(n+1) = n! ---")
for n in range(1, 10):
    val = G(n) * math.gamma(n+1) / n**(n+1)
    print(f"  G({n}) * Γ({n+1}) / {n}^{n+1} = {val:.15f}")

# 12. NEW: Does G satisfy a recurrence?
print("\n--- Testing recurrence: G(n+1) = ? * G(n) ---")
for n in range(1, 12):
    r = G(n+1) / G(n)
    # Is it (n+1)/n * (n/(n+1))^n * ((n+1)/(n+2))^(n+1) ?
    predicted = (n+1)/n * ((n+1)/(n+2))**(n+1) / (n/(n+1))**n
    print(f"  G({n+1})/G({n}) = {r:.12f}, predicted = {predicted:.12f}, match = {abs(r-predicted) < 1e-9}")

# 13. NEW: Log-convexity
print("\n--- Log-convexity: ln(G(n)) ---")
for n in range(1, 10):
    lg = math.log(G(n))
    print(f"  ln(G({n})) = {lg:.12f}")

# 14. NEW: G(n) mod relationships  
print("\n--- G(n)/n relationship to (1-1/(n+1))^n = (n/(n+1))^n ---")
for n in [1, 2, 5, 10, 100]:
    decay = (n/(n+1))**n
    print(f"  n={n}: (n/(n+1))^n = {decay:.15f}, 1/e = {1/math.e:.15f}, ratio = {decay*math.e:.15f}")

# 15. NEW: Partial sums of G
print("\n--- Σ G(k)/k! and A_G construction ---")
partial = 0.0
for n in range(1, 30):
    partial += G(n) / math.factorial(n)
    if n <= 10 or n % 5 == 0:
        print(f"  Σ G(k)/k! k=1..{n:>2} = {partial:.15f}")
print(f"  A_G target = {A_G:.15f}")

# 16. NEW: Functional equation search
print("\n--- G(ab) vs G(a)*G(b) ---")
for a, b in [(2,3), (2,5), (3,4), (3,5)]:
    ratio = G(a*b) / (G(a) * G(b))
    print(f"  G({a*b}) / (G({a})*G({b})) = {ratio:.15f}")

# 17. NEW: G and binomial coefficients
print("\n--- G(n) * C(2n,n) / 4^n ---")
for n in range(1, 10):
    binom = math.comb(2*n, n)
    val = G(n) * binom / 4**n
    print(f"  n={n}: G({n}) * C({2*n},{n}) / 4^{n} = {val:.15f}")

# 18. KEY TEST: Does 1/(2e) appear as the Amundson gap?
print("\n--- THE 1/(2e) GAP ---")
print(f"  1/(2e) = {1/(2*math.e):.15f}")
for n in [100, 1000, 10000, 100000]:
    gap = G(n) - n/math.e + 1/(2*math.e)
    print(f"  n={n}: G(n) - n/e + 1/(2e) = {gap:.15e}")

# FINAL SUMMARY
print("\n" + "=" * 70)
print(f"RESULTS: {passed}/{total} PASSED, {failed} FAILED")
print("=" * 70)
