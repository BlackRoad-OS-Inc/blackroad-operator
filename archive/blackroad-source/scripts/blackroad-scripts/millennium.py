"""
Millennium Prize Problems Burn Formula for RoadChain
=====================================================
Every ROAD burned carries unsolved-math DNA from all 7 Millennium Prize Problems.
Each problem contributes a multiplier in [1.000, ~1.010]. Combined: ~1.000 to ~1.035.
Pure Python — only math + hashlib + cmath required.
"""
import math
import cmath
import hashlib


# ── 1. P vs NP — Subset Sum Solution Density ──────────────────────────
def p_vs_np(tokens: int) -> float:
    digits = [int(c) for c in str(max(abs(tokens), 1)) if c.isdigit()]
    if not digits:
        return 1.0
    target = sum(digits) // 2
    if target == 0:
        return 1.0
    # DP subset sum: which sums in [0..target] are reachable?
    reachable = {0}
    for d in digits:
        reachable = reachable | {s + d for s in reachable if s + d <= target}
    fraction = len(reachable) / (target + 1)
    return 1.0 + 0.010 * fraction


# ── 2. Riemann Hypothesis — Zeta on the Critical Line ─────────────────
def riemann(tokens: int) -> float:
    t = 14.134725 + (tokens % 10000) * 0.01
    s = complex(0.5, t)
    # Partial sum of zeta(s) = sum_{n=1}^{50} 1/n^s
    zeta_val = sum(1.0 / (n ** s) for n in range(1, 51))
    mag = abs(zeta_val)
    sigmoid = 1.0 / (1.0 + math.exp(-(mag - 1.0)))
    return 1.0 + 0.005 * sigmoid


# ── 3. Yang-Mills — Mass Gap & Confinement (SU(3), N_f=3) ─────────────
def yang_mills(tokens: int, cost: float) -> float:
    # The Yang-Mills Millennium Problem asks: prove SU(3) has a mass gap > 0.
    # We compute TWO quantities from real QCD:
    #   1. Running coupling alpha_s(Q) via one-loop RG evolution
    #   2. Confinement ratio: alpha_s(Q_low) / alpha_s(Q_high)
    # The ratio measures how much the coupling GROWS toward IR — the
    # signature of confinement and the mass gap.
    alpha_mz = 0.118
    N_c = 3  # SU(3) colors
    N_f = 3  # light flavors
    beta_0 = (11 * N_c - 2 * N_f) / (12 * math.pi)  # = 27/(12*pi)
    M_Z = 91.1876  # GeV
    # Two energy scales from the inputs
    Q_high = max(2.0, math.sqrt(abs(tokens) * max(cost, 0.001)))
    Q_low = max(1.0, Q_high / max(1.0 + (tokens % 100), 2.0))
    # Running coupling at both scales
    def alpha_s(Q):
        if Q <= 0:
            return alpha_mz
        lr = math.log(max(Q * Q / (M_Z * M_Z), 1e-30))
        d = 1.0 + beta_0 * alpha_mz * lr
        return alpha_mz / max(d, 0.01)
    a_high = alpha_s(Q_high)
    a_low = alpha_s(Q_low)
    # Confinement ratio: how much stronger is the force at low energy?
    # In real QCD this diverges (confinement). Our one-loop approx stays finite.
    ratio = a_low / max(a_high, 0.001)
    # Map ratio through sigmoid: ratio=1 (no running) → 0, ratio>2 (strong running) → ~1
    confinement = 1.0 / (1.0 + math.exp(-(ratio - 1.5) * 3.0))
    return 1.0 + 0.005 * confinement


# ── 4. Navier-Stokes — Reynolds Number Turbulence ─────────────────────
def navier_stokes(tokens: int, ctx_pct: int, delta: float) -> float:
    velocity = tokens / 100000.0
    length_scale = (ctx_pct + 1) / 10.0
    viscosity = max(delta, 1e-8)
    Re = velocity * length_scale / viscosity
    return 1.0 + 0.005 * min(math.log1p(abs(Re)) / 20.0, 1.0)


# ── 5. Hodge Conjecture — Calabi-Yau Hodge Numbers ────────────────────
def hodge(session_id: str) -> float:
    h = hashlib.sha256(session_id.encode()).digest()
    # Extract h^{1,1} and h^{2,1} from hash bytes (1..100 range for CY3)
    h11 = (h[0] | (h[1] << 8)) % 100 + 1
    h21 = (h[2] | (h[3] << 8)) % 100 + 1
    # Euler characteristic of Calabi-Yau threefold: chi = 2*(h11 - h21)
    chi = 2 * (h11 - h21)
    hodge_ratio = abs(chi) / (h11 + h21)
    return 1.0 + 0.003 * min(hodge_ratio, 1.0)


# ── 6. Birch & Swinnerton-Dyer — Elliptic Curve L-function ────────────
def bsd(tokens: int, session_id: str) -> float:
    h = hashlib.sha256(f"BSD:{session_id}:{tokens}".encode()).digest()
    a = (h[0] % 20) - 10  # curve param a in [-10, 9]
    b = (h[1] % 20) - 10  # curve param b in [-10, 9]
    # Ensure non-singular: 4a^3 + 27b^2 != 0
    if 4 * a * a * a + 27 * b * b == 0:
        b += 1
    # Euler product over 8 small primes
    primes = [2, 3, 5, 7, 11, 13, 17, 19]
    L_prod = 1.0
    for p in primes:
        # Count points on E mod p: #{(x,y) : y^2 = x^3 + ax + b mod p}
        count = 0
        for x in range(p):
            rhs = (x * x * x + a * x + b) % p
            for y in range(p):
                if (y * y) % p == rhs:
                    count += 1
        # Trace of Frobenius: a_p = p + 1 - #E(F_p)
        n_points = count + 1  # +1 for point at infinity
        a_p = p + 1 - n_points
        # Euler factor: (1 - a_p/p + 1/p)^{-1} at s=1
        euler_factor = 1.0 - a_p / p + 1.0 / p
        if abs(euler_factor) > 1e-10:
            L_prod *= 1.0 / euler_factor
        else:
            L_prod *= 5.0  # cap
    return 1.0 + 0.004 * min(abs(L_prod), 5.0) / 5.0


# ── 7. Poincare Conjecture (solved) — Perelman's W-Entropy ────────────
def poincare(cost: float, delta: float, timestamp: float) -> float:
    # tau from fractional part of timestamp (Ricci flow parameter)
    tau = max((timestamp % 1000) / 1000.0, 0.001)
    # Scalar curvature proxy: cost/delta ratio
    R_scalar = cost / max(delta, 1e-8)
    # f = log(1 + R) (the minimizer function)
    f = math.log1p(abs(R_scalar))
    # Perelman W-entropy: W(g, f, tau) = tau*(R + |grad f|^2) + f - n
    # Simplified: W = tau*(f + 1) + f - 3  (n=3 dimensions)
    W = tau * (f + 1.0) + f - 3.0
    # Normalize and sigmoid
    normalizer = 0.1
    sigmoid = 1.0 / (1.0 + math.exp(-W * normalizer))
    return 1.0 + 0.003 * sigmoid


# ── Combined Multiplier ───────────────────────────────────────────────
def compute(delta: float, cost: float, tokens: int, ctx_pct: int,
            model: str, session_id: str, timestamp: float) -> tuple:
    """
    Compute the combined Millennium Prize multiplier.
    Returns (combined_multiplier, breakdown_dict).
    """
    m1 = p_vs_np(tokens)
    m2 = riemann(tokens)
    m3 = yang_mills(tokens, cost)
    m4 = navier_stokes(tokens, ctx_pct, delta)
    m5 = hodge(session_id)
    m6 = bsd(tokens, session_id)
    m7 = poincare(cost, delta, timestamp)

    combined = m1 * m2 * m3 * m4 * m5 * m6 * m7

    breakdown = {
        "p_vs_np": round(m1, 5),
        "riemann": round(m2, 5),
        "yang_mills": round(m3, 5),
        "navier_stokes": round(m4, 5),
        "hodge": round(m5, 5),
        "bsd": round(m6, 5),
        "poincare": round(m7, 5),
    }

    return round(combined, 5), breakdown


if __name__ == "__main__":
    import sys
    # Quick test: python3 millennium.py <delta> <cost> <tokens> <ctx_pct> <model> <session_id> <timestamp>
    if len(sys.argv) >= 8:
        d, c, t, p, m, s, ts = (
            float(sys.argv[1]), float(sys.argv[2]), int(float(sys.argv[3])),
            int(sys.argv[4]), sys.argv[5], sys.argv[6], float(sys.argv[7])
        )
        mult, breakdown = compute(d, c, t, p, m, s, ts)
        print(f"Combined multiplier: {mult}")
        for k, v in breakdown.items():
            print(f"  {k}: {v}")
    else:
        mult, breakdown = compute(0.05, 1.23, 350000, 45, "Opus 4.6", "test-session", 1771651078)
        print(f"Combined multiplier: {mult}")
        for k, v in breakdown.items():
            print(f"  {k}: {v}")
