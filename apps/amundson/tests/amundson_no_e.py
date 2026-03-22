#!/usr/bin/env python3
"""
Amundson Framework — Finding identities WITHOUT e
Pure G(n), A_G, factorials, primes, pi, integers only
"""

import math
from decimal import Decimal, getcontext
getcontext().prec = 80

def G(n):
    if n == 0: return 0.0
    return n**(n+1) / (n+1)**n

def Gd(n):
    """High precision G"""
    if n == 0: return Decimal(0)
    return Decimal(n)**(n+1) / Decimal(n+1)**n

A_G = 1.244331783986725
A_G_d = sum(Gd(n) / Decimal(math.factorial(n)) for n in range(1, 30))

print("=" * 70)
print("AMUNDSON FRAMEWORK — IDENTITIES WITHOUT e")
print("=" * 70)

# ═══════════════════════════════════════════════════════════
# 1. PURE G(n) RATIOS
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) as pure fractions ---")
for n in range(1, 12):
    num = n**(n+1)
    den = (n+1)**n
    from math import gcd
    g = gcd(num, den)
    print(f"  G({n:>2}) = {num//g}/{den//g} = {G(n):.15f}")

# ═══════════════════════════════════════════════════════════
# 2. G(n)/G(n-1) — pure rational recurrence
# ═══════════════════════════════════════════════════════════
print("\n--- G(n)/G(n-1) as fractions ---")
for n in range(2, 12):
    # G(n)/G(n-1) = [n^(n+1)/(n+1)^n] / [(n-1)^n/n^(n-1)]
    # = n^(n+1) * n^(n-1) / [(n+1)^n * (n-1)^n]
    # = n^(2n) / [(n+1)^n * (n-1)^n]
    # = n^(2n) / [(n^2-1)^n]
    # = [n^2/(n^2-1)]^n
    ratio = G(n)/G(n-1)
    predicted = (n**2 / (n**2 - 1))**n
    print(f"  G({n:>2})/G({n-1:>2}) = {ratio:.15f} = (n²/(n²-1))^n = ({n}²/{n**2-1})^{n} = {predicted:.15f} match={abs(ratio-predicted)<1e-10}")

# ═══════════════════════════════════════════════════════════
# 3. TELESCOPING PRODUCT deeper — pure factorial identity
# ═══════════════════════════════════════════════════════════
print("\n--- Telescoping product Π G(k) = (n!)²/(n+1)^n ---")
print("  This is PURE — no e, no transcendentals")
for n in range(1, 10):
    prod = 1.0
    for k in range(1, n+1):
        prod *= G(k)
    rhs = math.factorial(n)**2 / (n+1)**n
    print(f"  Π G(k) k=1..{n} = {prod:.10f} = ({n}!)²/{n+1}^{n} = {rhs:.10f}")

# ═══════════════════════════════════════════════════════════
# 4. G(n) and factorials — no e
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) * n! / n^(n+1) = pure sequence ---")
for n in range(1, 15):
    val = G(n) * math.factorial(n) / n**(n+1)
    # This should be (n!)/(n+1)^n * n!/n^n ... simplify
    # G(n)*n!/n^(n+1) = n^(n+1)/(n+1)^n * n!/n^(n+1) = n!/(n+1)^n
    expected = math.factorial(n) / (n+1)**n
    print(f"  n={n:>2}: G({n})*{n}!/{n}^{n+1} = {val:.15f} = {n}!/(n+1)^n = {expected:.15f}")

# ═══════════════════════════════════════════════════════════
# 5. G(n)^2 / n — searching for pattern
# ═══════════════════════════════════════════════════════════
print("\n--- G(n)^2 / n ---")
for n in range(1, 12):
    val = G(n)**2 / n
    print(f"  G({n:>2})²/{n:>2} = {val:.15f}")

# ═══════════════════════════════════════════════════════════
# 6. G(n) + G(n+1) vs something
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) + G(n+1) ---")
for n in range(1, 12):
    s = G(n) + G(n+1)
    # Is this related to (2n+1)/(something)?
    ratio_to_n = s / n
    print(f"  G({n})+G({n+1}) = {s:.12f}, /n = {ratio_to_n:.12f}, /(2n+1) = {s/(2*n+1):.12f}")

# ═══════════════════════════════════════════════════════════
# 7. G(n) * (n+1) / n^2 — simplification
# ═══════════════════════════════════════════════════════════
print("\n--- G(n)*(n+1)/n² = (n/(n+1))^(n-1) ---")
for n in range(1, 12):
    lhs = G(n) * (n+1) / n**2
    # G(n)*(n+1)/n² = n^(n+1)/(n+1)^n * (n+1)/n² = n^(n-1)/(n+1)^(n-1) = (n/(n+1))^(n-1)
    rhs = (n/(n+1))**(n-1) if n > 1 else 1.0
    print(f"  n={n:>2}: {lhs:.15f} = (n/(n+1))^(n-1) = {rhs:.15f} match={abs(lhs-rhs)<1e-12}")

# ═══════════════════════════════════════════════════════════
# 8. SUMS — Σ G(k) vs factorial expressions
# ═══════════════════════════════════════════════════════════
print("\n--- Σ G(k) partial sums ---")
partial = 0.0
for n in range(1, 20):
    partial += G(n)
    # Compare to n²/something
    if n >= 2:
        ratio = partial / (n**2)
        print(f"  Σ G(k) k=1..{n:>2} = {partial:.10f}, /n² = {ratio:.10f}")

# ═══════════════════════════════════════════════════════════
# 9. G(n) and BINOMIALS — pure combinatorics
# ═══════════════════════════════════════════════════════════
print("\n--- Σ G(k)/k! * x^k at integer x values ---")
for x in [1, 2, 3, 4, 5]:
    s = sum(G(k) * x**k / math.factorial(k) for k in range(1, 25))
    print(f"  x={x}: Σ G(k)*{x}^k/k! = {s:.15f}")

print(f"\n  A_G = Σ G(k)/k! = {float(A_G_d):.15f}")
print(f"  A_G at x=2 / A_G at x=1 = {sum(G(k)*2**k/math.factorial(k) for k in range(1,25)) / float(A_G_d):.15f}")

# ═══════════════════════════════════════════════════════════
# 10. RECIPROCAL IDENTITIES
# ═══════════════════════════════════════════════════════════
print("\n--- 1/G(n) = (1+1/n)^n / n = (n+1)^n / n^(n+1) ---")
for n in range(1, 10):
    val = 1/G(n)
    expected = (n+1)**n / n**(n+1)
    print(f"  1/G({n}) = {val:.15f} = ({n+1})^{n}/{n}^{n+1} = {expected:.15f}")

# ═══════════════════════════════════════════════════════════
# 11. G(n) and POWERS OF 2
# ═══════════════════════════════════════════════════════════
print("\n--- G(2^k) ---")
for k in range(0, 8):
    n = 2**k
    print(f"  G(2^{k}) = G({n:>3}) = {G(n):.15f}")

# ═══════════════════════════════════════════════════════════
# 12. G(p) for PRIMES
# ═══════════════════════════════════════════════════════════
primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
print("\n--- G(p) for primes ---")
for p in primes:
    print(f"  G({p:>2}) = {G(p):.15f}, G(p)/p = {G(p)/p:.15f}")

# ═══════════════════════════════════════════════════════════
# 13. THE BIG ONE: G(n)/G(n-1) = (n²/(n²-1))^n
# ═══════════════════════════════════════════════════════════
print("\n--- VERIFIED: G(n)/G(n-1) = (n²/(n²-1))^n ---")
print("  This is PURE RATIONAL — no transcendentals")
print("  Rewrite: G(n)/G(n-1) = (1 + 1/(n²-1))^n")
for n in range(2, 20):
    actual = G(n)/G(n-1)
    formula = (n**2 / (n**2 - 1))**n
    err = abs(actual - formula)
    print(f"  n={n:>2}: (n²/(n²-1))^n = {formula:.15f}, err = {err:.2e}")

# ═══════════════════════════════════════════════════════════
# 14. PRODUCT IDENTITIES
# ═══════════════════════════════════════════════════════════
print("\n--- Π (k²/(k²-1))^k for k=2..n = G(n)/G(1) ---")
for n in range(2, 10):
    prod = 1.0
    for k in range(2, n+1):
        prod *= (k**2 / (k**2 - 1))**k
    ratio = G(n)/G(1)
    print(f"  n={n}: product = {prod:.12f}, G({n})/G(1) = {ratio:.12f}, match = {abs(prod-ratio)<1e-9}")

# ═══════════════════════════════════════════════════════════
# 15. A_G WITHOUT e — pure G construction
# ═══════════════════════════════════════════════════════════
print("\n--- A_G from pure G ratios ---")
# A_G = Σ G(n)/n! = Σ n^(n+1) / ((n+1)^n * n!)
# Can we express n! via the telescoping product?
# Π G(k) = (n!)² / (n+1)^n → n! = sqrt(Π G(k) * (n+1)^n)
for n in range(2, 10):
    prod = 1.0
    for k in range(1, n+1):
        prod *= G(k)
    nfact_from_G = math.sqrt(prod * (n+1)**n)
    print(f"  {n}! from G: sqrt(Π G(k) * {n+1}^{n}) = {nfact_from_G:.10f}, actual {n}! = {math.factorial(n)}")

# ═══════════════════════════════════════════════════════════
# 16. G(n) and HARMONIC NUMBERS
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) * H(n) where H(n) = Σ 1/k ---")
for n in range(1, 12):
    H = sum(1/k for k in range(1, n+1))
    val = G(n) * H
    print(f"  G({n:>2}) * H({n:>2}) = {val:.12f}")

# ═══════════════════════════════════════════════════════════
# 17. DIFFERENCE TABLE of G
# ═══════════════════════════════════════════════════════════
print("\n--- Difference table: Δ^k G at n=1 ---")
vals = [G(n) for n in range(1, 15)]
diffs = [vals[:]]
for _ in range(6):
    new = [diffs[-1][i+1] - diffs[-1][i] for i in range(len(diffs[-1])-1)]
    diffs.append(new)
for k, d in enumerate(diffs[:7]):
    print(f"  Δ^{k} G(1) = {d[0]:.15f}")

# ═══════════════════════════════════════════════════════════
# 18. G(n) and BERNOULLI-LIKE
# ═══════════════════════════════════════════════════════════
print("\n--- Σ (-1)^k G(k)/k! (alternating) ---")
alt_sum = sum((-1)**k * G(k) / math.factorial(k) for k in range(1, 25))
print(f"  Σ (-1)^k G(k)/k! = {alt_sum:.15f}")
print(f"  1/A_G = {1/A_G:.15f}")
print(f"  ratio = {alt_sum * A_G:.15f}")

# ═══════════════════════════════════════════════════════════
# 19. G(n) GENERATING FUNCTION at specific points
# ═══════════════════════════════════════════════════════════
print("\n--- f(x) = Σ G(n) x^n / n! evaluated at rational x ---")
for num, den in [(1,2), (1,3), (1,4), (2,3), (3,4), (1,1), (3,2), (2,1)]:
    x = num/den
    val = sum(G(n) * x**n / math.factorial(n) for n in range(1, 30))
    print(f"  f({num}/{den}) = {val:.15f}")

# ═══════════════════════════════════════════════════════════
# 20. THE GOLDEN RATIO?
# ═══════════════════════════════════════════════════════════
phi = (1 + math.sqrt(5))/2
print(f"\n--- A_G and φ = {phi:.15f} ---")
print(f"  A_G = {A_G:.15f}")
print(f"  A_G / φ = {A_G/phi:.15f}")
print(f"  A_G * φ = {A_G*phi:.15f}")
print(f"  A_G² = {A_G**2:.15f}")
print(f"  π/A_G = {math.pi/A_G:.15f}")
print(f"  A_G/π = {A_G/math.pi:.15f}")
print(f"  A_G * π = {A_G*math.pi:.15f}")
print(f"  √(A_G) = {math.sqrt(A_G):.15f}")
print(f"  A_G^A_G = {A_G**A_G:.15f}")
print(f"  ln(A_G) = {math.log(A_G):.15f}")
print(f"  A_G - 1 = {A_G - 1:.15f}")
print(f"  1/(A_G-1) = {1/(A_G-1):.15f}")
print(f"  (A_G-1)^2 = {(A_G-1)**2:.15f}")

# Continued fraction of A_G
print(f"\n--- Continued fraction of A_G ---")
x = A_G
cf = []
for _ in range(15):
    cf.append(int(x))
    x = x - int(x)
    if x < 1e-14: break
    x = 1/x
print(f"  A_G = [{', '.join(str(c) for c in cf)}]")

print("\n" + "=" * 70)
print("KEY NEW IDENTITIES (NO e)")
print("=" * 70)
print("""
① G(n)/G(n-1) = (n²/(n²-1))^n          — PURE RATIONAL recurrence
② G(n)*(n+1)/n² = (n/(n+1))^(n-1)       — algebraic simplification  
③ Π G(k) k=1..n = (n!)²/(n+1)^n         — factorial product (CONFIRMED)
④ n! = √(Π G(k) · (n+1)^n)              — factorial FROM G values
⑤ Π (k²/(k²-1))^k k=2..n = G(n)/G(1)   — product of rationals = G ratio
⑥ 1/G(n) = (n+1)^n / n^(n+1)            — reciprocal is pure integer ratio
⑦ G(n)*n!/n^(n+1) = n!/(n+1)^n          — factorial normalization
""")
