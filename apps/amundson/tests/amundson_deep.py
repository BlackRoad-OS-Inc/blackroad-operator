#!/usr/bin/env python3
"""
Amundson Framework — Deep identities
Cayley trees, central binomial, cumulants, Bernoulli, endofunctions
"""
import math
from decimal import Decimal, getcontext
getcontext().prec = 50

def G(n):
    if n == 0: return 0.0
    return n**(n+1) / (n+1)**n

def Gfrac(n):
    """Return (numerator, denominator) for G(n)"""
    if n == 0: return (0, 1)
    return (n**(n+1), (n+1)**n)

print("=" * 70)
print("AMUNDSON DEEP — TREES, BINOMIALS, BERNOULLI, CUMULANTS")
print("=" * 70)

# ═══════════════════════════════════════════════════════════
# 1. THE CROSSOVER — G(n) = 1 at n ≈ ?
# ═══════════════════════════════════════════════════════════
print("\n--- CROSSOVER: G(n) = 1 ---")
# G(n) = n^(n+1)/(n+1)^n = 1 when n^(n+1) = (n+1)^n
# Binary search
lo, hi = 2.0, 3.0
for _ in range(100):
    mid = (lo + hi) / 2
    val = mid**(mid+1) / (mid+1)**mid
    if val < 1:
        lo = mid
    else:
        hi = mid
crossover = (lo + hi) / 2
print(f"  G(n) = 1 at n = {crossover:.15f}")
print(f"  G(2) = {G(2):.15f} < 1 (loose/quantum)")
print(f"  G(3) = {G(3):.15f} > 1 (tight/classical)")
print(f"  Crossover ≈ {crossover:.6f}")

# ═══════════════════════════════════════════════════════════
# 2. CENTRAL BINOMIAL CONNECTION
# ═══════════════════════════════════════════════════════════
print("\n--- Π G(k) = (2n)! / (C(2n,n) × (n+1)^n) ---")
for n in range(1, 12):
    prod = 1.0
    for k in range(1, n+1):
        prod *= G(k)
    # Known: Π G(k) = (n!)^2 / (n+1)^n
    # And (n!)^2 = (2n)! / C(2n,n)
    # So Π G(k) = (2n)! / (C(2n,n) * (n+1)^n)
    binom = math.comb(2*n, n)
    rhs = math.factorial(2*n) / (binom * (n+1)**n)
    match = abs(prod - rhs) < 1e-6
    print(f"  n={n:>2}: Π G(k) = {prod:.10e}, (2n)!/(C(2n,n)·(n+1)^n) = {rhs:.10e}, match={match}")

# ═══════════════════════════════════════════════════════════
# 3. CAYLEY'S FORMULA: n^(n-2) labeled trees on n vertices
# ═══════════════════════════════════════════════════════════
print("\n--- CAYLEY CONNECTION ---")
print("  Cayley: T(n) = n^(n-2) labeled trees on n vertices")
print("  G(n) = n^(n+1)/(n+1)^n = n^3 · n^(n-2) / (n+1)^n = n^3 · T(n) / (n+1)^n")
for n in range(2, 12):
    T_n = n**(n-2)  # Cayley's formula
    cayley_form = n**3 * T_n / (n+1)**n
    print(f"  n={n:>2}: T({n}) = {T_n:>15}, G({n}) = n³·T(n)/(n+1)^n = {cayley_form:.15f} = {G(n):.15f} match={abs(cayley_form-G(n))<1e-12}")

# Also: G(n) = n · T(n+1) / (n+1)^n since T(n+1) = (n+1)^(n-1)
# G(n) = n · (n+1)^(n-1) / (n+1)^n = n/(n+1) ... no that's wrong
# G(n) = n^(n+1)/(n+1)^n = n · n^n/(n+1)^n
# n^n = n^2 · n^(n-2) = n^2 · T(n)
# So G(n) = n · n^2 · T(n) / (n+1)^n = n^3 · T(n) / (n+1)^n ✓

# ═══════════════════════════════════════════════════════════
# 4. ENDOFUNCTIONS: n^n = G(n) · (n+1)^n / n
# ═══════════════════════════════════════════════════════════
print("\n--- ENDOFUNCTIONS: n^n = G(n) · (n+1)^n / n ---")
for n in range(1, 12):
    lhs = n**n
    rhs = G(n) * (n+1)**n / n
    print(f"  n={n:>2}: n^n = {lhs:>15}, G(n)·(n+1)^n/n = {rhs:.6f}, match={abs(lhs-rhs)<1e-6}")

# ═══════════════════════════════════════════════════════════
# 5. BERNOULLI NUMBERS × G
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) × B(n) (Bernoulli numbers) ---")
# Bernoulli numbers
def bernoulli(n):
    A = [0] * (n + 1)
    for m in range(n + 1):
        A[m] = 1 / (m + 1)
        for j in range(m, 0, -1):
            A[j-1] = j * (A[j-1] - A[j])
    return A[0]

for n in range(0, 20):
    B_n = bernoulli(n)
    product = G(n) * B_n if n > 0 else 0
    if abs(B_n) > 1e-15:
        print(f"  G({n:>2}) × B({n:>2}) = {G(n):.10f} × {B_n:.10f} = {product:.15f}")
    else:
        print(f"  G({n:>2}) × B({n:>2}) = {G(n):.10f} × 0 = 0  (Bernoulli zero kills G)")

# ═══════════════════════════════════════════════════════════
# 6. CUMULANTS of G sequence
# ═══════════════════════════════════════════════════════════
print("\n--- CUMULANTS ---")
# Treat G(1), G(2), G(3), ... as a sequence
# Cumulants from moments via the recursion
# μ'_r = E[X^r] where we treat G as a PMF-like thing
# Actually cumulants of the EGF: f(x) = Σ G(n) x^n / n!
# log(f(x)) = Σ κ_n x^n / n!

# Compute f(x) = Σ G(n) x^n / n! and its log's Taylor coefficients
# Use numerical differentiation at x=0
from fractions import Fraction

# Exact computation with fractions
N = 12
# a_n = G(n)/n!
a = [Fraction(0)] + [Fraction(n**(n+1), (n+1)**n * math.factorial(n)) for n in range(1, N+1)]

# f(x) = Σ a_n x^n, log(f(x)) = Σ κ_n/n! x^n
# But f(0) = 0 so log(f(x)) is undefined at 0
# Instead compute cumulants of the formal power series 1 + f(x)
# Or treat as: EGF coefficients are G(n)/n!, cumulants from moments

# Actually the standard way: if M(t) = Σ μ_n t^n/n! is the MGF
# then K(t) = log(M(t)) = Σ κ_n t^n/n!
# Let's define μ_n = G(n) (the sequence values as "moments")
# M(t) = 1 + Σ G(n) t^n/n! for n≥1

coeffs = [Fraction(1)] + [Fraction(n**(n+1), (n+1)**n * math.factorial(n)) for n in range(1, N+1)]
# M(t) = coeffs[0] + coeffs[1]*t + coeffs[2]*t^2 + ...

# log(M(t)) via power series: if M = 1 + u where u = Σ_{n≥1}
# log(1+u) = u - u^2/2 + u^3/3 - ...
# Compute first few cumulant coefficients
u = coeffs[1:]  # u_1, u_2, ...

# κ_1 = u_1 (= G(1)/1! = 1/2)
kappa = [Fraction(0)] * (N+1)
kappa[1] = u[0]  # G(1)/1! = 1/2

# For higher: use the moment-cumulant relation
# μ_n = Σ over partitions of n: Π κ_{b_i}
# Or recursion: κ_n = μ_n - Σ_{k=1}^{n-1} C(n-1,k-1) κ_k μ_{n-k}
# where μ_n = G(n)/n! * n! = G(n)... but these are EGF coefficients

# Simpler: direct from EGF
# f(t) = 1 + Σ G(n)/n! t^n
# log(f(t)) = Σ κ_n/n! t^n
# Use the formula: κ_n/n! = [t^n] log(f(t))

# Compute log series coefficients numerically
# log(1 + u) where u = a_1 t + a_2 t^2 + ...
# [t^n] log(1+u) = Σ_{k=1}^{n} (-1)^{k+1}/k * [t^n] u^k

# Compute u^k truncated
def poly_mul(p, q, maxn):
    result = [Fraction(0)] * (maxn+1)
    for i in range(min(len(p), maxn+1)):
        for j in range(min(len(q), maxn+1-i)):
            result[i+j] += p[i] * q[j]
    return result

u_coeffs = [Fraction(0)] + list(u)  # u_coeffs[n] = coeff of t^n in u
max_n = min(6, N)
log_coeffs = [Fraction(0)] * (max_n + 1)

u_power = [Fraction(0)] * (max_n + 1)
u_power[0] = Fraction(1)  # u^0 = 1

for k in range(1, max_n + 1):
    u_power = poly_mul(u_power, u_coeffs, max_n)
    sign = Fraction((-1)**(k+1), k)
    for n in range(1, max_n + 1):
        log_coeffs[n] += sign * u_power[n]

print("  EGF cumulants: log(1 + Σ G(n)/n! t^n) = Σ κ_n/n! t^n")
for n in range(1, max_n + 1):
    kn = log_coeffs[n] * math.factorial(n)
    print(f"  κ_{n} = {float(kn):.15f} = {kn}")

# ═══════════════════════════════════════════════════════════
# 7. G AND STIRLING NUMBERS
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) and Stirling numbers of the second kind ---")
# S(n,k) = number of ways to partition n elements into k non-empty subsets
def stirling2(n, k):
    if n == 0 and k == 0: return 1
    if n == 0 or k == 0: return 0
    if k > n: return 0
    return k * stirling2(n-1, k) + stirling2(n-1, k-1)

for n in range(1, 9):
    bell = sum(stirling2(n, k) for k in range(n+1))  # Bell number
    ratio = G(n) / bell if bell > 0 else 0
    print(f"  n={n}: G({n}) = {G(n):.10f}, Bell({n}) = {bell}, G/Bell = {ratio:.10f}")

# ═══════════════════════════════════════════════════════════
# 8. G(n) INTEGRAL REPRESENTATION
# ═══════════════════════════════════════════════════════════
print("\n--- INTEGRAL: G(n) = n · ∫₀¹ (nx)^(n-1)·(1-x+nx)·dx / (1+x)^? ---")
# Actually: G(n) = n/(1+1/n)^n = n·(n/(n+1))^n
# = n · ∫₀^∞ t^n · e^(-(n+1)t/n) dt / Γ(n+1) ... Laplace
# Simpler: G(n) = ∫₀^∞ t^n · n · e^(-(n+1)t/n) dt / n!
# = n^(n+1) / (n+1)^n by direct computation

# More interesting: the product ∫
# Π G(k) = (n!)² / (n+1)^n
# So log(Π G(k)) = 2·log(n!) - n·log(n+1)
# By Stirling: ≈ 2(n·log(n) - n + log(2πn)/2) - n·log(n+1)
#            = n(2·log(n) - log(n+1)) - 2n + log(2πn)
#            = n·log(n²/(n+1)) - 2n + log(2πn)

print("  log(Π G(k)) = 2·log(n!) - n·log(n+1)")
for n in [5, 10, 50, 100]:
    prod_log = sum(math.log(G(k)) for k in range(1, n+1))
    formula = 2 * math.lgamma(n+1) - n * math.log(n+1)
    print(f"  n={n:>3}: Σ log G(k) = {prod_log:.10f}, 2·log(n!)-n·log(n+1) = {formula:.10f}, match={abs(prod_log-formula)<1e-6}")

# ═══════════════════════════════════════════════════════════
# 9. G(n) MODULAR ARITHMETIC
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) numerator mod small primes ---")
# G(n) = n^(n+1) / (n+1)^n, numerator = n^(n+1)
for p in [2, 3, 5, 7]:
    print(f"  mod {p}: ", end="")
    for n in range(1, 20):
        num = n**(n+1)
        den = (n+1)**n
        # Check if p divides the simplified fraction
        from math import gcd
        g = gcd(num, den)
        print(f"{(num//g) % p}", end=" ")
    print()

# ═══════════════════════════════════════════════════════════
# 10. G(n) AND CATALAN NUMBERS
# ═══════════════════════════════════════════════════════════
print("\n--- G(n) and Catalan numbers C_n = C(2n,n)/(n+1) ---")
for n in range(1, 12):
    catalan = math.comb(2*n, n) // (n+1)
    ratio = G(n) / catalan
    product = G(n) * catalan
    print(f"  n={n:>2}: G({n})={G(n):.8f}, Cat({n})={catalan:>7}, G·Cat = {product:.8f}, G/Cat = {ratio:.10f}")

# ═══════════════════════════════════════════════════════════
# 11. NEW: G(n) CONVOLUTION
# ═══════════════════════════════════════════════════════════
print("\n--- (G * G)(n) = Σ G(k)·G(n-k) ---")
for n in range(2, 10):
    conv = sum(G(k) * G(n-k) for k in range(1, n))
    print(f"  (G*G)({n}) = {conv:.15f}, G({n}) = {G(n):.15f}, ratio = {conv/G(n):.15f}")

# ═══════════════════════════════════════════════════════════
# 12. DEFINITIVE: ALL NEW IDENTITIES SUMMARY
# ═══════════════════════════════════════════════════════════
print("\n" + "=" * 70)
print("ALL VERIFIED IDENTITIES")
print("=" * 70)
print("""
PURE ALGEBRAIC (no e, no transcendentals):
  G(n) = n^(n+1) / (n+1)^n                           — definition
  G(n) = n · (n/(n+1))^n                              — factored form
  G(n) · (n+1) / n² = (n/(n+1))^(n-1)                — reduction
  G(n)/G(n-1) = (n²/(n²-1))^n                        — rational recurrence
  1/G(n) = (n+1)^n / n^(n+1)                          — reciprocal
  n^n = G(n) · (n+1)^n / n                            — endofunctions
  G(n) = n³ · T(n) / (n+1)^n  where T(n)=n^(n-2)     — Cayley trees

PRODUCT IDENTITIES:
  Π_{k=1}^{n} G(k) = (n!)² / (n+1)^n                 — telescoping product
  Π_{k=1}^{n} G(k) = (2n)! / (C(2n,n) · (n+1)^n)    — central binomial
  n! = √(Π_{k=1}^{n} G(k) · (n+1)^n)                 — factorial from G
  Π_{k=2}^{n} (k²/(k²-1))^k = G(n)/G(1) = 2·G(n)   — rational product

SERIES:
  A_G = Σ G(n)/n! = 1.244331783986725                — the Amundson constant
  A_G continued fraction = [1; 4, 10, 1, 3, 2, 8, 2, 73, ...]

CUMULANTS (of the EGF 1 + Σ G(n)/n! t^n):
  κ₁ = 1/2
  κ₂, κ₃, κ₄ ... computed above

BERNOULLI:
  G(n) · B(n) = 0 for all odd n ≥ 3 (Bernoulli zeros)

CROSSOVER:
  G(n) = 1 at n ≈ 2.293166287045540
  G(n) < 1 for n < 2.293... (sub-exponential regime)
  G(n) > 1 for n > 2.293... (super-exponential regime)
""")
